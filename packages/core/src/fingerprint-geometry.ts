/**
 * Fingerprint geometry: how an axis's earned history becomes a radius.
 *
 * Ported and amended from `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx`
 * (quarantine, read and cited, not promoted wholesale). The port carries one
 * deliberate change, decided by Dan on 2026-09-20 on `designer`'s recommendation.
 *
 * WHAT CHANGED, AND WHY
 *
 * The recovered engine computed `maxR * (Math.min(graduations, 22) / 22) ** 0.85`
 * and drew the dashed guide circle at exactly `maxR`. Two consequences the two
 * seats found from opposite ends of a contributor's life:
 *
 *   `philosopher` looked at a newborn and found the ring reads as a horizon:
 *   equidistant from everyone, named "the potential ring" in the code, inviting
 *   rather than reproachful.
 *
 *   `designer` looked at a veteran's 23rd graduation and found a wall. Past 22
 *   the only channel a viewer can judge by eye stopped moving, while the copy
 *   went on promising open-ended growth.
 *
 * Both were right about what each was looking at. The object simply changed
 * meaning depending on where you stood on it, and only the early half matched
 * the copy.
 *
 * So the hard clamp is gone. Progress now saturates smoothly toward the ring and
 * never arrives, which makes "potential" true at both ends: a newborn still sees
 * a distant horizon, and a veteran's 23rd graduation still moves the boundary.
 *
 * WHAT DID NOT CHANGE, DELIBERATELY
 *
 * Ring COUNT stays clamped (see `ringCount`). Radius is a continuous signal and
 * can absorb unbounded growth; forty concentric strokes inside one petal is mud.
 * `designer`'s item 3 asked for asymptotic radius specifically, not unbounded
 * everything.
 *
 * The trade-off pairs are untouched, including Consistency's exemption. Dan
 * reserved that one: penalising Consistency would have the platform say that
 * showing up reliably costs you something elsewhere, which is not what it
 * believes. Recorded here because the asymmetry is real and someone will find it
 * again: Consistency is the only axis with no partner, so it is the only axis
 * whose extent is limited by nothing but its own history. See `axisCeiling`.
 */

import { PILLAR_IDS, type Axis } from './pillars';

/**
 * The reference point the guide ring is drawn at, in graduations. A contributor
 * approaches it and never reaches it.
 *
 * TUNING: 22 matches the 22 marks on the fingerprint prototype, and matches
 * `GRADUATION_CAP` in axis-mapping. It is no longer a ceiling in the geometry,
 * only the scale that fixes what "one graduation" is worth in radius.
 */
export const GRADUATION_HORIZON = 22;

/**
 * How sharply progress bends away from linear as it nears the horizon.
 *
 * TUNING: 8 was chosen to leave the existing shapes alone. This is the exponent
 * of a p-norm soft minimum of `t` and 1, so it tracks `t` almost exactly while
 * `t` is small and bends only near the top. Measured against the recovered
 * engine's curve: identical below 15 graduations, 4% tighter at 20, 7% tighter
 * at 22, and rising where the old curve was frozen. Lower values compress the
 * whole shape; higher values approach the hard clamp this replaces.
 *
 * HOW MUCH THIS ACTUALLY BUYS, MEASURED RATHER THAN CLAIMED
 *
 * At a 170px render radius, asking where one more graduation stops moving the
 * boundary by half a pixel:
 *
 *   recovered engine   graduation 22, and it is a hard edge rather than a fade
 *   softness 8         graduation 29
 *   softness 6         graduation 31
 *   softness 4         graduation 36
 *
 * So this removes the cliff and moves the practical limit by about seven
 * graduations. It does not deliver unbounded visible growth, and no setting of
 * this constant will: the ring is a fixed radius, so the room inside it is
 * finite, and any curve that fills most of it by graduation 22 has little left
 * to spend. Trading the other way costs the mature shapes their presence.
 *
 * Carrying a veteran's 200th graduation needs a different channel, not a
 * different exponent. Ring density, texture and the resonance halo are all
 * unsaturated and already in the engine. That is `designer`'s call and is not
 * what Dan approved on 2026-09-20, so it is recorded here rather than done.
 */
export const HORIZON_SOFTNESS = 8;

/** TUNING: closer to 1 means more dramatic asymmetry between strong and weak axes. */
export const RADIUS_POWER = 0.85;

/** TUNING: reduction applied to an axis when a competing axis is also strong. */
export const TRADEOFF_PENALTY = 0.2;

/**
 * TUNING: the most any axis can lose to its partners combined. Discourse has two
 * partners and is the only axis that reaches this, which is why its ceiling is
 * 0.70 where every other penalised axis sits at 0.80.
 */
export const TRADEOFF_PENALTY_CAP = TRADEOFF_PENALTY * 1.5;

/**
 * Axes that compete for the same attention. A contributor cannot be maximally
 * precise and maximally broad at once, and cannot argue at length while staying
 * maximally calibrated and generous.
 *
 * Consistency appears in no pair. That is deliberate and is Dan's call, 2026-09-20.
 */
export const TRADEOFF_PAIRS: ReadonlyArray<readonly [Axis, Axis]> = [
  ['acuity', 'reach'],
  ['discourse', 'calibration'],
  ['discourse', 'magnanimity'],
] as const;

/** Uncapped cumulative delta per axis. `AxisScore.rawTotal` is the source. */
export type AxisTotals = Partial<Record<Axis, number>>;

const partnersOf = (axis: Axis): Axis[] =>
  TRADEOFF_PAIRS.flatMap(([a, b]) => (a === axis ? [b] : b === axis ? [a] : []));

/**
 * Earned history as a fraction of the horizon, in [0, 1).
 *
 * A p-norm soft minimum of `t = rawTotal / GRADUATION_HORIZON` and 1. Strictly
 * increasing, so every graduation moves it, and strictly below 1, so the ring is
 * never touched.
 */
export function horizonProgress(rawTotal: number): number {
  if (!Number.isFinite(rawTotal) || rawTotal <= 0) return 0;
  const t = rawTotal / GRADUATION_HORIZON;
  // Two algebraically identical forms of the same soft minimum, because the
  // obvious one breaks the single invariant this module exists to hold. Once
  // `t ** 8` dwarfs the `1` beside it, float64 rounds the sum back to `t ** 8`,
  // the division gives exactly 1, and the shape touches the ring. Above t = 1
  // the reciprocal form keeps the small term where the arithmetic can see it.
  const progress =
    t < 1
      ? t / (1 + t ** HORIZON_SOFTNESS) ** (1 / HORIZON_SOFTNESS)
      : Math.exp(-Math.log1p(t ** -HORIZON_SOFTNESS) / HORIZON_SOFTNESS);
  // That buys about 1,670 graduations on a single axis before float64 saturates
  // anyway. The clamp makes "never reaches the ring" exact rather than nearly
  // exact. Nobody will render the difference; the invariant is worth holding
  // without an asterisk.
  return Math.min(progress, 1 - Number.EPSILON);
}

/**
 * How much of an axis's radius survives its competing partners, in
 * [1 - TRADEOFF_PENALTY_CAP, 1].
 *
 * The penalty is proportional to how strong BOTH axes are, so a partner with one
 * graduation costs you almost nothing. An axis with no history is never penalised;
 * there is nothing there to reduce.
 */
export function tradeoffFactor(axis: Axis, totals: AxisTotals): number {
  const own = horizonProgress(totals[axis] ?? 0);
  if (own === 0) return 1;
  const penalty = partnersOf(axis).reduce(
    (sum, partner) => sum + horizonProgress(totals[partner] ?? 0) * own * TRADEOFF_PENALTY,
    0,
  );
  return 1 - Math.min(penalty, TRADEOFF_PENALTY_CAP);
}

/**
 * An axis's reach as a fraction of the guide ring's radius, in [0, 1).
 *
 * Multiply by the ring radius to get a length. Never returns 1: the ring is a
 * horizon, and that is the whole point of this module.
 *
 * SCOPE, AND A CORRECTION TO WHAT THIS MODULE FIRST CLAIMED
 *
 * This bounds EARNED EXTENT. It does not bound the rendered line, and the
 * recovered engine's texture crosses the ring today. Base noise and the
 * turbulence wave are both added in absolute pixels after the radius is
 * computed (engine `:518`, `radius += baseNoise + wave`), with nothing holding
 * them inside anything. Measured on a faithful port of that code at a 95px
 * ring, furthest sampled point as a percentage of the ring:
 *
 *   22 graduations, turbulence 0.00    102.6%
 *   22 graduations, turbulence 1.00    127.5%
 *   20 graduations, turbulence 0.50    104.7%
 *
 * So a mature fingerprint already breaks out of its own horizon on texture
 * alone, before any of this module's arithmetic is consulted. Fixing it means
 * spending texture out of the headroom the ring leaves rather than adding it
 * on top, which changes how turbulence reads on mature shapes and is therefore
 * `designer`'s call, not a quiet clamp to add here.
 *
 * `scripts/turbulence_lab.py` reproduces the engine's texture outside the
 * browser and is what these numbers came from.
 */
export function axisExtent(axis: Axis, totals: AxisTotals): number {
  const progress = horizonProgress(totals[axis] ?? 0);
  if (progress === 0) return 0;
  return progress ** RADIUS_POWER * tradeoffFactor(axis, totals);
}

/** Every axis at once, for a renderer that wants the whole shape. */
export function fingerprintExtents(totals: AxisTotals): Record<Axis, number> {
  return Object.fromEntries(PILLAR_IDS.map((a) => [a, axisExtent(a, totals)])) as Record<
    Axis,
    number
  >;
}

/**
 * How many concentric strokes to draw on an axis.
 *
 * Deliberately still clamped, unlike radius. Rings are a counting channel and
 * stop being countable long before forty of them; radius is the channel that
 * carries growth past the horizon.
 */
export function ringCount(rawTotal: number): number {
  if (!Number.isFinite(rawTotal) || rawTotal <= 0) return 0;
  return Math.min(GRADUATION_HORIZON, Math.floor(rawTotal));
}

/**
 * The limit this axis approaches, as a fraction of the ring, with its partners
 * also growing without bound. Documentation of the asymmetry rather than
 * something a renderer needs.
 *
 * A limit, not a value anyone reaches. The penalty is built from `horizonProgress`
 * like everything else here, so it saturates on the same curve: at 22 graduations
 * on both axes the factor is 0.83 rather than the recovered engine's flat 0.80,
 * and it closes on 0.80 from above as history grows. The old engine applied the
 * full penalty the moment both axes hit the clamp. This one makes competition
 * arrive as gradually as the growth that causes it.
 *
 * Consistency returns the bare horizon limit because it has no partners. Every
 * other axis is held below it permanently, and Discourse lowest of all because it
 * is the only axis with two.
 */
export function axisCeiling(axis: Axis): number {
  const penalty = Math.min(partnersOf(axis).length * TRADEOFF_PENALTY, TRADEOFF_PENALTY_CAP);
  return 1 - penalty;
}
