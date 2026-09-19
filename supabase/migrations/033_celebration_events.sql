-- 033_celebration_events.sql
--
-- OG-5 + 1.3-bis: celebration moments
-- ---------------------------------------------------------------------------
-- A celebration_event is an immutable, eager-logged milestone in a
-- contributor's life on Dialecta. Whenever one of seven trigger
-- events fires (first_comment, first_article, first_quote,
-- delta_acknowledged, tier_promoted, follower_milestone,
-- became_steward), a row is inserted server-side. The platform then:
--
--   1. Pops a celebration modal in-app (theme repo, Push 2 work)
--   2. Offers a shareable permalink at
--      /contributor/<handle>/moment/<id> (dialecta-next, Push 1)
--   3. Generates a unique OG image per event
--   4. Optionally records when the user dismissed the modal and
--      whether they shared the moment downstream (Facebook/Twitter)
--
-- The table is append-only conceptually. modal_dismissed_at and
-- shared_at are post-insert UPDATEs, but the event row itself
-- never gets deleted: celebrations become part of the
-- contributor's permanent history (feeds the future History Scroll
-- feature).
--
-- This migration is the foundation only. The triggers that insert
-- rows from comment.js / article submit / etc. land in a follow-up
-- alongside the modal component (Push 2).

CREATE TABLE celebration_events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           text NOT NULL,
  event_type          text NOT NULL CHECK (event_type IN (
    'first_comment',
    'first_article',
    'first_quote',
    'delta_acknowledged',
    'tier_promoted',
    'follower_milestone',
    'became_steward'
  )),
  -- Per-event-type free-form payload. Examples:
  --   first_comment       { comment_id, article_slug, article_title }
  --   first_article       { article_id, article_slug, article_title }
  --   first_quote         { quote_id }
  --   delta_acknowledged  { comment_id, article_slug, ack_member_id }
  --   tier_promoted       { article_id, article_slug, prior_tier, new_tier }
  --   follower_milestone  { count, follower_member_id }
  --   became_steward      { granted_by, role }
  -- The OG card / SSR page reads context to render the right phrasing.
  context             jsonb        NOT NULL DEFAULT '{}'::jsonb,
  occurred_at         timestamptz  NOT NULL DEFAULT now(),
  modal_dismissed_at  timestamptz,
  shared_at           timestamptz,
  created_at          timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX celebration_events_member_time ON celebration_events(member_id, occurred_at DESC);

-- Marker policy: this table is read by the public OG-card route, so
-- service-role access is sufficient. Aligns with the same security
-- pattern as share_events (no row-level user policies needed; the
-- API gates visibility).
ALTER TABLE celebration_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY celebration_events_service_role_all
  ON celebration_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE celebration_events IS
  'OG-5: milestone events that trigger the celebration modal + shareable OG card. Eager-logged at the moment the event occurs. Append-only; rows persist as part of the contributor history (feeds future History Scroll).';
