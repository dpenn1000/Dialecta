/**
 * Runtime shape checks for every row this page reads.
 *
 * No Supabase client in apps/web carries the <Database> generic, so a
 * renamed or retyped column compiles cleanly and reads as undefined, which an
 * analytics page would then report as zero. These parsers are where the
 * generic should have been: a row that fails one is counted and named on the
 * page rather than silently read as nothing. The column names below were read
 * from pg_attribute on mguulnibvzusfvyuowwh on 2026-09-21, not from a doc.
 */
import { isPillar, isTier, TIER_IDS, type Axis, type Tier } from '@dialecta/core';

export interface Parsed<T> {
  rows: T[];
  rejected: number;
}

export function parseAll<T>(raw: readonly unknown[], parse: (row: unknown) => T | null): Parsed<T> {
  const rows: T[] = [];
  let rejected = 0;
  for (const r of raw) {
    const p = parse(r);
    if (p === null) rejected += 1;
    else rows.push(p);
  }
  return { rows, rejected };
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/**
 * Every selected column must be present as a key. PostgREST sends SQL NULL as
 * null; a key that is missing altogether means the column was renamed or
 * dropped, and that row is rejected rather than read as empty.
 */
function hasKeys(row: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((k) => k in row);
}

function str(x: unknown): string | null {
  return typeof x === 'string' ? x : null;
}

function count(x: unknown): number | null {
  return typeof x === 'number' && Number.isInteger(x) && x >= 0 ? x : null;
}

/** timestamptz arrives as an ISO string. Epoch milliseconds, or null if unreadable. */
function instant(x: unknown): number | null {
  const s = str(x);
  if (s === null) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

/** comments: id, member_id, member_name, created_at, published_at, parent_id. Never member_email or body. */
export interface CommentRow {
  memberId: string;
  memberName: string;
  createdAt: number;
  publishedAt: number | null;
  isReply: boolean;
}

export const COMMENT_COLUMNS = 'id, member_id, member_name, created_at, published_at, parent_id';

export function parseComment(row: unknown): CommentRow | null {
  if (!isRecord(row) || !hasKeys(row, ['member_id', 'member_name', 'created_at', 'published_at', 'parent_id'])) {
    return null;
  }
  const memberId = str(row.member_id);
  const createdAt = instant(row.created_at);
  if (memberId === null || createdAt === null) return null;
  return {
    memberId,
    memberName: str(row.member_name) ?? '',
    createdAt,
    publishedAt: instant(row.published_at),
    isReply: row.parent_id !== null,
  };
}

/** articles: author_member_id, final_tier, created_at. */
export interface ArticleRow {
  authorId: string;
  finalTier: Tier | null;
  createdAt: number;
}

export const ARTICLE_COLUMNS = 'id, author_member_id, final_tier, created_at';

export function parseArticle(row: unknown): ArticleRow | null {
  if (!isRecord(row) || !hasKeys(row, ['author_member_id', 'final_tier', 'created_at'])) return null;
  const authorId = str(row.author_member_id);
  const createdAt = instant(row.created_at);
  if (authorId === null || createdAt === null) return null;
  const t = row.final_tier;
  let finalTier: Tier | null;
  if (t === null) finalTier = null;
  else if (isTier(t)) finalTier = t;
  else return null;
  return { authorId, finalTier, createdAt };
}

/**
 * axis_scores: member_id, axis, graduation_count, comment_count, tier_mix,
 * last_updated, and first_phase, which is topic_history->0 aliased.
 *
 * comment_count is named for comments and counts axis events from articles
 * and comments alike (packages/core calls the same counter eventCount), so it
 * is carried here as eventCount and never as a comment count.
 */
export interface AxisRow {
  memberId: string;
  axis: Axis;
  graduations: number;
  eventCount: number;
  tierMix: Record<Tier, number>;
  /** Keys in tier_mix that are not one of the seven tiers. Drift, surfaced rather than dropped. */
  unknownTierKeys: string[];
  hasTopicPhase: boolean;
  lastUpdated: number;
}

export function emptyTierMix(): Record<Tier, number> {
  const mix = {} as Record<Tier, number>;
  for (const t of TIER_IDS) mix[t] = 0;
  return mix;
}

/** topic_history is read as its first element only, so its length never travels. */
export const AXIS_COLUMNS =
  'id, member_id, axis, graduation_count, comment_count, tier_mix, last_updated, first_phase:topic_history->0';

export function parseAxisRow(row: unknown): AxisRow | null {
  const keys = ['member_id', 'axis', 'graduation_count', 'comment_count', 'tier_mix', 'last_updated', 'first_phase'];
  if (!isRecord(row) || !hasKeys(row, keys)) return null;
  const memberId = str(row.member_id);
  const axis = row.axis;
  const graduations = count(row.graduation_count);
  const eventCount = count(row.comment_count);
  const lastUpdated = instant(row.last_updated);
  if (memberId === null || !isPillar(axis) || graduations === null || eventCount === null || lastUpdated === null) {
    return null;
  }
  if (!isRecord(row.tier_mix)) return null;
  const tierMix = emptyTierMix();
  const unknownTierKeys: string[] = [];
  for (const [key, value] of Object.entries(row.tier_mix)) {
    const n = count(value);
    if (n === null) return null;
    if (isTier(key)) tierMix[key] = n;
    else unknownTierKeys.push(key);
  }
  return {
    memberId,
    axis,
    graduations,
    eventCount,
    tierMix,
    unknownTierKeys,
    hasTopicPhase: row.first_phase !== null,
    lastUpdated,
  };
}

/** archetypes: member_id. The assignment itself is not needed to count who has one. */
export interface ArchetypeRow {
  memberId: string;
}

export const ARCHETYPE_COLUMNS = 'id, member_id';

export function parseArchetype(row: unknown): ArchetypeRow | null {
  if (!isRecord(row) || !hasKeys(row, ['member_id'])) return null;
  const memberId = str(row.member_id);
  return memberId === null ? null : { memberId };
}

/** follows: follower_id, created_at. */
export interface FollowRow {
  followerId: string;
  createdAt: number;
}

export const FOLLOW_COLUMNS = 'id, follower_id, created_at';

export function parseFollow(row: unknown): FollowRow | null {
  if (!isRecord(row) || !hasKeys(row, ['follower_id', 'created_at'])) return null;
  const followerId = str(row.follower_id);
  const createdAt = instant(row.created_at);
  if (followerId === null || createdAt === null) return null;
  return { followerId, createdAt };
}

/**
 * profiles, membership columns only. anon holds SELECT on 39 of the 42
 * columns (migration 20260920192954); ghost_member_id, gifted_by_member_id and
 * user_id are withheld, so a profile cannot be joined to its comments or its
 * fingerprint from this client. subscription_tier_set_by carries a member id
 * and is reduced to its kind here, never passed on.
 */
export const PROFILE_COLUMNS =
  'id, subscription_tier, subscription_tier_set_by, is_charter, is_gifted, gift_expires_at, is_seed, is_author, pact_agreed_at';

export interface ProfileRow {
  /** profiles.subscription_tier, 'free' or 'pro'. The label for 'pro' is Underwriter, never Pro. */
  tier: 'free' | 'pro';
  setBy: 'system' | 'member' | 'unset';
  isCharter: boolean;
  isGifted: boolean;
  giftExpires: boolean;
  isSeed: boolean;
  isAuthor: boolean;
  signedPact: boolean;
}

export function parseProfile(row: unknown): ProfileRow | null {
  const keys = [
    'subscription_tier',
    'subscription_tier_set_by',
    'is_charter',
    'is_gifted',
    'gift_expires_at',
    'is_seed',
    'is_author',
    'pact_agreed_at',
  ];
  if (!isRecord(row) || !hasKeys(row, keys)) return null;
  const tier = row.subscription_tier;
  if (tier !== 'free' && tier !== 'pro') return null;
  const flags = [row.is_charter, row.is_gifted, row.is_seed, row.is_author];
  if (!flags.every((f) => typeof f === 'boolean')) return null;
  const setBy = row.subscription_tier_set_by;
  return {
    tier,
    setBy: setBy === null ? 'unset' : setBy === 'system' ? 'system' : 'member',
    isCharter: row.is_charter === true,
    isGifted: row.is_gifted === true,
    giftExpires: row.gift_expires_at !== null,
    isSeed: row.is_seed === true,
    isAuthor: row.is_author === true,
    signedPact: row.pact_agreed_at !== null,
  };
}
