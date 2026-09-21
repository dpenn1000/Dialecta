/**
 * The Pact's seven tier marks, path for path from _theme/page-pact.hbs (the
 * tier list and the quiz buttons share them). 24px grid, currentColor, so the
 * caller sets the tier's colour. Decorative: the tier name always sits beside
 * the mark, so every icon is aria-hidden.
 *
 * These are the Pact's own drawings. The Guidebook draws its tiers differently
 * (22px coins, components/content/guidebook/tier-coins.tsx), as live.
 */
import type { Tier } from '@dialecta/core';

interface IconProps {
  size?: number | undefined;
  className?: string | undefined;
}

function Svg({ size = 28, className, fill, stroke, strokeWidth, children }: IconProps & {
  fill: string;
  stroke: string;
  strokeWidth: number;
  children: React.ReactNode;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function PactTierIcon({ tier, size, className }: IconProps & { tier: Tier }) {
  switch (tier) {
    case 'forum':
      return (
        <Svg size={size} className={className} fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 7 L12 3 L21 7" />
          <line x1="2" y1="7.5" x2="22" y2="7.5" strokeWidth={2.2} />
          <line x1="6" y1="9" x2="6" y2="19" />
          <line x1="12" y1="9" x2="12" y2="19" />
          <line x1="18" y1="9" x2="18" y2="19" />
          <line x1="3" y1="20" x2="21" y2="20" strokeWidth={2.2} />
        </Svg>
      );
    case 'spark':
      return (
        <Svg size={size} className={className} fill="currentColor" stroke="currentColor" strokeWidth={0.5}>
          <path d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z" />
        </Svg>
      );
    case 'echo':
      return (
        <Svg size={size} className={className} fill="none" stroke="currentColor" strokeWidth={2.4}>
          <path d="M4 12 a8 8 0 0 1 14 -5" />
          <path d="M18 3 L18 7 L14 7" />
          <path d="M20 12 a8 8 0 0 1 -14 5" />
          <path d="M6 21 L6 17 L10 17" />
        </Svg>
      );
    case 'fog':
      return (
        <Svg size={size} className={className} fill="currentColor" stroke="currentColor" strokeWidth={0.5}>
          <path d="M6.5 18 C 3.5 18, 2 16, 2 13.5 C 2 11, 4 9.5, 6 9.8 C 6.5 6.5, 9 5, 11.5 5 C 14.5 5, 16.5 7, 17 9.5 C 19.5 9.5, 22 11, 22 14 C 22 16.5, 20 18, 17.5 18 Z" />
        </Svg>
      );
    case 'heat':
      return (
        <Svg size={size} className={className} fill="currentColor" stroke="currentColor" strokeWidth={0.5}>
          <path d="M12 2 C 10 6, 7 8, 7 13 C 7 17.5, 9.5 21, 12.5 21 C 16 21, 18 17.8, 17.8 14.5 C 17.6 12, 15.8 10, 14 9 C 14.5 11, 13.5 12, 12.5 11.5 C 12 9, 13 6, 12 2 Z" />
        </Svg>
      );
    case 'stance':
      return (
        <Svg size={size} className={className} fill="currentColor" stroke="currentColor" strokeWidth={0.5}>
          <line x1="6" y1="3" x2="6" y2="21" strokeWidth={2.8} />
          <path d="M6 4 L18 8 L6 12 Z" />
          <line x1="3" y1="21" x2="9" y2="21" strokeWidth={2.8} />
        </Svg>
      );
    case 'breach':
      return (
        <Svg size={size} className={className} fill="none" stroke="currentColor" strokeWidth={2.4}>
          <path d="M9 7 a3 3 0 0 0 -3 3 v2 a3 3 0 0 0 3 3 h1" />
          <path d="M15 17 a3 3 0 0 0 3 -3 v-2 a3 3 0 0 0 -3 -3 h-1" />
          <line x1="3" y1="3" x2="21" y2="21" strokeWidth={3} />
        </Svg>
      );
  }
}
