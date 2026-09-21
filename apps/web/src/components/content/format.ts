/**
 * Shared formatting for the content pages.
 */
import type { CSSProperties } from 'react';
import { TOPICS, TOPIC_LIST, isTopicSlug, type Topic } from '@/lib/topics';

/** post.hbs and index.hbs used {{date format="MMMM D, YYYY"}}. UTC so the server's zone cannot move the day. */
export function publishedDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/**
 * articles.topic holds a slug for articles written in /write, and the label for
 * the five Ghost-era rows, which the site-crawl backfill copied verbatim
 * ("Psychology & Behavior"; supabase/migrations/20260921041504). Both resolve.
 */
export function topicFor(value: string | null | undefined): Topic | null {
  if (!value) return null;
  if (isTopicSlug(value)) return { slug: value, ...TOPICS[value] };
  const wanted = value.trim().toLowerCase();
  return TOPIC_LIST.find((t) => t.label.toLowerCase() === wanted) ?? null;
}

/**
 * The topic colour as a custom property. The CSS mixes it 72% toward ink
 * wherever it carries text: Economics (#b87a18) is a brass, and measures 3.5:1
 * as small type on the card paper, so every topic takes the same darkening
 * rather than one being singled out. Hue survives; contrast clears 4.5:1.
 */
export function topicStyle(topic: Topic): CSSProperties {
  return { '--topic': topic.color } as CSSProperties;
}

/** A query-string value, first of many if repeated. */
export function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
