import Anthropic from '@anthropic-ai/sdk';
import { applyCors } from './_cors.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { body, author_id, article_id, article_claims } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const prompt = `You are Dialecta's comment classification engine. Your job is to analyze a comment and return a structured JSON classification.

TIER DEFINITIONS:
- forum: Claim specificity level 2 or higher. Constructive regardless of emotion. A specific, arguable proposition someone could engage with on substance.
- spark: Interesting but underdeveloped. Level 1-2 claim that stops short. Invites expansion.
- echo: Restates the article or a prior comment without adding to it. Level 0-1. ALSO: positive sentiment that just agrees ("love this", "great point", "well said") without adding a claim is Echo.
- fog: Vague, unclear. Reader cannot determine what the person believes. Level 0. Includes positive-but-vague comments like "I love positive outlooks on humanity" that express a feeling but contain no specific belief the reader can identify.
- heat: High OPPOSITIONAL or NEGATIVE emotional charge (anger, outrage, frustration, contempt, derision) without a specific claim. Heated arguing without a point. **Positive enthusiasm without a claim is NEVER Heat — route it to Echo (if it agrees with the article) or Fog (if the reader can't tell what the commenter actually believes).**
- stance: Tribal framing dominant. Identity-signaling or rhetorical markers overshadow any claim present.
- breach: Personal attack, slander, or targeted harassment. Content that must be suppressed.

EMOTIONAL VALENCE MATTERS FOR HEAT:
The Heat tier exists to identify heated arguing — anger, outrage, contempt, frustration, indignation, derision. Comments expressing love, hope, admiration, gratitude, or enthusiasm for an idea are NOT Heat, even when emotionally charged. The "high emotion" signal must be paired with negative or oppositional valence to qualify as Heat. When in doubt, ask: would another reader feel attacked, dismissed, or talked-past by this comment? If no, it isn't Heat.

CLAIM SPECIFICITY LEVELS:
- 0: No claim. Pure feeling, label, or tribal signal.
- 1: Vague claim. An assertion exists but too general to engage with specifically.
- 2: Specific claim. An identifiable proposition someone could directly agree or disagree with.
- 3: Developed claim. Specific proposition with supporting reasoning, evidence, or named counter-argument.

ARTICLE CLAIMS (what this article argues):
${article_claims ? article_claims.join('\n') : 'Not provided'}

COMMENT TO CLASSIFY:
"${body}"

EDITORIAL VOICE PRINCIPLE FOR THE STRENGTH FIELD:
The "strength" field is the platform's Growth Frame moment. It names what the comment is doing well. Even comments classified into lower tiers have something the platform should reflect back: they may have an honest emotional register, a real attempt at engagement, an underdeveloped but interesting seed of an idea. Name what is there, not what is missing. The strength field is observational, not flattering. If a comment is bad-faith, the strength field should still find one true thing about it (often: the commenter cares about the topic). Never invent qualities that aren't in the comment.

Respond with ONLY a valid JSON object in this exact shape:
{
  "claim_text": "the core claim being made, or null if none",
  "strength": "1 sentence naming what this comment does well. Name what is there, not what is missing.",
  "specificity": 0,
  "emotion": "low|medium|high",
  "tribal_markers": false,
  "tribal_example": null,
  "article_engagement": "specific|general|none",
  "opposing_view_engaged": "yes|partially|no",
  "ai_suggested_tier": "forum|spark|echo|fog|heat|stance|breach",
  "borderline_flag": false,
  "borderline_other_tier": null,
  "commenter_message": "1-2 sentence plain-language reflection shown to the commenter. Specific, non-judgmental, names the tier and one concrete reason."
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
const classification = JSON.parse(cleaned);

    return res.status(200).json(classification);
  } catch (error) {
    console.error('Classification error:', error);
    return res.status(500).json({ error: 'Classification failed', detail: error.message });
  }
}