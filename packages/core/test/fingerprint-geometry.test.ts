import { describe, expect, it } from 'vitest';
import {
  GRADUATION_HORIZON,
  RADIUS_POWER,
  TRADEOFF_PENALTY_CAP,
  axisCeiling,
  axisExtent,
  fingerprintExtents,
  horizonProgress,
  ringCount,
  tradeoffFactor,
  type AxisTotals,
} from '../src/fingerprint-geometry';
import { PILLAR_IDS, type Axis } from '../src/pillars';

/**
 * The curve this replaced, kept here so the compatibility claims in
 * fingerprint-geometry.ts are checked rather than asserted.
 */
const recoveredEngineCurve = (graduations: number): number =>
  (Math.min(graduations, GRADUATION_HORIZON) / GRADUATION_HORIZON) ** RADIUS_POWER;

const allAt = (n: number): AxisTotals =>
  Object.fromEntries(PILLAR_IDS.map((a) => [a, n])) as AxisTotals;

describe('horizonProgress', () => {
  it('never reaches the horizon, however long the history', () => {
    for (const total of [22, 40, 100, 1_000, 1e9]) {
      expect(horizonProgress(total)).toBeLessThan(1);
    }
  });

  it('keeps moving past 22, which the clamp it replaced did not', () => {
    // designer's case: the veteran's 23rd graduation. The recovered engine froze
    // here and this is the defect the port exists to fix.
    expect(recoveredEngineCurve(22)).toBe(recoveredEngineCurve(23));
    expect(horizonProgress(23)).toBeGreaterThan(horizonProgress(22));
    expect(horizonProgress(60)).toBeGreaterThan(horizonProgress(40));
  });

  it('is strictly increasing across the whole range', () => {
    let previous = horizonProgress(0);
    for (let g = 1; g <= 120; g += 1) {
      const current = horizonProgress(g);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
  });

  it('treats an empty axis as empty', () => {
    expect(horizonProgress(0)).toBe(0);
    expect(horizonProgress(-5)).toBe(0);
    expect(horizonProgress(Number.NaN)).toBe(0);
  });
});

describe('compatibility with the shape this replaced', () => {
  // The module claims the existing fingerprints are left alone below 15
  // graduations and tighten only near the top. If that stops being true, every
  // baked example in docs/fingerprint-examples/ silently changes character.
  it('is visually identical below 15 graduations', () => {
    for (let g = 1; g <= 15; g += 1) {
      const ported = horizonProgress(g) ** RADIUS_POWER;
      expect(ported).toBeCloseTo(recoveredEngineCurve(g), 2);
    }
  });

  it('tightens near the horizon rather than everywhere', () => {
    const at20 = 1 - horizonProgress(20) ** RADIUS_POWER / recoveredEngineCurve(20);
    const at22 = 1 - horizonProgress(22) ** RADIUS_POWER / recoveredEngineCurve(22);
    expect(at20).toBeGreaterThan(0.02);
    expect(at20).toBeLessThan(0.06);
    expect(at22).toBeGreaterThan(0.05);
    expect(at22).toBeLessThan(0.1);
  });
});

describe('tradeoffFactor', () => {
  it('leaves an empty axis alone', () => {
    expect(tradeoffFactor('acuity', { reach: 22 })).toBe(1);
  });

  it('barely bites when the partner is new', () => {
    expect(tradeoffFactor('acuity', { acuity: 22, reach: 1 })).toBeGreaterThan(0.98);
  });

  it('bites hardest when both axes are strong', () => {
    const weak = tradeoffFactor('acuity', { acuity: 22, reach: 4 });
    const strong = tradeoffFactor('acuity', { acuity: 22, reach: 22 });
    expect(strong).toBeLessThan(weak);
    // 0.83, not the recovered engine's flat 0.80. The penalty is built from
    // horizonProgress, so competition arrives as gradually as the growth that
    // causes it instead of landing whole the moment both axes hit a clamp.
    expect(strong).toBeCloseTo(0.832, 3);
  });

  it('closes on the ceiling from above rather than snapping to it', () => {
    const at22 = tradeoffFactor('acuity', { acuity: 22, reach: 22 });
    const at100 = tradeoffFactor('acuity', { acuity: 100, reach: 100 });
    expect(at22).toBeGreaterThan(axisCeiling('acuity'));
    expect(at100).toBeLessThan(at22);
    expect(at100).toBeCloseTo(axisCeiling('acuity'), 4);
  });

  it('caps the damage when an axis has two partners', () => {
    const discourse = tradeoffFactor('discourse', allAt(1_000));
    expect(discourse).toBeCloseTo(1 - TRADEOFF_PENALTY_CAP, 3);
  });
});

describe('the ceiling asymmetry', () => {
  // Dan's decision, 2026-09-20: Consistency stays exempt. This test is the record
  // of that, so a later change to TRADEOFF_PAIRS has to argue with it on purpose.
  it('leaves Consistency the only axis that can approach the ring', () => {
    expect(axisCeiling('consistency')).toBe(1);
    for (const axis of PILLAR_IDS.filter((a) => a !== 'consistency')) {
      expect(axisCeiling(axis)).toBeLessThan(1);
    }
  });

  it('puts Discourse lowest, because it is the only axis with two partners', () => {
    expect(axisCeiling('discourse')).toBeCloseTo(0.7, 5);
    for (const axis of ['acuity', 'calibration', 'magnanimity', 'reach'] as Axis[]) {
      expect(axisCeiling(axis)).toBeCloseTo(0.8, 5);
    }
  });

  it('holds when a real contributor maxes every axis', () => {
    const extents = fingerprintExtents(allAt(1_000));
    for (const axis of PILLAR_IDS) {
      expect(extents[axis]).toBeLessThan(axisCeiling(axis));
      expect(extents[axis]).toBeGreaterThan(axisCeiling(axis) * 0.99);
    }
  });
});

describe('axisExtent', () => {
  it('never reaches the ring on any axis, at any history', () => {
    for (const total of [22, 100, 10_000]) {
      for (const axis of PILLAR_IDS) {
        expect(axisExtent(axis, allAt(total))).toBeLessThan(1);
      }
    }
  });

  it('returns nothing for an axis with no history', () => {
    expect(axisExtent('acuity', {})).toBe(0);
    expect(axisExtent('acuity', { reach: 22 })).toBe(0);
  });

  it('gives every axis a value when the whole ledger is replayed', () => {
    const extents = fingerprintExtents(allAt(11));
    expect(Object.keys(extents).sort()).toEqual([...PILLAR_IDS].sort());
  });
});

describe('ringCount', () => {
  it('still clamps, because rings are a counting channel', () => {
    expect(ringCount(40)).toBe(GRADUATION_HORIZON);
    expect(ringCount(1_000)).toBe(GRADUATION_HORIZON);
  });

  it('counts whole graduations below the horizon', () => {
    expect(ringCount(0)).toBe(0);
    expect(ringCount(3.9)).toBe(3);
  });
});
