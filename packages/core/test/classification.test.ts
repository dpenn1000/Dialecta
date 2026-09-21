import { describe, expect, it } from 'vitest';
import {
  CLASSIFIER_PROMPT_VERSION,
  ClassificationParseError,
  buildSystemPrompt,
  buildUserMessage,
  parseClassification,
  type OpposingViewEngagement,
} from '../src/index';

/**
 * The live domain of public.opposing_view_level, the enum behind
 * classifications.opposing_view_engaged. Read from pg_enum on project
 * mguulnibvzusfvyuowwh and independently present in supabase/types.ts
 * ('opposing_view_level: "yes" | "partially" | "no"'). Written out here rather
 * than imported because packages/core does no I/O and knows nothing about
 * Supabase; this constant is what makes the round-trip assertions below a check
 * against the database's shape instead of against this package's own opinion.
 */
const LIVE_OPPOSING_VIEW_ENUM = ['yes', 'partially', 'no'] as const;

const valid = {
  claim_text: 'Rooftop solar subsidies mostly benefit homeowners who could already afford panels.',
  specificity: 2,
  emotion: 'medium',
  tribal_markers: false,
  tribal_example: null,
  article_engagement: 'specific',
  opposing_view_engaged: 'partially',
  ai_suggested_tier: 'forum',
  borderline_flag: true,
  borderline_other_tier: 'spark',
  commenter_message:
    'This names a specific distributional effect and ties it to the article. Citing where the subsidy data comes from would make the claim easier to test.',
};

describe('parseClassification', () => {
  it('parses unfenced JSON', () => {
    const r = parseClassification(JSON.stringify(valid));
    expect(r.ai_suggested_tier).toBe('forum');
    expect(r.specificity).toBe(2);
    expect(r.opposing_view_engaged).toBe('partially');
    expect(r.borderline_other_tier).toBe('spark');
    expect(r.tribal_example).toBeNull();
  });

  it('parses JSON wrapped in ```json fences', () => {
    const fenced = '```json\n' + JSON.stringify(valid, null, 2) + '\n```';
    const r = parseClassification(fenced);
    expect(r.ai_suggested_tier).toBe('forum');
  });

  it('parses JSON wrapped in bare ``` fences', () => {
    const fenced = '```\n' + JSON.stringify(valid) + '\n```';
    expect(parseClassification(fenced).claim_text).toBe(valid.claim_text);
  });

  it('normalizes tier case and keeps opposing_view_engaged three-valued', () => {
    const r = parseClassification(
      JSON.stringify({ ...valid, ai_suggested_tier: 'Heat', opposing_view_engaged: 'no' }),
    );
    expect(r.ai_suggested_tier).toBe('heat');
    expect(r.opposing_view_engaged).toBe('no');
  });

  it('throws a descriptive error on a bad tier', () => {
    const bad = JSON.stringify({ ...valid, ai_suggested_tier: 'static' });
    expect(() => parseClassification(bad)).toThrow(ClassificationParseError);
    expect(() => parseClassification(bad)).toThrow(/ai_suggested_tier/);
  });

  it('throws on a bad borderline_other_tier', () => {
    const bad = JSON.stringify({ ...valid, borderline_other_tier: 'off the air' });
    expect(() => parseClassification(bad)).toThrow(/borderline_other_tier/);
  });

  it('throws on specificity outside 0..3', () => {
    expect(() => parseClassification(JSON.stringify({ ...valid, specificity: 4 }))).toThrow(/specificity/);
    expect(() => parseClassification(JSON.stringify({ ...valid, specificity: '2' }))).toThrow(/specificity/);
  });

  it('throws on missing fields and on non-JSON', () => {
    const { commenter_message: _omit, ...missing } = valid;
    expect(() => parseClassification(JSON.stringify(missing))).toThrow(/commenter_message/);
    expect(() => parseClassification('Sure, here is the analysis.')).toThrow(/not valid JSON/);
  });
});

/**
 * These cases exist because the field used to be a boolean. Every one of them
 * would have passed, or could not have been written at all, under the fold:
 * "partially" and "yes" both arrived as true, so nothing downstream could tell
 * them apart, and the row written to classifications.opposing_view_engaged said
 * "yes" for both. docs/Dialecta_Axis_Mapping_v1.md carries "TUNING: weight
 * differential between yes and partially" against the Magnanimity row, and that
 * knob needs the stored value to still say which one it was.
 */
describe('parseClassification: opposing_view_engaged is three-valued', () => {
  const parseOpposing = (value: unknown): OpposingViewEngagement =>
    parseClassification(JSON.stringify({ ...valid, opposing_view_engaged: value })).opposing_view_engaged;

  it('keeps each of the model\'s three answers as itself', () => {
    expect(parseOpposing('yes')).toBe('yes');
    expect(parseOpposing('partially')).toBe('partially');
    expect(parseOpposing('no')).toBe('no');
  });

  it('carries a partially answer through to a value the live enum accepts', () => {
    const parsed = parseClassification(JSON.stringify({ ...valid, opposing_view_engaged: 'partially' }));
    // The round trip that mattered: what this produces is what the comment
    // route hands to the classifications insert, with no widening step between.
    const forInsert: OpposingViewEngagement = parsed.opposing_view_engaged;
    expect(LIVE_OPPOSING_VIEW_ENUM).toContain(forInsert);
    expect(forInsert).toBe('partially');
    expect(forInsert).not.toBe('yes');
  });

  it('never produces a value outside the live enum, whatever the model answers', () => {
    for (const answer of ['yes', 'PARTIALLY', ' no ', true, false, 'true', 'false']) {
      expect(LIVE_OPPOSING_VIEW_ENUM).toContain(parseOpposing(answer));
    }
  });

  it('normalizes case and surrounding space without losing which answer it was', () => {
    expect(parseOpposing('  Partially ')).toBe('partially');
    expect(parseOpposing('YES')).toBe('yes');
    expect(parseOpposing('No')).toBe('no');
  });

  it('still accepts a literal boolean, since the model sometimes answers with one', () => {
    expect(parseOpposing(true)).toBe('yes');
    expect(parseOpposing(false)).toBe('no');
    expect(parseOpposing('true')).toBe('yes');
    expect(parseOpposing('false')).toBe('no');
  });

  it('rejects anything else with the field named', () => {
    expect(() => parseOpposing('sort of')).toThrow(/opposing_view_engaged/);
    expect(() => parseOpposing(1)).toThrow(/opposing_view_engaged/);
    expect(() => parseOpposing(null)).toThrow(/opposing_view_engaged/);
  });
});

describe('prompt', () => {
  it('has a version and contains no em or en dashes', () => {
    expect(CLASSIFIER_PROMPT_VERSION).toBe('2026-09-19.1');
    const prompt = buildSystemPrompt();
    expect(prompt).not.toMatch(/[\u2014\u2013]/);
    expect(prompt).toContain('## COMMENTER MESSAGE TONE');
    expect(prompt).toContain('"ai_suggested_tier": "forum|spark|echo|fog|heat|stance|breach"');
  });

  it('builds the user message with numbered claims', () => {
    const msg = buildUserMessage('Hello', ['Claim A', 'Claim B']);
    expect(msg).toContain('1. Claim A');
    expect(msg).toContain('## THE COMMENT\n"Hello"');
    expect(buildUserMessage('x')).not.toContain('ARTICLE KEY CLAIMS');
  });
});
