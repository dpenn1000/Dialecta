-- ============================================================================
-- 013_classifications_strength.sql
-- ----------------------------------------------------------------------------
-- Adds the `strength` column to classifications, the field the classifier
-- already returns at Stage 1 for the Reflection card's "What this does well"
-- slot. Until this migration, the classifier returned the value, the editor
-- displayed it during the 8-second reflection window, and then it was
-- thrown away on submit (api/comment.js had no column to write it to).
--
-- Intent of the field, per Editorial Voice + Growth Frame doctrine:
-- one sentence naming what the comment does well, observational rather than
-- flattering. Even comments classified into lower tiers have something
-- worth reflecting back. The classifier is constrained to "name what is
-- there, not what is missing."
--
-- Once this migration applies, api/comment.js writes classification.strength
-- on insert and api/comments.js can SELECT it back into the feed payload
-- for any future "What this does well" surface on the comment card.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS. Safe to re-run.
--
-- See:
--   * api/classify.js              — emits the value
--   * api/comment.js               — will write it after this migration
--   * api/comments.js              — restores the SELECT after this migration
--   * dialecta-private-draft.jsx   — reflection card consumer (real-time only,
--                                    not yet from persisted store)
-- ============================================================================

BEGIN;

ALTER TABLE classifications
  ADD COLUMN IF NOT EXISTS strength text;

COMMENT ON COLUMN classifications.strength IS
  'Stage A: one sentence naming what the comment does well. Growth Frame doctrine — observational, not flattering. Surfaced in the Reflection card during compose; persisted here for retrospective views and any future "What this does well" surface on the comment card.';

COMMIT;

-- ============================================================================
-- After apply, verify with:
--
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'classifications' AND column_name = 'strength';
--
-- Expect: strength | text | YES (nullable; legacy rows pre-migration stay null).
-- ============================================================================
