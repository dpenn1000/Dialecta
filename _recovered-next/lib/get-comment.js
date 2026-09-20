/**
 * Server-side comment fetcher for the comment OG card (OG-4).
 *
 * Direct Supabase query: comments are uuid-keyed (PK is `id`, NOT
 * `comment_id` — schema gotcha caught while building OG-4). The row
 * carries cached display fields (member_name, article_title,
 * article_slug). The discourse tier lives in a separate
 * `classifications` table, joined on `classifications.comment_id =
 * comments.id`. Two-step fetch keeps the SQL legible and lets the OG
 * card fall back to a tier-less footer when the join is empty
 * (legacy comments, classification still pending, etc).
 *
 * Returns:
 *   {
 *     id, body, member_name, member_id,
 *     article_id, article_slug, article_title,
 *     final_tier, parent_id, published_at,
 *   }
 *   or null on malformed uuid / 404 / suppressed comment.
 *
 * Only `published` comments are returned. Pending or suppressed
 * comments must not be visible in social previews.
 */

import { createClient } from '@supabase/supabase-js';

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'getCommentById: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment.'
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getCommentById(id) {
  if (!id || typeof id !== 'string') return null;
  const normalized = id.toLowerCase().trim();
  if (!UUID_RE.test(normalized)) return null;

  try {
    const { data, error } = await getSupabase()
      .from('comments')
      .select(
        'id, body, member_name, member_id, article_id, article_slug, article_title, parent_id, published_at, status'
      )
      .eq('id', normalized)
      .maybeSingle();

    if (error) {
      console.error('getCommentById: query failed', error);
      return null;
    }
    if (!data) return null;
    // Visibility gate: a comment is shareable iff it has not been
    // suppressed. We do NOT gate on `published_at` (that field is
    // currently never set by the pipeline -- discovered while
    // building OG-4: real prod comments have hardened_at populated
    // but published_at remains null) nor on status='published' (the
    // promotion pipeline isn't moving comments out of
    // 'pending_review'). The comments we filter for are exactly what
    // the discourse layer renders on the article page; any gate
    // stricter than 'not suppressed' would 404 every real comment.
    if (data.status === 'suppressed') return null;

    // Best-effort: pull final_tier from the classifications join.
    // Some comments don't have a classification row yet (pending
    // pipeline, legacy data); the OG card handles a null tier
    // gracefully by hiding the tier segment of the footer.
    let finalTier = null;
    try {
      const { data: cls } = await getSupabase()
        .from('classifications')
        .select('final_tier')
        .eq('comment_id', data.id)
        .maybeSingle();
      finalTier = cls?.final_tier || null;
    } catch (err) {
      console.error('getCommentById: classification lookup failed', err?.message);
    }

    // Best-effort: refresh display name from profiles in case the
    // cached one is stale. If lookup fails or profile is missing,
    // keep the cached name.
    let memberName = data.member_name || '';
    if (data.member_id) {
      try {
        const { data: prof } = await getSupabase()
          .from('profiles')
          .select('display_name')
          .eq('ghost_member_id', data.member_id)
          .maybeSingle();
        if (prof?.display_name) memberName = prof.display_name;
      } catch (err) {
        console.error('getCommentById: profile lookup failed', err?.message);
      }
    }

    return {
      id:            data.id,
      body:          data.body || '',
      member_name:   memberName,
      member_id:     data.member_id,
      article_id:    data.article_id,
      article_slug:  data.article_slug,
      article_title: data.article_title,
      final_tier:    finalTier,
      parent_id:     data.parent_id || null,
      published_at:  data.published_at,
    };
  } catch (err) {
    console.error('getCommentById: exception', err?.message);
    return null;
  }
}
