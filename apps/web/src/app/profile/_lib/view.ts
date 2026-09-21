/**
 * Pure derivations the profile's server components share: names, captions,
 * dates, the order badge. No I/O and no React. Every string a person reads
 * comes from strings.ts; this file only chooses between them.
 */
import { GRADUATION_CAP, PILLAR_IDS, pillarName, type Axis, type FingerprintData } from '@dialecta/core';
import { TOPIC_LIST } from '@/lib/topics';
import { strings } from '@/strings';

const S = strings.profile;

export function displayName(name: string | null): string {
  return name ?? S.unnamed;
}

/** Up to two initials from the display name, as the recovered merge did. */
export function initialsOf(name: string | null): string {
  if (!name) return '?';
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return letters || '?';
}

export interface AxisCount {
  axis: Axis;
  name: string;
  graduations: number;
}

/** Axes with at least one graduation, most first, ties in pillar order. */
export function rankedAxes(data: FingerprintData): AxisCount[] {
  return PILLAR_IDS.map((axis) => ({ axis, name: pillarName(axis), graduations: data[axis]?.graduations ?? 0 }))
    .filter((a) => a.graduations > 0)
    .sort((a, b) => b.graduations - a.graduations);
}

export function totalGraduations(data: FingerprintData): number {
  return PILLAR_IDS.reduce((sum, axis) => sum + Math.min(GRADUATION_CAP, data[axis]?.graduations ?? 0), 0);
}

/**
 * The line under the fingerprint title. States counts rather than grading them.
 * A fingerprint with no graduations gets the seed line, since the seed state is
 * what nearly every visitor sees and it deserves words of its own.
 */
export function fingerprintCaption(data: FingerprintData, readable: boolean): string {
  if (!readable) return S.caption.unavailable;
  const ranked = rankedAxes(data);
  const [first, second] = ranked;
  if (first && second) return S.caption.two(first.name, first.graduations, second.name, second.graduations);
  if (first) return S.caption.one(first.name, first.graduations);
  return S.caption.newborn;
}

/** The accessible description of the whole mark, pillar by pillar. */
export function fingerprintLabel(name: string, data: FingerprintData): string {
  const ranked = rankedAxes(data);
  if (ranked.length === 0) return S.fingerprint.aria(name, S.fingerprint.newborn);
  const list = PILLAR_IDS.map((axis) => S.fingerprint.pillar(pillarName(axis), data[axis]?.graduations ?? 0)).join(
    ', ',
  );
  return S.fingerprint.aria(name, S.fingerprint.summary(list));
}

export interface OrderDisplay {
  label: string;
  ornament: string | null;
  family: string | null;
}

/**
 * The profile row stores an Order's label and family key; the ornament and
 * the family's display label come from strings.ts by id. An Order id the table
 * does not know still renders, from the stored label, with no ornament.
 */
export function orderDisplay(
  order: { id: string; label: string | null; family: string | null } | null,
): OrderDisplay | null {
  if (!order) return null;
  const known = (S.orders as Record<string, { label: string; family: string; ornament: string }>)[order.id];
  const familyKey = order.family ?? known?.family ?? null;
  const family = familyKey ? ((S.orderFamilies as Record<string, string>)[familyKey] ?? null) : null;
  const label = order.label ?? known?.label;
  if (!label) return null;
  return { label, ornament: known?.ornament ?? null, family };
}

/** "Mar 1, 2026". UTC, so the server's zone cannot move the day. */
export function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/**
 * "April 2026", for the "Joined" line. Same month/year format live uses
 * (home.js: `toLocaleDateString("en-US",{month:"long",year:"numeric"})`),
 * pinned to UTC like shortDate so the server's zone cannot move the month.
 */
export function joinedDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** The recovered feedTimeAgo, against a clock the caller passes so a render is one instant. */
export function timeAgo(iso: string | null, now: number): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const mins = Math.floor((now - t) / 60000);
  const A = S.feed.ago;
  if (mins < 1) return A.now;
  if (mins < 60) return A.minutes(mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return A.hours(hrs);
  const days = Math.floor(hrs / 24);
  if (days < 7) return A.days(days);
  return A.weeks(Math.floor(days / 7));
}

/**
 * A stable colour for something with no colour of its own: a book with no
 * cover, a field note with no photo. Drawn from the topic palette, so the
 * shelf stays inside the site's own colours; the recovered hashColor kept a
 * separate eight-colour list for the same job.
 */
export function hashedColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return TOPIC_LIST[Math.abs(h) % TOPIC_LIST.length]?.color ?? 'var(--brass-mid)';
}
