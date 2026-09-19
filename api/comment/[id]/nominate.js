/**
 * api/comment/[id]/nominate.js
 *
 * POST /api/comment/{id}/nominate
 *
 * The community reclassification endpoint. Each call is one member's
 * structured judgment that this comment belongs in a different tier than
 * the engine assigned. Implements the third leg of the three-input
 * final-tier model from Dialecta_Article_Editorial_Template.md (lines
 * 109-117) and Dialecta_Classification_Engine_Specification.md (lines
 * 220-226).
 *
 * Body:
 *   {
 *     member_uuid: string,    // ghost_member_id of the nominator
 *     target_tier: string,    // 'forum' | 'spark' | ... | 'breach'
 *     reason_key:  string,    // one of the 7 RESPONSE_REASONS keys
 *     note:        string?    // optional, ≤140 chars
 *   }
 *
 * Behavior:
 *   1. Validate input + verify member is not nominating their own comment.
 *   2. UPSERT into tier_nominations on (comment_id, member_id) — re-nominating
 *      replaces the prior row; the ledger reflects current judgment.
 *   3. Tally nominations grouped by target_tier for this comment.
 *   4. If any tier crosses threshold (NOMINATION_THRESHOLD_TO_SHIFT for
 *      non-Breach, NOMINATION_THRESHOLD_BREACH for Breach), and that tier
 *      differs from the current final_tier, flip final_tier on the
 *      classifications row.
 *   5. On flip: append a calibration axis_event for the original commenter
 *      (the gap between their self-declaration and the community-resolved
 *      tier IS the Calibration signal the Fingerprint spec is waiting for),
 *      and recompute their axis_scores via the same replay-from-ledger
 *      pattern used everywhere else.
 *
 * What v1 does NOT do (deferred):
 *   - DELETE (withdraw) endpoint. To change a nomination, POST a new one;
 *     UPSERT replaces the prior row. Full retraction is a Phase 2 add.
 *   - Author-Stage-2.5-before-flip wait window. Per
 *     Article_Editorial_Template.md line 165, the original commenter
 *     should see accumulated nominations before the tier shift takes
 *     effect. v1 flips immediately and notifies; the wait-window variant
 *     is the natural follow-up.
 *   - Nominator-side calibration events. Nominators who landed on the
 *     resolved tier get no Fingerprint signal in v1. Adding this is a
 *     small future change to deriveAxisEvents but it requires deciding
 *     whether nominators who picked the LOSING tier get a negative signal
 *     (probably not, but it deserves its own design call).
 *   - Notification to the original commenter on tier shift. Stage 1
 *     notifications shipped 2026-04-30 and have a notification-type
 *     enum that doesn't yet include `tier_reclassified`. Adding it is a
 *     migration + a createNotification call in step 5; not blocking v1.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../../_cors.js';
import { recomputeAxisScores } from '../../_axis-mapping.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── TUNING knobs ────────────────────────────────────────────────────────
// TUNING: Nominations on a single target_tier required to shift final_tier
// for a non-Breach call. First-pass default; calibrate as data accumulates
// via the Tuning Engine admin page.
const NOMINATION_THRESHOLD_TO_SHIFT = 3;

// TUNING: Breach is heavier — a personal-attack call should require more
// agreement than a Forum-vs-Spark reclassification. Breach also suppresses
// content visibility, so the cost of a wrong call is asymmetric.
const NOMINATION_THRESHOLD_BREACH   = 5;

// Canonical tier keys — must match classifications.final_tier and the
// tier_nominations CHECK constraint.
const VALID_TIERS = new Set(['forum','spark','echo','fog','heat','stance','breach']);

// Canonical reason keys — must match the tier_nominations CHECK constraint
// and the RESPONSE_REASONS export in src/dialecta-private-draft.jsx.
const VALID_REASONS = new Set([
  'specific_claim',
  'engages_content',
  'new_idea',
  'emotional_only',
  'group_signal',
  'unclear',
  'other',
]);

const NOTE_MAX = 140;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const comment_id = req.query?.id;
  if (!comment_id || typeof comment_id !== 'string') {
    return res.status(400).json({ error: 'comment id is required in path' });
  }

  const { member_uuid, target_tier, reason_key } = req.body || {};
  let { note } = req.body || {};

  // ─── Input validation ─────────────────────────────────────────────────
  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required' });
  }
  if (!target_tier || !VALID_TIERS.has(target_tier)) {
    return res.status(400).json({ error: 'target_tier must be one of: ' + [...VALID_TIERS].join(', ') });
  }
  if (!reason_key || !VALID_REASONS.has(reason_key)) {
    return res.status(400).json({ error: 'reason_key must be one of the 7 predefined reasons' });
  }
  if (note != null) {
    if (typeof note !== 'string') {
      return res.status(400).json({ error: 'note must be a string if provided' });
    }
    note = note.trim();
    if (note.length === 0) note = null;
    else if (note.length > NOTE_MAX) {
      return res.status(400).json({ error: `note must be ${NOTE_MAX} characters or fewer` });
    }
  } else {
    note = null;
  }

  try {
    // ─── Step 1: load the comment + its classification ──────────────────
    const { data: comment, error: commentErr } = await supabase
      .from('comments')
      .select('id, member_id, article_id')
      .eq('id', comment_id)
      .maybeSingle();
    if (commentErr) throw commentErr;
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.member_id === member_uuid) {
      return res.status(403).json({ error: 'You cannot nominate your own comment' });
    }

    const { data: classification, error: classErr } = await supabase
      .from('classifications')
      .select('id, ai_suggested_tier, self_declared_tier, final_tier')
      .eq('comment_id', comment_id)
      .maybeSingle();
    if (classErr) throw classErr;
    if (!classification) {
      return res.status(404).json({ error: 'Classification not found for this comment' });
    }

    // Nominating the same tier the comment is already in is a no-op
    // structurally but we still record it (the nominator confirming the
    // engine adds signal and protects against drift if other nominations
    // later try to shift).

    // ─── Step 2: upsert the nomination ──────────────────────────────────
    const { data: nomination, error: upsertErr } = await supabase
      .from('tier_nominations')
      .upsert(
        {
          comment_id,
          member_id:    member_uuid,
          target_tier,
          reason_key,
          note,
          updated_at:   new Date().toISOString(),
        },
        { onConflict: 'comment_id,member_id' }
      )
      .select('id, target_tier, reason_key, note, created_at, updated_at')
      .single();
    if (upsertErr) throw upsertErr;

    // ─── Step 3: tally nominations for this comment ─────────────────────
    const { data: allNoms, error: tallyErr } = await supabase
      .from('tier_nominations')
      .select('target_tier, created_at')
      .eq('comment_id', comment_id);
    if (tallyErr) throw tallyErr;

    const tallies = {};
    const earliestByTier = {};
    for (const n of allNoms || []) {
      tallies[n.target_tier] = (tallies[n.target_tier] || 0) + 1;
      const t = new Date(n.created_at).getTime();
      if (!earliestByTier[n.target_tier] || t < earliestByTier[n.target_tier]) {
        earliestByTier[n.target_tier] = t;
      }
    }

    // ─── Step 4: resolution check ───────────────────────────────────────
    // Find any tier that crosses its threshold. If multiple cross, pick
    // the one with the highest count; ties go to the tier whose first
    // nomination came earliest (community got there first).
    let winningTier = null;
    let winningCount = 0;
    let winningEarliest = Infinity;
    for (const [tier, count] of Object.entries(tallies)) {
      const threshold = tier === 'breach' ? NOMINATION_THRESHOLD_BREACH : NOMINATION_THRESHOLD_TO_SHIFT;
      if (count < threshold) continue;
      const earliest = earliestByTier[tier] || Infinity;
      if (count > winningCount ||
         (count === winningCount && earliest < winningEarliest)) {
        winningTier     = tier;
        winningCount    = count;
        winningEarliest = earliest;
      }
    }

    let finalTierChanged = false;
    let newFinalTier = classification.final_tier;
    if (winningTier && winningTier !== classification.final_tier) {
      // Flip final_tier.
      const { error: updErr } = await supabase
        .from('classifications')
        .update({ final_tier: winningTier })
        .eq('id', classification.id);
      if (updErr) throw updErr;

      finalTierChanged = true;
      newFinalTier     = winningTier;

      // ─── Step 5: Calibration axis event for the original commenter ──
      // The gap between their self-declaration and the community-resolved
      // tier IS the Calibration signal. Suppressed tiers (Breach) don't
      // produce identity-shaping events — but the FLIP TO breach is itself
      // a significant signal we want recorded, so we fire calibration
      // for the commenter on any tier shift, including community-shifts
      // INTO breach. This is a v1 design call worth revisiting.
      //
      // Wrapped in try/catch so an axis-event failure doesn't undo the
      // tier flip. The flip is the primary user-visible action.
      try {
        const axisEventRow = {
          member_id:         comment.member_id,
          classification_id: classification.id,
          comment_id:        comment.id,
          axis:              'calibration',
          tier:              newFinalTier,
          topic:             null,
        };
        const { error: axisErr } = await supabase
          .from('axis_events')
          .insert(axisEventRow);
        if (axisErr) throw axisErr;
        await recomputeAxisScores(supabase, comment.member_id);
      } catch (axisErr) {
        console.warn('Axis event after community tier shift failed:', axisErr.message);
      }
    }

    return res.status(201).json({
      nomination,
      comment_id,
      resolution: {
        final_tier_changed: finalTierChanged,
        new_final_tier:     newFinalTier,
        prior_final_tier:   classification.final_tier,
        tallies,
      },
    });

  } catch (error) {
    console.error('POST /api/comment/[id]/nominate error:', error);
    return res.status(500).json({
      error: 'Nomination failed',
      detail: error.message,
    });
  }
}
