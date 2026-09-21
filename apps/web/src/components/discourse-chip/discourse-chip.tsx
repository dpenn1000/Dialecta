/**
 * The discourse byline chip (live's .post-discourse-chip): a single-line
 * affordance under the article meta bar, pointing down at the conversation.
 * Ported from _theme/post.hbs:185-190, CSS from
 * _theme/assets/css/style.css:1175-1234. Server component: a plain anchor
 * jump to #dialecta-comments (discourse/discourse-root.tsx's mount id), the
 * same target the spine's own Discourse segment uses.
 *
 * The count is the one real read this chip and the spine's Discourse meta
 * share (components/article-spine/discourse-count.ts), computed once by
 * the page and passed to both rather than each fetching it again. Live
 * prints a fixed "12 voices" on every article; that is exactly the made-up
 * number the port-or-rewrite ruling keeps out, so a null count (the read
 * failed) renders the chip without one rather than guessing.
 */
import { strings } from '@/strings';
import './discourse-chip.css';

const s = strings.discourseChip;

export function DiscourseChip({ count }: { count: number | null }) {
  const meta = strings.articleSpine.discourseMeta(count);
  return (
    <a className="post-discourse-chip" href="#dialecta-comments">
      <span className="post-discourse-chip-mark" aria-hidden="true">
        ⁂
      </span>
      <span className="post-discourse-chip-label">{s.label}</span>
      {meta ? <span className="post-discourse-chip-count">{meta}</span> : null}
      <span className="post-discourse-chip-cta">{s.cta}</span>
    </a>
  );
}
