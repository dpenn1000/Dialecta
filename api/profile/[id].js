/**
 * GET  /api/profile/:id   — Returns merged profile data for a Ghost member
 * PATCH /api/profile/:id  — Updates editable fields in the profiles table
 *
 * The :id parameter is the Ghost member UUID (stored as ghost_member_id
 * in the Supabase profiles table and as author_id in the comments table).
 *
 * ── GET response shape ────────────────────────────────────────────────────
 * {
 *   profile: {
 *     ghost_member_id, display_name, bio, avatar_url, location, updated_at
 *   } | null,
 *   axisScores: {
 *     acuity, calibration, magnanimity, discourse, consistency, reach
 *   } | null,
 *   archetype: {
 *     id, label, note, assigned_at
 *   } | null,
 *   stats: {
 *     totalComments, articlesEngaged, forumPct, tierCounts,
 *     nominatedUp, nominatedDown
 *   }
 * }
 *
 * ── PATCH body ────────────────────────────────────────────────────────────
 * { display_name?, bio?, avatar_url?, location? }
 * Only the supplied fields are updated (partial update).
 *
 * Env vars required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Fields the PATCH endpoint is allowed to write
const EDITABLE_FIELDS = ['display_name', 'bio', 'avatar_url', 'location'];

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Member id is required' });
  }

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const [profileResult, axisResult, archetypeResult, commentsResult] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('ghost_member_id', id)
          .maybeSingle(),

        supabase
          .from('axis_scores')
          .select('acuity, calibration, magnanimity, discourse, consistency, reach')
          .eq('contributor_id', id)
          .maybeSingle(),

        supabase
          .from('archetypes')
          .select('id, label, note, assigned_at')
          .eq('contributor_id', id)
          .maybeSingle(),

        // Fetch published comments with their final tier from classifications
        supabase
          .from('comments')
          .select(`
            id,
            article_id,
            classifications (
              final_tier,
              ai_suggested_tier,
              self_declared_tier
            )
          `)
          .eq('author_id', id)
          .eq('status', 'published'),
      ]);

    // Log DB errors but return partial data rather than failing completely
    if (profileResult.error)
      console.error('profiles fetch error:', profileResult.error);
    if (axisResult.error)
      console.error('axis_scores fetch error:', axisResult.error);
    if (archetypeResult.error)
      console.error('archetypes fetch error:', archetypeResult.error);
    if (commentsResult.error)
      console.error('comments fetch error:', commentsResult.error);

    const comments = commentsResult.data ?? [];

    // Compute stats from the published comment set
    const totalComments = comments.length;
    const articlesEngaged = new Set(comments.map(c => c.article_id)).size;

    const tierCounts = {};
    let nominatedUp = 0;
    let nominatedDown = 0;

    comments.forEach(c => {
      const cls = c.classifications?.[0];
      if (!cls) return;
      const tier = cls.final_tier ?? cls.ai_suggested_tier;
      if (tier) tierCounts[tier] = (tierCounts[tier] || 0) + 1;

      // Detect self-declaration calibration direction
      // (self_declared higher than ai = nominated up, lower = down)
      // Full community nomination counts require the votes table — this is
      // a placeholder that will be replaced when that table is wired up.
    });

    const forumCount = tierCounts['forum'] ?? 0;
    const forumPct =
      totalComments > 0 ? Math.round((forumCount / totalComments) * 100) : 0;

    return res.status(200).json({
      profile:    profileResult.data ?? null,
      axisScores: axisResult.data    ?? null,
      archetype:  archetypeResult.data ?? null,
      stats: {
        totalComments,
        articlesEngaged,
        forumPct,
        tierCounts,
        nominatedUp,
        nominatedDown,
      },
    });
  }

  // ── PATCH ─────────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const body = req.body ?? {};

    // Whitelist: only known editable fields
    const updates = {};
    EDITABLE_FIELDS.forEach(field => {
      if (field in body) updates[field] = body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No editable fields supplied' });
    }

    // Upsert: create the profile row if this is the member's first edit
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { ghost_member_id: id, ...updates },
        { onConflict: 'ghost_member_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('profiles upsert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ profile: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
