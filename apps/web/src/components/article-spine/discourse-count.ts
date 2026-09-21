import 'server-only';

/**
 * The number of published comments on one article, for the spine's
 * Discourse meta (spine.tsx) and the byline chip
 * (components/discourse-chip). Not part of components/discourse/data.ts,
 * out of scope for this change per that file's own header (a security
 * change to its comment readers is coming), so this repeats its id/slug
 * match in miniature rather than importing an unexported helper from it:
 * the April comment rows carry the Ghost post id in article_id, matched
 * here by article_slug the same way data.ts's readComments() does; current
 * rows carry articles.id directly.
 *
 * status='published' is explicit rather than left to RLS alone (the same
 * belt-and-suspenders data.ts applies to its own reads), so the count is
 * the same number for every reader regardless of whether the viewer is
 * signed in with a pending comment of their own on this thread. That makes
 * it a stable public count, the right shape for a number two different
 * surfaces show side by side.
 *
 * Counts comments, not distinct commenters: "voices" is live's word for it,
 * but the brief asks for a real count of the comments a reader can see, and
 * that is what a reader can check by counting the cards in the feed below.
 *
 * Never throws. Null on any read failure, so a caller can omit the count
 * rather than print a wrong one; never a placeholder number. Live prints a
 * fixed "12 voices" on every article, which is exactly the made-up data the
 * port-or-rewrite ruling keeps out.
 */
import { createClient } from '@/lib/supabase/server';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function loadVisibleCommentCount(article: { id: string; slug: string }): Promise<number | null> {
  try {
    const supabase = await createClient();
    const byId = `article_id.eq.${article.id}`;
    const filter = SLUG_RE.test(article.slug)
      ? `${byId},and(article_slug.eq.${article.slug},article_id.not.like.*-*)`
      : byId;
    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .or(filter);
    if (error) throw new Error(error.message);
    return count ?? 0;
  } catch (err) {
    console.error('discourse-count: comment count read failed', err);
    return null;
  }
}
