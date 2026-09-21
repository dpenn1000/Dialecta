/**
 * Render-only Cartesian, Ternary and Binary opinion maps: the author's
 * position on the article's declared axes, drawn as an SVG figure. No
 * 'use client', no hooks, no tap-to-place. Ported from the read-only half
 * of _recovered-next/lib/theme/dialecta-opinion-map.jsx (958 lines), which
 * the source's own header calls "read-only-capable": CartesianMap and
 * TernaryMap already took no hooks; BinaryMap did (drag state for
 * onPlace), so its drag handling, onPlace prop and pointer listeners are
 * dropped here rather than ported, which is what makes this file safe to
 * render from a Server Component.
 *
 * Step 4 of the architect's port plan (team/architect/architecture/
 * 2026-09-21-delta-mechanic-port.md, build order #4): render only, no
 * placement, no writes.
 *
 * Where step 6 plugs in: `placement-client.tsx` is a 'use client' island
 * that layers tap-to-stage and an explicit Commit button on top of these
 * same figures for a signed-in reader's own placement, exactly as
 * `InteractiveMap` in dialecta-opinion-map-placement.jsx does today. It
 * reuses the pure helpers exported below (ternaryColor, axisColor,
 * barycentricToXY, xyToBarycentric, clampBarycentric, inTriangle,
 * binaryBlend, densityRenderScale) rather than re-deriving the coordinate
 * math, the same way the source file's own header docstring intends them:
 * "also exported for future placement / heatmap engines." It also imports
 * the four landscape-palette constants below (POLE_COLORS, POLE_LABEL_COLORS,
 * AXIS_COLORS, AXIS_LABEL_COLORS), exported 2026-09-21 alongside step 6
 * (a purely additive change; nothing about their existing use here moved
 * or changed) so the interactive figures paint the identical hues these
 * read-only ones do, from one place, rather than a second hardcoded copy.
 *
 * Colors: two families. The surface tokens (ink, paper-bright, wood-edge,
 * the font stack) already exist in styles/tokens.css and
 * styles/dialecta-surfaces.css and are referenced here by var() only, no
 * hex. The per-pole/per-axis landscape hues (POLE_COLORS, AXIS_COLORS and
 * their darker *_LABEL_COLORS variants below) are NOT design tokens: the
 * source file's own comment calls them "component-specific, not part of
 * the canonical palette," generated inputs to the ternaryColor/axisColor
 * blend functions rather than brand colors. Flagging per apps/web/CLAUDE.md's
 * token rule, as directed: no equivalent exists in tokens.css to point at
 * instead, and reporting that is what this comment is for.
 */
import { strings } from '@/strings';
import './opinion-map.css';
import type { CartesianOpinionMap, OpinionMap, TernaryOpinionMap, BinaryOpinionMap } from './data';

const s = strings.opinionMap.maps;

// ─── Landscape palette (component-specific; see the header comment) ───────

export const POLE_COLORS: Readonly<Record<0 | 1 | 2, string>> = {
  0: '#f0a018',
  1: '#1a6ff0',
  2: '#e83516',
};

export const POLE_LABEL_COLORS: Readonly<Record<0 | 1 | 2, string>> = {
  0: '#a06320',
  1: '#1a4d9c',
  2: '#a02010',
};

export const AXIS_COLORS = { L: '#f0a018', R: '#1a6ff0', T: '#22c55e', B: '#e83516' } as const;
export const AXIS_LABEL_COLORS = { L: '#a06320', R: '#1a4d9c', T: '#1d7a3a', B: '#a02010' } as const;

// ─── Color math ─────────────────────────────────────────────────────────

function h2r(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function r2h(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function ternaryColor(a: number, b: number, c: number): string {
  const e = 2.2;
  const wa = Math.pow(Math.max(0, a), e);
  const wb = Math.pow(Math.max(0, b), e);
  const wc = Math.pow(Math.max(0, c), e);
  const s = wa + wb + wc || 0.001;
  const [ar, ag, ab] = h2r(POLE_COLORS[0]);
  const [br, bg, bb] = h2r(POLE_COLORS[1]);
  const [cr, cg, cb] = h2r(POLE_COLORS[2]);
  return r2h(ar * (wa / s) + br * (wb / s) + cr * (wc / s), ag * (wa / s) + bg * (wb / s) + cg * (wc / s), ab * (wa / s) + bb * (wb / s) + cb * (wc / s));
}

export function axisColor(x: number, y: number): string {
  const tx = x - 0.5;
  const ty = y - 0.5;
  const wL = Math.max(0, -tx);
  const wR = Math.max(0, tx);
  const wT = Math.max(0, -ty);
  const wB = Math.max(0, ty);
  const s = wL + wR + wT + wB || 0.001;
  const [lr, lg, lb] = h2r(AXIS_COLORS.L);
  const [rr, rg, rb] = h2r(AXIS_COLORS.R);
  const [tr, tg, tb] = h2r(AXIS_COLORS.T);
  const [br, bg, bb] = h2r(AXIS_COLORS.B);
  return r2h(
    lr * (wL / s) + rr * (wR / s) + tr * (wT / s) + br * (wB / s),
    lg * (wL / s) + rg * (wR / s) + tg * (wT / s) + bg * (wB / s),
    lb * (wL / s) + rb * (wR / s) + tb * (wT / s) + bb * (wB / s),
  );
}

export function binaryBlend(t: number): string {
  const tt = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = h2r(AXIS_COLORS.L);
  const [br, bg, bb] = h2r(AXIS_COLORS.R);
  return r2h(ar + (br - ar) * tt, ag + (bg - ag) * tt, ab + (bb - ab) * tt);
}

// ─── Ternary geometry ───────────────────────────────────────────────────

const TRI_PAD_RATIO = 46 / 340;

function triVertices(size: number) {
  const pad = size * TRI_PAD_RATIO;
  const triW = size - 2 * pad;
  const triH = (triW * Math.sqrt(3)) / 2;
  return {
    A: { x: size / 2, y: pad },
    B: { x: pad, y: pad + triH },
    C: { x: size - pad, y: pad + triH },
    triH,
    pad,
    height: pad + triH + 14,
  };
}

export function barycentricToXY(a: number, b: number, c: number, size = 340): { x: number; y: number } {
  const { A, B, C } = triVertices(size);
  return { x: a * A.x + b * B.x + c * C.x, y: a * A.y + b * B.y + c * C.y };
}

export function xyToBarycentric(x: number, y: number, size = 340): { a: number; b: number; c: number } {
  const { A, B, C } = triVertices(size);
  const d = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
  const a = ((B.y - C.y) * (x - C.x) + (C.x - B.x) * (y - C.y)) / d;
  const b = ((C.y - A.y) * (x - C.x) + (A.x - C.x) * (y - C.y)) / d;
  return { a, b, c: 1 - a - b };
}

export function clampBarycentric(a: number, b: number, c: number): { a: number; b: number; c: number } {
  const cl = [Math.max(0, a), Math.max(0, b), Math.max(0, c)];
  const s = cl[0]! + cl[1]! + cl[2]!;
  if (s < 0.001) return { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  return { a: cl[0]! / s, b: cl[1]! / s, c: cl[2]! / s };
}

export function inTriangle(a: number, b: number, c: number): boolean {
  return a > -0.02 && b > -0.02 && c > -0.02;
}

/** Density-aware community-marker scaling. No caller passes community data yet; kept for step 6. */
export function densityRenderScale(n: number) {
  const k = Math.max(0, Math.log10(Math.max(n, 1)));
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return {
    haloR: clamp(18 - k * 2.0, 8, 18),
    solidR: clamp(7 - k * 1.5, 1.5, 7),
    blurStdDev: clamp(4 + k * 1.6, 4, 12),
    haloOpacity: clamp(0.22 / Math.log10(n + 10), 0.04, 0.22),
    solidOpacity: clamp(0.88 - k * 0.08, 0.45, 0.88),
  };
}

function ternaryGridSegments(size: number) {
  const segs: Array<[{ x: number; y: number }, { x: number; y: number }]> = [];
  for (const t of [1 / 3, 2 / 3]) {
    segs.push([barycentricToXY(t, 1 - t, 0, size), barycentricToXY(t, 0, 1 - t, size)]);
    segs.push([barycentricToXY(1 - t, t, 0, size), barycentricToXY(0, t, 1 - t, size)]);
    segs.push([barycentricToXY(1 - t, 0, t, size), barycentricToXY(0, 1 - t, t, size)]);
  }
  return segs;
}

// ─── Shared marker ──────────────────────────────────────────────────────

/**
 * Brass-toned dot with a layered halo, the author's position on any map.
 * Distinct enough to be findable without dominating the landscape.
 */
function AuthorMarker({ x, y }: { x: number; y: number }) {
  return (
    <g aria-label="Author's position">
      <circle cx={x} cy={y} r={16} fill="var(--brass-mid)" opacity={0.1} />
      <circle cx={x} cy={y} r={11} fill="none" stroke="var(--brass-deep)" strokeWidth={1} strokeDasharray="2,2" opacity={0.85} />
      <circle cx={x} cy={y} r={7} fill="var(--brass-mid)" stroke="var(--paper-bright)" strokeWidth={2} />
      <circle cx={x} cy={y} r={2.5} fill="var(--paper-bright)" />
    </g>
  );
}

function MapTopicCaption({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <div className="om-caption">
      <div className="om-caption-kicker">{s.question}</div>
      <div className="om-caption-text">{children}</div>
    </div>
  );
}

// ─── CartesianMap ───────────────────────────────────────────────────────

export function CartesianMap({
  axes,
  authorPosition = null,
  size = 320,
}: {
  axes: CartesianOpinionMap['axes'];
  authorPosition?: CartesianOpinionMap['authorPosition'];
  size?: number;
}) {
  const [hor, ver] = axes;
  const captionTopic = [hor.topic, ver.topic].filter(Boolean).join(' × ');
  const labelLeft = hor.axisA;
  const labelRight = hor.axisB;
  const labelTop = ver.axisA;
  const labelBottom = ver.axisB;

  const LABEL_PAD = 30;
  const VB_OFFSET = -LABEL_PAD;
  const VB_SIZE = size + LABEL_PAD * 2;
  const gid = `cm-${labelLeft}-${labelRight}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);

  return (
    <div className="om-figure">
      <MapTopicCaption>{captionTopic || null}</MapTopicCaption>
      <svg
        viewBox={`${VB_OFFSET} ${VB_OFFSET} ${VB_SIZE} ${VB_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        className="om-svg"
        role="img"
        aria-label={`Opinion map: ${labelLeft} to ${labelRight} horizontally, ${labelTop} to ${labelBottom} vertically`}
      >
        <defs>
          <radialGradient id={`${gid}-l`} cx="0%" cy="50%" r="80%">
            <stop offset="0%" stopColor={AXIS_COLORS.L} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.L} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-r`} cx="100%" cy="50%" r="80%">
            <stop offset="0%" stopColor={AXIS_COLORS.R} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.R} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-t`} cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor={AXIS_COLORS.T} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.T} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-b`} cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor={AXIS_COLORS.B} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.B} stopOpacity={0} />
          </radialGradient>
        </defs>

        <rect width={size} height={size} fill="var(--paper-bright)" rx={10} />
        <rect width={size} height={size} fill={`url(#${gid}-l)`} />
        <rect width={size} height={size} fill={`url(#${gid}-r)`} />
        <rect width={size} height={size} fill={`url(#${gid}-t)`} />
        <rect width={size} height={size} fill={`url(#${gid}-b)`} />

        {[0.25, 0.75].map((t) => (
          <g key={t}>
            <line x1={size * t} y1={0} x2={size * t} y2={size} stroke="var(--wood-edge)" strokeWidth={0.75} strokeDasharray="3,5" />
            <line x1={0} y1={size * t} x2={size} y2={size * t} stroke="var(--wood-edge)" strokeWidth={0.75} strokeDasharray="3,5" />
          </g>
        ))}
        <line x1={size / 2} y1={6} x2={size / 2} y2={size - 6} stroke="var(--wood-edge)" strokeWidth={1.25} />
        <line x1={6} y1={size / 2} x2={size - 6} y2={size / 2} stroke="var(--wood-edge)" strokeWidth={1.25} />

        {!authorPosition && (
          <g opacity={0.2}>
            <circle cx={size / 2} cy={size / 2} r={7} fill="none" stroke="var(--tertiary)" strokeWidth={1} strokeDasharray="2,3" />
            <circle cx={size / 2} cy={size / 2} r={2} fill="var(--tertiary)" />
          </g>
        )}

        <circle cx={size / 2} cy={4} r={5} fill={AXIS_COLORS.T} opacity={0.85} />
        <circle cx={size / 2} cy={size - 4} r={5} fill={AXIS_COLORS.B} opacity={0.85} />
        <circle cx={4} cy={size / 2} r={5} fill={AXIS_COLORS.L} opacity={0.85} />
        <circle cx={size - 4} cy={size / 2} r={5} fill={AXIS_COLORS.R} opacity={0.85} />

        <text x={size / 2} y={-LABEL_PAD / 2 + 4} textAnchor="middle" className="om-axis-label" fill={AXIS_LABEL_COLORS.T}>
          {labelTop.toUpperCase()}
        </text>
        <text x={size / 2} y={size + LABEL_PAD / 2 + 4} textAnchor="middle" className="om-axis-label" fill={AXIS_LABEL_COLORS.B}>
          {labelBottom.toUpperCase()}
        </text>
        <text
          x={-LABEL_PAD / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          className="om-axis-label"
          fill={AXIS_LABEL_COLORS.L}
          transform={`rotate(-90,${-LABEL_PAD / 2},${size / 2})`}
        >
          {labelLeft.toUpperCase()}
        </text>
        <text
          x={size + LABEL_PAD / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          className="om-axis-label"
          fill={AXIS_LABEL_COLORS.R}
          transform={`rotate(90,${size + LABEL_PAD / 2},${size / 2})`}
        >
          {labelRight.toUpperCase()}
        </text>

        <rect x={0.75} y={0.75} width={size - 1.5} height={size - 1.5} fill="none" stroke="var(--wood-edge)" strokeWidth={1.5} rx={10} />

        {authorPosition ? <AuthorMarker x={authorPosition.x * size} y={authorPosition.y * size} /> : null}
      </svg>
    </div>
  );
}

// ─── TernaryMap ─────────────────────────────────────────────────────────

export function TernaryMap({
  poles,
  topic = null,
  authorPosition = null,
  size = 340,
}: {
  poles: TernaryOpinionMap['poles'];
  topic?: string | null;
  authorPosition?: TernaryOpinionMap['authorPosition'];
  size?: number;
}) {
  const [labelA, labelB, labelC] = poles;
  const { A, B, C, height } = triVertices(size);
  const grid = ternaryGridSegments(size);
  const LABEL_PAD = 38;
  const VB_W = size + LABEL_PAD * 2;
  const VB_H = height + LABEL_PAD * 2;
  const gid = `tm-${labelA}${labelB}${labelC}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  const triPoints = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`;

  return (
    <div className="om-figure">
      <MapTopicCaption>{topic}</MapTopicCaption>
      <svg
        viewBox={`${-LABEL_PAD} ${-LABEL_PAD} ${VB_W} ${VB_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="om-svg"
        role="img"
        aria-label={`Ternary opinion map: ${labelA}, ${labelB}, ${labelC}`}
      >
        <defs>
          <radialGradient id={`${gid}-a`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={POLE_COLORS[0]} stopOpacity={0.24} />
            <stop offset="100%" stopColor={POLE_COLORS[0]} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-b`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={POLE_COLORS[1]} stopOpacity={0.24} />
            <stop offset="100%" stopColor={POLE_COLORS[1]} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-c`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={POLE_COLORS[2]} stopOpacity={0.24} />
            <stop offset="100%" stopColor={POLE_COLORS[2]} stopOpacity={0} />
          </radialGradient>
          <clipPath id={`${gid}-clip`}>
            <polygon points={triPoints} />
          </clipPath>
        </defs>

        <polygon points={triPoints} fill="var(--paper-bright)" stroke="var(--wood-edge)" strokeWidth={1.5} />
        <ellipse cx={A.x} cy={A.y} rx={72} ry={55} fill={`url(#${gid}-a)`} clipPath={`url(#${gid}-clip)`} />
        <ellipse cx={B.x} cy={B.y} rx={72} ry={55} fill={`url(#${gid}-b)`} clipPath={`url(#${gid}-clip)`} />
        <ellipse cx={C.x} cy={C.y} rx={72} ry={55} fill={`url(#${gid}-c)`} clipPath={`url(#${gid}-clip)`} />

        {grid.map(([p1, p2], i) => (
          <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--wood-edge)" strokeWidth={0.7} strokeDasharray="3,4" />
        ))}

        {!authorPosition
          ? (() => {
              const center = barycentricToXY(1 / 3, 1 / 3, 1 / 3, size);
              return (
                <g opacity={0.2}>
                  <circle cx={center.x} cy={center.y} r={7} fill="none" stroke="var(--tertiary)" strokeWidth={1} strokeDasharray="2,3" />
                  <circle cx={center.x} cy={center.y} r={2} fill="var(--tertiary)" />
                </g>
              );
            })()
          : null}

        <circle cx={A.x} cy={A.y} r={5.5} fill={POLE_COLORS[0]} opacity={0.9} />
        <circle cx={B.x} cy={B.y} r={5.5} fill={POLE_COLORS[1]} opacity={0.9} />
        <circle cx={C.x} cy={C.y} r={5.5} fill={POLE_COLORS[2]} opacity={0.9} />

        <text x={A.x} y={A.y - LABEL_PAD / 2 - 4} textAnchor="middle" className="om-axis-label" fill={POLE_LABEL_COLORS[0]}>
          {labelA.toUpperCase()}
        </text>
        <text x={B.x - LABEL_PAD / 2} y={B.y + LABEL_PAD / 2 + 8} textAnchor="middle" className="om-axis-label" fill={POLE_LABEL_COLORS[1]}>
          {labelB.toUpperCase()}
        </text>
        <text x={C.x + LABEL_PAD / 2} y={C.y + LABEL_PAD / 2 + 8} textAnchor="middle" className="om-axis-label" fill={POLE_LABEL_COLORS[2]}>
          {labelC.toUpperCase()}
        </text>

        <polygon points={triPoints} fill="none" stroke="var(--wood-edge)" strokeWidth={1.5} />

        {authorPosition
          ? (() => {
              const ap = barycentricToXY(authorPosition.a, authorPosition.b, authorPosition.c, size);
              return <AuthorMarker x={ap.x} y={ap.y} />;
            })()
          : null}
      </svg>
    </div>
  );
}

// ─── BinaryMap ──────────────────────────────────────────────────────────
// A one-dimensional continuum between two poles, always a secondary map
// beside a ternary or cartesian primary. The track bows slightly upward so
// the middle reads as a real position, not a fence between two sides.

export function BinaryMap({
  topic = null,
  axisA,
  axisB,
  authorPosition = null,
  size = 320,
}: {
  topic?: string | null;
  axisA: string;
  axisB: string;
  authorPosition?: BinaryOpinionMap['authorPosition'];
  size?: number;
}) {
  const VIEW_HEIGHT = 64;
  const BASELINE = 44;
  const HALF_T = 14;
  const ARC_PEAK = 9;
  const curveY = (p: number) => BASELINE - ARC_PEAK * Math.sin(Math.PI * Math.max(0, Math.min(1, p)));
  const gid = `bm-${axisA}${axisB}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);

  const trackPath = [
    `M ${HALF_T} ${BASELINE + HALF_T}`,
    `A ${HALF_T} ${HALF_T} 0 0 1 ${HALF_T} ${BASELINE - HALF_T}`,
    `Q ${size / 2} ${BASELINE - HALF_T - ARC_PEAK * 2} ${size - HALF_T} ${BASELINE - HALF_T}`,
    `A ${HALF_T} ${HALF_T} 0 0 1 ${size - HALF_T} ${BASELINE + HALF_T}`,
    `Q ${size / 2} ${BASELINE + HALF_T - ARC_PEAK * 2} ${HALF_T} ${BASELINE + HALF_T}`,
    'Z',
  ].join(' ');

  return (
    <div className="om-figure om-figure--binary">
      <MapTopicCaption>{topic}</MapTopicCaption>

      <div className="om-binary-labels">
        <div className="om-binary-label om-binary-label--left" style={{ color: AXIS_LABEL_COLORS.L }}>
          {axisA}
        </div>
        <div className="om-binary-label om-binary-label--right" style={{ color: AXIS_LABEL_COLORS.R }}>
          {axisB}
        </div>
      </div>

      <svg viewBox={`-4 0 ${size + 8} ${VIEW_HEIGHT}`} xmlns="http://www.w3.org/2000/svg" className="om-svg" role="img" aria-label={`Opinion continuum: ${axisA} on the left to ${axisB} on the right`}>
        <defs>
          <linearGradient id={`${gid}-wash`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--brass-pale)" stopOpacity={0.55} />
            <stop offset="50%" stopColor="var(--brass-warm)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--brass-pale)" stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id={`${gid}-sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
            <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="100%" stopColor="var(--brass-deep)" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <path d={trackPath} fill="var(--paper-bright)" />
        <path d={trackPath} fill={`url(#${gid}-wash)`} />
        <path d={trackPath} fill={`url(#${gid}-sheen)`} />
        <path d={trackPath} fill="none" stroke="var(--brass-mid)" strokeOpacity={0.42} strokeWidth={1.25} />

        {[0.25, 0.5, 0.75].map((t) => {
          const cx = size * t;
          const cy = curveY(t);
          const halfHeight = HALF_T + 4;
          return (
            <line
              key={t}
              x1={cx}
              y1={cy - halfHeight}
              x2={cx}
              y2={cy + halfHeight}
              stroke="var(--wood-edge)"
              strokeWidth={t === 0.5 ? 1.4 : 0.8}
              strokeDasharray={t === 0.5 ? '5,3' : '2,3'}
            />
          );
        })}

        <circle cx={HALF_T - 4} cy={BASELINE} r={4.5} fill={AXIS_COLORS.L} opacity={0.95} />
        <circle cx={size - HALF_T + 4} cy={BASELINE} r={4.5} fill={AXIS_COLORS.R} opacity={0.95} />

        {!authorPosition && (
          <g opacity={0.42}>
            <circle cx={size / 2} cy={curveY(0.5)} r={11} fill="none" stroke="var(--brass-mid)" strokeWidth={1} strokeDasharray="2,3" />
            <circle cx={size / 2} cy={curveY(0.5)} r={3.5} fill="var(--brass-mid)" opacity={0.5} />
          </g>
        )}

        {authorPosition ? <AuthorMarker x={authorPosition.x * size} y={curveY(authorPosition.x)} /> : null}
      </svg>
    </div>
  );
}

// ─── Dispatch ───────────────────────────────────────────────────────────

/** Renders whichever of the three figures `map.type` names, read-only. */
export function OpinionMapFigure({ map }: { map: OpinionMap }) {
  if (map.type === 'cartesian') return <CartesianMap axes={map.axes} authorPosition={map.authorPosition} />;
  if (map.type === 'ternary') return <TernaryMap poles={map.poles} topic={map.topic} authorPosition={map.authorPosition} />;
  return <BinaryMap topic={map.topic} axisA={map.axisA} axisB={map.axisB} authorPosition={map.authorPosition} />;
}
