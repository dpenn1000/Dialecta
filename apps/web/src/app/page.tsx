import { getPublishedArticles, isSupabaseConfigured } from '@/lib/articles';
import { ArticleCard } from '@/components/content/article-card';
import { JoinCta } from '@/components/content/join-cta';
import { isSignedIn } from '@/components/content/session';
import s from '@/components/content/feed.module.css';
import { strings } from '@/strings';

export const dynamic = 'force-dynamic';

/**
 * The front page: _theme/index.hbs, visitor branch. The article feed, then the
 * join card for anyone not signed in.
 *
 * The live index had a second branch: a signed-in member saw their own profile
 * at the root, mounted by assets/js/home.js (_recovered-next/lib/theme/
 * home-page-mount.jsx). That surface is the profile builder's, at
 * /profile/[id], and a session cannot resolve to a profile until
 * profiles.user_id is set, so members get the feed here, without the join
 * card. Wiring the member branch is one redirect once identity lands.
 */
export default async function FrontPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className={s.main}>
        <div className={s.column}>
          <h1 className={s.srOnly}>{strings.content.articlesIndex.title}</h1>
          <p className="notice">{strings.notices.supabaseNotConfigured}</p>
        </div>
      </main>
    );
  }

  const [articles, signedIn] = await Promise.all([getPublishedArticles(), isSignedIn()]);

  return (
    <main className={s.main}>
      <div className={s.column}>
        <h1 className={s.srOnly}>{strings.content.articlesIndex.title}</h1>
        <div className={s.feed}>
          {articles.length === 0 ? (
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
