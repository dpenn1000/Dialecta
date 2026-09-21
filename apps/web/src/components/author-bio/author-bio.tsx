/**
 * The author bio card (live's #post-author-bio), the editorial close at the
 * end of every article's body, where the spine's Bio segment points.
 * Ported from _theme/post.hbs:242-261, CSS from
 * _theme/assets/css/style.css:2974-3032.
 *
 * Live renders this twice: once server side from Ghost's primary_author,
 * then patched client side (the byline-override script) to the real
 * Supabase author when the article has one. This app reads the real author
 * directly at query time (lib/articles.ts's author_profile_id join), so
 * there is one render and no script.
 *
 * avatar_url is whatever profiles.avatar_url holds. On the live data this
 * ports (checked against all five published rows, 2026-09-21), every
 * author's avatar still points at Ghost's own image host
 * (www.dialecta.org/content/images/...), from before ADR-001 retired Ghost
 * as a content source; nothing in Supabase has replaced them yet. Rendered
 * as-is, same call this app already made for a per-row image whose host is
 * not fixed (profile/_components/bits.tsx's Avatar: a plain <img>, not
 * next/image).
 */
import { strings } from '@/strings';
import type { ArticleAuthorDetail } from '@/lib/articles';
import './author-bio.css';

const s = strings.authorBio;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return '?';
}

export function AuthorBio({ author }: { author: ArticleAuthorDetail | null }) {
  if (!author) return null;
  const name = author.display_name;

  return (
    <aside id="post-author-bio" className="post-author-bio">
      <div className="post-author-bio-avatar">
        {author.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote host not fixed; see the header comment
          <img className="post-author-bio-img" src={author.avatar_url} alt={name} />
        ) : (
          <span className="post-author-bio-initials" aria-hidden="true">
            {initials(name)}
          </span>
        )}
      </div>
      <div className="post-author-bio-text">
        <div className="post-author-bio-name">{name}</div>
        {author.bio ? <p className="post-author-bio-blurb">{author.bio}</p> : null}
        <a className="post-author-bio-link" href={`/profile/${author.id}`}>
          {s.visitProfile(name)}
        </a>
      </div>
    </aside>
  );
}
