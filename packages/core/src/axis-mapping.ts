/**
 * Axis mapping: turns one classification into per-axis deltas for the
 * append-only axis_events ledger, and replays that ledger into axis_scores.
 *
 * Spec: docs/Dialecta_Axis_Mapping_v1.md ("Per-axis triggers" and "Universal
 * rules" sections). See also docs/Dialecta_Contributor_Identity.md and
 * docs/Dialecta_Data_Architecture.md (entities 3 and 4, and the Fingerprint
 * pipeline). Scores are never updated incrementally; they are always a
 * replay of the ledger, so a rule change can be re-applied to history.
 *
 * This file used to implement a different, continuous, partial-credit
 * scheme that read different input fields per axis than the spec names and
 * was never a rounding of the spec's own trigger table. See
 * team/reviewer/knowledge/2026-recovered-axis-mapping-comparison.md for the
 * axis-by-axis comparison that this rewrite closes out.
 */
import type { ClassificationResult } from './classification';
import { PILLAR_IDS, type Axis } from './pillars';
import type { Tier } from './tiers';

export interface AxisDelta {
  axis: Axis;
  delta: number;
}

/** A graduation is one whole unit of cumulative delta. The fingerprint shows at most this many. */
export const GRADUATION_CAP = 22; // TUNING: matches the 22 marks on the fingerprint prototype

// TUNING: Acuity specificity threshold (spec "Per-axis triggers", Acuity row; "Tuning knobs" table).
const ACUITY_SPECIFICITY_MIN = 1;

// TUNING: Acuity tier eligibility (same row). Only Forum and Spark carry a claim worth grading.
const ACUITY_ELIGIBLE_TIERS = new Set<Tier>(['forum', 'spark']);

// TUNING: Calibration specificity threshold (spec "Per-axis triggers", Calibration row).
const CALIBRATION_SPECIFICITY_MIN = 1;

// Tiers that earn nothing on any axis (spec "Universal rules" #1: "Breach comments produce no
// axis_events at all. They are suppressed by design and don't shape identity.")
const SUPPRESSED_TIERS = new Set<Tier>(['breach']);

const NO_TOPICS: ReadonlySet<string> = new Set<string>();

/**
 * The inputs the spec's trigger table needs that a single classification
 * cannot answer by itself.
 *
 * Reach's trigger (spec "Per-axis triggers", Reach row) is "primary_tag of
 * the comment's article is a topic this member hasn't engaged before."
 * ClassificationResult is one comment's Stage 1 output: it has no concept of
 * the article it was posted under, and none of the member's history on other
 * articles, so both have to come from the caller. Evidenced by
 * _recovered/api/_axis-mapping.js's deriveAxisEvents, which takes the same
 * two fields (articleTopic, priorTopics) for the same reason; quarantined,
 * cited here only as evidence of the shape a real caller needs, not as
 * source brought into this package.
 */
export interface AxisMappingContext {
  /** The comment's article's primary_tag. Omit or pass null when it is not known. */
  articleTopic?: string | null;
  /** Topics this member already holds a Reach graduation for. */
  priorTopics?: ReadonlySet<string>;
}

/**
 * Returns one delta per axis (six entries, always in PILLAR_IDS order) for a
 * single classification. Every entry is 0 or 1: the spec's trigger table is
 * binary throughout ("Graduation delta +1" on every row, and "What's NOT in
 * v1" is explicit that there is "no cross-axis bonus... each axis is binary
 * +1 per triggered comment in v1").
 *
 * Breach comments (Universal rule 1) return all zeros, overriding whatever
 * their other fields would otherwise trigger. Rules 2-5 (Echo/Fog/Heat/
 * Stance still earn what their own fields trigger; Forum and Spark earn the
 * same +1; every triggered axis's tier belongs in the ledger row's
 * tier_mix; graduations never decay) need no extra code here: they fall out
 * of applying the same six conditions uniformly, or are the caller's job
 * once it turns a nonzero delta into an axis_events row (tier_mix in
 * particular: the caller already has the tier it called this function
 * with). Rule 6 (re-classification supersedes prior events) is a caller
 * concern too, a delete-then-recompute around this function rather than a
 * property of one classification; see
 * team/reviewer/knowledge/2026-axis-mapping-malleability-window.md. None of
 * rule 6, the article-side mapping (spec v1.1 addendum), or a
 * re-classification path are implemented anywhere in this package yet; this
 * change does not add them.
 */
export function axisDeltasFor(
  classification: ClassificationResult,
  context: AxisMappingContext = {},
): AxisDelta[] {
  const c = classification;
  const { articleTopic = null, priorTopics = NO_TOPICS } = context;

  // OPEN SPEC QUESTION, not decided here: the trigger table is written
  // against `final_tier`, the Stage 3 resolved tier (resolveFinalTier, in
  // ./resolution). ClassificationResult only carries `ai_suggested_tier`,
  // Stage 1's output; resolution is a separate step this function is never
  // handed, and backlog B-1 describes axis events as written "on
  // resolution." Treated as this function's only available notion of
  // "tier," matching this file's behavior before this change. Flagged for
  // spec-reader/decider rather than silently resolved either way.
  const tier = c.ai_suggested_tier;

  if (SUPPRESSED_TIERS.has(tier)) {
    return PILLAR_IDS.map((axis) => ({ axis, delta: 0 }));
  }

  // Acuity (spec "Per-axis triggers", Acuity row): specificity_score >= 1
  // AND final_tier in {forum, spark}.
  const acuity = c.specificity >= ACUITY_SPECIFICITY_MIN && ACUITY_ELIGIBLE_TIERS.has(tier) ? 1 : 0;

  // Reach (Reach row): the article's topic is new for this member. The only
  // trigger that needs AxisMappingContext; see its doc comment above.
  const reach = articleTopic && !priorTopics.has(articleTopic) ? 1 : 0;

  // Calibration (Calibration row): specificity_score >= 1 AND
  // tribal_markers === false. Emotion is explicitly not gated here: "passion
  // with substance is calibrated. The anti-signal is tribal framing."
  const calibration = c.specificity >= CALIBRATION_SPECIFICITY_MIN && !c.tribal_markers ? 1 : 0;

  // Magnanimity (Magnanimity row): opposing_view_engaged, yes or partially,
  // both +1 ("Honest effort counts"). ClassificationResult already folds
  // "yes"/"partially" to true at parse time (classification.ts), so there is
  // no separate partial-credit branch to write here. No emotion gate: the
  // spec's emotion note lives on Calibration, not on this axis; the old code
  // added one here that the spec does not have.
  const magnanimity = c.opposing_view_engaged ? 1 : 0;

  // Discourse (Discourse row): article_engagement === 'specific'.
  // Tier-independent (rule 2 gives Echo the same credit as Forum here when
  // it engages the article); the Breach exception is the suppression guard
  // above, not a per-tier table.
  const discourse = c.article_engagement === 'specific' ? 1 : 0;

  // Consistency (Consistency row): every non-Breach comment. "The act of
  // returning to the conversation IS the signal": no history, no variance,
  // nothing beyond the tier already read above. Breach already returned
  // above, so every classification that reaches this line earns it.
  const consistency = 1;

  return [
    { axis: 'acuity', delta: acuity },
    { axis: 'reach', delta: reach },
    { axis: 'calibration', delta: calibration },
    { axis: 'magnanimity', delta: magnanimity },
    { axis: 'discourse', delta: discourse },
    { axis: 'consistency', delta: consistency },
  ];
}

/** One row of the axis_events ledger. Extra columns are ignored. */
export interface AxisEvent {
  axis: Axis;
  delta: number;
  tier_at_contribution?: Tier | null;
}

export interface AxisScore {
  axis: Axis;
  /** floor(rawTotal), capped at GRADUATION_CAP, never below 0. */
  graduationCount: number;
  /** Uncapped sum of deltas. */
  rawTotal: number;
  /** How many contributing events carried each tier. */
  tierMix: Partial<Record<Tier, number>>;
  eventCount: number;
}

export type AxisScores = Record<Axis, AxisScore>;

/**
 * Replays an append-only ledger into scores. Pure and order independent: the
 * same events in any order produce the same result. Callers must always pass
 * the full ledger for a contributor, never a delta since last time.
 */
export function replayAxisScores(events: Iterable<AxisEvent>): AxisScores {
  const scores = {} as AxisScores;
  for (const axis of PILLAR_IDS) {
    scores[axis] = { axis, graduationCount: 0, rawTotal: 0, tierMix: {}, eventCount: 0 };
  }

  for (const ev of events) {
    const score = scores[ev.axis];
    if (!score) throw new Error(`Unknown axis in ledger: ${String(ev.axis)}`);
    if (typeof ev.delta !== 'number' || Number.isNaN(ev.delta)) {
      throw new Error(`Bad delta in ledger for ${ev.axis}: ${String(ev.delta)}`);
    }
    score.rawTotal += ev.delta;
    score.eventCount += 1;
    if (ev.tier_at_contribution) {
      score.tierMix[ev.tier_at_contribution] = (score.tierMix[ev.tier_at_contribution] ?? 0) + 1;
    }
  }

  for (const axis of PILLAR_IDS) {
    const s = scores[axis];
    // Round before flooring so 0.1 + 0.2 style float drift does not lose a graduation.
    const rounded = Math.round(s.rawTotal * 1e9) / 1e9;
    s.rawTotal = rounded;
    s.graduationCount = Math.min(GRADUATION_CAP, Math.max(0, Math.floor(rounded)));
  }
  return scores;
}
