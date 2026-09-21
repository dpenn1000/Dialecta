/**
 * The primary navigation: the live Ghost menu's seven destinations in its own
 * order, with the icon default.hbs's injection script matched to each.
 *
 * Server only in practice. It imports strings.ts, which is the size of every
 * label on the site, so the client drawer receives the finished list as a prop
 * instead of importing this module and shipping all of strings.ts to every page.
 *
 * Hrefs are this app's routes, not the Ghost apex's. Articles points at `/`,
 * which is the article list here (the live iconFor() already resolved the root
 * path to Articles). /stewards, /fingerprint and /about have no route in
 * apps/web yet; the links are the destination, and the routes arrive with the
 * pages.
 */
import { strings } from '@/strings';
import type { NavIconKey } from './icons';

export interface ShellNavItem {
  href: string;
  label: string;
  icon: NavIconKey;
}

export function navItems(): ShellNavItem[] {
  const nav = strings.shell.nav;
  return [
    { href: '/', label: nav.articles, icon: 'codex' },
    { href: '/community', label: nav.community, icon: 'triangle' },
    { href: '/stewards', label: nav.stewards, icon: 'compassstar' },
    { href: '/pact', label: nav.pact, icon: 'asterismseal' },
    { href: '/fingerprint', label: nav.fingerprint, icon: 'fingerprint' },
    { href: '/guidebook', label: nav.guidebook, icon: 'guidebook' },
    { href: '/about', label: nav.about, icon: 'italicI' },
  ];
}
