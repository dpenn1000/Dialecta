import 'server-only';

/**
 * Every Supabase query the profile page and its fingerprint make, and nothing
 * else. Nothing outside this file imports a Supabase client for the profile:
 * page.tsx calls loadProfilePage() and hands plain data down, and the
 * fingerprint island takes numbers and draws them. When the lib/data spine
 * lands (architect's rebuild map) this file moves into it whole.
 *
 * IDENTITY
 *
 * A profile is looked up by profiles.id, or by profiles.handle as a courtesy.
 * Both are in the anon column grant. ghost_member_id is not, on purpose
 * (20260920192954_close_ghost_member_id_as_public_credential.sql).
 *
 * THE ONE PLACE THE SERVICE ROLE IS USED, AND WHY
 *
 * axis_scores, archetypes, follows, sparring_partners, comments and
 * feed_events are all keyed on the Ghost member id, not on profiles.id. The
 * anon client cannot read that column on profiles, so from the public key a
 * profile cannot be joined to its own fingerprint. articles solved the same
 * problem with author_profile_id (20260921041813). Nothing has solved it for
 * these six tables yet; that is a schema change and it is reported rather than
 * made here.
 *
 * Until it lands, memberKeyFor() reads exactly one column of one row with the
 * service role, server side, and the value never leaves this module: it is not
 * returned, not logged and not passed to any component. Every other read,
 * including the reads keyed on it, goes through the anon client so row-level
 * security still decides what is visible. Without SUPABASE_SERVICE_ROLE_KEY the
 * page still renders, with the fingerprint marked no-service-key.
 */
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { commentIdsWithShowableBodies } from '@/components/discourse/data';
import { createServiceClient } from '@/lib/supabase/service';
import type { FingerprintData } from '@dialecta/core';
import {
  ARCHETYPE_COLUMNS,
  ARTICLE_COLUMNS,
  AXIS_COLUMNS,
  COMMENT_COLUMNS,
  FEED_COLUMNS,
  PROFILE_COLUMNS,
  followIds,
  parseArchetypeRow,
  parseArticleRow,
  parseAxisRow,
  parseCommentRow,
  parseFeedRow,
  parseProfileRow,
  toFingerprintData,
  type ArchetypeRow,
  type ArticleRow,
  type AxisRow,
  type CommentRow,
  type FeedRow,
  type ProfileRow,
} from './rows';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HANDLE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

/** Enough for any profile today; the counts beside them are exact regardless. */
const LIST_LIMIT = 1000;
const RECENT = 5;
const FEED_LIMIT = 12;

/**
 * ok              the rows were read; an empty result is a real Newborn.
 * no-service-key  SUPABASE_SERVICE_ROLE_KEY is unset, so the bridge cannot run.
 * lookup-failed   the bridge ran and returned no member id, or failed.
 * error           the member id resolved and the axis_scores read failed.
 */
export type FingerprintStatus = 'ok' | 'no-service-key' | 'lookup-failed' | 'error';

export interface Connections {
  readers: number;
  sources: number;
  correspondents: number;
  sparringPartners: number;
}

export interface ProfilePageData {
  profile: ProfileRow;
  fingerprint: FingerprintData;
  fingerprintStatus: FingerprintStatus;
  archetype: ArchetypeRow | null;
  /** Null when the member key could not be resolved. */
  connections: Connections | null;
  /** Null when the member key could not be resolved. */
  commentCount: number | null;
  comments: CommentRow[];
  articles: ArticleRow[];
  feed: FeedRow[];
  isOwnProfile: boolean;
  /**
   * When the contributor joined, for the "Joined" line. Null for now, so
   * the line stays hidden: profiles has no join date (checked against
   * pg_attribute, 2026-09-21), and a login's own created_at is the day it
   * first signed in here, months after a legacy member joined on Ghost.
   * Live reads the Ghost member's created_at, own profile only; the fix is
   * a profiles.joined_at backfilled from Ghost's members.
   */
  joinedAt: string | null;
}

export function isProfileDataConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

type Client = Awaited<ReturnType<typeof createClient>>;

/** Route params can arrive encoded; a malformed escape is left as written and fails the id checks. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function warn(what: string, message: string | undefined): void {
  // A secondary read failing leaves its section empty rather than failing the
  // page. The message names the query; it never carries the member key.
  console.error(`[profile] ${what} failed: ${message ?? 'no message'}`);
}

function parseRows<T>(what: string, rows: unknown, parse: (row: unknown) => T | null): T[] {
  if (!Array.isArray(rows)) return [];
  const out: T[] = [];
  let rejected = 0;
  for (const r of rows) {
    const p = parse(r);
    if (p === null) rejected += 1;
    else out.push(p);
  }
  if (rejected > 0) warn(what, `${rejected} rows did not match the expected shape`);
  return out;
}

async function findProfile(supabase: Client, key: string): Promise<ProfileRow | null> {
  const byId = UUID.test(key);
  if (!byId && !HANDLE.test(key)) return null;
  const query = supabase.from('profiles').select(PROFILE_COLUMNS);
  const { data, error } = await (byId ? query.eq('id', key) : query.eq('handle', key.toLowerCase())).maybeSingle();
  if (error) throw new Error(`profile query failed: ${error.message}`);
  return data ? parseProfileRow(data) : null;
}

/** See the header. One column, one row, server only, never returned. */
async function memberKeyFor(
  profileId: string,
): Promise<{ key: string } | { key: null; why: 'no-service-key' | 'lookup-failed' }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { key: null, why: 'no-service-key' };
  try {
    const service = createServiceClient();
    const { data, error } = await service.from('profiles').select('ghost_member_id').eq('id', profileId).maybeSingle();
    if (error) {
      warn('member key lookup', error.message);
      return { key: null, why: 'lookup-failed' };
    }
    const value: unknown = data ? (data as Record<string, unknown>).ghost_member_id : null;
    return typeof value === 'string' && value.length > 0 ? { key: value } : { key: null, why: 'lookup-failed' };
  } catch (e) {
    warn('member key lookup', e instanceof Error ? e.message : String(e));
    return { key: null, why: 'lookup-failed' };
  }
}

/**
 * Whether the signed-in viewer is this profile. Decides which empty-state copy
 * shows and nothing else: there are no writes on this page. Same lookup as
 * lib/article-ownership.ts.
 */
async function viewerIsProfile(supabase: Client, profileId: string): Promise<boolean> {
  try {
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims?.sub) return false;
    const { data } = await supabase.rpc('get_own_profile_for_comment');
    const own: unknown = Array.isArray(data) ? data[0] : undefined;
    return typeof own === 'object' && own !== null && (own as Record<string, unknown>).profile_id === profileId;
  } catch {
    return false;
  }
}

async function loadArticles(supabase: Client, profileId: string): Promise<ArticleRow[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLUMNS)
    .eq('author_profile_id', profileId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    warn('articles', error.message);
    return [];
  }
  return parseRows('articles', data, parseArticleRow);
}

interface Keyed {
  axisRows: AxisRow[] | null;
  archetype: ArchetypeRow | null;
  connections: Connections | null;
  commentCount: number | null;
  comments: CommentRow[];
  feed: FeedRow[];
}

/** Every read keyed on the member id, all through the anon client. */
async function loadKeyed(supabase: Client, memberKey: string): Promise<Keyed> {
  const [axis, archetype, readers, sources, sparA, sparB, comments, feed] = await Promise.all([
    supabase.from('axis_scores').select(AXIS_COLUMNS).eq('member_id', memberKey),
    supabase.from('archetypes').select(ARCHETYPE_COLUMNS).eq('member_id', memberKey).maybeSingle(),
    supabase.from('follows').select('follower_id', { count: 'exact' }).eq('followee_id', memberKey).limit(LIST_LIMIT),
    supabase.from('follows').select('followee_id', { count: 'exact' }).eq('follower_id', memberKey).limit(LIST_LIMIT),
    // Two counts rather than one .or() filter, so the key is never spliced
    // into a filter string. RLS shows only mutually visible pairs.
    supabase.from('sparring_partners').select('id', { count: 'exact', head: true }).eq('member_a', memberKey),
    supabase.from('sparring_partners').select('id', { count: 'exact', head: true }).eq('member_b', memberKey),
    supabase
      .from('comments')
      .select(COMMENT_COLUMNS, { count: 'exact' })
      .eq('member_id', memberKey)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(RECENT),
    // Events about this contributor, which is what a public profile can
    // honestly show. The recovered feed was the viewer's platform stream.
    supabase
      .from('feed_events')
      .select(FEED_COLUMNS)
      .eq('primary_member_id', memberKey)
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT),
  ]);

  let axisRows: AxisRow[] | null = null;
  if (axis.error) warn('axis_scores', axis.error.message);
  else axisRows = parseRows('axis_scores', axis.data, parseAxisRow);

  if (archetype.error) warn('archetypes', archetype.error.message);

  let connections: Connections | null = null;
  if (readers.error || sources.error || sparA.error || sparB.error) {
    warn(
      'connections',
      readers.error?.message ?? sources.error?.message ?? sparA.error?.message ?? sparB.error?.message,
    );
  } else {
    const readerIds = new Set(followIds(readers.data, 'follower_id'));
    const sourceIds = followIds(sources.data, 'followee_id');
    connections = {
      readers: readers.count ?? readerIds.size,
      sources: sources.count ?? sourceIds.length,
      correspondents: sourceIds.filter((id) => readerIds.has(id)).length,
      sparringPartners: (sparA.count ?? 0) + (sparB.count ?? 0),
    };
  }

  if (comments.error) warn('comments', comments.error.message);
  if (feed.error) warn('feed_events', feed.error.message);

  // A body shows here only by the rule the discourse feed applies: classified,
  // and not Breach. A failed tier read shows none, since a Breach comment's
  // words must not appear in full on its author's profile.
  const recent = comments.error ? [] : parseRows('comments', comments.data, parseCommentRow);
  let showable = new Set<string>();
  try {
    showable = await commentIdsWithShowableBodies(supabase, recent.map((c) => c.id));
  } catch (err) {
    warn('comment_tiers', err instanceof Error ? err.message : String(err));
  }

  return {
    axisRows,
    archetype: archetype.error || !archetype.data ? null : parseArchetypeRow(archetype.data),
    connections,
    commentCount: comments.error ? null : (comments.count ?? null),
    comments: recent.filter((c) => showable.has(c.id)),
    feed: feed.error ? [] : parseRows('feed_events', feed.data, parseFeedRow),
  };
}

/**
 * Everything the profile page renders, or null when no profile has that
 * address. Throws only when the profile read itself fails; every other read
 * degrades to an empty section. Cached per request, so generateMetadata and
 * the page share one set of reads.
 */
export const loadProfilePage = cache(async function loadProfilePage(key: string): Promise<ProfilePageData | null> {
  const supabase = await createClient();
  const profile = await findProfile(supabase, safeDecode(key).trim());
  if (!profile) return null;

  const [member, articles, isOwnProfile] = await Promise.all([
    memberKeyFor(profile.id),
    loadArticles(supabase, profile.id),
    viewerIsProfile(supabase, profile.id),
  ]);
  // No join date is stored yet; see ProfilePageData.joinedAt.
  const joinedAt: string | null = null;

  const memberKey = member.key;
  if (memberKey === null) {
    return {
      profile,
      fingerprint: {},
      fingerprintStatus: 'why' in member ? member.why : 'lookup-failed',
      archetype: null,
      connections: null,
      commentCount: null,
      comments: [],
      articles,
      feed: [],
      isOwnProfile,
      joinedAt,
    };
  }

  const keyed = await loadKeyed(supabase, memberKey);
  return {
    profile,
    fingerprint: keyed.axisRows ? toFingerprintData(keyed.axisRows) : {},
    fingerprintStatus: keyed.axisRows ? 'ok' : 'error',
    archetype: keyed.archetype,
    connections: keyed.connections,
    commentCount: keyed.commentCount,
    comments: keyed.comments,
    articles,
    feed: keyed.feed,
    isOwnProfile,
    joinedAt,
  };
});
