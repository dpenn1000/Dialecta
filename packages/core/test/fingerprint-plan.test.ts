import { describe, expect, it } from 'vitest';
import {
  FINGERPRINT_RENDER,
  FINGERPRINT_WHEEL,
  blendHex,
  deriveAxisMetrics,
  fingerprintSalt,
  planFingerprint,
  topicPhasesFromHistory,
  type FingerprintData,
  type TopicPalette,
} from '../src/fingerprint-plan';
import { axisExtent } from '../src/fingerprint-geometry';
import { applyPurity, ringFields, textureOffset } from '../src/fingerprint-texture';
import { PILLAR_IDS, type Axis } from '../src/pillars';

const TOPICS: TopicPalette = {
  economics: { color: '#b87a18', colorDeep: '#5c3c08' },
  psychology_behavior: { color: '#267080', colorDeep: '#123840' },
  philosophy_ethics: { color: '#3a3888', colorDeep: '#1c1c44' },
};

/** Wen Zhao, a demo profile, as it sits in axis_scores on 2026-09-21. */
const WEN: FingerprintData = {
  acuity: { graduations: 9, tierMix: { echo: 1, forum: 5, spark: 3 } },
  reach: { graduations: 16, tierMix: { fog: 1, echo: 1, forum: 9, spark: 5 } },
  calibration: { graduations: 9, tierMix: { fog: 1, echo: 1, forum: 4, spark: 3 } },
  magnanimity: { graduations: 10, tierMix: { fog: 1, echo: 1, forum: 5, spark: 3 } },
  discourse: { graduations: 17, tierMix: { echo: 1, heat: 5, forum: 6, spark: 3, stance: 2 } },
  consistency: { graduations: 19, tierMix: { echo: 2, forum: 13, spark: 4 } },
};

const EMPTY: FingerprintData = {};

const SIZE = 296;

function angleOf(axis: Axis): number {
  const spoke = FINGERPRINT_WHEEL.find((w) => w.axis === axis);
  if (!spoke) throw new Error(axis);
  return spoke.angle;
}

function hexSaturation(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return Math.max(r, g, b) - Math.min(r, g, b);
}

describe('the wheel', () => {
  it('carries all six axes at the engine angles, clockwise from the top', () => {
    expect(FINGERPRINT_WHEEL.map((w) => w.axis).sort()).toEqual([...PILLAR_IDS].sort());
    expect(angleOf('acuity')).toBe(0);
    expect(angleOf('calibration')).toBe(60);
    expect(angleOf('magnanimity')).toBe(120);
    expect(angleOf('discourse')).toBe(180);
    expect(angleOf('consistency')).toBe(240);
    expect(angleOf('reach')).toBe(300);
  });
});

describe('deriveAxisMetrics', () => {
  it('reads an axis with no history as calm, pure and crisp', () => {
    expect(deriveAxisMetrics(undefined)).toEqual({ purity: 1, turbulence: 0, clarity: 1, total: 0 });
    expect(deriveAxisMetrics({ graduations: 0, tierMix: { heat: 4 } })).toEqual({
      purity: 1,
      turbulence: 0,
      clarity: 1,
      total: 0,
    });
  });

  it('derives purity, turbulence and clarity from the tier mix', () => {
    const m = deriveAxisMetrics(WEN.discourse);
    expect(m.total).toBe(17);
    expect(m.purity).toBeCloseTo(6 / 17, 12);
    expect(m.turbulence).toBeCloseTo(7 / 17, 12);
    expect(m.clarity).toBeCloseTo(6 / 7, 12);
  });

  it('keeps Breach out of the denominator', () => {
    // FINGERPRINT.md: adding Breach to the total would quietly lower saturation,
    // turbulence and clarity for anyone with a breach in their history.
    const m = deriveAxisMetrics({ graduations: 2, tierMix: { forum: 2, breach: 5 } });
    expect(m.total).toBe(2);
    expect(m.purity).toBe(1);
  });

  it('treats a mix with no clarity denominator as fully clear', () => {
    const m = deriveAxisMetrics({ graduations: 1, tierMix: { spark: 1 } });
    expect(m.purity).toBe(0);
    expect(m.clarity).toBe(1);
  });
});

describe('topicPhasesFromHistory', () => {
  it('run-length encodes a flat, oldest-first history', () => {
    expect(topicPhasesFromHistory(['economics', 'economics', 'psychology_behavior', 'economics'])).toEqual([
      { topic: 'economics', count: 2 },
      { topic: 'psychology_behavior', count: 1 },
      { topic: 'economics', count: 1 },
    ]);
  });

  it('accepts phases that are already grouped, and merges neighbours', () => {
    expect(
      topicPhasesFromHistory([{ topic: 'economics', count: 3 }, 'economics', { topic: 'history', count: 2 }]),
    ).toEqual([
      { topic: 'economics', count: 4 },
      { topic: 'history', count: 2 },
    ]);
  });

  it('drops what it cannot read rather than guessing', () => {
    expect(topicPhasesFromHistory(null)).toEqual([]);
    expect(topicPhasesFromHistory('economics')).toEqual([]);
    expect(topicPhasesFromHistory([7, '', { topic: 'x', count: -1 }, { count: 2 }])).toEqual([]);
  });
});

describe('fingerprintSalt', () => {
  it('is deterministic and a 32 bit integer', () => {
    const a = fingerprintSalt('22222222-2222-4222-8222-222222222222');
    expect(a).toBe(fingerprintSalt('22222222-2222-4222-8222-222222222222'));
    expect(Number.isInteger(a)).toBe(true);
    expect(a).toBeGreaterThanOrEqual(-(2 ** 31));
    expect(a).toBeLessThan(2 ** 31);
  });

  it('separates contributors with similar ids', () => {
    const ids = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      '16d5b5b2-f9ee-4dda-bad1-949e46d01ff1',
      '9f66baa1-dc2e-470a-94ee-367f09eb8e8b',
    ];
    expect(new Set(ids.map(fingerprintSalt)).size).toBe(ids.length);
  });
});

describe('blendHex', () => {
  it('interpolates channel by channel and rounds', () => {
    expect(blendHex('#000000', '#ffffff', 0)).toBe('#000000');
    expect(blendHex('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(blendHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(blendHex('#ff0000', '#0000ff', 0.25)).toBe('#bf0040');
  });
});

describe('planFingerprint: the Newborn state', () => {
  const plan = planFingerprint(EMPTY, { size: SIZE, resonance: 0.9, salt: 1 });

  it('draws seed dots and no rings', () => {
    expect(plan.state).toBe('newborn');
    expect(plan.rings).toEqual([]);
    expect(plan.seedDots).toHaveLength(6);
  });

  it('places each seed inside the potential ring, around a lifted spine', () => {
    const R = FINGERPRINT_RENDER;
    expect(plan.maxR).toBeCloseTo(SIZE * R.frame.maxRadiusFactor, 9);
    expect(plan.spine.x).toBe(plan.cx);
    expect(plan.spine.y).toBeCloseTo(plan.cy - plan.maxR * R.spine.liftFactor, 2);
    for (const dot of plan.seedDots) {
      const d = Math.hypot(dot.x - plan.spine.x, dot.y - plan.spine.y);
      expect(d).toBeCloseTo(plan.maxR * R.seed.radiusFactor, 1);
      expect(Math.hypot(dot.x - plan.cx, dot.y - plan.cy)).toBeLessThan(plan.maxR);
    }
  });

  it('colours each seed with its axis fallback hue', () => {
    for (const dot of plan.seedDots) {
      expect(dot.color).toBe(FINGERPRINT_RENDER.colors.axes[dot.axis].color);
    }
  });

  it('has no halo, whatever the resonance, because there is no silhouette to throw it from', () => {
    expect(plan.halo).toBeNull();
  });

  it('draws the potential ring legibly, since in the Newborn state it is most of the picture', () => {
    expect(plan.guideOpacity).toBe(FINGERPRINT_RENDER.guide.newbornOpacity);
    expect(FINGERPRINT_RENDER.guide.newbornOpacity).toBeGreaterThan(FINGERPRINT_RENDER.guide.opacity);
    const grown = planFingerprint(WEN, { size: SIZE, salt: 1 });
    expect(grown.guideOpacity).toBe(FINGERPRINT_RENDER.guide.opacity);
  });
});

describe('planFingerprint: a grown fingerprint', () => {
  const plan = planFingerprint(WEN, { size: SIZE, resonance: 0.54, salt: 7, topics: TOPICS });
  const silhouette = plan.rings[plan.rings.length - 1];

  it('builds the engine ring count from the largest axis', () => {
    // max(4, round(19 * 1.15 + 4)) = 26
    expect(plan.state).toBe('grown');
    expect(plan.rings).toHaveLength(26);
  });

  it('draws the interior first and the silhouette last', () => {
    expect(plan.rings[0]?.k).toBe(25);
    expect(silhouette?.k).toBe(0);
    expect(silhouette?.category).toBe('silhouette');
    expect(silhouette?.opacity).toBe(FINGERPRINT_RENDER.rings.silhouette.opacity);
    expect(plan.rings.find((r) => r.k === 1)?.category).toBe('outer');
    expect(plan.rings.find((r) => r.k === 3)?.category).toBe('interior');
  });

  it('closes every ring, with one segment per perimeter sample', () => {
    for (const ring of plan.rings) {
      expect(ring.path.startsWith('M ')).toBe(true);
      expect(ring.path.endsWith(' Z')).toBe(true);
      expect(ring.segments).toHaveLength(FINGERPRINT_RENDER.frame.perimeterSamples);
    }
  });

  it('keeps interior opacity inside the engine floor', () => {
    for (const ring of plan.rings.filter((r) => r.category === 'interior')) {
      expect(ring.opacity).toBeGreaterThanOrEqual(FINGERPRINT_RENDER.rings.interior.opacityFloor);
      expect(ring.opacity).toBeLessThanOrEqual(FINGERPRINT_RENDER.rings.interior.opacityTop);
    }
  });

  it('puts the silhouette at the core extent, plus exactly the core texture', () => {
    // At an axis's own angle the interpolation factor is 0, so the radius is
    // the axis extent from fingerprint-geometry plus textureOffset from
    // fingerprint-texture. Nothing else is allowed to move it.
    const totals = Object.fromEntries(Object.entries(WEN).map(([a, v]) => [a, v?.graduations ?? 0]));
    const fields = ringFields(26, 7);
    const field = fields[0];
    if (!field || !silhouette) throw new Error('missing ring');
    const acuity = deriveAxisMetrics(WEN.acuity);
    const theta = 0;
    const expected =
      axisExtent('acuity', totals) * plan.maxR +
      textureOffset({
        theta,
        field,
        depth: 0,
        purity: acuity.purity,
        turbulence: acuity.turbulence,
        maturity: 9,
      });
    const first = silhouette.segments[0];
    if (!first) throw new Error('missing segment');
    const r = Math.hypot(first.x1 - plan.spine.x, first.y1 - plan.spine.y);
    expect(r).toBeCloseTo(expected, 1);
  });

  it('draws a pulled-in notch where an axis has nothing', () => {
    const lopsided: FingerprintData = { ...WEN, discourse: { graduations: 0, tierMix: {} } };
    const p = planFingerprint(lopsided, { size: SIZE, salt: 7 });
    const sil = p.rings[p.rings.length - 1];
    const bottom = sil?.segments[FINGERPRINT_RENDER.frame.perimeterSamples / 2];
    if (!bottom) throw new Error('missing segment');
    const r = Math.hypot(bottom.x1 - p.spine.x, bottom.y1 - p.spine.y);
    // minAxisRadiusFactor of maxR, plus a few pixels of texture at most.
    expect(r).toBeLessThan(p.maxR * FINGERPRINT_RENDER.rings.minAxisRadiusFactor + 10);
  });

  it('uses the deep tone on the silhouette and the base tone inside', () => {
    // No topic history on Wen Zhao, so every ring runs on the axis fallback.
    const top = silhouette?.segments[0];
    const deepAcuity = FINGERPRINT_RENDER.colors.axes.acuity.colorDeep;
    const acuity = deriveAxisMetrics(WEN.acuity);
    const n = parseInt(deepAcuity.slice(1), 16);
    const [r, g, b] = applyPurity([(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff], acuity.purity);
    const expected = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    expect(top?.color).toBe(expected);
  });

  it('rounds every coordinate to two decimals', () => {
    for (const s of silhouette?.segments ?? []) {
      for (const v of [s.x1, s.y1, s.x2, s.y2]) {
        expect(Math.round(v * 100) / 100).toBe(v);
      }
    }
  });

  it('is identical on every render, and keyed to the contributor', () => {
    const again = planFingerprint(WEN, { size: SIZE, resonance: 0.54, salt: 7, topics: TOPICS });
    expect(JSON.stringify(again)).toBe(JSON.stringify(plan));
    const other = planFingerprint(WEN, { size: SIZE, resonance: 0.54, salt: 8, topics: TOPICS });
    expect(other.rings[other.rings.length - 1]?.path).not.toBe(silhouette?.path);
  });
});

describe('planFingerprint: channels', () => {
  it('reads rings outward as forward in time, from the topic history', () => {
    const data: FingerprintData = {
      reach: {
        graduations: 4,
        tierMix: { forum: 4 },
        topicPhases: [
          { topic: 'economics', count: 2 },
          { topic: 'philosophy_ethics', count: 2 },
        ],
      },
    };
    const plan = planFingerprint(data, { size: SIZE, salt: 3, topics: TOPICS });
    const reachSample = (5 / 6) * FINGERPRINT_RENDER.frame.perimeterSamples;
    const ringAt = (k: number) => plan.rings.find((r) => r.k === k)?.segments[reachSample]?.color;
    // Ring 1 is the newest non-silhouette ring and carries the latest topic;
    // ring 3 reaches back to the oldest.
    expect(ringAt(1)).toBe(TOPICS.philosophy_ethics?.color);
    expect(ringAt(3)).toBe(TOPICS.economics?.color);
  });

  it('desaturates a low-purity region, the channel the engine documented and never built', () => {
    const pure = planFingerprint({ acuity: { graduations: 10, tierMix: { forum: 10 } } }, { size: SIZE, salt: 1 });
    const murky = planFingerprint({ acuity: { graduations: 10, tierMix: { spark: 10 } } }, { size: SIZE, salt: 1 });
    const at = (p: typeof pure) => p.rings.find((r) => r.k === 2)?.segments[0]?.color ?? '#000000';
    expect(hexSaturation(at(murky))).toBeLessThan(hexSaturation(at(pure)));
  });

  it('blurs by clarity, in the engine three buckets', () => {
    const clear = planFingerprint({ acuity: { graduations: 8, tierMix: { forum: 8 } } }, { size: SIZE, salt: 1 });
    const foggy = planFingerprint(
      { acuity: { graduations: 8, tierMix: { fog: 7, forum: 1 } } },
      { size: SIZE, salt: 1 },
    );
    expect(clear.rings[0]?.segments[0]?.blur).toBe('crisp');
    expect(foggy.rings[0]?.segments[0]?.blur).toBe('diffuse');
  });
});

describe('planFingerprint: the resonance halo', () => {
  it('is absent at zero resonance', () => {
    expect(planFingerprint(WEN, { size: SIZE, resonance: 0, salt: 7 }).halo).toBeNull();
  });

  it('is three strokes of the silhouette plus a clipped two-stroke inner bleed, never a fill', () => {
    const plan = planFingerprint(WEN, { size: SIZE, resonance: 1, salt: 7 });
    const halo = plan.halo;
    if (!halo) throw new Error('no halo');
    expect(halo.path).toBe(plan.rings[plan.rings.length - 1]?.path);
    expect(halo.outer).toHaveLength(3);
    expect(halo.inner).toHaveLength(2);
    // At resonance 1 the curve is 1: base width 1.5 + 8, base opacity 0.15 + 0.7.
    expect(halo.outer[0]?.width).toBeCloseTo(9.5 * 3.5, 9);
    expect(halo.outer[0]?.opacity).toBeCloseTo(0.85 * 0.22, 9);
    expect(halo.blurNear).toBeCloseTo(13, 9);
    expect(halo.blurFar).toBeCloseTo(30, 9);
  });

  it('takes its hue from the dominant topic, and gold when there is none', () => {
    const noTopics = planFingerprint(WEN, { size: SIZE, resonance: 0.5, salt: 7 });
    expect(noTopics.halo?.color).toBe(FINGERPRINT_RENDER.halo.defaultColor);
    const topical = planFingerprint(
      {
        acuity: { graduations: 5, tierMix: { forum: 5 }, topicPhases: [{ topic: 'economics', count: 5 }] },
        reach: { graduations: 3, tierMix: { forum: 3 }, topicPhases: [{ topic: 'philosophy_ethics', count: 3 }] },
      },
      { size: SIZE, resonance: 0.5, salt: 7, topics: TOPICS },
    );
    expect(topical.halo?.color).toBe(TOPICS.economics?.color);
    expect(topical.halo?.colorDeep).toBe(TOPICS.economics?.colorDeep);
  });

  it('tints the inner bleed toward the heat hue when the history carries Heat', () => {
    const calm = planFingerprint({ acuity: { graduations: 6, tierMix: { forum: 6 } } }, { size: SIZE, resonance: 0.5 });
    const heated = planFingerprint(
      { acuity: { graduations: 6, tierMix: { forum: 3, heat: 3 } } },
      { size: SIZE, resonance: 0.5 },
    );
    expect(calm.halo?.innerColor).toBe(calm.halo?.color);
    expect(heated.halo?.innerColor).not.toBe(heated.halo?.color);
  });
});

describe('planFingerprint: frame', () => {
  it('reserves the label margin and places six labels outside the ring', () => {
    const plan = planFingerprint(WEN, { size: SIZE, salt: 1 });
    expect(plan.totalSize).toBe(SIZE + FINGERPRINT_RENDER.frame.labelMargin * 2);
    expect(plan.labels).toHaveLength(6);
    for (const l of plan.labels) {
      expect(Math.hypot(l.x - plan.cx, l.y - plan.cy)).toBeCloseTo(plan.maxR + FINGERPRINT_RENDER.frame.labelOffset, 1);
    }
  });

  it('drops the margin and the labels when asked', () => {
    const plan = planFingerprint(WEN, { size: 120, showLabels: false, salt: 1 });
    expect(plan.totalSize).toBe(120);
    expect(plan.labels).toEqual([]);
  });

  it('takes a whole replacement parameter set, so a tuning pass changes one object', () => {
    const params = {
      ...FINGERPRINT_RENDER,
      rings: { ...FINGERPRINT_RENDER.rings, silhouette: { opacity: 0.5, strokeWidth: 3 } },
    };
    const plan = planFingerprint(WEN, { size: SIZE, salt: 1, params });
    expect(plan.rings[plan.rings.length - 1]?.opacity).toBe(0.5);
  });
});
