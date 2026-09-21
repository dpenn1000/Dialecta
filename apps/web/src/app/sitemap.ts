import type { MetadataRoute } from 'next';
import { getPublishedArticles, isSupabaseConfigured } from '@/lib/articles';
import { SITE_URL } from '@/lib/site';

// Never statically frozen at build time: a new article should reach the
// sitemap on its next crawl, not on the next deploy. Mirrors the front
// page's own `force-dynamic` for the same underlying Supabase read.
export const dynamic = 'force-dynamic';

/**
 * Static pages worth telling a crawler about. /login carries no content of
 * its own, so it is left out. /profile/[id] is left out too: this file
 * covers articles and the static pages, the same scope circulation's own
 * research note used, not a full contributor directory.
 */
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
  { url: `${SITE_URL}/community`, changeFrequency: 'daily', priority: 0.6 },
  { url: `${SITE_URL}/pact`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/guidebook`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/articles`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${SITE_URL}/stewards`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${SITE_URL}/fingerprint`, changeFrequency: 'monthly', priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSupabaseConfigured()) {
    return STATIC_PAGES;
  }

  try {
    const articles = await getPublishedArticles(1000);
    const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.published_at ?? undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...STATIC_PAGES, ...articleEntries];
  } catch {
    // A Supabase outage should not take the sitemap down with it. Crawlers
    // still get the static pages instead of a failed request.
    return STATIC_PAGES;
  }
}
