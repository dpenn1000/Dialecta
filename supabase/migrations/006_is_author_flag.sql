-- ============================================================================
-- 006_is_author_flag.sql
-- ----------------------------------------------------------------------------
-- Adds the `is_author` boolean to profiles. Drives the editor's auth gate:
-- only members with is_author = true can submit via /api/article/submit.
--
-- Architectural note (the "right model" for Dialecta authorship):
--   Authors are MEMBERS, not Ghost staff. A single Ghost member account is
--   the only login a writer needs. is_author = true on their profile is the
--   capability flag. Articles get attributed to a single house Ghost staff
--   user (the founder's Ghost staff ID) for Ghost's internal records; the
--   real author byline renders from Supabase via theme override.
--
-- This decouples Dialecta identity (Supabase) from Ghost's CMS-author concept,
-- which was the right separation per the Contributor Identity spec all along.
-- Ghost stays a CMS; Dialecta owns identity.
--
-- For MVP: only Daniel is flagged is_author = true. New authors get the flag
-- toggled by Daniel via Supabase dashboard until a self-service author
-- application flow ships (deferred to a future surface, possibly the
-- Suggestions & Bugs page or a separate "Apply to write" surface).
--
-- Seeds (seed:maya, seed:wen, seed:anselm) are intentionally NOT flagged.
-- They have no Ghost member accounts and cannot actually use the editor.
-- They remain pure test fixtures.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS, UPDATE WHERE matches.
-- ============================================================================

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_author boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.is_author IS
  'True for members authorized to submit articles via /write/. Drives the auth gate in /api/article/submit. Set manually via Supabase dashboard until a self-service author-application flow exists. Members without is_author=true can read and comment but not write articles. Seeds (seed:*) intentionally remain false; they have no Ghost member accounts.';

CREATE INDEX IF NOT EXISTS idx_profiles_is_author ON profiles (is_author) WHERE is_author = true;

-- Daniel only, for MVP. Add more authors here (or via dashboard) as members
-- sign up and get approved.
UPDATE profiles
SET is_author = true
WHERE ghost_member_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8';

COMMIT;

-- ============================================================================
-- After apply, sanity check:
--
--   SELECT ghost_member_id, display_name, is_author
--   FROM profiles
--   WHERE is_author = true;
--     -- Should return Daniel only.
-- ============================================================================
