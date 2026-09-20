/**
 * The one sanitizer both the write path (the article editor, backlog A-10,
 * and any other route that writes body_html) and the read path
 * (articles/[slug]/page.tsx) call, so the two cannot drift into two
 * different ideas of "clean." team/builder/knowledge/2026-html-sanitizer-body-html.md
 * has the full comparison against sanitize-html (archived) and js-xss (69
 * open issues); DOMPurify is the pick, wrapped by isomorphic-dompurify so
 * both call sites share one dependency and one jsdom version instead of two
 * hand-wired setups that can drift from each other.
 *
 * Call this immediately before the HTML is used, with no transformation in
 * between. DOMPurify's own README: sanitizing and then modifying the result
 * "might easily void the effects of sanitization." A stored, already-clean
 * body_html is not a reason to skip the read-time call either: blocker B2 of
 * exchange/open/2026-09-19-002-handoff-pr-3-review.md shows a contributor
 * can write body_html directly through PostgREST with the anon key, past
 * the editor and past whatever ran at write time. Read time is what
 * actually closes the hole; write time only keeps the stored row clean for
 * any other consumer (an RSS feed, an email digest).
 */
import DOMPurify from 'isomorphic-dompurify';

/** Sanitizes article body HTML (TipTap output, or a direct write) for storage or render. */
export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
