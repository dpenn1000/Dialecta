-- ============================================================================
-- 021_comments_mentions.sql
-- ----------------------------------------------------------------------------
-- Adds structured @mention support to comments. Stage 1 (API side) of the
-- mention rollout; the composer @-picker (Stage 2, theme side) lands later.
--
-- Shape: an array of {member_id, display_name} objects, persisted as jsonb
-- on the comment row.
--   [
--     { "member_id": "abc-123-uuid", "display_name": "Daniel Penn" },
--     { "member_id": "def-456-uuid", "display_name": "Maya Chen" }
--   ]
--
-- Why jsonb on the comment row instead of a join table: for v1 we only
-- need the mention list to (a) fire notifications at submit time and (b)
-- let the feed renderer style @display_name spans in the body. Both are
-- per-comment reads. A join table makes sense once we want cross-comment
-- queries (e.g. "show me everywhere I've been mentioned") which we don't
-- have today; if/when we add that, migrate by deriving the join table
-- from this column.
--
-- API behavior:
--   - api/comment.js accepts a `mentions` field in the request body.
--     Presence (even empty array) tells the endpoint to use structured
--     mentions exclusively. Absence falls back to the conservative
--     free-text parser shipped earlier for backward compat with callers
--     that haven't updated.
--   - Notifications fire one per mentioned member_id, deduped against
--     the article author and parent comment author (createNotification's
--     self-actor guard handles the commenter mentioning themselves).
--
-- Composer behavior (pending Stage 2):
--   - When the composer textarea sees `@`, an autocomplete dropdown
--     queries /api/profile/_list?q=<typed> and lets the user pick a
--     member. Selection inserts `@<display_name>` in the body and adds
--     `{member_id, display_name}` to the structured mentions array.
--     Submit sends both body and mentions array to /api/comment.
-- ============================================================================

BEGIN;

ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS mentions jsonb NOT NULL DEFAULT '[]'::jsonb;

-- GIN index on mentions enables future "all comments mentioning member X"
-- queries via @> containment operator. Skipped for empty-mentions rows
-- so the index stays small.
CREATE INDEX IF NOT EXISTS idx_comments_mentions_gin
  ON comments USING gin (mentions) WHERE mentions != '[]'::jsonb;

COMMENT ON COLUMN comments.mentions IS
  'Array of {member_id, display_name} objects representing structured @mentions captured by the composer at submit time. The renderer styles matching @display_name spans in the body; the API fires one notification per member_id (deduped against article author and parent author).';

COMMIT;

-- ============================================================================
-- After apply:
--   1. Verify column added:
--        \d comments
--      (look for mentions jsonb in the column list)
--
--   2. No backfill needed. Existing rows default to '[]'.
--
--   3. The free-text parser in api/comment.js stays as a fallback for
--      callers that don't yet send structured mentions. Once the composer
--      ships in Stage 2 and starts always sending the `mentions` field
--      (even empty array), the parser becomes effectively dormant; it
--      can be retired in a follow-up cleanup.
-- ============================================================================
