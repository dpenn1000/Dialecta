/**
 * Fingerprint paint plan: everything the Thinking Fingerprint draws, as data.
 *
 * Ported from the `Fingerprint` component in
 * `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx` (engine v2.0.0,
 * quarantine: read and cited, not promoted blind). That component did its maths
 * inline inside a React render. This module is the same maths with the React
 * taken out, so the renderer in apps/web only draws what it is handed, and the
 * numbers can be tested without a browser.
 *
 * CONSUMED FROM THE REST OF packages/core RATHER THAN RE-DERIVED
 *
 *   radius      `axisExtent` (fingerprint-geometry.ts). The soft horizon replaces
 *               the engine's `maxR * (min(g, 22) / 22) ** 0.85 * tradeoff` (:296).
 *   ring count  `ringCount` per axis (fingerprint-geometry.ts). Still clamped.
 *   texture     `ringFields` and `textureOffset` (fingerprint-texture.ts). The
 *               walked rotation replaces `ringSeed = k * 11.7 + 3.3` (:432),
 *               which was the spiral, and whole-number frequencies close the seam
 *               the engine carried at theta = 0.
 *   saturation  `applyPurity` (fingerprint-texture.ts): the channel the engine
 *               documented at its line 175 and never built. See FINGERPRINT.md.
 *
 * Everything else is the engine's own and cites its line.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * designer's legibility ruling (council/designer/positions/2026-09-20-fingerprint-legibility.md)
 * would mask the halo to the exterior, cut the centre glow, flatten the opacity
 * ramp, drop stroke weight by strength and change the ring count. The model
 * debate is still running. None of it is built: this is the current engine,
 * faithfully. Every number any of those rulings would touch lives in
 * FINGERPRINT_RENDER, so a ruling lands as one edited object, or as a whole
 * replacement passed in `options.params`, rather than a hunt through the code.
 *
 * Determinism is load-bearing, as it is in the texture module: the same input
 * gives the same plan on every render, on the server and in the browser, so a
 * server-rendered fingerprint hydrates without a mismatch. Coordinates are
 * rounded to two decimals for the same reason.
 */

import { GRADUATION_HORIZON, axisExtent, ringCount, type AxisTotals } from './fingerprint-geometry';
import { applyPurity, ringFields, textureOffset } from './fingerprint-texture';
import type { Axis } from './pillars';
import type { Tier } from './tiers';

// ─── Input ──────────────────────────────────────────────────────────────────

/** A run of consecutive graduations earned on one topic, oldest first. */
export interface TopicPhase {
  topic: string;
  count: number;
}

/**
 * One axis as the engine reads it. `graduations` is `axis_scores.graduation_count`.
 * `tierMix` is a per-tier count; Breach may appear and is ignored, see
 * `deriveAxisMetrics`. `topicPhases` is the history in time order.
 */
export interface FingerprintAxisData {
  graduations: number;
  tierMix?: Partial<Record<Tier, number>>;
  topicPhases?: readonly TopicPhase[];
}

export type FingerprintData = Partial<Record<Axis, FingerprintAxisData>>;

/** A topic's two tones: `color` for rings and chips, `colorDeep` for the silhouette. */
export interface TopicColor {
  color: string;
  colorDeep: string;
}

/** Topic slug to tones. apps/web owns the taxonomy and passes it in. */
export type TopicPalette = Readonly<Record<string, TopicColor>>;

// ─── The wheel ──────────────────────────────────────────────────────────────

/**
 * The six spokes, degrees clockwise from the top. Engine :73-90 and the axis
 * table in FINGERPRINT.md. Structural, not a tuning value: moving a spoke moves
 * every fingerprint ever rendered.
 */
export const FINGERPRINT_WHEEL: ReadonlyArray<{ readonly axis: Axis; readonly angle: number }> = [
  { axis: 'acuity', angle: 0 },
  { axis: 'calibration', angle: 60 },
  { axis: 'magnanimity', angle: 120 },
  { axis: 'discourse', angle: 180 },
  { axis: 'consistency', angle: 240 },
  { axis: 'reach', angle: 300 },
] as const;

// ─── Parameters ─────────────────────────────────────────────────────────────

export type ClarityBucket = 'crisp' | 'soft' | 'diffuse';
export type HaloBlur = 'near' | 'far';

export interface FingerprintRenderParams {
  readonly frame: {
    readonly labelMargin: number;
    readonly maxRadiusFactor: number;
    readonly labelOffset: number;
    readonly perimeterSamples: number;
  };
  readonly spine: { readonly fullAt: number; readonly liftFactor: number };
  readonly seed: { readonly radiusFactor: number; readonly dotRadius: number; readonly opacity: number };
  readonly rings: {
    readonly countBase: number;
    readonly countPerRing: number;
    readonly countMin: number;
    readonly minAxisRadiusFactor: number;
    readonly centerClearanceFactor: number;
    readonly turbulenceFalloff: number;
    readonly silhouette: { readonly opacity: number; readonly strokeWidth: number };
    readonly outer: {
      readonly through: number;
      readonly opacityTop: number;
      readonly opacityStep: number;
      readonly strokeWidth: number;
    };
    readonly interior: {
      readonly opacityTop: number;
      readonly opacitySpan: number;
      readonly opacityFloor: number;
      readonly strokeWidth: number;
    };
    readonly strokeScale: { readonly min: number; readonly span: number };
  };
  readonly clarity: {
    readonly crispAbove: number;
    readonly softAbove: number;
    readonly blur: Readonly<Record<ClarityBucket, number>>;
  };
  readonly purity: { readonly saturation: boolean };
  readonly halo: {
    readonly curve: number;
    readonly width: { readonly base: number; readonly gain: number };
    readonly opacity: { readonly base: number; readonly gain: number };
    readonly blurNear: { readonly base: number; readonly gain: number };
    readonly blurFar: { readonly base: number; readonly gain: number };
    readonly outer: ReadonlyArray<{
      readonly tone: 'base' | 'deep';
      readonly width: number;
      readonly opacity: number;
      readonly blur: HaloBlur;
    }>;
    readonly inner: ReadonlyArray<{ readonly width: number; readonly opacity: number; readonly blur: HaloBlur }>;
    readonly defaultColor: string;
    readonly defaultColorDeep: string;
    readonly flavors: ReadonlyArray<{ readonly tier: Tier; readonly hue: string; readonly weight: number }>;
  };
  readonly guide: {
    readonly strokeWidth: number;
    readonly dash: string;
    readonly opacity: number;
    readonly newbornOpacity: number;
  };
  readonly axisLines: { readonly strokeWidth: number; readonly opacity: number };
  readonly centerGlow: { readonly radiusFactor: number; readonly opacity: number };
  readonly anchor: {
    readonly dotRadius: number;
    readonly dotOpacity: number;
    readonly ringRadius: number;
    readonly ringStrokeWidth: number;
    readonly ringOpacity: number;
  };
  readonly label: { readonly fontSize: number; readonly letterSpacing: string };
  readonly colors: {
    readonly neutral: TopicColor;
    readonly axes: Readonly<Record<Axis, TopicColor>>;
  };
}

/**
 * Every number the renderer uses, in one place. Values are the recovered
 * engine's; the line each one came from is cited so a tuning pass can check
 * what it is changing. Chrome colours (the guide ring, the axis lines, the
 * anchor, the labels) are not here: the renderer takes those from tokens.css.
 * The colours that are here are data the engine blends numerically, which a CSS
 * variable cannot be.
 */
export const FINGERPRINT_RENDER: FingerprintRenderParams = {
  frame: {
    /** TUNING: px each side for the pillar labels. Engine :115, cut 36 to 22 on 2026-04-29. */
    labelMargin: 22,
    /** TUNING: the guide ring's radius as a fraction of the geometry size. Engine :119. */
    maxRadiusFactor: 0.42,
    /** TUNING: px from the guide ring to the label centres. Engine :855. */
    labelOffset: 28,
    /** TUNING: points sampled around each ring, 16 per axis. Engine :124. */
    perimeterSamples: 96,
  },
  spine: {
    /** TUNING: summed ring count at which the centre stops lifting. Engine :154. */
    fullAt: 60,
    /** TUNING: how far a young fingerprint's centre sits above the middle, as a fraction of the ring. Engine :156. */
    liftFactor: 0.18,
  },
  seed: {
    /** TUNING: Newborn seed distance from the centre, as a fraction of the ring. Engine :313. */
    radiusFactor: 0.1,
    /** TUNING: Engine :683. */
    dotRadius: 3,
    /** TUNING: Engine :684. */
    opacity: 0.55,
  },
  rings: {
    /** TUNING: total rings = max(countMin, round(maxRings * countPerRing + countBase)). Engine :424. */
    countBase: 4,
    countPerRing: 1.15,
    countMin: 4,
    /** TUNING: the radius an axis with no graduations keeps, as a fraction of the ring. Engine :126. */
    minAxisRadiusFactor: 0.04,
    /** TUNING: the innermost ring's radius, as a fraction of the ring. Engine :453. */
    centerClearanceFactor: 0.08,
    /** TUNING: how tightly turbulence and maturity stay on their own axis. Engine :487. */
    turbulenceFalloff: 2.5,
    /** TUNING: Engine :572-575. */
    silhouette: { opacity: 0.95, strokeWidth: 1.6 },
    /** TUNING: rings 1 to `through`. Engine :576-579. */
    outer: { through: 2, opacityTop: 0.78, opacityStep: 0.08, strokeWidth: 1.2 },
    /** TUNING: everything inside the outer band, fading toward the centre. Engine :580-586. */
    interior: { opacityTop: 0.55, opacitySpan: 0.3, opacityFloor: 0.22, strokeWidth: 1.25 },
    /** TUNING: stroke weight by strength at that angle, min to min + span. Engine :832. */
    strokeScale: { min: 0.55, span: 0.9 },
  },
  clarity: {
    /** TUNING: the three blur buckets and where they split. Engine :836-838 and :635-643. */
    crispAbove: 0.75,
    softAbove: 0.45,
    blur: { crisp: 0.25, soft: 0.55, diffuse: 1.1 },
  },
  purity: {
    /**
     * TUNING: whether ring colour carries purity. The engine never built this
     * channel; fingerprint-texture.ts did, on 2026-09-20. Off renders the
     * engine's colour exactly.
     */
    saturation: true,
  },
  halo: {
    /** TUNING: resonance ** curve, which widens the low end. Engine :701. */
    curve: 0.7,
    width: { base: 1.5, gain: 8 },
    opacity: { base: 0.15, gain: 0.7 },
    blurNear: { base: 3, gain: 10 },
    blurFar: { base: 8, gain: 22 },
    /** TUNING: three strokes of the silhouette, fill none. Engine :724-752. Never a filled shape. */
    outer: [
      { tone: 'base', width: 3.5, opacity: 0.22, blur: 'far' },
      { tone: 'base', width: 2, opacity: 0.5, blur: 'near' },
      { tone: 'deep', width: 0.9, opacity: 0.9, blur: 'near' },
    ],
    /** TUNING: the inward bleed, clipped to the silhouette. Engine :760-777. */
    inner: [
      { width: 6, opacity: 0.35, blur: 'near' },
      { width: 3, opacity: 0.5, blur: 'near' },
    ],
    /** TUNING: halo hue when no topic history exists. Engine :627-628. */
    defaultColor: '#b8862e',
    defaultColorDeep: '#6a4a10',
    /** TUNING: the tier flavours that tint the inner bleed, by ratio times weight. Engine :654-656. */
    flavors: [
      { tier: 'fog', hue: '#8a8680', weight: 2.2 },
      { tier: 'heat', hue: '#c45818', weight: 2.8 },
      { tier: 'stance', hue: '#6a1010', weight: 3.2 },
    ],
  },
  guide: {
    strokeWidth: 0.5,
    dash: '2 4',
    /** TUNING: the potential ring behind a grown fingerprint. Engine :661. */
    opacity: 0.5,
    /**
     * TUNING: the potential ring in the Newborn state, the one addition to the
     * engine here. With no rings in front of it the ring is most of the
     * picture, and at the engine's 0.5 of --border-light it all but vanished
     * on paper while the caption points at it. Set it to `opacity` to render
     * the engine exactly. The renderer also strokes it one token darker.
     */
    newbornOpacity: 0.9,
  },
  axisLines: { strokeWidth: 0.5, opacity: 0.4 },
  /** TUNING: the gold glow at the centre. designer proposes cutting it; it stays until that lands. Engine :664-667. */
  centerGlow: { radiusFactor: 0.5, opacity: 0.18 },
  anchor: { dotRadius: 3, dotOpacity: 0.85, ringRadius: 5, ringStrokeWidth: 0.5, ringOpacity: 0.4 },
  label: { fontSize: 10, letterSpacing: '0.1em' },
  colors: {
    /** A topic slug the palette does not know. Engine :243-244. */
    neutral: { color: '#8a8278', colorDeep: '#5a5248' },
    /**
     * The axis fallback hues. Engine :73-90: used for seed dots and for any ring
     * with no topic history, and explicitly not axis identity. FINGERPRINT.md,
     * "Hue is not axis identity".
     */
    axes: {
      acuity: { color: '#d49415', colorDeep: '#7a5008' },
      calibration: { color: '#2674d4', colorDeep: '#143e7a' },
      magnanimity: { color: '#3aa564', colorDeep: '#1a5a32' },
      discourse: { color: '#dc5418', colorDeep: '#7c2808' },
      consistency: { color: '#b8429a', colorDeep: '#5e1c50' },
      reach: { color: '#a8a020', colorDeep: '#5a5408' },
    },
  },
};

// ─── Output ─────────────────────────────────────────────────────────────────

export interface FingerprintSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  blur: ClarityBucket;
}

export interface FingerprintRing {
  /** 0 is the silhouette: the outermost ring and the newest history. */
  k: number;
  category: 'silhouette' | 'outer' | 'interior';
  opacity: number;
  /** The closed curve through the ring's points. The halo reuses the silhouette's. */
  path: string;
  segments: FingerprintSegment[];
  isNew: boolean;
}

export interface FingerprintHaloStroke {
  color: string;
  width: number;
  opacity: number;
  blur: HaloBlur;
}

export interface FingerprintHalo {
  path: string;
  color: string;
  colorDeep: string;
  innerColor: string;
  blurNear: number;
  blurFar: number;
  /** Strokes of the silhouette with no fill, drawn unclipped. */
  outer: FingerprintHaloStroke[];
  /** Strokes of the silhouette with no fill, clipped to the silhouette. */
  inner: FingerprintHaloStroke[];
}

export interface FingerprintPlan {
  state: 'newborn' | 'grown';
  size: number;
  totalSize: number;
  cx: number;
  cy: number;
  /** The guide ring's radius: the horizon every axis approaches and none reaches. */
  maxR: number;
  /** The guide ring's opacity for this state. */
  guideOpacity: number;
  spine: { x: number; y: number };
  axisLines: Array<{ axis: Axis; x1: number; y1: number; x2: number; y2: number }>;
  labels: Array<{ axis: Axis; x: number; y: number }>;
  seedDots: Array<{ axis: Axis; x: number; y: number; r: number; color: string; opacity: number }>;
  /** Interior first, silhouette last, the order they paint in. */
  rings: FingerprintRing[];
  halo: FingerprintHalo | null;
  params: FingerprintRenderParams;
}

export interface PlanOptions {
  /** The geometry's size in px. The drawn frame is this plus the label margin each side. */
  size: number;
  showLabels?: boolean;
  showAxisLines?: boolean;
  /** 0 to 1: how much the contributor's voice lands. Drives the halo. */
  resonance?: number;
  /** Keys the texture to a contributor. `fingerprintSalt(profileId)`. */
  salt?: number;
  /** When set, the silhouette is flagged as new so the renderer can animate it. */
  newRingAxis?: Axis | null;
  topics?: TopicPalette;
  /** A whole replacement for FINGERPRINT_RENDER. */
  params?: FingerprintRenderParams;
}

// ─── Derived metrics ────────────────────────────────────────────────────────

export interface AxisMetrics {
  purity: number;
  turbulence: number;
  clarity: number;
  total: number;
}

/** The six tiers that earn. Breach earns nothing and is not a term (FINGERPRINT.md). */
const EARNING_TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance'] as const;

function count(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Purity, turbulence and clarity for one axis. Engine :186-206.
 *
 *   purity     = forum / total                 saturation and base wobble
 *   turbulence = (heat + stance) / total       wave amplitude and frequency
 *   clarity    = forum / (forum + echo + fog)  line crispness
 *
 * `total` sums the six earning tiers and never Breach. Adding Breach would
 * inflate all three denominators and quietly lower saturation, turbulence and
 * clarity for anyone with a breach in their history.
 *
 * Divergence from the engine: a missing `tierMix` reads as empty rather than
 * being synthesised from a legacy `purity` number, because nothing stores that
 * number any more and `axis_scores.tier_mix` is NOT NULL.
 */
export function deriveAxisMetrics(axis: FingerprintAxisData | undefined): AxisMetrics {
  const calm: AxisMetrics = { purity: 1, turbulence: 0, clarity: 1, total: 0 };
  if (!axis || count(axis.graduations) === 0) return calm;
  const mix = axis.tierMix ?? {};
  const total = EARNING_TIERS.reduce((sum, t) => sum + count(mix[t]), 0);
  if (total === 0) return calm;
  const forum = count(mix.forum);
  const clarityDenominator = forum + count(mix.echo) + count(mix.fog);
  return {
    purity: forum / total,
    turbulence: (count(mix.heat) + count(mix.stance)) / total,
    clarity: clarityDenominator > 0 ? forum / clarityDenominator : 1,
    total,
  };
}

/**
 * Stored topic history to the engine's phases, oldest first.
 *
 * `axis_scores.topic_history` holds one topic slug per graduation, in time
 * order. The engine wants runs of `{ topic, count }`. Already-grouped entries
 * are accepted too, and neighbouring runs of one topic merge. Anything that is
 * not a slug or a positive whole count is dropped rather than guessed at.
 */
export function topicPhasesFromHistory(history: unknown): TopicPhase[] {
  if (!Array.isArray(history)) return [];
  const phases: TopicPhase[] = [];
  for (const entry of history) {
    let topic: string | null = null;
    let n = 0;
    if (typeof entry === 'string') {
      topic = entry;
      n = 1;
    } else if (entry && typeof entry === 'object') {
      const e = entry as { topic?: unknown; count?: unknown };
      if (typeof e.topic === 'string' && typeof e.count === 'number' && Number.isInteger(e.count) && e.count > 0) {
        topic = e.topic;
        n = e.count;
      }
    }
    if (!topic || n <= 0) continue;
    const last = phases[phases.length - 1];
    if (last && last.topic === topic) last.count += n;
    else phases.push({ topic, count: n });
  }
  return phases;
}

/**
 * A stable 32 bit salt from a contributor's id: FNV-1a over the string. Two
 * contributors with identical histories still render differently, and one
 * contributor renders identically everywhere.
 */
export function fingerprintSalt(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h | 0;
}

// ─── Colour ─────────────────────────────────────────────────────────────────

type Rgb = readonly [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex([r, g, b]: Rgb): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function blendRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** The engine's `blendColors` (:398-407): per channel, rounded. Six-digit hex only. */
export function blendHex(a: string, b: string, t: number): string {
  return rgbToHex(blendRgb(hexToRgb(a), hexToRgb(b), t));
}

// ─── Interpolation ──────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const AXIS_ANGLES = FINGERPRINT_WHEEL.map((w) => (w.angle * Math.PI) / 180);

/** The two spokes either side of theta and how far between them it sits. Engine :334-362. */
function findAxisInterp(theta: number): { a: number; b: number; factor: number } {
  const t = ((theta % TAU) + TAU) % TAU;
  const n = AXIS_ANGLES.length;
  for (let i = 0; i < n; i += 1) {
    const aA = AXIS_ANGLES[i] ?? 0;
    const aB = AXIS_ANGLES[(i + 1) % n] ?? 0;
    if (aB > aA) {
      if (t >= aA && t < aB) return { a: i, b: (i + 1) % n, factor: (t - aA) / (aB - aA) };
    } else if (t >= aA || t < aB) {
      const span = TAU - aA + aB;
      return { a: i, b: (i + 1) % n, factor: (t >= aA ? t - aA : TAU - aA + t) / span };
    }
  }
  return { a: 0, b: 1, factor: 0 };
}

/** Engine :365-367. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Colour only: holds each hue across most of its span and turns quickly at the midpoint. Engine :372-376. */
function sharpBlend(t: number): number {
  return smoothstep(smoothstep(t));
}

const r2 = (v: number): number => Math.round(v * 100) / 100;
const r4 = (v: number): number => Math.round(v * 10000) / 10000;
const fmt = (v: number): string => v.toFixed(2);

// ─── The plan ───────────────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
  color: string;
  colorDeep: string;
  strength: number;
  clarity: number;
}

function closedCurve(points: readonly Point[]): string {
  const n = points.length;
  const at = (i: number): Point => points[((i % n) + n) % n] as Point;
  const first = at(0);
  let d = `M ${fmt(first.x)} ${fmt(first.y)}`;
  // Catmull-Rom through every point, as cubic Beziers. Engine :553-567.
  for (let p = 0; p < n; p += 1) {
    const p0 = at(p - 1);
    const p1 = at(p);
    const p2 = at(p + 1);
    const p3 = at(p + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return `${d} Z`;
}

function clarityBucket(clarity: number, params: FingerprintRenderParams): ClarityBucket {
  if (clarity > params.clarity.crispAbove) return 'crisp';
  if (clarity > params.clarity.softAbove) return 'soft';
  return 'diffuse';
}

/**
 * Everything the renderer draws for one contributor, in paint order.
 *
 * With no graduations on any axis this is the Newborn state: six seed dots
 * inside the potential ring and no rings, which is what most profiles show
 * today. Otherwise it is the full ring set and, when resonance is above zero,
 * the halo.
 */
export function planFingerprint(data: FingerprintData, options: PlanOptions): FingerprintPlan {
  const P = options.params ?? FINGERPRINT_RENDER;
  const size = options.size;
  const showLabels = options.showLabels ?? true;
  const showAxisLines = options.showAxisLines ?? true;
  const resonance = Math.max(0, Math.min(1, Number.isFinite(options.resonance) ? (options.resonance ?? 0) : 0));
  const salt = options.salt ?? 0;
  const topics = options.topics ?? {};

  const margin = showLabels ? P.frame.labelMargin : 0;
  const totalSize = size + margin * 2;
  const cx = totalSize / 2;
  const cy = totalSize / 2;
  const maxR = size * P.frame.maxRadiusFactor;

  const wheel = FINGERPRINT_WHEEL;
  const axisData = wheel.map((w) => data[w.axis]);
  const graduations = axisData.map((a) => count(a?.graduations));
  const rings = graduations.map((g) => ringCount(g));
  const maxRings = Math.max(0, ...rings);
  const summedRings = rings.reduce((s, n) => s + n, 0);

  // A young fingerprint's centre sits a little high and settles as it grows. Engine :152-156.
  const spineFactor = Math.min(summedRings / P.spine.fullAt, 1);
  const spineX = cx;
  const spineY = cy - (1 - spineFactor) * maxR * P.spine.liftFactor;
  const spine = { x: r2(spineX), y: r2(spineY) };

  const spoke = (angleDeg: number, radius: number, ox: number, oy: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: ox + Math.cos(rad) * radius, y: oy + Math.sin(rad) * radius };
  };

  const axisLines = showAxisLines
    ? wheel.map((w) => {
        const end = spoke(w.angle, maxR, spineX, spineY);
        return { axis: w.axis, x1: spine.x, y1: spine.y, x2: r2(end.x), y2: r2(end.y) };
      })
    : [];

  const labels = showLabels
    ? wheel.map((w) => {
        const at = spoke(w.angle, maxR + P.frame.labelOffset, cx, cy);
        return { axis: w.axis, x: r2(at.x), y: r2(at.y) };
      })
    : [];

  const base = {
    size,
    totalSize,
    cx,
    cy,
    maxR,
    spine,
    axisLines,
    labels,
    params: P,
  };

  // ─── Newborn. Engine :310-326. ───────────────────────────────────────────
  if (maxRings === 0) {
    return {
      ...base,
      state: 'newborn',
      guideOpacity: P.guide.newbornOpacity,
      seedDots: wheel.map((w) => {
        const at = spoke(w.angle, maxR * P.seed.radiusFactor, spineX, spineY);
        return {
          axis: w.axis,
          x: r2(at.x),
          y: r2(at.y),
          r: P.seed.dotRadius,
          color: P.colors.axes[w.axis].color,
          opacity: P.seed.opacity,
        };
      }),
      rings: [],
      halo: null,
    };
  }

  // ─── Per-axis inputs. ────────────────────────────────────────────────────
  const metrics = axisData.map((a) => deriveAxisMetrics(a));
  const totals: AxisTotals = Object.fromEntries(wheel.map((w, i) => [w.axis, graduations[i] ?? 0]));
  const axisMax = wheel.map((w, i) => ((rings[i] ?? 0) === 0 ? 0 : maxR * axisExtent(w.axis, totals)));

  // Topic history per ring, oldest first. Engine :219-243.
  const flatTopics = axisData.map((a) => {
    const phases = a?.topicPhases;
    if (!phases || phases.length === 0) return null;
    const flat: string[] = [];
    for (const phase of phases) for (let i = 0; i < phase.count; i += 1) flat.push(phase.topic);
    return flat.length > 0 ? flat : null;
  });

  const tones = (axisIdx: number, k: number): { base: Rgb; deep: Rgb } => {
    const flat = flatTopics[axisIdx];
    const fallback = P.colors.axes[wheel[axisIdx]?.axis ?? 'acuity'];
    if (!flat) return { base: hexToRgb(fallback.color), deep: hexToRgb(fallback.colorDeep) };
    // Ring 0 is the newest, so it reads the end of the history. Engine :231-239.
    const idx = Math.max(0, Math.min(flat.length - 1, (rings[axisIdx] ?? 0) - 1 - k));
    const topic = topics[flat[idx] ?? ''] ?? P.colors.neutral;
    return { base: hexToRgb(topic.color), deep: hexToRgb(topic.colorDeep) };
  };

  const ringTotal = Math.max(P.rings.countMin, Math.round(maxRings * P.rings.countPerRing + P.rings.countBase));
  const fields = ringFields(ringTotal, salt);
  const samples = P.frame.perimeterSamples;
  const clearance = maxR * P.rings.centerClearanceFactor;
  const minAxis = maxR * P.rings.minAxisRadiusFactor;

  const built: FingerprintRing[] = [];
  for (let k = 0; k < ringTotal; k += 1) {
    const depth = k / Math.max(1, ringTotal - 1);
    const field = fields[k] ?? { rotation: 0, phase: 0 };

    // Every axis descends on the same global depth, so rings move toward the
    // centre together. Engine :445-456.
    const onAxis = (i: number): number =>
      (rings[i] ?? 0) === 0 ? minAxis : (axisMax[i] ?? 0) * (1 - depth) + clearance * depth;

    const points: Point[] = [];
    for (let p = 0; p < samples; p += 1) {
      const theta = (p / samples) * TAU;
      const { a, b, factor } = findAxisInterp(theta);
      const blend = smoothstep(factor);
      let radius = onAxis(a) * (1 - blend) + onAxis(b) * blend;

      const mA = metrics[a] as AxisMetrics;
      const mB = metrics[b] as AxisMetrics;
      const purity = mA.purity * (1 - blend) + mB.purity * blend;
      const clarity = mA.clarity * (1 - blend) + mB.clarity * blend;
      // Turbulence and maturity stay near their own axis. Engine :479-497.
      const wA = (1 - blend) ** P.rings.turbulenceFalloff;
      const wB = blend ** P.rings.turbulenceFalloff;
      const turbulence = mA.turbulence * wA + mB.turbulence * wB;
      const maturity = (rings[a] ?? 0) * wA + (rings[b] ?? 0) * wB;

      radius += textureOffset({ theta, field, depth, purity, turbulence, maturity });

      const x = spineX + Math.cos(theta - Math.PI / 2) * radius;
      const y = spineY + Math.sin(theta - Math.PI / 2) * radius;

      // Colour by topic history, crisp at the axis boundaries. Engine :526-540.
      const cBlend = sharpBlend(factor);
      const tA = tones(a, k);
      const tB = tones(b, k);
      let color = blendRgb(tA.base, tB.base, cBlend);
      let colorDeep = blendRgb(tA.deep, tB.deep, cBlend);
      if (P.purity.saturation) {
        color = applyPurity(color, purity);
        colorDeep = applyPurity(colorDeep, purity);
      }

      // Heavier ridges where more was earned. Engine :547-549.
      const strength =
        ((rings[a] ?? 0) / GRADUATION_HORIZON) * (1 - blend) + ((rings[b] ?? 0) / GRADUATION_HORIZON) * blend;

      points.push({ x: r2(x), y: r2(y), color: rgbToHex(color), colorDeep: rgbToHex(colorDeep), strength, clarity });
    }

    let category: FingerprintRing['category'];
    let opacity: number;
    let strokeWidth: number;
    if (k === 0) {
      category = 'silhouette';
      opacity = P.rings.silhouette.opacity;
      strokeWidth = P.rings.silhouette.strokeWidth;
    } else if (k <= P.rings.outer.through) {
      category = 'outer';
      opacity = P.rings.outer.opacityTop - (k - 1) * P.rings.outer.opacityStep;
      strokeWidth = P.rings.outer.strokeWidth;
    } else {
      category = 'interior';
      const inner = (k - (P.rings.outer.through + 1)) / Math.max(1, ringTotal - (P.rings.outer.through + 2));
      opacity = Math.max(
        P.rings.interior.opacityFloor,
        P.rings.interior.opacityTop - inner * P.rings.interior.opacitySpan,
      );
      strokeWidth = P.rings.interior.strokeWidth;
    }

    const segments: FingerprintSegment[] = points.map((pt, j) => {
      const next = points[(j + 1) % samples] as Point;
      const strength = (pt.strength + next.strength) / 2;
      return {
        x1: pt.x,
        y1: pt.y,
        x2: next.x,
        y2: next.y,
        color: category === 'silhouette' ? pt.colorDeep : pt.color,
        width: Math.round(strokeWidth * (P.rings.strokeScale.min + strength * P.rings.strokeScale.span) * 1000) / 1000,
        blur: clarityBucket((pt.clarity + next.clarity) / 2, P),
      };
    });

    built.push({
      k,
      category,
      opacity: r4(opacity),
      path: closedCurve(points),
      segments,
      isNew: k === 0 && options.newRingAxis != null,
    });
  }

  const silhouette = built[0];
  built.reverse();

  return {
    ...base,
    state: 'grown',
    guideOpacity: P.guide.opacity,
    seedDots: [],
    rings: built,
    halo: silhouette && resonance > 0 ? planHalo(silhouette.path, axisData, resonance, topics, P) : null,
  };
}

/**
 * The resonance halo: a light field that follows the silhouette exactly.
 * Engine :604-676 and :694-778.
 *
 * Three strokes of the silhouette path throw light outward, and two more,
 * clipped to the silhouette, bleed it inward. Every one of them is a stroke
 * with no fill. A first test render on 2026-09-20 drew it as a blurred FILL,
 * which floods the whole interior with up to 0.68 of the topic hue; that is not
 * what the engine does and not what this plans.
 */
function planHalo(
  path: string,
  axisData: ReadonlyArray<FingerprintAxisData | undefined>,
  resonance: number,
  topics: TopicPalette,
  P: FingerprintRenderParams,
): FingerprintHalo {
  // Hue from the topic with the most graduations across every axis. Engine :610-624.
  const topicCounts = new Map<string, number>();
  for (const axis of axisData) {
    for (const phase of axis?.topicPhases ?? []) {
      topicCounts.set(phase.topic, (topicCounts.get(phase.topic) ?? 0) + phase.count);
    }
  }
  let dominant: string | null = null;
  let best = 0;
  for (const [topic, n] of topicCounts) {
    if (n > best) {
      best = n;
      dominant = topic;
    }
  }
  const tone = dominant ? (topics[dominant] ?? P.colors.neutral) : null;
  const color = tone ? tone.color : P.halo.defaultColor;
  const colorDeep = tone ? tone.colorDeep : P.halo.defaultColorDeep;

  // The inner bleed carries a second signal: how the rings were earned. Engine :630-658.
  const summed = new Map<Tier, number>();
  let total = 0;
  for (const axis of axisData) {
    for (const t of EARNING_TIERS) {
      const n = count(axis?.tierMix?.[t]);
      summed.set(t, (summed.get(t) ?? 0) + n);
      total += n;
    }
  }
  let innerColor = color;
  if (total > 0) {
    for (const flavor of P.halo.flavors) {
      const ratio = (summed.get(flavor.tier) ?? 0) / total;
      if (ratio > 0) innerColor = blendHex(innerColor, flavor.hue, Math.min(1, ratio * flavor.weight));
    }
  }

  const curve = resonance ** P.halo.curve;
  const width = P.halo.width.base + curve * P.halo.width.gain;
  const opacity = P.halo.opacity.base + curve * P.halo.opacity.gain;

  return {
    path,
    color,
    colorDeep,
    innerColor,
    blurNear: P.halo.blurNear.base + curve * P.halo.blurNear.gain,
    blurFar: P.halo.blurFar.base + curve * P.halo.blurFar.gain,
    outer: P.halo.outer.map((s) => ({
      color: s.tone === 'deep' ? colorDeep : color,
      width: width * s.width,
      opacity: opacity * s.opacity,
      blur: s.blur,
    })),
    inner: P.halo.inner.map((s) => ({
      color: innerColor,
      width: width * s.width,
      opacity: opacity * s.opacity,
      blur: s.blur,
    })),
  };
}
