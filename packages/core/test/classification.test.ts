import { describe, expect, it } from 'vitest';
import {
  CLASSIFIER_PROMPT_VERSION,
  ClassificationParseError,
  buildSystemPrompt,
  buildUserMessage,
  parseClassification,
} from '../src/index';

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
    expect(r.opposing_view_engaged).toBe(true);
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

  it('normalizes tier case and folds opposing_view_engaged to a boolean', () => {
    const r = parseClassification(
      JSON.stringify({ ...valid, ai_suggested_tier: 'Heat', opposing_view_engaged: 'no' }),
    );
    expect(r.ai_suggested_tier).toBe('heat');
    expect(r.opposing_view_engaged).toBe(false);
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
