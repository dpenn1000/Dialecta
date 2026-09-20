/**
 * robots.txt at /robots.txt (Next.js convention).
 *
 * Allows general crawling of the SEO surfaces, blocks API and any
 * debug routes, points crawlers at the sitemap. Hardcoded
 * SITE_BASE swaps to library.dialecta.org after Phase 6 DNS.
 */

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dialecta-next.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow: [
          '/api/',
          '/contributor/_probe',
          '/quote/_probe',
          '/article/_probe',
          '/comment/_probe',
        ],
      },
    ],
    sitemap: `${SITE_BASE}/sitemap.xml`,
  };
}
