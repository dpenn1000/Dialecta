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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── Inline classification ────────────────────────────────────────────────
// Shared with /api/classify but inlined here to avoid an extra HTTP round
// trip on the hot path. Keep the two prompts in sync.

const CLASSIFY_SYSTEM_PROMPT = `You are the classification engine for Dialecta — a platform that rewards constructive dialogue and honest debate. Your job is to analyze a comment and assign it to the correct tier.

## THE TIER SYSTEM

forum      — Specific claim, engaged with content, reasoning present. Strong disagreement is welcome here.
spark      — Interesting idea, but underdeveloped. Potential not yet realized.
echo       — Restates the article or a prior comment without adding to it.
fog        — Unclear. Reader cannot identify what the commenter believes.
heat       — Emotionally charged without a specific claim. Passion without a point.
stance     — Tribal framing, rhetoric, or identity signaling dominates. A position planted, not a conversation joined.
breach     — Personal attack on a person, not an idea. The Pact broken.

## CLAIM SPECIFICITY SCALE

0 — No claim (pure feeling, label, or tribal signal)
1 — Vague claim (you know which side they are on, not what they think)
2 — Specific claim (an identifiable proposition someone could engage with on substance)
3 — Developed claim (specific proposition + supporting reasoning, evidence, or named counter-argument)

## CRITICAL EDGE CASE

A comment can be angry, sharp, or contemptuous and still be forum tier — provided it is anchored to a specific, arguable proposition. Emotional register alone is never the disqualifier. The absence of a claimable proposition is.

## COMMENTER MESSAGE TONE

Write observationally, not evaluatively. If the tier is below forum, include one concrete suggestion. Do not moralize. 1–2 sentences maximum.

## OUTPUT

Respond ONLY with valid JSON. No preamble, no markdown, no explanation outside the JSON.

{
  "claim_text": "The claim paraphrased or quoted. 'None identified' if absent.",
  "specificity": 0,
  "emotion": "low|medium|high",
  "tribal_markers": false,
  "tribal_example": null,
  "article_engagement": "specific|general",
  "opposing_view_engaged": "yes|partially|no",
  "ai_suggested_tier": "forum|spark|echo|fog|heat|stance|breach",
  "borderline_flag": false,
  "borderline_other_tier": null,
  "commenter_message": "1–2 sentence message shown to the commenter."
}`;

async function classifyComment(commentBody, articleClaims = []) {
  const claimsBlock =
    articleClaims.length > 0
      ? `## ARTICLE KEY CLAIMS\n${articleClaims.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`
      : '';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: CLASSIFY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${claimsBlock}## THE COMMENT\n"${commentBody}"`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error('Anthropic API returned ' + response.status);

  const data = await response.json();
  const text = data?.content?.[0]?.text ?? '';
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const result = JSON.parse(clean);
  result.ai_suggested_tier = (result.ai_suggested_tier ?? '').toLowerCase().trim();
  return result;
}

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
