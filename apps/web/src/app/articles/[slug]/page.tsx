import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedArticle, isSupabaseConfigured } from '@/lib/articles';
import { isOwnArticle } from '@/lib/article-ownership';
import { sanitizeArticleHtml } from '@/lib/sanitize-html';
import { topicLabel } from '@/lib/topics';
import { strings } from '@/strings';
import { SITE_URL } from '@/lib/site';

/** Ghost's own reading speed for {{reading_time}}. */
const WORDS_PER_MINUTE = 275;

function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** post.hbs used {{date format="MMMM D, YYYY"}}. UTC so the server's zone cannot move the day. */
function publishedDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * og:title/og:description/og:image and their Twitter equivalents: the
 * mechanical build circulation's research called simple and not in dispute
 * (council/circulation/research/2026-opengraph-and-x-card-share-surface.md).
 * twitter.card is set explicitly to 'summary' rather than left to infer,
 * because Next defaults an inferred card to 'summary_large_image' the
 * moment any image is present (checked directly against the installed
 * package: node_modules/next/dist/lib/metadata/resolvers/resolve-opengraph.js),
 * which is the exact format X has repeatedly stopped rendering a headline
 * on. og:image itself is not set here: the co-located opengraph-image.tsx
 * file convention supplies it, and Next inherits it into twitter.image
 * automatically since twitter.images is left unset below.
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    return {};
  }

  const article = await getPublishedArticle(slug);
  if (!article) {
    return {};
  }

  const url = `${SITE_URL}/articles/${article.slug}`;
  const description = article.excerpt ?? undefined;

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url,
      siteName: strings.site.name,
      publishedTime: article.published_at ?? undefined,
      authors: article.author ? [article.author.display_name] : undefined,
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main>
        <h1>Article</h1>
        <p>
          Article page placeholder for {slug}. Implements docs/Dialecta_Article_Editorial_Template.md and the
          Discourse Layer from docs/Dialecta_Discourse_Layer_UX.md.
        </p>
        <p className="notice">{strings.notices.supabaseNotConfigured}</p>
      </main>
    );
  }

  const article = await getPublishedArticle(slug);
  // A real 404, rendered by ./not-found.tsx. This branch used to return the
  // notice with HTTP 200, so a mistyped or deleted address looked like a page.
  if (!article) notFound();

  // Implements docs/Dialecta_Article_Editorial_Template.md and the Discourse
  // Layer from docs/Dialecta_Discourse_Layer_UX.md. That line used to render
  // on the page itself; it is a note for builders, so it lives here now.
  //
  // The layout is post.hbs's: breadcrumb, brass title, lede, byline, body, on
  // the same paper sheet the writer at /write drafts on. The spine, the tier
  // badge, the discourse chip and the author bio are not here yet.
  const own = await isOwnArticle(article.id);
  const topic = topicLabel(article.topic);
  const date = publishedDate(article.published_at);

  return (
    <main className="dialecta-wide">
      <article className="dialecta-sheet dialecta-article">
        <div className="dialecta-meta dialecta-breadcrumb">
          <Link href="/">{strings.articlePage.breadcrumb}</Link>
          {topic ? (
            <>
              <span aria-hidden="true" style={{ color: 'var(--brass-mid)' }}>
                ›
              </span>
              <span>{topic}</span>
            </>
          ) : null}
        </div>

        <h1 className="dialecta-article-title dialecta-brass">{article.title}</h1>

        {article.excerpt ? <p className="dialecta-lede">{article.excerpt}</p> : null}

        <div className="dialecta-meta dialecta-byline-row">
          {article.author ? <span className="dialecta-byline-name">{article.author.display_name}</span> : null}
          {date ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{date}</span>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <span>{strings.articlePage.readingTime(readingMinutes(article.body_html))}</span>
          {own ? (
            <>
              <span aria-hidden="true">·</span>
              <Link href={`/write?article=${article.id}`}>{strings.articlePage.revise}</Link>
            </>
          ) : null}
        </div>

        {/*
          Sanitized immediately before render, with nothing in between (the
          mutation-XSS timing rule in lib/sanitize-html.ts). body_html is
          reachable through more than the editor: see that module's own
          comment for why storage cleanliness alone would not be enough here.
        */}
        <div
          className="dialecta-reading dialecta-reading--article"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.body_html) }}
        />
      </article>
    </main>
  );
}
