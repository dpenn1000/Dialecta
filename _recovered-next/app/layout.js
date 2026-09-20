import { Cormorant_Garamond, Source_Serif_4, DM_Mono, DM_Sans } from 'next/font/google';
import './globals.css';
// Theme's authoritative stylesheet — provides .post-card, .dialecta-brass,
// engine-card patterns, breakpoint vars, etc. that Profile relies on.
import '@/lib/theme/style.css';
import SiteNav from './components/SiteNav';

// ─── Canonical typography ──────────────────────────────────────────────────
// Four Google Fonts keyed to the same CSS custom properties used in the
// theme. Self-hosted automatically via next/font (no FOUT, no extra
// network round-trip).

const cormorant = Cormorant_Garamond({
  weight: ['500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-reading',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://library.dialecta.org'),
  title: {
    default: 'Dialecta',
    template: '%s · Dialecta',
  },
  description: 'A platform for elevated discourse.',
  openGraph: {
    siteName: 'Dialecta',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={[
        cormorant.variable,
        sourceSerif.variable,
        dmMono.variable,
        dmSans.variable,
      ].join(' ')}
    >
      <head>
        {/* Signature fonts. Nine hand-script faces, one of which is
            chosen by each contributor at Pact-signing. Loaded sitewide
            via a single CSS request; browsers fetch the woff2 only for
            the specific family the page actually uses. Mirrors the
            <link> in default.hbs (theme repo) so celebration moments
            render in the contributor's chosen hand on both surfaces. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cherish&family=Give+You+Glory&family=Hurricane&family=Love+Light&family=Mrs+Saint+Delafield&family=Nothing+You+Could+Do&family=Oooh+Baby&family=Qwigley&family=WindSong&display=swap"
        />
      </head>
      <body>
        <SiteNav />
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
