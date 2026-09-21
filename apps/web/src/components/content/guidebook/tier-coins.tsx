/**
 * The Guidebook's seven tier coins, path for path from _theme/page-guidebook.hbs
 * (22px grid, each drawn in its tier's own ink). Decorative: the tier name sits
 * beside every coin, so each is aria-hidden. The Pact draws its tiers
 * differently (components/content/pact/tier-icons.tsx), as live.
 */
import type { Tier } from '@dialecta/core';

export function TierCoin({ tier }: { tier: Tier }) {
  const common = { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none', 'aria-hidden': true, focusable: false } as const;
  switch (tier) {
    case 'forum':
      return (
        <svg {...common}>
          <rect x="3" y="15" width="2" height="5" fill="#6A5410" />
          <rect x="6" y="11" width="2" height="9" fill="#6A5410" />
          <rect x="9.5" y="7" width="2" height="13" fill="#6A5410" />
          <rect x="13" y="11" width="2" height="9" fill="#6A5410" />
          <rect x="16" y="15" width="2" height="5" fill="#6A5410" />
          <rect x="2" y="5.5" width="17" height="1.5" rx="0.75" fill="#6A5410" opacity="0.55" />
          <rect x="2" y="3" width="17" height="1.5" rx="0.75" fill="#6A5410" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12.5 2.5L7.5 12h5l-2.5 7.5L20 10h-6.5L12.5 2.5z" fill="#6A3C08" opacity="0.85" />
        </svg>
      );
    case 'echo':
      return (
        <svg {...common}>
          <path d="M11 4.5C7.5 4.5 4.5 7.5 4.5 11C4.5 14.5 7.5 17.5 11 17.5" stroke="#38440C" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M11 4.5C14.5 4.5 17.5 7.5 17.5 11C17.5 14.5 14.5 17.5 11 17.5" stroke="#38440C" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.4" />
          <path d="M8.5 14L11 11L8.5 8" stroke="#38440C" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.5 14L11 11L13.5 8" stroke="#38440C" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        </svg>
      );
    case 'fog':
      return (
        <svg {...common}>
          <path d="M4 9.5Q7.5 6.5 11 9.5Q14.5 12.5 18 9.5" stroke="#2C3848" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M4 13Q7.5 10 11 13Q14.5 16 18 13" stroke="#2C3848" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.45" />
          <path d="M6 7Q9 4 13.5 7" stroke="#2C3848" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.25" />
        </svg>
      );
    case 'heat':
      return (
        <svg {...common}>
          <path
            d="M11 3C11 3 14.5 8 14 11.5C13.8 13 12.5 14 12 14C12 14 14 11.5 12 10C12 10 13 14 11 15.5C11 15.5 11 12.5 9 11.5C9 11.5 10 15 8 16.5C8 16.5 6.5 14 9 11.5C6 13 5 15 6 17.5C6 17.5 3.5 14.5 6.5 11.5C4 12.5 2.5 15.5 3.5 18C3.5 18 11 21 14.5 18C18 15 16 10 11 3Z"
            fill="#FCEAD8"
            opacity="0.9"
          />
        </svg>
      );
    case 'stance':
      return (
        <svg {...common}>
          <rect x="10.5" y="3" width="2" height="11" rx="1" fill="#F4D8D0" />
          <polygon points="7.5,8 11,4 14.5,8" fill="#F4D8D0" opacity="0.75" />
          <rect x="6" y="16.5" width="10" height="2" rx="1" fill="#F4D8D0" opacity="0.5" />
          <rect x="7.5" y="14.5" width="7" height="1" rx="0.5" fill="#F4D8D0" opacity="0.3" />
        </svg>
      );
    case 'breach':
      return (
        <svg {...common}>
          <path d="M5.5 11L9.5 8M9.5 8V14" stroke="#F0C8C8" strokeWidth="2" strokeLinecap="round" />
          <path d="M16.5 11L12.5 14M12.5 14V8" stroke="#F0C8C8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9.5" cy="11" r="2.5" stroke="#F0C8C8" strokeWidth="1.4" fill="none" opacity="0.55" />
          <circle cx="12.5" cy="11" r="2.5" stroke="#F0C8C8" strokeWidth="1.4" fill="none" opacity="0.55" />
        </svg>
      );
  }
}
