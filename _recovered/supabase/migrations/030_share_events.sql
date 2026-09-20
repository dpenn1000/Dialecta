-- ============================================================================
-- 030_share_events.sql
-- ----------------------------------------------------------------------------
-- Per-click share log. One row per ambient-share click (and later per
-- celebration-moment share action). Drives the "which surfaces drive
-- shares" data feed for the future Tuning admin dashboard, and provides
-- the substrate for any social-graph features that want to know
-- "who shared what."
--
-- Schema:
--   member_id     nullable. Logged-out shares are valid signal too;
--                 we don't gate share on auth.
--   surface_type  enum-via-CHECK (profile / article / comment / quote /
--                 celebration). Each anchors a different surface_id type:
--                   profile      -> handle
--                   article      -> ghost_post_id
--                   comment      -> comment uuid
--                   quote        -> quote_id (slug)
--                   celebration  -> celebration event id
--   channel       enum-via-CHECK (link / twitter / facebook / linkedin /
--                 email / native). "link" = copy-to-clipboard;
--                 "native" = mobile navigator.share().
--
-- Indexes cover three query patterns:
--   1. Per-surface counts (which surfaces drive shares?)
--   2. Per-member activity (who shares most?)
--   3. Recent activity feed
--
-- RLS: service-role only at the policy layer; admins read aggregates via
-- the (future) tuning dashboard. No trigger functions, so no SECURITY
-- DEFINER advisor cleanup needed.
--
-- Idempotent.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS share_events (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     text,
  surface_type  text          NOT NULL CHECK (surface_type IN (
                                'profile', 'article', 'comment', 'quote', 'celebration'
                              )),
  surface_id    text          NOT NULL,
  channel       text          NOT NULL CHECK (channel IN (
                                'link', 'twitter', 'facebook', 'linkedin', 'email', 'native'
                              )),
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_events_surface
  ON share_events (surface_type, surface_id);
CREATE INDEX IF NOT EXISTS idx_share_events_member
  ON share_events (member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_share_events_created
  ON share_events (created_at DESC);

ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS share_events_service_only ON share_events;
CREATE POLICY share_events_service_only ON share_events
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE share_events IS
  'Per-click share log. One row per ambient-share click or celebration-moment share action. Service-role only at the policy level; admins read aggregates via the future tuning dashboard. surface_type + surface_id together identify the shared object; channel is which network.';

COMMIT;
