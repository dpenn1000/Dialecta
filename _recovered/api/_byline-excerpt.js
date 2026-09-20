/**
 * api/_byline-excerpt.js
 *
 * Build a `custom_excerpt` value for a Ghost post that prepends the real
 * author's name. Ghost's primary_author for member articles is always the
 * house staff user (Path C-lite), so the auto-generated og:description /
 * meta_description never names the actual writer. By writing a prefixed
 * excerpt to the Ghost post once, every social-share preview and SEO
 * snippet downstream picks up the real byline ("By Rylie Pennington…")
 * without needing edge-side rewriting.
 *
 * Used by:
 *   - api/article/submit.js     (every new submission)
 *   - scripts/backfill-og-bylines.mjs (one-time pass over existing posts)
 *
 * Idempotency: if `providedExcerpt` already starts with "By <something>",
 * the function returns it untouched. Re-running the backfill is a no-op
 * for already-prefixed rows.
 *
 * Length: caps total output at 290 chars to stay under Ghost's 300-char
 * custom_excerpt limit. Truncates at a word boundary with an ellipsis.
 */

const MAX_TOTAL = 290;

export function bylineExcerpt(authorName, providedExcerpt, htmlForFallback) {
  // No author known — return the existing excerpt as-is (or null).
  if (!authorName || typeof authorName !== 'string' || !authorName.trim()) {
    return (providedExcerpt && providedExcerpt.trim()) || null;
  }

  // Already has a byline prefix — leave alone (idempotent on re-run).
  if (providedExcerpt && /^\s*By\s+\S/i.test(providedExcerpt)) {
    return providedExcerpt.trim();
  }

  const prefix = `By ${authorName.trim()}. `;
  const remaining = MAX_TOTAL - prefix.length;

  // Pick the body source: client-provided excerpt wins; else strip HTML.
  let body = '';
  if (providedExcerpt && providedExcerpt.trim()) {
    body = providedExcerpt.trim();
  } else if (htmlForFallback && typeof htmlForFallback === 'string') {
    body = htmlForFallback
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (!body) return prefix.trim();

  if (body.length <= remaining) return prefix + body;

  // Truncate at the last word boundary inside the budget. Fall back to a
  // hard cut if the body somehow has no spaces in the first half.
  const cut = body.slice(0, remaining - 1); // -1 leaves room for the ellipsis
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > Math.floor(remaining * 0.5) ? cut.slice(0, lastSpace) : cut;
  return prefix + trimmed + '…';
}
