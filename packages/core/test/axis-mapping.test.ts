import { describe, expect, it } from 'vitest';
import {
  GRADUATION_CAP,
  axisDeltasFor,
  replayAxisScores,
  type AxisEvent,
  type ClassificationResult,
} from '../src/index';

const forumComment: ClassificationResult = {
  claim_text: 'A developed claim.',
  specificity: 3,
  emotion: 'medium',
  tribal_markers: false,
  tribal_example: null,
  article_engagement: 'specific',
  opposing_view_engaged: true,
  ai_suggested_tier: 'forum',
  borderline_flag: false,
  borderline_other_tier: null,
  commenter_message: 'Two sentences. One move.',
};

describe('axisDeltasFor', () => {
  it('gives a fully developed forum comment a full unit on every axis but consistency', () => {
    const deltas = Object.fromEntries(axisDeltasFor(forumComment).map((d) => [d.axis, d.delta]));
    expect(deltas).toEqual({
      acuity: 1,
      reach: 1,
      calibration: 1,
      magnanimity: 1,
      discourse: 1,
      consistency: 0,
    });
  });

  it('gives a hot, tribal, claimless comment almost nothing', () => {
    const deltas = Object.fromEntries(
      axisDeltasFor({
        ...forumComment,
        specificity: 0,
        emotion: 'high',
        tribal_markers: true,
        tribal_example: 'you people',
        article_engagement: 'general',
        opposing_view_engaged: false,
        ai_suggested_tier: 'stance',
      }).map((d) => [d.axis, d.delta]),
    );
    expect(deltas).toEqual({
      acuity: 0,
      reach: 0,
      calibration: 0,
      magnanimity: 0,
      discourse: 0,
      consistency: 0,
    });
  });

  it('always returns all six axes in pillar order', () => {
    expect(axisDeltasFor(forumComment).map((d) => d.axis)).toEqual([
      'acuity',
      'reach',
      'calibration',
      'magnanimity',
      'discourse',
      'consistency',
    ]);
  });
});

describe('replayAxisScores', () => {
  const ledger: AxisEvent[] = [
    { axis: 'acuity', delta: 0.75, tier_at_contribution: 'forum' },
    { axis: 'acuity', delta: 0.25, tier_at_contribution: 'spark' },
    { axis: 'acuity', delta: 0.75, tier_at_contribution: 'forum' },
    { axis: 'reach', delta: 0.5, tier_at_contribution: 'echo' },
    { axis: 'discourse', delta: 1, tier_at_contribution: 'forum' },
  ];

  it('sums deltas and floors graduations', () => {
    const s = replayAxisScores(ledger);
    expect(s.acuity.rawTotal).toBeCloseTo(1.75);
    expect(s.acuity.graduationCount).toBe(1);
    expect(s.acuity.tierMix).toEqual({ forum: 2, spark: 1 });
    expect(s.reach.graduationCount).toBe(0);
    expect(s.discourse.graduationCount).toBe(1);
    expect(s.consistency.rawTotal).toBe(0);
  });

  it('is order independent', () => {
    const a = replayAxisScores(ledger);
    const b = replayAxisScores([...ledger].reverse());
    expect(b).toEqual(a);
  });

  it('caps graduations at GRADUATION_CAP but keeps the raw total', () => {
    const many: AxisEvent[] = Array.from({ length: 40 }, () => ({ axis: 'discourse', delta: 1 }));
    const s = replayAxisScores(many);
    expect(s.discourse.graduationCount).toBe(GRADUATION_CAP);
    expect(s.discourse.rawTotal).toBe(40);
  });

  it('rejects an unknown axis', () => {
    expect(() => replayAxisScores([{ axis: 'charisma' as never, delta: 1 }])).toThrow(/Unknown axis/);
  });
});
