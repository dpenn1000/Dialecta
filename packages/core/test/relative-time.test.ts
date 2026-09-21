import { describe, expect, it } from 'vitest';
import {
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  WEEK_MS,
  relativeTimeParts,
  type RelativeTimeParts,
} from '../src/relative-time';

const NOW = Date.parse('2026-09-21T12:00:00.000Z');

function ago(ms: number): string {
  return new Date(NOW - ms).toISOString();
}

describe('relativeTimeParts', () => {
  it.each([
    ['right now', 0, { unit: 'now', count: 0 }],
    ['59 seconds ago', 59_000, { unit: 'now', count: 0 }],
    ['exactly one minute ago', MINUTE_MS, { unit: 'minutes', count: 1 }],
    ['3 minutes ago', 3 * MINUTE_MS, { unit: 'minutes', count: 3 }],
    ['59 minutes ago', 59 * MINUTE_MS, { unit: 'minutes', count: 59 }],
    ['exactly one hour ago', HOUR_MS, { unit: 'hours', count: 1 }],
    ['5 hours ago', 5 * HOUR_MS, { unit: 'hours', count: 5 }],
    ['23 hours ago', 23 * HOUR_MS, { unit: 'hours', count: 23 }],
    ['exactly one day ago', DAY_MS, { unit: 'days', count: 1 }],
    ['6 days ago', 6 * DAY_MS, { unit: 'days', count: 6 }],
    ['exactly one week ago', WEEK_MS, { unit: 'weeks', count: 1 }],
    ['2 weeks ago', 2 * WEEK_MS, { unit: 'weeks', count: 2 }],
  ] satisfies Array<[string, number, RelativeTimeParts]>)('%s -> %j', (_label, elapsed, expected) => {
    expect(relativeTimeParts(ago(elapsed), NOW)).toEqual(expected);
  });

  it('keeps counting in weeks past five weeks, unlike the prior port', () => {
    // The regression this guards: a fifth bucket that fell back to an
    // absolute date past 5 weeks, which is what put local out of step with
    // live (REPORT.md Regression 6, both live comments read "20w ago").
    expect(relativeTimeParts(ago(6 * WEEK_MS), NOW)).toEqual({ unit: 'weeks', count: 6 });
    expect(relativeTimeParts(ago(20 * WEEK_MS), NOW)).toEqual({ unit: 'weeks', count: 20 });
  });

  it('matches the live comment this was measured against: ~20 weeks reads as 20w', () => {
    // council/designer/research/2026-09-21-live-vs-localhost/REPORT.md:
    // both comments on /on-the-far-shore-of-fear read "20w ago" on live.
    // The comments were posted 2026-04-29 and 2026-04-30; checked against
    // the report's own audit date, 2026-09-21.
    expect(relativeTimeParts('2026-04-30T12:00:00.000Z', NOW)).toEqual({ unit: 'weeks', count: 20 });
    expect(relativeTimeParts('2026-04-29T12:00:00.000Z', NOW)).toEqual({ unit: 'weeks', count: 20 });
  });

  it('has no upper bound: a year-old comment still counts in weeks', () => {
    expect(relativeTimeParts(ago(52 * WEEK_MS), NOW)).toEqual({ unit: 'weeks', count: 52 });
    expect(relativeTimeParts(ago(200 * WEEK_MS), NOW)).toEqual({ unit: 'weeks', count: 200 });
  });

  it('clamps a future or clock-skewed timestamp to "now" rather than going negative', () => {
    expect(relativeTimeParts(ago(-5_000), NOW)).toEqual({ unit: 'now', count: 0 });
    expect(relativeTimeParts(ago(-WEEK_MS), NOW)).toEqual({ unit: 'now', count: 0 });
  });

  it('returns null for a timestamp that does not parse', () => {
    expect(relativeTimeParts('not a date', NOW)).toBeNull();
    expect(relativeTimeParts('', NOW)).toBeNull();
  });
});
