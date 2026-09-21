/**
 * Small pieces the three Community views share: the avatar chip, the chip
 * strip, relative dates and the URL builder. Server components; every
 * control is a link, so the page's filters work without script.
 */
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { strings } from '@/strings';
import s from './community.module.css';

export type Params = Record<string, string | string[] | undefined>;

/** A /community URL from the parameters that are set; empty values drop out. */
export function communityHref(query: Record<string, string | null | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) qs.set(key, value);
  }
  const rendered = qs.toString();
  return `/community${rendered ? `?${rendered}` : ''}`;
}

/** The recovered files' computeInitials(): the first letters of the first two words. */
export function initialsOf(name: string | null): string {
  const parts = (name ?? '').split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || '?'
  );
}

/**
 * The avatar chip. The live chip painted a gradient of the contributor's top
 * two pillar colours, from axis_scores; those rows key on the Ghost member id,
 * which anon cannot join to a profile (data.ts), so every chip takes the live
 * NEUTRAL_COLOR (#7a7068), the colour the live API gave a contributor with no
 * graduations yet. An avatar_url wins, as live, when it is an https URL.
 */
export function Avatar({ name, url, size }: { name: string | null; url: string | null; size: number }) {
  // default.hbs isUsableAvatar(): a Gravatar default-blank URL is no avatar.
  const src = url && /^https:\/\//i.test(url) && !url.includes('d=blank') ? url : null;
  const style: CSSProperties = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  return (
    <span className={s.avatar} style={style} aria-hidden="true">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars come from any host a member used; next/image needs each host listed
        <img src={src} alt="" loading="lazy" decoding="async" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

/** The recovered relativeDate(). Server time; the page renders per request. */
export function relativeDate(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const r = strings.content.community.relative;
  const diff = Math.max(0, now - then);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return r.justNow;
  if (diff < hour) return r.minutes(Math.floor(diff / minute));
  if (diff < day) return r.hours(Math.floor(diff / hour));
  if (diff < 7 * day) return r.days(Math.floor(diff / day));
  if (diff < 30 * day) return r.weeks(Math.floor(diff / (7 * day)));
  if (diff < 365 * day) return r.months(Math.floor(diff / (30 * day)));
  return r.years(Math.floor(diff / (365 * day)));
}

/** The author view's formatDate(): "Apr 29, 2026". UTC, as the article page reads dates. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export interface Chip {
  key: string;
  label: string;
  /** A topic's colour; the active chip fills with it, mixed toward ink. */
  topic?: string | undefined;
}

/**
 * A strip of filter chips: the "All" chip first, then one per option. The
 * active chip carries aria-current. `hrefFor(null)` clears the filter.
 */
export function ChipStrip({
  label,
  allLabel,
  items,
  active,
  hrefFor,
  large = false,
}: {
  label: string;
  allLabel: string;
  items: readonly Chip[];
  active: string | null;
  hrefFor: (key: string | null) => string;
  large?: boolean;
}) {
  const base = large ? `${s.chip} ${s.chipLarge}` : s.chip;
  return (
    <ul className={s.chips} aria-label={label}>
      <li>
        <Link href={hrefFor(null)} scroll={false} className={base} aria-current={active === null ? 'true' : undefined}>
          {allLabel}
        </Link>
      </li>
      {items.map((item) => {
        const isActive = active === item.key;
        const style = item.topic ? ({ '--topic': item.topic } as CSSProperties) : undefined;
        return (
          <li key={item.key}>
            <Link
              href={hrefFor(isActive ? null : item.key)}
              scroll={false}
              className={item.topic ? `${base} ${s.chipTopic}` : base}
              style={style}
              aria-current={isActive ? 'true' : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
