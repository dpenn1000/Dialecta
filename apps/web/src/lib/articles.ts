/**
 * Article reads. Articles are native rows in Supabase (ADR-001/003); there is
 * no Ghost in this app. Server-only: uses the cookie-aware server client.
 */
import { isTier, type Tier } from '@dialecta/core';
import { createClient } from '@/lib/supabase/server';

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  topic: string | null;
  published_at: string | null;
  author: { display_name: string } | null;
}

/**
 * The author fields the single-article page needs beyond the byline name:
 * the tier badges' emphasis aside, the author bio card
 * (components/author-bio) reads id (the profile link), avatar_url and bio.
 * A superset of ArticleSummary's author, for getPublishedArticle only; the
 * list read keeps the narrower embed, since a card in a list shows neither
 * a bio nor a full-size avatar.
 */
export interface ArticleAuthorDetail {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface Article extends Omit<ArticleSummary, 'author'> {
  body_html: string;
  declared_claims: unknown[];
  /**
   * The featured photo live renders above the title (designer's
   * live-vs-localhost audit, Regression 4). The five legacy articles point
   * at their copies in the article-media bucket, moved off Ghost on
   * 2026-09-21 (migrations 20260921150343 and 20260921150903). Null when an
   * article has none.
   */
  feature_image: string | null;
  /**
   * The article's own three-tier readout, live's #dialecta-tier-badge
   * (components/article-tier-badges): what the author declared at publish,
   * what the engine read, and the tier the article carries. All three are
   * nullable enum columns on articles, confirmed anon-readable
   * (has_column_privilege, Supabase project mguulnibvzusfvyuowwh,
   * 2026-09-21). A row that predates classification, or a value isTier()
   * rejects, comes through as null; the badge column for it just does not
   * render a chip.
   */
  declared_tier: Tier | null;
  ai_suggested_tier: Tier | null;
  final_tier: Tier | null;
  author: ArticleAuthorDetail | null;
}

/**
 * The author embed names its foreign key because articles has two keys into
 * profiles and PostgREST needs to be told which one to join on.
 *
 * It must be articles_author_profile_id_fkey (author_profile_id -> profiles.id).
 * The other key, articles_author_member_id_fkey (author_member_id ->
 * profiles.ghost_member_id), resolves too, but joining on it makes PostgREST
 * read profiles.ghost_member_id, which is closed to anon, and every anonymous
 * page view fails with "permission denied for table profiles". See
 * supabase/migrations/20260921041813_articles_author_profile_id_for_public_embed.sql.
 *
 * It is NOT articles_author_id_fkey: there is no author_id column. Where
 * article identity finally lives (author_member_id text vs an author_id uuid
 * on auth.users) is an open decision for migrator and decider, and
 * profiles.user_id is null for every profile today, so an auth.uid()-keyed
 * identity would resolve to nobody.
 */
const SUMMARY_COLUMNS =
  'id, slug, title, excerpt, topic, published_at, author:profiles!articles_author_profile_id_fkey(display_name)';

/**
 * getPublishedArticle's own author embed, richer than SUMMARY_COLUMNS's:
 * the same foreign key (see the comment above), plus id (the bio card's
 * profile link), avatar_url and bio. Both are anon-selectable
 * (has_column_privilege, 2026-09-21, same check as SUMMARY_COLUMNS's own).
 */
const DETAIL_COLUMNS =
  'id, slug, title, excerpt, topic, published_at, body_html, declared_claims, feature_image, ' +
  'declared_tier, ai_suggested_tier, final_tier, ' +
  'author:profiles!articles_author_profile_id_fkey(id, display_name, avatar_url, bio)';

/** True when the public Supabase env is present. Pages render a notice otherwise. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

type Row<T> = Omit<T, 'author'> & { author: { display_name: string } | { display_name: string }[] | null };

function oneAuthor<T extends { author: unknown }>(row: Row<T>): T {
  const a = row.author;
  return { ...row, author: Array.isArray(a) ? (a[0] ?? null) : a } as T;
}

export async function getPublishedArticles(limit = 20): Promise<ArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    // Tiebreak so the order is stable across refreshes. The Ghost-era rows carry a
    // date-only published_at (12:00 UTC, from the site crawl), and two pairs share one.
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`articles query failed: ${error.message}`);
  return (data ?? []).map((r) => oneAuthor<ArticleSummary>(r as unknown as Row<ArticleSummary>));
}

/** The three raw tier columns, before isTier() narrows each to Tier | null. */
type DetailRow = Omit<Article, 'author' | 'declared_tier' | 'ai_suggested_tier' | 'final_tier'> & {
  author: ArticleAuthorDetail | ArticleAuthorDetail[] | null;
  declared_tier: unknown;
  ai_suggested_tier: unknown;
  final_tier: unknown;
};

export async function getPublishedArticle(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select(DETAIL_COLUMNS)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`article query failed: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as DetailRow;
  const a = row.author;
  return {
    ...row,
    author: Array.isArray(a) ? (a[0] ?? null) : a,
    declared_tier: isTier(row.declared_tier) ? row.declared_tier : null,
    ai_suggested_tier: isTier(row.ai_suggested_tier) ? row.ai_suggested_tier : null,
    final_tier: isTier(row.final_tier) ? row.final_tier : null,
  };
}
