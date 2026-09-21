import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/tokens.css';
import '@/styles/dialecta-surfaces.css';
import './globals.css';
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
      </head>
      <body>
        {children}
        {plausible ? (
          <Script defer data-domain={plausible.domain} src={plausible.scriptSrc} strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  );
}
