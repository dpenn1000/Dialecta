import type { Metadata } from 'next';
import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/articles';
import { Rich } from '@/components/content/rich';
import { isSignedIn } from '@/components/content/session';
import { first } from '@/components/content/format';
import { getCommunityArticles, getContributor, getContributors, getFeedEvents } from '@/components/content/community/data';
import { Contributors } from '@/components/content/community/contributors';
import { FeedView, isFeedType } from '@/components/content/community/feed-view';
import { AuthorView } from '@/components/content/community/author-view';
import { communityHref } from '@/components/content/community/parts';
import leaf from '@/components/content/leaf.module.css';
import s from '@/components/content/community/community.module.css';
// The tier badge's styles; the badge itself is the discourse layer's.
import '@/components/discourse/discourse.css';
import { strings } from '@/strings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: strings.content.community.title,
  description: strings.content.community.description,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface CommunityPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Community: _theme/page-community.hbs mounted dialecta-community.jsx, the
 * Feed / Contributors / Author View shell. The Council ruled every one of its
 * files Adapted (council/log/2026-09-20-port-or-rewrite.md); the mount itself
 * is Rewritten, and this page is that rewrite.
 *
 * The URL contract is the recovered shell's, rendered on the server:
 *   /community                    Contributors for a visitor, Feed signed in
 *   /community?tab=contributors   Contributors
 *   /community?tab=feed           Feed
 *   /community?author=<id>        Author View, where the id is profiles.id
 */
export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  const t = strings.content.community;

  if (!isSupabaseConfigured()) {
    return (
      <main className={leaf.main}>
        <div className={s.page}>
          <p className="notice">{strings.notices.supabaseNotConfigured}</p>
        </div>
      </main>
    );
  }

  const author = first(params.author);
  if (author) return <AuthorPage id={author} params={params} />;

  const tabParam = first(params.tab);
  const tab =
    tabParam === 'feed' || tabParam === 'contributors' ? tabParam : (await isSignedIn()) ? 'feed' : 'contributors';

  return (
    <main className={leaf.main}>
      <div className={s.page}>
        <header className={`${leaf.hero} ${leaf.heroCompact}`}>
          <div className={leaf.heroEyebrow}>{t.eyebrow}</div>
          <h1 className={`${leaf.heroTitle} ${leaf.heroTitleCommunity}`}>
            <Rich text={t.heading} />
          </h1>
          <p className={`${leaf.heroLede} ${leaf.heroLedeCommunity}`}>
            {tab === 'contributors' ? t.subtitleContributors : t.subtitleFeed}
          </p>
        </header>

        <nav className={s.tabs} aria-label={t.tabs.aria}>
          <Link href={communityHref({ tab: 'feed' })} className={s.tab} aria-current={tab === 'feed' ? 'page' : undefined}>
            {t.tabs.feed}
          </Link>
          <Link
            href={communityHref({ tab: 'contributors' })}
            className={s.tab}
            aria-current={tab === 'contributors' ? 'page' : undefined}
          >
            {t.tabs.contributors}
          </Link>
        </nav>

        {tab === 'contributors' ? <ContributorsTab params={params} /> : <FeedTab params={params} />}
      </div>
    </main>
  );
}

type Params = Record<string, string | string[] | undefined>;

async function ContributorsTab({ params }: { params: Params }) {
  try {
    const contributors = await getContributors();
    return (
      <Contributors
        contributors={contributors}
        filters={{
          q: first(params.q) ?? '',
          archetype: first(params.archetype) ?? null,
          order: first(params.order) ?? null,
          sort: first(params.sort) === 'archetype' ? 'archetype' : 'name',
        }}
      />
    );
  } catch (error) {
    console.error('[community] contributors', error);
    return <p className={s.error}>{strings.content.community.contributors.loadFailed}</p>;
  }
}

async function FeedTab({ params }: { params: Params }) {
  try {
    // The live _feed ranked its 20 most recent articles and kept 8.
    const [articles, events] = await Promise.all([getCommunityArticles({ limit: 8 }), getFeedEvents()]);
    const type = first(params.type);
    return (
      <FeedView
        articles={articles}
        events={events}
        filters={{
          type: isFeedType(type) ? type : null,
          topic: first(params.topic) ?? null,
          sort: first(params.sort) === 'newest' ? 'newest' : 'hot',
        }}
      />
    );
  } catch (error) {
    console.error('[community] feed', error);
    return <p className={s.error}>{strings.content.community.feed.loadFailed}</p>;
  }
}

async function AuthorPage({ id, params }: { id: string; params: Params }) {
  const t = strings.content.community.author;
  let body: React.ReactNode;
  if (!UUID_RE.test(id)) {
    body = <NoContributor message={t.notFound} />;
  } else {
    try {
      const [contributor, articles] = await Promise.all([
        getContributor(id),
        getCommunityArticles({ authorId: id, limit: 100 }),
      ]);
      body = contributor ? (
        <AuthorView
          contributor={contributor}
          articles={articles}
          filters={{ topic: first(params.topic) ?? null, tier: first(params.tier) ?? null }}
        />
      ) : (
        <NoContributor message={t.notFound} />
      );
    } catch (error) {
      console.error('[community] author', error);
      body = <NoContributor message={t.loadFailed} />;
    }
  }
  return <main className={leaf.main}>{body}</main>;
}

function NoContributor({ message }: { message: string }) {
  return (
    <div className={s.authorPage}>
      <p className={s.error}>{message}</p>
      <Link href={communityHref({ tab: 'contributors' })} className={s.back}>
        {strings.content.community.author.back}
      </Link>
    </div>
  );
}
