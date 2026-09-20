/**
 * api/_subscription-tier.js
 *
 * Server-side capability matrix for the Underwriter tier system. Mirrors
 * the theme-side dialecta-tier-capabilities.js. Single source of truth on
 * the API for what a paying member gets vs. a free member; endpoints that
 * gate behavior should call getTierCapabilities() instead of sprinkling
 * tier-comparison constants.
 *
 * Tiers:
 *   free         default; intentional limits to nudge upgrade
 *   underwriter  paid; removes limits. Internal tier key remains 'pro' to
 *                match profiles.subscription_tier values (migration 031);
 *                display label is "Underwriter." When the API + DB rename
 *                in a coordinated pass, BY_TIER and the CHECK constraint
 *                on profiles_subscription_tier_check can flip together.
 *
 * Growth Layer entries are scaffolding. Self-Snapshot Engine + History
 * Scroll are scoped (memory project_growth_engine_scroll_scope) but build
 * deferred; the matrix keys land as no-ops until the engine ships, then
 * become the canonical gate for archive depth, Practice Layer coaching,
 * and the 90-day recommitment cycle.
 *
 * Naming + positioning canonical: see memory project_underwriter_tier.
 * Copy register on user-visible labels: never "Pro" / "Premium" / "Plus."
 */

const FREE = {
  tier:           'free',
  label:          'Free',

  // ── Editor ──────────────────────────────────────────────────
  // Opinion-map picker: candidate count cap on classify(-stream).
  // null on the Underwriter side lets the skill default apply (target 3).
  max_candidates: 2,
  // POLISH_READ: Apply clicks per session.
  polish_runs:    2,

  // ── Growth Layer (engine pending) ───────────────────────────
  self_snapshot_visible:        true,    // three voices visible to everyone
  history_scroll_full:          true,    // full archive visible to everyone
  aspiration_declaration:       true,    // declaration available to everyone
  voice_one_scaffold:           true,    // self-description prompts universal
  snapshot_annotations_recent:  3,       // free sees most-recent 3 annotations
  snapshot_annotations_archive: false,   // full archive Underwriter-only
  practice_layer_coaching:      false,   // opt-in coaching Underwriter-only
  recommitment_prompts_90day:   false,   // 90-day reflection prompts Underwriter-only

  // ── UI affordances ──────────────────────────────────────────
  upgrade_url:    null,    // TUNING: set when /pricing or /upgrade exists
  upgrade_blurb:  'Underwriters keep Dialecta free to read. Iterate polish without limit. See more of the framings the engine considered.',
};

const UNDERWRITER = {
  tier:           'pro',          // internal DB key
  label:          'Underwriter',

  // ── Editor ──────────────────────────────────────────────────
  max_candidates: null,           // null = skill default applies
  polish_runs:    Infinity,

  // ── Growth Layer ────────────────────────────────────────────
  self_snapshot_visible:        true,
  history_scroll_full:          true,
  aspiration_declaration:       true,
  voice_one_scaffold:           true,
  snapshot_annotations_recent:  Infinity,
  snapshot_annotations_archive: true,
  practice_layer_coaching:      true,
  recommitment_prompts_90day:   true,

  // ── UI affordances ──────────────────────────────────────────
  upgrade_url:    null,     // already an Underwriter
  upgrade_blurb:  null,
};

const BY_TIER = { free: FREE, pro: UNDERWRITER };

/**
 * Look up capabilities by tier string. Returns FREE for unknown or
 * missing tier values so callers can write
 * `getTierCapabilities(profile?.subscription_tier).max_candidates`
 * without null-checks.
 */
export function getTierCapabilities(tier) {
  if (typeof tier !== 'string') return FREE;
  return BY_TIER[tier] || FREE;
}

/**
 * True iff the tier string maps to the paid Underwriter tier. Convenience
 * for endpoints that need a yes/no gate without a capability lookup.
 */
export function isUnderwriter(tier) {
  return tier === 'pro';
}

export const TIERS = { FREE, UNDERWRITER };
