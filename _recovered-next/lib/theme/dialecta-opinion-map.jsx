/**
 * dialecta-opinion-map.jsx
 *
 * Standalone, side-effect-free React engines for Dialecta's opinion map
 * visualizations. Lifted from the OneDrive prototype `dialecta-opinion-maps.jsx`
 * and pared down to canonical, read-only-capable components.
 *
 * ── Components ───────────────────────────────────────────────────────────────
 *
 *   <CartesianMap
 *     axes={[                                    // REQUIRED, length 2
 *       { axis_a, axis_b, topic? },              // [0] = horizontal (left → right)
 *       { axis_a, axis_b, topic? },              // [1] = vertical   (top  → bottom)
 *     ]}
 *     placement={null | { x: 0..1, y: 0..1 }}    // optional user marker
 *     community={null | [{ x, y }, ...]}         // optional community markers
 *     size={320}                                 // viewBox dimension
 *   />
 *
 *   <TernaryMap
 *     poles={[                                   // REQUIRED, length 3
 *       { label: string, topic? },               // [0] top vertex
 *       { label: string, topic? },               // [1] bottom-left vertex
 *       { label: string, topic? },               // [2] bottom-right vertex
 *     ]}
 *     placement={null | { a, b, c }}             // optional, must satisfy a+b+c≈1
 *     community={null | [{ a, b, c }, ...]}      // optional
 *     size={340}                                 // viewBox width
 *   />
 *
 * Both components return `null` if their required inputs are malformed,
 * so a parent can `<CartesianMap axes={...} />` and trust it to no-op when
 * an article hasn't declared a usable axis pair.
 *
 * ── Pure helpers (also exported for future placement / heatmap engines) ──────
 *
 *   axisColor(x, y)           → hex string. x, y in [0, 1]; quadrant blend.
 *   ternaryColor(a, b, c)     → hex string. Power-2.2 weighted blend.
 *   barycentricToXY(a, b, c, size?) → { x, y } in viewBox coords.
 *   xyToBarycentric(x, y, size?)    → { a, b, c }, may be outside triangle.
 *   clampBarycentric(a, b, c)       → { a, b, c } projected back into triangle.
 *   inTriangle(a, b, c)             → boolean.
 */

import { useState } from 'react';

// ─── Local design tokens ────────────────────────────────────────────────────
// Map-chrome tokens (canonical brass/wood/paper, defined in style.css :root).
// Per-pole colors are component-specific, not part of the canonical palette.

const T = {
  fontMono:    "var(--font-mono, 'DM Mono', monospace)",
  fontDisplay: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
  fontReading: "var(--font-reading, 'Source Serif 4', Georgia, serif)",
  ink:         'var(--ink, #1c1814)',
  paperBright: 'var(--paper-bright, #fefaea)',
  brassMid:    'var(--brass-mid, #b8862e)',
  brassPale:   'var(--brass-pale, #f5dfa0)',
  woodEdge:    'var(--wood-edge, rgba(154, 92, 40, 0.22))',
  textMuted:   'var(--tertiary, #8c8780)',
};

// Bright-saturation palette used for SVG gradients and pole vertex dots.
// These are the LANDSCAPE colors; they read at low opacity (0.24-0.38)
// inside the rect/triangle, so vibrancy here is fine.
const POLE_COLORS = {
  0: '#f0a018', // top vertex / horizontal-left
  1: '#1a6ff0', // bottom-left / horizontal-right
  2: '#e83516', // bottom-right / cartesian-bottom
};

const AXIS_COLORS = {
  L: '#f0a018', // horizontal left
  R: '#1a6ff0', // horizontal right
  T: '#22c55e', // vertical top
  B: '#e83516', // vertical bottom
};

// Darker variants used for LABEL TEXT. Pure RGB at full saturation reads
// too thin against the cream paper background; these are wood/brass-grade
// shifts that keep the per-pole color identity while gaining contrast.
const POLE_LABEL_COLORS = {
  0: '#a06320', // amber-deep (orange family)
  1: '#1a4d9c', // royal-deep (blue family)
  2: '#a02010', // terra-deep (red family)
};

const AXIS_LABEL_COLORS = {
  L: '#a06320', // amber-deep
  R: '#1a4d9c', // royal-deep
  T: '#1d7a3a', // forest-deep (green)
  B: '#a02010', // terra-deep
};

// ─── Color helpers ──────────────────────────────────────────────────────────

const h2r = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const r2h = (r, g, b) =>
  '#' + [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
    .join('');

export function ternaryColor(a, b, c) {
  const e = 2.2;
  const wa = Math.pow(Math.max(0, a), e);
  const wb = Math.pow(Math.max(0, b), e);
  const wc = Math.pow(Math.max(0, c), e);
  const s = wa + wb + wc || 0.001;
  const [ar, ag, ab] = h2r(POLE_COLORS[0]);
  const [br, bg, bb] = h2r(POLE_COLORS[1]);
  const [cr, cg, cb] = h2r(POLE_COLORS[2]);
  return r2h(
    ar * (wa / s) + br * (wb / s) + cr * (wc / s),
    ag * (wa / s) + bg * (wb / s) + cg * (wc / s),
    ab * (wa / s) + bb * (wb / s) + cb * (wc / s),
  );
}

export function axisColor(x, y) {
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

// ─── Ternary geometry ───────────────────────────────────────────────────────

const TRI_PAD_RATIO = 46 / 340;

function triVertices(size) {
  const pad  = size * TRI_PAD_RATIO;
  const triW = size - 2 * pad;
  const triH = triW * Math.sqrt(3) / 2;
  return {
    A: { x: size / 2, y: pad },
    B: { x: pad,      y: pad + triH },
    C: { x: size - pad, y: pad + triH },
    triH,
    pad,
    height: pad + triH + 14,
  };
}

export function barycentricToXY(a, b, c, size = 340) {
  const { A, B, C } = triVertices(size);
  return {
    x: a * A.x + b * B.x + c * C.x,
    y: a * A.y + b * B.y + c * C.y,
  };
}

export function xyToBarycentric(x, y, size = 340) {
  const { A, B, C } = triVertices(size);
  const d = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
  const a = ((B.y - C.y) * (x - C.x) + (C.x - B.x) * (y - C.y)) / d;
  const b = ((C.y - A.y) * (x - C.x) + (A.x - C.x) * (y - C.y)) / d;
  return { a, b, c: 1 - a - b };
}

export function clampBarycentric(a, b, c) {
  const cl = [Math.max(0, a), Math.max(0, b), Math.max(0, c)];
  const s  = cl[0] + cl[1] + cl[2];
  if (s < 0.001) return { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  return { a: cl[0] / s, b: cl[1] / s, c: cl[2] / s };
}

export function inTriangle(a, b, c) {
  return a > -0.02 && b > -0.02 && c > -0.02;
}

// Linear blend between the two cartesian-axis poles. Used by BinaryMap to
// color the gradient track and the markers along it. t in [0, 1].
export function binaryBlend(t) {
  const tt = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = h2r(AXIS_COLORS.L);
  const [br, bg, bb] = h2r(AXIS_COLORS.R);
  return r2h(
    ar + (br - ar) * tt,
    ag + (bg - ag) * tt,
    ab + (bb - ab) * tt,
  );
}

// ─── Density-aware community dot scaling ────────────────────────────────────
// Returns the SVG render parameters for community markers given how many
// placements there are. Individual dots shrink and halos go more diffuse as N
// grows, so the heatmap reads as a density landscape rather than a vote count.
// Halo opacity scales as 1 / log10(N + 10) so cumulative ink stays roughly
// constant: at low N each placement is a visible dot, at high N halos overlap
// into a gradient with the solid centers becoming texture.

export function densityRenderScale(n) {
  const k = Math.max(0, Math.log10(Math.max(n, 1)));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  return {
    haloR:        clamp(18 - k * 2.0, 8, 18),
    solidR:       clamp(7  - k * 1.5, 1.5, 7),
    blurStdDev:   clamp(4  + k * 1.6, 4, 12),
    haloOpacity:  clamp(0.22 / Math.log10(n + 10), 0.04, 0.22),
    solidOpacity: clamp(0.88 - k * 0.08, 0.45, 0.88),
  };
}

function ternaryGridSegments(size) {
  const segs = [];
  for (const t of [1 / 3, 2 / 3]) {
    segs.push([barycentricToXY(t, 1 - t, 0, size), barycentricToXY(t, 0, 1 - t, size)]);
    segs.push([barycentricToXY(1 - t, t, 0, size), barycentricToXY(0, t, 1 - t, size)]);
    segs.push([barycentricToXY(1 - t, 0, t, size), barycentricToXY(0, 1 - t, t, size)]);
  }
  return segs;
}

// ─── Validation ─────────────────────────────────────────────────────────────

function isValidAxis(a) {
  return a
    && typeof a.axis_a === 'string' && a.axis_a.trim()
    && typeof a.axis_b === 'string' && a.axis_b.trim();
}

function isValidPole(p) {
  if (typeof p === 'string') return p.trim().length > 0;
  return p && typeof p.label === 'string' && p.label.trim().length > 0;
}

function poleLabel(p) {
  return typeof p === 'string' ? p : (p?.label || '');
}

function isValidString(s) {
  return typeof s === 'string' && s.trim().length > 0;
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function UserMarker({ x, y, color, size = 18 }) {
  const off = size / 2;
  return (
    <g>
      <circle cx={x} cy={y} r={29} fill={color} opacity={0.22} />
      <circle cx={x} cy={y} r={15} fill={T.paperBright} stroke={color} strokeWidth={2.5} />
      <circle cx={x} cy={y} r={3.5} fill={color} />
    </g>
  );
}

// Author marker: brass-toned dot with a layered halo. Distinct enough to
// be findable without dominating the landscape. Two halo rings give it
// visual weight on the gradient backgrounds without needing a fill.
// Parent decides when to show it (hidden before reader placement to avoid
// biasing pre-read; revealed by hover or click after).
function AuthorMarker({ x, y }) {
  return (
    <g aria-label="Author's position">
      <circle cx={x} cy={y} r={16} fill="var(--brass-mid, #b8862e)"
              opacity={0.10} />
      <circle cx={x} cy={y} r={11} fill="none"
              stroke="var(--brass-deep, #6a4a18)" strokeWidth={1}
              strokeDasharray="2,2" opacity={0.85} />
      <circle cx={x} cy={y} r={7} fill="var(--brass-mid, #b8862e)"
              stroke={T.paperBright} strokeWidth={2} opacity={1} />
      <circle cx={x} cy={y} r={2.5} fill={T.paperBright} />
    </g>
  );
}

function MapTopicCaption({ children }) {
  if (!children) return null;
  return (
    <div style={{ marginBottom: 18, textAlign: 'center' }}>
      <div style={{
        fontFamily: T.fontMono,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--brass-mid, #b8862e)',
        marginBottom: 4,
      }}>
        The question
      </div>
      <div style={{
        fontFamily: T.fontDisplay,
        fontStyle: 'italic',
        fontSize: 'clamp(1.25rem, 2.4vw + 0.2rem, 1.65rem)',
        fontWeight: 500,
        color: 'var(--ink, #1c1814)',
        lineHeight: 1.2,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── CartesianMap ───────────────────────────────────────────────────────────

export function CartesianMap({
  axes,
  placement = null,
  community = null,
  authorPosition = null,
  onPlace = null,
  size = 320,
}) {
  if (!Array.isArray(axes) || axes.length !== 2) return null;
  if (!isValidAxis(axes[0]) || !isValidAxis(axes[1])) return null;

  const [hor, ver] = axes;
  const captionTopic = [hor.topic, ver.topic].filter(Boolean).join(' × ');

  const labelLeft   = hor.axis_a;
  const labelRight  = hor.axis_b;
  const labelTop    = ver.axis_a;
  const labelBottom = ver.axis_b;

  const userColor = placement ? axisColor(placement.x, placement.y) : null;
  const userX     = placement ? placement.x * size : null;
  const userY     = placement ? placement.y * size : null;

  const density = Array.isArray(community)
    ? densityRenderScale(community.length)
    : null;

  // Labels live in a padding zone OUTSIDE the rect so they don't overlap
  // the colored landscape. The viewBox extends by LABEL_PAD on each side;
  // the inner map rect is still 0,0 to size,size.
  const LABEL_PAD = 30;
  const VB_OFFSET = -LABEL_PAD;
  const VB_SIZE   = size + LABEL_PAD * 2;

  // Interactive placement: enabled whenever an onPlace callback is
  // provided. Each tap calls onPlace with new coordinates so the reader
  // can move the marker freely until they explicitly commit. The hook
  // upstream gates which taps stage vs. persist; the map itself stays
  // tap-receptive throughout.
  const interactive = typeof onPlace === 'function';

  const handleTap = (clientX, clientY, target) => {
    if (!interactive) return;
    const rect = target.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    // Convert screen pixel to viewBox coord, then to placement [0, 1]
    const vbx = VB_OFFSET + (screenX / rect.width)  * VB_SIZE;
    const vby = VB_OFFSET + (screenY / rect.height) * VB_SIZE;
    const x = Math.max(0, Math.min(1, vbx / size));
    const y = Math.max(0, Math.min(1, vby / size));
    onPlace({ x, y });
  };

  const gid = `cm-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {captionTopic && <MapTopicCaption>{captionTopic}</MapTopicCaption>}
      <svg
        viewBox={`${VB_OFFSET} ${VB_OFFSET} ${VB_SIZE} ${VB_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        onClick={interactive ? (e) => handleTap(e.clientX, e.clientY, e.currentTarget) : undefined}
        onTouchEnd={interactive ? (e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          handleTap(t.clientX, t.clientY, e.currentTarget);
        } : undefined}
        style={{
          display: 'block', width: '100%', height: 'auto', overflow: 'visible',
          cursor: interactive ? 'crosshair' : 'default',
          touchAction: interactive ? 'none' : 'auto',
        }}
        role="img"
        aria-label={`Opinion map: ${labelLeft} to ${labelRight} horizontally, ${labelTop} to ${labelBottom} vertically`}
      >
        <defs>
          <radialGradient id={`${gid}-l`} cx="0%" cy="50%" r="80%">
            <stop offset="0%"   stopColor={AXIS_COLORS.L} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.L} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-r`} cx="100%" cy="50%" r="80%">
            <stop offset="0%"   stopColor={AXIS_COLORS.R} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.R} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-t`} cx="50%" cy="0%" r="80%">
            <stop offset="0%"   stopColor={AXIS_COLORS.T} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.T} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-b`} cx="50%" cy="100%" r="80%">
            <stop offset="0%"   stopColor={AXIS_COLORS.B} stopOpacity={0.38} />
            <stop offset="100%" stopColor={AXIS_COLORS.B} stopOpacity={0} />
          </radialGradient>
          <filter id={`${gid}-blur`}>
            <feGaussianBlur stdDeviation={density ? density.blurStdDev : 7} />
          </filter>
        </defs>

        <rect width={size} height={size} fill={T.paperBright} rx={10} />
        <rect width={size} height={size} fill={`url(#${gid}-l)`} />
        <rect width={size} height={size} fill={`url(#${gid}-r)`} />
        <rect width={size} height={size} fill={`url(#${gid}-t)`} />
        <rect width={size} height={size} fill={`url(#${gid}-b)`} />

        {[0.25, 0.75].map((t) => (
          <g key={t}>
            <line x1={size * t} y1={0} x2={size * t} y2={size}
                  stroke={T.woodEdge} strokeWidth={0.75} strokeDasharray="3,5" />
            <line x1={0} y1={size * t} x2={size} y2={size * t}
                  stroke={T.woodEdge} strokeWidth={0.75} strokeDasharray="3,5" />
          </g>
        ))}
        <line x1={size / 2} y1={6} x2={size / 2} y2={size - 6}
              stroke={T.woodEdge} strokeWidth={1.25} />
        <line x1={6} y1={size / 2} x2={size - 6} y2={size / 2}
              stroke={T.woodEdge} strokeWidth={1.25} />

        {density && community.map((d, i) => {
          if (typeof d?.x !== 'number' || typeof d?.y !== 'number') return null;
          const cx  = d.x * size;
          const cy  = d.y * size;
          const col = axisColor(d.x, d.y);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={density.haloR}  fill={col}
                      opacity={density.haloOpacity}  filter={`url(#${gid}-blur)`} />
              <circle cx={cx} cy={cy} r={density.solidR} fill={col}
                      opacity={density.solidOpacity} />
            </g>
          );
        })}

        {!placement && !authorPosition && (
          <g opacity={0.2}>
            <circle cx={size / 2} cy={size / 2} r={7} fill="none"
                    stroke={T.textMuted} strokeWidth={1} strokeDasharray="2,3" />
            <circle cx={size / 2} cy={size / 2} r={2} fill={T.textMuted} />
          </g>
        )}

        <circle cx={size / 2} cy={4} r={5} fill={AXIS_COLORS.T} opacity={0.85} />
        <circle cx={size / 2} cy={size - 4} r={5} fill={AXIS_COLORS.B} opacity={0.85} />
        <circle cx={4} cy={size / 2} r={5} fill={AXIS_COLORS.L} opacity={0.85} />
        <circle cx={size - 4} cy={size / 2} r={5} fill={AXIS_COLORS.R} opacity={0.85} />

        {/* Labels rendered in the padding zone outside the rect. */}
        <text x={size / 2} y={-LABEL_PAD / 2 + 4} textAnchor="middle"
              fontFamily={T.fontMono} fontSize={13} fontWeight={500}
              fill={AXIS_LABEL_COLORS.T} letterSpacing="0.10em">
          {labelTop.toUpperCase()}
        </text>
        <text x={size / 2} y={size + LABEL_PAD / 2 + 4} textAnchor="middle"
              fontFamily={T.fontMono} fontSize={13} fontWeight={500}
              fill={AXIS_LABEL_COLORS.B} letterSpacing="0.10em">
          {labelBottom.toUpperCase()}
        </text>
        <text x={-LABEL_PAD / 2} y={size / 2 + 4} textAnchor="middle"
              fontFamily={T.fontMono} fontSize={13} fontWeight={500}
              fill={AXIS_LABEL_COLORS.L} letterSpacing="0.10em"
              transform={`rotate(-90,${-LABEL_PAD / 2},${size / 2})`}>
          {labelLeft.toUpperCase()}
        </text>
        <text x={size + LABEL_PAD / 2} y={size / 2 + 4} textAnchor="middle"
              fontFamily={T.fontMono} fontSize={13} fontWeight={500}
              fill={AXIS_LABEL_COLORS.R} letterSpacing="0.10em"
              transform={`rotate(90,${size + LABEL_PAD / 2},${size / 2})`}>
          {labelRight.toUpperCase()}
        </text>

        <rect x={0.75} y={0.75} width={size - 1.5} height={size - 1.5}
              fill="none" stroke={T.woodEdge} strokeWidth={1.5} rx={10} />

        {authorPosition
          && typeof authorPosition.x === 'number'
          && typeof authorPosition.y === 'number' && (
          <AuthorMarker
            x={authorPosition.x * size}
            y={authorPosition.y * size}
          />
        )}

        {placement && (
          <UserMarker x={userX} y={userY} color={userColor} />
        )}
      </svg>
    </div>
  );
}

// ─── TernaryMap ─────────────────────────────────────────────────────────────

export function TernaryMap({
  poles,
  topic = null,
  placement = null,
  community = null,
  authorPosition = null,
  onPlace = null,
  size = 340,
}) {
  if (!Array.isArray(poles) || poles.length !== 3) return null;
  if (!poles.every(isValidPole)) return null;

  const labelA = poleLabel(poles[0]);
  const labelB = poleLabel(poles[1]);
  const labelC = poleLabel(poles[2]);

  const { A, B, C, height } = triVertices(size);
  const grid = ternaryGridSegments(size);
  const captionTopic = topic
    || poles.map((p) => (typeof p === 'object' ? p.topic : null)).filter(Boolean).join(' · ');

  const userXY = placement
    ? barycentricToXY(placement.a, placement.b, placement.c, size)
    : null;
  const userColor = placement
    ? ternaryColor(placement.a, placement.b, placement.c)
    : null;

  const density = Array.isArray(community)
    ? densityRenderScale(community.length)
    : null;

  // Padding zone OUTSIDE the triangle for labels. Matches CartesianMap's
  // labels-outside treatment so the two engines feel like siblings.
  const LABEL_PAD = 38;
  const VB_W = size   + LABEL_PAD * 2;
  const VB_H = height + LABEL_PAD * 2;

  // Always interactive when an onPlace handler is wired. Each tap moves
  // the marker; the upstream hook stages the placement locally and only
  // commits via an explicit action.
  const interactive = typeof onPlace === 'function';

  const handleTap = (clientX, clientY, target) => {
    if (!interactive) return;
    const rect = target.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    // Convert screen pixel to viewBox coord
    const vbx = -LABEL_PAD + (screenX / rect.width)  * VB_W;
    const vby = -LABEL_PAD + (screenY / rect.height) * VB_H;
    // Convert viewBox coord to barycentric, clamp to triangle
    const bary = xyToBarycentric(vbx, vby, size);
    if (!inTriangle(bary.a, bary.b, bary.c)) return;
    const clamped = clampBarycentric(bary.a, bary.b, bary.c);
    onPlace(clamped);
  };

  const gid = `tm-${Math.random().toString(36).slice(2, 9)}`;
  const triPoints = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {captionTopic && <MapTopicCaption>{captionTopic}</MapTopicCaption>}
      <svg
        viewBox={`${-LABEL_PAD} ${-LABEL_PAD} ${VB_W} ${VB_H}`}
        xmlns="http://www.w3.org/2000/svg"
        onClick={interactive ? (e) => handleTap(e.clientX, e.clientY, e.currentTarget) : undefined}
        onTouchEnd={interactive ? (e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          handleTap(t.clientX, t.clientY, e.currentTarget);
        } : undefined}
        style={{
          display: 'block', width: '100%', height: 'auto', overflow: 'visible',
          cursor: interactive ? 'crosshair' : 'default',
          touchAction: interactive ? 'none' : 'auto',
        }}
        role="img"
        aria-label={`Ternary opinion map: ${labelA}, ${labelB}, ${labelC}`}
      >
        <defs>
          <radialGradient id={`${gid}-a`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={POLE_COLORS[0]} stopOpacity={0.24} />
            <stop offset="100%" stopColor={POLE_COLORS[0]} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-b`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={POLE_COLORS[1]} stopOpacity={0.24} />
            <stop offset="100%" stopColor={POLE_COLORS[1]} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${gid}-c`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={POLE_COLORS[2]} stopOpacity={0.24} />
            <stop offset="100%" stopColor={POLE_COLORS[2]} stopOpacity={0} />
          </radialGradient>
          <clipPath id={`${gid}-clip`}>
            <polygon points={triPoints} />
          </clipPath>
          <filter id={`${gid}-blur`}>
            <feGaussianBlur stdDeviation={density ? density.blurStdDev : 5} />
          </filter>
        </defs>

        <polygon points={triPoints} fill={T.paperBright}
                 stroke={T.woodEdge} strokeWidth={1.5} />
        <ellipse cx={A.x} cy={A.y} rx={72} ry={55}
                 fill={`url(#${gid}-a)`} clipPath={`url(#${gid}-clip)`} />
        <ellipse cx={B.x} cy={B.y} rx={72} ry={55}
                 fill={`url(#${gid}-b)`} clipPath={`url(#${gid}-clip)`} />
        <ellipse cx={C.x} cy={C.y} rx={72} ry={55}
                 fill={`url(#${gid}-c)`} clipPath={`url(#${gid}-clip)`} />

        {grid.map(([p1, p2], i) => (
          <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={T.woodEdge} strokeWidth={0.7} strokeDasharray="3,4" />
        ))}

        {density && community.map((d, i) => {
          if (typeof d?.a !== 'number' || typeof d?.b !== 'number' || typeof d?.c !== 'number') return null;
          const p   = barycentricToXY(d.a, d.b, d.c, size);
          const col = ternaryColor(d.a, d.b, d.c);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={density.haloR}  fill={col}
                      opacity={density.haloOpacity}  filter={`url(#${gid}-blur)`} />
              <circle cx={p.x} cy={p.y} r={density.solidR} fill={col}
                      opacity={density.solidOpacity} />
            </g>
          );
        })}

        {!placement && !authorPosition && (() => {
          const center = barycentricToXY(1 / 3, 1 / 3, 1 / 3, size);
          return (
            <g opacity={0.2}>
              <circle cx={center.x} cy={center.y} r={7} fill="none"
                      stroke={T.textMuted} strokeWidth={1} strokeDasharray="2,3" />
              <circle cx={center.x} cy={center.y} r={2} fill={T.textMuted} />
            </g>
          );
        })()}

        <circle cx={A.x} cy={A.y} r={5.5} fill={POLE_COLORS[0]} opacity={0.9} />
        <circle cx={B.x} cy={B.y} r={5.5} fill={POLE_COLORS[1]} opacity={0.9} />
        <circle cx={C.x} cy={C.y} r={5.5} fill={POLE_COLORS[2]} opacity={0.9} />

        {/* Labels rendered in the padding zone OUTSIDE the triangle. */}
        <text x={A.x} y={A.y - LABEL_PAD / 2 - 4} textAnchor="middle"
              fontFamily={T.fontMono} fontSize={13} fontWeight={500}
              fill={POLE_LABEL_COLORS[0]} letterSpacing="0.10em">
          {labelA.toUpperCase()}
        </text>
        <text x={B.x - LABEL_PAD / 2} y={B.y + LABEL_PAD / 2 + 8} textAnchor="middle"
              fontFamily={T.fontMono} fontSize={13} fontWeight={500}
              fill={POLE_LABEL_COLORS[1]} letterSpacing="0.10em">
          {labelB.toUpperCase()}
        </text>
        <text x={C.x + LABEL_PAD / 2} y={C.y + LABEL_PAD / 2 + 8} textAnchor="middle"
              fontFamily={T.fontMono} fontSize={13} fontWeight={500}
              fill={POLE_LABEL_COLORS[2]} letterSpacing="0.10em">
          {labelC.toUpperCase()}
        </text>

        <polygon points={triPoints} fill="none"
                 stroke={T.woodEdge} strokeWidth={1.5} />

        {authorPosition
          && typeof authorPosition.a === 'number'
          && typeof authorPosition.b === 'number'
          && typeof authorPosition.c === 'number' && (() => {
            const ap = barycentricToXY(authorPosition.a, authorPosition.b, authorPosition.c, size);
            return <AuthorMarker x={ap.x} y={ap.y} />;
          })()}

        {placement && userXY && (
          <UserMarker x={userXY.x} y={userXY.y} color={userColor} />
        )}
      </svg>
    </div>
  );
}

// ─── BinaryMap ──────────────────────────────────────────────────────────────
// One-dimensional continuum between two poles. By design constraint, this
// type is only valid as a SECONDARY map paired with a richer ternary or
// cartesian primary.
//
// Visual treatment is deliberately anti-tribal:
//   - Labels sit ABOVE the track (not at the sides), so long pole names
//     have room to wrap and the visual center of gravity is on the
//     continuum itself.
//   - The track is a slightly upward-bowed stadium ("ellipsis arc"), not a
//     straight horizontal line. The middle is geometrically elevated,
//     which says "moderate is a real position, not a fence between two
//     sides."
//   - The track fill is paper-bright with a brass-pale stroke. No
//     warm-vs-cool gradient. Pole-color identity is preserved only as
//     small colored caps at the very ends, so the LANDSCAPE is neutral
//     while the POLES still carry their per-pole hue.
//   - Tick marks at quarter points; middle tick slightly more pronounced
//     to reinforce the middle-as-position reading.
//
// Markers (author, reader) ride the curve at their x position; their y is
// computed via the arc function so they sit ON the track, not above it.

export function BinaryMap({
  topic = null,
  axis_a,
  axis_b,
  placement = null,
  community = null,
  authorPosition = null,
  onPlace = null,
  size = 320,
}) {
  if (!isValidString(axis_a) || !isValidString(axis_b)) return null;

  // Geometry
  const VIEW_HEIGHT  = 64;
  const BASELINE     = 44;          // y at the endpoints (cap centers)
  const HALF_T       = 14;          // half the track thickness
  const ARC_PEAK     = 9;           // how high the middle rises above baseline

  // Curve-y given a fractional position p in [0, 1].
  const curveY = (p) => BASELINE - ARC_PEAK * Math.sin(Math.PI * Math.max(0, Math.min(1, p)));

  const density = Array.isArray(community)
    ? densityRenderScale(community.length)
    : null;

  // Drag-to-place state. The reader can click-and-drag a marker along the
  // track and release to commit. A simple tap (down + up without movement)
  // also commits, since the same path runs through pointerup.
  const [draft, setDraft]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const interactive = typeof onPlace === 'function';

  // Convert pointer x to a placement x in [0, 1].
  const computeX = (clientX, target) => {
    const rect = target.getBoundingClientRect();
    const sx = clientX - rect.left;
    return Math.max(0, Math.min(1, sx / rect.width));
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    if (e.target.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    }
    setDragging(true);
    setDraft({ x: computeX(e.clientX, e.currentTarget) });
  };

  const handlePointerMove = (e) => {
    if (!dragging || !interactive) return;
    setDraft({ x: computeX(e.clientX, e.currentTarget) });
  };

  const handlePointerUp = (e) => {
    if (!dragging || !interactive) return;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }
    const final = { x: computeX(e.clientX, e.currentTarget) };
    setDraft(null);
    onPlace(final);
  };

  // What the user sees as "their" marker right now: the live drag draft
  // takes priority while dragging; otherwise the committed placement.
  const visibleMarker = dragging && draft ? draft : placement;

  const gid = `bm-${Math.random().toString(36).slice(2, 9)}`;

  // Stadium path with slight upward bow on both edges, keeping a constant
  // thickness. Going clockwise:
  //   - left semicircle cap (bottom-left → top-left)
  //   - top edge with quadratic bow upward
  //   - right semicircle cap (top-right → bottom-right)
  //   - bottom edge with quadratic bow upward, parallel to top
  const trackPath = [
    `M ${HALF_T} ${BASELINE + HALF_T}`,
    `A ${HALF_T} ${HALF_T} 0 0 1 ${HALF_T} ${BASELINE - HALF_T}`,
    `Q ${size / 2} ${BASELINE - HALF_T - ARC_PEAK * 2} ${size - HALF_T} ${BASELINE - HALF_T}`,
    `A ${HALF_T} ${HALF_T} 0 0 1 ${size - HALF_T} ${BASELINE + HALF_T}`,
    `Q ${size / 2} ${BASELINE + HALF_T - ARC_PEAK * 2} ${HALF_T} ${BASELINE + HALF_T}`,
    'Z',
  ].join(' ');

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {topic && <MapTopicCaption>{topic}</MapTopicCaption>}

      {/* Pole labels above the track. HTML, not SVG, so long labels can
          wrap to two lines naturally. Each label is half-width, aligned
          to its end. */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
        marginBottom: 10,
      }}>
        <div style={{
          flex: '0 1 45%',
          textAlign: 'left',
          fontFamily: T.fontMono,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: AXIS_LABEL_COLORS.L,
          lineHeight: 1.35,
        }}>
          {axis_a}
        </div>
        <div style={{
          flex: '0 1 45%',
          textAlign: 'right',
          fontFamily: T.fontMono,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: AXIS_LABEL_COLORS.R,
          lineHeight: 1.35,
        }}>
          {axis_b}
        </div>
      </div>

      <svg
        viewBox={`-4 0 ${size + 8} ${VIEW_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        onPointerDown={interactive ? handlePointerDown : undefined}
        onPointerMove={interactive ? handlePointerMove : undefined}
        onPointerUp={interactive ? handlePointerUp : undefined}
        onPointerCancel={interactive ? handlePointerUp : undefined}
        style={{
          display: 'block', width: '100%', height: 'auto', overflow: 'visible',
          cursor: interactive ? (dragging ? 'grabbing' : 'grab') : 'default',
          touchAction: interactive ? 'none' : 'auto',
          userSelect: 'none',
        }}
        role="img"
        aria-label={`Opinion continuum: ${axis_a} on the left to ${axis_b} on the right`}
      >
        <defs>
          {/* Subtle brass wash. Symmetric horizontal gradient: brass-pale
              at the ends, slightly warmer brass at the apex. Combines with
              the upward arc to give the middle a "highest, warmest" feel
              without becoming a left-vs-right heat map. */}
          <linearGradient id={`${gid}-wash`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--brass-pale, #f5dfa0)" stopOpacity={0.55} />
            <stop offset="50%"  stopColor="var(--brass-warm, #d4a84a)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--brass-pale, #f5dfa0)" stopOpacity={0.55} />
          </linearGradient>
          {/* Vertical sheen: a faint top-light to bottom-shadow gradient
              gives the track a sense of polished metal surface. */}
          <linearGradient id={`${gid}-sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.35} />
            <stop offset="55%"  stopColor="#ffffff" stopOpacity={0} />
            <stop offset="100%" stopColor="var(--brass-deep, #6a4a18)" stopOpacity={0.10} />
          </linearGradient>
          <filter id={`${gid}-blur`}>
            <feGaussianBlur stdDeviation={density ? density.blurStdDev : 5} />
          </filter>
        </defs>

        {/* Track: paper base, brass wash, brass sheen, brass-mid stroke. */}
        <path d={trackPath} fill={T.paperBright} />
        <path d={trackPath} fill={`url(#${gid}-wash)`} />
        <path d={trackPath} fill={`url(#${gid}-sheen)`} />
        <path d={trackPath} fill="none"
              stroke="var(--brass-mid, #b8862e)"
              strokeOpacity={0.42}
              strokeWidth={1.25} />

        {/* Quarter tick marks following the arc. Middle tick is more
            pronounced so the center reads as a legitimate position. */}
        {[0.25, 0.5, 0.75].map((t) => {
          const cx = size * t;
          const cy = curveY(t);
          const halfHeight = HALF_T + 4;
          return (
            <line key={t}
                  x1={cx} y1={cy - halfHeight}
                  x2={cx} y2={cy + halfHeight}
                  stroke="var(--wood-edge, rgba(154,92,40,0.22))"
                  strokeWidth={t === 0.5 ? 1.4 : 0.8}
                  strokeDasharray={t === 0.5 ? '5,3' : '2,3'} />
          );
        })}

        {/* Pole-color caps at the very ends. Small accent so the per-pole
            color identity is present without coloring the whole track. */}
        <circle cx={HALF_T - 4} cy={BASELINE} r={4.5}
                fill={AXIS_COLORS.L} opacity={0.95} />
        <circle cx={size - HALF_T + 4} cy={BASELINE} r={4.5}
                fill={AXIS_COLORS.R} opacity={0.95} />

        {/* Community markers riding the curve. */}
        {density && community.map((d, i) => {
          if (typeof d?.x !== 'number') return null;
          const cx = d.x * size;
          const cy = curveY(d.x);
          const col = binaryBlend(d.x);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={density.haloR}  fill={col}
                      opacity={density.haloOpacity}  filter={`url(#${gid}-blur)`} />
              <circle cx={cx} cy={cy} r={density.solidR} fill={col}
                      opacity={density.solidOpacity} />
            </g>
          );
        })}

        {/* Empty-state hint at the apex. Hidden during drag (the draft
            marker takes over) and when any committed placement or author
            marker is showing. */}
        {!visibleMarker && !authorPosition && (
          <g opacity={0.42}>
            <circle cx={size / 2} cy={curveY(0.5)} r={11} fill="none"
                    stroke="var(--brass-mid, #b8862e)" strokeWidth={1}
                    strokeDasharray="2,3" />
            <circle cx={size / 2} cy={curveY(0.5)} r={3.5}
                    fill="var(--brass-mid, #b8862e)" opacity={0.5} />
          </g>
        )}

        {/* Author marker on the curve. */}
        {authorPosition && typeof authorPosition.x === 'number' && (
          <AuthorMarker
            x={authorPosition.x * size}
            y={curveY(authorPosition.x)}
          />
        )}

        {/* Reader placement marker on the curve. While dragging, render
            a slightly subdued draft marker that follows the pointer. On
            release, the parent's placement state catches up and this
            falls back to the committed marker. */}
        {visibleMarker && typeof visibleMarker.x === 'number' && (
          <g opacity={dragging ? 0.85 : 1}>
            <UserMarker
              x={visibleMarker.x * size}
              y={curveY(visibleMarker.x)}
              color={binaryBlend(visibleMarker.x)}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
