import type { Metadata } from 'next';
import { getPublishedArticles, isSupabaseConfigured, type ArticleSummary } from '@/lib/articles';
import { ArticleCard } from '@/components/content/article-card';
import { JoinCta } from '@/components/content/join-cta';
import { Rich } from '@/components/content/rich';
import { isSignedIn } from '@/components/content/session';
import s from '@/components/content/feed.module.css';
import { strings } from '@/strings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: strings.content.articlesIndex.title,
  description: strings.content.articlesIndex.lede,
};

/**
 * The article index: _theme/page-articles.hbs. The same feed as the front page
 * under "The Library" hero, with the join card for visitors ({{#unless
 * @member}}). The live page asked Ghost for 50; so does this.
 *
 * Only this file is the content builder's. app/articles/[slug]/ is the
 * article page and belongs to the discourse builder.
 */
export default async function ArticlesPage() {
  const t = strings.content.articlesIndex;
  const configured = isSupabaseConfigured();
  let articles: ArticleSummary[] = [];
  let signedIn = false;
  if (configured) {
    [articles, signedIn] = await Promise.all([getPublishedArticles(50), isSignedIn()]);
  }

  return (
    <main className={s.main}>
      <div className={s.column}>
        <header className={s.hero}>
          <div className={s.heroEyebrow}>{t.eyebrow}</div>
          <h1 className={s.heroTitle}>
            <Rich text={t.heading} />
          </h1>
          <p className={s.heroLede}>{t.lede}</p>
          <div className={s.heroRule} aria-hidden="true" />
        </header>
        <div className={s.feed}>
          {!configured ? (
            <p className="notice">{strings.notices.supabaseNotConfigured}</p>
          ) : articles.length === 0 ? (
            <p className={s.empty}>{strings.notices.noArticlesYet}</p>
          ) : (
            articles.map((article) => <ArticleCard key={article.id} article={article} />)
          )}
          {signedIn ? null : <JoinCta />}
        </div>
      </div>
    </main>
  );
}
