/**
 * dialecta-editor.jsx
 *
 * The Dialecta article editor. Mounts at /write/ via page-write.hbs.
 *
 * The build follows the spec in `Dialecta_Article_Editorial_Template.md`
 * and lifts visual DNA from `dialecta-s11-private-draft-mode.jsx`. The
 * aesthetic register, per project memory: exclusive, honored, elevated,
 * peaceful. Slow transitions, generous whitespace, paper grain texture,
 * brass accents earned at moments of weight.
 *
 * Step 2 of Phase 1C: scaffolding plus the COMPOSE stage, fully working.
 * Other stages render placeholder cards until subsequent steps land.
 *
 * Architecture choices:
 *   - contenteditable + execCommand toolbar (no TipTap dependency)
 *   - Auto-save to localStorage every 10 seconds
 *   - Aesthetic suggestions (Polish formatting) render as read-only
 *     cards. The author applies changes themselves; the AI never edits.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReflectionBar from './dialecta-reflection-bar';
import { TOPIC_LIST as TOPICS } from './topics.js';
import { CartesianMap, TernaryMap, BinaryMap } from './dialecta-opinion-map.jsx';
import OpinionMapCandidatePicker from './dialecta-opinion-map-picker.jsx';
import { useClassifyStream } from './dialecta-classify-stream.js';
import { getTierCapabilities } from './dialecta-tier-capabilities.js';

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS  (lifted from s11; transitions slowed for article cadence)
// ═══════════════════════════════════════════════════════════════════════════

// Canonical paper-grain SVG. Same fractalNoise pattern used on the
// article cards and post body in style.css. Spread alongside bgCard via
// the cardSurface helper below so every card surface in the editor
// reads as the same paper material as the rest of the site.
const PAPER_GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.045'/%3E%3C/svg%3E\")";

const T = {
  // Surfaces
  bgPage:       '#f7f2e8',
  // bgCard moved from #fffdf8 (near-white) to #fbf6ea (light cream) so
  // editor surfaces match --paper from style.css. Combined with the
  // grain SVG below, every card reads as the same paper material as
  // the article cards on / and the article body on a post page.
  bgCard:       '#fbf6ea',
  paperGrain:   PAPER_GRAIN,
  bgSecondary:  '#efe8da',
  bgTertiary:   '#e8dfce',
  bgDark:       '#1c1814',
  darkCard:     '#292b2d',

  // Text
  textPrimary:   '#1c1814',
  textBody:      '#454547',
  proseSlate:    '#5e6066',
  ledeInk:       '#2c2620',
  textSecondary: '#5a5248',
  textTertiary:  '#7a7068',
  textMuted:     '#9a8e80',
  textOnDark:    '#f0ebe0',
  textOnDark2:   '#b8ae9e',

  // Accent
  gold:         '#d4a84a',
  goldBright:   '#e8a830',
  goldPale:     '#f5e8d0',
  amber:        '#b8732a',
  terra:        '#8c4a2f',

  // Borders
  borderLight:  '#e8e0d0',
  borderMedium: '#d8ceb8',

  // Shadows
  shadowSm: '0 1px 4px rgba(28,24,20,0.05)',
  shadowMd: '0 2px 12px rgba(28,24,20,0.07), 0 0 0 0.5px rgba(28,24,20,0.04)',
  shadowLg: '0 4px 24px rgba(28,24,20,0.10), 0 0 0 0.5px rgba(28,24,20,0.04)',

  // Typefaces
  fontDisplay: "'Cormorant Garamond', 'Times New Roman', serif",
  fontReading: "'Source Serif 4', Georgia, serif",
  fontUI:      "'DM Sans', system-ui, sans-serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",

  // Transitions (article cadence: slower than s11's 0.15s)
  ease:        'cubic-bezier(0.4, 0, 0.2, 1)',
  fast:        '0.18s',
  normal:      '0.30s',
  slow:        '0.42s',
};

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE — Stage B.3 (mobile pass for /write/)
// ─────────────────────────────────────────────────────────────────────────
// `useIsDesktop` mirrors the hook in dialecta-profile.jsx — same 1100px
// canonical lg breakpoint, same SSR-safe defaulting. Components opt in
// by calling the hook and conditionally sizing their padding, grids,
// and font sizes. Editor was originally built desktop-only with no
// responsive logic; this is the retrofit.
// ═══════════════════════════════════════════════════════════════════════════

function useIsDesktop(query = "(min-width: 1100px)") {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const handler = (e) => setIsDesktop(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [query]);
  return isDesktop;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIERS  (lifted from s11; the canonical 7 tiers with brightness ladder)
// ═══════════════════════════════════════════════════════════════════════════

const TIERS = {
  forum:  { label: 'The Forum',  top: '#FEFBF0', bot: '#F8F0D8', border: '#E8D080', text: '#6A5410',
            meaning: 'Specific claim, well-supported, engages substance. Strong disagreement is welcome here, if it is about something specific.' },
  spark:  { label: 'The Spark',  top: '#FCF0D8', bot: '#F4D098', border: '#D89438', text: '#6A3C08',
            meaning: 'An interesting idea, underdeveloped. The seed of something good, but stops short.' },
  echo:   { label: 'The Echo',   top: '#EAF0E0', bot: '#C8D8B0', border: '#708848', text: '#38440C',
            meaning: 'Restates the article or a prior position without adding to it.' },
  fog:    { label: 'The Fog',    top: '#DCE0E4', bot: '#B0B8C4', border: '#687488', text: '#2C3848',
            meaning: 'Vague or unclear. Reader cannot determine the core position or argument.' },
  heat:   { label: 'The Heat',   top: '#E89868', bot: '#C46028', border: '#7C2C08', text: '#FCEAD8',
            meaning: 'High emotion, absent or buried claim. Passion without a point.' },
  stance: { label: 'The Stance', top: '#A8483C', bot: '#783028', border: '#401818', text: '#F4D8D0',
            meaning: 'Tribal framing dominant. Identity-signaling overshadows substance.' },
  breach: { label: 'The Breach', top: '#6A1818', bot: '#380808', border: '#200404', text: '#F0C8C8',
            meaning: 'A personal attack on a person, not an idea. The Pact has been broken.' },
};

const TIER_ORDER = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];

// ═══════════════════════════════════════════════════════════════════════════
// STATE MACHINE
// ═══════════════════════════════════════════════════════════════════════════

const S = {
  COMPOSE:     'compose',
  CONSENT:     'consent',
  DECLARE:     'declare',
  POLISH_READ: 'polish_read',  // polish chooser + final re-read; classify runs in background
  REFLECTING:  'reflecting',   // wait-gate; usually skipped if POLISH_READ already collected analysis
  REFLECTION:  'reflection',
  STAGE25:     'stage25',
  RESPOND:     'respond',
  FINAL:       'final',
  POSTED:      'posted',
};

const RAIL_STEPS = [
  { key: 'draft',    label: 'Draft',        stages: [S.COMPOSE, S.CONSENT] },
  { key: 'declare',  label: 'Declare',      stages: [S.DECLARE] },
  { key: 'reflect',  label: 'Reflection',   stages: [S.POLISH_READ, S.REFLECTING, S.REFLECTION] },
  { key: 'stage25',  label: 'Stage 2.5',    stages: [S.STAGE25, S.RESPOND, S.FINAL] },
  { key: 'posted',   label: 'Posted',       stages: [S.POSTED] },
];

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS RAIL
// ═══════════════════════════════════════════════════════════════════════════

function ProgressRail({ stage }) {
  const activeIdx = RAIL_STEPS.findIndex(s => s.stages.includes(stage));
  const isDesktop = useIsDesktop();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: isDesktop ? 14 : 8,
      padding: '14px 16px',
      background: 'linear-gradient(to bottom, #eceae4 0%, #d8d4cc 48%, #eceae4 100%)',
      borderBottom: `1px solid ${T.borderLight}`,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 0 rgba(28,24,20,0.04)',
      // The rail can still exceed mobile width if a stage label is long
      // (e.g., "Reflection") even after we hide the secondary labels.
      // Allow horizontal scroll as a safety net so the active dot is
      // always reachable.
      overflowX: isDesktop ? 'visible' : 'auto',
    }}>
      {RAIL_STEPS.map((s, i) => {
        const passed = i < activeIdx;
        const active = i === activeIdx;
        const dotColor = active ? T.gold : passed ? T.amber : T.borderMedium;
        const labelColor = active ? T.textPrimary : passed ? T.textSecondary : T.textMuted;
        const labelWeight = active ? 500 : 400;
        // On mobile, hide ALL labels except the active step's. Keeps the
        // rail under the viewport width while still telling the author
        // where they are.
        const showLabel = isDesktop || active;

        return (
          <div key={s.key} style={{
            display: 'flex', alignItems: 'center',
            gap: showLabel ? 10 : 0,
            flexShrink: 0,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: dotColor,
              boxShadow: active ? `0 0 0 3px rgba(212,168,74,0.18)` : 'none',
              transition: `all ${T.normal} ${T.ease}`,
            }}/>
            {showLabel && (
              <span style={{
                fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: labelColor,
                fontWeight: labelWeight,
                transition: `color ${T.normal} ${T.ease}`,
              }}>
                {s.label}
              </span>
            )}
            {i < RAIL_STEPS.length - 1 && (
              <div style={{
                width: isDesktop ? 24 : 16, height: 0.5,
                background: T.borderMedium,
                marginLeft: 4,
                flexShrink: 0,
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAPER GRAIN OVERLAY  (~0.04 opacity over the page surface)
// ═══════════════════════════════════════════════════════════════════════════

function PaperGrain() {
  return (
    <svg style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', opacity: 0.04, zIndex: 1,
    }} xmlns="http://www.w3.org/2000/svg">
      <filter id="dialecta-editor-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#dialecta-editor-grain)"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROSE EDITOR  (contenteditable + execCommand toolbar)
// ═══════════════════════════════════════════════════════════════════════════

function ToolbarButton({ icon, label, onClick, active }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={label}
      aria-label={label}
      style={{
        background: active ? T.goldPale : hover ? 'rgba(232,224,208,0.5)' : 'transparent',
        border: `1px solid ${active ? T.amber : 'transparent'}`,
        borderRadius: 4,
        padding: '6px 10px',
        cursor: 'pointer',
        fontFamily: T.fontMono,
        fontSize: 11, fontWeight: 500,
        color: active ? T.amber : T.textSecondary,
        letterSpacing: '0.04em',
        minWidth: 28,
        transition: `all ${T.fast} ${T.ease}`,
      }}>
      {icon}
    </button>
  );
}

function ProseEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // One-way sync from prop to DOM only on initial mount, to avoid wiping
  // the cursor while the user types. Subsequent state lives in the DOM.
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML && value) {
      ref.current.innerHTML = value;
      setIsEmpty(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    const html = ref.current?.innerHTML ?? '';
    const text = ref.current?.innerText ?? '';
    setIsEmpty(text.trim().length === 0);
    onChange(html);
  }, [onChange]);

  // Keep paste clean: strip rich formatting; keep only plain text.
  // Authors get formatting via the toolbar; pasted HTML can carry foreign
  // styles that muddy the look.
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    document.execCommand('insertText', false, text);
  }, []);

  const exec = useCallback((command, arg) => {
    document.execCommand(command, false, arg);
    handleInput();
    ref.current?.focus();
  }, [handleInput]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
        padding: '8px 12px',
        backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
        border: `1px solid ${T.borderLight}`,
        borderRadius: 4,
      }}>
        <ToolbarButton icon="H2" label="Section header (H2)"     onClick={() => exec('formatBlock', 'h2')} />
        <ToolbarButton icon="H3" label="Sub-section header (H3)" onClick={() => exec('formatBlock', 'h3')} />
        <div style={{ width: 1, height: 16, background: T.borderLight, margin: '0 6px' }}/>
        <ToolbarButton icon={<strong>B</strong>} label="Bold"   onClick={() => exec('bold')} />
        <ToolbarButton icon={<em>I</em>}         label="Italic" onClick={() => exec('italic')} />
        <div style={{ width: 1, height: 16, background: T.borderLight, margin: '0 6px' }}/>
        <ToolbarButton icon="•"  label="Bulleted list" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton icon="¶"  label="Plain paragraph (clears heading or list)" onClick={() => exec('formatBlock', 'p')} />
      </div>

      {/* Editing surface */}
      <div style={{ position: 'relative' }}>
        {isEmpty && (
          <div style={{
            position: 'absolute', top: 24, left: 28,
            pointerEvents: 'none',
            fontFamily: T.fontReading, fontSize: '1.1rem',
            color: T.textMuted, fontStyle: 'italic',
            lineHeight: 1.7,
          }}>
            {placeholder}
          </div>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          onPaste={handlePaste}
          spellCheck
          style={{
            minHeight: 480,
            padding: '24px 28px',
            backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 4,
            fontFamily: T.fontReading, fontSize: '1.1rem',
            lineHeight: 1.75,
            color: T.textBody,
            outline: 'none',
            transition: `border-color ${T.normal} ${T.ease}, box-shadow ${T.normal} ${T.ease}`,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = T.amber;
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,115,42,0.08)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = T.borderLight;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAG PICKER  (primary fixed 12, secondary open free-text)
// ═══════════════════════════════════════════════════════════════════════════

function TagPicker({ primary, secondary, onPrimaryChange, onSecondaryChange }) {
  const [secondaryDraft, setSecondaryDraft] = useState('');

  const addSecondary = () => {
    const t = secondaryDraft.trim();
    if (!t) return;
    if (secondary.some(s => s.toLowerCase() === t.toLowerCase())) {
      setSecondaryDraft('');
      return;
    }
    onSecondaryChange([...secondary, t]);
    setSecondaryDraft('');
  };

  const removeSecondary = (tag) => {
    onSecondaryChange(secondary.filter(t => t !== tag));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Primary topic */}
      <div>
        <Label>Primary topic</Label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 8,
        }}>
          {TOPICS.map(t => {
            const selected = primary?.slug === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => onPrimaryChange(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: selected ? T.bgCard : 'transparent',
                  border: `1px solid ${selected ? T.amber : T.borderLight}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: selected ? '0 1px 4px rgba(184,115,42,0.12)' : 'none',
                  transition: `all ${T.fast} ${T.ease}`,
                }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: t.color, flexShrink: 0,
                }}/>
                <span style={{
                  fontFamily: T.fontUI, fontSize: 13,
                  color: selected ? T.textPrimary : T.textBody,
                  fontWeight: selected ? 500 : 400,
                }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary tags (open) */}
      <div>
        <Label>Secondary tags <span style={{ color: T.textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional, open)</span></Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {secondary.map(tag => (
            <span key={tag} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: T.goldPale,
              border: `1px solid ${T.borderMedium}`,
              borderRadius: 14,
              fontFamily: T.fontUI, fontSize: 11,
              color: T.textBody,
            }}>
              {tag}
              <button
                type="button"
                onClick={() => removeSecondary(tag)}
                style={{
                  background: 'none', border: 'none',
                  padding: 0, margin: 0,
                  fontSize: 14, color: T.textTertiary,
                  cursor: 'pointer', lineHeight: 1,
                }}
                aria-label={`Remove ${tag}`}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={secondaryDraft}
            onChange={(e) => setSecondaryDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSecondary(); } }}
            placeholder="Add a tag, then Enter"
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
              border: `1px solid ${T.borderLight}`,
              borderRadius: 4,
              fontFamily: T.fontUI, fontSize: 13,
              color: T.textBody,
              outline: 'none',
              transition: `border-color ${T.fast} ${T.ease}`,
            }}
            onFocus={(e) => { e.target.style.borderColor = T.amber; }}
            onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
          />
          <button
            type="button"
            onClick={addSecondary}
            disabled={!secondaryDraft.trim()}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${T.borderMedium}`,
              borderRadius: 4,
              fontFamily: T.fontUI, fontSize: 12,
              color: T.textSecondary,
              cursor: secondaryDraft.trim() ? 'pointer' : 'not-allowed',
              opacity: secondaryDraft.trim() ? 1 : 0.5,
              transition: `all ${T.fast} ${T.ease}`,
            }}>
            Add
          </button>
        </div>
        <div style={{
          marginTop: 10,
          fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.04em',
          color: T.textTertiary,
        }}>
          Tag missing from primary list?{' '}
          <a href="/suggestions/" style={{ color: T.amber, textDecoration: 'none' }}>
            Submit a request
          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LABEL  (uppercase mono section heading, ceremonial)
// ═══════════════════════════════════════════════════════════════════════════

function Label({ children, color = T.amber }) {
  return (
    <div style={{
      fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      marginBottom: 12,
      fontWeight: 500,
    }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-SAVE INDICATOR  (subtle italic mono in the footer)
// ═══════════════════════════════════════════════════════════════════════════

function AutoSaveIndicator({ savedAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!savedAt) {
    return (
      <div style={{
        fontFamily: T.fontMono, fontSize: 10, color: T.textMuted,
        fontStyle: 'italic', letterSpacing: '0.03em',
      }}>
        not yet saved
      </div>
    );
  }

  const seconds = Math.floor((now - savedAt) / 1000);
  const label = seconds < 5
    ? 'saved just now'
    : seconds < 60
      ? `saved ${seconds} seconds ago`
      : `saved ${Math.floor(seconds / 60)} minutes ago`;

  return (
    <div style={{
      fontFamily: T.fontMono, fontSize: 10, color: T.textTertiary,
      fontStyle: 'italic', letterSpacing: '0.03em',
    }}>
      {label}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AESTHETIC SUGGESTIONS PANEL
// ═══════════════════════════════════════════════════════════════════════════

function AestheticSuggestionsPanel({ result, loading, error, onClose, onAcceptAll }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        marginTop: 24,
        padding: '24px 28px',
        background: T.goldPale,
        borderLeft: `3px solid ${T.amber}`,
        borderRadius: '0 4px 4px 0',
      }}>
        <Label>Polish formatting</Label>
        <div style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: '1.05rem', color: T.textBody, lineHeight: 1.6,
        }}>
          Reading your draft for visual rhythm. One moment.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        marginTop: 24,
        padding: '20px 24px',
        backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
        border: `1px solid ${T.borderLight}`,
        borderLeft: `3px solid ${T.terra}`,
        borderRadius: '0 4px 4px 0',
      }}>
        <Label color={T.terra}>Polish formatting</Label>
        <div style={{ fontFamily: T.fontReading, fontSize: 14, color: T.textBody }}>
          The aesthetic engine could not respond. {error}
        </div>
        <button onClick={onClose} style={ghostButtonStyle}>Dismiss</button>
      </div>
    );
  }

  if (!result) return null;

  const { suggestions = [], overall_note, polished_html } = result;
  const canApply = suggestions.length > 0 && typeof polished_html === 'string' && polished_html.trim().length > 0;

  return (
    <div style={{
      marginTop: 28,
      padding: '24px 28px',
      background: T.goldPale,
      borderLeft: `3px solid ${T.amber}`,
      borderRadius: '0 4px 4px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Label>Polish formatting</Label>
        <button onClick={onClose} style={ghostButtonStyle}>Dismiss</button>
      </div>

      {overall_note && (
        <div style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: '1.05rem', color: T.textBody, lineHeight: 1.65,
          marginBottom: suggestions.length > 0 ? 22 : 0,
        }}>
          {overall_note}
        </div>
      )}

      {canApply && onAcceptAll && (
        <div style={{
          marginBottom: 22,
          padding: '14px 16px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderLeft: `2px solid ${T.amber}`,
          borderRadius: '0 4px 4px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{
              fontFamily: T.fontUI, fontSize: 13, fontWeight: 500,
              color: T.textPrimary, marginBottom: 3,
            }}>
              Apply polish
            </div>
            <div style={{
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: 12, color: T.textSecondary, lineHeight: 1.5,
            }}>
              Replaces your draft with the polished version. Your words are preserved; only structure and emphasis change.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setPreviewOpen(o => !o)}
              style={ghostButtonStyle}>
              {previewOpen ? 'Hide preview' : 'Preview'}
            </button>
            <button
              onClick={() => onAcceptAll(polished_html)}
              style={{
                ...ghostButtonStyle,
                background: T.amber,
                borderColor: T.amber,
                color: T.bgCard,
                fontWeight: 500,
                padding: '6px 16px',
              }}>
              Apply polish
            </button>
          </div>
        </div>
      )}

      {canApply && previewOpen && (
        <div style={{
          marginBottom: 22,
          padding: '20px 22px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderRadius: 4,
          maxHeight: 360,
          overflowY: 'auto',
        }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: T.amber,
            marginBottom: 12,
          }}>
            Polished preview
          </div>
          <div
            style={{
              fontFamily: T.fontReading, fontSize: 14.5,
              color: T.textBody, lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: polished_html }}
          />
        </div>
      )}

      {!canApply && suggestions.length > 0 && (
        <div style={{
          marginBottom: 22,
          padding: '12px 16px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderLeft: `2px solid ${T.textTertiary}`,
          borderRadius: '0 4px 4px 0',
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12.5, color: T.textSecondary, lineHeight: 1.55,
        }}>
          The engine described what would help but did not produce a clean polished version. Use the suggestions below as a guide and edit by hand.
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{
              padding: '14px 18px',
              backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
              border: `1px solid ${T.borderLight}`,
              borderRadius: 4,
            }}>
              <div style={{
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: T.amber,
                marginBottom: 6,
              }}>
                {s.type?.replace(/_/g, ' ')}
              </div>
              {s.anchor_passage && (
                <div style={{
                  fontFamily: T.fontReading, fontSize: 13, fontStyle: 'italic',
                  color: T.textTertiary, lineHeight: 1.55,
                  marginBottom: 8,
                  paddingLeft: 12, borderLeft: `2px solid ${T.borderMedium}`,
                }}>
                  "{s.anchor_passage}"
                </div>
              )}
              <div style={{
                fontFamily: T.fontUI, fontSize: 13.5,
                color: T.textPrimary, lineHeight: 1.55,
                marginBottom: 6,
              }}>
                {s.suggested_change}
              </div>
              {s.rationale && (
                <div style={{
                  fontFamily: T.fontReading, fontStyle: 'italic',
                  fontSize: 12.5, color: T.textSecondary, lineHeight: 1.55,
                }}>
                  {s.rationale}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ghostButtonStyle = {
  background: 'transparent',
  border: `1px solid ${T.borderMedium}`,
  borderRadius: 3,
  padding: '4px 12px',
  fontFamily: T.fontUI, fontSize: 11,
  color: T.textSecondary,
  cursor: 'pointer',
  flexShrink: 0,
  transition: `all 0.18s ease`,
};

const primaryButtonStyle = {
  background: T.textPrimary,
  color: T.bgPage,
  border: 'none',
  borderRadius: 3,
  padding: '12px 28px',
  fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 500,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: `all ${T.normal} ${T.ease}`,
};

const outlineButtonStyle = {
  background: 'transparent',
  color: T.textPrimary,
  border: `1px solid ${T.textPrimary}`,
  borderRadius: 3,
  padding: '11px 24px',
  fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 500,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: `all ${T.normal} ${T.ease}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE PHOTO  (the optional hero image, one per article)
// ═══════════════════════════════════════════════════════════════════════════

function FeaturePhoto({ url, onChange, memberUuid, apiBase }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState(null);
  const fileInputRef              = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!memberUuid) {
      setError('Sign-in is required to upload a photo.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Image is larger than 3 MB. Please pick a smaller file.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload  = () => resolve(r.result);
        r.onerror = () => reject(new Error('Could not read the selected file.'));
        r.readAsDataURL(file);
      });
      const base64 = String(dataUrl).split(',')[1] || '';
      const res = await fetch(`${apiBase}/api/article/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename:    file.name,
          mime_type:   file.type,
          data:        base64,
          member_uuid: memberUuid,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status}: ${txt.slice(0, 240)}`);
      }
      const json = await res.json();
      if (!json?.url) throw new Error('Upload returned no URL.');
      onChange(json.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [memberUuid, apiBase, onChange]);

  if (url) {
    return (
      <div style={{ marginBottom: 28, position: 'relative' }}>
        <img
          src={url}
          alt="Feature photo"
          style={{
            width: '100%', maxHeight: 420, objectFit: 'cover',
            borderRadius: 4, display: 'block',
            boxShadow: T.shadowMd,
          }}
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove feature photo"
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32,
            border: 'none', borderRadius: '50%',
            background: 'rgba(28,24,20,0.72)',
            color: '#fff', fontSize: 20, lineHeight: 1,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}>
          ×
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <Label>Feature photo, optional</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div
        onClick={uploading ? undefined : () => fileInputRef.current?.click()}
        style={{
          padding: '32px 24px',
          border: `1px dashed ${T.borderMedium}`,
          borderRadius: 4,
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: `all ${T.fast} ${T.ease}`,
        }}>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 14, color: T.textSecondary, lineHeight: 1.5,
        }}>
          {uploading
            ? 'Uploading the photo. One moment.'
            : 'Click to add a feature photo. JPEG, PNG, or WebP, up to 3 MB.'}
        </div>
      </div>
      {error && (
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          borderLeft: `2px solid ${T.terra}`,
          borderRadius: '0 3px 3px 0',
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12.5, color: T.textBody, lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSE STAGE
// ═══════════════════════════════════════════════════════════════════════════

function ComposeStage({ state, setState, onContinue, savedAt, memberUuid }) {
  // Polish v2: server-side at submit-time, no longer a manual button in COMPOSE.
  // Author chooses level on FINAL stage; engine runs invisibly during /api/article/submit.
  const [topicSuggest, setTopicSuggest] = useState({ result: null, loading: false, error: null });

  const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
    ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
    : '';

  const wordCount = state.body_html
    ? state.body_html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
    : 0;
  const canContinue = !!state.title?.trim() && wordCount >= 50 && !!state.primary_tag;

  return (
    <div style={{
      maxWidth: 760, margin: '0 auto', padding: 'clamp(16px, 4vw, 48px) 24px 96px',
      position: 'relative', zIndex: 2,
    }}>
      {/* Section opener */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Label>Stage 1 of 4</Label>
        <h1 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: 'clamp(1.55rem, 4vw + 0.6rem, 2.2rem)', fontWeight: 400,
          color: T.ledeInk, lineHeight: 1.2,
          margin: 0,
        }}>
          Compose
        </h1>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: '1rem', color: T.textSecondary,
          maxWidth: 460, margin: '12px auto 0', lineHeight: 1.6,
        }}>
          Write freely. Voice and intent are yours. Reflection comes after.
        </div>
      </div>

      {/* Feature photo (optional) */}
      <FeaturePhoto
        url={state.feature_image}
        onChange={(url) => setState({ ...state, feature_image: url })}
        memberUuid={memberUuid}
        apiBase={apiBase}
      />

      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <Label>Title</Label>
        <input
          type="text"
          value={state.title || ''}
          onChange={(e) => setState({ ...state, title: e.target.value })}
          placeholder="A working title is enough. You can refine it later."
          style={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 4,
            fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 500,
            color: T.textPrimary,
            outline: 'none',
            transition: `border-color ${T.normal} ${T.ease}, box-shadow ${T.normal} ${T.ease}`,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = T.amber;
            e.target.style.boxShadow = '0 0 0 3px rgba(184,115,42,0.08)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = T.borderLight;
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Body editor */}
      <div style={{ marginBottom: 32 }}>
        <Label>Body</Label>
        <ProseEditor
          value={state.body_html}
          onChange={(html) => setState({ ...state, body_html: html })}
          placeholder="Begin writing. The article wants its own pace."
        />
      </div>

      {/* Tags + suggest button */}
      <div style={{ marginTop: 40, marginBottom: 36 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginBottom: 16, flexWrap: 'wrap',
        }}>
          <Label>Topics</Label>
          <button
            type="button"
            onClick={async () => {
              if (!state.body_html || state.body_html.length < 200) {
                setTopicSuggest({ loading: false, result: null, error: 'Article needs at least 200 characters before topics can be suggested.' });
                return;
              }
              setTopicSuggest({ loading: true, result: null, error: null });
              try {
                const res = await fetch(`${apiBase}/api/article/suggest-topics`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ article_html: state.body_html, title: state.title }),
                });
                if (!res.ok) {
                  const txt = await res.text();
                  throw new Error(`${res.status}: ${txt.slice(0, 200)}`);
                }
                const result = await res.json();
                // Auto-apply: set primary, merge unique secondary tags.
                const existingSecondary = state.secondary_tags || [];
                const mergedSecondary = [
                  ...existingSecondary,
                  ...(result.secondary || []).filter(t =>
                    !existingSecondary.some(s => s.toLowerCase() === t.toLowerCase())
                  ),
                ];
                setState({
                  ...state,
                  primary_tag: result.primary,
                  secondary_tags: mergedSecondary,
                });
                setTopicSuggest({ loading: false, result, error: null });
              } catch (err) {
                setTopicSuggest({ loading: false, result: null, error: err.message });
              }
            }}
            disabled={topicSuggest.loading || (state.body_html || '').length < 200}
            style={{
              ...ghostButtonStyle,
              padding: '6px 14px',
              fontSize: 11,
              opacity: (topicSuggest.loading || (state.body_html || '').length < 200) ? 0.5 : 1,
              cursor: (topicSuggest.loading || (state.body_html || '').length < 200) ? 'not-allowed' : 'pointer',
            }}>
            {topicSuggest.loading ? 'Reading…' : 'Suggest topics'}
          </button>
        </div>

        {topicSuggest.result && topicSuggest.result.rationale && (
          <div style={{
            marginBottom: 16,
            padding: '12px 16px',
            background: T.goldPale,
            borderLeft: `3px solid ${T.amber}`,
            borderRadius: '0 4px 4px 0',
            fontFamily: T.fontReading, fontStyle: 'italic',
            fontSize: 13, color: T.textBody, lineHeight: 1.6,
          }}>
            <span style={{
              fontFamily: T.fontMono, fontStyle: 'normal', fontSize: 9,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: T.amber, marginRight: 8,
            }}>
              Suggested
            </span>
            {topicSuggest.result.rationale}
          </div>
        )}

        {topicSuggest.error && (
          <div style={{
            marginBottom: 16,
            fontFamily: T.fontReading, fontStyle: 'italic',
            fontSize: 12.5, color: T.terra, lineHeight: 1.55,
          }}>
            {topicSuggest.error}
          </div>
        )}

        <TagPicker
          primary={state.primary_tag}
          secondary={state.secondary_tags || []}
          onPrimaryChange={(tag) => setState({ ...state, primary_tag: tag })}
          onSecondaryChange={(tags) => setState({ ...state, secondary_tags: tags })}
        />
      </div>

      {/* Footer: word count, auto-save, continue */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, marginTop: 32,
        paddingTop: 24, borderTop: `1px solid ${T.borderLight}`,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.06em',
            color: T.textTertiary,
          }}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
          <AutoSaveIndicator savedAt={savedAt} />
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          style={{
            ...primaryButtonStyle,
            opacity: canContinue ? 1 : 0.4,
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}>
          Continue to reflection
        </button>
      </div>

      {!canContinue && (
        <div style={{
          marginTop: 12, textAlign: 'right',
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12, color: T.textMuted,
        }}>
          {!state.title?.trim() && 'A title is needed. '}
          {wordCount < 50 && 'The body needs at least 50 words. '}
          {!state.primary_tag && 'Choose a primary topic.'}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLACEHOLDER STAGES  (filled in steps 3 through 6)
// ═══════════════════════════════════════════════════════════════════════════

function PlaceholderStage({ name, onBack }) {
  return (
    <div style={{
      maxWidth: 600, margin: '80px auto', padding: 32,
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain, border: `1px solid ${T.borderLight}`,
      borderRadius: 6, textAlign: 'center',
      position: 'relative', zIndex: 2,
    }}>
      <Label>Coming next</Label>
      <h2 style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: '1.6rem', fontWeight: 400,
        color: T.ledeInk, margin: '0 0 12px',
      }}>
        {name}
      </h2>
      <div style={{
        fontFamily: T.fontReading, fontSize: 14, color: T.textSecondary,
        lineHeight: 1.6, marginBottom: 20,
      }}>
        This stage is part of the editor build but is not yet wired up. Step 1C is in progress.
      </div>
      {onBack && (
        <button onClick={onBack} style={outlineButtonStyle}>
          Back to compose
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES  (textarea, tier badge, opinion axes input)
// ═══════════════════════════════════════════════════════════════════════════

const textareaStyle = {
  width: '100%',
  padding: '14px 16px',
  backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
  border: `1px solid ${T.borderLight}`,
  borderRadius: 4,
  fontFamily: T.fontReading, fontSize: '0.98rem',
  color: T.textBody, lineHeight: 1.7,
  outline: 'none',
  resize: 'vertical',
  transition: `border-color ${T.normal} ${T.ease}, box-shadow ${T.normal} ${T.ease}`,
};

function FocusableTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={textareaStyle}
      onFocus={(e) => {
        e.target.style.borderColor = T.amber;
        e.target.style.boxShadow = '0 0 0 3px rgba(184,115,42,0.08)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = T.borderLight;
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

function TierBadge({ tierKey, selected, suggested, onClick }) {
  const tier = TIERS[tierKey];
  if (!tier) return null;
  const ringStyle = selected
    ? { boxShadow: `0 0 0 2px ${T.bgPage}, 0 0 0 4px ${T.gold}` }
    : suggested
      ? { boxShadow: `0 0 0 1px ${T.bgPage}, 0 0 0 2.5px ${T.goldBright}` }
      : {};
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: `linear-gradient(180deg, ${tier.top} 0%, ${tier.bot} 100%)`,
        border: `1px solid ${tier.border}`,
        color: tier.text,
        padding: '10px 16px',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.14em',
        textTransform: 'uppercase', fontWeight: 500,
        transition: `box-shadow ${T.fast} ${T.ease}, transform ${T.fast} ${T.ease}`,
        flexShrink: 0,
        ...ringStyle,
      }}>
      {tier.label}
    </button>
  );
}

const smallInputStyle = {
  padding: '9px 12px',
  background: T.bgPage,
  border: `1px solid ${T.borderLight}`,
  borderRadius: 4,
  fontFamily: T.fontUI, fontSize: 13,
  color: T.textBody,
  outline: 'none',
  transition: `border-color ${T.fast} ${T.ease}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// OPINION MAPS INPUT (multi-map architecture)
// ═══════════════════════════════════════════════════════════════════════════
// The editor manages 0 to 2 self-contained map records. Each record is one of
// three types and carries its own type-specific fields plus an optional
// author_position. Schema (mirrors api/article/submit.js validateMapEntry):
//   ternary:   { type:'ternary',   topic, poles:[a,b,c],            author_position?:{a,b,c} }
//   cartesian: { type:'cartesian', axes:[{topic,axis_a,axis_b}]×2,  author_position?:{x,y}   }
//   binary:    { type:'binary',    topic, axis_a, axis_b,           author_position?:{x}     }
// Multi-map rules: at most 2 entries; at most 1 binary; binary cannot be the
// only map.

const AXIS_LIMITS = {
  topic: { min: 4, max: 28 },
  pole:  { min: 3, max: 20 },
};

function CharCounter({ value, min, max, align = 'right' }) {
  const len = (value || '').length;
  const tooShort = len > 0 && len < min;
  const tooLong  = len > max;
  const color = tooLong  ? '#a32020'
              : tooShort ? T.amber
              : T.textTertiary;
  return (
    <span style={{
      fontFamily: T.fontMono,
      fontSize: 9,
      color,
      letterSpacing: '0.04em',
      textAlign: align,
      minWidth: 32,
      flexShrink: 0,
    }}>
      {len}/{max}
    </span>
  );
}

function isValidMapEntry(map) {
  if (!map || typeof map !== 'object') return false;
  const lim = AXIS_LIMITS;
  const lenOk = (s, lo, hi) => {
    const v = typeof s === 'string' ? s.trim() : '';
    return v.length >= lo && v.length <= hi;
  };
  if (map.type === 'ternary') {
    if (!lenOk(map.topic, lim.topic.min, lim.topic.max)) return false;
    if (!Array.isArray(map.poles) || map.poles.length !== 3) return false;
    return map.poles.every((p) => lenOk(p, lim.pole.min, lim.pole.max));
  }
  if (map.type === 'cartesian') {
    if (!Array.isArray(map.axes) || map.axes.length !== 2) return false;
    return map.axes.every((a) =>
      lenOk(a?.topic,  lim.topic.min, lim.topic.max) &&
      lenOk(a?.axis_a, lim.pole.min,  lim.pole.max)  &&
      lenOk(a?.axis_b, lim.pole.min,  lim.pole.max)
    );
  }
  if (map.type === 'binary') {
    return lenOk(map.topic,  lim.topic.min, lim.topic.max)
        && lenOk(map.axis_a, lim.pole.min,  lim.pole.max)
        && lenOk(map.axis_b, lim.pole.min,  lim.pole.max);
  }
  return false;
}

function blankMapOfType(type) {
  if (type === 'ternary')   return { type: 'ternary',   topic: '', poles: ['', '', ''] };
  if (type === 'cartesian') return { type: 'cartesian', axes: [
    { topic: '', axis_a: '', axis_b: '' },
    { topic: '', axis_a: '', axis_b: '' },
  ] };
  if (type === 'binary')    return { type: 'binary',    topic: '', axis_a: '', axis_b: '' };
  return null;
}

function normalizeRecommendedMap(rec) {
  if (!rec || !rec.type) return null;
  if (rec.type === 'ternary') {
    return {
      type: 'ternary',
      topic: rec.topic || '',
      poles: Array.isArray(rec.poles) && rec.poles.length === 3
        ? [...rec.poles]
        : ['', '', ''],
      ...(rec.author_position ? { author_position: rec.author_position } : {}),
    };
  }
  if (rec.type === 'cartesian') {
    return {
      type: 'cartesian',
      axes: Array.isArray(rec.axes) && rec.axes.length === 2
        ? rec.axes.map((a) => ({
            topic:  a.topic  || '',
            axis_a: a.axis_a || '',
            axis_b: a.axis_b || '',
          }))
        : [
            { topic: '', axis_a: '', axis_b: '' },
            { topic: '', axis_a: '', axis_b: '' },
          ],
      ...(rec.author_position ? { author_position: rec.author_position } : {}),
    };
  }
  if (rec.type === 'binary') {
    return {
      type: 'binary',
      topic:  rec.topic  || '',
      axis_a: rec.axis_a || '',
      axis_b: rec.axis_b || '',
      ...(rec.author_position ? { author_position: rec.author_position } : {}),
    };
  }
  return null;
}

function TensionsDisplay({ tensions }) {
  return (
    <div style={{
      padding: '14px 16px',
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 4,
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: T.amber,
        marginBottom: 10,
      }}>
        Tensions the engine found
      </div>
      {tensions.map((t, i) => (
        <div key={i} style={{
          padding: '8px 0',
          borderBottom: i < tensions.length - 1 ? `1px dashed ${T.borderLight}` : 'none',
        }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: T.textTertiary,
            marginBottom: 3,
          }}>
            {t.name}
          </div>
          <div style={{
            fontFamily: T.fontReading, fontSize: 13, lineHeight: 1.55,
            color: T.textBody,
          }}>
            {t.description}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── OpinionMapCandidatePicker (extracted) ─────────────────────────────
// Lives in ./dialecta-opinion-map-picker.jsx so the post-page admin
// "Re-setup opinion maps" modal can import the same component without
// dragging the editor's full module surface.
//
// The unused PolesPreview / CandidateCard helpers below were kept inline
// during the v2.2.0 picker landing but were extracted alongside. Remove
// dead block below.

function RecommendationsDisplay({ recommendations }) {
  if (!Array.isArray(recommendations) || recommendations.length === 0) return null;
  const summary = recommendations.length === 0 ? 'No map'
    : recommendations.map((r) => r.type).join(' + ');
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(212,168,74,0.08)',
      border: `1px solid rgba(212,168,74,0.32)`,
      borderRadius: 4,
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: T.amber,
        marginBottom: 6,
      }}>
        Engine recommends: {summary}
      </div>
      {recommendations.map((r, i) => r.rationale ? (
        <div key={i} style={{
          fontFamily: T.fontReading, fontSize: 13, lineHeight: 1.55,
          color: T.textBody,
          marginTop: i === 0 ? 0 : 8,
        }}>
          <em style={{ fontStyle: 'italic' }}>Map {i + 1} ({r.type}):</em> {r.rationale}
        </div>
      ) : null)}
    </div>
  );
}

function MapTypeSelector({ currentType, onChange, allowBinary }) {
  const types = [
    { id: 'ternary',   label: 'Ternary',   desc: 'three positions, weighted blend' },
    { id: 'cartesian', label: 'Cartesian', desc: 'two independent dimensions' },
    ...(allowBinary ? [{ id: 'binary', label: 'Binary', desc: 'one continuum (secondary only)' }] : []),
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${types.length}, 1fr)`,
      gap: 8,
      marginBottom: 12,
    }}>
      {types.map((t) => {
        const active = currentType === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              padding: '12px 10px',
              backgroundColor: active ? 'rgba(212,168,74,0.10)' : T.bgCard,
              backgroundImage: T.paperGrain,
              border: active ? `1.5px solid ${T.amber}` : `1px solid ${T.borderLight}`,
              borderRadius: 4,
              cursor: 'pointer',
              textAlign: 'left',
              transition: `all ${T.fast || '120ms'} ${T.ease || 'ease'}`,
            }}
          >
            <div style={{
              fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 500,
              color: active ? T.amber : T.ink, lineHeight: 1.2,
              marginBottom: 4,
            }}>
              {t.label}
            </div>
            <div style={{
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: 11, color: T.textTertiary, lineHeight: 1.4,
            }}>
              {t.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TernaryFields({ map, onChange }) {
  const safe = map || { type: 'ternary', topic: '', poles: ['', '', ''] };
  const safePoles = Array.isArray(safe.poles) && safe.poles.length === 3
    ? safe.poles
    : ['', '', ''];
  const setTopic = (v) => onChange({ ...safe, type: 'ternary', topic: v, poles: safePoles });
  const setPole  = (i, v) => {
    const next = [...safePoles];
    next[i] = v;
    onChange({ ...safe, type: 'ternary', topic: safe.topic || '', poles: next });
  };
  const labels = ['Top vertex', 'Bottom-left vertex', 'Bottom-right vertex'];
  return (
    <div style={{
      padding: '14px',
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 4,
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 12.5, color: T.textTertiary, lineHeight: 1.55,
        marginBottom: 12,
      }}>
        One topic, three poles that trade off (a reader can hold any one strongly only by holding the others less).
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: T.textTertiary,
          minWidth: 44,
        }}>
          Topic
        </span>
        <input
          type="text"
          value={safe.topic || ''}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="The conceptual question (e.g., What grounds meaning)"
          maxLength={AXIS_LIMITS.topic.max}
          style={{ ...smallInputStyle, flex: 1 }}
          onFocus={(e) => { e.target.style.borderColor = T.amber; }}
          onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
        />
        <CharCounter value={safe.topic} min={AXIS_LIMITS.topic.min} max={AXIS_LIMITS.topic.max} />
      </div>
      {safePoles.map((pole, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: i < 2 ? 8 : 0,
        }}>
          <span style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: T.textTertiary,
            minWidth: 110,
          }}>
            {labels[i]}
          </span>
          <input
            type="text"
            value={pole || ''}
            onChange={(e) => setPole(i, e.target.value)}
            placeholder="Pole name"
            maxLength={AXIS_LIMITS.pole.max}
            style={{ ...smallInputStyle, flex: 1 }}
            onFocus={(e) => { e.target.style.borderColor = T.amber; }}
            onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
          />
          <CharCounter value={pole} min={AXIS_LIMITS.pole.min} max={AXIS_LIMITS.pole.max} />
        </div>
      ))}
    </div>
  );
}

function CartesianFields({ map, onChange }) {
  const safe = map || { type: 'cartesian', axes: [
    { topic: '', axis_a: '', axis_b: '' },
    { topic: '', axis_a: '', axis_b: '' },
  ] };
  const safeAxes = Array.isArray(safe.axes) && safe.axes.length === 2
    ? safe.axes
    : [
        { topic: '', axis_a: '', axis_b: '' },
        { topic: '', axis_a: '', axis_b: '' },
      ];
  const updateAxis = (i, field, value) => {
    const next = [...safeAxes];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...safe, type: 'cartesian', axes: next });
  };
  const dims = [
    { name: 'Horizontal axis', poleA: 'Left pole',  poleB: 'Right pole' },
    { name: 'Vertical axis',   poleA: 'Top pole',   poleB: 'Bottom pole' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 12.5, color: T.textTertiary, lineHeight: 1.55,
      }}>
        Two genuinely independent axes. Moving on one should not predict position on the other.
      </div>
      {safeAxes.map((axis, i) => {
        const dim = dims[i];
        return (
          <div key={i} style={{
            padding: '14px',
            backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 4,
          }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: T.amber,
              marginBottom: 10,
            }}>
              {dim.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: T.textTertiary,
                minWidth: 44,
              }}>
                Topic
              </span>
              <input
                type="text"
                value={axis.topic || ''}
                onChange={(e) => updateAxis(i, 'topic', e.target.value)}
                placeholder="What this axis is about"
                maxLength={AXIS_LIMITS.topic.max}
                style={{ ...smallInputStyle, flex: 1 }}
                onFocus={(e) => { e.target.style.borderColor = T.amber; }}
                onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
              />
              <CharCounter value={axis.topic} min={AXIS_LIMITS.topic.min} max={AXIS_LIMITS.topic.max} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                value={axis.axis_a || ''}
                onChange={(e) => updateAxis(i, 'axis_a', e.target.value)}
                placeholder={dim.poleA}
                maxLength={AXIS_LIMITS.pole.max}
                style={smallInputStyle}
                onFocus={(e) => { e.target.style.borderColor = T.amber; }}
                onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
              />
              <span style={{
                fontFamily: T.fontReading, fontStyle: 'italic',
                fontSize: 13, color: T.textTertiary,
              }}>
                vs
              </span>
              <input
                type="text"
                value={axis.axis_b || ''}
                onChange={(e) => updateAxis(i, 'axis_b', e.target.value)}
                placeholder={dim.poleB}
                maxLength={AXIS_LIMITS.pole.max}
                style={smallInputStyle}
                onFocus={(e) => { e.target.style.borderColor = T.amber; }}
                onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
              />
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              gap: 10, marginTop: 4,
            }}>
              <CharCounter value={axis.axis_a} min={AXIS_LIMITS.pole.min} max={AXIS_LIMITS.pole.max} />
              <span style={{ minWidth: 14 }} />
              <CharCounter
                value={axis.axis_b}
                min={AXIS_LIMITS.pole.min}
                max={AXIS_LIMITS.pole.max}
                align="left"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinaryFields({ map, onChange }) {
  const safe = map || { type: 'binary', topic: '', axis_a: '', axis_b: '' };
  const set = (field, v) => onChange({ ...safe, type: 'binary', [field]: v });
  return (
    <div style={{
      padding: '14px',
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 4,
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 12.5, color: T.textTertiary, lineHeight: 1.55,
        marginBottom: 12,
      }}>
        A continuum between two poles. The reader places themselves anywhere along the line; the middle is a real position. Use only as a secondary map alongside a richer primary.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: T.textTertiary,
          minWidth: 44,
        }}>
          Topic
        </span>
        <input
          type="text"
          value={safe.topic || ''}
          onChange={(e) => set('topic', e.target.value)}
          placeholder="What this continuum is about"
          maxLength={AXIS_LIMITS.topic.max}
          style={{ ...smallInputStyle, flex: 1 }}
          onFocus={(e) => { e.target.style.borderColor = T.amber; }}
          onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
        />
        <CharCounter value={safe.topic} min={AXIS_LIMITS.topic.min} max={AXIS_LIMITS.topic.max} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
        <input
          type="text"
          value={safe.axis_a || ''}
          onChange={(e) => set('axis_a', e.target.value)}
          placeholder="Left pole"
          maxLength={AXIS_LIMITS.pole.max}
          style={smallInputStyle}
          onFocus={(e) => { e.target.style.borderColor = T.amber; }}
          onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
        />
        <span style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 13, color: T.textTertiary,
        }}>
          vs
        </span>
        <input
          type="text"
          value={safe.axis_b || ''}
          onChange={(e) => set('axis_b', e.target.value)}
          placeholder="Right pole"
          maxLength={AXIS_LIMITS.pole.max}
          style={smallInputStyle}
          onFocus={(e) => { e.target.style.borderColor = T.amber; }}
          onBlur={(e) => { e.target.style.borderColor = T.borderLight; }}
        />
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 10, marginTop: 4,
      }}>
        <CharCounter value={safe.axis_a} min={AXIS_LIMITS.pole.min} max={AXIS_LIMITS.pole.max} />
        <span style={{ minWidth: 14 }} />
        <CharCounter
          value={safe.axis_b}
          min={AXIS_LIMITS.pole.min}
          max={AXIS_LIMITS.pole.max}
          align="left"
        />
      </div>
    </div>
  );
}

function MapPreview({ map }) {
  if (!map) return null;
  const previewWrapper = {
    padding: '16px',
    backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
    border: `1px solid ${T.borderLight}`,
    borderRadius: 4,
  };
  const labelStyle = {
    fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: T.textTertiary,
    marginBottom: 10, textAlign: 'center',
  };
  if (map.type === 'ternary') {
    return (
      <div style={previewWrapper}>
        <div style={labelStyle}>Live preview</div>
        <TernaryMap
          poles={map.poles || ['', '', '']}
          topic={map.topic || ''}
          authorPosition={map.author_position || null}
        />
      </div>
    );
  }
  if (map.type === 'cartesian') {
    return (
      <div style={previewWrapper}>
        <div style={labelStyle}>Live preview</div>
        <CartesianMap
          axes={map.axes || []}
          authorPosition={map.author_position || null}
        />
      </div>
    );
  }
  if (map.type === 'binary') {
    return (
      <div style={previewWrapper}>
        <div style={labelStyle}>Live preview</div>
        <BinaryMap
          topic={map.topic || ''}
          axis_a={map.axis_a || ''}
          axis_b={map.axis_b || ''}
          authorPosition={map.author_position || null}
        />
      </div>
    );
  }
  return null;
}

function MapEditor({ map, index, totalMaps, onChange, onRemove }) {
  // Binary is allowed only when this map is NOT the only map (i.e., there
  // is another non-binary map alongside). When only one map is being edited,
  // the binary option is hidden.
  const allowBinary = totalMaps > 1 || index > 0;

  const setMapType = (newType) => {
    if (newType === map?.type) return;
    onChange(blankMapOfType(newType));
  };

  return (
    <div style={{
      marginBottom: 18,
      paddingTop: index > 0 ? 18 : 0,
      borderTop: index > 0 ? `1px dashed ${T.borderLight}` : 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: T.amber,
        }}>
          {totalMaps > 1 ? `Map ${index + 1} of ${totalMaps}` : 'Opinion map'}
        </div>
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'transparent', border: 'none',
            fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.08em',
            color: T.textTertiary, cursor: 'pointer', padding: '4px 8px',
          }}
        >
          remove
        </button>
      </div>
      <MapTypeSelector
        currentType={map?.type || 'ternary'}
        onChange={setMapType}
        allowBinary={allowBinary}
      />
      {map?.type === 'ternary'   && <TernaryFields   map={map} onChange={onChange} />}
      {map?.type === 'cartesian' && <CartesianFields map={map} onChange={onChange} />}
      {map?.type === 'binary'    && <BinaryFields    map={map} onChange={onChange} />}
      <MapPreview map={map} />
    </div>
  );
}

function NoMapsState({ onAddMap }) {
  return (
    <div style={{
      padding: '20px 18px',
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
      border: `1px dashed ${T.borderLight}`,
      borderRadius: 4,
      textAlign: 'center',
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 14, lineHeight: 1.6, color: T.textBody,
      }}>
        This article will publish without an opinion map.
      </div>
      <div style={{
        fontFamily: T.fontReading, fontSize: 12.5, lineHeight: 1.55,
        color: T.textTertiary, marginTop: 6, marginBottom: 14,
      }}>
        Suitable for descriptive pieces, factual reports, or single-claim arguments where readers are not invited to take sides.
      </div>
      <button
        type="button"
        onClick={onAddMap}
        style={{
          padding: '8px 20px',
          background: 'transparent',
          border: `1px solid ${T.amber}`,
          borderRadius: 4,
          fontFamily: T.fontMono, fontSize: 11, letterSpacing: '0.12em',
          color: T.amber, cursor: 'pointer',
          textTransform: 'uppercase',
        }}
      >
        Add an opinion map instead
      </button>
    </div>
  );
}

function AddMapButton({ totalMaps, onAdd }) {
  if (totalMaps >= 2) return null;
  const isFirst  = totalMaps === 0;
  const label    = isFirst ? '+ Add opinion map' : '+ Add second map';
  const subtext  = isFirst
    ? 'Most articles have one map.'
    : 'Most articles have one map. Add a second only if it answers a genuinely different question.';
  return (
    <div style={{ marginTop: 8, marginBottom: 12, textAlign: 'center' }}>
      <button
        type="button"
        onClick={onAdd}
        style={{
          padding: '10px 22px',
          background: 'transparent',
          border: `1px dashed ${T.borderMedium || T.borderLight}`,
          borderRadius: 4,
          fontFamily: T.fontMono, fontSize: 12, letterSpacing: '0.10em',
          color: T.textTertiary, cursor: 'pointer',
        }}
      >
        {label}
      </button>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 11.5, color: T.textTertiary, lineHeight: 1.5,
        marginTop: 6,
      }}>
        {subtext}
      </div>
    </div>
  );
}

function OpinionMapsInput({ maps, onChange, aiTensions, aiCandidateMaps }) {
  const safeMaps   = Array.isArray(maps) ? maps : [];
  const candidates = Array.isArray(aiCandidateMaps) ? aiCandidateMaps : [];
  const hasMultipleCandidates = candidates.length >= 2;

  // The picker is the explicit selection mechanism for multi-candidate
  // responses (skill v2.2.0+). Picker dismissal lets the author choose
  // "build my own" without the picker re-rendering on every state change.
  const [pickerDismissed, setPickerDismissed] = useState(false);
  const showPicker = safeMaps.length === 0 && hasMultipleCandidates && !pickerDismissed;

  // Legacy auto-seed for the single-recommendation path (0 or 1 candidates).
  // When 2+ candidates are present, the picker handles selection explicitly
  // and auto-seed is suppressed.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (safeMaps.length > 0) { seededRef.current = true; return; }
    if (hasMultipleCandidates) return;       // picker owns selection
    if (candidates.length === 0) return;
    seededRef.current = true;
    const seeded = candidates
      .slice(0, 2)
      .map(normalizeRecommendedMap)
      .filter(Boolean);
    if (seeded.length > 0) onChange(seeded);
  }, [candidates, hasMultipleCandidates]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPickerSelect = (chosenMaps) => {
    seededRef.current = true;
    // Picker contract (v2.4): onPick receives an array of 0-2 normalized
    // maps. Empty array means "build my own" (dismiss picker, NoMapsState
    // renders below). Non-empty array seeds MapEditor with the selection.
    if (!Array.isArray(chosenMaps) || chosenMaps.length === 0) {
      setPickerDismissed(true);
      return;
    }
    onChange(chosenMaps);
  };

  const updateMap = (i, updated) => {
    const next = [...safeMaps];
    next[i] = updated;
    onChange(next);
  };

  const removeMap = (i) => {
    onChange(safeMaps.filter((_, idx) => idx !== i));
  };

  const addMap = () => {
    if (safeMaps.length >= 2) return;
    onChange([...safeMaps, blankMapOfType('ternary')]);
  };

  return (
    <div>
      {Array.isArray(aiTensions) && aiTensions.length > 0 && (
        <TensionsDisplay tensions={aiTensions} />
      )}
      {showPicker && (
        <OpinionMapCandidatePicker candidates={candidates} onPick={onPickerSelect} />
      )}
      {!showPicker && !hasMultipleCandidates && candidates.length > 0 && (
        <RecommendationsDisplay recommendations={candidates} />
      )}
      {safeMaps.length === 0 && !showPicker ? (
        <NoMapsState onAddMap={addMap} />
      ) : safeMaps.length > 0 ? (
        safeMaps.map((map, i) => (
          <MapEditor
            key={i}
            map={map}
            index={i}
            totalMaps={safeMaps.length}
            onChange={(updated) => updateMap(i, updated)}
            onRemove={() => removeMap(i)}
          />
        ))
      ) : null}
      {safeMaps.length > 0 && safeMaps.length < 2 && (
        <AddMapButton totalMaps={safeMaps.length} onAdd={addMap} />
      )}
    </div>
  );
}

const accentButtonStyle = {
  background: 'linear-gradient(180deg, #c98a3a, #a06320)',
  color: T.bgCard,
  border: '1px solid rgba(140,74,47,0.5)',
  borderRadius: 3,
  padding: '12px 28px',
  fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 500,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(140,74,47,0.22)',
  transition: `all ${T.normal} ${T.ease}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// BRASS BUTTON  (lifted from page-pact.hbs; reserved for monumental moments)
// ═══════════════════════════════════════════════════════════════════════════

function BrassButton({ children, onClick, disabled, loading }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const baseShadow = 'inset 0 1px 0 rgba(255, 240, 180, 0.65), inset 0 -1px 0 rgba(60, 36, 10, 0.55), inset 1px 0 0 rgba(255, 220, 140, 0.35), inset -1px 0 0 rgba(60, 36, 10, 0.35), 0 1px 0 rgba(255, 240, 180, 0.30), 0 2px 4px rgba(28, 24, 20, 0.28), 0 6px 14px rgba(28, 24, 20, 0.22)';
  const pressedShadow = 'inset 0 1px 2px rgba(60, 36, 10, 0.40), inset 0 -1px 0 rgba(255, 240, 180, 0.30), 0 1px 0 rgba(255, 240, 180, 0.20), 0 1px 2px rgba(28, 24, 20, 0.25)';

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled}
      style={{
        position: 'relative',
        fontFamily: T.fontDisplay,
        fontSize: '1.15rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: '#3a2410',
        padding: '18px 56px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        borderRadius: 3,
        opacity: disabled ? 0.55 : 1,
        background: hover && !pressed
          ? 'linear-gradient(180deg, #7a5620 0%, #ad8430 6%, #e0b452 18%, #f6d884 34%, #f0cc70 50%, #d4a040 66%, #956420 84%, #603e12 100%)'
          : 'linear-gradient(180deg, #6f4e1a 0%, #a07828 6%, #d4a84a 18%, #f0d07a 34%, #e8c366 50%, #c99438 66%, #8c5e1e 84%, #5a3a10 100%)',
        boxShadow: pressed ? pressedShadow : baseShadow,
        textShadow: '0 1px 0 rgba(255, 236, 176, 0.55), 0 -1px 0 rgba(60, 36, 10, 0.35)',
        transform: pressed ? 'translateY(1px)' : 'translateY(0)',
        transition: 'transform 0.08s ease, box-shadow 0.15s ease, filter 0.2s ease, background 0.2s ease',
      }}>
      {loading ? 'Publishing…' : children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FINAL STAGE  (publish summary + the brass button + the API calls)
// ═══════════════════════════════════════════════════════════════════════════

function PublishSummaryCard({ state }) {
  const a = state.ai_analysis || {};
  const declaredTier = state.declared_tier;
  const aiTier = a.ai_suggested_tier;
  const choice = state.stage_2_5_choice;
  const note = state.author_note;

  const choiceLabel = choice === 'amend' ? 'Amended' : choice === 'respond' ? 'Responded for the record' : 'Posted as-is';

  return (
    <div style={{
      padding: '28px 32px',
      background: T.darkCard,
      borderTop: `1px solid rgba(212,168,74,0.28)`,
      borderRadius: 6,
      color: T.textOnDark,
      marginBottom: 36,
      boxShadow: T.shadowMd,
    }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: T.gold,
        marginBottom: 14,
      }}>
        About to publish
      </div>

      <h2 style={{
        fontFamily: T.fontDisplay,
        fontSize: '1.6rem', fontWeight: 500,
        color: T.textOnDark, lineHeight: 1.25,
        margin: '0 0 18px',
      }}>
        {state.title || '(untitled)'}
      </h2>

      <div style={{
        display: 'grid',
        // 120px fixed-label column on desktop reads as a clean ledger.
        // On phones it eats too much width — drop to ~85px so values
        // still have breathing room, gap shrinks too.
        gridTemplateColumns: 'clamp(85px, 22vw, 120px) 1fr',
        gap: '10px clamp(10px, 2vw + 4px, 18px)',
        fontFamily: T.fontUI, fontSize: 13, lineHeight: 1.6,
      }}>
        <div style={{ color: T.textOnDark2, fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Declared
        </div>
        <div style={{ color: T.textOnDark }}>
          {declaredTier && TIERS[declaredTier]
            ? <span style={{ color: TIERS[declaredTier].border }}>{TIERS[declaredTier].label}</span>
            : '—'}
        </div>

        <div style={{ color: T.textOnDark2, fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Engine
        </div>
        <div style={{ color: T.textOnDark }}>
          {aiTier && TIERS[aiTier]
            ? <span style={{ color: TIERS[aiTier].border }}>{TIERS[aiTier].label}</span>
            : '—'}
        </div>

        <div style={{ color: T.textOnDark2, fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Choice
        </div>
        <div style={{ color: T.textOnDark, fontStyle: 'italic' }}>
          {choiceLabel}
        </div>

        {choice === 'respond' && note && (
          <>
            <div style={{ color: T.textOnDark2, fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', alignSelf: 'start' }}>
              Note
            </div>
            <div style={{
              fontFamily: T.fontReading, fontStyle: 'italic',
              color: T.textOnDark, lineHeight: 1.7,
              paddingLeft: 12, borderLeft: `2px solid ${T.gold}`,
            }}>
              "{note}"
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POLISH LEVEL PANEL  (FINAL stage; chooses dress-up intensity)
// ═══════════════════════════════════════════════════════════════════════════

const POLISH_LEVELS = [
  {
    key: 'light',
    label: 'Light',
    tagline: 'Punctuation cleanup only',
    detail: 'Hygiene + structure recognition. Em-dashes become commas/parens. Smart quotes. Section titles tagged correctly. Sources section formatted. Layout cruft stripped. Your prose is otherwise untouched.',
  },
  {
    key: 'standard',
    label: 'Standard',
    tagline: 'Light + recognize section breaks',
    detail: 'Everything in Light, plus conservative thematic-break insertion (the brass ⁂ rule) at clear argument pivots. No content extraction.',
  },
  {
    key: 'editorial',
    label: 'Editorial',
    tagline: 'Standard + active rhythm tools',
    detail: 'Everything in Standard, plus: pullquote extraction (lifts a key sentence into a standalone blockquote), list conversions for parallel paragraphs, and emphasis additions on load-bearing phrases. For long-form pieces that benefit from active design help. Default off.',
  },
  {
    key: 'custom',
    label: 'Custom',
    tagline: 'Pick individual features',
    detail: 'Choose exactly which structural features to apply. Hygiene (em-dash policy, smart quotes, layout cleanup, sources, pseudo-headers) always applies regardless.',
  },
];

// Toggleable features when Custom is selected. Order goes from light to
// heavy intervention so the list reads as a gradient.
const CUSTOM_FEATURES = [
  { key: 'thematic_breaks_conservative', label: 'Thematic breaks at clear pivots',     hint: 'Insert ⁂ rule only at obvious argument turns.' },
  { key: 'thematic_breaks_aggressive',   label: 'Thematic breaks throughout',          hint: 'More frequent ⁂ rules at any pivot.' },
  { key: 'pullquotes',                   label: 'Pullquote extraction',                hint: 'Lift key sentences as standalone blockquotes.' },
  { key: 'list_conversions',             label: 'Convert parallel paragraphs to lists', hint: 'Three or more parallel-structured paragraphs become a <ul>.' },
  { key: 'emphasis_additions',           label: 'Add emphasis to load-bearing phrases', hint: 'Bold or italicize a few key phrases.' },
];

function PolishLevelPanel({ state, setState }) {
  const current = state.polish_level || 'light';
  const customOptions = state.polish_options || {};

  const setLevel = (key) => {
    // Switching levels resets polish_options. Custom starts empty (user
    // explicitly opts each feature in) — they can always pick a preset
    // first, then switch to custom to keep that baseline.
    setState({ ...state, polish_level: key, polish_options: key === 'custom' ? {} : null });
  };

  const toggleFeature = (featureKey) => {
    const next = { ...customOptions, [featureKey]: !customOptions[featureKey] };
    setState({ ...state, polish_level: 'custom', polish_options: next });
  };

  return (
    <div style={{
      marginBottom: 28,
      padding: '20px 24px',
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 6,
    }}>
      <Label>Formatting</Label>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 13, color: T.textSecondary,
        lineHeight: 1.55, marginBottom: 14, maxWidth: 560,
      }}>
        Choose how the engine should dress your article. Hygiene (em-dash policy, smart quotes, layout cleanup) always applies; the levels below add progressively more active formatting.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {POLISH_LEVELS.map(level => {
          const selected = current === level.key;
          return (
            <button
              key={level.key}
              type="button"
              onClick={() => setLevel(level.key)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '12px 16px',
                background: selected ? T.goldPale : 'transparent',
                border: `1px solid ${selected ? T.amber : T.borderLight}`,
                borderRadius: 4,
                textAlign: 'left',
                cursor: 'pointer',
                transition: `all ${T.fast} ${T.ease}`,
                boxShadow: selected ? `0 0 0 1px ${T.amber}` : 'none',
              }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `1.5px solid ${selected ? T.amber : T.borderMedium}`,
                background: selected ? T.amber : 'transparent',
                flexShrink: 0, marginTop: 2,
                position: 'relative',
              }}>
                {selected && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 6, height: 6, borderRadius: '50%',
                    background: T.bgCard,
                  }}/>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: T.fontDisplay, fontSize: '1.05rem', fontWeight: 500,
                  color: T.textPrimary, lineHeight: 1.2, marginBottom: 3,
                }}>
                  {level.label}
                  <span style={{
                    marginLeft: 10,
                    fontFamily: T.fontReading, fontStyle: 'italic', fontWeight: 400,
                    fontSize: 12.5, color: T.textTertiary,
                  }}>
                    {level.tagline}
                  </span>
                </div>
                {selected && (
                  <div style={{
                    fontFamily: T.fontReading, fontSize: 12.5,
                    color: T.textBody, lineHeight: 1.55,
                  }}>
                    {level.detail}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom feature toggles — only when Custom is selected */}
      {current === 'custom' && (
        <div style={{
          marginTop: 14,
          padding: '14px 16px',
          background: T.cream,
          border: `1px solid ${T.borderLight}`,
          borderRadius: 4,
        }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: T.textTertiary, marginBottom: 10,
          }}>
            Optional features
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CUSTOM_FEATURES.map(f => {
              const on = !!customOptions[f.key];
              return (
                <label
                  key={f.key}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: `background ${T.fast} ${T.ease}`,
                  }}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleFeature(f.key)}
                    style={{
                      marginTop: 4, marginLeft: 0,
                      accentColor: T.amber,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: T.fontUI, fontSize: 13, fontWeight: 500,
                      color: T.textPrimary, lineHeight: 1.3,
                    }}>
                      {f.label}
                    </div>
                    <div style={{
                      fontFamily: T.fontReading, fontStyle: 'italic',
                      fontSize: 12, color: T.textTertiary, lineHeight: 1.45,
                      marginTop: 1,
                    }}>
                      {f.hint}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FinalStage({ state, setState, memberUuid, onPublished, onBack }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'submitting' | 'publishing' | 'error'
  const [error, setError] = useState(null);

  const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
    ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
    : '';

  const handlePublish = useCallback(async () => {
    if (!memberUuid) {
      setError('Submission requires a member session. The page-write template should provide your member uuid.');
      setPhase('error');
      return;
    }

    setPhase('submitting');
    setError(null);

    try {
      // Step 1: submit creates Ghost draft + Supabase row.
      const submitResp = await fetch(`${apiBase}/api/article/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:         state.title,
          html:          state.body_html,
          declaration:   state.declaration,
          declared_tier: state.declared_tier,
          member_uuid:   memberUuid,
          feature_image: state.feature_image || null,
          polish_level:  state.polish_level || 'light',
          polish_options: state.polish_options || null,
          tags: [
            ...(state.primary_tag ? [{ slug: state.primary_tag.slug, name: state.primary_tag.label }] : []),
            ...(state.secondary_tags || []).map(t => ({ name: t })),
          ],
        }),
      });

      if (!submitResp.ok) {
        const text = await submitResp.text();
        throw new Error('Submit failed: ' + submitResp.status + ' ' + text.slice(0, 240));
      }
      const submitData = await submitResp.json();

      setState({
        ...state,
        article_id:    submitData.article_id,
        ghost_post_id: submitData.ghost_post_id,
      });

      // Step 2: publish flips draft to published.
      setPhase('publishing');

      const publishResp = await fetch(`${apiBase}/api/article/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ghost_post_id:    submitData.ghost_post_id,
          stage_2_5_choice: state.stage_2_5_choice || 'as_is',
          author_note:      state.author_note || null,
        }),
      });

      if (!publishResp.ok) {
        const text = await publishResp.text();
        throw new Error('Publish failed: ' + publishResp.status + ' ' + text.slice(0, 240));
      }
      const publishData = await publishResp.json();

      onPublished({
        article_id:     submitData.article_id,
        ghost_post_id:  submitData.ghost_post_id,
        ghost_post_url: publishData.ghost_post_url,
      });
    } catch (err) {
      console.error('Publish error:', err);
      setError(err.message);
      setPhase('error');
    }
  }, [state, memberUuid, apiBase, onPublished, setState]);

  const loading = phase === 'submitting' || phase === 'publishing';

  return (
    <div style={{
      maxWidth: 680, margin: '0 auto', padding: 'clamp(16px, 4vw, 48px) 24px 96px',
      position: 'relative', zIndex: 2,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Label color={T.gold}>The publish moment</Label>
        <h1 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: 'clamp(1.55rem, 4vw + 0.6rem, 2.2rem)', fontWeight: 400,
          color: T.ledeInk, lineHeight: 1.2,
          margin: 0,
        }}>
          Publish
        </h1>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: '1rem', color: T.textSecondary,
          maxWidth: 480, margin: '14px auto 0', lineHeight: 1.7,
        }}>
          This is intentional. Publishing here carries weight. We will be ready when you are.
        </div>
      </div>

      <PublishSummaryCard state={state} />

      {/* Polish chooser intentionally removed from FINAL stage 2026-05-03.
          Polish level is now committed in POLISH_READ; FINAL is just
          confirmation + submit. The chosen level is shown in PublishSummaryCard. */}

      {phase === 'error' && error && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderLeft: `3px solid ${T.terra}`,
          borderRadius: '0 4px 4px 0',
          marginBottom: 24,
        }}>
          <Label color={T.terra}>Publish paused</Label>
          <div style={{
            fontFamily: T.fontReading, fontSize: 13.5,
            color: T.textBody, lineHeight: 1.65,
          }}>
            {error}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 18, marginTop: 8, flexWrap: 'wrap',
      }}>
        <button
          onClick={onBack}
          disabled={loading}
          style={{
            ...outlineButtonStyle,
            opacity: loading ? 0.4 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
          {state.stage_2_5_choice === 'respond' ? 'Back to note' : 'Back to options'}
        </button>

        <BrassButton onClick={handlePublish} disabled={loading} loading={loading}>
          Publish
        </BrassButton>
      </div>

      {loading && (
        <div style={{
          marginTop: 24, textAlign: 'center',
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 13, color: T.textTertiary, lineHeight: 1.7,
        }}>
          {phase === 'submitting'
            ? 'Saving the draft and the engine reading. One moment.'
            : 'Releasing to the record.'}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POSTED STAGE  (the quiet aftermath)
// ═══════════════════════════════════════════════════════════════════════════

function PostedStage({ state, postedInfo, onWriteAnother }) {
  const a = state.ai_analysis || {};
  const declaredTier = state.declared_tier;
  const aiTier = a.ai_suggested_tier;
  const finalTier = aiTier; // For MVP, final equals AI; community can shift later.

  return (
    <div style={{
      maxWidth: 600, margin: '0 auto', padding: 'clamp(24px, 8vw, 88px) 24px 96px',
      position: 'relative', zIndex: 2,
      textAlign: 'center',
    }}>
      <Label color={T.gold}>Posted</Label>
      <h1 style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 'clamp(1.7rem, 4.5vw + 0.5rem, 2.4rem)', fontWeight: 400,
        color: T.ledeInk, lineHeight: 1.2,
        margin: '0 0 28px',
      }}>
        It is part of the record now.
      </h1>

      <div style={{
        fontFamily: T.fontReading,
        fontSize: '1.05rem', color: T.textBody, lineHeight: 1.85,
        marginBottom: 36,
        maxWidth: 480, margin: '0 auto 36px',
      }}>
        {state.title || 'Your article'}, by you, was published with the engine's reading disclosed alongside.
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
        marginBottom: 36,
      }}>
        {declaredTier && TIERS[declaredTier] && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: T.textTertiary,
            }}>
              Declared
            </div>
            <TierBadge tierKey={declaredTier} />
          </div>
        )}
        {aiTier && TIERS[aiTier] && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: T.textTertiary,
            }}>
              Engine
            </div>
            <TierBadge tierKey={aiTier} suggested />
          </div>
        )}
        {finalTier && TIERS[finalTier] && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: T.gold,
            }}>
              Community
            </div>
            <TierBadge tierKey={finalTier} selected />
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
        marginBottom: 28,
      }}>
        {postedInfo?.ghost_post_url && (
          <a
            href={postedInfo.ghost_post_url}
            style={{
              ...primaryButtonStyle,
              textDecoration: 'none',
              display: 'inline-block',
            }}>
            View the article
          </a>
        )}
        <button onClick={onWriteAnother} style={outlineButtonStyle}>
          Write another
        </button>
      </div>

      <div style={{
        marginTop: 24,
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 12.5, color: T.textTertiary, lineHeight: 1.7,
      }}>
        The community can now nominate a reclassification. The record stays open.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OPTION CARD  (inline replication of .post-card depressed-with-brass-bar)
// ═══════════════════════════════════════════════════════════════════════════

function OptionCard({ kicker, title, lede, footer, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      role="button"
      tabIndex={0}
      style={{
        position: 'relative',
        background: hover ? 'rgba(232,226,212,0.95)' : 'rgba(247,242,232,0.82)',
        border: `1px solid ${T.borderLight}`,
        borderRadius: 4,
        // Left padding (32) reserves space for the brass bar (width 4) so
        // the bar's appearance on hover does not push content right.
        padding: '28px 28px 26px 32px',
        boxShadow: hover
          ? 'inset 0 2px 8px rgba(28,24,20,0.15), inset 0 1px 3px rgba(28,24,20,0.08)'
          : '0 2px 12px rgba(28,24,20,0.08)',
        transform: hover ? 'scale(0.99)' : 'scale(1)',
        transition: `all ${T.normal} ${T.ease}`,
        cursor: 'pointer',
        overflow: 'hidden',
        outline: 'none',
        height: '100%',
        display: 'flex', flexDirection: 'column',
      }}>
      {/* Brass bar (the .post-card::before, inlined) */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: 4,
        background: 'linear-gradient(to bottom, #8c5a18 0%, #b8862e 20%, #ecb438 38%, #fef0a0 50%, #ecb438 62%, #b8862e 78%, #7a5010 100%)',
        opacity: hover ? 1 : 0,
        transition: `opacity ${T.normal} ${T.ease}`,
        pointerEvents: 'none',
      }}/>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        flex: 1,
      }}>
        {kicker && (
          <div style={{
            fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: hover ? T.amber : T.textTertiary,
            transition: `color ${T.normal} ${T.ease}`,
          }}>
            {kicker}
          </div>
        )}
        <h3 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: '1.4rem', fontWeight: 500,
          color: T.textPrimary, lineHeight: 1.25,
          margin: 0,
        }}>
          {title}
        </h3>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: '0.92rem', color: T.textSecondary, lineHeight: 1.6,
          flex: 1,
        }}>
          {lede}
        </div>
        {footer && (
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: T.textTertiary,
            paddingTop: 12, marginTop: 8,
            borderTop: `1px solid ${T.borderLight}`,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE25  (the three options: Amend, Respond for the Record, Post As-Is)
// ═══════════════════════════════════════════════════════════════════════════

function Stage25({ state, setState, onAmend, onRespond, onAsIs, onBack }) {
  return (
    <div style={{
      maxWidth: 980, margin: '0 auto', padding: 'clamp(16px, 4vw, 48px) 24px 96px',
      position: 'relative', zIndex: 2,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <Label>Stage 4 of 4 · Three options</Label>
        <h1 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: 'clamp(1.55rem, 4vw + 0.6rem, 2.2rem)', fontWeight: 400,
          color: T.ledeInk, lineHeight: 1.2,
          margin: 0,
        }}>
          What now?
        </h1>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: '1rem', color: T.textSecondary,
          maxWidth: 540, margin: '14px auto 0', lineHeight: 1.65,
        }}>
          The engine has spoken. None of these choices is wrong. Take whichever your work and your judgment lead toward.
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 18,
      }}>
        <OptionCard
          kicker="Option A"
          title="Amend"
          lede="Take the engine's reading back to the draft. Edit. Resubmit. The classification re-runs against your revised version."
          footer="Re-edit"
          onClick={onAmend}
        />
        <OptionCard
          kicker="Option B"
          title="Respond for the Record"
          lede="Leave the article as it is. Add a public note saying where you agree or disagree with the engine's reading. Both are visible together."
          footer="Keep, with note"
          onClick={onRespond}
        />
        <OptionCard
          kicker="Option C"
          title="Post As-Is"
          lede="Publish without amendment and without a note. The engine's reading is disclosed alongside the article. The community proceeds with full information."
          footer="Publish unchanged"
          onClick={onAsIs}
        />
      </div>

      <div style={{
        marginTop: 36, paddingTop: 24,
        borderTop: `1px solid ${T.borderLight}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 16, flexWrap: 'wrap',
      }}>
        <button onClick={onBack} style={outlineButtonStyle}>
          Back to reflection
        </button>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12.5, color: T.textTertiary, lineHeight: 1.55,
          maxWidth: 440, textAlign: 'right',
        }}>
          A reasoned disagreement nudges the tier slightly toward your declared position. The engine and the community stay primary.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPOND  (the public note for "Respond for the Record")
// ═══════════════════════════════════════════════════════════════════════════

function RespondStage({ state, setState, onContinue, onBack }) {
  const note = state.author_note || '';
  const valid = note.trim().length >= 20;
  const declaredTier = state.declared_tier;
  const aiTier = state.ai_analysis?.ai_suggested_tier;

  const tierBadgeStyle = (tk) => ({
    display: 'inline-block',
    padding: '6px 12px',
    background: `linear-gradient(180deg, ${TIERS[tk].top} 0%, ${TIERS[tk].bot} 100%)`,
    border: `1px solid ${TIERS[tk].border}`,
    color: TIERS[tk].text,
    borderRadius: 4,
    fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.14em',
    textTransform: 'uppercase', fontWeight: 500,
  });

  return (
    <div style={{
      maxWidth: 660, margin: '0 auto', padding: 'clamp(16px, 4vw, 48px) 24px 96px',
      position: 'relative', zIndex: 2,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Label>Respond for the record</Label>
        <h1 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: 'clamp(1.5rem, 4vw + 0.5rem, 2.1rem)', fontWeight: 400,
          color: T.ledeInk, lineHeight: 1.2,
          margin: 0,
        }}>
          On the record
        </h1>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: '1rem', color: T.textSecondary,
          maxWidth: 480, margin: '14px auto 0', lineHeight: 1.65,
        }}>
          Speak in your own words. Agreement, disagreement, both serve the record. Your note publishes alongside the article.
        </div>
      </div>

      <div style={{
        padding: '20px 24px',
        backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
        border: `1px solid ${T.borderLight}`,
        borderRadius: 6,
        marginBottom: 28,
      }}>
        <Label>Your declared position</Label>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap',
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: T.textTertiary,
            }}>
              You said
            </span>
            {declaredTier && TIERS[declaredTier]
              ? <span style={tierBadgeStyle(declaredTier)}>{TIERS[declaredTier].label}</span>
              : <span style={{ color: T.textTertiary, fontStyle: 'italic' }}>—</span>}
          </div>
          <span style={{
            fontFamily: T.fontReading, fontStyle: 'italic',
            fontSize: 13, color: T.textTertiary, paddingBottom: 8,
          }}>
            ·
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: T.textTertiary,
            }}>
              Engine read
            </span>
            {aiTier && TIERS[aiTier]
              ? <span style={tierBadgeStyle(aiTier)}>{TIERS[aiTier].label}</span>
              : <span style={{ color: T.textTertiary, fontStyle: 'italic' }}>—</span>}
          </div>
        </div>

        <div style={{ paddingTop: 16, borderTop: `1px dashed ${T.borderLight}` }}>
          <div style={{
            fontFamily: T.fontReading, fontStyle: 'italic',
            fontSize: 13, color: T.textBody, lineHeight: 1.6,
            marginBottom: 12,
          }}>
            Stand by your tier, or amend it here. Your note publishes either way.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TIER_ORDER.map(tk => (
              <TierBadge
                key={tk}
                tierKey={tk}
                selected={declaredTier === tk}
                suggested={aiTier === tk}
                onClick={() => setState({ ...state, declared_tier: tk })}
              />
            ))}
          </div>
          {declaredTier && TIERS[declaredTier] && (
            <div style={{
              marginTop: 14, padding: '10px 14px',
              background: T.goldPale, borderLeft: `2px solid ${T.amber}`,
              borderRadius: '0 3px 3px 0',
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: 12.5, color: T.textBody, lineHeight: 1.55,
            }}>
              {TIERS[declaredTier].meaning}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Label>Your note</Label>
        <FocusableTextarea
          value={note}
          onChange={(e) => setState({ ...state, author_note: e.target.value })}
          placeholder="A few sentences are enough. Where do you agree with the engine's reading? Where do you disagree, and why?"
          rows={6}
        />
        <div style={{
          marginTop: 8, textAlign: 'right',
          fontFamily: T.fontMono, fontSize: 10, color: T.textTertiary,
          letterSpacing: '0.04em',
        }}>
          {note.trim().split(/\s+/).filter(Boolean).length} words
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, marginTop: 32, paddingTop: 24,
        borderTop: `1px solid ${T.borderLight}`,
      }}>
        <button onClick={onBack} style={outlineButtonStyle}>
          Back to options
        </button>
        <button
          onClick={onContinue}
          disabled={!valid}
          style={{
            ...primaryButtonStyle,
            opacity: valid ? 1 : 0.55,
            cursor: valid ? 'pointer' : 'not-allowed',
          }}>
          {valid ? 'Continue to publish' : 'Write a note to continue'}
        </button>
      </div>

      {!valid && (
        <div style={{
          marginTop: 14, padding: '10px 14px',
          background: T.goldPale,
          borderLeft: `2px solid ${T.amber}`,
          borderRadius: '0 3px 3px 0',
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 13, color: T.textBody, lineHeight: 1.55,
        }}>
          The note above needs at least a sentence (20+ characters). It publishes alongside the article, so it will be read.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTICLE REFLECTION PHASES  (article-cadence content for the shared bar)
// ═══════════════════════════════════════════════════════════════════════════

// Wait window rebudgeted 2026-05-02 alongside opinion-mapper v2.1.0:
// Opus 4.7 with adaptive thinking applies the skill's seven honesty checks
// against the article and produces structured output. Typical wall time is
// 30-60s for a 7-10K-char article and up to ~180s for a 14K-char article.
// The dual-condition transition (analysisReady AND minTimeElapsed) means
// the author waits at least DURATION_MS before seeing results; long calls
// overflow into a "Ready" hold state until the call completes.
const ARTICLE_REFLECTION_PHASES = [
  { at: 0,     main: 'Reading your words.',
               sub:  'The engine takes the article in line by line.' },
  { at: 9000,  main: 'Finding the question your article puts to readers.',
               sub:  'What stance is a reader being asked to take by the end?' },
  { at: 21000, main: 'Naming the positions a real person could hold.',
               sub:  'The honest names for the stances along that question.' },
  { at: 35000, main: 'Weighing the structure against your declaration.',
               sub:  'Tier, specificity, the engagement with the strongest objection.' },
  { at: 48000, main: 'Letting the moment land.',
               sub:  'The reading is finished. We are not in a hurry.' },
];

const ARTICLE_REFLECTION_DURATION_MS = 55_000;

// ═══════════════════════════════════════════════════════════════════════════
// POLISH-AND-READ STAGE  (the wait-filler: polish chooser + final re-read +
//                         classify running in background via SSE)
// ═══════════════════════════════════════════════════════════════════════════
//
// The author lands here after Declare. classify-stream fires immediately
// with the current article text; polish runs at the default level so the
// preview shows what readers will see; the author re-reads at their pace
// and can iterate the polish level. By the time they click Continue,
// classify has usually finished and we skip past the legacy ReflectingStage
// gate. If they advance early, ReflectingStage handles the brief wait.

// Tier-gate constants are no longer hardcoded — see dialecta-tier-capabilities.js.
// PolishReadStage receives `viewerTier` as a prop and looks up
// max_candidates + polish_runs from the capability matrix per call.
// Defaults to free tier when viewer has no recognized tier.

function htmlToPlaintext(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── StreamStatusIndicator ─────────────────────────────────────────────
// Compact brass status pill at the top of POLISH_READ. Click to expand
// into a feed of summarized model reasoning + a list of identified
// candidates. Designed to be present-but-subtle so the author can focus
// on re-reading without the bar dominating.
function StreamStatusIndicator({ stream }) {
  const [expanded, setExpanded] = useState(false);
  const phaseLabel = (sp) => {
    switch (sp) {
      case 'starting':              return 'Starting';
      case 'thinking':              return 'Engine reasoning';
      case 'writing-output':        return 'Writing analysis';
      case 'candidates-streaming':  return 'Candidates appearing';
      case 'candidates-complete':   return 'All candidates in';
      case 'complete':              return 'Engine ready';
      case 'error':                 return 'Engine paused';
      default:                      return 'Reading article';
    }
  };
  const ready = stream.streamPhase === 'complete' || stream.streamPhase === 'candidates-complete';
  const hasFeed = (stream.thinkingLog && stream.thinkingLog.length > 0)
              || (stream.streamingCandidates && stream.streamingCandidates.length > 0);

  return (
    <div style={{
      marginBottom: 24,
      background: ready ? 'rgba(212,168,74,0.08)' : 'rgba(212,168,74,0.04)',
      border: `1px solid rgba(212,168,74,${ready ? '0.32' : '0.20'})`,
      borderRadius: 5,
      transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)',
    }}>
      <button
        type="button"
        onClick={() => hasFeed && setExpanded(!expanded)}
        disabled={!hasFeed}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%',
          padding: '10px 14px',
          background: 'transparent',
          border: 'none',
          cursor: hasFeed ? 'pointer' : 'default',
          textAlign: 'left',
          font: 'inherit',
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: ready ? T.amber : 'rgba(212,168,74,0.5)',
          boxShadow: ready ? `0 0 0 3px rgba(212,168,74,0.18)` : 'none',
          flexShrink: 0,
        }}/>
        <span style={{
          fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.20em',
          textTransform: 'uppercase', color: T.amber,
        }}>
          {phaseLabel(stream.streamPhase)}
        </span>
        {Array.isArray(stream.streamingCandidates) && stream.streamingCandidates.length > 0 && (
          <span style={{
            fontFamily: T.fontMono, fontSize: 9.5,
            color: T.textTertiary,
          }}>
            · {stream.streamingCandidates.length} candidate{stream.streamingCandidates.length === 1 ? '' : 's'} ready
          </span>
        )}
        <span style={{ flex: 1 }} />
        {hasFeed && (
          <span style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: T.textTertiary,
          }}>
            {expanded ? 'Hide reasoning' : 'Show reasoning'}
          </span>
        )}
      </button>

      {expanded && hasFeed && (
        <div style={{ padding: '4px 14px 14px', borderTop: `1px solid ${T.borderLight}` }}>
          {Array.isArray(stream.streamingCandidates) && stream.streamingCandidates.length > 0 && (
            <div style={{ marginTop: 10, marginBottom: stream.thinkingLog?.length ? 12 : 0 }}>
              <div style={{
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: T.amber,
                marginBottom: 6,
              }}>
                Candidates identified
              </div>
              {stream.streamingCandidates.map((c, i) => {
                const topic = c?.topic
                  || (c?.type === 'cartesian' && c.axes?.[0]?.topic)
                  || '(no topic)';
                return (
                  <div key={i} style={{
                    fontFamily: T.fontDisplay, fontStyle: 'italic',
                    fontSize: 13.5, color: T.ledeInk, padding: '3px 0',
                  }}>
                    <span style={{
                      fontFamily: T.fontMono, fontStyle: 'normal',
                      fontSize: 9, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: T.amber,
                      marginRight: 6,
                    }}>
                      {c?.type}
                    </span>
                    {topic}
                  </div>
                );
              })}
            </div>
          )}
          {Array.isArray(stream.thinkingLog) && stream.thinkingLog.length > 0 && (
            <div>
              <div style={{
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: T.textTertiary,
                marginBottom: 6,
              }}>
                Engine reasoning
              </div>
              <div style={{
                maxHeight: 140, overflowY: 'auto',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.4)',
                border: `1px solid ${T.borderLight}`,
                borderRadius: 3,
                fontFamily: T.fontReading, fontStyle: 'italic',
                fontSize: 12, lineHeight: 1.55,
                color: T.textBody,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {stream.thinkingLog.join('')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ArticlePreview ────────────────────────────────────────────────────
// Renders the polished article HTML in reading-style typography. Shows a
// "Polishing…" overlay while a polish call is in flight.
function ArticlePreview({ html, polishing, polishError }) {
  return (
    <div style={{ position: 'relative' }}>
      {polishing && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,253,248,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5, borderRadius: 6,
        }}>
          <span style={{
            fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: T.amber,
          }}>
            Polishing…
          </span>
        </div>
      )}
      <article
        className="post-content"
        style={{
          padding: '36px 40px',
          background: '#fffdf8',
          backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderLeft: `3px solid rgba(212,168,74,0.45)`,
          borderRadius: 4,
          fontFamily: T.fontReading,
          fontSize: 17, lineHeight: 1.75,
          color: T.textBody,
        }}
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
      {polishError && (
        <div style={{
          marginTop: 10, padding: '8px 12px',
          background: 'rgba(180,90,40,0.06)',
          border: `1px solid rgba(180,90,40,0.25)`,
          borderRadius: 3,
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12.5, color: '#8c4a2f',
        }}>
          Polish call failed: {polishError}. The unpolished version is shown.
        </div>
      )}
    </div>
  );
}

// ─── PolishReadStage ───────────────────────────────────────────────────
// The wait-filler stage. Author lands here right after Declare. Polish
// runs at the chosen level so the preview shows what readers will see;
// classify-stream fires in parallel and surfaces candidates as they're
// identified. Author can iterate the polish level (each Apply costs one
// polish-runs-quota slot when subscriptions land), re-read the polished
// article, and Continue when ready. If they advance before classify
// completes, ReflectingStage handles the brief wait gate.
function PolishReadStage({ state, setState, viewerTier, onComplete, onBack }) {
  const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
    ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
    : '';

  // Tier-derived capabilities. `viewerTier` is undefined or 'free' until
  // the editor's profile fetch resolves; getTierCapabilities() handles
  // both gracefully and falls back to the free matrix.
  const capabilities  = getTierCapabilities(viewerTier);
  const maxCandidates = capabilities.max_candidates;   // null = skill default (no cap)
  const polishQuota   = capabilities.polish_runs;      // 2 (free) or Infinity (pro)

  const articleText = useMemo(() => htmlToPlaintext(state.body_html), [state.body_html]);

  const stream = useClassifyStream({
    enabled: !state.ai_analysis,
    apiBase,
    article_text:    articleText,
    declaration:     state.declaration,
    declared_tier:   state.declared_tier,
    max_candidates:  maxCandidates,
  });

  // Persist the analysis to editor state when stream completes, so a
  // re-mount of this stage skips re-firing classify.
  useEffect(() => {
    if (stream.analysis && !state.ai_analysis) {
      setState({ ...state, ai_analysis: stream.analysis });
    }
  }, [stream.analysis]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polish state lives on the editor's cross-stage state so that
  // navigating Back from POLISH_READ and returning doesn't re-fire
  // auto-polish and burn a quota slot. Only `polishing` and `polishError`
  // are local-transient.
  const polishedHtml    = state.polished_html    || null;
  const appliedLevel    = state.polished_level   || null;
  const appliedOptions  = state.polished_options || null;
  const polishCount     = state.polish_count     || 0;

  const [polishing, setPolishing]     = useState(false);
  const [polishError, setPolishError] = useState(null);

  const quotaExhausted = polishCount >= polishQuota;

  const runPolish = useCallback(async (level, options) => {
    if (polishing) return;
    if (quotaExhausted) return;
    setPolishing(true);
    setPolishError(null);
    try {
      const resp = await fetch(`${apiBase}/api/article/aesthetic-suggest`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          article_html:   state.body_html,
          polish_level:   level,
          polish_options: options || null,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Polish failed (${resp.status}): ${text.slice(0, 200)}`);
      }
      const data = await resp.json();
      setState((prev) => ({
        ...prev,
        polished_html:    data.polished_html || prev.body_html,
        polished_level:   level,
        polished_options: options || null,
        polish_count:     (prev.polish_count || 0) + 1,
      }));
    } catch (err) {
      setPolishError(err.message);
    } finally {
      setPolishing(false);
    }
  }, [apiBase, state.body_html, polishing, quotaExhausted, setState]);

  // Auto-polish on mount only if no polished read exists yet. The ref
  // guards against React Strict Mode's double-mount in dev so we don't
  // fire two polish calls back-to-back.
  const polishStartedRef = useRef(false);
  useEffect(() => {
    if (state.polished_html) return;
    if (polishStartedRef.current) return;
    polishStartedRef.current = true;
    runPolish(state.polish_level || 'light', state.polish_options || null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const polishStale = (state.polish_level !== appliedLevel)
    || (JSON.stringify(state.polish_options || null) !== JSON.stringify(appliedOptions));

  const continueLabel = (state.ai_analysis || stream.analysis)
    ? 'Continue to picker'
    : 'Continue (engine still reading)';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 80px', position: 'relative', zIndex: 2 }}>
      <Label color={T.amber}>Final read</Label>
      <h2 style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: '1.9rem', fontWeight: 400,
        color: T.ledeInk, margin: '6px 0 8px', lineHeight: 1.2,
      }}>
        Read your article in its final form
      </h2>
      <p style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 14, lineHeight: 1.65, color: T.textBody,
        margin: '0 0 22px',
      }}>
        Below is your article exactly as readers will see it, polished at your chosen level. The engine is reading alongside you and assembling candidate framings of the debate. When you are ready to choose a framing, continue.
      </p>

      <StreamStatusIndicator stream={stream} />

      <ArticlePreview
        html={polishedHtml || state.body_html}
        polishing={polishing}
        polishError={polishError}
      />

      <div style={{ marginTop: 36 }}>
        <Label color={T.amber}>Polish level</Label>
        <div style={{ marginTop: 10 }}>
          <PolishLevelPanel state={state} setState={setState} />
        </div>

        <div style={{
          marginTop: 14,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <button
            type="button"
            disabled={!polishStale || polishing || quotaExhausted}
            onClick={() => runPolish(state.polish_level, state.polish_options)}
            style={{
              padding: '8px 18px',
              background: (!polishStale || polishing || quotaExhausted)
                ? 'transparent'
                : `linear-gradient(180deg, #ecb438 0%, #b8862e 65%, #7a4a10 100%)`,
              color: (!polishStale || polishing || quotaExhausted) ? T.textTertiary : '#fffefa',
              border: (!polishStale || polishing || quotaExhausted)
                ? `1px solid ${T.borderLight}`
                : `1px solid #7a4a10`,
              borderRadius: 3,
              fontFamily: T.fontMono, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: (!polishStale || polishing || quotaExhausted) ? 'not-allowed' : 'pointer',
              transition: 'all 140ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {polishing
              ? 'Polishing…'
              : polishStale
                ? 'Apply polish change'
                : 'Polish applied'}
          </button>
          <span style={{
            fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.10em',
            color: T.textTertiary,
          }}>
            {polishQuota === Infinity
              ? `${polishCount} polish run${polishCount === 1 ? '' : 's'} used`
              : `${polishCount} of ${polishQuota} polish runs used`}
          </span>
        </div>

        {/* Tier affordance — only shown for free-tier authors with a
            non-infinite quota. Subtle, informational; no upgrade link
            until /pricing exists (capabilities.upgrade_url is null today). */}
        {polishQuota !== Infinity && capabilities.upgrade_blurb && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(212,168,74,0.05)',
            border: `1px solid rgba(212,168,74,0.18)`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: T.amber,
              flexShrink: 0,
            }}>
              {capabilities.label} tier
            </span>
            <span style={{
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: 12.5, color: T.textBody, lineHeight: 1.5,
              flex: 1, minWidth: 200,
            }}>
              {capabilities.upgrade_blurb}
            </span>
            {/* TUNING: render an actual upgrade link when capabilities.upgrade_url
                is set. Today it's null because /pricing or /upgrade does not
                yet exist. When the tier-system thread adds the upgrade page,
                set the URL in dialecta-tier-capabilities.js and this link
                appears automatically. */}
            {capabilities.upgrade_url && (
              <a
                href={capabilities.upgrade_url}
                style={{
                  fontFamily: T.fontMono, fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: T.amber, textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  flexShrink: 0,
                }}
              >
                Upgrade to Pro
              </a>
            )}
          </div>
        )}
      </div>

      <div style={{
        marginTop: 48,
        paddingTop: 20,
        borderTop: `1px solid ${T.borderLight}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'transparent',
            border: `1px solid ${T.borderLight}`,
            borderRadius: 3,
            padding: '8px 18px',
            fontFamily: T.fontMono, fontSize: 10,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: T.textTertiary,
            cursor: 'pointer',
          }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onComplete(state.ai_analysis || stream.analysis || null)}
          style={{
            ...accentButtonStyle,
            padding: '12px 32px',
          }}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

function ReflectingStage({ state, setState, onComplete, onError, onBack }) {
  const [analysisReady, setAnalysisReady] = useState(false);
  const [error, setError]                 = useState(null);
  const [minTimeElapsed, setMinTime]      = useState(false);
  const analysisRef = useRef(null);

  const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
    ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
    : '';

  // Fast-path: POLISH_READ usually collected the analysis already. If
  // state.ai_analysis is present on mount, transition immediately and
  // skip the full ritual timeline. ReflectingStage now only runs its
  // legacy timeline behavior when an author advances past POLISH_READ
  // before classify completed.
  useEffect(() => {
    if (state.ai_analysis) {
      analysisRef.current = state.ai_analysis;
      setAnalysisReady(true);
      setMinTime(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire the classifier on mount, only if POLISH_READ didn't already
  // collect the analysis.
  useEffect(() => {
    if (state.ai_analysis) return;  // already done by POLISH_READ
    let cancelled = false;
    const article_text = htmlToPlaintext(state.body_html);

    fetch(`${apiBase}/api/article/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_text,
        declaration: state.declaration,
        declared_tier: state.declared_tier,
      }),
    })
      .then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`${r.status}: ${text.slice(0, 200)}`);
        }
        return r.json();
      })
      .then(analysis => {
        if (cancelled) return;
        analysisRef.current = analysis;
        setAnalysisReady(true);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
      });

    // Minimum ritual time — even if API is fast, we honor the pause.
    const minTimer = setTimeout(() => {
      if (!cancelled) setMinTime(true);
    }, ARTICLE_REFLECTION_DURATION_MS);

    return () => { cancelled = true; clearTimeout(minTimer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When BOTH minimum time elapsed AND analysis ready, transition.
  useEffect(() => {
    if (analysisReady && minTimeElapsed && analysisRef.current) {
      setState({ ...state, ai_analysis: analysisRef.current });
      onComplete(analysisRef.current);
    }
  }, [analysisReady, minTimeElapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div style={{
        maxWidth: 540, margin: '80px auto', padding: 32,
        backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
        border: `1px solid ${T.borderLight}`,
        borderLeft: `3px solid ${T.terra}`,
        borderRadius: '0 4px 4px 0',
        textAlign: 'center', position: 'relative', zIndex: 2,
      }}>
        <Label color={T.terra}>Reflection paused</Label>
        <h2 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: '1.5rem', fontWeight: 400,
          color: T.ledeInk, margin: '0 0 14px',
        }}>
          The engine could not respond
        </h2>
        <div style={{
          fontFamily: T.fontReading, fontSize: 14, color: T.textBody,
          lineHeight: 1.65, marginBottom: 22,
        }}>
          {error}
        </div>
        <button onClick={onBack} style={outlineButtonStyle}>
          Back to declaration
        </button>
      </div>
    );
  }

  return (
    <ReflectionBar
      phases={ARTICLE_REFLECTION_PHASES}
      durationMs={ARTICLE_REFLECTION_DURATION_MS}
      ready={analysisReady}
      size="article"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REFLECTION STAGE  (the engine analysis card the author reviews)
// ═══════════════════════════════════════════════════════════════════════════

function AlignmentBadge({ value }) {
  const map = {
    aligned:   { color: '#3aa564', label: 'Aligned'   },
    partial:   { color: T.amber,    label: 'Partial'   },
    divergent: { color: T.terra,    label: 'Divergent' },
  };
  const a = map[value] || { color: T.textTertiary, label: value || '—' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      background: 'rgba(255,253,248,0.6)',
      border: `1px solid ${a.color}`,
      borderRadius: 12,
      fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.14em',
      textTransform: 'uppercase', fontWeight: 500,
      color: a.color,
    }}>
      {a.label}
    </span>
  );
}

function ReflectionStage({ state, onContinue, onBack }) {
  const a = state.ai_analysis || {};
  const declared = state.declared_tier;
  const aiTier = a.ai_suggested_tier;
  const tiersDiffer = declared && aiTier && declared !== aiTier;

  return (
    <div style={{
      maxWidth: 720, margin: '0 auto', padding: 'clamp(16px, 4vw, 48px) 24px 96px',
      position: 'relative', zIndex: 2,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Label>Stage 3 of 4</Label>
        <h1 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: 'clamp(1.55rem, 4vw + 0.6rem, 2.2rem)', fontWeight: 400,
          color: T.ledeInk, lineHeight: 1.2,
          margin: 0,
        }}>
          Reflection
        </h1>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: '1rem', color: T.textSecondary,
          maxWidth: 520, margin: '14px auto 0', lineHeight: 1.65,
        }}>
          The engine has read the article. What follows is its account, not its verdict.
        </div>
      </div>

      {/* Tier card (engine voice, gold-pale + amber bar) */}
      <div style={{
        padding: '24px 28px',
        background: T.goldPale,
        borderLeft: `3px solid ${T.amber}`,
        borderRadius: '0 4px 4px 0',
        marginBottom: 28,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14, flexWrap: 'wrap', marginBottom: 14,
        }}>
          <Label color={T.amber}>Engine reading</Label>
          {tiersDiffer && (
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: T.terra,
              fontStyle: 'italic',
            }}>
              You declared {declared}. The engine reads {aiTier}.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
          {aiTier && TIERS[aiTier] && (
            <TierBadge tierKey={aiTier} suggested />
          )}
          {a.specificity_score !== undefined && (
            <span style={{
              fontFamily: T.fontMono, fontSize: 10, color: T.textTertiary,
              letterSpacing: '0.06em',
            }}>
              Specificity {a.specificity_score} / 3
            </span>
          )}
          {a.alignment && <AlignmentBadge value={a.alignment} />}
        </div>

        {a.tier_reason && (
          <div style={{
            fontFamily: T.fontDisplay, fontStyle: 'italic', fontWeight: 300,
            fontSize: '1.1rem', color: T.textBody, lineHeight: 1.65,
          }}>
            {a.tier_reason}
          </div>
        )}
      </div>

      {/* Engine's claim read + alignment note */}
      {(a.core_claim_detected || a.alignment_note) && (
        <div style={{
          padding: '20px 24px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderTop: `2px solid ${T.goldBright}`,
          borderRadius: 4,
          marginBottom: 24,
        }}>
          <Label>What the engine read</Label>
          {a.core_claim_detected && (
            <div style={{
              fontFamily: T.fontReading,
              fontSize: '0.98rem', color: T.textBody, lineHeight: 1.7,
              marginBottom: 12,
            }}>
              {a.core_claim_detected}
            </div>
          )}
          {a.alignment_note && (
            <div style={{
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: '0.92rem', color: T.textSecondary, lineHeight: 1.65,
              paddingTop: 10, borderTop: `1px solid ${T.borderLight}`,
            }}>
              {a.alignment_note}
            </div>
          )}
        </div>
      )}

      {/* Flagged passages */}
      {Array.isArray(a.flagged_passages) && a.flagged_passages.length > 0 && (
        <div style={{
          padding: '20px 24px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderTop: `2px solid ${T.goldBright}`,
          borderRadius: 4,
          marginBottom: 24,
        }}>
          <Label>Passages noticed</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {a.flagged_passages.map((p, i) => (
              <div key={i} style={{ paddingTop: i > 0 ? 14 : 0, borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {p.tier_pull && TIERS[p.tier_pull] && (
                    <span style={{
                      padding: '3px 10px',
                      background: `linear-gradient(180deg, ${TIERS[p.tier_pull].top}, ${TIERS[p.tier_pull].bot})`,
                      border: `1px solid ${TIERS[p.tier_pull].border}`,
                      borderRadius: 12,
                      fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em',
                      textTransform: 'uppercase', fontWeight: 500,
                      color: TIERS[p.tier_pull].text,
                    }}>
                      Pulls toward {TIERS[p.tier_pull].label.replace('The ', '')}
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: T.fontReading, fontStyle: 'italic',
                  fontSize: '0.95rem', color: T.textBody, lineHeight: 1.65,
                  paddingLeft: 14, borderLeft: `2px solid ${T.borderMedium}`,
                  marginBottom: 8,
                }}>
                  "{p.passage}"
                </div>
                {p.why && (
                  <div style={{
                    fontFamily: T.fontUI, fontSize: 13,
                    color: T.textSecondary, lineHeight: 1.6,
                  }}>
                    {p.why}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Axis suggestions */}
      {Array.isArray(a.axis_suggestions) && a.axis_suggestions.length > 0 && (
        <div style={{
          padding: '20px 24px',
          backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
          border: `1px solid ${T.borderLight}`,
          borderTop: `2px solid ${T.goldBright}`,
          borderRadius: 4,
          marginBottom: 24,
        }}>
          <Label>Where readers might split</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {a.axis_suggestions.map((ax, i) => (
              <div key={i}>
                {ax.topic && (
                  <div style={{
                    fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: T.amber,
                    marginBottom: 4,
                  }}>
                    {ax.topic}
                  </div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  fontFamily: T.fontReading, fontSize: 14,
                  color: T.textBody, lineHeight: 1.5,
                }}>
                  <span>{ax.axis_a}</span>
                  <span style={{ color: T.textTertiary, fontStyle: 'italic', fontSize: 12 }}>vs</span>
                  <span>{ax.axis_b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Author message (Stage 2.5 reflection from engine) */}
      {a.author_message && (
        <div style={{
          padding: '28px 32px',
          background: T.darkCard,
          borderLeft: `3px solid ${T.gold}`,
          borderRadius: '0 6px 6px 0',
          marginBottom: 32,
          marginTop: 8,
        }}>
          <Label color={T.gold}>From the engine to you</Label>
          <div style={{
            fontFamily: T.fontDisplay, fontStyle: 'italic', fontWeight: 300,
            fontSize: '1.2rem', color: T.textOnDark, lineHeight: 1.65,
          }}>
            {a.author_message}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, marginTop: 32, paddingTop: 24,
        borderTop: `1px solid ${T.borderLight}`,
      }}>
        <button onClick={onBack} style={outlineButtonStyle}>
          Back to declare
        </button>
        <button onClick={onContinue} style={primaryButtonStyle}>
          Continue to your three options
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSENT STAGE  (the pause between draft and declaration)
// ═══════════════════════════════════════════════════════════════════════════

function ConsentStage({ onContinue, onBack }) {
  return (
    <div style={{
      maxWidth: 540, margin: '0 auto', padding: 'clamp(24px, 8vw, 88px) 24px 96px',
      position: 'relative', zIndex: 2,
      textAlign: 'center',
    }}>
      <Label>Stage 2 of 4</Label>
      <h1 style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 'clamp(1.7rem, 4.5vw + 0.5rem, 2.4rem)', fontWeight: 400,
        color: T.ledeInk, lineHeight: 1.2, margin: '0 0 36px',
      }}>
        A pause before the declaration
      </h1>

      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: '1.35rem', color: T.textBody, lineHeight: 1.7,
        marginBottom: 28,
      }}>
        The draft is done.
      </div>

      <div style={{
        fontFamily: T.fontReading,
        fontSize: '1.05rem', color: T.textBody, lineHeight: 1.85,
        marginBottom: 22,
        maxWidth: 460, margin: '0 auto 22px',
      }}>
        What follows is reflection. You will declare your claim, hear what the engine notices, and decide how to publish.
      </div>

      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: '1rem', color: T.textSecondary, lineHeight: 1.75,
        marginBottom: 32,
        maxWidth: 460, margin: '0 auto 32px',
      }}>
        Publishing here is unhurried by design.
      </div>

      <div style={{
        fontFamily: T.fontReading,
        fontSize: '0.92rem', color: T.textTertiary, lineHeight: 1.7,
        marginBottom: 56,
        maxWidth: 440, margin: '0 auto 56px',
      }}>
        Your draft is auto-saved. You can step back and refine at any time. Nothing publishes until you choose.
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={outlineButtonStyle}>
          Back to compose
        </button>
        <button onClick={onContinue} style={accentButtonStyle}>
          Continue when you're ready
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARE STAGE  (5 questions in two breaths)
// ═══════════════════════════════════════════════════════════════════════════

// AI hint button — opt-in, surgical. Calls the editor's hint endpoint
// with a `kind` discriminator and the current declaration context. The
// result is shown beneath the button as a single italic paragraph,
// framed as "consider this," not auto-filled into any field. Two
// reasons not to auto-fill: 1) we want authors thinking, not pasting;
// 2) the field is the author's words, not the engine's.
function AiHintButton({ kind, getContext, cta, emptyText, disabled }) {
  const [busy,    setBusy]    = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
    ? window.__DIALECTA_API_URL__.replace(/\/$/, '') : '';

  async function ask() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${apiBase}/api/article/aesthetic-suggest`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ kind, ...getContext() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Hint failed: ${res.status}`);
      setResult(json.suggestion || json.text || '');
    } catch (e) {
      setError(e.message || 'Hint failed.');
    } finally { setBusy(false); }
  }

  if (disabled) {
    return (
      <div style={{
        marginTop: 10, fontFamily: T.fontReading, fontSize: 12,
        fontStyle: 'italic', color: T.textMuted,
      }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={ask}
        disabled={busy}
        style={{
          background: 'transparent',
          border: `1px dashed ${T.amber}`,
          borderRadius: 4,
          padding: '7px 14px',
          fontFamily: T.fontMono, fontSize: 10,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          color: T.amber, cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.6 : 1,
          transition: `all ${T.fast} ${T.ease}`,
        }}>
        {busy ? 'Thinking…' : `✦ ${cta}`}
      </button>

      {error && (
        <div style={{
          marginTop: 10, fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12, color: '#b8372e',
        }}>{error}</div>
      )}

      {result && !error && (
        <div style={{
          marginTop: 10,
          padding: '12px 16px',
          background: T.goldPale,
          border: `1px dashed ${T.amber}`,
          borderRadius: 4,
          fontFamily: T.fontReading, fontSize: 13.5,
          color: T.textBody, lineHeight: 1.65,
          fontStyle: 'italic',
        }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: T.amber, fontStyle: 'normal',
            marginBottom: 6, fontWeight: 500,
          }}>Consider this</div>
          {result}
          <div style={{
            marginTop: 10, paddingTop: 8,
            borderTop: `1px solid rgba(184,134,46,0.25)`,
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: T.textTertiary,
            fontStyle: 'normal',
          }}>
            Think with this — don&rsquo;t paste it. Your words are the ones readers will engage.
          </div>
        </div>
      )}
    </div>
  );
}

function DeclareQuestion({ label, prompt, hint, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <Label>{label}</Label>
      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: '1.2rem', color: T.ledeInk, lineHeight: 1.45,
        marginBottom: 14,
      }}>
        {prompt}
      </div>
      {children}
      {hint /* AI-hint slot — rendered after the input so it sits as a quiet
              afterthought, not a competing CTA. The hint component handles
              its own button + result expand/collapse. */}
    </div>
  );
}

function DeclareStage({ state, setState, onContinue, onBack, memberUuid }) {
  const [breath, setBreath] = useState(1);

  const updateDeclaration = (field, value) => {
    setState({
      ...state,
      declaration: { ...state.declaration, [field]: value },
    });
  };

  const breath1Valid =
    (state.declaration.core_claim || '').trim().length >= 10 &&
    (state.declaration.scope_boundary || '').trim().length >= 10;

  // Multi-map shape contract: 0, 1, or 2 self-contained map entries. Each
  // is one of three types (ternary, cartesian, binary) with type-specific
  // fields. Mirrors api/article/submit.js validateOpinionMaps. "No map"
  // (empty array) is a legitimate publishable state. "Invalid" (e.g. a map
  // mid-edit with empty fields) blocks submission. Binary cannot be the
  // only map.
  const mapsArr = state.declaration.opinion_maps || [];
  const hasValidMaps = (() => {
    if (!Array.isArray(mapsArr)) return false;
    if (mapsArr.length === 0) return true;
    if (mapsArr.length > 2) return false;
    for (const map of mapsArr) {
      if (!isValidMapEntry(map)) return false;
    }
    const binCount = mapsArr.filter((m) => m?.type === 'binary').length;
    if (binCount > 1) return false;
    if (binCount === 1 && mapsArr.length === 1) return false;
    return true;
  })();

  const breath2Valid =
    (state.declaration.strongest_objection || '').trim().length >= 10 &&
    !!state.declared_tier &&
    hasValidMaps;

  return (
    <div style={{
      maxWidth: 700, margin: '0 auto', padding: 'clamp(16px, 4vw, 48px) 24px 96px',
      position: 'relative', zIndex: 2,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Label>Stage 2 of 4 · Declaration {breath} of 2</Label>
        <h1 style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: 'clamp(1.55rem, 4vw + 0.6rem, 2.2rem)', fontWeight: 400,
          color: T.ledeInk, lineHeight: 1.2,
          margin: 0,
        }}>
          Declare
        </h1>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: '1rem', color: T.textSecondary,
          maxWidth: 540, margin: '14px auto 0', lineHeight: 1.65,
        }}>
          {breath === 1
            ? 'What is the article making, and what edges does it set?'
            : 'What is the strongest case against, where does it land, and where might readers split?'}
        </div>
      </div>

      {breath === 1 && (
        <>
          <DeclareQuestion
            label="Core Claim, required"
            prompt="In one or two sentences, what is this article actually arguing?">
            <FocusableTextarea
              value={state.declaration.core_claim || ''}
              onChange={(e) => updateDeclaration('core_claim', e.target.value)}
              placeholder="Your claim, in your own words. The engine will read independently and compare."
              rows={3}
            />
          </DeclareQuestion>

          <DeclareQuestion
            label="Scope Boundary, required"
            prompt="What is this article not arguing? What common misreading do you want to preempt?">
            <FocusableTextarea
              value={state.declaration.scope_boundary || ''}
              onChange={(e) => updateDeclaration('scope_boundary', e.target.value)}
              placeholder="Naming the edge of the argument is itself a sign of clarity."
              rows={3}
            />
          </DeclareQuestion>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, marginTop: 32, paddingTop: 24,
            borderTop: `1px solid ${T.borderLight}`,
          }}>
            <button onClick={onBack} style={outlineButtonStyle}>
              Back
            </button>
            <button
              onClick={() => setBreath(2)}
              disabled={!breath1Valid}
              style={{
                ...primaryButtonStyle,
                opacity: breath1Valid ? 1 : 0.4,
                cursor: breath1Valid ? 'pointer' : 'not-allowed',
              }}>
              Continue to second breath
            </button>
          </div>

          {!breath1Valid && (
            <div style={{
              marginTop: 12, textAlign: 'right',
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: 12, color: T.textMuted,
            }}>
              Both questions need at least a sentence.
            </div>
          )}
        </>
      )}

      {breath === 2 && (
        <>
          <DeclareQuestion
            label="Strongest Objection, required"
            prompt="What is the strongest case against your position? You don't have to agree with it, just name it."
            hint={
              <AiHintButton
                kind="opposing"
                getContext={() => ({
                  core_claim:    state.declaration.core_claim || '',
                  scope_boundary:state.declaration.scope_boundary || '',
                  article_text:  state.body || '',
                  member_uuid:   memberUuid,
                })}
                cta="Suggest a sharper opposing argument"
                emptyText="A core claim is needed first."
                disabled={!(state.declaration.core_claim || '').trim()}
              />
            }>
            <FocusableTextarea
              value={state.declaration.strongest_objection || ''}
              onChange={(e) => updateDeclaration('strongest_objection', e.target.value)}
              placeholder="State the strongest version of the opposing case. Naming it well sets the floor of the discussion."
              rows={3}
            />
          </DeclareQuestion>

          <DeclareQuestion
            label="Suggested Tier, required"
            prompt="Using the same tier system as comments, where do you think this article lands?">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TIER_ORDER.map(tierKey => (
                <TierBadge
                  key={tierKey}
                  tierKey={tierKey}
                  selected={state.declared_tier === tierKey}
                  onClick={() => setState({ ...state, declared_tier: tierKey })}
                />
              ))}
            </div>
            {state.declared_tier && TIERS[state.declared_tier] && (
              <div style={{
                marginTop: 14, padding: '10px 14px',
                background: T.goldPale, borderLeft: `2px solid ${T.amber}`,
                borderRadius: '0 3px 3px 0',
                fontFamily: T.fontReading, fontStyle: 'italic',
                fontSize: 13, color: T.textBody, lineHeight: 1.6,
              }}>
                {TIERS[state.declared_tier].meaning}
              </div>
            )}
          </DeclareQuestion>

          <DeclareQuestion
            label="Opinion Mapping"
            prompt="Where will readers split on this article? Pick the tool that fits each debate: ternary for 3 competing positions, cartesian for 2 independent dimensions, binary for a continuum (paired only), or no map if the piece doesn't invite taking sides. Most articles have one map. The engine will recommend a starting point."
            hint={
              <AiHintButton
                kind="missing-axis"
                getContext={() => ({
                  core_claim:    state.declaration.core_claim || '',
                  scope_boundary:state.declaration.scope_boundary || '',
                  current_axes:  state.declaration.opinion_axes || [],
                  article_text:  state.body || '',
                  member_uuid:   memberUuid,
                })}
                cta="Suggest a missing axis"
                emptyText="A core claim is needed first."
                disabled={!(state.declaration.core_claim || '').trim()}
              />
            }>
            <OpinionMapsInput
              maps={state.declaration.opinion_maps || []}
              onChange={(maps) => updateDeclaration('opinion_maps', maps)}
              aiTensions={state.ai_analysis?.tensions || null}
              aiCandidateMaps={state.ai_analysis?.candidate_maps || state.ai_analysis?.recommended_maps || null}
            />
          </DeclareQuestion>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, marginTop: 32, paddingTop: 24,
            borderTop: `1px solid ${T.borderLight}`,
          }}>
            <button onClick={() => setBreath(1)} style={outlineButtonStyle}>
              Back to first breath
            </button>
            <button
              onClick={onContinue}
              disabled={!breath2Valid}
              style={{
                ...primaryButtonStyle,
                opacity: breath2Valid ? 1 : 0.4,
                cursor: breath2Valid ? 'pointer' : 'not-allowed',
              }}>
              Send to reflection
            </button>
          </div>

          {!breath2Valid && (
            <div style={{
              marginTop: 12, textAlign: 'right',
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: 12, color: T.textMuted,
            }}>
              {(state.declaration.strongest_objection || '').trim().length < 10 && 'Strongest objection needs at least a sentence. '}
              {!state.declared_tier && 'Pick a tier. '}
              {!hasValidMaps && 'Opinion maps need to be complete. Each map needs a topic and the right number of pole labels (3 for ternary, 4 for cartesian, 2 for binary). Or remove all maps to publish without one. Binary cannot be the only map.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EDITOR  (state machine + auto-save + stage routing)
// ═══════════════════════════════════════════════════════════════════════════

const AUTOSAVE_KEY = 'dialecta-editor-draft';
const AUTOSAVE_INTERVAL_MS = 10_000;

const INITIAL_STATE = {
  title: '',
  body_html: '',
  feature_image: null,
  primary_tag: null,
  secondary_tags: [],
  declaration: {
    core_claim: '',
    scope_boundary: '',
    strongest_objection: '',
    opinion_maps: [],
  },
  declared_tier: null,
  ai_analysis: null,
  ghost_post_id: null,
  article_id: null,
  stage_2_5_choice: null,
  author_note: '',
  // Polish v2: author chooses formatting intensity on the POLISH_READ
  // stage. 'light' is the default: hygiene + structure recognition only,
  // no active rhythm tools. Standard adds conservative thematic breaks;
  // Editorial adds pullquote extraction, list conversion, emphasis.
  polish_level: 'light',
  polish_options: null,
  // Result of the most recent polish call. Persisted on cross-stage state
  // so navigating Back from POLISH_READ and forward again hydrates the
  // already-polished read instead of re-firing a polish call (which costs
  // one polish-runs-quota slot under tiered subscriptions).
  polished_html: null,
  polished_level: null,
  polished_options: null,
  polish_count: 0,
};

export default function DialectaEditor({ memberUuid, memberEmail, memberName }) {
  const [stage, setStage]         = useState(S.COMPOSE);
  const [state, setState]         = useState(INITIAL_STATE);
  const [savedAt, setSavedAt]     = useState(null);
  const [restored, setRestored]   = useState(false);
  const [postedInfo, setPostedInfo] = useState(null);

  // Viewer's subscription tier, fetched once on mount. Defaults to 'free'
  // until the profile endpoint resolves; if the endpoint doesn't return
  // subscription_tier (e.g. before the tier-system thread lands), the
  // capability lookup degrades safely to free. Passed down to stages
  // that gate behavior on tier (POLISH_READ today; others as needed).
  const [viewerTier, setViewerTier] = useState('free');
  useEffect(() => {
    if (!memberUuid) return;
    const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    let cancelled = false;
    fetch(`${apiBase}/api/profile/${encodeURIComponent(memberUuid)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled) return;
        const tier = data?.profile?.subscription_tier
                  || data?.subscription_tier
                  || 'free';
        setViewerTier(tier);
      })
      .catch(() => { /* keep default 'free' on failure */ });
    return () => { cancelled = true; };
  }, [memberUuid]);

  // Scroll to top whenever the stage changes. Without this, advancing to
  // (e.g.) the Reflection stage left the new content rendered far below
  // the user's previous scroll position, so the new stage opened at the
  // bottom of the viewport. instant + 0/0 because mid-flow stage changes
  // shouldn't animate.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [stage]);

  // Restore auto-saved draft on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const merged = { ...INITIAL_STATE, ...parsed.state };
          // Normalize opinion_maps. Drop any entries that don't match one
          // of the three valid map shapes; if the result is more than 2
          // entries, take the first 2. A bad save collapses to [] so the
          // AI's recommendation can re-seed on next mount.
          const rawMaps = merged.declaration?.opinion_maps;
          const oldAxes = merged.declaration?.opinion_axes;
          let cleaned = [];
          if (Array.isArray(rawMaps)) {
            cleaned = rawMaps.filter(isValidMapEntry).slice(0, 2);
          } else if (Array.isArray(oldAxes)) {
            // Back-compat: a draft saved against the old schema. Try to
            // promote it to the new shape.
            if (oldAxes.length === 1 && oldAxes[0]?.type === 'ternary'
                && isValidMapEntry(oldAxes[0])) {
              cleaned = [oldAxes[0]];
            } else if (oldAxes.length === 2
                && oldAxes.every((a) => !a?.type || a.type === 'cartesian')) {
              const wrapped = { type: 'cartesian', axes: oldAxes };
              if (isValidMapEntry(wrapped)) cleaned = [wrapped];
            }
          }
          merged.declaration = {
            ...merged.declaration,
            opinion_maps: cleaned,
          };
          // Drop the legacy field on the way through.
          if ('opinion_axes' in merged.declaration) {
            delete merged.declaration.opinion_axes;
          }
          setState(merged);
          setSavedAt(parsed.savedAt || null);
          setRestored(true);
        }
      }
    } catch (err) {
      console.warn('Failed to restore auto-saved draft:', err);
    }
  }, []);

  // Auto-save on a 10-second timer when state changes.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Track current stage in a ref so the auto-save timer can gate on it
  // without re-creating the interval on every stage transition.
  const stageRef = useRef(stage);
  useEffect(() => { stageRef.current = stage; }, [stage]);

  useEffect(() => {
    const id = setInterval(() => {
      // Skip auto-save once the article is published. The state is still in
      // memory until the user clicks "Write another" or leaves, but the
      // draft has been committed to the record and should not be re-saved.
      if (stageRef.current === S.POSTED) return;
      const current = stateRef.current;
      // Don't save if both title and body are empty (avoids overwriting on
      // a fresh page load with the empty INITIAL_STATE).
      if (!current.title?.trim() && !current.body_html?.trim()) return;
      try {
        const ts = Date.now();
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ state: current, savedAt: ts }));
        setSavedAt(ts);
      } catch (err) {
        console.warn('Auto-save failed:', err);
      }
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bgPage,
      position: 'relative',
    }}>
      <PaperGrain />
      <ProgressRail stage={stage} />

      {restored && stage === S.COMPOSE && (savedAt) && (
        <div style={{
          maxWidth: 760, margin: '24px auto 0', padding: '0 24px',
          fontFamily: T.fontReading, fontStyle: 'italic', fontSize: 13,
          color: T.textTertiary, textAlign: 'center',
          position: 'relative', zIndex: 2,
        }}>
          A draft from a previous session was restored.
          {' '}
          <button
            type="button"
            onClick={() => {
              if (confirm('Discard the restored draft and start fresh?')) {
                localStorage.removeItem(AUTOSAVE_KEY);
                setState(INITIAL_STATE);
                setSavedAt(null);
                setRestored(false);
              }
            }}
            style={{
              background: 'none', border: 'none',
              fontFamily: 'inherit', fontStyle: 'inherit', fontSize: 'inherit',
              color: T.amber, textDecoration: 'underline',
              cursor: 'pointer', padding: 0,
            }}>
            Discard and start fresh
          </button>
        </div>
      )}

      {stage === S.COMPOSE && (
        <ComposeStage
          state={state}
          setState={setState}
          onContinue={() => setStage(S.CONSENT)}
          savedAt={savedAt}
          memberUuid={memberUuid}
        />
      )}
      {stage === S.CONSENT    && (
        <ConsentStage
          onContinue={() => setStage(S.DECLARE)}
          onBack={() => setStage(S.COMPOSE)}
        />
      )}
      {stage === S.DECLARE    && (
        <DeclareStage
          state={state}
          setState={setState}
          memberUuid={memberUuid}
          onContinue={() => setStage(S.POLISH_READ)}
          onBack={() => setStage(S.CONSENT)}
        />
      )}
      {stage === S.POLISH_READ && (
        <PolishReadStage
          state={state}
          setState={setState}
          viewerTier={viewerTier}
          onComplete={(analysis) => {
            // If POLISH_READ collected the analysis, skip the legacy
            // ReflectingStage gate and go straight to REFLECTION. Otherwise
            // fall through to REFLECTING which will wait briefly for the
            // classify call to finish.
            if (analysis || state.ai_analysis) {
              setStage(S.REFLECTION);
            } else {
              setStage(S.REFLECTING);
            }
          }}
          onBack={() => setStage(S.DECLARE)}
        />
      )}
      {stage === S.REFLECTING && (
        <ReflectingStage
          state={state}
          setState={setState}
          onComplete={() => setStage(S.REFLECTION)}
          onBack={() => setStage(S.POLISH_READ)}
        />
      )}
      {stage === S.REFLECTION && (
        <ReflectionStage
          state={state}
          onContinue={() => setStage(S.STAGE25)}
          onBack={() => setStage(S.DECLARE)}
        />
      )}
      {stage === S.STAGE25    && (
        <Stage25
          state={state}
          setState={setState}
          onAmend={() => {
            setState({ ...state, stage_2_5_choice: 'amend', author_note: '' });
            setStage(S.COMPOSE);
          }}
          onRespond={() => {
            setState({ ...state, stage_2_5_choice: 'respond' });
            setStage(S.RESPOND);
          }}
          onAsIs={() => {
            setState({ ...state, stage_2_5_choice: 'as_is', author_note: '' });
            setStage(S.FINAL);
          }}
          onBack={() => setStage(S.REFLECTION)}
        />
      )}
      {stage === S.RESPOND    && (
        <RespondStage
          state={state}
          setState={setState}
          onContinue={() => setStage(S.FINAL)}
          onBack={() => setStage(S.STAGE25)}
        />
      )}
      {stage === S.FINAL      && (
        <FinalStage
          state={state}
          setState={setState}
          memberUuid={memberUuid}
          onPublished={(info) => {
            // Article is committed; the auto-saved draft is no longer
            // needed. Clear it so a future visit to /write/ does not
            // restore the just-published content as a stale draft.
            try { localStorage.removeItem(AUTOSAVE_KEY); } catch (e) {}
            setSavedAt(null);
            setRestored(false);
            setPostedInfo(info);
            setStage(S.POSTED);
          }}
          onBack={() => setStage(state.stage_2_5_choice === 'respond' ? S.RESPOND : S.STAGE25)}
        />
      )}
      {stage === S.POSTED     && (
        <PostedStage
          state={state}
          postedInfo={postedInfo}
          onWriteAnother={() => {
            // Clear localStorage and reset to a fresh COMPOSE.
            try { localStorage.removeItem(AUTOSAVE_KEY); } catch (e) {}
            setState(INITIAL_STATE);
            setSavedAt(null);
            setRestored(false);
            setPostedInfo(null);
            setStage(S.COMPOSE);
          }}
        />
      )}

      {/* Footer: Pact reference link */}
      <div style={{
        textAlign: 'center', padding: '36px 24px',
        fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: T.textMuted,
        position: 'relative', zIndex: 2,
      }}>
        <a href="/pact/" style={{ color: T.amber, textDecoration: 'none' }}>
          The Pact
        </a>
      </div>
    </div>
  );
}
