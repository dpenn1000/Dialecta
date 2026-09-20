/**
 * dialecta-reflection-bar.jsx
 *
 * The brass reflection bar — a ritual progress indicator used during AI
 * processing moments where the user is asked to wait. Shared across the
 * article editor and (future) the comment private draft mode.
 *
 * Animation strategy: the rAF clock writes width and remaining-seconds
 * directly to DOM via refs, off React's render cycle. State is reserved
 * for low-frequency events (phase transitions, completion). This keeps
 * the bar resilient against parent re-renders, Strict-Mode invocations,
 * and any other lifecycle interference. Earlier state-driven versions
 * could stall when many setState-per-frame updates raced with parent
 * re-renders.
 *
 * Props:
 *   phases       — required. [{ at: ms, main: string, sub: string }, ...]
 *                  IMPORTANT: pass a stable reference (module-level const).
 *                  A new array each render would restart the animation.
 *   durationMs   — total duration in ms. Default 8000.
 *   ready        — boolean. When true, the bar status flips to readyLabel
 *                  and the holdMessage becomes visible (until progress=1).
 *   size         — 'article' | 'comment'. Default 'article'.
 *   eyebrow      — kicker text above the main line. Default 'Reflection'.
 *   readyLabel   — bar status text when ready. Default 'Ready'.
 *   readingLabel — bar status text when not ready. Default 'Reading'.
 *   holdMessage  — text shown when ready && bar still filling. Pass null
 *                  to omit. Default uses the article-context language.
 */

import { useState, useEffect, useRef } from 'react';

const TOKENS = {
  fontDisplay:  "'Cormorant Garamond', 'Times New Roman', serif",
  fontReading:  "'Source Serif 4', Georgia, serif",
  fontUI:       "'DM Sans', system-ui, sans-serif",
  fontMono:     "'DM Mono', 'Courier New', monospace",
  ledeInk:      '#2c2620',
  textTertiary: '#7a7068',
  ease:         'cubic-bezier(0.4, 0, 0.2, 1)',
  slow:         '0.42s',
};

const SIZE_PRESETS = {
  article: {
    wrapperMaxWidth: 560,
    wrapperPadding: '64px 32px',
    eyebrowMargin: 36,
    mainFontSize: '1.6rem',
    mainMaxWidth: 480,
    mainMinHeight: 64,
    mainMargin: 18,
    ruleWidth: 32,
    ruleMargin: 22,
    subFontSize: 13,
    subMaxWidth: 380,
    subMinHeight: 36,
    subMargin: 48,
    barOuterPadding: '7px 11px 8px',
    barInnerHeight: 11,
    barLabelFontSize: 7.5,
    timeFontSize: 8,
    holdFontSize: 11.5,
  },
  comment: {
    wrapperMaxWidth: 400,
    wrapperPadding: '40px 24px',
    eyebrowMargin: 24,
    mainFontSize: '1.3rem',
    mainMaxWidth: 340,
    mainMinHeight: 56,
    mainMargin: 14,
    ruleWidth: 26,
    ruleMargin: 16,
    subFontSize: 12,
    subMaxWidth: 300,
    subMinHeight: 30,
    subMargin: 32,
    barOuterPadding: '5px 9px 6px',
    barInnerHeight: 9,
    barLabelFontSize: 7,
    timeFontSize: 7.5,
    holdFontSize: 11,
  },
};

const KEYFRAME_ID = 'dialecta-reflection-bar-keyframes';
const SHIM_NAME   = 'dialecta-reflection-bar-shim';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAME_ID)) return;
  const s = document.createElement('style');
  s.id = KEYFRAME_ID;
  s.textContent = `@keyframes ${SHIM_NAME}{0%{transform:translateX(-100%);}100%{transform:translateX(210%);}}`;
  document.head.appendChild(s);
}

export default function ReflectionBar({
  phases,
  durationMs = 8000,
  ready = false,
  size = 'article',
  eyebrow = 'Reflection',
  readyLabel = 'Ready',
  readingLabel = 'Reading',
  holdMessage = 'The reading has arrived. The moment is being held.',
}) {
  const sz = SIZE_PRESETS[size] || SIZE_PRESETS.article;

  const [phaseIdx, setPhaseIdx]   = useState(0);
  const [textVisible, setTextVis] = useState(true);
  const [done, setDone]           = useState(false);

  const fillRef      = useRef(null);
  const remainingRef = useRef(null);

  // Fuse phases and durationMs at init. The rAF clock reads only from these
  // refs, so prop identity changes after mount cannot disturb the timeline.
  // To run a different ritual, the consumer remounts via React's `key` prop.
  const phasesRef   = useRef(phases);
  const durationRef = useRef(durationMs);

  useEffect(() => { ensureKeyframes(); }, []);

  // Guardrail: warn (once per change) if a consumer mutates the fused props
  // after mount. The component intentionally does not respond; surfacing the
  // contract here makes the silent ignore visible during development.
  useEffect(() => {
    if (phasesRef.current !== phases || durationRef.current !== durationMs) {
      // eslint-disable-next-line no-console
      console.warn('[ReflectionBar] phases or durationMs identity changed after mount. The timeline is fused at init — pass a stable (module-level) reference, or use the React `key` prop to remount with new values.');
    }
  }, [phases, durationMs]);

  useEffect(() => {
    const phases = phasesRef.current;
    const durationMs = durationRef.current;
    if (!Array.isArray(phases) || phases.length === 0) return;

    const start = performance.now();
    let raf;
    let lastPhase = 0;
    let fadeTimer = null;

    const tick = () => {
      const e = performance.now() - start;
      const pct = Math.min(e / durationMs, 1) * 100;

      // Animation-critical writes go straight to the DOM, bypassing React.
      if (fillRef.current) {
        fillRef.current.style.width = pct + '%';
      }
      if (remainingRef.current) {
        const r = Math.max(0, Math.ceil((durationMs - e) / 1000));
        remainingRef.current.textContent = r > 0 ? String(r) : '·';
      }

      // Phase transitions (rare) go through React for the fade.
      const next = phases.map((p, i) => ({ ...p, i })).reverse().find(p => e >= p.at)?.i ?? 0;
      if (next !== lastPhase) {
        lastPhase = next;
        setPhaseIdx(next);
        setTextVis(false);
        if (fadeTimer) clearTimeout(fadeTimer);
        fadeTimer = setTimeout(() => setTextVis(true), 420);
      }

      if (e < durationMs) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  const fusedPhases = phasesRef.current;
  const ph = (Array.isArray(fusedPhases) && fusedPhases[phaseIdx]) || { main: '', sub: '' };

  return (
    <div style={{
      maxWidth: sz.wrapperMaxWidth, width: '100%',
      margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center',
      padding: sz.wrapperPadding,
      position: 'relative', zIndex: 2,
    }}>
      <div style={{
        fontFamily: TOKENS.fontMono, fontSize: 9.5, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: TOKENS.textTertiary,
        marginBottom: sz.eyebrowMargin,
      }}>
        {eyebrow}
      </div>

      <div style={{
        fontFamily: TOKENS.fontDisplay, fontStyle: 'italic', fontWeight: 300,
        fontSize: sz.mainFontSize, lineHeight: 1.45,
        color: TOKENS.ledeInk,
        minHeight: sz.mainMinHeight, maxWidth: sz.mainMaxWidth,
        marginBottom: sz.mainMargin,
        opacity: textVisible ? 1 : 0,
        transition: `opacity ${TOKENS.slow} ${TOKENS.ease}`,
      }}>
        {ph.main}
      </div>

      <div style={{
        width: sz.ruleWidth, height: 0.5,
        background: 'rgba(212,168,74,0.42)',
        marginBottom: sz.ruleMargin,
      }}/>

      <div style={{
        fontFamily: TOKENS.fontUI, fontWeight: 300, fontSize: sz.subFontSize,
        color: TOKENS.textTertiary, letterSpacing: '0.02em',
        lineHeight: 1.7, minHeight: sz.subMinHeight, maxWidth: sz.subMaxWidth,
        marginBottom: sz.subMargin,
        opacity: textVisible ? 1 : 0,
        transition: `opacity ${TOKENS.slow} ${TOKENS.ease}`,
      }}>
        {ph.sub}
      </div>

      {/* Wood-frame brass progress bar */}
      <div style={{
        width: '100%',
        borderRadius: 5,
        padding: sz.barOuterPadding,
        background: [
          'repeating-linear-gradient(91deg,transparent 0px,transparent 9px,rgba(0,0,0,0.042) 9px,rgba(0,0,0,0.042) 10px,transparent 10px,transparent 21px,rgba(255,255,255,0.052) 21px,rgba(255,255,255,0.052) 22px)',
          'repeating-linear-gradient(88deg,transparent 0px,transparent 22px,rgba(0,0,0,0.022) 22px,rgba(0,0,0,0.022) 23px)',
          'linear-gradient(180deg,#d49050 0%,#8a4e1c 36%,#7a3e16 54%,#9a5c28 74%,#c48040 100%)',
        ].join(','),
        boxShadow: [
          'inset 0 1px 0 rgba(255,215,90,0.40)',
          'inset 0 -1px 0 rgba(0,0,0,0.40)',
          '0 2px 12px rgba(28,14,2,0.22)',
          '0 1px 3px rgba(28,14,2,0.14)',
        ].join(','),
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 6,
        }}>
          <span style={{
            fontFamily: TOKENS.fontMono, fontSize: sz.barLabelFontSize, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(255,222,110,0.5)',
          }}>
            {ready ? readyLabel : readingLabel}
          </span>
          <span
            ref={remainingRef}
            style={{
              fontFamily: TOKENS.fontMono, fontSize: sz.timeFontSize,
              color: 'rgba(255,222,110,0.45)',
              minWidth: 14, textAlign: 'right',
            }}
          >
            {Math.ceil(durationRef.current / 1000)}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: sz.barInnerHeight, background: 'rgba(16,6,1,0.75)',
          borderRadius: 2, overflow: 'hidden',
          boxShadow: 'inset 0 1.5px 4px rgba(0,0,0,0.72), inset 0 -0.5px 1px rgba(255,190,60,0.07)',
        }}>
          <div
            ref={fillRef}
            style={{
              height: '100%', borderRadius: 2,
              position: 'relative', overflow: 'hidden',
              width: '0%',
              background: 'linear-gradient(90deg,#6a3e08 0%,#b87c18 7%,#d4a84a 22%,#eeda68 38%,#faf2a8 48%,#f0d860 55%,#d4a84a 70%,#b07818 86%,#8a5808 100%)',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, width: '100%',
              background: 'linear-gradient(90deg,transparent 0%,transparent 25%,rgba(255,255,255,0.30) 46%,rgba(255,255,255,0.18) 52%,transparent 74%,transparent 100%)',
              animation: `${SHIM_NAME} 2.9s ease-in-out infinite`,
            }}/>
          </div>
        </div>
      </div>

      {ready && !done && holdMessage && (
        <div style={{
          marginTop: 18,
          fontFamily: TOKENS.fontReading, fontStyle: 'italic',
          fontSize: sz.holdFontSize, color: TOKENS.textTertiary,
          letterSpacing: '0.02em',
        }}>
          {holdMessage}
        </div>
      )}
    </div>
  );
}
