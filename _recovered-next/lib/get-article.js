/**
 * Server-side article fetcher for the article SSR page (Phase 5) and
 * its OG card (OG-3).
 *
 * Two-step: Ghost is the source of truth for title/author/excerpt/slug;
 * Supabase carries the dialecta-side tier and classification. Some
 * legacy articles (Maya On Doubt and Devotion, Daniel solar piece)
 * never got a Supabase row, so the dialecta overlay is optional.
 *
 * Returns:
 *   {
 *     slug, title, excerpt, plaintext,
 *     author: { name, slug, profile_image },
 *     primary_tag: { name, slug } | null,
 *     final_tier: 'declarative' | 'speculative' | 'inquisitive' | 'intuitive' | null,
 *   }
 *   or null on 404 / malformed slug / fetch failure.
 *
 * Excerpt preference:
 *   custom_excerpt (manually authored) > first ~200 chars of plaintext
 */

import { createClient } from '@supabase/supabase-js';
import { ghostAdminFetch } from './ghost-admin.js';

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'getArticleBySlug: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment.'
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Ghost slugs are URL-safe lowercase strings. Reject anything that
// could be path-traversal or otherwise unexpected before hitting Ghost.
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,200}$/;

function deriveExcerpt(custom, plain) {
  const trimmed = (custom || '').trim();
  if (trimmed) return trimmed;
  const fromPlain = (plain || '').replace(/\s+/g, ' ').trim();
  if (!fromPlain) return '';
  if (fromPlain.length <= 220) return fromPlain;
  // Truncate at the last word boundary before 200 chars, then add ellipsis.
  const slice = fromPlain.slice(0, 200);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + '…';
}

export async function getArticleBySlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const normalized = slug.toLowerCase().trim();
  if (!SLUG_RE.test(normalized)) return null;

  // 1. Ghost fetch by slug.
  let ghostPost = null;
  try {
    const data = await ghostAdminFetch(
      '/posts/slug/' + encodeURIComponent(normalized) +
      '/?formats=plaintext&include=tags,authors'
    );
    ghostPost = data?.posts?.[0] || null;
  } catch (err) {
    if (err.statusCode === 404) return null;
    console.error('getArticleBySlug: Ghost fetch failed:', err?.message);
    return null;
  }
  if (!ghostPost) return null;
  if (ghostPost.status && ghostPost.status !== 'published') return null;

  // 2. Supabase overlay: tier + author override.
  //
  // Path C-lite auth model: Ghost articles attribute to a single house
  // user, but the real byline lives in Supabase via
  // `articles.author_member_id` -> `profiles.ghost_member_id`. We must
  // prefer the Supabase display name for the OG card, otherwise every
  // contributor's shared article shows the house user as the author.
  // Legacy articles (no Supabase row) cleanly fall back to Ghost.
  let finalTier = null;
  let authorMemberId = null;
  try {
    const { data: row } = await getSupabase()
      .from('articles')
      .select('final_tier, author_member_id')
      .eq('ghost_post_id', ghostPost.id)
      .maybeSingle();
    finalTier      = row?.final_tier || null;
    authorMemberId = row?.author_member_id || null;
  } catch (err) {
    console.error('getArticleBySlug: Supabase article lookup failed:', err?.message);
  }

  // 3. Supabase profile lookup for the byline override.
  let supaAuthor = null;
  if (authorMemberId) {
    try {
      const { data: prof } = await getSupabase()
        .from('profiles')
        .select('display_name, avatar_url, handle')
        .eq('ghost_member_id', authorMemberId)
        .maybeSingle();
      if (prof?.display_name) {
        supaAuthor = {
          name:          prof.display_name,
          slug:          prof.handle || '',
          profile_image: prof.avatar_url || null,
        };
      }
    } catch (err) {
      console.error('getArticleBySlug: Supabase profile lookup failed:', err?.message);
    }
  }

  // Author resolution: Supabase override wins, Ghost is fallback.
  const ghostAuthor = ghostPost.authors?.[0] || ghostPost.primary_author || null;
  const author = supaAuthor || (ghostAuthor
    ? {
        name:          ghostAuthor.name || '',
        slug:          ghostAuthor.slug || '',
        profile_image: ghostAuthor.profile_image || null,
      }
    : null);

  // Pull the author's signature font from their Dialecta profile so
  // the OG card can render their display_name in their chosen hand.
  // Best-effort; falls back to italic Cormorant if anything fails.
  let authorSignatureFont = 'Mrs Saint Delafield';
  if (authorMemberId) {
    try {
      const { data: prof } = await getSupabase()
        .from('profiles')
        .select('signature_font')
        .eq('ghost_member_id', authorMemberId)
        .maybeSingle();
      if (prof?.signature_font) authorSignatureFont = prof.signature_font;
    } catch (_) { /* keep default */ }
  }

  const tag = ghostPost.primary_tag || ghostPost.tags?.[0] || null;

  return {
    slug:           ghostPost.slug,
    title:          ghostPost.title || '',
    excerpt:        deriveExcerpt(ghostPost.custom_excerpt, ghostPost.plaintext),
    plaintext:      ghostPost.plaintext || '',
    feature_image:  ghostPost.feature_image || null,
    published_at:   ghostPost.published_at || null,
    author: author
      ? { ...author, signature_font: authorSignatureFont }
      : null,
    primary_tag: tag ? { name: tag.name || '', slug: tag.slug || '' } : null,
    final_tier:  finalTier,
  };
}
