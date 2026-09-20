-- ============================================================================
-- 030b_share_events_channel_expand.sql
-- ----------------------------------------------------------------------------
-- The article-page share UI in post.hbs uses 'x' (X / formerly Twitter)
-- and 'reddit' as channel labels. Migration 030 only allowed 'twitter';
-- expand the CHECK to accept both 'x' (new canonical) and 'twitter'
-- (kept for back-compat with any data captured before this expansion),
-- plus 'reddit'.
--
-- Idempotent: drops and recreates the constraint.
-- ============================================================================

BEGIN;

ALTER TABLE share_events DROP CONSTRAINT IF EXISTS share_events_channel_check;

ALTER TABLE share_events ADD CONSTRAINT share_events_channel_check
  CHECK (channel IN (
    'link',
    'x',
    'twitter',
    'facebook',
    'linkedin',
    'reddit',
    'email',
    'native'
  ));

COMMIT;
