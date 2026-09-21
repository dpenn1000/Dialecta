/**
 * The Pact's antique paper: page-pact.hbs's .parchment section with its edge
 * vignette, the SVG crinkle layer and the corner mark. Two sizes, as live: the
 * hero sheet (a 1000x700 crinkle field) and the long sheet that carries
 * sections II to VIII (1000x2800, the same strokes repeated down the page).
 *
 * Filter ids carry a pact- prefix. The live page could use bare ids like "w7"
 * because nothing else on it drew SVG; here the shell's icons share the
 * document, and a duplicate id would silently borrow the wrong filter.
 */
import type { ReactNode } from 'react';
import { strings } from '@/strings';
import s from './pact.module.css';

function HeroCrinkles() {
  return (
    <svg className={s.crinkles} viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <filter id="pact-w7" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={7} />
          <feDisplacementMap in="SourceGraphic" scale={18} />
        </filter>
        <filter id="pact-w3" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={12} />
        </filter>
        <filter id="pact-b7">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <g filter="url(#pact-w7)" opacity="0.65">
        <path d="M 80 120 Q 260 180, 430 210 T 780 260" fill="none" stroke="#8c4a2f" strokeWidth="0.6" strokeLinecap="round" filter="url(#pact-b7)" />
        <path d="M 120 430 Q 320 460, 500 440 T 900 480" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-b7)" />
        <path d="M 200 560 Q 380 600, 560 580 T 860 620" fill="none" stroke="#5a2410" strokeWidth="0.4" strokeLinecap="round" filter="url(#pact-b7)" />
      </g>
      <g filter="url(#pact-w3)" opacity="0.55">
        <path d="M 620 60 Q 680 140, 740 200 T 880 340" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-b7)" />
        <path d="M 40 300 Q 110 360, 180 400" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-b7)" />
        <path d="M 480 130 Q 540 210, 580 300" fill="none" stroke="#5a2410" strokeWidth="0.35" strokeLinecap="round" filter="url(#pact-b7)" />
      </g>
      <g filter="url(#pact-w3)" opacity="0.35">
        <ellipse cx="340" cy="260" rx="38" ry="6" fill="none" stroke="#8c4a2f" strokeWidth="0.4" filter="url(#pact-b7)" />
        <ellipse cx="720" cy="420" rx="52" ry="8" fill="none" stroke="#8c4a2f" strokeWidth="0.35" filter="url(#pact-b7)" />
      </g>
    </svg>
  );
}

function LongCrinkles() {
  return (
    <svg className={s.crinkles} viewBox="0 0 1000 2800" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <filter id="pact-lw1" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={11} />
          <feDisplacementMap in="SourceGraphic" scale={18} />
        </filter>
        <filter id="pact-lw2" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={19} />
          <feDisplacementMap in="SourceGraphic" scale={12} />
        </filter>
        <filter id="pact-lb1">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <g filter="url(#pact-lw1)" opacity="0.65">
        <path d="M 80 120 Q 260 180, 430 210 T 780 260" fill="none" stroke="#8c4a2f" strokeWidth="0.6" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 120 530 Q 320 560, 500 540 T 900 580" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 200 860 Q 380 900, 560 880 T 860 920" fill="none" stroke="#5a2410" strokeWidth="0.4" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 80 1220 Q 260 1280, 430 1310 T 780 1360" fill="none" stroke="#8c4a2f" strokeWidth="0.6" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 120 1630 Q 320 1660, 500 1640 T 900 1680" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 200 1960 Q 380 2000, 560 1980 T 860 2020" fill="none" stroke="#5a2410" strokeWidth="0.4" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 80 2320 Q 260 2380, 430 2410 T 780 2460" fill="none" stroke="#8c4a2f" strokeWidth="0.6" strokeLinecap="round" filter="url(#pact-lb1)" />
      </g>
      <g filter="url(#pact-lw2)" opacity="0.55">
        <path d="M 620 160 Q 680 240, 740 300 T 880 440" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 40 700 Q 110 760, 180 800" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 480 1030 Q 540 1110, 580 1200" fill="none" stroke="#5a2410" strokeWidth="0.35" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 760 1500 Q 820 1560, 860 1640" fill="none" stroke="#8c4a2f" strokeWidth="0.4" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 620 1860 Q 680 1940, 740 2000 T 880 2140" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-lb1)" />
        <path d="M 40 2200 Q 110 2260, 180 2300" fill="none" stroke="#8c4a2f" strokeWidth="0.5" strokeLinecap="round" filter="url(#pact-lb1)" />
      </g>
      <g filter="url(#pact-lw2)" opacity="0.35">
        <ellipse cx="340" cy="460" rx="38" ry="6" fill="none" stroke="#8c4a2f" strokeWidth="0.4" filter="url(#pact-lb1)" />
        <ellipse cx="720" cy="1220" rx="52" ry="8" fill="none" stroke="#8c4a2f" strokeWidth="0.35" filter="url(#pact-lb1)" />
        <ellipse cx="280" cy="1860" rx="44" ry="7" fill="none" stroke="#8c4a2f" strokeWidth="0.4" filter="url(#pact-lb1)" />
        <ellipse cx="680" cy="2380" rx="48" ry="6" fill="none" stroke="#8c4a2f" strokeWidth="0.35" filter="url(#pact-lb1)" />
      </g>
    </svg>
  );
}

export function Parchment({
  long = false,
  folio,
  labelledBy,
  children,
}: {
  long?: boolean;
  folio: string;
  labelledBy?: string;
  children: ReactNode;
}) {
  const p = strings.content.pact;
  return (
    <section className={long ? `${s.parchment} ${s.parchmentLong}` : s.parchment} aria-labelledby={labelledBy}>
      <div className={s.edges} aria-hidden="true" />
      {long ? <LongCrinkles /> : <HeroCrinkles />}
      <div className={s.cornerMark} aria-hidden="true">
        {p.cornerMark}
        <span className={s.markRule} />
        <span className={s.markSub}>{p.cornerSub}</span>
      </div>
      <div className={s.inner}>{children}</div>
      <div className={s.folio} aria-hidden="true">
        {folio}
      </div>
    </section>
  );
}
