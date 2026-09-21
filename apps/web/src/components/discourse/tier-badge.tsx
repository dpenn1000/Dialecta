/**
 * The tier badge and the seven tier icons, ported from
 * _recovered-next/lib/theme/dialecta-tier-badge.jsx (265 lines). The Council
 * ruled it "port with the fix" (council/log/2026-09-20-port-or-rewrite.md):
 * designer's measured contrast defect lands in the same change as the port.
 *
 * What changed:
 *
 *   1. The colours. The recovered file carried seven hardcoded hex quartets,
 *      the fifth copy of the palette designer found. Here every fill, border
 *      and ink comes from the generated --tier-* tokens through discourse.css,
 *      keyed on data-tier. No tier hex is written in this file.
 *   2. The ink. Heat's text was #FCEAD8 over #E89868..#C46028, 1.96:1 at the
 *      top stop against a 4.5:1 floor; Stance's was 4.26:1. discourse.css
 *      carries designer's computed replacements (D-24: Heat #1D0A02, 8.32:1
 *      and 4.61:1; Stance #F9EAE6, 4.91:1 and 7.97:1), rechecked against both
 *      stops of every tier before landing. The icon draws in currentColor, so
 *      it inherits the corrected ink instead of the failing one.
 *   3. Forum's icon stays in --ink, as docs/Dialecta_Discourse_Layer_UX.md
 *      locks it. The reason that doc gives (Forum's own ink fails) does not
 *      hold, Forum measures 6.39:1, but the decision stands on its second
 *      reason and it passes either way. Every other tier's icon reads its own
 *      ink, so a tier added later cannot inherit a special case.
 *   4. The selected and suggested rings are CSS on aria-pressed and
 *      data-suggested, where the recovered file computed box shadows inline.
 *      The selected ring gains a one pixel --brass-deep edge: brass-bright
 *      alone sits under 2:1 against the paper, too faint to carry a state.
 *   5. Names and meanings moved to src/strings.ts. The label is "The Forum";
 *      the short name is core's tierName().
 *
 * No 'use client': the badge has no state, so a server component can render
 * it, and an island that passes onClick gets the button form.
 */
import { tierName, type Tier } from '@dialecta/core';
import { strings } from '@/strings';

export type TierBadgeSize = 'sm' | 'md' | 'lg';

const ICON_SIZE: Record<TierBadgeSize, number> = { sm: 10, md: 12, lg: 14 };

/**
 * Custom SVG, not emoji: per docs/Dialecta_Tier_Psychology.md, emoji render
 * differently across platforms and cannot inherit the tier's colour.
 * Paths are the recovered file's, unchanged.
 */
export function TierIcon({ tier, size = 12 }: { tier: Tier; size?: number }) {
  switch (tier) {
    case 'forum':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
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
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z" />
        </svg>
      );
    case 'echo':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 4C7 4 4 7.6 4 12c0 4.4 3 8 8 8" />
          <path d="M12 20c5 0 8-3.6 8-8 0-4.4-3-8-8-8" />
          <polyline points="9,17 12,20 9,23" />
          <polyline points="15,7 12,4 15,1" />
        </svg>
      );
    case 'fog':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M4.5 12.5C4.5 10.3 6.3 8.5 8.5 8.5c.4-2 2.3-3.5 4.5-3.5C15.8 5 18 7.2 18 10c1.7.3 3 1.8 3 3.5C21 15.4 19.4 17 17.5 17h-11C5.1 17 4 16 4.5 12.5z" />
        </svg>
      );
    case 'heat':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 2C10 6 7 8 7 13c0 4.5 2.5 8 5.5 8C16 21 18 17.8 17.8 14.5 17.6 12 15.8 10 14 9c.5 2-.5 3-1.5 2.5C12 9 13 6 12 2z" />
        </svg>
      );
    case 'stance':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="11.2" y="8" width="2" height="14" rx="1" />
          <rect x="9" y="21" width="6" height="1.5" rx="0.75" />
          <path d="M13 8L13 3.5L20 6L13 8.5Z" />
        </svg>
      );
    case 'breach':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M8 6C6 6 4.5 7.5 4.5 9.5S6 13 8 13h2" />
          <path d="M16 18c2 0 3.5-1.5 3.5-3.5S18 11 16 11h-2" />
          <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="2 2" />
        </svg>
      );
  }
}

/** "The Forum", "The Heat". */
export function tierLabel(tier: Tier): string {
  return strings.discourse.tiers.label(tierName(tier));
}

interface TierBadgeProps {
  tier: Tier;
  size?: TierBadgeSize;
  /** Declaration grid: the tier this commenter picked. */
  selected?: boolean;
  /** Declaration grid: a soft preference ring, the engine's in the recovered flow. */
  suggested?: boolean;
  onClick?: () => void;
}

export function TierBadge({ tier, size = 'sm', selected = false, suggested = false, onClick }: TierBadgeProps) {
  const content = (
    <>
      <span className="dd-tier-icon">
        <TierIcon tier={tier} size={ICON_SIZE[size]} />
      </span>
      <span>{tierLabel(tier)}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="dd-t dd-tier"
        data-tier={tier}
        data-size={size}
        data-suggested={suggested && !selected ? 'true' : undefined}
        aria-pressed={selected}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span className="dd-t dd-tier" data-tier={tier} data-size={size}>
      {content}
    </span>
  );
}
