import type { Metadata } from 'next';
import { getPublishedArticle, isSupabaseConfigured } from '@/lib/articles';
import { sanitizeArticleHtml } from '@/lib/sanitize-html';
import { strings } from '@/strings';
import { SITE_URL } from '@/lib/site';

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
  if (!article) {
    return (
      <main>
        <h1>Article not found</h1>
        <p className="notice">{strings.notices.articleNotFound}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{article.title}</h1>
      {article.author ? <p>{article.author.display_name}</p> : null}
      {article.excerpt ? <p>{article.excerpt}</p> : null}
      <p>
        Implements docs/Dialecta_Article_Editorial_Template.md and the Discourse Layer from
        docs/Dialecta_Discourse_Layer_UX.md.
      </p>
      {/*
        Sanitized immediately before render, with nothing in between (the
        mutation-XSS timing rule in lib/sanitize-html.ts). body_html is
        reachable through more than the editor: see that module's own
        comment for why storage cleanliness alone would not be enough here.
      */}
      <article dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.body_html) }} />
    </main>
  );
}
