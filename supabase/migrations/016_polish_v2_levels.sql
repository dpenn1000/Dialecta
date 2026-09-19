-- Migration 016: Polish v2 — leveled polish + original-version preservation
--
-- Reframes the Polish engine from "Apply formatting" button to "always-on
-- conservative dress-up + author-chosen intensity level." Three levels
-- (light / standard / editorial) plus a custom option for per-feature
-- overrides. Always preserves the author's submitted HTML as
-- articles.original_html so admins can re-parse with different settings,
-- and so the author's untouched version is never lost.
--
-- Adds:
--   articles.original_html       — the author's submitted HTML, byte-for-byte
--   articles.polish_level        — light | standard | editorial | custom
--   articles.polish_options      — jsonb feature toggles (used when level=custom)
--   articles.polish_change_log   — jsonb array of brief change descriptions
--   profiles.polish_preferences  — jsonb user-level defaults
--   profiles.is_admin            — boolean flag for admin/steward operations
--
-- This migration is additive only; safe to apply on a populated database.
-- Existing articles will have NULL original_html until the migration script
-- runs and back-fills them with current Ghost HTML as the "original."

-- ── articles columns ──────────────────────────────────────────────────────
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS original_html text;

DO $$
BEGIN
  CREATE TYPE polish_level_enum AS ENUM ('light', 'standard', 'editorial', 'custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS polish_level polish_level_enum NOT NULL DEFAULT 'light';

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS polish_options jsonb;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS polish_change_log jsonb;

-- ── profiles columns ──────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS polish_preferences jsonb;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Set Daniel's profile as admin (the platform owner). Idempotent.
-- Future admins (Stewards) can be flagged via dashboard or future stewards UI.
UPDATE profiles
   SET is_admin = true
 WHERE ghost_member_id IN (
   SELECT ghost_member_id FROM profiles WHERE display_name ILIKE 'daniel%' LIMIT 1
 );

-- ── Comments on the new columns (so future devs / Supabase MCP see context) ──
COMMENT ON COLUMN articles.original_html IS
  'Author''s submitted HTML, byte-for-byte. Preserved so polish can be re-run with different settings without losing the original. Populated by /api/article/submit going forward; back-filled for pre-migration articles by polish-articles.mjs.';

COMMENT ON COLUMN articles.polish_level IS
  'Which polish level was applied. light = floor (hygiene only). standard = + conservative thematic breaks. editorial = + pullquotes/lists/emphasis. custom = use polish_options for granular toggles.';

COMMENT ON COLUMN articles.polish_options IS
  'When polish_level=custom, jsonb of feature toggles: {thematic_breaks_conservative, thematic_breaks_aggressive, pullquotes, list_conversions, emphasis_additions}. NULL when level is light/standard/editorial.';

COMMENT ON COLUMN articles.polish_change_log IS
  'jsonb array of brief one-line strings describing what the engine changed. Surfaced in admin re-polish UI for transparency.';

COMMENT ON COLUMN profiles.polish_preferences IS
  'User-level default polish settings. Overrides Light as the default-radio choice in the editor when set. Authors who always want Editorial can save it once; others get Light by default.';

COMMENT ON COLUMN profiles.is_admin IS
  'Platform admin flag. Required for /api/article/repolish (re-running polish on existing articles with custom settings) and other administrative API surfaces. Distinct from is_author (which gates publish), separate from Stewards (which is a discourse-layer concept).';
