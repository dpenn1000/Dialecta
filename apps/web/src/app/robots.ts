import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * /api/ and /auth/callback are machine routes, not reading surfaces, so
 * they are the only paths withheld. Everything a person can read stays
 * crawlable, including /login: blocking it buys nothing a search engine
 * would otherwise misuse.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
