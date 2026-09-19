-- 032_profiles_is_charter.sql
--
-- Charter Underwriter flag: founding cohort badge for the first ~100 paid
-- members. Locked at upgrade time, never revoked even if subscription_tier
-- later lapses. Distinct from subscription_tier (which can change) so the
-- two live as separate columns. The badge UI in the theme reads this
-- column via the /api/profile/:id response and renders a faint brass ring
-- around the Underwriter dot when true.
--
-- Independent of 031_profiles_subscription_tier.sql (no schema dependency
-- between the two columns), so out-of-order application is safe. The
-- Charter mechanic stays invisible end-to-end until both columns exist
-- AND the API surfaces them in profile / article / comment responses.
--
-- Naming + positioning canonical: see memory project_underwriter_tier.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_charter BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.is_charter IS
  'Charter Underwriter flag. True for the founding cohort of paid members (the first ~100). Set at upgrade time, never revoked even if subscription_tier lapses. UI renders a faint brass ring around the Underwriter badge when true.';
