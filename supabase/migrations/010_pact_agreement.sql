-- ============================================================================
-- 010_pact_agreement.sql
-- ----------------------------------------------------------------------------
-- Add Pact-agreement bookkeeping to profiles. Anyone can become an Author by
-- visiting /pact/, completing the quiz, choosing a path (A or B), and clicking
-- the commit button. /api/profile/[id]'s POST handler accepts an
-- {_action: 'become_author'} body that records this agreement and flips
-- is_author=true atomically.
--
-- Fields:
--   pact_agreed_at  — timestamp of the commit
--   pact_version    — version string of the Pact at commit time. Lets us
--                     identify who agreed to which revision when the Pact
--                     text is updated. Use semver-ish: '1.0', '1.1', etc.
--   pact_path       — 'A' or 'B', whichever path the author chose.
--
-- IDEMPOTENT: every column uses ADD COLUMN IF NOT EXISTS. Safe to re-run.
-- ============================================================================

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pact_agreed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pact_version   TEXT,
  ADD COLUMN IF NOT EXISTS pact_path      TEXT;

COMMENT ON COLUMN profiles.pact_agreed_at IS
  'Timestamp the member committed to the Dialecta Pact via /pact/. Null = has not agreed. Once set, /api/profile/[id] also flips is_author=true.';

COMMENT ON COLUMN profiles.pact_version IS
  'Pact-text version at agreement time (e.g. "1.0"). Lets us re-prompt members when the Pact is materially revised.';

COMMENT ON COLUMN profiles.pact_path IS
  'Which path the author chose at commit time (A or B). Mirrors the choice on /pact/. Internal-only — surfaces nowhere in the UI.';

COMMIT;
