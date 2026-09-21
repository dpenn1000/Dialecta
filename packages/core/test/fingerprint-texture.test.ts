import { describe, expect, it } from 'vitest';
import {
  NOISE_OCTAVES,
  ROTATION_WALK_STEP,
  baseNoiseAmplitude,
  perimeterNoise,
  ringFields,
  textureOffset,
  turbulenceWave,
  waveAmplitude,
} from '../src/fingerprint-texture';

const TAU = Math.PI * 2;
const field = (rotation = 0, phase = 1.3) => ({ rotation, phase });

describe('the field closes around the perimeter', () => {
  // The engine's 7.3, 13.1, 21.7 and 4.1 are not whole numbers, so noise(0) and
  // noise(TAU) disagreed by up to 1.118 of a +-1.15 range. That is a step in
  // every ring at theta = 0, and it shipped from April.
  it('has whole-number octave frequencies', () => {
    for (const [freq] of NOISE_OCTAVES) {
      expect(Number.isInteger(freq)).toBe(true);
    }
  });

  it('gives the same base noise at 0 and at TAU, at any rotation', () => {
    for (const rot of [0, 0.31, 1.7, -2.4]) {
      expect(perimeterNoise(0, field(rot))).toBeCloseTo(perimeterNoise(TAU, field(rot)), 9);
    }
  });

  it('gives the same turbulence wave at 0 and at TAU, at every turbulence', () => {
    for (let t = 0.05; t <= 1; t += 0.05) {
      expect(turbulenceWave(0, field(0.4), t)).toBeCloseTo(turbulenceWave(TAU, field(0.4), t), 9);
    }
  });

  it('closes at fractional turbulence, where a rounded frequency would step', () => {
    // Rounding the frequency alone makes it a step function of theta, because
    // turbulence is per-point. Blending the two bracketing integers is what
    // keeps this closed AND continuous.
    for (const t of [0.124, 0.125, 0.126, 0.4999, 0.5001]) {
      expect(turbulenceWave(0, field(), t)).toBeCloseTo(turbulenceWave(TAU, field(), t), 9);
    }
  });

  it('varies smoothly in turbulence rather than jumping at integer boundaries', () => {
    const at = (t: number) => turbulenceWave(1.1, field(), t);
    // 3 + t*8 crosses a whole number at t = 0.125. A step function would show
    // a discontinuity here and a blend does not.
    const before = at(0.1249);
    const after = at(0.1251);
    expect(Math.abs(after - before)).toBeLessThan(0.01);
  });
});

describe('ringFields', () => {
  it('is deterministic, because a fingerprint is an identity', () => {
    expect(ringFields(20, 77)).toEqual(ringFields(20, 77));
  });

  it('gives two contributors different textures', () => {
    const a = ringFields(20, 1).map((f) => f.rotation);
    const b = ringFields(20, 2).map((f) => f.rotation);
    expect(a).not.toEqual(b);
  });

  it('never steps further than the bound', () => {
    const rots = ringFields(400, 9).map((f) => f.rotation);
    for (let k = 1; k < rots.length; k += 1) {
      expect(Math.abs(rots[k]! - rots[k - 1]!)).toBeLessThanOrEqual(ROTATION_WALK_STEP + 1e-12);
    }
  });

  it('does not drift, which is the whole difference from the constant it replaced', () => {
    // The engine advanced the seed by a fixed 11.7 per ring, so every step was
    // identical and the rotation marched. A walk's steps must average to about
    // nothing across many rings and many contributors.
    let sum = 0;
    let count = 0;
    for (let salt = 0; salt < 60; salt += 1) {
      const rots = ringFields(40, salt).map((f) => f.rotation);
      for (let k = 1; k < rots.length; k += 1) {
        sum += rots[k]! - rots[k - 1]!;
        count += 1;
      }
    }
    expect(Math.abs(sum / count)).toBeLessThan(ROTATION_WALK_STEP * 0.1);
  });

  it('has no constant step anywhere in it', () => {
    // The precise failure being guarded: a spiral is a constant rotation per
    // ring, so if consecutive steps are all equal the spiral is back.
    const rots = ringFields(30, 5).map((f) => f.rotation);
    const steps = rots.slice(1).map((r, i) => r - rots[i]!);
    const distinct = new Set(steps.map((s) => s.toFixed(6)));
    expect(distinct.size).toBeGreaterThan(steps.length * 0.9);
  });

  it('keeps neighbouring rings closer than distant ones', () => {
    const rots = ringFields(26, 3).map((f) => f.rotation);
    const near = Math.abs(rots[10]! - rots[11]!);
    const far = Math.abs(rots[2]! - rots[24]!);
    expect(near).toBeLessThan(far);
  });

  it('returns nothing for an empty fingerprint', () => {
    expect(ringFields(0)).toEqual([]);
  });
});

describe('amplitudes', () => {
  it('keeps a floor, which is why nothing renders as a clean curve', () => {
    expect(baseNoiseAmplitude(1, 1)).toBeCloseTo(1.8, 6);
    expect(baseNoiseAmplitude(0, 0)).toBeGreaterThan(baseNoiseAmplitude(1, 0));
  });

  it('settles old turbulence and amplifies recent turbulence', () => {
    expect(waveAmplitude(1, 22)).toBeLessThan(waveAmplitude(0, 22));
  });

  it('reads as a ripple on a newcomer and a gash on a veteran', () => {
    expect(waveAmplitude(0, 0)).toBeLessThan(waveAmplitude(0, 22) / 2);
  });

  it('renders nothing below the turbulence floor', () => {
    expect(turbulenceWave(1.0, field(), 0.005)).toBe(0);
  });
});

describe('textureOffset', () => {
  it('closes around the perimeter with every channel live', () => {
    const input = { field: field(0.9), depth: 0.2, purity: 0.4, turbulence: 0.63, maturity: 19 };
    expect(textureOffset({ ...input, theta: 0 })).toBeCloseTo(textureOffset({ ...input, theta: TAU }), 9);
  });
});
