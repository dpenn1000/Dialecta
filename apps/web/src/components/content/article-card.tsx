/**
 * One article in the feed: index.hbs's .post-card. Topic tag, title, excerpt,
 * then byline and date. Server component.
 *
 * Two live details do not come across. The reading time needs the body, which
 * getPublishedArticles() does not select, so it is left off rather than
 * guessed (the live card also printed it twice: "2 min read min read"). The
 * byline was a link to the author's profile; ArticleSummary carries the
 * author's name and no id, so here it is the name.
 */
import Link from 'next/link';
import type { ArticleSummary } from '@/lib/articles';
import { publishedDate, topicFor, topicStyle } from './format';
import s from './feed.module.css';

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const topic = topicFor(article.topic);
  const date = publishedDate(article.published_at);

  return (
    <article className={s.card}>
      {topic ? (
        <div className={s.tag} style={topicStyle(topic)}>
          {topic.label}
        </div>
      ) : null}
      <h2 className={s.title}>
        <Link href={`/articles/${article.slug}`} className={s.titleLink}>
          {article.title}
        </Link>
      </h2>
      {article.excerpt ? <p className={s.excerpt}>{article.excerpt}</p> : null}
      <div className={s.meta}>
        {article.author ? <span className={s.author}>{article.author.display_name}</span> : null}
        {article.author && date ? (
          <span className={s.metaSep} aria-hidden="true">
            ·
          </span>
        ) : null}
        {date ? <time dateTime={article.published_at ?? undefined}>{date}</time> : null}
      </div>
    </article>
  );
}
