/**
 * api/_classify.js — Shared classification logic for Dialecta.
 *
 * Files in /api prefixed with an underscore are treated by Vercel as helper
 * modules, NOT as serverless function endpoints. This is the single source of
 * truth for the classification prompt and the Anthropic call, imported by:
 *
 *   api/classify.js — the standalone POST /api/classify endpoint
 *   api/comment.js  — inlined on the comment-submission hot path
 *
 * Previously each file carried its own copy of the prompt with a "keep in sync"
 * comment; the copies had already drifted. Edit the prompt here and both
 * endpoints stay consistent.
 */

export const CLASSIFY_SYSTEM_PROMPT = `You are the classification engine for Dialecta — a platform that rewards constructive dialogue and honest debate. Your job is to analyze a comment and assign it to the correct tier.

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

/**
 * Thrown by classifyComment so callers can map failure modes to HTTP codes.
 *   kind: 'upstream' — the Anthropic request failed or returned non-2xx
 *   kind: 'parse'    — the model response could not be parsed as JSON
 */
export class ClassificationError extends Error {
  constructor(message, kind, raw) {
    super(message);
    this.name = 'ClassificationError';
    this.kind = kind;
    this.raw = raw;
  }
}

/**
 * classifyComment — run a comment through the classification model.
 *
 * @param {string}   commentBody   The comment text to classify.
 * @param {string[]} articleClaims Optional key claims from the article, which
 *                                 improve the engagement judgement.
 * @returns {Promise<object>} Parsed classification result (see prompt schema).
 *                            `ai_suggested_tier` is normalized to lowercase.
 * @throws {ClassificationError}
 *
 * Env vars required: ANTHROPIC_API_KEY
 */
export async function classifyComment(commentBody, articleClaims = []) {
  // Injecting article claims gives the model the context it needs to judge
  // engagement quality (specific vs. general).
  const claimsBlock =
    articleClaims.length > 0
      ? `## ARTICLE KEY CLAIMS\n${articleClaims.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`
      : '';

  const userMessage = `${claimsBlock}## THE COMMENT\n"${commentBody}"`;

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
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
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
  } catch (err) {
    throw new ClassificationError(`Anthropic request failed: ${err.message}`, 'upstream');
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new ClassificationError(`Anthropic API returned ${response.status}`, 'upstream', errText);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text ?? '';

  let result;
  try {
    // Strip any accidental markdown fences before parsing.
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    result = JSON.parse(clean);
  } catch {
    throw new ClassificationError('Malformed classification response', 'parse', text);
  }

  // Normalize tier name to lowercase for consistent DB writes.
  result.ai_suggested_tier = (result.ai_suggested_tier ?? '').toLowerCase().trim();
  return result;
}
