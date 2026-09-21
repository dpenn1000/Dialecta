/**
 * Fingerprint texture: what makes the rings wobble, and what makes them wobble
 * like a material rather than like a machine.
 *
 * Ported from `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx` lines
 * 386 to 518, carrying three corrections found on 2026-09-20 after Dan spotted
 * a spiral running through every rendered fingerprint.
 *
 * 1. THE SPIRAL
 *
 * The engine seeded each ring with `ringSeed = k * 11.7 + 3.3` and fed that to
 * every sine as a phase offset, commenting that this existed "so adjacent rings
 * wiggle differently". It does the opposite. A phase offset on a function of
 * theta is an angular rotation of that harmonic by -phase/frequency, so a seed
 * advancing by a constant rotates every ring a constant angle from the one
 * inside it. That constructs a spiral: the rings wiggle identically and turn.
 * Measured rotation the eye can track, after removing whole lobe spacings, was
 * +8.2, +4.0, -0.2 and +26.6 degrees per ring across the four octaves. The
 * lowest frequency octave carried it, at 1.85 full turns over 26 rings.
 *
 * Hashing each ring independently kills the spiral and the material with it:
 * uncorrelated rings read as static. Real ridges run alongside their
 * neighbours; what they lack is a net drift.
 *
 * So each ring's whole field is ROTATED by a small random step. Rotating theta
 * turns every octave together, which is what a coherent material does, and puts
 * the step in units that mean something. A first attempt walked the phase
 * instead, which failed for a reason worth keeping: phase enters each octave
 * multiplied by its own coefficient, up to 5.9, so a phase step large enough to
 * matter moved the finest octave several whole periods and the walk degenerated
 * into a hash. Dan, on the render: hashed and walked "don't look that
 * different". They were not.
 *
 * 2. THE SEAM
 *
 * None of the engine's four frequencies is a whole number, so the field never
 * closed around the perimeter: `noise(0)` and `noise(2 * PI)` disagreed by up to
 * 1.118 of a plus or minus 1.15 range, about 6.5px at a mature amplitude, and
 * the turbulence wave by up to 13.4px. Every fingerprint has carried a step at
 * theta = 0 since April. The linear seed hid it by making the step consistent
 * from ring to ring, so it read as part of the spiral; removing the spiral made
 * it read as a scar. Integer frequencies close the loop exactly, worst residual
 * 6.6e-14, and the nearest integers keep the character.
 *
 * 3. THE FREQUENCY THAT STEPPED
 *
 * Turbulence is a per-point quantity and it drives the wave's frequency, so
 * simply rounding that frequency turns it into a step function of theta and
 * introduces a fresh seam wherever it steps. The wave is evaluated at the two
 * bracketing integers and blended instead. A blend of two closed waves is
 * closed, and the frequency still rises continuously with turbulence.
 *
 * Determinism is load-bearing: a contributor's fingerprint has to be identical
 * on every render for the identity claim to mean anything, so everything here
 * is a pure function of `salt` and the ring index.
 *
 * `scripts/turbulence_lab.py`, `scripts/spiral_unroll.py` and
 * `scripts/seed_compare.py` render all three schemes for comparison.
 */

/**
 * Frequency, phase multiplier, constant offset, amplitude.
 *
 * Frequencies are whole numbers so the field closes. The engine's 7.3, 13.1,
 * 21.7 and 4.1 are the nearest non-closing equivalents and are what produced
 * the seam.
 */
export const NOISE_OCTAVES: ReadonlyArray<readonly [number, number, number, number]> = [
  [7, 1.7, 0.0, 0.5],
  [13, 3.3, 1.4, 0.3],
  [22, 5.9, 2.7, 0.2],
  [4, 0.7, 0.0, 0.15],
] as const;

/**
 * How far a ring's field may turn from its neighbour, in radians.
 *
 * TUNING: 0.07 is about four degrees. This bounds a random step rather than
 * setting a fixed one, so no value of it can reintroduce a systematic rotation.
 * Smaller makes the rings hug each other; larger walks toward the independent
 * case, which reads as static.
 */
export const ROTATION_WALK_STEP = 0.07;

/** TUNING: light per-ring phase jitter, so neighbours are alike without being identical. */
export const PHASE_JITTER = 0.18;

/** TUNING: the amplitude floor, which is why nothing renders as a clean curve. */
export const BASE_NOISE_FLOOR = 1.8;

/** TUNING: how much impurity adds to the base wobble, on top of the floor. */
export const BASE_NOISE_IMPURITY_GAIN = 4;

/** TUNING: peak turbulence amplitude in pixels, before recency and maturity scale it. */
export const WAVE_AMPLITUDE = 9;

/** TUNING: turbulence below this renders as nothing at all. */
export const TURBULENCE_FLOOR = 0.01;

/**
 * Deterministic hash to [0, 1). The xxhash finalizer, which avalanches properly,
 * rather than the `sin(n) * 43758.5453` shader idiom, which bands on some inputs
 * and would put that banding straight into the texture this module exists to fix.
 */
function hash01(n: number): number {
  let h = n | 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export interface RingField {
  /** Radians this ring's whole noise field is turned by. */
  rotation: number;
  /** Light phase jitter, so two rings at the same rotation still differ. */
  phase: number;
}

/**
 * The per-ring rotation and phase, walked from the outermost ring inward.
 *
 * Returns the whole array because every caller wants every ring, and one ring
 * in isolation would mean re-walking the sequence to reach it.
 *
 * `salt` keys the walk to a contributor, so two people with identical axis
 * histories still render differently.
 */
export function ringFields(ringCount: number, salt = 0): RingField[] {
  const count = Math.max(0, Math.floor(ringCount));
  const base = hash01(salt ^ 0x9e3779b1) * Math.PI * 2;
  const fields: RingField[] = [];
  let rotation = 0;
  for (let k = 0; k < count; k += 1) {
    fields.push({ rotation, phase: base + (hash01((k * 0x27d4eb2f) ^ salt) * 2 - 1) * PHASE_JITTER });
    // Centred on zero, so the walk has no expected drift. That is the whole
    // difference between this and the constant it replaces.
    rotation += (hash01(((k + 1) * 0x85ebca6b) ^ salt) * 2 - 1) * ROTATION_WALK_STEP;
  }
  return fields;
}

/** Multi-octave wobble. Present on every fingerprint at every purity. */
export function perimeterNoise(theta: number, field: RingField): number {
  const t = theta + field.rotation;
  let total = 0;
  for (const [freq, mult, offset, amp] of NOISE_OCTAVES) {
    total += Math.sin(t * freq + field.phase * mult + offset) * amp;
  }
  return total;
}

/** One turbulence wave at a whole-number base frequency, so it closes. */
function waveAt(t: number, phase: number, freq: number): number {
  const f = Math.max(1, Math.round(freq));
  return (
    Math.sin(t * f + phase * 0.4) * 0.7 +
    Math.sin(t * Math.max(1, Math.round(f * 1.8)) + phase * 0.9 + 1.1) * 0.4 +
    Math.sin(t * Math.max(1, Math.round(f * 0.5)) + phase * 0.2 + 2.3) * 0.5
  );
}

/**
 * The Heat and Stance signature.
 *
 * Turbulence drives the FREQUENCY, 3 when calm to 11 when chaotic, which is
 * what turns a swell into chop. It drives the amplitude too, but the frequency
 * term is the one that reads as jagged rather than merely large.
 */
export function turbulenceWave(theta: number, field: RingField, turbulence: number): number {
  if (turbulence < TURBULENCE_FLOOR) return 0;
  const t = theta + field.rotation;
  const fr = 3 + turbulence * 8;
  const lo = Math.floor(fr);
  const frac = fr - lo;
  return (waveAt(t, field.phase, lo) * (1 - frac) + waveAt(t, field.phase, lo + 1) * frac) * turbulence;
}

/** `depth` is 0 at the outermost ring and 1 at the innermost. */
export function baseNoiseAmplitude(purity: number, depth: number): number {
  return ((1 - purity) * BASE_NOISE_IMPURITY_GAIN + BASE_NOISE_FLOOR) * (1 + (1 - depth) * 0.4);
}

/**
 * Turbulence amplitude, scaled by recency and by maturity.
 *
 * Recency runs 0.3 innermost to 1.0 outermost, so old turbulence settles.
 * Maturity runs 0.4 at no graduations to 2.5 at the horizon, so the same
 * behaviour reads as a ripple on a newcomer and a gash on a veteran.
 */
export function waveAmplitude(depth: number, maturity: number): number {
  const recency = 0.3 + (1 - depth) * 0.7;
  const matured = 0.4 + Math.min(maturity / 22, 1) * 2.1;
  return WAVE_AMPLITUDE * recency * matured;
}

export interface TextureInput {
  theta: number;
  field: RingField;
  depth: number;
  purity: number;
  turbulence: number;
  maturity: number;
}

/**
 * Pixels to add to this point's radius.
 *
 * Unbounded, and it can push the line outside the guide ring. The engine has
 * always done that and `fingerprint-geometry.ts` carries the measurement.
 * Holding texture inside the horizon means spending it out of the remaining
 * headroom, which changes how turbulence reads on mature shapes and is
 * `designer`'s call.
 */
export function textureOffset(input: TextureInput): number {
  const { theta, field, depth, purity, turbulence, maturity } = input;
  return (
    perimeterNoise(theta, field) * baseNoiseAmplitude(purity, depth) +
    turbulenceWave(theta, field, turbulence) * waveAmplitude(depth, maturity)
  );
}
