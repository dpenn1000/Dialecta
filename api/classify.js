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
 * Env vars required:
 *   ANTHROPIC_API_KEY
 */

const SYSTEM_PROMPT = `You are the classification engine for Dialecta — a platform that rewards constructive dialogue and honest debate. Your job is to analyze a comment and assign it to the correct tier.

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

Write observationally, not evaluatively. Describe what is present in the comment. If the tier is below forum, include one concrete suggestion for what would elevate it. Do not moralize. 1–2 sentences maximum.

Correct: "This reads as Heat — the feeling is clear but there isn't a specific claim for others to engage with. Adding one sentence about what specifically you think is wrong would likely move this to Forum."
Wrong: "Your comment doesn't make a specific point and relies too much on emotional language."

## OUTPUT

Respond ONLY with valid JSON. No preamble, no markdown, no explanation outside the JSON.

{
  "claim_text": "The claim in the comment, paraphrased or quoted. 'None identified' if absent.",
  "specificity": 0,
  "emotion": "low|medium|high",
  "tribal_markers": false,
  "tribal_example": "Brief excerpt if tribal_markers is true, otherwise null",
  "article_engagement": "specific|general",
  "opposing_view_engaged": "yes|partially|no",
  "ai_suggested_tier": "forum|spark|echo|fog|heat|stance|breach",
  "borderline_flag": false,
  "borderline_other_tier": "The other tier if borderline, otherwise null",
  "commenter_message": "1–2 sentence message shown to the commenter."
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { body: commentBody, article_claims = [] } = req.body || {};

  if (!commentBody?.trim()) {
    return res.status(400).json({ error: 'body is required' });
  }

  // Build the user message. Injecting article claims gives the model the
  // context it needs to judge engagement quality (specific vs. general).
  const claimsBlock =
    article_claims.length > 0
      ? `## ARTICLE KEY CLAIMS\n${article_claims.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`
      : '';

  const userMessage = `${claimsBlock}## THE COMMENT\n"${commentBody}"`;

  let raw;
  try {
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
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'Classification service unavailable' });
    }

    raw = await response.json();
  } catch (err) {
    console.error('Classify fetch error:', err);
    return res.status(502).json({ error: 'Classification service unavailable' });
  }

  const text = raw?.content?.[0]?.text ?? '';

  let result;
  try {
    // Strip any accidental markdown fences before parsing
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    result = JSON.parse(clean);
  } catch {
    console.error('Failed to parse classify response:', text);
    return res.status(500).json({ error: 'Malformed classification response', raw: text });
  }

  // Normalize tier name to lowercase for consistent DB writes
  result.ai_suggested_tier = (result.ai_suggested_tier ?? '').toLowerCase().trim();

  return res.status(200).json(result);
}
