/**
 * The Author View, /community?author=<profiles.id>:
 * _recovered-next/lib/theme/dialecta-community-author.jsx, adapted ("auth
 * rewritten"). Server component.
 *
 * The header card, then "Their Writing" with its topic and tier chips, then
 * the empty-state card for a contributor who has not published.
 *
 * What changed, and why:
 *  - Keyed by profiles.id, not the Ghost member id, which anon cannot read.
 *  - The Follow button is gone, for the reason the directory gives.
 *  - "Their Voice in the Conversation", up to ten Forum-tier comments, needs
 *    each comment's final tier from classifications, which anon cannot read.
 *    The live view rendered that section only when there were comments to
 *    show, so it is simply absent until the read exists.
 *  - The empty-state line kept "Follow to see their writing the moment it
 *    ships." for a signed-in viewer; with no Follow button, that half drops.
 */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { tierName, type Tier } from '@dialecta/core';
import { TierBadge } from '@/components/discourse/tier-badge';
import { strings } from '@/strings';
import { topicFor } from '../format';
import type { CommunityArticle, Contributor } from './data';
import { Avatar, ChipStrip, communityHref, shortDate, type Chip } from './parts';
import s from './community.module.css';

export interface AuthorFilters {
  topic: string | null;
  tier: string | null;
}

export function AuthorView({
  contributor,
  articles,
  filters,
}: {
  contributor: Contributor;
  articles: CommunityArticle[];
  filters: AuthorFilters;
}) {
  const t = strings.content.community.author;
  const c = strings.content.community.contributors;
  const name = contributor.displayName;

  const topics = new Map<string, Chip>();
  const tiers = new Map<Tier, Chip>();
  for (const a of articles) {
    const topic = topicFor(a.topic);
    if (topic) topics.set(topic.slug, { key: topic.slug, label: topic.label, topic: topic.color });
    // The live chips read TIER_BY_KEY[k].short: "Forum", not "The Forum".
    if (a.tier) tiers.set(a.tier, { key: a.tier, label: tierName(a.tier) });
  }
  const topicChips = Array.from(topics.values());
  const tierChips = Array.from(tiers.values());

  const filtered = articles.filter((a) => {
    if (filters.topic && topicFor(a.topic)?.slug !== filters.topic) return false;
    if (filters.tier && a.tier !== filters.tier) return false;
    return true;
  });

  const hrefWith = (change: Partial<AuthorFilters>) => {
    const next = { ...filters, ...change };
    return communityHref({ author: contributor.id, topic: next.topic, tier: next.tier });
  };

  return (
    <div className={s.authorPage}>
      <Link href={communityHref({ tab: 'contributors' })} className={s.back}>
        {t.back}
      </Link>

      <section className={`${s.authorHeader} dialecta-paper dialecta-wood-frame`} aria-labelledby="community-author-name">
        <div className={s.authorHeaderRow}>
          <Avatar name={name} url={contributor.avatarUrl} size={84} />
          <div className={s.contributorBody}>
            <h1 id="community-author-name" className={s.authorName}>
              {name ?? t.anonymous}
            </h1>
            {contributor.archetype || contributor.order ? (
              <div className={s.authorBadges}>
                {contributor.archetype ? <span className={s.archetypeChip}>{contributor.archetype.label}</span> : null}
                {contributor.order ? <span className={s.orderChip}>{c.orderChip(contributor.order.label)}</span> : null}
              </div>
            ) : null}
            {contributor.bio ? <p className={s.authorBio}>{contributor.bio}</p> : null}
            <Link href={`/profile/${contributor.id}`} className={s.profileLink}>
              {t.visitProfile}
            </Link>
          </div>
        </div>
      </section>

      <section className={s.section} aria-labelledby="community-author-writing">
        <div className={s.sectionHead}>
          <div className={s.sectionEyebrow}>{t.writingEyebrow}</div>
          <h2 id="community-author-writing" className={s.sectionTitle}>
            {articles.length > 0 ? t.articles : t.noArticles}
            {articles.length > 0 ? <span className={s.sectionCount}>{articles.length}</span> : null}
          </h2>
        </div>

        {articles.length > 0 && topicChips.length > 1 ? (
          <div className={s.chipGroup}>
            <ChipStrip
              large
              label={t.allTopics}
              allLabel={t.allTopics}
              items={topicChips}
              active={filters.topic}
              hrefFor={(key) => hrefWith({ topic: key })}
            />
          </div>
        ) : null}
        {articles.length > 0 && tierChips.length > 1 ? (
          <div className={s.chipGroup}>
            <ChipStrip
              large
              label={t.allTiers}
              allLabel={t.allTiers}
              items={tierChips}
              active={filters.tier}
              hrefFor={(key) => hrefWith({ tier: key })}
            />
          </div>
        ) : null}

        {articles.length > 0 ? (
          filtered.length > 0 ? (
            <ul className={s.feedList}>
              {filtered.map((a) => (
                <li key={a.id}>
                  <WritingCard article={a} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={s.empty}>{t.noMatch}</p>
          )
        ) : (
          <div className={`${s.noArticles} dialecta-paper`}>
            <p>{t.notPublished(name ?? t.thisContributor)}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function WritingCard({ article }: { article: CommunityArticle }) {
  const topic = topicFor(article.topic);
  return (
    <article className={`${s.writing} dialecta-paper dialecta-wood-frame`}>
      <div className={s.metaRow}>
        {topic ? (
          <span className={s.topicChip} style={{ '--topic': topic.color } as CSSProperties}>
            {topic.label}
          </span>
        ) : null}
        <span className={s.when}>{shortDate(article.publishedAt)}</span>
        {article.tier ? (
          <span className={s.badgeRight}>
            <TierBadge tier={article.tier} size="sm" />
          </span>
        ) : null}
      </div>
      <h3 className={s.writingTitle}>
        <Link href={`/articles/${article.slug}`} className={s.stretched}>
          {article.title}
        </Link>
      </h3>
      {article.excerpt ? <p className={s.writingExcerpt}>{article.excerpt}</p> : null}
    </article>
  );
}
