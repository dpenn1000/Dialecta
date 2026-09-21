/**
 * "What's alive" under the tabs, on every tab. Ported from the Live Feed in
 * dialecta-profile.jsx and its ArticleFeedCard and IdentityEventCard.
 *
 * The recovered feed was the viewer's platform-wide stream from
 * /api/profile/_feed?viewer=<uuid>, the same on every profile. A public
 * profile with no viewer identity shows this contributor's own instead: their
 * published articles and the public feed_events about them, newest first.
 * The Thread Spotlight and Opinion Map cards are not ported, because nothing
 * produces either item type today.
 */
import Link from 'next/link';
import { TOPICS, isTopicSlug, topicLabel } from '@/lib/topics';
import { strings } from '@/strings';
import { payloadText, type ArticleRow, type FeedRow } from '../_lib/rows';
import { timeAgo } from '../_lib/view';
import styles from './profile.module.css';

const S = strings.profile;
const E = S.feed.event;

type Item = { kind: 'article'; at: number; article: ArticleRow } | { kind: 'event'; at: number; event: FeedRow };

function eventSentence(name: string, row: FeedRow): string {
  const p = (key: string) => payloadText(row.payload, key);
  switch (row.eventType) {
    case 'archetype_shift':
      return E.archetypeShift(name, p('previous_archetype'), p('new_archetype'));
    case 'fingerprint_milestone':
    case 'source_milestone':
      return E.milestone(name, p('pillar'), p('threshold'));
    case 'sparring_partner_recognized':
      return E.sparringRecognized(name, p('other_name'));
    case 'sparring_partner_archetype_shift':
      return E.sparringShift(name, p('other_name'));
    case 'aspiration_declared':
      return E.aspirationDeclared(name, p('archetype_label'));
    case 'recommitment':
      return E.recommitment(name);
    case 'first_forum_comment':
      return E.firstForum(name);
    case 'new_reader':
      return E.newReader(name, p('followee_name'));
    case 'correspondent_established':
      return E.correspondent(name, p('other_name'));
    case 'delta_acknowledged_published':
      return E.delta(name);
    default:
      return p('copy') ?? E.other(name);
  }
}

export function Feed({
  name,
  avatarUrl,
  initials,
  articles,
  events,
  now,
}: {
  name: string;
  avatarUrl: string | null;
  initials: string;
  articles: readonly ArticleRow[];
  events: readonly FeedRow[];
  now: number;
}) {
  const items: Item[] = [
    ...articles.map((article): Item => ({ kind: 'article', at: Date.parse(article.publishedAt ?? '') || 0, article })),
    ...events.map((event): Item => ({ kind: 'event', at: Date.parse(event.createdAt ?? '') || 0, event })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 12);

  return (
    <section className={styles.feed} aria-labelledby="profile-feed">
      <div className={styles.feedHead}>
        <h2 id="profile-feed" className={styles.feedTitle}>
          {S.feed.heading}
        </h2>
      </div>
      {items.length === 0 ? (
        <p className={styles.feedEmpty}>{S.feed.empty}</p>
      ) : (
        <ul className={styles.feedList}>
          {items.map((item) =>
            item.kind === 'article' ? (
              <li key={`a-${item.article.id}`}>
                <Link
                  href={`/articles/${item.article.slug}`}
                  className={`${styles.paperCard} ${styles.feedArticle}`}
                  style={
                    item.article.topic && isTopicSlug(item.article.topic)
                      ? { borderLeftColor: TOPICS[item.article.topic].color }
                      : undefined
                  }
                >
                  <h3 className={styles.feedArticleTitle}>{item.article.title ?? S.articles.untitled}</h3>
                  <div className={styles.articleMeta}>
                    {topicLabel(item.article.topic) ? (
                      <span className={styles.topicChip}>{topicLabel(item.article.topic)}</span>
                    ) : null}
                    <span>{S.feed.by(name)}</span>
                    <span>{timeAgo(item.article.publishedAt, now)}</span>
                  </div>
                </Link>
              </li>
            ) : (
              <li key={`e-${item.event.id}`} className={`${styles.paperCard} ${styles.feedIdentity}`}>
                <div className={styles.feedAvatar} aria-hidden="true">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- see bits.tsx Avatar
                    <img src={avatarUrl} alt="" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={styles.feedText}>{eventSentence(name, item.event)}</p>
                  <p className={styles.feedTime}>{timeAgo(item.event.createdAt, now)}</p>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
