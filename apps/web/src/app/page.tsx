import Link from 'next/link';
import { getPublishedArticles, isSupabaseConfigured } from '@/lib/articles';
import { strings } from '@/strings';

export const dynamic = 'force-dynamic';

export default async function FrontPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main>
        <h1>Dialecta</h1>
        <p>
          Front page placeholder. Implements the front page described in docs/Dialecta_Social_UX_Architecture.md
          and the site structure notes in docs/Dialecta_Project_Index.md.
        </p>
        <p className="notice">{strings.notices.supabaseNotConfigured}</p>
      </main>
    );
  }

  const articles = await getPublishedArticles();

  return (
    <main>
      <h1>Dialecta</h1>
      <p>
        Implements the front page described in docs/Dialecta_Social_UX_Architecture.md and the site structure
        notes in docs/Dialecta_Project_Index.md.
      </p>
      {articles.length === 0 ? (
        <p className="notice">{strings.notices.noArticlesYet}</p>
      ) : (
        <ul>
          {articles.map((a) => (
            <li key={a.id}>
              <h2>
                <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              </h2>
              {a.author ? <p>{a.author.display_name}</p> : null}
              {a.excerpt ? <p>{a.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
