/**
 * api/comment/[id].js
 *
 * Per-comment edit and delete endpoints. Both operations are bounded by
 * the 60-minute malleability window: refuses with 409 once now() >=
 * comments.hardened_at. After the window, the original stands. Append-
 * after-hardening on comments is intentionally NOT supported (article-
 * side commitment only); if a contributor wants to refine, they post
 * a reply once threading lands.
 *
 *   PATCH  /api/comment/:id  → edit body. Re-classifies on the new body.
 *   DELETE /api/comment/:id  → hard delete (within malleable window only).
 *
 * Auth model (Path C-lite, mirrors api/comment.js):
 *   - Body carries member_uuid (the viewer / author). The endpoint
 *     verifies that member_uuid matches the comment row's member_id —
 *     a contributor can only mutate their own comments.
 *   - Service role key is used for the DB writes; the auth check is
 *     application-level.
 *
 * PATCH body:
 *   {
 *     member_uuid:        string,
 *     body:               string,                       // new comment text
 *     self_declared_tier: tier | null,                   // optional re-declaration
 *     article_claims?:    string[]                       // for re-classification
 *   }
 *
 * PATCH response:
 *   {
 *     id, body, hardened_at, malleable,
 *     classification: { ai_suggested_tier, final_tier, commenter_message, ... }
 *   }
 *
 * DELETE body:
 *   {
 *     member_uuid: string
 *   }
 *
 * DELETE response: 204 No Content on success.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { deriveAxisEvents, recomputeAxisScores } from '../_axis-mapping.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'comment id is required in the path' });
  }

  if (req.method === 'PATCH')  return handlePatch(req, res, id);
  if (req.method === 'DELETE') return handleDelete(req, res, id);

  return res.status(405).json({ error: 'Method not allowed. Use PATCH or DELETE.' });
}

// ─── PATCH (edit during malleable window) ────────────────────────────────
async function handlePatch(req, res, id) {
  const { member_uuid, body, self_declared_tier, article_claims, mentions } = req.body || {};

  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required' });
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({ error: 'body is required and must be non-empty' });
  }
  if (self_declared_tier && !TIERS.includes(self_declared_tier)) {
    return res.status(400).json({
      error: 'self_declared_tier must be one of: ' + TIERS.join(', '),
    });
  }

  // Structured mentions: accepted on edit so the renderer keeps highlighting
  // @display_name spans correctly after the user edits a body that contained
  // mentions. Edits do NOT re-fire mention notifications: recipients were
  // already notified at original submit, and delta-notifications (notify for
  // newly-added mentions only) is a v2 question. Validation mirrors the
  // POST endpoint: cap 10, dedup by member_id, drop malformed.
  let cleanMentions = null;
  if (mentions !== undefined) {
    if (!Array.isArray(mentions)) {
      return res.status(400).json({ error: 'mentions must be an array of {member_id, display_name} objects if provided' });
    }
    if (mentions.length > 10) {
      return res.status(400).json({ error: 'No more than 10 mentions per comment' });
    }
    const seen = new Set();
    cleanMentions = [];
    for (const m of mentions) {
      if (!m || typeof m !== 'object') continue;
      const mid  = typeof m.member_id === 'string' ? m.member_id.trim() : '';
      const name = typeof m.display_name === 'string' ? m.display_name.trim() : '';
      if (!mid || !name) continue;
      if (seen.has(mid)) continue;
      seen.add(mid);
      cleanMentions.push({ member_id: mid, display_name: name });
    }
  }

  try {
    // Step 1: load the comment + verify ownership + verify malleable.
    const { data: existing, error: existErr } = await supabase
      .from('comments')
      .select('id, member_id, hardened_at')
      .eq('id', id)
      .maybeSingle();

    if (existErr) throw existErr;
    if (!existing) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (existing.member_id !== member_uuid) {
      return res.status(403).json({ error: 'Only the original author can edit this comment' });
    }
    if (existing.hardened_at && new Date(existing.hardened_at).getTime() <= Date.now()) {
      return res.status(409).json({
        error: 'Malleability window has closed. The comment has hardened into the public record.',
      });
    }

    // Step 2: re-classify the new body.
    const host  = req.headers['x-forwarded-host'] || req.headers.host || 'dialecta.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const classifyUrl = proto + '://' + host + '/api/classify';

    const classifyResp = await fetch(classifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, article_claims }),
    });

    if (!classifyResp.ok) {
      const text = await classifyResp.text();
      console.error('Classification call failed during edit:', classifyResp.status, text);
      return res.status(502).json({
        error: 'Classification engine failed during edit',
        detail: classifyResp.status + ': ' + text.slice(0, 500),
      });
    }
    const classification = await classifyResp.json();

    if (!classification.ai_suggested_tier || !TIERS.includes(classification.ai_suggested_tier)) {
      return res.status(502).json({
        error: 'Classifier returned an invalid ai_suggested_tier on edit',
      });
    }

    const final_tier = self_declared_tier || classification.ai_suggested_tier;

    // Step 3: update the comment body (and mentions when provided).
    const updatePatch = { body };
    if (cleanMentions !== null) updatePatch.mentions = cleanMentions;

    const { data: updated, error: updateErr } = await supabase
      .from('comments')
      .update(updatePatch)
      .eq('id', id)
      .select('id, body, hardened_at, status, mentions')
      .single();

    if (updateErr) throw updateErr;

    // Step 4: update the classification row in place. The classifications
    // table has one row per comment; edits update that row rather than
    // appending a new one (history-preserving variant is a future schema
    // refinement if telemetry shows it matters). self_declared_tier is
    // overwritten with the new value if provided, otherwise preserved
    // from the prior classification.
    const updateFields = {
      claim_text:            classification.claim_text || null,
      strength:              classification.strength   || null,
      specificity_score:     typeof classification.specificity === 'number' ? classification.specificity : null,
      emotion:               classification.emotion || null,
      tribal_markers:        Boolean(classification.tribal_markers),
      tribal_example:        classification.tribal_example || null,
      article_engagement:    classification.article_engagement || null,
      opposing_view_engaged: classification.opposing_view_engaged || null,
      borderline_flag:       Boolean(classification.borderline_flag),
      borderline_other_tier: classification.borderline_other_tier || null,
      ai_suggested_tier:     classification.ai_suggested_tier,
      final_tier,
      commenter_message:     classification.commenter_message,
    };
    if (self_declared_tier !== undefined) {
      updateFields.self_declared_tier = self_declared_tier;
    }

    const { error: classUpdateErr } = await supabase
      .from('classifications')
      .update(updateFields)
      .eq('comment_id', id);

    if (classUpdateErr) throw classUpdateErr;

    // Step 5: refresh axis_events to match the new classification.
    // The classification row is updated in place (same uuid); we delete
    // prior axis_events tied to it EXCEPT Reach, then re-derive the
    // other five axes from the new classification.
    //
    // Why preserve Reach: Reach depends on the article's primary_tag
    // and the member's topic history, neither of which changes when
    // the body is edited. Deleting and re-deriving Reach without the
    // article's primary_tag in this request would lose the topic
    // forever. Preserving the prior Reach event keeps the ledger honest.
    const { data: classRow, error: classFetchErr } = await supabase
      .from('classifications')
      .select('id')
      .eq('comment_id', id)
      .maybeSingle();
    if (classFetchErr) throw classFetchErr;

    let axisEventsCount = 0;
    if (classRow) {
      const { error: axisDelErr } = await supabase
        .from('axis_events')
        .delete()
        .eq('classification_id', classRow.id)
        .neq('axis', 'reach');
      if (axisDelErr) throw axisDelErr;

      // Re-derive with articleTopic=null (Reach won't fire — we kept the
      // existing one above). priorTopics is unused for non-Reach axes.
      const newEvents = deriveAxisEvents({
        classification: { ...classification, final_tier },
        memberId:         member_uuid,
        commentId:        id,
        classificationId: classRow.id,
        articleTopic:     null,
        priorTopics:      new Set(),
      });
      // Drop any 'reach' events the helper might emit (defensive — it
      // shouldn't given articleTopic=null, but if the rule changes later
      // this guard preserves the preserve-Reach contract).
      const filtered = newEvents.filter(e => e.axis !== 'reach');

      if (filtered.length > 0) {
        const { error: axisInsErr } = await supabase
          .from('axis_events')
          .insert(filtered);
        if (axisInsErr) throw axisInsErr;
      }
      axisEventsCount = filtered.length;

      // Replay the ledger to refresh axis_scores. Per spec.
      await recomputeAxisScores(supabase, member_uuid);
    }

    return res.status(200).json({
      id:          updated.id,
      body:        updated.body,
      mentions:    Array.isArray(updated.mentions) ? updated.mentions : [],
      hardened_at: updated.hardened_at,
      malleable:   updated.hardened_at
        ? new Date(updated.hardened_at).getTime() > Date.now()
        : true,
      classification: {
        ai_suggested_tier: classification.ai_suggested_tier,
        final_tier,
        commenter_message: classification.commenter_message,
        borderline_flag:   Boolean(classification.borderline_flag),
        borderline_other_tier: classification.borderline_other_tier || null,
        strength:          classification.strength || null,
      },
      axis_events_rebuilt: axisEventsCount,
    });

  } catch (error) {
    console.error('PATCH /api/comment/:id error:', error);
    return res.status(500).json({
      error: 'Edit failed',
      detail: error.message,
    });
  }
}

// ─── DELETE (within malleable window) ────────────────────────────────────
async function handleDelete(req, res, id) {
  const { member_uuid } = req.body || {};

  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required' });
  }

  try {
    // Step 1: load the comment + verify ownership + verify malleable.
    const { data: existing, error: existErr } = await supabase
      .from('comments')
      .select('id, member_id, hardened_at')
      .eq('id', id)
      .maybeSingle();

    if (existErr) throw existErr;
    if (!existing) {
      // Idempotent — already gone.
      return res.status(204).end();
    }
    if (existing.member_id !== member_uuid) {
      return res.status(403).json({ error: 'Only the original author can delete this comment' });
    }
    if (existing.hardened_at && new Date(existing.hardened_at).getTime() <= Date.now()) {
      return res.status(409).json({
        error: 'Malleability window has closed. The comment has hardened into the public record and cannot be removed. Per the platform commitment: public refinement (reply, once threading lands) is preferred over erasure.',
      });
    }

    // Step 2: delete the classification first (FK), then the comment.
    // Using two deletes rather than ON DELETE CASCADE because we don't
    // know if the FK in production is set up that way.
    const { error: classDeleteErr } = await supabase
      .from('classifications')
      .delete()
      .eq('comment_id', id);
    if (classDeleteErr) {
      // Non-fatal: the classification row may not exist if the original
      // insert raced. Log and continue to delete the comment.
      console.warn('Classification delete during comment delete:', classDeleteErr.message);
    }

    const { error: commentDeleteErr } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    if (commentDeleteErr) throw commentDeleteErr;

    // axis_events for this comment cascade-delete via the FK on
    // axis_events.comment_id (ON DELETE CASCADE, set by migration 014).
    // After the cascade, recompute axis_scores so the materialized view
    // reflects the smaller ledger. Wrapped defensively — if recompute
    // fails (e.g., transient DB error) we still report success on the
    // delete itself; axis_scores can be rebuilt later by re-running.
    try {
      await recomputeAxisScores(supabase, member_uuid);
    } catch (recomputeErr) {
      console.warn('axis_scores recompute after delete failed:', recomputeErr.message);
    }

    return res.status(204).end();

  } catch (error) {
    console.error('DELETE /api/comment/:id error:', error);
    return res.status(500).json({
      error: 'Delete failed',
      detail: error.message,
    });
  }
}
