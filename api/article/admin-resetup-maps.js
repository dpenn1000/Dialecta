/**
 * api/article/admin-resetup-maps.js
 *
 * Admin-only endpoint for re-running the opinion-map setup on a published
 * article. Smoke-test surface: lets an admin re-trigger the picker on any
 * existing article from the post page (via the admin Re-setup Opinion Maps
 * floating button) and commit the chosen candidate back to the article's
 * declaration.opinion_maps + ai_analysis.
 *
 * The classification step runs client-side (the modal calls
 * /api/article/classify directly with the article's text + declaration);
 * this endpoint only handles the SAVE step. That keeps the modal simple
 * and reuses the existing classify path for free.
 *
 * POST body:
 *   {
 *     ghost_post_id:          string,    // 24-char Ghost post ID
 *     member_uuid:            string,    // viewer's Ghost member UUID (admin)
 *     selected_opinion_maps:  array,     // 1-2 maps in declaration.opinion_maps shape
 *     ai_analysis:            object,    // full classify response (for ai_analysis col)
 *   }
 *
 * Response:
 *   { success: true, article_id: uuid }
 *
 * Auth:
 *   - Verifies member_uuid maps to a profile with is_admin = true.
 *   - Returns 403 if non-admin or missing.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ghost_post_id, member_uuid, selected_opinion_maps, ai_analysis } = req.body || {};

  if (!ghost_post_id || typeof ghost_post_id !== 'string') {
    return res.status(400).json({ error: 'ghost_post_id is required' });
  }
  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required (admin verification)' });
  }
  if (!Array.isArray(selected_opinion_maps)) {
    return res.status(400).json({ error: 'selected_opinion_maps must be an array (may be empty)' });
  }
  if (!ai_analysis || typeof ai_analysis !== 'object') {
    return res.status(400).json({ error: 'ai_analysis is required' });
  }

  try {
    // Step 1: verify admin.
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('ghost_member_id, is_admin, display_name')
      .eq('ghost_member_id', member_uuid)
      .maybeSingle();
    if (profileErr) throw profileErr;
    if (!profile) {
      return res.status(403).json({ error: 'No profile found for this member' });
    }
    if (!profile.is_admin) {
      return res.status(403).json({ error: 'Not an admin' });
    }

    // Step 2: load the article so we can merge declaration.
    const { data: article, error: articleErr } = await supabase
      .from('articles')
      .select('id, declaration')
      .eq('ghost_post_id', ghost_post_id)
      .maybeSingle();
    if (articleErr) throw articleErr;
    if (!article) {
      return res.status(404).json({ error: 'Article not found in Supabase' });
    }

    // Step 3: build the new declaration. Preserve existing fields
    // (core_claim, scope_boundary, strongest_objection, etc.) and replace
    // opinion_maps with the admin's chosen set. Drop the legacy
    // opinion_axes field if it's still hanging around.
    const newDeclaration = {
      ...(article.declaration || {}),
      opinion_maps: selected_opinion_maps,
    };
    delete newDeclaration.opinion_axes;
    delete newDeclaration.author_position;

    // Step 4: write back. updated_at lets the editor / cache layers know
    // the article changed.
    const { error: updateErr } = await supabase
      .from('articles')
      .update({
        declaration: newDeclaration,
        ai_analysis,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', article.id);
    if (updateErr) throw updateErr;

    return res.status(200).json({ success: true, article_id: article.id });
  } catch (error) {
    console.error('admin-resetup-maps error:', error);
    return res.status(500).json({
      error: 'Re-setup save failed',
      detail: error.message,
    });
  }
}
