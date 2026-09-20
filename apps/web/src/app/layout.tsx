import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/tokens.css';
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
      <body>
        {children}
        {plausible ? (
          <Script defer data-domain={plausible.domain} src={plausible.scriptSrc} strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  );
}
