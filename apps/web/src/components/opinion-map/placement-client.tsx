'use client';

/**
 * The placement island: tap to stage a position, tap again to move it,
 * Commit to persist it. Step 6 of the architect's port plan
 * (team/architect/architecture/2026-09-21-delta-mechanic-port.md, "Server
 * components and islands", "The write path"): the sixth island the build
 * plan already budgeted (docs/plans/build-plan.md:50, "opinion maps"), not
 * a new slot.
 *
 * Ported from usePlacement / PlacementButtonRow / PlacementCard /
 * InteractiveMap in
 * _recovered-next/lib/theme/dialecta-opinion-map-placement.jsx, and from
 * CartesianMap/TernaryMap/BinaryMap's onPlace/interactive branches in
 * _recovered-next/lib/theme/dialecta-opinion-map.jsx (engine.tsx ported
 * only their read-only halves; the tap and drag handling below is ported
 * from the halves engine.tsx's own header docstring says it dropped).
 * Reuses engine.tsx's exported pure helpers (axisColor, ternaryColor,
 * binaryBlend, barycentricToXY, xyToBarycentric, clampBarycentric,
 * inTriangle) and its four landscape-palette constants (POLE_COLORS,
 * POLE_LABEL_COLORS, AXIS_COLORS, AXIS_LABEL_COLORS, exported alongside
 * this file) rather than re-deriving the coordinate math or the colors, as
 * engine.tsx's own docstring directs. Two of engine.tsx's private helpers,
 * `triVertices` and `ternaryGridSegments`, are not exported and are not
 * needed: the ternary vertices and viewBox height below are derived from
 * barycentricToXY(1,0,0)/(0,1,0)/(0,0,1) (barycentric coordinates for a
 * pure vertex ARE that vertex, by definition), and the grid segments are
 * six more barycentricToXY calls, the same composition
 * ternaryGridSegments itself is built from, inlined here rather than
 * exported for a six-line loop.
 *
 * On Declare (article-declaration/declaration.tsx) a claimed member gets
 * this island in place of engine.tsx's read-only OpinionMapFigure, which
 * signed-out readers keep. It draws the whole map, labels, the author's
 * brass marker when showAuthorPosition is true, and the reader's own, as
 * live's InteractiveMap did, so nothing appears twice.
 *
 * Not built here (deferred to step 7, docs/plans, Decision 5): reading a
 * committed placement back after a reload. This island's state resets on
 * remount, same as live's own React state does today.
 */
import { useId, useState, useTransition, type ReactNode } from 'react';
import {
  axisColor,
  ternaryColor,
  binaryBlend,
  barycentricToXY,
  xyToBarycentric,
  clampBarycentric,
  inTriangle,
  POLE_COLORS,
  POLE_LABEL_COLORS,
  AXIS_COLORS,
  AXIS_LABEL_COLORS,
} from './engine';
import type { OpinionMap, CartesianOpinionMap, TernaryOpinionMap, BinaryOpinionMap } from './data';
import { placeOpinionMapPosition, type PlacementStage } from './actions';
import { strings } from '@/strings';
import './opinion-map.css';

const s = strings.opinionMap.placement;

// ─── Coordinate shapes ──────────────────────────────────────────────────

type CartesianCoords = { x: number; y: number };
type TernaryCoords = { a: number; b: number; c: number };
type BinaryCoords = { x: number };
type Coordinates = CartesianCoords | TernaryCoords | BinaryCoords;

// Safe in practice, not just in type: a given PlacementClient instance is
// mounted for exactly one map (declaration.tsx keys it per map index, and
// Reflect only ever has one), so `place()` only ever stages the shape that
// map's own InteractiveFigure branch produces. These exist to satisfy the
// type checker at the point pending/committed state (typed as the full
// Coordinates union, since one <PlacementClient> can host any map type)
// is handed back to a specific figure.
function asCartesian(c: Coordinates | null): CartesianCoords | null {
  return c && 'y' in c ? c : null;
}
function asTernary(c: Coordinates | null): TernaryCoords | null {
  return c && 'a' in c ? c : null;
}
function asBinary(c: Coordinates | null): BinaryCoords | null {
  return c && 'x' in c && !('y' in c) ? c : null;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Screen pixel to this SVG's own viewBox coordinate, given its bounding rect. */
function pixelToViewBox(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  vbX: number,
  vbY: number,
  vbW: number,
  vbH: number,
): { x: number; y: number } {
  return {
    x: vbX + ((clientX - rect.left) / rect.width) * vbW,
    y: vbY + ((clientY - rect.top) / rect.height) * vbH,
  };
}

/** The six internal grid lines of the ternary triangle, from barycentricToXY alone. */
function ternaryGridSegments(size: number): Array<[{ x: number; y: number }, { x: number; y: number }]> {
  const segs: Array<[{ x: number; y: number }, { x: number; y: number }]> = [];
  for (const t of [1 / 3, 2 / 3]) {
    segs.push([barycentricToXY(t, 1 - t, 0, size), barycentricToXY(t, 0, 1 - t, size)]);
    segs.push([barycentricToXY(1 - t, t, 0, size), barycentricToXY(0, t, 1 - t, size)]);
    segs.push([barycentricToXY(1 - t, 0, t, size), barycentricToXY(0, 1 - t, t, size)]);
  }
  return segs;
}

// ─── Markers ────────────────────────────────────────────────────────────

/** Same brass marker as engine.tsx's (private there); the author's position. */
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

/** The reader's own marker: a color-mixed ring so it reads at a glance against the landscape it sits on. */
function UserMarker({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g aria-label="Your position">
      <circle cx={x} cy={y} r={29} fill={color} opacity={0.22} />
      <circle cx={x} cy={y} r={15} fill="var(--paper-bright)" stroke={color} strokeWidth={2.5} />
      <circle cx={x} cy={y} r={3.5} fill={color} />
    </g>
  );
}

function EmptyHint({ x, y }: { x: number; y: number }) {
  return (
    <g opacity={0.2}>
      <circle cx={x} cy={y} r={7} fill="none" stroke="var(--tertiary)" strokeWidth={1} strokeDasharray="2,3" />
      <circle cx={x} cy={y} r={2} fill="var(--tertiary)" />
    </g>
  );
}

// ─── CartesianInteractive ───────────────────────────────────────────────

function CartesianInteractive({
  axes,
  placement,
  authorPosition,
  onPlace,
  size = 320,
}: {
  axes: CartesianOpinionMap['axes'];
  placement: CartesianCoords | null;
  authorPosition: CartesianOpinionMap['authorPosition'];
  onPlace: (c: CartesianCoords) => void;
  size?: number;
}) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [hor, ver] = axes;
  const labelLeft = hor.axisA;
  const labelRight = hor.axisB;
  const labelTop = ver.axisA;
  const labelBottom = ver.axisB;

  const LABEL_PAD = 30;
  const VB_OFFSET = -LABEL_PAD;
  const VB_SIZE = size + LABEL_PAD * 2;

  function handleTap(clientX: number, clientY: number, rect: DOMRect) {
    const vb = pixelToViewBox(clientX, clientY, rect, VB_OFFSET, VB_OFFSET, VB_SIZE, VB_SIZE);
    onPlace({ x: clamp01(vb.x / size), y: clamp01(vb.y / size) });
  }

  const userColor = placement ? axisColor(placement.x, placement.y) : null;

  return (
    <div className="om-figure">
      <svg
        viewBox={`${VB_OFFSET} ${VB_OFFSET} ${VB_SIZE} ${VB_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        className="om-svg om-svg--interactive"
        role="img"
        aria-label={`Opinion map: ${labelLeft} to ${labelRight} horizontally, ${labelTop} to ${labelBottom} vertically. Tap to place yourself.`}
        onClick={(e) => handleTap(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
        onTouchEnd={(e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          if (t) handleTap(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect());
        }}
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

        {!authorPosition && !placement ? <EmptyHint x={size / 2} y={size / 2} /> : null}

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
        {placement && userColor ? <UserMarker x={placement.x * size} y={placement.y * size} color={userColor} /> : null}
      </svg>
    </div>
  );
}

// ─── TernaryInteractive ─────────────────────────────────────────────────

function TernaryInteractive({
  poles,
  placement,
  authorPosition,
  onPlace,
  size = 340,
}: {
  poles: TernaryOpinionMap['poles'];
  placement: TernaryCoords | null;
  authorPosition: TernaryOpinionMap['authorPosition'];
  onPlace: (c: TernaryCoords) => void;
  size?: number;
}) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [labelA, labelB, labelC] = poles;
  // Pure-vertex barycentric coordinates ARE the vertices; see the file
  // header for why this stands in for the unexported triVertices().
  const A = barycentricToXY(1, 0, 0, size);
  const B = barycentricToXY(0, 1, 0, size);
  const C = barycentricToXY(0, 0, 1, size);
  // triVertices' own height is pad + triH + 14, and B.y === pad + triH.
  const height = B.y + 14;
  const grid = ternaryGridSegments(size);
  const LABEL_PAD = 38;
  const VB_W = size + LABEL_PAD * 2;
  const VB_H = height + LABEL_PAD * 2;
  const triPoints = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`;

  function handleTap(clientX: number, clientY: number, rect: DOMRect) {
    const vb = pixelToViewBox(clientX, clientY, rect, -LABEL_PAD, -LABEL_PAD, VB_W, VB_H);
    const bary = xyToBarycentric(vb.x, vb.y, size);
    if (!inTriangle(bary.a, bary.b, bary.c)) return;
    onPlace(clampBarycentric(bary.a, bary.b, bary.c));
  }

  const userXY = placement ? barycentricToXY(placement.a, placement.b, placement.c, size) : null;
  const userColor = placement ? ternaryColor(placement.a, placement.b, placement.c) : null;

  return (
    <div className="om-figure">
      <svg
        viewBox={`${-LABEL_PAD} ${-LABEL_PAD} ${VB_W} ${VB_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="om-svg om-svg--interactive"
        role="img"
        aria-label={`Ternary opinion map: ${labelA}, ${labelB}, ${labelC}. Tap to place yourself.`}
        onClick={(e) => handleTap(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
        onTouchEnd={(e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          if (t) handleTap(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect());
        }}
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

        {!authorPosition && !placement ? <EmptyHint x={barycentricToXY(1 / 3, 1 / 3, 1 / 3, size).x} y={barycentricToXY(1 / 3, 1 / 3, 1 / 3, size).y} /> : null}

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

        {placement && userXY && userColor ? <UserMarker x={userXY.x} y={userXY.y} color={userColor} /> : null}
      </svg>
    </div>
  );
}

// ─── BinaryInteractive ──────────────────────────────────────────────────
// Pointer down/move/up, ported from live's own drag-to-place track (the
// only one of the three map types that supported it): a plain tap (down
// then up with no movement) still commits a placement through the same
// path, so this is a superset of tap, not a different interaction.

function BinaryInteractive({
  axisA,
  axisB,
  placement,
  authorPosition,
  onPlace,
  size = 320,
}: {
  axisA: string;
  axisB: string;
  placement: BinaryCoords | null;
  authorPosition: BinaryOpinionMap['authorPosition'];
  onPlace: (c: BinaryCoords) => void;
  size?: number;
}) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [draft, setDraft] = useState<BinaryCoords | null>(null);
  const [dragging, setDragging] = useState(false);

  const VIEW_HEIGHT = 64;
  const BASELINE = 44;
  const HALF_T = 14;
  const ARC_PEAK = 9;
  const curveY = (p: number) => BASELINE - ARC_PEAK * Math.sin(Math.PI * clamp01(p));

  function computeX(clientX: number, rect: DOMRect): BinaryCoords {
    return { x: clamp01((clientX - rect.left) / rect.width) };
  }

  function handlePointerDown(clientX: number, pointerId: number, target: SVGSVGElement) {
    try {
      target.setPointerCapture(pointerId);
    } catch {
      // A tap still resolves on pointerup without capture; dragging past
      // the element's own edge just stops tracking.
    }
    setDragging(true);
    setDraft(computeX(clientX, target.getBoundingClientRect()));
  }

  function handlePointerMove(clientX: number, target: SVGSVGElement) {
    if (!dragging) return;
    setDraft(computeX(clientX, target.getBoundingClientRect()));
  }

  function handlePointerUp(clientX: number, pointerId: number, target: SVGSVGElement) {
    if (!dragging) return;
    setDragging(false);
    try {
      target.releasePointerCapture(pointerId);
    } catch {
      // See handlePointerDown.
    }
    const final = computeX(clientX, target.getBoundingClientRect());
    setDraft(null);
    onPlace(final);
  }

  const visibleMarker = dragging && draft ? draft : placement;
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
      <div className="om-binary-labels">
        <div className="om-binary-label om-binary-label--left" style={{ color: AXIS_LABEL_COLORS.L }}>
          {axisA}
        </div>
        <div className="om-binary-label om-binary-label--right" style={{ color: AXIS_LABEL_COLORS.R }}>
          {axisB}
        </div>
      </div>

      <svg
        viewBox={`-4 0 ${size + 8} ${VIEW_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        className={`om-svg om-svg--interactive om-svg--drag${dragging ? ' om-svg--dragging' : ''}`}
        role="img"
        aria-label={`Opinion continuum: ${axisA} on the left to ${axisB} on the right. Tap or drag to place yourself.`}
        onPointerDown={(e) => handlePointerDown(e.clientX, e.pointerId, e.currentTarget)}
        onPointerMove={(e) => handlePointerMove(e.clientX, e.currentTarget)}
        onPointerUp={(e) => handlePointerUp(e.clientX, e.pointerId, e.currentTarget)}
        onPointerCancel={(e) => handlePointerUp(e.clientX, e.pointerId, e.currentTarget)}
      >
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

        {!visibleMarker && !authorPosition ? <EmptyHint x={size / 2} y={curveY(0.5)} /> : null}

        {authorPosition ? <AuthorMarker x={authorPosition.x * size} y={curveY(authorPosition.x)} /> : null}

        {visibleMarker ? (
          <g opacity={dragging ? 0.85 : 1}>
            <UserMarker x={visibleMarker.x * size} y={curveY(visibleMarker.x)} color={binaryBlend(visibleMarker.x)} />
          </g>
        ) : null}
      </svg>
    </div>
  );
}

// ─── Dispatch ───────────────────────────────────────────────────────────

function InteractiveFigure({
  map,
  placement,
  showAuthorPosition,
  onPlace,
}: {
  map: OpinionMap;
  placement: Coordinates | null;
  showAuthorPosition: boolean;
  onPlace: (c: Coordinates) => void;
}) {
  if (map.type === 'cartesian') {
    return (
      <CartesianInteractive
        axes={map.axes}
        placement={asCartesian(placement)}
        authorPosition={showAuthorPosition ? map.authorPosition : null}
        onPlace={onPlace}
      />
    );
  }
  if (map.type === 'ternary') {
    return (
      <TernaryInteractive
        poles={map.poles}
        placement={asTernary(placement)}
        authorPosition={showAuthorPosition ? map.authorPosition : null}
        onPlace={onPlace}
      />
    );
  }
  return (
    <BinaryInteractive
      axisA={map.axisA}
      axisB={map.axisB}
      placement={asBinary(placement)}
      authorPosition={showAuthorPosition ? map.authorPosition : null}
      onPlace={onPlace}
    />
  );
}

// ─── Button row: hint / tap-again+Commit / Re-place ────────────────────

function PlacementActions({
  isPendingTap,
  isCommitted,
  isSaving,
  onCommit,
  onReset,
}: {
  isPendingTap: boolean;
  isCommitted: boolean;
  isSaving: boolean;
  onCommit: () => void;
  onReset: () => void;
}) {
  if (isPendingTap) {
    return (
      <div className="om-placement-actions">
        <p className="om-placement-hint">{s.tapAgain}</p>
        <button type="button" className="om-placement-commit" onClick={onCommit} disabled={isSaving}>
          {isSaving ? s.committing : s.commit}
        </button>
      </div>
    );
  }
  if (isCommitted) {
    return (
      <div className="om-placement-actions">
        <button type="button" className="om-placement-replace" onClick={onReset}>
          {s.replace}
        </button>
      </div>
    );
  }
  return <p className="om-placement-hint">{s.tapHint}</p>;
}

// ─── PlacementClient ────────────────────────────────────────────────────

export interface PlacementPrompt {
  eyebrow: string;
  headline: string;
  body: string;
}

export interface PlacementClientProps {
  map: OpinionMap;
  /** articles.id (uuid), never the Ghost post id. */
  articleId: string;
  mapIndex: number;
  stage: PlacementStage;
  showAuthorPosition: boolean;
  /** Reflect's card header, above the map. Omitted for Declare's bare figure. */
  prompt?: PlacementPrompt | null;
  /** Reflect only: shown once committed. */
  postPlacementText?: string | null;
  /**
   * Reflect only: a primary action after commit ("Begin reading →"),
   * carrying data-overlay-close so spine-client.tsx's existing close
   * handler dismisses the overlay, the same delegated-click mechanism
   * every other dismiss control in that file already uses.
   */
  committedCloseLabel?: string | null;
}

export function PlacementClient({
  map,
  articleId,
  mapIndex,
  stage,
  showAuthorPosition,
  prompt = null,
  postPlacementText = null,
  committedCloseLabel = null,
}: PlacementClientProps): ReactNode {
  const [committed, setCommitted] = useState<Coordinates | null>(null);
  const [pending, setPending] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  const placement = pending ?? committed;
  const isPendingTap = pending !== null;
  const isCommitted = committed !== null && pending === null;

  function place(coords: Coordinates) {
    setPending(coords);
    setError(null);
  }

  function handleCommit() {
    if (!pending) return;
    setError(null);
    const coords = pending;
    startTransition(async () => {
      const result = await placeOpinionMapPosition({
        articleId,
        mapIndex,
        stage,
        mapType: map.type,
        coordinates: coords,
      });
      if (!result.ok) {
        // Covers both an outright failure and the empty-result "signed out
        // or unclaimed" case; see actions.ts for why the two are never
        // told apart here, and the file header above for why this branch
        // is a backstop rather than the everyday path.
        setError(s.signInRequired);
        return;
      }
      setCommitted(coords);
      setPending(null);
    });
  }

  function handleReset() {
    setCommitted(null);
    setPending(null);
    setError(null);
  }

  return (
    <div className="om-placement">
      {prompt ? (
        <div className="om-caption">
          <div className="om-caption-kicker">{prompt.eyebrow}</div>
          <div className="om-caption-text">{prompt.headline}</div>
          <p className="om-placement-prompt-body">{prompt.body}</p>
        </div>
      ) : null}

      <InteractiveFigure map={map} placement={placement} showAuthorPosition={showAuthorPosition} onPlace={place} />

      <PlacementActions
        isPendingTap={isPendingTap}
        isCommitted={isCommitted}
        isSaving={isSaving}
        onCommit={handleCommit}
        onReset={handleReset}
      />

      {isCommitted && postPlacementText ? <p className="om-placement-hint">{postPlacementText}</p> : null}

      {isCommitted && committedCloseLabel ? (
        <div className="om-placement-actions">
          <button type="button" className="om-placement-commit" data-overlay-close>
            {committedCloseLabel}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="notice" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
