-- ============================================================================
-- 003_resonance_column.sql
-- ----------------------------------------------------------------------------
-- Adds the `resonance` column to `profiles` so the Fingerprint engine's halo
-- intensity comes from real data instead of being hardcoded in HERO_PROFILES
-- (src/index.jsx). Resonance is a 0..1 scalar representing "how much the
-- contributor's voice lands in the community" (per the engine's inline doc at
-- dialecta-fingerprint-engine.jsx:112). It is NOT derivable from axis scores —
-- Wen has the highest graduations but the lowest resonance in the seed values,
-- which would make any axis-based formula nonsensical.
--
-- For now, seeds are hand-set to the values that previously lived in
-- HERO_PROFILES. Real contributors default to 0; a future aggregator job
-- computes resonance from engagement signals (replies, sparring formation,
-- follow growth, forum-tier inbound engagement, etc.).
--
-- Idempotent: ADD COLUMN IF NOT EXISTS + UPDATE WHERE matches.
-- ============================================================================

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS resonance numeric NOT NULL DEFAULT 0
    CHECK (resonance >= 0 AND resonance <= 1);

COMMENT ON COLUMN profiles.resonance IS
  'Fingerprint halo intensity 0..1 — "how much the contributor''s voice lands in the community." Drives the resonance glow in dialecta-fingerprint-engine.jsx. Hand-set for seeds; future aggregator computes from engagement signals (replies, sparring formation, follow growth, inbound forum-tier engagement).';

UPDATE profiles SET resonance = 0.58 WHERE ghost_member_id = 'seed:maya';
UPDATE profiles SET resonance = 0.54 WHERE ghost_member_id = 'seed:wen';
UPDATE profiles SET resonance = 0.65 WHERE ghost_member_id = 'seed:anselm';

COMMIT;

-- ============================================================================
-- After apply, sanity-check from any SQL client:
--
--   SELECT ghost_member_id, display_name, resonance
--   FROM profiles
--   WHERE is_seed = true
--   ORDER BY display_name;
--     → Maya 0.58, Wen 0.54, Anselm 0.65
-- ============================================================================
