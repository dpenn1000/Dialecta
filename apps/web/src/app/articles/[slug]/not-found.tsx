import Link from 'next/link';
import { strings } from '@/strings';
import './article.css';

/** Rendered with HTTP 404 when page.tsx calls notFound() for an unknown slug. */
export default function ArticleNotFound() {
  return (
    <main className="dialecta-wide">
      <article className="dialecta-sheet dialecta-article">
        <div className="dialecta-meta dialecta-breadcrumb">
          <Link href="/">{strings.articlePage.breadcrumb}</Link>
        </div>
        <h1 className="dialecta-article-title article-title">{strings.articlePage.notFoundHeading}</h1>
        <p className="dialecta-lede">{strings.notices.articleNotFound}</p>
      </article>
    </main>
  );
}
