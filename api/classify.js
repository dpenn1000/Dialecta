/**
 * POST /api/classify
 *
 * Classifies a comment body using Claude Haiku and returns structured
 * Stage A + Stage B data ready to be written to the classifications table.
 *
 * Body: { body: string, article_claims?: string[] }
 *
 * Response: {
 *   claim_text, specificity, emotion, tribal_markers, tribal_example,
 *   article_engagement, opposing_view_engaged,
 *   ai_suggested_tier, borderline_flag, borderline_other_tier,
 *   commenter_message
 * }
 *
 * The prompt and Anthropic call live in api/_classify.js so this endpoint and
 * the inlined path in api/comment.js share one source of truth.
 *
 * Env vars required:
 *   ANTHROPIC_API_KEY
 */

import { classifyComment, ClassificationError } from './_classify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { body: commentBody, article_claims = [] } = req.body || {};

  if (!commentBody?.trim()) {
    return res.status(400).json({ error: 'body is required' });
  }

  try {
    const result = await classifyComment(commentBody, article_claims);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof ClassificationError && err.kind === 'parse') {
      console.error('Failed to parse classify response:', err.raw);
      return res.status(500).json({ error: 'Malformed classification response', raw: err.raw });
    }
    console.error('Classify error:', err);
    return res.status(502).json({ error: 'Classification service unavailable' });
  }
}
