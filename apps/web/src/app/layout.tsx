import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/tokens.css';
import '@/styles/dialecta-surfaces.css';
import './globals.css';
import '@/components/shell/shell.css';
import '@/components/shell/site-sidebar.css';
import { RailShell } from '@/components/shell/rail-shell';
import { SiteFooter } from '@/components/shell/site-footer';
import { SiteHeader } from '@/components/shell/site-header';
import { SiteSidebar } from '@/components/shell/site-sidebar';
import { strings } from '@/strings';
import { SITE_URL } from '@/lib/site';
import { getPlausibleConfig } from '@/lib/analytics';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: strings.site.name,
  description: strings.site.tagline,
  openGraph: {
    siteName: strings.site.name,
    type: 'website',
  },
  // The site-wide default. See src/app/articles/[slug]/page.tsx for why
  // this is set explicitly rather than left for Next to infer.
  twitter: {
    card: 'summary',
  },
};

/**
 * The frame every page renders inside: the site shell's header, the page,
 * the footer (src/components/shell/). Ported from _theme/default.hbs, which is
 * the specification for the site as it looks today.
 *
 * Pages render their own <main>, so the page slot here is a plain div. A bare
 * <main> (no class) lands on the standard paper sheet; a <main> with any class
 * styles itself (globals.css). The header reads the session, so every route
 * renders per request.
 *
 * The page slot sits inside RailShell, default.hbs's other half: the
 * persistent right rail that used to live only in post.hbs, moved into the
 * shared shell on 2026-04-29 so it persists across every page
 * (_theme/assets/css/style.css:1773-1787). SiteSidebar is rendered here, on
 * the server, and handed down as a prop; RailShell's only job is deciding
 * whether the current route gets it (see its own comment for why that check
 * needs the one client boundary in this tree beyond nav-client.tsx).
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const plausible = getPlausibleConfig();

  return (
    <html lang="en">
      <head>
        {/*
          The four families tokens.css names (--font-display, --font-reading,
          --font-body, --font-mono) were declared but never loaded, so every
          page fell back to the generic serif and sans. Same families, weights
          and italics the live theme imports at the top of
          _theme/assets/css/style.css. A plain stylesheet link rather than
          next/font/google on purpose: next/font fetches at build time, and a
          build that fails offline is a worse trade than one request at runtime.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- loaded once in the root layout, which is what the rule asks for; it cannot see that from an App Router layout */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Source+Serif+4:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap"
        />
        {/*
          Playfair Display, italic only: the site rail's quote hero
          (components/shell/site-sidebar.css .rail-quote-text). Ported from
          default.hbs's own separate link for it, "its Q (and the way the
          italic strokes flow into one another) reads more elegantly at hero
          scale than Cormorant italic." Weights 400/500/600 only, matching
          live: 400 for the resting state, 500 the default, 600 reserved for
          hover/emphasis, none of which this port currently uses, so this
          stays ready rather than trimmed.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- see the note above the first font link */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500;1,600&display=swap"
        />
      </head>
      <body>
        <div className="site-frame">
          <a className="skip-link" href="#content">
            {strings.shell.skipToContent}
          </a>
          <SiteHeader />
          <div id="content" className="site-body" tabIndex={-1}>
            <RailShell sidebar={<SiteSidebar />}>{children}</RailShell>
          </div>
          <SiteFooter />
        </div>
        {plausible ? (
          <Script defer data-domain={plausible.domain} src={plausible.scriptSrc} strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  );
}
