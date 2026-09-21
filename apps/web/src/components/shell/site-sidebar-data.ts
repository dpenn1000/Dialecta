import 'server-only';

/**
 * The one live-data read the persistent rail makes: the three most recently
 * published articles for the Recently Published card
 * (council/designer/research/2026-09-21-live-vs-localhost/REPORT.md, finding
 * 2). Everything else the rail shows is static copy or a disclosed stub; see
 * strings.ts's shell.rail comment.
 *
 * A plain anon-key client, not the cookie-bound one in lib/supabase/server.ts.
 * That client calls cookies(), which opts the whole render into Next's
 * per-request dynamic path, and the rail sits in the root layout, so every
 * page on the site would inherit that and this query would run fresh on
 * every view. The data is public and identical for every viewer (published
 * articles, RLS-open per CLAUDE.md's "profiles, articles, axis_scores,
 * archetypes, feed_events, follows" list), so it does not need a session, and
 * unstable_cache below gives it a shared revalidate window instead of a
 * per-request round trip.
 *
 * Columns and the author join mirror src/lib/articles.ts's SUMMARY_COLUMNS
 * (read there, not imported: that file is another seat's, and importing its
 * cookie-bound query would pull the dynamic-render cost back in). The join
 * must stay on articles_author_profile_id_fkey; the other key resolves
 * through profiles.ghost_member_id, which is closed to anon and fails the
 * whole query for every signed-out reader.
 */
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export interface RecentArticle {
  id: string;
  slug: string;
  title: string;
  topic: string | null;
  publishedAt: string | null;
  authorName: string | null;
}

const COLUMNS = 'id, slug, title, topic, published_at, author:profiles!articles_author_profile_id_fkey(display_name)';

/** Ten minutes: fresh enough that a new article shows up the same morning, without a query on every page view. */
const REVALIDATE_SECONDS = 600;

type AuthorEmbed = { display_name: string } | { display_name: string }[] | null;

interface ArticleRow {
  id: unknown;
  slug: unknown;
  title: unknown;
  topic: unknown;
  published_at: unknown;
  author: AuthorEmbed;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function authorName(author: AuthorEmbed): string | null {
  const one = Array.isArray(author) ? (author[0] ?? null) : author;
  return one && typeof one.display_name === 'string' ? one.display_name : null;
}

function toRecentArticle(row: ArticleRow): RecentArticle | null {
  const id = str(row.id);
  const slug = str(row.slug);
  const title = str(row.title);
  if (!id || !slug || !title) return null;
  return {
    id,
    slug,
    title,
    topic: str(row.topic),
    publishedAt: str(row.published_at),
    authorName: authorName(row.author),
  };
}

const fetchRecentlyPublished = unstable_cache(
  async (limit: number): Promise<RecentArticle[]> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return [];

    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase
      .from('articles')
      .select(COLUMNS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('site-sidebar-data: recently published query failed:', error.message);
      return [];
    }
    return (data ?? [])
      .map((row) => toRecentArticle(row as unknown as ArticleRow))
      .filter((a): a is RecentArticle => a !== null);
  },
  ['site-sidebar-recently-published'],
  { revalidate: REVALIDATE_SECONDS, tags: ['recently-published'] },
);

export async function getRecentlyPublished(limit = 3): Promise<RecentArticle[]> {
  return fetchRecentlyPublished(limit);
}
