import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleSpine } from '@/components/article-spine/spine';
import { DiscourseSection, toArticleClaims } from '@/components/discourse/discourse-section';
import { getPublishedArticle, isSupabaseConfigured } from '@/lib/articles';
import { isOwnArticle } from '@/lib/article-ownership';
import { sanitizeArticleHtml } from '@/lib/sanitize-html';
import { topicLabel } from '@/lib/topics';
import { strings } from '@/strings';
import { SITE_URL } from '@/lib/site';
import './article.css';

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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
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
  // The layout is post.hbs's: the reading spine (src/components/article-spine,
  // steps 1 to 4 of the 2026-09-21 delta-mechanic port plan), then breadcrumb,
  // brass title, lede, byline, body, on the same paper sheet the writer at
  // /write drafts on, then "The Conversation": the discourse layer
  // (src/components/discourse), below the body on the same sheet, as post.hbs
  // placed #dialecta-comments. The article's own tier badge (the separate
  // #dialecta-tier-badge mount near the meta bar), the discourse byline chip
  // and the author bio section are not here yet.
  const own = await isOwnArticle(article.id);
  const topic = topicLabel(article.topic);
  const date = publishedDate(article.published_at);

  // ?composer=preview runs the comment composer's stages with nothing sent,
  // for checking the ritual without an account. Development only: a
  // production build never reads the parameter.
  const preview = process.env.NODE_ENV === 'development' && (await searchParams).composer === 'preview';

  return (
    <main className="dialecta-wide">
      {/*
        The reading-stage spine: sticky under the nav on desktop, fixed to
        the bottom on mobile. Sits outside the paper sheet, as it does on
        live (a full-width bar above the card, not inset inside it).
        Steps 1 to 4 of the architect's 2026-09-21 delta-mechanic port
        plan; see components/article-spine/spine.tsx for the full port
        note and what is deliberately not built yet (Reflect's own
        content, the placement island, Bio and Share's target sections).
      */}
      <ArticleSpine articleId={article.id} />

      <article className="dialecta-sheet dialecta-article">
        {/*
          post.hbs's figure.post-feature: the first element in the article,
          bled to the card's edges, above the breadcrumb and title (confirmed
          DOM order on dialecta.org, 2026-09-21: post-feature, post-breadcrumb,
          post-title). Inert today: article.feature_image is never selected
          (see the field's own comment in lib/articles.ts), so this renders
          nothing until that lands. A plain <img>, not next/image: the same
          call this app already made for a per-row image whose host is not
          fixed (Avatar, profile/_components/bits.tsx: "avatar_url points at
          Ghost, Gravatar and Supabase Storage, and next/image would need
          every one of them listed in next.config.ts"). Live serves this one
          from dialecta.org's Ghost today; ADR-001 retires Ghost, so whatever
          host this column holds once it exists should not be assumed fixed.
        */}
        {article.feature_image ? (
          <figure className="article-feature">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote host not fixed; see the comment above */}
            <img className="article-feature-image" src={article.feature_image} alt={article.title} />
          </figure>
        ) : null}

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

        <h1 className="dialecta-article-title article-title">{article.title}</h1>

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
          id="post-content"
          className="dialecta-reading dialecta-reading--article"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.body_html) }}
        />

        {/*
          End-of-body sentinel: what ArticleSpine's Declare overlay
          auto-opens against once it is 50% visible (post.hbs's own
          #post-content-end-sentinel, spine-client.tsx's IntersectionObserver).
          Zero visual footprint, placed where live places it: after the
          body, before the conversation.
        */}
        <div id="post-content-end-sentinel" aria-hidden="true" style={{ height: 1, width: 1 }} />

        {/*
          Rendered in the page's own HTML, not behind a Suspense boundary: a
          streamed boundary is revealed by a script, so a reader without
          JavaScript would see a loading line where the conversation is.
          loadDiscourse never throws, so a failed read cannot take the
          article down with it.
        */}
        <DiscourseSection
          article={{
            id: article.id,
            slug: article.slug,
            title: article.title,
            claims: toArticleClaims(article.declared_claims),
          }}
          preview={preview}
        />
      </article>
    </main>
  );
}
