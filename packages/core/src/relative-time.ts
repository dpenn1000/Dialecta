/**
 * Relative time for a timestamp: "3m ago", "20w ago". Pure bucket math only;
 * the words belong to whichever app renders them (apps/web keeps them in
 * strings.ts, under Editorial Voice).
 *
 * Ported from the recovered Discourse Layer's own relativeTime()
 * (_recovered-next/lib/theme/dialecta-discourse-layer.jsx), which is also
 * what dialecta.org runs today: minutes, hours, days, then weeks forever,
 * with no fallback to an absolute date. A prior port of that component
 * (apps/web/src/components/discourse/feed.tsx) added a fifth bucket that
 * fell back to a calendar date past five weeks; that is what put local's
 * comment timestamps out of step with live ("Apr 30, 2026" locally against
 * "20w ago" on dialecta.org for the same comment), the designer's
 * live-vs-localhost audit, Regression 6
 * (council/designer/research/2026-09-21-live-vs-localhost/REPORT.md). The
 * Discourse Layer UX spec (docs/Dialecta_Discourse_Layer_UX.md) names the
 * timestamp's type treatment ("DM Mono tertiary") and leaves the format
 * open, so this matches live rather than a spec requirement.
 *
 * `now` is a parameter, never `Date.now()` read in here, so this stays pure
 * and the caller controls what instant "now" means (the server's render
 * time on first paint, the browser's clock after hydration; see feed.tsx's
 * useNow()).
 */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;

export type RelativeTimeUnit = 'now' | 'minutes' | 'hours' | 'days' | 'weeks';

export interface RelativeTimeParts {
  unit: RelativeTimeUnit;
  /** Always 0 for 'now', which carries no count ("just now", not "0m ago"). */
  count: number;
}

/**
 * The bucket `iso` falls into as of `now`. Null when `iso` does not parse,
 * so the caller can render nothing rather than "Invalid Date".
 *
 * A negative gap (a clock-skewed or future timestamp) clamps to zero rather
 * than going negative, so a comment that just landed never reads "-1m ago".
 */
export function relativeTimeParts(iso: string, now: number): RelativeTimeParts | null {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diff = Math.max(0, now - t);

  if (diff < MINUTE_MS) return { unit: 'now', count: 0 };
  if (diff < HOUR_MS) return { unit: 'minutes', count: Math.floor(diff / MINUTE_MS) };
  if (diff < DAY_MS) return { unit: 'hours', count: Math.floor(diff / HOUR_MS) };
  if (diff < WEEK_MS) return { unit: 'days', count: Math.floor(diff / DAY_MS) };
  return { unit: 'weeks', count: Math.floor(diff / WEEK_MS) };
}
