'use client';

/**
 * The two-column site rail: the page in the left cell, the persistent
 * sidebar in the right, ported from the live shell's .site-rail
 * (_theme/assets/css/style.css:1751-1830, default.hbs:385-428; see
 * council/designer/research/2026-09-21-live-vs-localhost/REPORT.md finding
 * 2). Grid and sticky rules live in globals.css; this component only decides
 * whether the current route gets the sidebar column at all.
 *
 * Live made that decision in CSS, keyed on Ghost's page-write body class
 * (.page-write .site-rail, .page-write .site-sidebar). Nothing here plays
 * that role: layout.tsx has no access to the current path (no request is in
 * scope in a shared root layout), and the marker would have to live on
 * /write's own page, which this brief does not own. usePathname() is the
 * other option the brief names, and nav-client.tsx already sets the
 * precedent for the shell reading it in a small client island. Everything
 * heavier, the sidebar's own content and its one live query, stays server
 * rendered: `sidebar` arrives already rendered from layout.tsx and this
 * component only decides whether to mount it.
 *
 * sidebar is still evaluated server side on /write (RSC resolves the prop
 * before this boundary runs), so the Recently Published read still happens
 * there; it is cached (see site-sidebar-data.ts), so the cost is one shared
 * revalidate window, not a query in the /write byline. Marking /write's own
 * route as sidebar-free at the source would avoid even that, and is out of
 * this brief's file list.
 */
import { usePathname } from 'next/navigation';

/** Routes live never shows the rail on. Confirmed against _theme/assets/css/style.css: only .page-write opts out. */
const NO_RAIL_ROUTES = new Set<string>(['/write']);

export function RailShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const hideRail = NO_RAIL_ROUTES.has(pathname);

  return (
    <div className={hideRail ? 'site-rail site-rail-single' : 'site-rail'}>
      <div className="site-content">{children}</div>
      {hideRail ? null : <aside className="site-sidebar">{sidebar}</aside>}
    </div>
  );
}
