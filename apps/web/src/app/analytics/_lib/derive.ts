/**
 * Pure derivation: parsed rows in, the page's figures out. No I/O, no clock
 * reads (the caller passes `now`), so every number here can be recomputed by
 * hand from the same rows.
 */
import { PILLAR_IDS, TIER_IDS, type Axis, type Tier } from '@dialecta/core';
import { CLOSED, verdict, type ClosedEntry, type Verdict } from './access-map';
import type { Failure, Loaded, RowSet } from './measure';
import {
  emptyTierMix,
  parseAll,
  parseArchetype,
  parseArticle,
  parseAxisRow,
  parseComment,
  parseFollow,
  parseProfile,
  type AxisRow,
  type CommentRow,
  type Parsed,
} from './rows';

/**
 * Fixture members carry this prefix on every member id. It is the operative
 * test because it applies to every table and in SQL; the tier_mix mismatch
 * below is an independent cross-check that only axis rows can support.
 */
export const FIXTURE_PREFIX = 'seed:';
export const isFixtureId = (id: string): boolean => id.startsWith(FIXTURE_PREFIX);

/** Live means a row within this many days of the read. An assumption, not a spec value. */
export const LIVE_WINDOW_DAYS = 7;
/** Below this many units a share is withheld and counts are shown. */
export const SHARE_FLOOR = 20;
export const WEEKS = 26;
export const ARRIVALS_SHOWN = 10;

const DAY = 86_400_000;
const WEEK = 7 * DAY;

export interface RawAnalytics {
  comments: Loaded<RowSet>;
  articles: Loaded<RowSet>;
  axis: Loaded<RowSet>;
  archetypes: Loaded<RowSet>;
  profiles: Loaded<RowSet>;
  /** The single newest follow by a member who is not a fixture. */
  lastFollow: Loaded<RowSet>;
  probes: Record<ClosedEntry['table'], Loaded<number>>;
}

export interface Quality {
  rejected: number;
  truncated: { read: number; total: number } | null;
}

export type Panel<T> = { ok: true; value: T; quality: Quality } | { ok: false; failure: Failure };

export type Freshness =
  | { kind: 'none' }
  | { kind: 'at'; at: number; days: number; live: boolean }
  | { kind: 'failed'; failure: Failure };

export interface Week {
  start: number;
  count: number;
}

/**
 * One commenter, in order of first comment. Deliberately carries no member
 * id: a Ghost member id is what the legacy comment route accepts as identity,
 * and anything in the view can reach a page's flight payload.
 */
export interface Arrival {
  name: string;
  first: number;
  count: number;
}

export interface View {
  now: number;
  activity: {
    comment: Freshness;
    article: Freshness;
    follow: Freshness;
    engine: Freshness;
    /** Set only when every stream read cleanly and none is live. */
    allStoppedSince: { at: number; days: number } | null;
  };
  comments: Panel<{
    total: number;
    commenters: number;
    topShare: number | null;
    replies: number;
    weeks: Week[];
    weekMax: number;
    arrivals: Arrival[];
    arrivalsMore: number;
    distinctPublishedAt: number;
    maxSharingPublishedAt: number;
  }>;
  articles: Panel<{
    total: number;
    authors: number;
    fixtureArticles: number;
    tiers: Record<Tier, number>;
    unresolved: number;
  }>;
  engine: Panel<{
    liveMix: Record<Tier, number>;
    liveUnits: number;
    fixtureMix: Record<Tier, number>;
    fixtureUnits: number;
    absentLive: Tier[];
    texture: { turbulence: number; clarity: number } | null;
    events: number;
    graduationsLive: number;
    graduationsFixture: number;
    liveContributors: number;
    fixtureContributors: number;
    liveRows: number;
    topicRows: number;
    topicAxes: Axis[];
    liveWithArchetype: number;
    /** disagree is a count on purpose: the members it would name could be live, and their ids are credentials. */
    fixtures: { byPrefix: number; byMismatch: number; disagree: number };
    unknownTierKeys: string[];
  }>;
  membership: Panel<{
    /** Profiles that are not fixtures, by profiles.is_seed. */
    profiles: number;
    fixtureProfiles: number;
    underwriters: number;
    underwritersBy: { system: number; member: number; unset: number };
    /** docs/SUBSCRIPTION-MODEL.md, "The three founding cohorts", by the columns it names. */
    charterWriters: number;
    charterUnderwriters: number;
    /** Founding Voices and peer gifts share these columns; gifted_by_member_id, which tells them apart, is withheld. */
    giftedWithExpiry: number;
    /** Gift flags in a combination the subscription model does not document. */
    undocumentedGifts: number;
    signedPact: number;
    /** Signers who are also authors, by is_author. */
    signedAuthors: number;
  }>;
  closed: { entry: ClosedEntry; verdict: Verdict }[];
}

function quality(sets: readonly { raw: RowSet; parsed: Parsed<unknown> }[]): Quality {
  let rejected = 0;
  let truncated: Quality['truncated'] = null;
  for (const s of sets) {
    rejected += s.parsed.rejected;
    if (s.raw.truncated && truncated === null) truncated = { read: s.raw.rows.length, total: s.raw.total };
  }
  return { rejected, truncated };
}

function freshness(at: number | null, now: number): Freshness {
  if (at === null) return { kind: 'none' };
  const days = Math.max(0, Math.floor((now - at) / DAY));
  return { kind: 'at', at, days, live: days <= LIVE_WINDOW_DAYS };
}

function newest(times: readonly number[]): number | null {
  let max: number | null = null;
  for (const t of times) if (max === null || t > max) max = t;
  return max;
}

/** Monday 00:00 UTC of the week containing t. */
export function weekStartUtc(t: number): number {
  const d = new Date(t);
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  return midnight - sinceMonday * DAY;
}

export function weekly(times: readonly number[], now: number, weeks = WEEKS): Week[] {
  const current = weekStartUtc(now);
  const first = current - (weeks - 1) * WEEK;
  const counts: number[] = new Array<number>(weeks).fill(0);
  for (const t of times) {
    if (t < first || t >= current + WEEK) continue;
    const i = Math.round((weekStartUtc(t) - first) / WEEK);
    counts[i] = (counts[i] ?? 0) + 1;
  }
  return counts.map((count, i) => ({ start: first + i * WEEK, count }));
}

export function arrivalOrder(comments: readonly CommentRow[]): Arrival[] {
  const byMember = new Map<string, Arrival & { memberId: string; nameAt: number }>();
  for (const c of comments) {
    const seen = byMember.get(c.memberId);
    if (!seen) {
      byMember.set(c.memberId, { memberId: c.memberId, name: c.memberName, nameAt: c.createdAt, first: c.createdAt, count: 1 });
      continue;
    }
    seen.count += 1;
    if (c.createdAt < seen.first) seen.first = c.createdAt;
    if (c.memberName && c.createdAt >= seen.nameAt) {
      seen.name = c.memberName;
      seen.nameAt = c.createdAt;
    }
  }
  return [...byMember.values()]
    .sort((a, b) => a.first - b.first || a.memberId.localeCompare(b.memberId))
    .map(({ name, first, count }) => ({ name, first, count }));
}

export function sumTiers(rows: readonly AxisRow[]): Record<Tier, number> {
  const mix = emptyTierMix();
  for (const r of rows) for (const t of TIER_IDS) mix[t] += r.tierMix[t];
  return mix;
}

export function unitsOf(mix: Record<Tier, number>): number {
  return TIER_IDS.reduce((sum, t) => sum + mix[t], 0);
}

/**
 * The recovered engine's deriveAxisMetrics
 * (_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx, lines 199 to 205),
 * reproduced exactly: total is the six tiers other than Breach, and clarity is
 * 1 when its denominator is zero. A second definition, because packages/core
 * does not export this one; the engine applies it per axis, and this page
 * applies it to pooled rows.
 */
export function texture(mix: Record<Tier, number>): { turbulence: number; clarity: number } | null {
  const total = mix.forum + mix.spark + mix.echo + mix.fog + mix.heat + mix.stance;
  if (total === 0) return null;
  const clarityDenom = mix.forum + mix.echo + mix.fog;
  return {
    turbulence: (mix.heat + mix.stance) / total,
    clarity: clarityDenom > 0 ? mix.forum / clarityDenom : 1,
  };
}

/** A row whose tier_mix sums higher than its event count has a tier mix with no events behind it. */
function tierMixWithoutEvents(r: AxisRow): boolean {
  return unitsOf(r.tierMix) > r.eventCount;
}

function buildComments(raw: Loaded<RowSet>, now: number): View['comments'] {
  if (!raw.ok) return raw;
  const parsed = parseAll(raw.value.rows, parseComment);
  const live = parsed.rows.filter((c) => !isFixtureId(c.memberId));
  const arrivals = arrivalOrder(live);
  const top = arrivals.reduce((max, a) => Math.max(max, a.count), 0);
  const publishedAt = new Map<number, number>();
  for (const c of live) {
    if (c.publishedAt !== null) publishedAt.set(c.publishedAt, (publishedAt.get(c.publishedAt) ?? 0) + 1);
  }
  const weeks = weekly(
    live.map((c) => c.createdAt),
    now,
  );
  return {
    ok: true,
    quality: quality([{ raw: raw.value, parsed }]),
    value: {
      total: live.length,
      commenters: arrivals.length,
      topShare: live.length > 0 ? top / live.length : null,
      replies: live.filter((c) => c.isReply).length,
      weeks,
      weekMax: weeks.reduce((max, w) => Math.max(max, w.count), 0),
      arrivals: arrivals.slice(0, ARRIVALS_SHOWN),
      arrivalsMore: Math.max(0, arrivals.length - ARRIVALS_SHOWN),
      distinctPublishedAt: publishedAt.size,
      maxSharingPublishedAt: [...publishedAt.values()].reduce((max, n) => Math.max(max, n), 0),
    },
  };
}

function buildArticles(raw: Loaded<RowSet>): View['articles'] {
  if (!raw.ok) return raw;
  const parsed = parseAll(raw.value.rows, parseArticle);
  const live = parsed.rows.filter((a) => !isFixtureId(a.authorId));
  const tiers = emptyTierMix();
  let unresolved = 0;
  for (const a of live) {
    if (a.finalTier === null) unresolved += 1;
    else tiers[a.finalTier] += 1;
  }
  return {
    ok: true,
    quality: quality([{ raw: raw.value, parsed }]),
    value: {
      total: live.length,
      authors: new Set(live.map((a) => a.authorId)).size,
      fixtureArticles: parsed.rows.length - live.length,
      tiers,
      unresolved,
    },
  };
}

function buildEngine(axisRaw: Loaded<RowSet>, archetypeRaw: Loaded<RowSet>): View['engine'] {
  if (!axisRaw.ok) return axisRaw;
  if (!archetypeRaw.ok) return archetypeRaw;
  const axis = parseAll(axisRaw.value.rows, parseAxisRow);
  const archetypes = parseAll(archetypeRaw.value.rows, parseArchetype);

  const liveRows = axis.rows.filter((r) => !isFixtureId(r.memberId));
  const fixtureRows = axis.rows.filter((r) => isFixtureId(r.memberId));
  const liveMembers = new Set(liveRows.map((r) => r.memberId));
  const fixtureMembers = new Set(fixtureRows.map((r) => r.memberId));
  const withArchetype = new Set(archetypes.rows.map((a) => a.memberId));

  const mismatch = new Set(axis.rows.filter(tierMixWithoutEvents).map((r) => r.memberId));
  const everyone = new Set(axis.rows.map((r) => r.memberId));
  const disagree = [...everyone].filter((m) => isFixtureId(m) !== mismatch.has(m)).length;

  const liveMix = sumTiers(liveRows);
  const fixtureMix = sumTiers(fixtureRows);
  const topicSet = new Set(liveRows.filter((r) => r.hasTopicPhase).map((r) => r.axis));

  return {
    ok: true,
    quality: quality([
      { raw: axisRaw.value, parsed: axis },
      { raw: archetypeRaw.value, parsed: archetypes },
    ]),
    value: {
      liveMix,
      liveUnits: unitsOf(liveMix),
      fixtureMix,
      fixtureUnits: unitsOf(fixtureMix),
      absentLive: TIER_IDS.filter((t) => liveMix[t] === 0),
      texture: texture(liveMix),
      events: liveRows.reduce((sum, r) => sum + r.eventCount, 0),
      graduationsLive: liveRows.reduce((sum, r) => sum + r.graduations, 0),
      graduationsFixture: fixtureRows.reduce((sum, r) => sum + r.graduations, 0),
      liveContributors: liveMembers.size,
      fixtureContributors: fixtureMembers.size,
      liveRows: liveRows.length,
      topicRows: liveRows.filter((r) => r.hasTopicPhase).length,
      topicAxes: PILLAR_IDS.filter((p) => topicSet.has(p)),
      liveWithArchetype: [...liveMembers].filter((m) => withArchetype.has(m)).length,
      fixtures: { byPrefix: fixtureMembers.size, byMismatch: mismatch.size, disagree },
      unknownTierKeys: [...new Set(axis.rows.flatMap((r) => r.unknownTierKeys))].sort(),
    },
  };
}

function streamFreshness<T>(
  raw: Loaded<RowSet>,
  parse: (row: unknown) => T | null,
  keep: (row: T) => boolean,
  at: (row: T) => number,
  now: number,
): Freshness {
  if (!raw.ok) return { kind: 'failed', failure: raw.failure };
  const rows = parseAll(raw.value.rows, parse).rows.filter(keep);
  return freshness(newest(rows.map(at)), now);
}

function buildMembership(raw: Loaded<RowSet>): View['membership'] {
  if (!raw.ok) return raw;
  const parsed = parseAll(raw.value.rows, parseProfile);
  const members = parsed.rows.filter((p) => !p.isSeed);
  const underwriters = members.filter((p) => p.tier === 'pro');
  const charterWriters = members.filter((p) => p.isCharter && p.isGifted && !p.giftExpires).length;
  const giftedWithExpiry = members.filter((p) => !p.isCharter && p.isGifted && p.giftExpires).length;
  return {
    ok: true,
    quality: quality([{ raw: raw.value, parsed }]),
    value: {
      profiles: members.length,
      fixtureProfiles: parsed.rows.length - members.length,
      underwriters: underwriters.length,
      underwritersBy: {
        system: underwriters.filter((p) => p.setBy === 'system').length,
        member: underwriters.filter((p) => p.setBy === 'member').length,
        unset: underwriters.filter((p) => p.setBy === 'unset').length,
      },
      charterWriters,
      charterUnderwriters: members.filter((p) => p.isCharter && !p.isGifted).length,
      giftedWithExpiry,
      undocumentedGifts: members.filter((p) => p.isGifted).length - charterWriters - giftedWithExpiry,
      signedPact: members.filter((p) => p.signedPact).length,
      signedAuthors: members.filter((p) => p.signedPact && p.isAuthor).length,
    },
  };
}

export function buildView(raw: RawAnalytics, now: number): View {
  const comment = streamFreshness(raw.comments, parseComment, (c) => !isFixtureId(c.memberId), (c) => c.createdAt, now);
  const article = streamFreshness(raw.articles, parseArticle, (a) => !isFixtureId(a.authorId), (a) => a.createdAt, now);
  const follow = streamFreshness(raw.lastFollow, parseFollow, (f) => !isFixtureId(f.followerId), (f) => f.createdAt, now);
  const engine = streamFreshness(raw.axis, parseAxisRow, (r) => !isFixtureId(r.memberId), (r) => r.lastUpdated, now);

  const streams = [comment, article, follow, engine];
  let allStoppedSince: View['activity']['allStoppedSince'] = null;
  if (streams.every((s) => s.kind !== 'failed') && !streams.some((s) => s.kind === 'at' && s.live)) {
    const latest = newest(streams.flatMap((s) => (s.kind === 'at' ? [s.at] : [])));
    if (latest !== null) allStoppedSince = { at: latest, days: Math.floor((now - latest) / DAY) };
  }

  return {
    now,
    activity: { comment, article, follow, engine, allStoppedSince },
    comments: buildComments(raw.comments, now),
    articles: buildArticles(raw.articles),
    engine: buildEngine(raw.axis, raw.archetypes),
    membership: buildMembership(raw.profiles),
    closed: CLOSED.map((entry) => ({ entry, verdict: verdict(entry, raw.probes[entry.table]) })),
  };
}
