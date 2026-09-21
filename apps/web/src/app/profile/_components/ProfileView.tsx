/**
 * The whole profile, assembled on the server from what loadProfilePage read.
 * Order of the recovered page: hero, tabs, then the feed on every tab.
 *
 * No header and no footer of its own: the site shell in app/layout.tsx owns
 * both. The recovered component drew its own two-bar nav when mounted with
 * chrome, and its own footer line; neither is ported.
 */
import { strings } from '@/strings';
import type { ProfilePageData } from '../_lib/data';
import { displayName, initialsOf, totalGraduations } from '../_lib/view';
import { Feed } from './Feed';
import { Hero } from './Hero';
import { AboutPane, ArticlesPane, EngagementPane, InfluencesPane } from './panes';
import { ProfileTabs, type TabSpec } from './ProfileTabs';
import styles from './profile.module.css';

const S = strings.profile;

export function ProfileView({ data, initialTab, dev }: { data: ProfilePageData; initialTab: string; dev: boolean }) {
  const p = data.profile;
  const name = displayName(p.displayName);
  const showArticles = p.isAuthor || data.articles.length > 0;
  const graduations = data.fingerprintStatus === 'ok' ? totalGraduations(data.fingerprint) : null;
  // One instant per render, so every "3d ago" on the page is measured from the same clock.
  const now = Date.now();

  const tabs: TabSpec[] = [
    {
      key: 'engagement',
      label: S.tabs.engagement,
      content: (
        <EngagementPane
          commentCount={data.commentCount}
          graduations={graduations}
          articleCount={data.articles.length}
          connections={data.connections}
          comments={data.comments}
        />
      ),
    },
    { key: 'about', label: S.tabs.about, content: <AboutPane profile={p} isOwn={data.isOwnProfile} /> },
    { key: 'influences', label: S.tabs.influences, content: <InfluencesPane profile={p} isOwn={data.isOwnProfile} /> },
    ...(showArticles
      ? [{ key: 'articles', label: S.tabs.articles, content: <ArticlesPane articles={data.articles} /> }]
      : []),
  ];

  return (
    <main className={styles.page}>
      <Hero data={data} dev={dev} />
      <ProfileTabs tabs={tabs} initial={initialTab} label={S.tabsLabel} />
      <Feed
        name={name}
        avatarUrl={p.avatarUrl}
        initials={initialsOf(p.displayName)}
        articles={data.articles}
        events={data.feed}
        now={now}
      />
    </main>
  );
}
