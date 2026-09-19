-- ============================================================================
-- 011_pact_signed_name.sql
-- ----------------------------------------------------------------------------
-- Add the cursive-signature column added to the Pact ceremony 2026-04-29.
-- Authors now sign their name on a Pinyon-Script line above the
-- "I Understand — Enter" button before /pact/'s commit() fires. The
-- signed name is stored alongside pact_agreed_at / pact_version /
-- pact_path on the profiles row.
--
-- Schema decision: separate column rather than embedded in pact_path or
-- a JSON blob. Keeps the agreement record plainly inspectable; signed
-- names are user-readable and not personally sensitive beyond what
-- profiles.display_name already exposes.
--
-- IDEMPOTENT: safe to re-run.
-- ============================================================================

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pact_signed_name TEXT;

COMMENT ON COLUMN profiles.pact_signed_name IS
  'The author''s typed signature from the Pact ceremony (Pinyon Script line above the commit button). Stored alongside pact_agreed_at + pact_version + pact_path. Trimmed to 2–80 characters at the API.';

COMMIT;
