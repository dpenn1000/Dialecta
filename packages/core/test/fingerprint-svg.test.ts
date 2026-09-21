import { describe, expect, it } from 'vitest';
import {
  FINGERPRINT_RENDER,
  planFingerprint,
  type FingerprintData,
  type FingerprintPlan,
  type TopicPalette,
} from '../src/fingerprint-plan';
import { renderFingerprintSvg, type FingerprintSvgClasses } from '../src/fingerprint-svg';
import { pillarName } from '../src/pillars';

// ─── A small, strict reader for the markup ──────────────────────────────────
//
// The renderer writes a subset of HTML-syntax SVG: start tags with bare or
// double-quoted attribute values, ` />` self-closing tags, end tags and text.
// This reads exactly that subset and fails on anything else, so a test that
// passes has also shown the markup is well formed.

interface Node {
  name: string;
  attrs: Record<string, string>;
  children: Node[];
  text: string;
}

const TOKEN =
  /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:=(?:"[^"]*"|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:=(?:"([^"]*)"|([^\s"'=<>`]+)))?/g;

function decode(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function parse(markup: string): Node {
  const root: Node = { name: '#root', attrs: {}, children: [], text: '' };
  const stack: Node[] = [root];
  let consumed = 0;
  for (const m of markup.matchAll(TOKEN)) {
    expect(m.index).toBe(consumed);
    consumed = m.index + m[0].length;
    const top = stack[stack.length - 1] as Node;
    const [, close, name, attrText, selfClose, text] = m;
    if (text !== undefined) {
      top.text += decode(text);
      continue;
    }
    if (close) {
      expect(stack.pop()?.name).toBe(name);
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of (attrText ?? '').matchAll(ATTR)) {
      const key = a[1] as string;
      expect(attrs[key]).toBeUndefined();
      attrs[key] = decode(a[2] ?? a[3] ?? '');
    }
    const node: Node = { name: name as string, attrs, children: [], text: '' };
    top.children.push(node);
    if (!selfClose) stack.push(node);
  }
  expect(consumed).toBe(markup.length);
  expect(stack).toHaveLength(1);
  return root;
}

function all(node: Node): Node[] {
  return node.children.flatMap((c) => [c, ...all(c)]);
}

function classesOf(node: Node): string[] {
  return (node.attrs.class ?? '').split(' ').filter(Boolean);
}

/** `M x1,y1L x2,y2` to its four numbers. */
function readSegment(d: string | undefined): number[] {
  const m = /^M([-.\d]+),([-.\d]+)L([-.\d]+),([-.\d]+)$/.exec(d ?? '');
  if (!m) throw new Error(`not a segment: ${d}`);
  return m.slice(1).map(Number);
}

// ─── Fixtures ───────────────────────────────────────────────────────────────

const CLASSES: FingerprintSvgClasses = {
  guide: 'c-guide',
  guideNewborn: 'c-guide-newborn',
  axisLine: 'c-axis',
  anchorDot: 'c-dot',
  anchorRing: 'c-anchor-ring',
  label: 'c-label',
  halo: 'c-halo',
  ring: 'c-ring',
  grow: 'c-grow',
};

const TOPICS: TopicPalette = {
  economics: { color: '#b87a18', colorDeep: '#5c3c08' },
  philosophy_ethics: { color: '#3a3888', colorDeep: '#1c1c44' },
};

/** Wen Zhao, a demo profile, with a little topic history so the halo takes a hue. */
const WEN: FingerprintData = {
  acuity: { graduations: 9, tierMix: { echo: 1, forum: 5, spark: 3 }, topicPhases: [{ topic: 'economics', count: 9 }] },
  reach: { graduations: 16, tierMix: { fog: 1, echo: 1, forum: 9, spark: 5 } },
  calibration: { graduations: 9, tierMix: { fog: 1, echo: 1, forum: 4, spark: 3 } },
  magnanimity: { graduations: 10, tierMix: { fog: 1, echo: 1, forum: 5, spark: 3 } },
  discourse: {
    graduations: 17,
    tierMix: { echo: 1, heat: 5, forum: 6, spark: 3, stance: 2 },
    topicPhases: [{ topic: 'philosophy_ethics', count: 17 }],
  },
  consistency: { graduations: 19, tierMix: { echo: 2, forum: 13, spark: 4 } },
};

const SUFFIX = '_S_1_';
const plan = planFingerprint(WEN, { size: 296, resonance: 0.54, salt: 7, topics: TOPICS });
const svg = renderFingerprintSvg(plan, { idSuffix: SUFFIX, classes: CLASSES });
const tree = parse(svg.markup);

const isHalo = (n: Node) => n.name === 'g' && classesOf(n).includes(CLASSES.halo);
const isRing = (n: Node) => n.name === 'g' && classesOf(n).includes(CLASSES.ring);

function kindOf(n: Node): string {
  if (n.name === 'circle') {
    const c = classesOf(n);
    if (c.includes(CLASSES.guide) || c.includes(CLASSES.guideNewborn)) return 'guide';
    if (c.includes(CLASSES.anchorDot)) return 'anchor-dot';
    if (c.includes(CLASSES.anchorRing)) return 'anchor-ring';
    if ((n.attrs.fill ?? '').startsWith('url(')) return 'glow';
    return 'seed';
  }
  if (isHalo(n)) return 'halo';
  if (isRing(n)) return 'ring';
  return n.name;
}

function render(p: FingerprintPlan, idSuffix = SUFFIX) {
  return parse(renderFingerprintSvg(p, { idSuffix, classes: CLASSES }).markup);
}

// ─── The frame and the paint order ──────────────────────────────────────────

describe('renderFingerprintSvg: frame and order', () => {
  it('frames the figure at the plan total size', () => {
    expect(svg.width).toBe(plan.totalSize);
    expect(svg.height).toBe(plan.totalSize);
    expect(svg.viewBox).toBe(`0 0 ${plan.totalSize} ${plan.totalSize}`);
  });

  it('paints in the engine order: defs, potential ring, glow, axis lines, seeds, halo, rings, anchor, labels', () => {
    expect(tree.children.map(kindOf)).toEqual([
      'defs',
      'guide',
      'glow',
      ...plan.axisLines.map(() => 'line'),
      'halo',
      ...plan.rings.map(() => 'ring'),
      'anchor-dot',
      'anchor-ring',
      ...plan.labels.map(() => 'text'),
    ]);
  });

  it('writes the same markup for the same plan, in printable ASCII only', () => {
    expect(renderFingerprintSvg(plan, { idSuffix: SUFFIX, classes: CLASSES }).markup).toBe(svg.markup);
    expect(/^[\x20-\x7e]*$/.test(svg.markup)).toBe(true);
  });
});

// ─── Ids ────────────────────────────────────────────────────────────────────

describe('renderFingerprintSvg: ids', () => {
  const ids = all(tree)
    .map((n) => n.attrs.id)
    .filter((id): id is string => id !== undefined);
  const refs = all(tree).flatMap((n) =>
    Object.entries(n.attrs).flatMap(([name, v]) => {
      const url = /^url\(#(.+)\)$/.exec(v);
      if (url) return [url[1] as string];
      return name === 'href' ? [v.replace(/^#/, '')] : [];
    }),
  );

  it('suffixes every id, and resolves every reference inside the figure itself', () => {
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.endsWith(SUFFIX)).toBe(true);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(ids).toContain(ref);
  });

  it('shares no id with a second figure on the same page', () => {
    const other = new Set(
      all(render(plan, '_S_2_'))
        .map((n) => n.attrs.id)
        .filter(Boolean),
    );
    for (const id of ids) expect(other.has(id)).toBe(false);
  });

  it('keeps a hostile suffix inside its attribute', () => {
    const markup = renderFingerprintSvg(plan, { idSuffix: '"><script>x</script><x a="', classes: CLASSES }).markup;
    expect(markup).not.toContain('<script');
    const hostile = parse(markup);
    for (const n of all(hostile)) expect(['script', 'x']).not.toContain(n.name);
  });
});

// ─── Rings ──────────────────────────────────────────────────────────────────

describe('renderFingerprintSvg: rings', () => {
  const rings = tree.children.filter(isRing);

  it('draws one group per ring, interior first and silhouette last, as the plan orders them', () => {
    expect(rings).toHaveLength(plan.rings.length);
  });

  it('draws every planned segment as its own stroke, with the plan position, colour and width', () => {
    rings.forEach((g, i) => {
      const ring = plan.rings[i];
      if (!ring) throw new Error('missing ring');
      const segments = g.children.flatMap((run) => run.children);
      expect(segments).toHaveLength(ring.segments.length);
      segments.forEach((p, j) => {
        const s = ring.segments[j];
        if (!s) throw new Error('missing segment');
        expect(p.name).toBe('path');
        expect(readSegment(p.attrs.d)).toEqual([s.x1, s.y1, s.x2, s.y2]);
        expect(p.attrs.stroke).toBe(s.color);
        expect(Number(p.attrs['stroke-width'])).toBe(s.width);
      });
    });
  });

  it('carries a ring opacity once, on the ring, for the stylesheet to give each segment', () => {
    // Per segment, not per group: group opacity would composite the round-cap
    // joints differently from the engine's per-line opacity. The stylesheet
    // reads --ring-opacity onto every segment in the ring.
    rings.forEach((g, i) => {
      expect(g.attrs.style).toBe(`--ring-opacity:${String(plan.rings[i]?.opacity).replace(/^0\./, '.')}`);
      expect(Number((g.attrs.style ?? '').split(':')[1])).toBe(plan.rings[i]?.opacity);
      expect(g.attrs['stroke-linecap']).toBe('round');
      // Left at the default on purpose: fill none on the group changes how
      // Chrome renders the blurred inner rings, and a segment fills nothing.
      for (const n of [g, ...all(g)]) expect(n.attrs.fill).toBeUndefined();
      for (const p of all(g)) expect(p.attrs.opacity).toBeUndefined();
    });
  });

  it('runs consecutive segments of one clarity under that clarity blur filter', () => {
    rings.forEach((g, i) => {
      const ring = plan.rings[i];
      if (!ring) throw new Error('missing ring');
      let j = 0;
      let previous = '';
      for (const run of g.children) {
        expect(run.name).toBe('g');
        const filter = run.attrs.filter ?? '';
        expect(filter).not.toBe(previous);
        previous = filter;
        for (let n = 0; n < run.children.length; n += 1) {
          expect(filter).toBe(`url(#fp-${ring.segments[j]?.blur}-${SUFFIX})`);
          j += 1;
        }
      }
      expect(j).toBe(ring.segments.length);
    });
  });

  it('marks only a newly earned silhouette for the grow animation', () => {
    const fresh = planFingerprint(WEN, { size: 296, salt: 7, newRingAxis: 'reach' });
    const groups = render(fresh).children.filter(isRing);
    const marked = groups.map((g) => classesOf(g).includes(CLASSES.grow));
    expect(marked).toEqual(fresh.rings.map((r) => r.isNew));
    expect(marked.filter(Boolean)).toHaveLength(1);
    expect(marked[marked.length - 1]).toBe(true);
    expect(rings.some((g) => classesOf(g).includes(CLASSES.grow))).toBe(false);
  });
});

// ─── The halo ───────────────────────────────────────────────────────────────

describe('renderFingerprintSvg: the halo', () => {
  const halo = plan.halo;
  if (!halo) throw new Error('fixture has no halo');
  const defs = tree.children[0] as Node;
  const g = tree.children.find(isHalo) as Node;
  const silhouette = all(defs).find((n) => n.name === 'path' && n.attrs.id !== undefined) as Node;

  it('defines the silhouette once, as the clip path, from the planned path', () => {
    expect(silhouette.attrs.d).toBe(halo.path);
    const clip = defs.children.find((n) => n.name === 'clipPath');
    expect(clip?.children).toEqual([silhouette]);
  });

  it('throws three strokes of the silhouette outward and two clipped inside, every one with no fill', () => {
    const outer = g.children.filter((n) => n.name === 'use');
    const clipped = g.children.find((n) => n.name === 'g');
    const clip = defs.children.find((n) => n.name === 'clipPath');
    expect(outer).toHaveLength(halo.outer.length);
    expect(clipped?.attrs['clip-path']).toBe(`url(#${clip?.attrs.id})`);
    expect(clipped?.children).toHaveLength(halo.inner.length);
    const pairs = [
      ...outer.map((n, i) => [n, halo.outer[i]] as const),
      ...(clipped?.children ?? []).map((n, i) => [n, halo.inner[i]] as const),
    ];
    for (const [n, s] of pairs) {
      if (!s) throw new Error('missing stroke');
      expect(n.name).toBe('use');
      expect(n.attrs.href).toBe(`#${silhouette.attrs.id}`);
      expect(n.attrs.fill).toBe('none');
      expect(n.attrs.stroke).toBe(s.color);
      expect(Number(n.attrs['stroke-width'])).toBe(s.width);
      expect(Number(n.attrs.opacity)).toBe(s.opacity);
      expect(n.attrs.filter).toBe(`url(#fp-halo-${s.blur}-${SUFFIX})`);
    }
  });

  it('blurs by the planned near and far deviations', () => {
    const blurOf = (id: string) =>
      Number(defs.children.find((n) => n.attrs.id === id)?.children[0]?.attrs.stdDeviation ?? NaN);
    expect(blurOf(`fp-halo-near-${SUFFIX}`)).toBe(halo.blurNear);
    expect(blurOf(`fp-halo-far-${SUFFIX}`)).toBe(halo.blurFar);
  });

  it('draws no halo, and defines none, at zero resonance', () => {
    const calm = render(planFingerprint(WEN, { size: 296, resonance: 0, salt: 7 }));
    expect(calm.children.some(isHalo)).toBe(false);
    expect(all(calm).some((n) => n.name === 'clipPath' || n.name === 'use')).toBe(false);
  });
});

// ─── Newborn, chrome and labels ─────────────────────────────────────────────

describe('renderFingerprintSvg: chrome', () => {
  const P = FINGERPRINT_RENDER;

  it('draws a Newborn as six seed dots in the darker potential ring, and nothing grown', () => {
    const newborn = planFingerprint({}, { size: 180, resonance: 0.9, salt: 1 });
    const t = render(newborn);
    const guide = t.children.find((n) => kindOf(n) === 'guide');
    expect(classesOf(guide as Node)).toEqual([CLASSES.guideNewborn]);
    expect(Number(guide?.attrs.opacity)).toBe(newborn.guideOpacity);
    const seeds = t.children.filter((n) => kindOf(n) === 'seed');
    expect(seeds.map((n) => [Number(n.attrs.cx), Number(n.attrs.cy), Number(n.attrs.r), n.attrs.fill, Number(n.attrs.opacity)])).toEqual(
      newborn.seedDots.map((d) => [d.x, d.y, d.r, d.color, d.opacity]),
    );
    expect(t.children.some((n) => isRing(n) || isHalo(n))).toBe(false);
  });

  it('takes every chrome number from the plan params', () => {
    const guide = tree.children.find((n) => kindOf(n) === 'guide') as Node;
    expect(classesOf(guide)).toEqual([CLASSES.guide]);
    expect(Number(guide.attrs.r)).toBe(plan.maxR);
    expect(Number(guide.attrs['stroke-width'])).toBe(P.guide.strokeWidth);
    expect(guide.attrs['stroke-dasharray']).toBe(P.guide.dash);
    expect(Number(guide.attrs.opacity)).toBe(plan.guideOpacity);

    const glow = tree.children.find((n) => kindOf(n) === 'glow') as Node;
    expect(Number(glow.attrs.r)).toBe(plan.maxR * P.centerGlow.radiusFactor);
    const gradient = (tree.children[0] as Node).children.find((n) => n.name === 'radialGradient') as Node;
    expect(glow.attrs.fill).toBe(`url(#${gradient.attrs.id})`);
    expect(gradient.children[0]?.attrs.style).toContain(`stop-opacity:${P.centerGlow.opacity}`);

    const blurs = (tree.children[0] as Node).children.filter((n) => n.name === 'filter').slice(0, 3);
    expect(blurs.map((n) => [n.attrs.id, Number(n.children[0]?.attrs.stdDeviation)])).toEqual(
      (['crisp', 'soft', 'diffuse'] as const).map((b) => [`fp-${b}-${SUFFIX}`, P.clarity.blur[b]]),
    );

    const lines = tree.children.filter((n) => n.name === 'line');
    expect(lines.map((n) => [n.attrs.x1, n.attrs.y1, n.attrs.x2, n.attrs.y2].map(Number))).toEqual(
      plan.axisLines.map((l) => [l.x1, l.y1, l.x2, l.y2]),
    );
    for (const l of lines) {
      expect(classesOf(l)).toEqual([CLASSES.axisLine]);
      expect(Number(l.attrs['stroke-width'])).toBe(P.axisLines.strokeWidth);
      expect(Number(l.attrs.opacity)).toBe(P.axisLines.opacity);
    }

    const dot = tree.children.find((n) => kindOf(n) === 'anchor-dot') as Node;
    const ring = tree.children.find((n) => kindOf(n) === 'anchor-ring') as Node;
    expect([dot.attrs.cx, dot.attrs.cy, dot.attrs.r, dot.attrs.opacity].map(Number)).toEqual([
      plan.spine.x,
      plan.spine.y,
      P.anchor.dotRadius,
      P.anchor.dotOpacity,
    ]);
    expect([ring.attrs.r, ring.attrs['stroke-width'], ring.attrs.opacity].map(Number)).toEqual([
      P.anchor.ringRadius,
      P.anchor.ringStrokeWidth,
      P.anchor.ringOpacity,
    ]);
    expect(ring.attrs.fill).toBe('none');
  });

  it('names the six pillars around the ring, and draws no labels or axis lines when they are off', () => {
    const texts = tree.children.filter((n) => n.name === 'text');
    expect(texts.map((n) => [n.text, Number(n.attrs.x), Number(n.attrs.y)])).toEqual(
      plan.labels.map((l) => [pillarName(l.axis), l.x, l.y]),
    );
    for (const t of texts) {
      expect(classesOf(t)).toEqual([CLASSES.label]);
      expect(Number(t.attrs['font-size'])).toBe(P.label.fontSize);
      expect(t.attrs['letter-spacing']).toBe(P.label.letterSpacing);
      expect(t.attrs['text-anchor']).toBe('middle');
      expect(t.attrs['dominant-baseline']).toBe('middle');
    }
    const bare = render(planFingerprint(WEN, { size: 120, showLabels: false, showAxisLines: false, salt: 7 }));
    expect(bare.children.some((n) => n.name === 'text' || n.name === 'line')).toBe(false);
  });
});
