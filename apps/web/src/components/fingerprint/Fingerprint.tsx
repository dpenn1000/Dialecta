'use client';

/**
 * The Thinking Fingerprint, drawn.
 *
 * A client island by the rule in apps/web/CLAUDE.md, and deliberately a thin
 * one: it takes the engine's input as plain numbers, asks planFingerprint in
 * @dialecta/core for the paint plan, and turns that plan into SVG. There is no
 * geometry, texture or colour maths in this file. It imports no Supabase
 * client and fetches nothing.
 *
 * The SVG layer is ported from the `Fingerprint` component in
 * _recovered-next/lib/theme/dialecta-fingerprint-engine.jsx, in the engine's own
 * paint order: guide ring, centre glow, axis lines, seed dots, halo, rings,
 * anchor, labels. Two things differ from it:
 *
 *   - Chrome colours (guide ring, axis lines, anchor, glow, labels) come from
 *     tokens.css instead of the engine's inline hex table. Ring, seed and halo
 *     colours are data the engine blends, and arrive in the plan.
 *   - Ring segments sharing a blur bucket are grouped under one filter instead
 *     of carrying one filter each, which is up to 2,700 filter regions on a
 *     mature fingerprint. Each line keeps its own colour, width and opacity, so
 *     the joints still overlap the way the engine drew them.
 *
 * The halo is three strokes of the silhouette with fill="none", plus two more
 * clipped inside it. It is never a filled shape; see planHalo in core.
 */
import { useId, useMemo } from 'react';
import {
  pillarName,
  planFingerprint,
  type Axis,
  type ClarityBucket,
  type FingerprintData,
  type FingerprintRenderParams,
  type FingerprintSegment,
} from '@dialecta/core';
import { TOPICS } from '@/lib/topics';
import styles from './fingerprint.module.css';

export interface FingerprintProps {
  data: FingerprintData;
  /** Geometry size in px; the drawn frame adds the label margin each side. Engine default 360. */
  size?: number;
  showLabels?: boolean;
  showAxisLines?: boolean;
  /** 0 to 1, `profiles.resonance`. Zero draws no halo. */
  resonance?: number;
  /** `fingerprintSalt(profileId)`, so each contributor's texture is their own. */
  salt?: number;
  newRingAxis?: Axis | null;
  /** The accessible description. Callers build it from strings.ts. */
  label: string;
  /** A replacement for FINGERPRINT_RENDER, for a tuning pass. */
  params?: FingerprintRenderParams;
  /** A CSS-module lookup is string | undefined under noUncheckedIndexedAccess, so both are accepted. */
  className?: string | undefined;
}

interface Run {
  blur: ClarityBucket;
  segments: FingerprintSegment[];
}

/** Consecutive segments that share a blur bucket, in the order they paint. */
function runsOf(segments: readonly FingerprintSegment[]): Run[] {
  const runs: Run[] = [];
  for (const s of segments) {
    const last = runs[runs.length - 1];
    if (last && last.blur === s.blur) last.segments.push(s);
    else runs.push({ blur: s.blur, segments: [s] });
  }
  return runs;
}

export function Fingerprint({
  data,
  size = 360,
  showLabels = true,
  showAxisLines = true,
  resonance = 0,
  salt = 0,
  newRingAxis = null,
  label,
  params,
  className,
}: FingerprintProps) {
  // One suffix per instance on every <defs> id. The engine learned this the
  // hard way (:101-110): two fingerprints on a page with shared ids clipped
  // each other to the wrong silhouette.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const plan = useMemo(
    () =>
      planFingerprint(data, {
        size,
        showLabels,
        showAxisLines,
        resonance,
        salt,
        newRingAxis,
        topics: TOPICS,
        ...(params ? { params } : {}),
      }),
    [data, size, showLabels, showAxisLines, resonance, salt, newRingAxis, params],
  );
  const P = plan.params;
  const id = (name: string) => `fp-${name}-${uid}`;
  const blurId: Record<ClarityBucket, string> = { crisp: id('crisp'), soft: id('soft'), diffuse: id('diffuse') };
  const halo = plan.halo;

  return (
    <svg
      className={[styles.svg, className].filter(Boolean).join(' ')}
      width={plan.totalSize}
      height={plan.totalSize}
      viewBox={`0 0 ${plan.totalSize} ${plan.totalSize}`}
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={id('glow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: 'var(--brass-mid)', stopOpacity: P.centerGlow.opacity }} />
          <stop offset="100%" style={{ stopColor: 'var(--brass-mid)', stopOpacity: 0 }} />
        </radialGradient>
        {(Object.keys(blurId) as ClarityBucket[]).map((bucket) => (
          <filter key={bucket} id={blurId[bucket]}>
            <feGaussianBlur stdDeviation={P.clarity.blur[bucket]} />
          </filter>
        ))}
        {halo ? (
          <>
            <filter id={id('halo-near')} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation={halo.blurNear} />
            </filter>
            <filter id={id('halo-far')} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation={halo.blurFar} />
            </filter>
            <clipPath id={id('silhouette')}>
              <path d={halo.path} />
            </clipPath>
          </>
        ) : null}
      </defs>

      {/* The potential ring: a horizon every axis approaches and none reaches. */}
      <circle
        cx={plan.cx}
        cy={plan.cy}
        r={plan.maxR}
        fill="none"
        className={plan.state === 'newborn' ? styles.guideNewborn : styles.guide}
        strokeWidth={P.guide.strokeWidth}
        strokeDasharray={P.guide.dash}
        opacity={plan.guideOpacity}
      />

      <circle
        cx={plan.spine.x}
        cy={plan.spine.y}
        r={plan.maxR * P.centerGlow.radiusFactor}
        fill={`url(#${id('glow')})`}
      />

      {plan.axisLines.map((l) => (
        <line
          key={l.axis}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          className={styles.axisLine}
          strokeWidth={P.axisLines.strokeWidth}
          opacity={P.axisLines.opacity}
        />
      ))}

      {plan.seedDots.map((dot) => (
        <circle key={dot.axis} cx={dot.x} cy={dot.y} r={dot.r} fill={dot.color} opacity={dot.opacity} />
      ))}

      {halo ? (
        <g className={styles.halo}>
          {halo.outer.map((s, i) => (
            <path
              key={`outer-${i}`}
              d={halo.path}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width}
              opacity={s.opacity}
              filter={`url(#${id(s.blur === 'far' ? 'halo-far' : 'halo-near')})`}
            />
          ))}
          <g clipPath={`url(#${id('silhouette')})`}>
            {halo.inner.map((s, i) => (
              <path
                key={`inner-${i}`}
                d={halo.path}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width}
                opacity={s.opacity}
                filter={`url(#${id(s.blur === 'far' ? 'halo-far' : 'halo-near')})`}
              />
            ))}
          </g>
        </g>
      ) : null}

      {plan.rings.map((ring) => (
        <g key={`ring-${ring.k}`} className={ring.isNew ? styles.grow : undefined}>
          {runsOf(ring.segments).map((run, r) => (
            // strokeLinecap inherits, so it sits once on the group. Opacity
            // does not move up: group opacity would composite the joints
            // differently from the engine's per-line opacity.
            <g key={r} filter={`url(#${blurId[run.blur]})`} strokeLinecap="round">
              {run.segments.map((s, j) => (
                <line
                  key={j}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={s.color}
                  strokeWidth={s.width}
                  opacity={ring.opacity}
                />
              ))}
            </g>
          ))}
        </g>
      ))}

      <circle
        cx={plan.spine.x}
        cy={plan.spine.y}
        r={P.anchor.dotRadius}
        className={styles.anchorDot}
        opacity={P.anchor.dotOpacity}
      />
      <circle
        cx={plan.spine.x}
        cy={plan.spine.y}
        r={P.anchor.ringRadius}
        fill="none"
        className={styles.anchorRing}
        strokeWidth={P.anchor.ringStrokeWidth}
        opacity={P.anchor.ringOpacity}
      />

      {plan.labels.map((l) => (
        <text
          key={l.axis}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.label}
          fontSize={P.label.fontSize}
          letterSpacing={P.label.letterSpacing}
        >
          {pillarName(l.axis)}
        </text>
      ))}
    </svg>
  );
}
