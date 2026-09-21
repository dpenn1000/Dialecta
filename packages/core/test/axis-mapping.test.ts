import { describe, expect, it } from 'vitest';
import {
  GRADUATION_CAP,
  axisDeltasFor,
  replayAxisScores,
  type AxisEvent,
  type AxisMappingContext,
  type ClassificationResult,
} from '../src/index';

// Worked Example 1 in docs/Dialecta_Axis_Mapping_v1.md ("Forum comment with full engagement"):
// final_tier=forum, specificity_score=3, tribal_markers=false, opposing_view_engaged=yes,
// article_engagement=specific. Reused as the base fixture and overridden per test, same as
// this file did before.
const forumComment: ClassificationResult = {
  claim_text: 'A developed claim.',
  specificity: 3,
  emotion: 'medium',
  tribal_markers: false,
  tribal_example: null,
  article_engagement: 'specific',
  opposing_view_engaged: 'yes',
  ai_suggested_tier: 'forum',
  borderline_flag: false,
  borderline_other_tier: null,
  commenter_message: 'Two sentences. One move.',
};

/** Same shape the old tests asserted against: one plain object keyed by axis name. */
function deltasOf(classification: ClassificationResult, context?: AxisMappingContext): Record<string, number> {
  return Object.fromEntries(axisDeltasFor(classification, context).map((d) => [d.axis, d.delta]));
}

describe('axisDeltasFor: the spec\'s five worked examples (Dialecta_Axis_Mapping_v1.md, "Worst-case examples")', () => {
  it('Forum comment with full engagement and a new topic: full credit on all six', () => {
    const deltas = deltasOf(forumComment, { articleTopic: 'economics', priorTopics: new Set() });
    expect(deltas).toEqual({
      acuity: 1,
      reach: 1,
      calibration: 1,
      magnanimity: 1,
      discourse: 1,
      consistency: 1,
    });
  });

  it('Echo comment that engages the article, topic already in history: Discourse and Consistency only', () => {
    const deltas = deltasOf(
      {
        ...forumComment,
        specificity: 0,
        opposing_view_engaged: 'no',
        article_engagement: 'specific',
        ai_suggested_tier: 'echo',
      },
      { articleTopic: 'economics', priorTopics: new Set(['economics']) },
    );
    expect(deltas).toEqual({
      acuity: 0,
      reach: 0,
      calibration: 0,
      magnanimity: 0,
      discourse: 1,
      consistency: 1,
    });
  });

  it('Heat comment: Consistency only', () => {
    const deltas = deltasOf({
      ...forumComment,
      specificity: 0,
      opposing_view_engaged: 'no',
      article_engagement: 'general',
      ai_suggested_tier: 'heat',
    });
    expect(deltas).toEqual({
      acuity: 0,
      reach: 0,
      calibration: 0,
      magnanimity: 0,
      discourse: 0,
      consistency: 1,
    });
  });

  it('Stance comment with a new topic: Reach and Consistency only (tribal_markers blocks Acuity and Calibration)', () => {
    const deltas = deltasOf(
      {
        ...forumComment,
        specificity: 1,
        tribal_markers: true,
        opposing_view_engaged: 'no',
        article_engagement: 'general',
        ai_suggested_tier: 'stance',
      },
      { articleTopic: 'climate', priorTopics: new Set() },
    );
    expect(deltas).toEqual({
      acuity: 0,
      reach: 1,
      calibration: 0,
      magnanimity: 0,
      discourse: 0,
      consistency: 1,
    });
  });

  it('Breach comment: nothing, even though every other field would otherwise qualify (Universal rule 1)', () => {
    const deltas = deltasOf({ ...forumComment, ai_suggested_tier: 'breach' }, {
      articleTopic: 'economics',
      priorTopics: new Set(),
    });
    expect(deltas).toEqual({
      acuity: 0,
      reach: 0,
      calibration: 0,
      magnanimity: 0,
      discourse: 0,
      consistency: 0,
    });
  });
});

describe('axisDeltasFor: old-vs-new contrast (this exact case asserted consistency: 0 before this change)', () => {
  it('gives a hot, tribal, claimless comment nothing except Consistency', () => {
    const deltas = deltasOf({
      ...forumComment,
      specificity: 0,
      emotion: 'high',
      tribal_markers: true,
      tribal_example: 'you people',
      article_engagement: 'general',
      opposing_view_engaged: 'no',
      ai_suggested_tier: 'stance',
    });
    expect(deltas).toEqual({
      acuity: 0,
      reach: 0,
      calibration: 0,
      magnanimity: 0,
      discourse: 0,
      consistency: 1,
    });
  });
});

describe('axisDeltasFor: Acuity (Per-axis triggers, Acuity row: specificity >= 1 AND tier in {forum, spark})', () => {
  it('fires at the specificity threshold on an eligible tier', () => {
    expect(deltasOf({ ...forumComment, specificity: 1, ai_suggested_tier: 'forum' }).acuity).toBe(1);
  });

  it('does not fire below the specificity threshold even on an eligible tier', () => {
    expect(deltasOf({ ...forumComment, specificity: 0, ai_suggested_tier: 'forum' }).acuity).toBe(0);
  });

  it('does not fire on a non-eligible tier even at full specificity', () => {
    expect(deltasOf({ ...forumComment, specificity: 3, ai_suggested_tier: 'echo' }).acuity).toBe(0);
  });

  it('fires on spark as well as forum', () => {
    expect(deltasOf({ ...forumComment, specificity: 2, ai_suggested_tier: 'spark' }).acuity).toBe(1);
  });
});

describe('axisDeltasFor: Reach (Reach row: a new topic for this member)', () => {
  it('fires when the article topic is not in the prior-topics set', () => {
    const deltas = deltasOf(forumComment, { articleTopic: 'housing', priorTopics: new Set(['economics']) });
    expect(deltas.reach).toBe(1);
  });

  it('does not fire when the topic is already in prior-topics', () => {
    const deltas = deltasOf(forumComment, { articleTopic: 'economics', priorTopics: new Set(['economics']) });
    expect(deltas.reach).toBe(0);
  });

  it('does not fire when no context is passed at all (single-argument call still works)', () => {
    expect(deltasOf(forumComment).reach).toBe(0);
  });

  it('does not fire when articleTopic is explicitly null', () => {
    expect(deltasOf(forumComment, { articleTopic: null, priorTopics: new Set() }).reach).toBe(0);
  });
});

describe('axisDeltasFor: Calibration (Calibration row: specificity >= 1 AND tribal_markers === false)', () => {
  it('fires on a specific, non-tribal claim', () => {
    expect(deltasOf({ ...forumComment, specificity: 1, tribal_markers: false }).calibration).toBe(1);
  });

  it('does not fire when tribal_markers is true, regardless of specificity', () => {
    expect(deltasOf({ ...forumComment, specificity: 3, tribal_markers: true }).calibration).toBe(0);
  });

  it('does not fire below the specificity threshold', () => {
    expect(deltasOf({ ...forumComment, specificity: 0, tribal_markers: false }).calibration).toBe(0);
  });

  it('is not gated by emotion (the spec note: "Emotion is not gated" is on this axis)', () => {
    expect(
      deltasOf({ ...forumComment, specificity: 2, tribal_markers: false, emotion: 'high' }).calibration,
    ).toBe(1);
  });
});

describe('axisDeltasFor: Magnanimity (Magnanimity row: opposing_view_engaged, yes or partially, equal weight)', () => {
  it('fires when the opposing view was engaged', () => {
    expect(deltasOf({ ...forumComment, opposing_view_engaged: 'yes' }).magnanimity).toBe(1);
  });

  it('fires on partially too, at the same weight ("Honest effort counts")', () => {
    expect(deltasOf({ ...forumComment, opposing_view_engaged: 'partially' }).magnanimity).toBe(1);
  });

  // The spec's Magnanimity row reads "+1 either way" and its "Tuning knobs"
  // table lists "Magnanimity yes vs partially weight | both +1 | Could make
  // partially +0.5 or +0". So equal weight is the setting today, and a test
  // that asserted a difference would be asserting the knob's future position
  // rather than the spec's current one. What the three-valued type buys is not
  // a different score now; it is that the knob remains turnable, because the
  // classification still records which of the two answers it was.
  it('scores partially and yes identically today, and the two are still distinguishable', () => {
    const partial = { ...forumComment, opposing_view_engaged: 'partially' } as const;
    const full = { ...forumComment, opposing_view_engaged: 'yes' } as const;
    expect(deltasOf(partial)).toEqual(deltasOf(full));
    expect(partial.opposing_view_engaged).not.toBe(full.opposing_view_engaged);
  });

  it('does not fire when it was not', () => {
    expect(deltasOf({ ...forumComment, opposing_view_engaged: 'no' }).magnanimity).toBe(0);
  });

  it('treats only "no" as the absence, so a new enum member would not silently score zero', () => {
    const scores = (['yes', 'partially', 'no'] as const).map(
      (answer) => deltasOf({ ...forumComment, opposing_view_engaged: answer }).magnanimity,
    );
    expect(scores).toEqual([1, 1, 0]);
  });

  it('is not gated by emotion, unlike the pre-fix code: high emotion still earns it', () => {
    expect(deltasOf({ ...forumComment, opposing_view_engaged: 'yes', emotion: 'high' }).magnanimity).toBe(1);
  });
});

describe('axisDeltasFor: Discourse (Discourse row: article_engagement === \'specific\', tier-independent)', () => {
  it('fires on specific engagement regardless of tier', () => {
    expect(deltasOf({ ...forumComment, article_engagement: 'specific', ai_suggested_tier: 'echo' }).discourse).toBe(
      1,
    );
  });

  it('does not fire on general engagement (no partial credit; "What\'s NOT in v1")', () => {
    expect(deltasOf({ ...forumComment, article_engagement: 'general' }).discourse).toBe(0);
  });
});

describe('axisDeltasFor: Consistency (Consistency row: every non-Breach comment)', () => {
  it.each(['forum', 'spark', 'echo', 'fog', 'heat', 'stance'] as const)('fires for tier %s', (tier) => {
    expect(deltasOf({ ...forumComment, ai_suggested_tier: tier }).consistency).toBe(1);
  });

  it('never fires for breach', () => {
    expect(deltasOf({ ...forumComment, ai_suggested_tier: 'breach' }).consistency).toBe(0);
  });
});

describe('axisDeltasFor: shape', () => {
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

  it('still returns all six axes for a breach comment, all zero, rather than a shorter array', () => {
    const deltas = axisDeltasFor({ ...forumComment, ai_suggested_tier: 'breach' });
    expect(deltas.map((d) => d.axis)).toEqual([
      'acuity',
      'reach',
      'calibration',
      'magnanimity',
      'discourse',
      'consistency',
    ]);
    expect(deltas.every((d) => d.delta === 0)).toBe(true);
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
