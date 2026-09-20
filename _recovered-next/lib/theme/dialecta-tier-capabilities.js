/**
 * dialecta-tier-capabilities.js
 *
 * Single source of truth (theme-side) for what each subscription tier can
 * do. The capability matrix lives here so feature gates throughout the
 * editor and post-page surfaces can read from one map instead of
 * sprinkling constants. The server-side mirror lives wherever your
 * tier-system thread puts it (likely api/_subscription-tier.js).
 *
 * Today the only consumer is the editor's POLISH_READ stage. Wire other
 * gates here as they're added. Keep this file small and declarative.
 *
 * Tiers:
 *   free  — default; intentional limits to nudge upgrade
 *   pro   — paid; removes limits
 *
 * Unknown tiers fall through to FREE_CAPABILITIES, so a missing
 * subscription_tier field on the profile (or a tier name we don't
 * recognize) degrades safely.
 */

const FREE = {
  tier:           'free',
  label:          'Free',

  // Editor — opinion-map picker
  max_candidates: 2,        // candidate count cap passed to classify(-stream)

  // Editor — POLISH_READ
  polish_runs:    2,        // how many Apply clicks the author gets per session

  // For UI affordances that show "you're on X" labels
  upgrade_url:    null,     // TUNING: set when /pricing or /upgrade exists
  upgrade_blurb:  'Pro removes the 2-candidate cap and lets you iterate polish without limit.',
};

const PRO = {
  tier:           'pro',
  label:          'Pro',

  max_candidates: null,     // no client-side cap; let the skill default apply (target 3)

  polish_runs:    Infinity, // unlimited

  upgrade_url:    null,     // already on Pro
  upgrade_blurb:  null,
};

const BY_TIER = { free: FREE, pro: PRO };

/**
 * Look up capabilities by tier string. Returns FREE_CAPABILITIES for
 * unknown / missing tier values so callers can write
 * `getTierCapabilities(profile?.subscription_tier).max_candidates`
 * without null-checks.
 */
export function getTierCapabilities(tier) {
  if (typeof tier !== 'string') return FREE;
  return BY_TIER[tier] || FREE;
}

export const TIERS = { FREE, PRO };
