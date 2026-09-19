/**
 * Classification contract: the shape of a Stage 1 result and the system prompt
 * that produces it. See docs/Dialecta_Classification_Engine_Specification.md
 * and docs/Dialecta_Editorial_Voice.md (commenter message rules).
 *
 * The prompt here descends from the live one in api/classify.js. Differences:
 *   1. Every em dash replaced with a colon or comma.
 *   2. The COMMENTER MESSAGE TONE section rewritten to Editorial Voice v1.2.
 *   3. The JSON contract keys and value domains are unchanged. The description of
 *      commenter_message says "two sentences" because the tone section requires it.
 * Bump CLASSIFIER_PROMPT_VERSION whenever the prompt text changes, so
 * classifications.prompt_version stays honest.
 */
import { isTier, type Tier } from './tiers';

export const CLASSIFIER_PROMPT_VERSION = '2026-09-19.1';

export type Specificity = 0 | 1 | 2 | 3;
export type Emotion = 'low' | 'medium' | 'high';
export type ArticleEngagement = 'specific' | 'general';

export interface ClassificationResult {
  claim_text: string;
  specificity: Specificity;
  emotion: Emotion;
  tribal_markers: boolean;
  tribal_example: string | null;
  article_engagement: ArticleEngagement;
  /**
   * The model answers "yes|partially|no". This is folded to a boolean:
   * "yes" and "partially" are true, "no" is false. A literal boolean is also accepted.
   */
  opposing_view_engaged: boolean;
  ai_suggested_tier: Tier;
  borderline_flag: boolean;
  borderline_other_tier: Tier | null;
  commenter_message: string;
}

export class ClassificationParseError extends Error {
  constructor(message: string, public readonly raw: string) {
    super(message);
    this.name = 'ClassificationParseError';
  }
}

/** Strips ``` and ```json fences that Haiku sometimes wraps around its JSON. */
export function stripCodeFences(text: string): string {
  return text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

function fail(raw: string, message: string): never {
  throw new ClassificationParseError(`Classification response invalid: ${message}`, raw);
}

function requireString(raw: string, obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (typeof v !== 'string') fail(raw, `"${key}" must be a string, got ${describe(v)}`);
  return v;
}

function requireStringOrNull(raw: string, obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  if (v === null || v === undefined) return null;
  if (typeof v !== 'string') fail(raw, `"${key}" must be a string or null, got ${describe(v)}`);
  return v;
}

function requireBoolean(raw: string, obj: Record<string, unknown>, key: string): boolean {
  const v = obj[key];
  if (typeof v !== 'boolean') fail(raw, `"${key}" must be a boolean, got ${describe(v)}`);
  return v;
}

function requireTier(raw: string, obj: Record<string, unknown>, key: string): Tier {
  const v = obj[key];
  const norm = typeof v === 'string' ? v.toLowerCase().trim() : v;
  if (!isTier(norm)) fail(raw, `"${key}" must be one of the seven tiers, got ${describe(v)}`);
  return norm;
}

function requireTierOrNull(raw: string, obj: Record<string, unknown>, key: string): Tier | null {
  const v = obj[key];
  if (v === null || v === undefined) return null;
  const norm = typeof v === 'string' ? v.toLowerCase().trim() : v;
  if (norm === '' || norm === 'null' || norm === 'none') return null;
  if (!isTier(norm)) fail(raw, `"${key}" must be a tier or null, got ${describe(v)}`);
  return norm;
}

function describe(v: unknown): string {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  return `${typeof v} ${JSON.stringify(v)}`;
}

/**
 * Parses and validates the raw text returned by the classifier model.
 * Throws ClassificationParseError with a field-level reason on any defect.
 */
export function parseClassification(raw: string): ClassificationResult {
  const clean = stripCodeFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch (err) {
    fail(raw, `not valid JSON (${err instanceof Error ? err.message : String(err)})`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    fail(raw, `expected a JSON object, got ${describe(parsed)}`);
  }
  const obj = parsed as Record<string, unknown>;

  const specificityRaw = obj.specificity;
  if (
    typeof specificityRaw !== 'number' ||
    !Number.isInteger(specificityRaw) ||
    specificityRaw < 0 ||
    specificityRaw > 3
  ) {
    fail(raw, `"specificity" must be an integer 0..3, got ${describe(specificityRaw)}`);
  }

  const emotion = requireString(raw, obj, 'emotion').toLowerCase().trim();
  if (emotion !== 'low' && emotion !== 'medium' && emotion !== 'high') {
    fail(raw, `"emotion" must be low, medium or high, got ${describe(obj.emotion)}`);
  }

  const engagement = requireString(raw, obj, 'article_engagement').toLowerCase().trim();
  if (engagement !== 'specific' && engagement !== 'general') {
    fail(raw, `"article_engagement" must be specific or general, got ${describe(obj.article_engagement)}`);
  }

  let opposing: boolean;
  const opposingRaw = obj.opposing_view_engaged;
  if (typeof opposingRaw === 'boolean') {
    opposing = opposingRaw;
  } else if (typeof opposingRaw === 'string') {
    const o = opposingRaw.toLowerCase().trim();
    if (o === 'yes' || o === 'partially' || o === 'true') opposing = true;
    else if (o === 'no' || o === 'false') opposing = false;
    else fail(raw, `"opposing_view_engaged" must be yes, partially or no, got ${describe(opposingRaw)}`);
  } else {
    fail(raw, `"opposing_view_engaged" must be yes, partially or no, got ${describe(opposingRaw)}`);
  }

  const tribalMarkers = requireBoolean(raw, obj, 'tribal_markers');
  const borderlineFlag = requireBoolean(raw, obj, 'borderline_flag');
  const commenterMessage = requireString(raw, obj, 'commenter_message').trim();
  if (commenterMessage.length === 0) fail(raw, '"commenter_message" must not be empty');

  return {
    claim_text: requireString(raw, obj, 'claim_text'),
    specificity: specificityRaw as Specificity,
    emotion,
    tribal_markers: tribalMarkers,
    tribal_example: requireStringOrNull(raw, obj, 'tribal_example'),
    article_engagement: engagement,
    opposing_view_engaged: opposing,
    ai_suggested_tier: requireTier(raw, obj, 'ai_suggested_tier'),
    borderline_flag: borderlineFlag,
    borderline_other_tier: requireTierOrNull(raw, obj, 'borderline_other_tier'),
    commenter_message: commenterMessage,
  };
}

const SYSTEM_PROMPT = `You are the classification engine for Dialecta, a platform that rewards constructive dialogue and honest debate. Your job is to analyze a comment and assign it to the correct tier.

## THE TIER SYSTEM

forum      : Specific claim, engaged with content, reasoning present. Strong disagreement is welcome here.
spark      : Interesting idea, but underdeveloped. Potential not yet realized.
echo       : Restates the article or a prior comment without adding to it.
fog        : Unclear. Reader cannot identify what the commenter believes.
heat       : Emotionally charged without a specific claim. Passion without a point.
stance     : Tribal framing, rhetoric, or identity signaling dominates. A position planted, not a conversation joined.
breach     : Personal attack on a person, not an idea. The Pact broken.

## CLAIM SPECIFICITY SCALE

0 : No claim (pure feeling, label, or tribal signal)
1 : Vague claim (you know which side they are on, not what they think)
2 : Specific claim (an identifiable proposition someone could engage with on substance)
3 : Developed claim (specific proposition plus supporting reasoning, evidence, or named counter-argument)

## CRITICAL EDGE CASE

A comment can be angry, sharp, or contemptuous and still be forum tier, provided it is anchored to a specific, arguable proposition. Emotional register alone is never the disqualifier. The absence of a claimable proposition is.

## COMMENTER MESSAGE TONE

Write observationally, never evaluatively. Describe what the comment does; do not judge the person.
Name what is present before what is missing. Start from what exists in the comment.
Exactly two sentences: the first is one observation, the second is one concrete move the commenter could make in thirty seconds.
Use the tier name as a descriptor: "This reads as Heat". Never "classified as" or "has been classified".
Never moralize. No appeals to the platform's values, no reminders of what Dialecta is for.
Every tier except breach ends with the door open. "Or post as-is" may be implied by the interface, so you may leave it off, but nothing in the message may close the door.
For forum, the second sentence names what the comment does well or where it could go further, and the door stays open.
No em dashes, no en dashes, and no exclamation points anywhere in the message.

Correct: "The feeling is clear, and there isn't yet a specific claim for others to engage with. One sentence about what specifically you think is wrong would likely move this to Forum."
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
  "commenter_message": "Two sentence message shown to the commenter."
}`;

/** Returns the classifier system prompt for CLASSIFIER_PROMPT_VERSION. */
export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

/**
 * Builds the user turn. Injecting the article's key claims lets the model judge
 * whether engagement is specific or general.
 */
export function buildUserMessage(commentBody: string, articleClaims: readonly string[] = []): string {
  const claimsBlock =
    articleClaims.length > 0
      ? `## ARTICLE KEY CLAIMS\n${articleClaims.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`
      : '';
  return `${claimsBlock}## THE COMMENT\n"${commentBody}"`;
}
