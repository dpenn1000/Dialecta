/**
 * Community reads. Server only, through the cookie-aware anon client, so
 * nothing here bypasses row-level security.
 *
 * The recovered page read three bundles from the legacy API, which used the
 * service key: /api/profile/_list, /api/profile/_feed and /api/profile/_author
 * (_recovered/api/profile/[id].js). This reads the same tables through anon,
 * which changes two things, both on purpose:
 *
 *  1. Only public profile columns are selected. Every column on `profiles`
 *     used to be readable without a session; migration 20260920192954 closed
 *     ghost_member_id and gifted_by_member_id, and the rest of the grant is
 *     still wide (is_admin, subscription_tier, pact_signed_name). The list
 *     below is the directory card's own fields and nothing more.
 *  2. Archetypes, axis scores and feed events key on the Ghost member id,
 *     which anon can no longer read on `profiles`, so a profile cannot be
 *     joined to its archetype or its pillar colours from here. The directory
 *     renders without archetype chips and with the neutral avatar colour until
 *     a public-profile read exists (root CLAUDE.md, "Live RLS is measured").
 *     Feed events keep their headlines but not their subject's name.
 *
 * Nothing here reads comments or classifications: Forum-tier contributions on
 * the author view and comment counts on feed cards need the classification
 * rows, which anon cannot read.
 */
import { isTier, type Tier } from '@dialecta/core';
import { createClient } from '@/lib/supabase/server';

export interface Contributor {
  id: string;
  displayName: string | null;
  handle: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  isAuthor: boolean;
  /** Null for every contributor today: archetypes key on the Ghost member id (see above). */
  archetype: { id: string; label: string } | null;
  order: { id: string; label: string; family: string | null } | null;
}

export interface CommunityArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  topic: string | null;
  publishedAt: string | null;
  tier: Tier | null;
  author: { id: string; displayName: string } | null;
}

export type FeedEventPayload = Record<string, unknown>;

export interface FeedEvent {
  id: string;
  eventType: string;
  payload: FeedEventPayload;
  createdAt: string;
}

const PROFILE_COLUMNS = 'id, display_name, handle, bio, location, avatar_url, is_author, order_id, order_label, order_family';

/** Same foreign key lib/articles.ts embeds on, for the same reason (see its SUMMARY_COLUMNS note). */
const ARTICLE_COLUMNS =
  'id, slug, title, excerpt, topic, published_at, declared_tier, final_tier, author:profiles!articles_author_profile_id_fkey(id, display_name)';

type ProfileRow = {
  id: string;
  display_name: string | null;
  handle: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  is_author: boolean | null;
  order_id: string | null;
  order_label: string | null;
  order_family: string | null;
};

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  topic: string | null;
  published_at: string | null;
  declared_tier: string | null;
  final_tier: string | null;
  author: { id: string; display_name: string | null } | { id: string; display_name: string | null }[] | null;
};

function toContributor(row: ProfileRow): Contributor {
  return {
    id: row.id,
    displayName: row.display_name?.trim() || null,
    handle: row.handle,
    bio: row.bio?.trim() || null,
    location: row.location,
    avatarUrl: row.avatar_url || null,
    isAuthor: Boolean(row.is_author),
    archetype: null,
    order: row.order_id && row.order_label ? { id: row.order_id, label: row.order_label, family: row.order_family } : null,
  };
}

function toArticle(row: ArticleRow): CommunityArticle {
  const author = Array.isArray(row.author) ? (row.author[0] ?? null) : row.author;
  // The live card read final_tier first, then the author's declaration.
  const rawTier = row.final_tier ?? row.declared_tier;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    topic: row.topic,
    publishedAt: row.published_at,
    tier: isTier(rawTier) ? rawTier : null,
    author: author ? { id: author.id, displayName: author.display_name?.trim() || '' } : null,
  };
}

/** The directory: every profile, alphabetical, as /api/profile/_list ordered it. */
export async function getContributors(): Promise<Contributor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('display_name', { ascending: true, nullsFirst: false });
  if (error) throw new Error(`contributors query failed: ${error.message}`);
  return ((data ?? []) as unknown as ProfileRow[]).map(toContributor);
}

export async function getContributor(id: string): Promise<Contributor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw new Error(`contributor query failed: ${error.message}`);
  return data ? toContributor(data as unknown as ProfileRow) : null;
}

/** Published articles, newest first. `authorId` narrows to one contributor's writing. */
export async function getCommunityArticles(options: { limit?: number; authorId?: string } = {}): Promise<CommunityArticle[]> {
  const supabase = await createClient();
  let query = supabase
    .from('articles')
    .select(ARTICLE_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 40);
  if (options.authorId) query = query.eq('author_profile_id', options.authorId);
  const { data, error } = await query;
  if (error) throw new Error(`community articles query failed: ${error.message}`);
  return ((data ?? []) as unknown as ArticleRow[]).map(toArticle);
}

/**
 * Public feed events, newest first, as _feed read them. follower_milestone
 * never surfaces: philosopher ruled it a relationship turned into a broadcast
 * count (council/log/2026-09-20-port-or-rewrite.md, the moment card).
 * forum_thread_spotlight rows render as Thread Spotlights, as live.
 */
export async function getFeedEvents(limit = 50): Promise<FeedEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('feed_events')
    .select('id, event_type, display_payload, created_at')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`feed events query failed: ${error.message}`);
  return ((data ?? []) as { id: string; event_type: string; display_payload: unknown; created_at: string }[])
    .filter((row) => row.event_type !== 'follower_milestone')
    .map((row) => ({
      id: row.id,
      eventType: row.event_type,
      payload:
        row.display_payload && typeof row.display_payload === 'object' && !Array.isArray(row.display_payload)
          ? (row.display_payload as FeedEventPayload)
          : {},
      createdAt: row.created_at,
    }));
}
