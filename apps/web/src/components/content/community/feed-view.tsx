/**
 * The Community feed: _recovered-next/lib/theme/dialecta-community-feed.jsx,
 * adapted (Council verdict). Server component.
 *
 * One stream of four kinds, per docs/Dialecta_Social_UX_Architecture.md:
 * articles, Thread Spotlights, Identity Events and Opinion Topology changes.
 * Topology was an empty list live (computation deferred to v1.5) and still is.
 *
 * What changed, and why:
 *  - The type, topic and sort chips filter on the server from the query
 *    string (type, topic, sort) rather than in browser state.
 *  - Hot was the API's order, and the API sorted the merged stream by recency
 *    ("strict reverse-chronological, which the user signed off on"), so Hot and
 *    Newest read the same here too. Both chips stay, as live.
 *  - The Hot score counted each article's comment tiers from classifications,
 *    which anon cannot read. Every article is "Recent article", and no card
 *    shows a comment count, until the score can be computed where it is allowed.
 *  - The Following cut needed the viewer's follow graph on a Ghost id; it waits
 *    for a session-scoped follow, like the directory's Follow button.
 *  - An event's subject is named from its payload when the payload carries a
 *    name, and falls back to the live wording ("A contributor") when it does
 *    not (data.ts has why).
 *  - The recovered renderer read payload keys the live rows never carried
 *    (toLabel, partner_name, aspiration); the six public rows hold
 *    new_archetype, other_name and archetype_label, so the live feed printed
 *    its fallbacks too. Both spellings are read here.
 *  - The author byline on an article card was a button that navigated to the
 *    profile by script inside a card-sized link. Here the title link stretches
 *    over the card and the byline is a real link above it, to
 *    /profile/<profiles.id>: valid HTML, no script.
 *  - The internal vocabulary philosopher flagged in the recovered file's
 *    comments ("dopamine-for-good engine", "primary viral unit") is not carried.
 */
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { TierBadge } from '@/components/discourse/tier-badge';
import { strings } from '@/strings';
import { topicFor } from '../format';
import type { CommunityArticle, FeedEvent, FeedEventPayload } from './data';
import { Avatar, ChipStrip, communityHref, relativeDate, type Chip } from './parts';
import s from './community.module.css';

type FeedType = 'article' | 'spotlight' | 'identity' | 'topology';
const FEED_TYPES: readonly FeedType[] = ['article', 'spotlight', 'identity', 'topology'];

export interface FeedFilters {
  type: FeedType | null;
  topic: string | null;
  sort: 'hot' | 'newest';
}

export function isFeedType(value: unknown): value is FeedType {
  return typeof value === 'string' && (FEED_TYPES as readonly string[]).includes(value);
}

type Item =
  | { kind: 'article'; at: string; article: CommunityArticle }
  | { kind: 'identity' | 'spotlight'; at: string; event: FeedEvent };

function text(payload: FeedEventPayload, key: string): string | undefined {
  const value = payload[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function subjectName(payload: FeedEventPayload): string | null {
  return text(payload, 'subject_name') ?? text(payload, 'display_name') ?? text(payload, 'member_name') ?? null;
}

export function FeedView({
  articles,
  events,
  filters,
}: {
  articles: CommunityArticle[];
  events: FeedEvent[];
  filters: FeedFilters;
}) {
  const t = strings.content.community.feed;
  const now = Date.now();

  const items: Item[] = [
    ...articles.map((article) => ({ kind: 'article' as const, at: article.publishedAt ?? '', article })),
    ...events.map((event) => ({
      kind: event.eventType === 'forum_thread_spotlight' ? ('spotlight' as const) : ('identity' as const),
      at: event.createdAt,
      event,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  // Topic chips come from the articles on the page, as live: only topics with
  // at least one article, and only when there are two or more.
  const topics = new Map<string, { label: string; color: string }>();
  for (const item of items) {
    if (item.kind !== 'article') continue;
    const topic = topicFor(item.article.topic);
    if (topic) topics.set(topic.slug, { label: topic.label, color: topic.color });
  }
  const topicChips: Chip[] = Array.from(topics, ([key, v]) => ({ key, label: v.label, topic: v.color }));

  const filtered = items.filter((item) => {
    if (filters.type && item.kind !== filters.type) return false;
    if (filters.topic && item.kind === 'article') return topicFor(item.article.topic)?.slug === filters.topic;
    return true;
  });

  const hrefWith = (change: Partial<{ type: string | null; topic: string | null; sort: string | null }>) => {
    const next = { ...filters, ...change };
    return communityHref({ tab: 'feed', type: next.type, topic: next.topic, sort: next.sort === 'newest' ? 'newest' : null });
  };

  const typeChips: Chip[] = FEED_TYPES.map((key) => ({ key, label: t.types[key] }));

  return (
    <div>
      <div className={`${s.filterPanel} dialecta-paper`}>
        <ChipStrip
          label={t.allTypes}
          allLabel={t.allTypes}
          items={typeChips}
          active={filters.type}
          hrefFor={(key) => hrefWith({ type: key })}
        />
        {topicChips.length > 1 ? (
          <ChipStrip
            label={t.allTopics}
            allLabel={t.allTopics}
            items={topicChips}
            active={filters.topic}
            hrefFor={(key) => hrefWith({ topic: key })}
          />
        ) : null}
        <ChipStrip
          label={t.hot}
          allLabel={t.hot}
          items={[{ key: 'newest', label: t.newest }]}
          active={filters.sort === 'newest' ? 'newest' : null}
          hrefFor={(key) => hrefWith({ sort: key })}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={s.empty}>{filters.type || filters.topic ? t.noMatch : t.quiet}</p>
      ) : (
        <ul className={s.feedList}>
          {filtered.map((item) => (
            <li key={item.kind === 'article' ? item.article.id : item.event.id}>
              {item.kind === 'article' ? (
                <ArticleItem article={item.article} now={now} />
              ) : item.kind === 'spotlight' ? (
                <SpotlightItem event={item.event} />
              ) : (
                <IdentityItem event={item.event} now={now} />
              )}
            </li>
          ))}
        </ul>
      )}

      {items.every((i) => i.kind === 'article') ? <p className={s.growing}>{t.growing}</p> : null}
    </div>
  );
}

function ArticleItem({ article, now }: { article: CommunityArticle; now: number }) {
  const t = strings.content.community.feed;
  const topic = topicFor(article.topic);
  return (
    <article className={`${s.card} dialecta-paper dialecta-wood-frame`}>
      <div className={s.eyebrow}>{t.recent}</div>
      <div className={s.metaRow}>
        {topic ? (
          <span className={s.topicChip} style={{ '--topic': topic.color } as CSSProperties}>
            {topic.label}
          </span>
        ) : null}
        <span className={s.when}>{relativeDate(article.publishedAt, now)}</span>
        {article.tier ? (
          <span className={s.badgeRight}>
            <TierBadge tier={article.tier} size="sm" />
          </span>
        ) : null}
      </div>
      <h3 className={s.cardTitle}>
        <Link href={`/articles/${article.slug}`} className={s.stretched}>
          {article.title}
        </Link>
      </h3>
      {article.author ? (
        <div className={s.cardFoot}>
          <Link href={`/profile/${article.author.id}`} className={s.byline}>
            <Avatar name={article.author.displayName} url={null} size={28} />
            <span className={s.bylineName}>{article.author.displayName}</span>
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function IdentityItem({ event, now }: { event: FeedEvent; now: number }) {
  const t = strings.content.community.feed;
  const p = event.payload;
  const who = subjectName(p);
  const events = t.events;
  let eyebrow: string = t.genericEvent;
  let headline: string;
  switch (event.eventType) {
    case 'archetype_shift':
      ({ eyebrow } = events.archetype_shift);
      headline = events.archetype_shift.headline(who, text(p, 'toLabel') ?? text(p, 'new_archetype'));
      break;
    case 'fingerprint_milestone':
      ({ eyebrow } = events.fingerprint_milestone);
      headline = events.fingerprint_milestone.headline(who, text(p, 'pillar'), text(p, 'threshold') ?? numberText(p, 'threshold'));
      break;
    case 'sparring_partner_recognized':
      ({ eyebrow } = events.sparring_partner_recognized);
      headline = events.sparring_partner_recognized.headline(who, partnerOf(p));
      break;
    case 'sparring_partner_archetype_shift':
      ({ eyebrow } = events.sparring_partner_archetype_shift);
      headline = events.sparring_partner_archetype_shift.headline(who, text(p, 'toLabel') ?? text(p, 'new_archetype'));
      break;
    case 'aspiration_declared':
      ({ eyebrow } = events.aspiration_declared);
      headline = events.aspiration_declared.headline(who, text(p, 'aspiration') ?? text(p, 'archetype_label'));
      break;
    case 'recommitment':
      ({ eyebrow } = events.recommitment);
      headline = events.recommitment.headline(who, text(p, 'aspiration') ?? text(p, 'archetype_label'));
      break;
    case 'first_forum_comment':
      ({ eyebrow } = events.first_forum_comment);
      headline = events.first_forum_comment.headline(who);
      break;
    case 'new_reader':
      ({ eyebrow } = events.new_reader);
      headline = events.new_reader.headline(who, text(p, 'reader_name'));
      break;
    case 'correspondent_established':
      ({ eyebrow } = events.correspondent_established);
      headline = events.correspondent_established.headline(who, partnerOf(p));
      break;
    case 'source_milestone':
      ({ eyebrow } = events.source_milestone);
      headline = events.source_milestone.headline(who, text(p, 'milestone'));
      break;
    case 'delta_acknowledged_published':
      ({ eyebrow } = events.delta_acknowledged_published);
      headline = events.delta_acknowledged_published.headline(who);
      break;
    default:
      headline = t.genericHeadline(who, event.eventType.replace(/_/g, ' '));
  }
  const subline = text(p, 'subline');

  return (
    <div className={`${s.card} ${s.cardStatic} dialecta-paper`}>
      <div className={s.eyebrow}>{eyebrow}</div>
      <div className={s.eventRow}>
        <Avatar name={who} url={null} size={42} />
        <div className={s.eventBody}>
          <p className={s.headline}>{headline}</p>
          {subline ? <p className={s.subline}>{subline}</p> : null}
          <div className={s.eventWhen}>{relativeDate(event.createdAt, now)}</div>
        </div>
      </div>
    </div>
  );
}

/** The recovered renderer read partner_name; the rows the live pipeline wrote carry other_name. */
function partnerOf(payload: FeedEventPayload): string | undefined {
  return text(payload, 'partner_name') ?? text(payload, 'other_name');
}

function numberText(payload: FeedEventPayload, key: string): string | undefined {
  const value = payload[key];
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : undefined;
}

interface ExchangeComment {
  author: string;
  body: string;
}

function exchangeOf(payload: FeedEventPayload): ExchangeComment[] {
  const raw = payload.exchange;
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 3).flatMap((c: unknown) => {
    if (!c || typeof c !== 'object') return [];
    const row = c as Record<string, unknown>;
    const body = typeof row.body === 'string' ? row.body : '';
    if (!body) return [];
    return [{ author: typeof row.author_name === 'string' && row.author_name ? row.author_name : '', body }];
  });
}

function SpotlightItem({ event }: { event: FeedEvent }) {
  const t = strings.content.community.feed;
  const p = event.payload;
  const exchange = exchangeOf(p);
  const title = text(p, 'article_title');
  const slug = text(p, 'article_slug') ?? slugFromUrl(text(p, 'article_url'));
  return (
    <div
      className={`${s.card} ${s.cardAccent} dialecta-paper dialecta-wood-frame`}
      style={{ '--accent': 'var(--brass-bright)' } as CSSProperties}
    >
      <div className={`${s.eyebrow} ${s.eyebrowBrass}`}>{t.spotlight}</div>
      {title ? <p className={s.spotlightOn}>{t.spotlightOn(title)}</p> : null}
      {exchange.length > 0 ? (
        <div className={s.exchange}>
          {exchange.map((c, i) => (
            <div key={i} className={s.exchangeItem}>
              <div className={s.exchangeHead}>
                <span className={s.exchangeName}>{c.author || t.spotlightAuthor}</span>
                <TierBadge tier="forum" size="sm" />
              </div>
              <p className={s.exchangeBody}>{c.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className={s.spotlightFallback}>{text(p, 'headline') ?? t.spotlightFallback}</p>
      )}
      <div className={s.joinThread}>
        {slug ? (
          <Link href={`/articles/${slug}`} className={s.stretched}>
            {t.joinThread}
          </Link>
        ) : (
          t.joinThread
        )}
      </div>
    </div>
  );
}

/** The live payload linked a Ghost URL (dialecta.org/<slug>/); here an article lives at /articles/<slug>. */
function slugFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const last = new URL(url, 'https://dialecta.org').pathname.split('/').filter(Boolean).pop();
    return last && /^[a-z0-9-]+$/.test(last) ? last : undefined;
  } catch {
    return undefined;
  }
}
