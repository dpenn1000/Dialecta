'use client';

/**
 * The brass reflection bar: the ritual progress indicator for the moments a
 * writer is asked to wait while the engine reads. A wood frame, an inset
 * channel, a brass fill with a travelling shimmer, and a phase line above it
 * that fades between messages.
 *
 * Ported from _recovered-next/lib/theme/dialecta-reflection-bar.jsx (306 lines),
 * which the Council ruled As-is (council/log/2026-09-20-port-or-rewrite.md).
 * What changed, and nothing else did:
 *
 *   1. Typed. `phases` is a readonly array of `ReflectionPhase`.
 *   2. The shimmer keyframes moved from a <style> tag injected into
 *      document.head at mount to src/styles/dialecta-surfaces.css, where
 *      they render on the server with the rest of the page. Same name, same
 *      2.9s sweep, same translateX(-100%) to translateX(210%).
 *   3. The default copy (eyebrow, labels, hold message) moved to
 *      src/strings.ts, so the voice check reads it.
 *
 * The wood-frame gradient and brass fill are the recovered file's own literal
 * stops, kept exactly. They differ slightly from the --wood-grain token (this
 * bar's top stop is #d49050, the token's is #c48040): the bar was the
 * prototype the token was later distilled from, and style.css's own comment
 * says so. Pointing it at the token would flatten the one surface that paints
 * the full plank.
 *
 * Animation strategy, unchanged and worth keeping: the rAF clock writes width
 * and remaining seconds straight to the DOM through refs, off React's render
 * cycle. State is reserved for phase transitions and completion. The
 * recovered docblock records why: earlier state-driven versions stalled when
 * setState-per-frame updates raced parent re-renders.
 *
 * Contract: `phases` and `durationMs` are fused at mount. Pass a module-level
 * constant; to run a different ritual, remount with a new `key`.
 */
import { useEffect, useRef, useState } from 'react';
import { strings } from '@/strings';

export interface ReflectionPhase {
  /** Milliseconds from mount at which this phase's copy takes over. */
  at: number;
  main: string;
  sub: string;
}

export type ReflectionBarSize = 'article' | 'comment';

export interface ReflectionBarProps {
  phases: readonly ReflectionPhase[];
  durationMs?: number;
  /** When true, the status flips to `readyLabel` and the hold message shows until the bar fills. */
  ready?: boolean;
  size?: ReflectionBarSize;
  eyebrow?: string;
  readyLabel?: string;
  readingLabel?: string;
  /** Shown while ready and still filling. `null` omits it. */
  holdMessage?: string | null;
  /** Fires once, when the bar reaches 100%. */
  onComplete?: () => void;
}

const TOKENS = {
  fontDisplay: "var(--font-display, 'Cormorant Garamond', 'Times New Roman', serif)",
  fontReading: "var(--font-reading, 'Source Serif 4', Georgia, serif)",
  fontUI: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
  fontMono: "var(--font-mono, 'DM Mono', 'Courier New', monospace)",
  ledeInk: 'var(--text-lede, #2c2620)',
  textTertiary: 'var(--tertiary, #7a7068)',
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '0.42s',
} as const;

interface SizePreset {
  wrapperMaxWidth: number;
  wrapperPadding: string;
  eyebrowMargin: number;
  mainFontSize: string;
  mainMaxWidth: number;
  mainMinHeight: number;
  mainMargin: number;
  ruleWidth: number;
  ruleMargin: number;
  subFontSize: number;
  subMaxWidth: number;
  subMinHeight: number;
  subMargin: number;
  barOuterPadding: string;
  barInnerHeight: number;
  barLabelFontSize: number;
  timeFontSize: number;
  holdFontSize: number;
}

const SIZE_PRESETS: Record<ReflectionBarSize, SizePreset> = {
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

/** Declared in src/styles/dialecta-surfaces.css. */
const SHIM_NAME = 'dialecta-reflection-bar-shim';

const WOOD_FRAME = [
  'repeating-linear-gradient(91deg,transparent 0px,transparent 9px,rgba(0,0,0,0.042) 9px,rgba(0,0,0,0.042) 10px,transparent 10px,transparent 21px,rgba(255,255,255,0.052) 21px,rgba(255,255,255,0.052) 22px)',
  'repeating-linear-gradient(88deg,transparent 0px,transparent 22px,rgba(0,0,0,0.022) 22px,rgba(0,0,0,0.022) 23px)',
  'linear-gradient(180deg,#d49050 0%,#8a4e1c 36%,#7a3e16 54%,#9a5c28 74%,#c48040 100%)',
].join(',');

const WOOD_FRAME_SHADOW = [
  'inset 0 1px 0 rgba(255,215,90,0.40)',
  'inset 0 -1px 0 rgba(0,0,0,0.40)',
  '0 2px 12px rgba(28,14,2,0.22)',
  '0 1px 3px rgba(28,14,2,0.14)',
].join(',');

const BRASS_FILL =
  'linear-gradient(90deg,#6a3e08 0%,#b87c18 7%,#d4a84a 22%,#eeda68 38%,#faf2a8 48%,#f0d860 55%,#d4a84a 70%,#b07818 86%,#8a5808 100%)';

const SHIMMER =
  'linear-gradient(90deg,transparent 0%,transparent 25%,rgba(255,255,255,0.30) 46%,rgba(255,255,255,0.18) 52%,transparent 74%,transparent 100%)';

/** Index of the last phase whose `at` has passed. */
function phaseAt(phases: readonly ReflectionPhase[], elapsed: number): number {
  for (let i = phases.length - 1; i >= 0; i--) {
    const p = phases[i];
    if (p && elapsed >= p.at) return i;
  }
  return 0;
}

export default function ReflectionBar({
  phases,
  durationMs = 8000,
  ready = false,
  size = 'article',
  eyebrow = strings.reflection.eyebrow,
  readyLabel = strings.reflection.readyLabel,
  readingLabel = strings.reflection.readingLabel,
  holdMessage = strings.reflection.holdMessage,
  onComplete,
}: ReflectionBarProps) {
  const sz = SIZE_PRESETS[size];

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [done, setDone] = useState(false);

  const fillRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef<HTMLSpanElement>(null);

  // Fused at init. The rAF clock reads only from these refs, so a prop
  // identity change after mount cannot disturb the timeline.
  const phasesRef = useRef(phases);
  const durationRef = useRef(durationMs);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Guardrail from the recovered file: say so, once per change, when a
  // consumer mutates the fused props. The bar deliberately does not respond.
  useEffect(() => {
    if (phasesRef.current !== phases || durationRef.current !== durationMs) {
      console.warn(
        '[ReflectionBar] phases or durationMs changed after mount. The timeline is fused at init: pass a module-level reference, or remount with a new key.',
      );
    }
  }, [phases, durationMs]);

  useEffect(() => {
    const fused = phasesRef.current;
    const total = durationRef.current;
    if (fused.length === 0) return;

    const start = performance.now();
    let raf = 0;
    let lastPhase = 0;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(elapsed / total, 1) * 100;

      // Animation-critical writes go straight to the DOM, bypassing React.
      if (fillRef.current) {
        fillRef.current.style.width = `${pct}%`;
      }
      if (remainingRef.current) {
        const r = Math.max(0, Math.ceil((total - elapsed) / 1000));
        remainingRef.current.textContent = r > 0 ? String(r) : '·';
      }

      // Phase transitions are rare and go through React for the fade.
      const next = phaseAt(fused, elapsed);
      if (next !== lastPhase) {
        lastPhase = next;
        setPhaseIdx(next);
        setTextVisible(false);
        if (fadeTimer) clearTimeout(fadeTimer);
        fadeTimer = setTimeout(() => setTextVisible(true), 420);
      }

      if (elapsed < total) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        onCompleteRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  const ph = phasesRef.current[phaseIdx] ?? { main: '', sub: '' };

  return (
    <div
      style={{
        maxWidth: sz.wrapperMaxWidth,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: sz.wrapperPadding,
        position: 'relative',
        zIndex: 2,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          fontFamily: TOKENS.fontMono,
          fontSize: 9.5,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: TOKENS.textTertiary,
          marginBottom: sz.eyebrowMargin,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          fontFamily: TOKENS.fontDisplay,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: sz.mainFontSize,
          lineHeight: 1.45,
          color: TOKENS.ledeInk,
          minHeight: sz.mainMinHeight,
          maxWidth: sz.mainMaxWidth,
          marginBottom: sz.mainMargin,
          opacity: textVisible ? 1 : 0,
          transition: `opacity ${TOKENS.slow} ${TOKENS.ease}`,
        }}
      >
        {ph.main}
      </div>

      <div
        style={{
          width: sz.ruleWidth,
          height: 0.5,
          background: 'rgba(212,168,74,0.42)',
          marginBottom: sz.ruleMargin,
        }}
      />

      <div
        style={{
          fontFamily: TOKENS.fontUI,
          fontWeight: 300,
          fontSize: sz.subFontSize,
          color: TOKENS.textTertiary,
          letterSpacing: '0.02em',
          lineHeight: 1.7,
          minHeight: sz.subMinHeight,
          maxWidth: sz.subMaxWidth,
          marginBottom: sz.subMargin,
          opacity: textVisible ? 1 : 0,
          transition: `opacity ${TOKENS.slow} ${TOKENS.ease}`,
        }}
      >
        {ph.sub}
      </div>

      {/* Wood-frame brass progress bar */}
      <div
        style={{
          width: '100%',
          borderRadius: 5,
          padding: sz.barOuterPadding,
          background: WOOD_FRAME,
          boxShadow: WOOD_FRAME_SHADOW,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: TOKENS.fontMono,
              fontSize: sz.barLabelFontSize,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,222,110,0.5)',
            }}
          >
            {ready ? readyLabel : readingLabel}
          </span>
          <span
            ref={remainingRef}
            style={{
              fontFamily: TOKENS.fontMono,
              fontSize: sz.timeFontSize,
              color: 'rgba(255,222,110,0.45)',
              minWidth: 14,
              textAlign: 'right',
            }}
          >
            {Math.ceil(durationRef.current / 1000)}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: sz.barInnerHeight,
            background: 'rgba(16,6,1,0.75)',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 'inset 0 1.5px 4px rgba(0,0,0,0.72), inset 0 -0.5px 1px rgba(255,190,60,0.07)',
          }}
        >
          <div
            ref={fillRef}
            style={{
              height: '100%',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              width: '0%',
              background: BRASS_FILL,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                background: SHIMMER,
                animation: `${SHIM_NAME} 2.9s ease-in-out infinite`,
              }}
            />
          </div>
        </div>
      </div>

      {ready && !done && holdMessage ? (
        <div
          style={{
            marginTop: 18,
            fontFamily: TOKENS.fontReading,
            fontStyle: 'italic',
            fontSize: sz.holdFontSize,
            color: TOKENS.textTertiary,
            letterSpacing: '0.02em',
          }}
        >
          {holdMessage}
        </div>
      ) : null}
    </div>
  );
}
