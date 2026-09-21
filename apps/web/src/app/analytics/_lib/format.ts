/**
 * Display formatting. Fixed locale and fixed time zone, so a server render
 * reads the same wherever it runs.
 */
const DATE = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
const SHORT_DATE = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });

export function formatDate(t: number): string {
  return DATE.format(t);
}

export function formatShortDate(t: number): string {
  return SHORT_DATE.format(t);
}

/** 2026-09-21 04:12 UTC */
export function formatStamp(t: number): string {
  return `${new Date(t).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

/** A share of 0 to 1 as a whole percentage. A share above zero never rounds down to 0%. */
export function formatShare(x: number): string {
  if (x > 0 && x < 0.005) return 'under 1%';
  return `${Math.round(x * 100)}%`;
}

export function formatRatio(x: number): string {
  return x.toFixed(2);
}

/** Joins names the way a sentence does: "A", "A and B", "A, B and C". */
export function formatList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1] ?? ''}`;
}

export function cx(...names: readonly (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
