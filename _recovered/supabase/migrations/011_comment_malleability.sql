-- ============================================================================
-- 011_comment_malleability.sql
-- ----------------------------------------------------------------------------
-- Adds 60-minute malleability window infrastructure to the comments table.
--
-- Per canonical Discourse Layer commitment (Coherence Audit Domain 6,
-- user-confirmed 2026-04-27): a comment is editable for 60 minutes after
-- publication, then hardens into the public record. The edit endpoint and
-- the live malleability counter both depend on the hardened_at timestamp.
--
-- Three founding goals of the wait architecture (also per audit, user-direction):
--   1. Avoid the "oops I wish I hadn't sent that email" scenario.
--   2. Reduce the culture of quick dopamine hits and instant gratification.
--   3. Remove the heated-post-then-delete / anonymity culture of typical
--      social media. Public refinement (append on the article side, reply on
--      the comment side once threading lands) is preferred over erasure.
--
-- Comment-side scope: edit/rewrite/delete during the 60-min window only.
-- After hardening, the original stands. Append-after-hardening is article-
-- side only and not part of this migration.
--
-- Schema addition:
--   * comments.hardened_at  timestamptz NOT NULL DEFAULT now() + interval '1 hour'
--   * idx_comments_hardened_at  for fast malleability checks on read
--
-- Idempotent: every statement uses IF NOT EXISTS / IF EXISTS guards. Safe
-- to re-run.
-- ============================================================================

BEGIN;

-- 1. Add the column nullable so the backfill UPDATE can run without
--    violating NOT NULL on existing rows.
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS hardened_at timestamptz;

-- 2. Backfill existing rows. They are all old enough to be considered
--    already-hardened; setting hardened_at = now() means the malleability
--    check (now() < hardened_at) returns false on the next request.
UPDATE comments SET hardened_at = now() WHERE hardened_at IS NULL;

-- 3. Lock down: NOT NULL + default for new inserts. Default is computed at
--    insert time, so a row inserted at 14:00:00 hardens at 15:00:00. The
--    api/comment.js endpoint does not need to set hardened_at explicitly;
--    the database handles it.
ALTER TABLE comments
  ALTER COLUMN hardened_at SET NOT NULL,
  ALTER COLUMN hardened_at SET DEFAULT (now() + interval '1 hour');

-- 4. Index. The malleability check (now() < hardened_at) is the hot read
--    path for the edit endpoint and the live card render. A simple btree
--    index on hardened_at is the right call. Partial indexes with now()
--    in the predicate are evaluated at index-creation time, not query
--    time, and would require periodic REINDEX to stay accurate.
CREATE INDEX IF NOT EXISTS idx_comments_hardened_at
  ON comments (hardened_at);

-- 5. Document the column for future readers.
COMMENT ON COLUMN comments.hardened_at IS
  'Timestamp at which the comment hardens into the public record. Edit and delete operations refuse once now() >= hardened_at. Default = row insert time + 1 hour. Per Discourse Layer canonical 60-min malleability commitment (see Coherence Audit Domain 6).';

COMMIT;

-- ============================================================================
-- After apply, sanity check from any SQL client:
--
--   SELECT id, published_at, hardened_at,
--          (now() < hardened_at) AS still_malleable
--   FROM comments
--   ORDER BY hardened_at DESC
--   LIMIT 5;
--
-- Expect: existing rows show still_malleable = false. Any row inserted via
-- /api/comment after the migration applies shows still_malleable = true
-- for ~60 minutes after its insert.
-- ============================================================================
