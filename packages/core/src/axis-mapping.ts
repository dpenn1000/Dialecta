/**
 * Axis mapping: turns one classification into per-axis deltas for the
 * append-only axis_events ledger, and replays that ledger into axis_scores.
 *
 * See docs/Dialecta_Contributor_Identity.md and docs/Dialecta_Data_Architecture.md
 * (entities 3 and 4, and the Fingerprint pipeline). Scores are never updated
 * incrementally; they are always a replay of the ledger, so a rule change can be
 * re-applied to history.
 *
 * Every threshold below is a first guess and is tagged TUNING so it can be
 * found and revisited once real classifications exist.
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

// TUNING: acuity from specificity. A vague claim earns a little, a developed one earns a full unit.
const ACUITY_BY_SPECIFICITY: Record<0 | 1 | 2 | 3, number> = { 0: 0, 1: 0.25, 2: 0.75, 3: 1 };

// TUNING: discourse by tier. Forum and Spark add to the conversation, Echo half, the rest nothing.
const DISCOURSE_BY_TIER: Record<Tier, number> = {
  forum: 1,
  spark: 1,
  echo: 0.5,
  fog: 0,
  heat: 0,
  stance: 0,
  breach: 0,
};

/**
 * Returns one delta per axis (six entries, some zero) for a single classification.
 *
 * Mapping, simplest defensible version:
 *   acuity       specificity 0..3 mapped to 0, 0.25, 0.75, 1
 *   reach        0.5 for specific article engagement, plus 0.5 if an opposing view was engaged
 *   calibration  0.5 if an opposing view was engaged, plus 0.5 if no tribal markers
 *   magnanimity  0.5 if an opposing view was engaged, plus 0.5 if emotion is not high
 *   discourse    1 for forum or spark, 0.5 for echo, 0 otherwise
 *   consistency  0. Consistency is a property of a body of comments, not one comment.
 *                It needs history (variance of the other axes over time) and is
 *                computed in the replay step once that rule exists. Left at 0 here
 *                so the ledger shape is stable.
 */
export function axisDeltasFor(classification: ClassificationResult): AxisDelta[] {
  const c = classification;

  const acuity = ACUITY_BY_SPECIFICITY[c.specificity]; // TUNING: see table above

  const reach =
    (c.article_engagement === 'specific' ? 0.5 : 0) + // TUNING: specific engagement is worth half a unit
    (c.opposing_view_engaged ? 0.5 : 0); // TUNING: engaging the other side is worth the other half

  const calibration =
    (c.opposing_view_engaged ? 0.5 : 0) + // TUNING
    (!c.tribal_markers ? 0.5 : 0); // TUNING: low tribal markers read as calibrated

  const magnanimity =
    (c.opposing_view_engaged ? 0.5 : 0) + // TUNING
    (c.emotion !== 'high' ? 0.5 : 0); // TUNING: high emotion does not earn the generosity half

  const discourse = DISCOURSE_BY_TIER[c.ai_suggested_tier]; // TUNING: see table above

  const consistency = 0; // Needs history; see note above.

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
