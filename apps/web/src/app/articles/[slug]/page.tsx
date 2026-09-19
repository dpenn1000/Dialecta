import { getPublishedArticle, isSupabaseConfigured } from '@/lib/articles';
import { strings } from '@/strings';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
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
      <article dangerouslySetInnerHTML={{ __html: article.body_html }} />
    </main>
  );
}
