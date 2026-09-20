/**
 * dialecta-opinion-map-picker.jsx
 *
 * Renders the AI's 2-4 candidate framings (skill v2.2.0+) as cards. The
 * author selects 1 OR 2 candidates and clicks Save; the chosen set
 * becomes declaration.opinion_maps.
 *
 * Used by:
 *   - The article editor (FINAL stage, OpinionMapsInput) for new submissions.
 *   - The post-page admin "Re-setup opinion maps" modal for re-running the
 *     picker against a published article (smoke-test surface).
 *
 * Both surfaces pass `candidates` (typically ai_analysis.candidate_maps) and
 * an `onPick(arrayOfMaps)` callback. The picker normalizes each chosen
 * candidate via the local normalizeRecommendedMap helper before handing
 * them back; on "Build my own" it calls onPick([]).
 *
 * Visual hierarchy (v2.4 redesign):
 *   - Section header: "Engine's recommendation"
 *   - Recommended card (#1): brass-tinted background, fuller layout, more
 *     prominent typography
 *   - Section header: "Or another framing"
 *   - Alternative cards (#2..N): same shape, lighter treatment
 *   - Footer: selection counter + Save button + Build-my-own link
 *
 * Self-contained tokens so this file can be imported without dragging
 * editor-specific design context.
 */

import { useState } from 'react';

const MAX_PICKS = 2;

// ── Design tokens ──────────────────────────────────────────────────────
const T = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
  fontReading: "'Source Serif 4', Georgia, serif",
  fontUI:      "'DM Sans', system-ui, sans-serif",
  bgCard:      '#fffdf8',
  bgRecommendedCard: 'rgba(212,168,74,0.07)',
  bgSelectedCard:    'rgba(212,168,74,0.14)',
  ink:         '#1c1814',
  inkSoft:     '#2c2620',
  textBody:    '#3a342c',
  textTertiary:'#7a7068',
  borderLight: 'rgba(180,175,165,0.32)',
  borderBrass: 'rgba(212,168,74,0.40)',
  amber:       '#b8862e',
  brassDeep:   '#7a4a10',
  paperGrain:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.035'/%3E%3C/svg%3E\")",
  fast:        '120ms',
  ease:        'cubic-bezier(0.4, 0, 0.2, 1)',
};

// ── Normalize a raw candidate into the editor's opinion_maps shape ─────
export function normalizeRecommendedMap(rec) {
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

// ── Subcomponents ──────────────────────────────────────────────────────
function PolesPreview({ candidate, compact = false }) {
  const polePillStyle = {
    fontFamily: T.fontUI,
    fontSize: compact ? 11 : 12,
    color: T.textBody,
    padding: compact ? '3px 8px' : '4px 10px',
    background: 'rgba(212,168,74,0.08)',
    border: `1px solid rgba(212,168,74,0.24)`,
    borderRadius: 11,
    display: 'inline-block',
    margin: '2px 5px 2px 0',
  };
  if (candidate?.type === 'ternary' && Array.isArray(candidate.poles)) {
    return (
      <div style={{ marginTop: compact ? 6 : 10 }}>
        {candidate.poles.map((p, i) => (
          <span key={i} style={polePillStyle}>{p}</span>
        ))}
      </div>
    );
  }
  if (candidate?.type === 'cartesian' && Array.isArray(candidate.axes)) {
    return (
      <div style={{ marginTop: compact ? 6 : 10 }}>
        {candidate.axes.map((ax, i) => (
          <div key={i} style={{ marginBottom: i < candidate.axes.length - 1 ? 5 : 0 }}>
            <span style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: T.textTertiary,
              marginRight: 6,
            }}>
              Axis {i + 1}
            </span>
            <span style={polePillStyle}>{ax.axis_a}</span>
            <span style={{ ...polePillStyle, opacity: 0.5, background: 'transparent', border: 'none' }}>vs</span>
            <span style={polePillStyle}>{ax.axis_b}</span>
          </div>
        ))}
      </div>
    );
  }
  if (candidate?.type === 'binary') {
    return (
      <div style={{ marginTop: compact ? 6 : 10 }}>
        <span style={polePillStyle}>{candidate.axis_a}</span>
        <span style={{ ...polePillStyle, opacity: 0.5, background: 'transparent', border: 'none' }}>vs</span>
        <span style={polePillStyle}>{candidate.axis_b}</span>
      </div>
    );
  }
  return null;
}

function CheckMarker({ selected }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 22, height: 22, borderRadius: '50%',
        border: selected ? `1.5px solid ${T.amber}` : `1.5px solid ${T.borderLight}`,
        background: selected ? T.amber : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: `all ${T.fast} ${T.ease}`,
      }}
    >
      {selected && (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3.5 3.5L13 5" stroke={T.bgCard} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function TypeBadge({ type, prominent = false }) {
  return (
    <span style={{
      fontFamily: T.fontMono,
      fontSize: prominent ? 10 : 9,
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color: T.amber,
      padding: prominent ? '3px 9px' : '2px 7px',
      background: 'rgba(212,168,74,0.10)',
      border: `1px solid rgba(212,168,74,0.30)`,
      borderRadius: 11,
    }}>
      {type || 'unknown'}
    </span>
  );
}

function CandidateCard({ candidate, isRecommended, isSelected, isDisabled, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const topic = candidate?.topic
    || (candidate?.type === 'cartesian' && candidate.axes?.[0]?.topic)
    || '(no topic)';
  const confLabel = typeof candidate?.confidence === 'number'
    ? `${Math.round(candidate.confidence * 100)}%`
    : null;

  const ringColor = isSelected
    ? T.amber
    : (hovered && !isDisabled ? T.borderBrass : T.borderLight);
  const bgColor = isSelected
    ? T.bgSelectedCard
    : (isRecommended ? T.bgRecommendedCard : T.bgCard);

  return (
    <button
      type="button"
      onClick={() => { if (!isDisabled) onToggle(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={isDisabled}
      aria-pressed={isSelected}
      style={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        padding: isRecommended ? '20px 22px' : '16px 20px',
        backgroundColor: bgColor,
        backgroundImage: T.paperGrain,
        border: `1.5px solid ${ringColor}`,
        borderRadius: 5,
        marginBottom: 12,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        boxShadow: isSelected ? '0 1px 6px rgba(140,74,47,0.12)' : 'none',
        transition: `all ${T.fast} ${T.ease}`,
        font: 'inherit', color: 'inherit',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <div style={{ paddingTop: 2 }}>
          <CheckMarker selected={isSelected} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            marginBottom: 6,
          }}>
            <TypeBadge type={candidate?.type} prominent={isRecommended} />
            {confLabel && (
              <span style={{
                fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.10em',
                color: T.textTertiary,
              }}>
                confidence {confLabel}
              </span>
            )}
          </div>
          <div style={{
            fontFamily: T.fontDisplay, fontStyle: 'italic',
            fontSize: isRecommended ? 22 : 18, fontWeight: 500, lineHeight: 1.25,
            color: T.ink,
            marginBottom: 2,
          }}>
            {topic}
          </div>
          <PolesPreview candidate={candidate} compact={!isRecommended} />
          {candidate?.rationale && (
            <div style={{
              fontFamily: T.fontReading,
              fontSize: isRecommended ? 13 : 12.5,
              lineHeight: 1.55,
              color: T.textBody,
              marginTop: isRecommended ? 12 : 9,
              fontStyle: 'italic',
            }}>
              {candidate.rationale}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      marginTop: 18, marginBottom: 10,
    }}>
      <span style={{
        fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: T.amber,
        flexShrink: 0,
      }}>
        {children}
      </span>
      <span style={{
        flex: 1, height: 1,
        background: 'linear-gradient(to right, rgba(212,168,74,0.32), rgba(212,168,74,0))',
      }}/>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────
export default function OpinionMapCandidatePicker({
  candidates,
  onPick,
  allowBuildMyOwn = true,
  headline,
  subhead,
}) {
  const [selectedIndices, setSelectedIndices] = useState([]);

  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const toggle = (i) => {
    setSelectedIndices((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= MAX_PICKS) return prev;  // cap
      return [...prev, i];
    });
  };

  const handleSave = () => {
    if (selectedIndices.length === 0) return;
    // Preserve confidence order in the saved set: sort indices ascending
    // so candidate_maps[0] is always the higher-confidence one if both
    // are selected. The user's click order does not affect ordering.
    const ordered = [...selectedIndices].sort((a, b) => a - b);
    const picked = ordered
      .map((i) => normalizeRecommendedMap(candidates[i]))
      .filter(Boolean);
    onPick(picked);
  };

  const handleBuildMyOwn = () => {
    onPick([]);
  };

  const recommended = candidates[0];
  const alternatives = candidates.slice(1);
  const atCap = selectedIndices.length >= MAX_PICKS;

  const defaultHeadline = 'Pick the framing(s) you want readers to engage with.';
  const defaultSubhead = 'Each card is a different way to map the debate your article puts in front of readers. You can pick one strong framing or two complementary framings (max 2). Click any card to select. The engine has marked its top recommendation.';

  return (
    <div style={{
      padding: '20px 22px 18px',
      background: 'rgba(212,168,74,0.04)',
      border: `1px solid rgba(212,168,74,0.20)`,
      borderRadius: 6,
      marginBottom: 16,
    }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: T.amber,
        marginBottom: 6,
      }}>
        The engine proposed {candidates.length} framings
      </div>
      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 22, fontWeight: 400, lineHeight: 1.3,
        color: T.ink,
        marginBottom: 8,
      }}>
        {headline || defaultHeadline}
      </div>
      <div style={{
        fontFamily: T.fontReading, fontSize: 13, lineHeight: 1.6,
        color: T.textBody,
        marginBottom: 4,
      }}>
        {subhead || defaultSubhead}
      </div>

      <SectionHeader>Engine's recommendation</SectionHeader>
      <CandidateCard
        candidate={recommended}
        isRecommended={true}
        isSelected={selectedIndices.includes(0)}
        isDisabled={!selectedIndices.includes(0) && atCap}
        onToggle={() => toggle(0)}
      />

      {alternatives.length > 0 && (
        <>
          <SectionHeader>Or another framing</SectionHeader>
          {alternatives.map((c, i) => {
            const idx = i + 1;
            return (
              <CandidateCard
                key={idx}
                candidate={c}
                isRecommended={false}
                isSelected={selectedIndices.includes(idx)}
                isDisabled={!selectedIndices.includes(idx) && atCap}
                onToggle={() => toggle(idx)}
              />
            );
          })}
        </>
      )}

      <div style={{
        marginTop: 18,
        paddingTop: 16,
        borderTop: `1px solid ${T.borderLight}`,
        display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: selectedIndices.length === 0 ? T.textTertiary : T.brassDeep,
        }}>
          {selectedIndices.length} of {MAX_PICKS} selected
          {atCap ? ' · cap reached' : ''}
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={handleSave}
          disabled={selectedIndices.length === 0}
          style={{
            padding: '10px 22px',
            background: selectedIndices.length === 0
              ? 'transparent'
              : `linear-gradient(180deg, #ecb438 0%, ${T.amber} 65%, ${T.brassDeep} 100%)`,
            color: selectedIndices.length === 0 ? T.textTertiary : '#fffefa',
            border: selectedIndices.length === 0
              ? `1px solid ${T.borderLight}`
              : `1px solid ${T.brassDeep}`,
            borderRadius: 4,
            fontFamily: T.fontMono, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: selectedIndices.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: selectedIndices.length === 0
              ? 'none'
              : 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 4px rgba(140,74,47,0.25)',
            transition: `all ${T.fast} ${T.ease}`,
          }}
        >
          {selectedIndices.length === 0
            ? 'Select to save'
            : selectedIndices.length === 1
              ? 'Save 1 framing'
              : 'Save 2 framings'}
        </button>
      </div>

      {allowBuildMyOwn && (
        <button
          type="button"
          onClick={handleBuildMyOwn}
          style={{
            marginTop: 10,
            padding: '6px 0',
            background: 'transparent',
            color: T.textTertiary,
            border: 'none',
            fontFamily: T.fontUI, fontSize: 12,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Or build your own from scratch
        </button>
      )}
    </div>
  );
}
