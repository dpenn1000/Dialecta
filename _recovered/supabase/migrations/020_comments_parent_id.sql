-- ============================================================================
-- 020_comments_parent_id.sql
-- ----------------------------------------------------------------------------
-- Adds reply threading to comments. A comment with a non-null parent_id is a
-- reply to the comment that parent_id points to. Top-level comments leave
-- parent_id null.
--
-- Why FK with NO ACTION (the default): if a parent comment is deleted, the
-- replies stay in place with parent_id pointing to a gone row, which the API
-- can detect and render as "in reply to [deleted]". Hard cascade-delete
-- would orphan the reply text without a trace, which is worse for an
-- editorial platform that values append-only history.
--
-- Why nullable: existing comment rows are top-level (no replies before this
-- migration), so the column defaults to null and the backfill is a no-op.
--
-- The reply_to_comment notification trigger in api/comment.js fires when
-- this column is non-null on insert. Mounted now so future composer changes
-- land into a working notification path automatically.
-- ============================================================================

BEGIN;

ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id);

CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON comments (parent_id) WHERE parent_id IS NOT NULL;

COMMENT ON COLUMN comments.parent_id IS
  'When non-null, this comment is a reply to the comment with that id. Top-level comments leave parent_id null. FK has NO ACTION on delete; replies survive parent deletion as "in reply to [deleted]" so editorial history stays intact.';

COMMIT;

-- ============================================================================
-- After apply:
--   1. Verify column added:
--        \d comments
--      (look for parent_id uuid in the column list)
--
--   2. No backfill needed. All existing comments are top-level (parent_id null).
--
--   3. Composer changes (theme: dialecta-private-draft.jsx) to actually
--      surface a "Reply" affordance and pass parent_id are a separate
--      iteration. The notification trigger in api/comment.js is forward-
--      compatible: when the composer starts sending parent_id, the
--      reply_to_comment notification fires automatically with no further
--      API change.
-- ============================================================================
