/**
 * dialecta-tier-badge.jsx
 *
 * Tier badge primitive. Shared by the Private Draft engine (compose-time
 * suggested tier, self-declaration grid) and the Discourse Layer engine
 * (live comment cards, contrast strips, nomination panels).
 *
 * Visual: paper-cream chip with brass-edge stroke and a tier-gradient icon
 * zone. Sits comfortably on both .dialecta-paper surfaces and on the page
 * cream background. The Forum icon renders in --ink rather than the tier's
 * own text color because the Forum chip is near-white and tier-text would
 * have insufficient contrast there. Every other tier icon renders in its
 * own tier text color.
 *
 * Sizes:
 *   sm  → feed cards, in-row chips
 *   md  → compose-time tier suggestion, contrast strips
 *   lg  → declaration grid, nomination panel rows
 *
 * Selection states (declaration grid uses these):
 *   selected    → brass-bright 2px ring + lift
 *   suggested   → brass-pale 2px ring (engine's soft preference)
 *   declared    → "Declared" pill sits in the right zone (used by nomination
 *                 panel where one tier is already-declared and not selectable)
 *
 * Tier source of truth: the Six Pillars + Seven Tiers project constants.
 * Stance / Breach are canonical; "Static" is retired and must not appear.
 */

import { useId } from 'react';

// ─── Tier definitions (canonical seven) ──────────────────────────────────
// Color stops match the Tier Psychology brightness ladder. Description copy
// lifted verbatim from the canonical s11 prototype + Discourse Layer UX
// spec. Keep the list in tier-rank order; consumers iterate it as-is for
// the declaration grid.

export const TIERS = [
  {
    key: 'forum', name: 'The Forum', short: 'Forum', rank: 0,
    desc: 'Specific claim, engaged with the content, reasoning present. Strong disagreement welcome here.',
    meaning: 'Specific claim, engaged with content. Disagreement welcome here.',
    top: '#FEFBF0', bot: '#F8F0D8', border: '#E8D080', text: '#6A5410',
  },
  {
    key: 'spark', name: 'The Spark', short: 'Spark', rank: 1,
    desc: 'An interesting idea, underdeveloped. The seed of something good.',
    meaning: 'An interesting idea, underdeveloped. Potential, not yet realized.',
    top: '#FCF0D8', bot: '#F4D098', border: '#D89438', text: '#6A3C08',
  },
  {
    key: 'echo', name: 'The Echo', short: 'Echo', rank: 2,
    desc: 'Restates the article or a prior comment without adding to it.',
    meaning: 'Restates the article or a prior comment without adding.',
    top: '#EAF0E0', bot: '#C8D8B0', border: '#708848', text: '#38440C',
  },
  {
    key: 'fog', name: 'The Fog', short: 'Fog', rank: 3,
    desc: "Vague or disconnected. The reader can't tell what the commenter believes.",
    meaning: "Unclear. The reader can't identify what you believe.",
    top: '#DCE0E4', bot: '#B0B8C4', border: '#687488', text: '#2C3848',
  },
  {
    key: 'heat', name: 'The Heat', short: 'Heat', rank: 4,
    desc: 'Emotionally charged without a specific claim. Passion without a point.',
    meaning: 'Emotional, without a specific claim. Passion without a point.',
    top: '#E89868', bot: '#C46028', border: '#7C2C08', text: '#FCEAD8',
  },
  {
    key: 'stance', name: 'The Stance', short: 'Stance', rank: 5,
    desc: 'Tribal framing or identity signaling dominates over argument. A position planted, not a conversation joined.',
    meaning: 'Tribal framing or identity signaling. A position planted, not a conversation joined.',
    top: '#A8483C', bot: '#783028', border: '#401818', text: '#F4D8D0',
  },
  {
    key: 'breach', name: 'The Breach', short: 'Breach', rank: 6,
    desc: 'Personal attack on a person, not an idea. The Pact has been broken.',
    meaning: 'A personal attack on a person, not an idea. The Pact has been broken.',
    top: '#6A1818', bot: '#380808', border: '#200404', text: '#F0C8C8',
  },
];

export const TIER_BY_KEY = Object.fromEntries(TIERS.map(t => [t.key, t]));

// ─── Tier icons (custom SVG, not emoji) ──────────────────────────────────
// Per Tier Psychology: emojis render differently across platforms, can't
// inherit the tier's color, and don't scale crisply. Custom SVG icons
// render identically everywhere, inherit currentColor, and stay sharp at
// any size from 14px to 200px.

export function TierIcon({ tierKey, size = 12 }) {
  const sz = size;
  switch (tierKey) {
    case 'forum':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="3" y="18" width="18" height="2.5" rx="1" />
          <rect x="2" y="15" width="20" height="2" rx="1" />
          <rect x="4" y="4" width="2.2" height="11" rx="1" />
          <rect x="8.9" y="4" width="2.2" height="11" rx="1" />
          <rect x="13.8" y="4" width="2.2" height="11" rx="1" />
          <rect x="18.8" y="4" width="2.2" height="11" rx="1" />
          <polygon points="12,1 2,5 22,5" />
        </svg>
      );
    case 'spark':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z" />
        </svg>
      );
    case 'echo':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 4C7 4 4 7.6 4 12c0 4.4 3 8 8 8" />
          <path d="M12 20c5 0 8-3.6 8-8 0-4.4-3-8-8-8" />
          <polyline points="9,17 12,20 9,23" />
          <polyline points="15,7 12,4 15,1" />
        </svg>
      );
    case 'fog':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4.5 12.5C4.5 10.3 6.3 8.5 8.5 8.5c.4-2 2.3-3.5 4.5-3.5C15.8 5 18 7.2 18 10c1.7.3 3 1.8 3 3.5C21 15.4 19.4 17 17.5 17h-11C5.1 17 4 16 4.5 12.5z" />
        </svg>
      );
    case 'heat':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2C10 6 7 8 7 13c0 4.5 2.5 8 5.5 8C16 21 18 17.8 17.8 14.5 17.6 12 15.8 10 14 9c.5 2-.5 3-1.5 2.5C12 9 13 6 12 2z" />
        </svg>
      );
    case 'stance':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="11.2" y="8" width="2" height="14" rx="1" />
          <rect x="9" y="21" width="6" height="1.5" rx="0.75" />
          <path d="M13 8L13 3.5L20 6L13 8.5Z" />
        </svg>
      );
    case 'breach':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M8 6C6 6 4.5 7.5 4.5 9.5S6 13 8 13h2" />
          <path d="M16 18c2 0 3.5-1.5 3.5-3.5S18 11 16 11h-2" />
          <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="2 2" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Size presets ────────────────────────────────────────────────────────

const SIZE_PRESETS = {
  sm: { padY: 3, padX: 8,  fontSize: 10, gap: 4, iconSize: 10, radius: 4 },
  md: { padY: 5, padX: 12, fontSize: 11, gap: 5, iconSize: 12, radius: 5 },
  lg: { padY: 7, padX: 16, fontSize: 13, gap: 7, iconSize: 14, radius: 6 },
};

// ─── TierBadge ───────────────────────────────────────────────────────────

export default function TierBadge({
  tierKey,
  size = 'sm',
  selected = false,
  suggested = false,
  onClick = null,
  ariaLabel,
}) {
  const tier = TIER_BY_KEY[tierKey];
  if (!tier) return null;

  const sz = SIZE_PRESETS[size] || SIZE_PRESETS.sm;
  const interactive = typeof onClick === 'function';

  // Forum icon renders in --ink (near-black) rather than tier-text-color
  // because the Forum chip is near-white cream — tier text color would
  // have insufficient contrast.
  const iconColor = tier.key === 'forum' ? '#1c1814' : tier.text;

  // Selection ring stack:
  //   selected  → brass-bright 2px outer ring
  //   suggested → brass-pale 2px outer ring (engine's soft preference)
  //   neither   → no extra shadow
  const ringShadow = selected
    ? '0 0 0 2px var(--paper), 0 0 0 4px var(--brass-bright)'
    : suggested
      ? '0 0 0 2px var(--paper), 0 0 0 3px var(--brass-pale)'
      : 'none';

  const Element = interactive ? 'button' : 'span';

  return (
    <Element
      onClick={interactive ? onClick : undefined}
      type={interactive ? 'button' : undefined}
      aria-label={ariaLabel || tier.name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        padding: `${sz.padY}px ${sz.padX}px`,
        background: `linear-gradient(180deg, ${tier.top}, ${tier.bot})`,
        border: `1px solid ${tier.border}`,
        borderRadius: sz.radius,
        color: tier.text,
        fontFamily: "'DM Mono', monospace",
        fontSize: sz.fontSize,
        fontWeight: 500,
        letterSpacing: '0.04em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        cursor: interactive ? 'pointer' : 'default',
        boxShadow: ringShadow,
        transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        transform: selected ? 'translateY(-1px)' : 'none',
        // Reset button defaults for the interactive case
        ...(interactive ? { font: 'inherit', appearance: 'none' } : {}),
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', color: iconColor, flexShrink: 0 }}>
        <TierIcon tierKey={tier.key} size={sz.iconSize} />
      </span>
      <span>{tier.name}</span>
    </Element>
  );
}

// ─── TierBadgePair — renders both AI tier and self-declared tier when they differ ─
// Used on the Discourse Layer comment card header. When ai === self, only the
// self-declared badge renders. When they differ, both render side-by-side
// with a small "AI" eyebrow on the engine read and a "self-declared" italic
// eyebrow on the commenter read.

export function TierBadgePair({ aiTierKey, selfTierKey, size = 'sm' }) {
  const same = aiTierKey === selfTierKey;
  if (same || !aiTierKey) {
    return <TierBadge tierKey={selfTierKey} size={size} />;
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 8,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--brass-mid)',
        }}>AI</span>
        <TierBadge tierKey={aiTierKey} size={size} />
      </span>
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 11,
          color: 'var(--tertiary)',
        }}>self-declared</span>
        <TierBadge tierKey={selfTierKey} size={size} />
      </span>
    </span>
  );
}
