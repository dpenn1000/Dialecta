/**
 * Runtime shape checks for every row the profile page reads. Pure: no
 * Supabase import, no I/O. data.ts calls these on whatever PostgREST returns.
 *
 * No Supabase client in apps/web carries the <Database> generic, so a renamed
 * column compiles cleanly and reads as undefined. A row that fails a parser
 * here is dropped and logged rather than rendered as nothing. Column names were
 * read from pg_attribute on mguulnibvzusfvyuowwh on 2026-09-21, and every
 * column selected below holds an anon grant (has_column_privilege, same day).
 */
import {
  isArchetype,
  isPillar,
  isTier,
  topicPhasesFromHistory,
  type Archetype,
  type Axis,
  type FingerprintAxisData,
  type FingerprintData,
  type Tier,
} from '@dialecta/core';

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function hasKeys(row: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((k) => k in row);
}

function str(x: unknown): string | null {
  return typeof x === 'string' ? x : null;
}

/** A string with content, trimmed, or null. */
function filled(x: unknown): string | null {
  const s = str(x);
  if (s === null) return null;
  const t = s.trim();
  return t.length > 0 ? t : null;
}

function nonNegativeInt(x: unknown): number | null {
  return typeof x === 'number' && Number.isInteger(x) && x >= 0 ? x : null;
}

/** numeric arrives as a JSON number from PostgREST; a numeric string is accepted too. */
function finite(x: unknown): number | null {
  if (typeof x === 'number') return Number.isFinite(x) ? x : null;
  if (typeof x === 'string' && x.trim() !== '') {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function instant(x: unknown): string | null {
  const s = str(x);
  return s !== null && !Number.isNaN(Date.parse(s)) ? s : null;
}

/**
 * Only http(s) URLs reach an <img src>. Gravatar's `d=blank` placeholder is
 * dropped, as the recovered merge did, so the initials disk shows instead of a
 * transparent square.
 */
export function safeImageUrl(x: unknown): string | null {
  const s = filled(x);
  if (s === null || !/^https?:\/\//i.test(s)) return null;
  if (s.includes('d=blank')) return null;
  return s;
}

// ─── profiles ───────────────────────────────────────────────────────────────

/**
 * Only what the page shows. ghost_member_id, gifted_by_member_id and user_id
 * are withheld from anon and are never asked for here; is_admin, the
 * subscription columns, order_negotiation_log and polish_preferences are
 * readable and still not asked for, because nothing on the page needs them.
 */
export const PROFILE_COLUMNS =
  'id, display_name, handle, bio, avatar_url, location, is_seed, is_author, resonance, order_id, order_label, order_family, pact_signed_name, signature_font, aspirational_archetype, influences, field_notes, mind_changes, wrestling_with';

export interface Influence {
  title: string;
  author: string | null;
  note: string | null;
  coverUrl: string | null;
}

export interface FieldNote {
  url: string | null;
  caption: string | null;
}

export interface MindChange {
  from: string;
  to: string;
  why: string | null;
}

export interface ProfileRow {
  id: string;
  displayName: string | null;
  handle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  isSeed: boolean;
  isAuthor: boolean;
  resonance: number;
  order: { id: string; label: string | null; family: string | null } | null;
  pactSignedName: string | null;
  signatureFont: string | null;
  aspirational: Archetype | null;
  influences: Influence[];
  fieldNotes: FieldNote[];
  mindChanges: MindChange[];
  wrestlingWith: string | null;
}

function parseInfluences(x: unknown): Influence[] {
  if (!Array.isArray(x)) return [];
  const out: Influence[] = [];
  for (const item of x) {
    if (!isRecord(item)) continue;
    const title = filled(item.title);
    if (title === null) continue;
    out.push({ title, author: filled(item.author), note: filled(item.note), coverUrl: safeImageUrl(item.cover_url) });
  }
  return out;
}

/** Capped at four in the recovered UI. */
function parseFieldNotes(x: unknown): FieldNote[] {
  if (!Array.isArray(x)) return [];
  const out: FieldNote[] = [];
  for (const item of x) {
    if (!isRecord(item)) continue;
    const url = safeImageUrl(item.url);
    const caption = filled(item.caption);
    if (url === null && caption === null) continue;
    out.push({ url, caption });
  }
  return out.slice(0, 4);
}

/** Capped at three in the recovered UI. */
function parseMindChanges(x: unknown): MindChange[] {
  if (!Array.isArray(x)) return [];
  const out: MindChange[] = [];
  for (const item of x) {
    if (!isRecord(item)) continue;
    const from = filled(item.from);
    const to = filled(item.to);
    if (from === null || to === null) continue;
    out.push({ from, to, why: filled(item.why) });
  }
  return out.slice(0, 3);
}

export function parseProfileRow(row: unknown): ProfileRow | null {
  const keys = ['id', 'display_name', 'handle', 'is_seed', 'is_author', 'resonance'];
  if (!isRecord(row) || !hasKeys(row, keys)) return null;
  const id = str(row.id);
  if (id === null) return null;
  const orderId = filled(row.order_id);
  const aspirational = row.aspirational_archetype;
  return {
    id,
    displayName: filled(row.display_name),
    handle: filled(row.handle),
    bio: filled(row.bio),
    avatarUrl: safeImageUrl(row.avatar_url),
    location: filled(row.location),
    isSeed: row.is_seed === true,
    isAuthor: row.is_author === true,
    resonance: Math.max(0, Math.min(1, finite(row.resonance) ?? 0)),
    order: orderId ? { id: orderId, label: filled(row.order_label), family: filled(row.order_family) } : null,
    pactSignedName: filled(row.pact_signed_name),
    signatureFont: filled(row.signature_font),
    aspirational: isArchetype(aspirational) ? aspirational : null,
    influences: parseInfluences(row.influences),
    fieldNotes: parseFieldNotes(row.field_notes),
    mindChanges: parseMindChanges(row.mind_changes),
    wrestlingWith: filled(row.wrestling_with),
  };
}

// ─── axis_scores ────────────────────────────────────────────────────────────

/**
 * graduation_count is floor(rawTotal) capped at 22 (axis-mapping.ts). The
 * table stores no raw total, so the soft horizon past 22 cannot be exercised
 * from stored rows yet; graduations are what the engine gets.
 */
export const AXIS_COLUMNS = 'axis, graduation_count, tier_mix, topic_history';

export interface AxisRow {
  axis: Axis;
  graduations: number;
  tierMix: Partial<Record<Tier, number>>;
  topicHistory: unknown;
}

export function parseAxisRow(row: unknown): AxisRow | null {
  if (!isRecord(row) || !hasKeys(row, ['axis', 'graduation_count', 'tier_mix', 'topic_history'])) return null;
  const axis = row.axis;
  const graduations = nonNegativeInt(row.graduation_count);
  if (!isPillar(axis) || graduations === null || !isRecord(row.tier_mix)) return null;
  const tierMix: Partial<Record<Tier, number>> = {};
  for (const [key, value] of Object.entries(row.tier_mix)) {
    const n = nonNegativeInt(value);
    if (isTier(key) && n !== null) tierMix[key] = n;
  }
  return { axis, graduations, tierMix, topicHistory: row.topic_history };
}

/**
 * Stored rows to the engine's input. Nothing is discarded: the recovered
 * carousel's `axisScoresToFingerprintData` kept graduations and threw away
 * tier_mix and topic history, so every fingerprint it drew ran calm, fully
 * saturated and in fallback colour (FINGERPRINT.md). This keeps all three.
 */
export function toFingerprintData(rows: readonly AxisRow[]): FingerprintData {
  const data: FingerprintData = {};
  for (const row of rows) {
    const axis: FingerprintAxisData = { graduations: row.graduations, tierMix: row.tierMix };
    const phases = topicPhasesFromHistory(row.topicHistory);
    if (phases.length > 0) axis.topicPhases = phases;
    data[row.axis] = axis;
  }
  return data;
}

// ─── archetypes ─────────────────────────────────────────────────────────────

export const ARCHETYPE_COLUMNS = 'archetype_id, confidence';

export type ArchetypeConfidence = 'forming' | 'emerging' | 'established';

export interface ArchetypeRow {
  id: Archetype;
  confidence: ArchetypeConfidence;
}

export function parseArchetypeRow(row: unknown): ArchetypeRow | null {
  if (!isRecord(row) || !hasKeys(row, ['archetype_id', 'confidence'])) return null;
  const id = row.archetype_id;
  const c = row.confidence;
  if (!isArchetype(id)) return null;
  const confidence: ArchetypeConfidence = c === 'emerging' || c === 'established' ? c : 'forming';
  return { id, confidence };
}

// ─── articles ───────────────────────────────────────────────────────────────

export const ARTICLE_COLUMNS = 'id, slug, title, excerpt, topic, published_at, final_tier';

export interface ArticleRow {
  id: string;
  slug: string;
  title: string | null;
  excerpt: string | null;
  topic: string | null;
  publishedAt: string | null;
  finalTier: Tier | null;
}

export function parseArticleRow(row: unknown): ArticleRow | null {
  if (!isRecord(row) || !hasKeys(row, ['id', 'slug', 'title', 'published_at', 'final_tier'])) return null;
  const id = str(row.id);
  const slug = filled(row.slug);
  if (id === null || slug === null) return null;
  const tier = row.final_tier;
  return {
    id,
    slug,
    title: filled(row.title),
    excerpt: filled(row.excerpt),
    topic: filled(row.topic),
    publishedAt: instant(row.published_at),
    finalTier: isTier(tier) ? tier : null,
  };
}

// ─── comments ───────────────────────────────────────────────────────────────

/**
 * Never member_email, which is closed to anon, and never member_id, which is
 * the bridge. body is no longer selected here either: comments.body is
 * closed at the column grant once every reader stops selecting it directly
 * (20260921184500_close_comments_body_and_mentions_to_public.sql). data.ts
 * reads it separately through comment_bodies() and merges it onto each row
 * before parseCommentRow() below sees it, so that function's own shape stays
 * unchanged.
 */
export const COMMENT_COLUMNS = 'id, article_slug, article_title, published_at';

export interface CommentRow {
  id: string;
  articleSlug: string | null;
  articleTitle: string | null;
  body: string;
  publishedAt: string | null;
}

/**
 * The comments query's own shape, before comment_bodies() has merged body
 * onto it: id, article_slug, article_title, published_at as PostgREST sent
 * them. Deliberately not a transform like parseCommentRow below: the row it
 * returns keeps its raw snake_case keys, so `{ ...shape, body }` is still a
 * row parseCommentRow() can read. id is checked and guaranteed present so the
 * caller can collect ids to pass to comment_bodies().
 */
export interface CommentRowShape extends Record<string, unknown> {
  id: string;
}

export function parseCommentRowShape(row: unknown): CommentRowShape | null {
  if (!isRecord(row) || !hasKeys(row, ['id', 'article_slug', 'article_title', 'published_at'])) return null;
  const id = str(row.id);
  return id === null ? null : { ...row, id };
}

export function parseCommentRow(row: unknown): CommentRow | null {
  if (!isRecord(row) || !hasKeys(row, ['id', 'article_slug', 'article_title', 'body', 'published_at'])) return null;
  const id = str(row.id);
  const body = filled(row.body);
  if (id === null || body === null) return null;
  return {
    id,
    articleSlug: filled(row.article_slug),
    articleTitle: filled(row.article_title),
    body,
    publishedAt: instant(row.published_at),
  };
}

// ─── feed_events ────────────────────────────────────────────────────────────

/** Never primary_member_id or secondary_member_id, which carry the bridge value. */
export const FEED_COLUMNS = 'id, event_type, display_payload, created_at';

export interface FeedRow {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string | null;
}

export function parseFeedRow(row: unknown): FeedRow | null {
  if (!isRecord(row) || !hasKeys(row, ['id', 'event_type', 'display_payload', 'created_at'])) return null;
  const id = str(row.id);
  const eventType = filled(row.event_type);
  if (id === null || eventType === null) return null;
  return {
    id,
    eventType,
    payload: isRecord(row.display_payload) ? row.display_payload : {},
    createdAt: instant(row.created_at),
  };
}

/** A payload field as display text, or null. Numbers are shown as written. */
export function payloadText(payload: Record<string, unknown>, key: string): string | null {
  const v = payload[key];
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return filled(v);
}

// ─── follows ────────────────────────────────────────────────────────────────

/** One id column from a follows row. The ids stay on the server; only counts leave. */
export function followIds(rows: unknown, column: 'follower_id' | 'followee_id'): string[] {
  if (!Array.isArray(rows)) return [];
  const out: string[] = [];
  for (const r of rows) {
    if (isRecord(r)) {
      const v = str(r[column]);
      if (v) out.push(v);
    }
  }
  return out;
}
