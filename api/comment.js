/**
 * POST /api/comment
 *
 * Submits a comment. Runs classification synchronously, writes the comment
 * and classification record to Supabase, and returns both to the client so
 * the UI can display the tier suggestion immediately (Stage 1 of the flow).
 *
 * The comment is written with status = 'pending_review'. The client is
 * responsible for the Stage 2 self-declaration step (accept or override),
 * which calls PATCH /api/comment/:id to finalize the tier.
 *
 * Body: {
 *   author_id: string       — Ghost member UUID
 *   article_id: string      — Ghost post UUID
 *   body: string            — Comment text
 *   article_claims?: string[] — Key claims from the article (improves classification)
 * }
 *
 * Response: {
 *   comment: { id, author_id, article_id, body, status, created_at }
 *   classification: {
 *     id, ai_suggested_tier, commenter_message,
 *     borderline_flag, borderline_other_tier
 *   }
 * }
 *
 * Env vars required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *   ANTHROPIC_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { classifyComment } from './_classify.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Classification runs synchronously on this hot path (rather than via an HTTP
// hop to /api/classify) so a single request returns both the stored comment
// and its tier suggestion. The prompt and Anthropic call live in _classify.js.

// ─── Handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { author_id, article_id, body: commentBody, article_claims = [] } = req.body || {};

  if (!author_id || !article_id || !commentBody?.trim()) {
    return res.status(400).json({
      error: 'author_id, article_id, and body are required',
    });
  }

  // ── 1. Classify ──────────────────────────────────────────────────────────
  let classification;
  try {
    classification = await classifyComment(commentBody, article_claims);
  } catch (err) {
    console.error('Classification error:', err);
    return res.status(502).json({ error: 'Classification service unavailable' });
  }

  // ── 2. Write comment (status: pending_review until Stage 2 confirmed) ───
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      author_id,
      article_id,
      body: commentBody,
      status: 'pending_review',
    })
    .select()
    .single();

  if (commentError) {
    console.error('Comment insert error:', commentError);
    return res.status(500).json({ error: commentError.message });
  }

  // ── 3. Write classification record ───────────────────────────────────────
  const { data: classRecord, error: classError } = await supabase
    .from('classifications')
    .insert({
      comment_id:              comment.id,
      claim_text:              classification.claim_text,
      specificity:             classification.specificity,
      emotion:                 classification.emotion,
      tribal_markers:          classification.tribal_markers,
      tribal_example:          classification.tribal_example ?? null,
      article_engagement:      classification.article_engagement,
      opposing_view_engaged:   classification.opposing_view_engaged,
      ai_suggested_tier:       classification.ai_suggested_tier,
      // self_declared_tier is null until Stage 2 completes
      // final_tier is null until Stage 2 or community voting resolves it
      borderline_flag:         classification.borderline_flag,
      borderline_other_tier:   classification.borderline_other_tier ?? null,
      commenter_message:       classification.commenter_message,
    })
    .select()
    .single();

  if (classError) {
    // Non-fatal: log and continue. Comment is already committed.
    console.error('Classification insert error:', classError);
  }

  return res.status(200).json({
    comment,
    classification: {
      id:                  classRecord?.id ?? null,
      ai_suggested_tier:   classification.ai_suggested_tier,
      commenter_message:   classification.commenter_message,
      borderline_flag:     classification.borderline_flag,
      borderline_other_tier: classification.borderline_other_tier ?? null,
    },
  });
}
