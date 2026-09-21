/**
 * The Thinking Fingerprint as SVG markup: planFingerprint's plan, drawn.
 *
 * A pure function from a paint plan to a string. No React, no hooks, no DOM,
 * so one call draws a figure in a server component, which then hydrates
 * nothing, and the same call redraws a figure inside a client island when its
 * data changes. The SVG layer is the one apps/web's client component drew,
 * which ported the `Fingerprint` component in
 * _recovered-next/lib/theme/dialecta-fingerprint-engine.jsx, in the engine's
 * own paint order: guide ring, centre glow, axis lines, seed dots, halo,
 * rings, anchor, labels. There is no geometry, texture or colour maths here;
 * every number comes from the plan.
 *
 * WHAT THE CALLER SUPPLIES
 *
 *   idSuffix   Appended to every id the figure defines. SVG ids are
 *              document-wide, so two figures on one page with the same ids
 *              clip each other to the wrong silhouette (engine :101-110).
 *              Characters outside [A-Za-z0-9_-] are dropped, so a suffix
 *              cannot leave its attribute.
 *   classes    The chrome's class names. Chrome colours (guide ring, axis
 *              lines, anchor, labels) are tokens the caller's stylesheet sets
 *              on these classes. Ring, seed and halo colours are data the
 *              engine blends, and arrive in the plan.
 *
 * THE STYLESHEET'S HALF
 *
 *   Each ring group carries its opacity once, as the custom property
 *   --ring-opacity, and the caller's stylesheet hands it to every segment in
 *   the ring (`.ring path { opacity: var(--ring-opacity) }`). The opacity
 *   stays on each segment, never on the group: group opacity would composite
 *   the round-cap joints differently from the engine's per-line opacity.
 *
 * WHY THE MARKUP IS SHAPED THIS WAY
 *
 *   A figure drawn by a server component reaches the browser twice, as markup
 *   in the HTML and again inside the page's RSC payload, where every `<`,
 *   `>` and `"` is escaped. So the markup is written small. Each of these was
 *   checked pixel for pixel against the former component's output:
 *     - a ring segment is `<path d=Mx,yLx,y>`, not `<line x1 y1 x2 y2>`
 *     - attribute values go unquoted where HTML allows it, elements self-close
 *     - a leading zero is dropped (.25 for 0.25); it parses to the same number
 *     - the halo's five strokes are <use> of the one silhouette path in the
 *       clip, not five copies of a 96-point curve
 *     - ring opacity is on the ring, as above, not written on every segment
 *   Grouping segments by colour would save more bytes, and costs a DOM node
 *   per run of colour, about 3,900 on /fingerprint. Not done.
 */

import type { ClarityBucket, FingerprintHaloStroke, FingerprintPlan, FingerprintSegment } from './fingerprint-plan';
import { pillarName } from './pillars';

export interface FingerprintSvgClasses {
  /** The potential ring behind a grown fingerprint. */
  readonly guide: string;
  /** The potential ring in the Newborn state. */
  readonly guideNewborn: string;
  readonly axisLine: string;
  readonly anchorDot: string;
  readonly anchorRing: string;
  readonly label: string;
  readonly halo: string;
  /** On every ring group. The stylesheet reads --ring-opacity through it. */
  readonly ring: string;
  /** On a newly earned ring, alongside `ring`. */
  readonly grow: string;
}

export interface FingerprintSvgOptions {
  /** Unique per figure on a page. */
  readonly idSuffix: string;
  readonly classes: FingerprintSvgClasses;
}

export interface FingerprintSvg {
  readonly width: number;
  readonly height: number;
  readonly viewBox: string;
  /** Everything inside the <svg> element. */
  readonly markup: string;
}

const BUCKETS: readonly ClarityBucket[] = ['crisp', 'soft', 'diffuse'];

/** Values the HTML tokenizer reads the same unquoted as quoted. Deliberately narrower than HTML allows. */
const BARE = /^[A-Za-z0-9_.:%#(),+-]+$/;

/** A number as JavaScript prints it, less a leading zero: .25 parses to exactly 0.25. */
function num(n: number): string {
  const s = String(n);
  if (s.startsWith('0.')) return s.slice(1);
  if (s.startsWith('-0.')) return `-${s.slice(2)}`;
  return s;
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

type AttrValue = string | number | null | undefined;

function attrs(list: ReadonlyArray<readonly [string, AttrValue]>): string {
  let out = '';
  for (const [name, value] of list) {
    if (value === null || value === undefined || value === '') continue;
    const v = typeof value === 'number' ? num(value) : value;
    out += BARE.test(v) ? ` ${name}=${v}` : ` ${name}="${escapeAttr(v)}"`;
  }
  return out;
}

/** One element. With no children it self-closes; ` />` keeps a bare last value from swallowing the slash. */
function el(name: string, list: ReadonlyArray<readonly [string, AttrValue]>, children?: string): string {
  return children === undefined ? `<${name}${attrs(list)} />` : `<${name}${attrs(list)}>${children}</${name}>`;
}

/** Consecutive segments that share a blur bucket, in the order they paint. */
function runsOf(segments: readonly FingerprintSegment[]): Array<{ blur: ClarityBucket; segments: FingerprintSegment[] }> {
  const runs: Array<{ blur: ClarityBucket; segments: FingerprintSegment[] }> = [];
  for (const s of segments) {
    const last = runs[runs.length - 1];
    if (last && last.blur === s.blur) last.segments.push(s);
    else runs.push({ blur: s.blur, segments: [s] });
  }
  return runs;
}

/**
 * Draws a plan. The same plan and suffix give the same string on every call,
 * on the server and in the browser.
 */
export function renderFingerprintSvg(plan: FingerprintPlan, options: FingerprintSvgOptions): FingerprintSvg {
  const P = plan.params;
  const C = options.classes;
  const suffix = options.idSuffix.replace(/[^A-Za-z0-9_-]/g, '');
  const id = (name: string): string => `fp-${name}-${suffix}`;
  const url = (name: string): string => `url(#${id(name)})`;
  const halo = plan.halo;
  const out: string[] = [];

  // <defs>: the glow, the three clarity blurs, and the halo's two blurs and silhouette.
  let defs = el(
    'radialGradient',
    [
      ['id', id('glow')],
      ['cx', '50%'],
      ['cy', '50%'],
      ['r', '50%'],
    ],
    el('stop', [
      ['offset', '0%'],
      ['style', `stop-color:var(--brass-mid);stop-opacity:${P.centerGlow.opacity}`],
    ]) +
      el('stop', [
        ['offset', '100%'],
        ['style', 'stop-color:var(--brass-mid);stop-opacity:0'],
      ]),
  );
  for (const bucket of BUCKETS) {
    defs += el('filter', [['id', id(bucket)]], el('feGaussianBlur', [['stdDeviation', P.clarity.blur[bucket]]]));
  }
  if (halo) {
    defs += el(
      'filter',
      [
        ['id', id('halo-near')],
        ['x', '-40%'],
        ['y', '-40%'],
        ['width', '180%'],
        ['height', '180%'],
      ],
      el('feGaussianBlur', [['stdDeviation', halo.blurNear]]),
    );
    defs += el(
      'filter',
      [
        ['id', id('halo-far')],
        ['x', '-60%'],
        ['y', '-60%'],
        ['width', '220%'],
        ['height', '220%'],
      ],
      el('feGaussianBlur', [['stdDeviation', halo.blurFar]]),
    );
    defs += el(
      'clipPath',
      [['id', id('silhouette')]],
      el('path', [
        ['id', id('silhouette-path')],
        ['d', halo.path],
      ]),
    );
  }
  out.push(el('defs', [], defs));

  // The potential ring: a horizon every axis approaches and none reaches.
  out.push(
    el('circle', [
      ['cx', plan.cx],
      ['cy', plan.cy],
      ['r', plan.maxR],
      ['fill', 'none'],
      ['class', plan.state === 'newborn' ? C.guideNewborn : C.guide],
      ['stroke-width', P.guide.strokeWidth],
      ['stroke-dasharray', P.guide.dash],
      ['opacity', plan.guideOpacity],
    ]),
  );

  out.push(
    el('circle', [
      ['cx', plan.spine.x],
      ['cy', plan.spine.y],
      ['r', plan.maxR * P.centerGlow.radiusFactor],
      ['fill', url('glow')],
    ]),
  );

  for (const l of plan.axisLines) {
    out.push(
      el('line', [
        ['x1', l.x1],
        ['y1', l.y1],
        ['x2', l.x2],
        ['y2', l.y2],
        ['class', C.axisLine],
        ['stroke-width', P.axisLines.strokeWidth],
        ['opacity', P.axisLines.opacity],
      ]),
    );
  }

  for (const dot of plan.seedDots) {
    out.push(
      el('circle', [
        ['cx', dot.x],
        ['cy', dot.y],
        ['r', dot.r],
        ['fill', dot.color],
        ['opacity', dot.opacity],
      ]),
    );
  }

  if (halo) {
    // Strokes of the silhouette with fill none, never a filled shape; see planHalo.
    const stroke = (s: FingerprintHaloStroke): string =>
      el('use', [
        ['href', `#${id('silhouette-path')}`],
        ['fill', 'none'],
        ['stroke', s.color],
        ['stroke-width', s.width],
        ['opacity', s.opacity],
        ['filter', url(s.blur === 'far' ? 'halo-far' : 'halo-near')],
      ]);
    out.push(
      el(
        'g',
        [['class', C.halo]],
        halo.outer.map(stroke).join('') + el('g', [['clip-path', url('silhouette')]], halo.inner.map(stroke).join('')),
      ),
    );
  }

  for (const ring of plan.rings) {
    let runs = '';
    for (const run of runsOf(ring.segments)) {
      let segments = '';
      for (const s of run.segments) {
        segments += el('path', [
          ['d', `M${num(s.x1)},${num(s.y1)}L${num(s.x2)},${num(s.y2)}`],
          ['stroke', s.color],
          ['stroke-width', s.width],
        ]);
      }
      runs += el('g', [['filter', url(run.blur)]], segments);
    }
    // No fill="none" here, though a segment has nothing to fill: on a group of
    // blurred strokes it changes Chrome's output near the centre, where the
    // rings are small (measured on /fingerprint, up to 23 levels). A
    // two-point path filled with the default paints no pixels, exactly as
    // the engine's <line> did.
    out.push(
      el(
        'g',
        [
          ['class', ring.isNew && C.grow ? `${C.ring} ${C.grow}` : C.ring],
          ['style', `--ring-opacity:${num(ring.opacity)}`],
          ['stroke-linecap', 'round'],
        ],
        runs,
      ),
    );
  }

  out.push(
    el('circle', [
      ['cx', plan.spine.x],
      ['cy', plan.spine.y],
      ['r', P.anchor.dotRadius],
      ['class', C.anchorDot],
      ['opacity', P.anchor.dotOpacity],
    ]),
  );
  out.push(
    el('circle', [
      ['cx', plan.spine.x],
      ['cy', plan.spine.y],
      ['r', P.anchor.ringRadius],
      ['fill', 'none'],
      ['class', C.anchorRing],
      ['stroke-width', P.anchor.ringStrokeWidth],
      ['opacity', P.anchor.ringOpacity],
    ]),
  );

  for (const l of plan.labels) {
    out.push(
      el(
        'text',
        [
          ['x', l.x],
          ['y', l.y],
          ['text-anchor', 'middle'],
          ['dominant-baseline', 'middle'],
          ['class', C.label],
          ['font-size', P.label.fontSize],
          ['letter-spacing', P.label.letterSpacing],
        ],
        escapeText(pillarName(l.axis)),
      ),
    );
  }

  return {
    width: plan.totalSize,
    height: plan.totalSize,
    viewBox: `0 0 ${plan.totalSize} ${plan.totalSize}`,
    markup: out.join(''),
  };
}
