-- ============================================================================
-- 019_notifications_schema.sql
-- ----------------------------------------------------------------------------
-- Notification system foundation. Stage 1 of 5 (foundation, follows-trigger,
-- in-app surfaces, trigger wiring, email delivery).
--
-- Two tables:
--   notifications        per-member event records, in-app feed source
--   notification_prefs   per-member channel + cadence preferences
--
-- Channels:
--   in-app  always on, persistent. Bell + drawer + /notifications page.
--   email   opt-in. Daily digest sent via Vercel cron + Resend (Stage 5).
--   sms     not in scope for v1 (deferred per First Quills planning).
--
-- Why notification types live as text + CHECK rather than a real ENUM:
-- adding a new trigger type later is a config change, not an ALTER TYPE.
-- Same trade-off the feed_events table made in migration 001.
--
-- Why prefs live as a single jsonb column rather than a wide table: the
-- channels matrix grows when new triggers are added. Wide table = migration
-- per trigger; jsonb = one source-of-truth shape that lives in the bundle's
-- settings UI and a server-side default (api/_notifications.js DEFAULT_PREFS).
--
-- Email-delivery columns ship in this migration even though the digest
-- worker doesn't land until Stage 5. The schema is forward-compatible so
-- Stage 5 doesn't need a follow-on migration; the worker just starts
-- updating fields that have been quietly tracked since Stage 1.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. notifications
-- ────────────────────────────────────────────────────────────────────────────
-- recipient_member_id is the contributor who sees the notification.
-- actor_member_id is the contributor who caused it (commenter, follower, etc.);
-- nullable for system-originated events (editorial actions, milestone alerts).
-- target_url is a deep link the bell drawer + email render as the click target.
-- payload denormalizes the bits needed to render the row without further joins
-- (actor display_name, article title, comment excerpt, etc.).

CREATE TABLE IF NOT EXISTS notifications (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  recipient_member_id   text          NOT NULL,
  actor_member_id       text,

  type                  text          NOT NULL CHECK (type IN (
                                        'comment_on_article',
                                        'reply_to_comment',
                                        'mention',
                                        'new_follower',
                                        'follow_new_article',
                                        'editorial'
                                      )),

  target_type           text          CHECK (target_type IN (
                                        'article','comment','profile','order','axis'
                                      )),
  target_id             text,
  target_url            text,
  payload               jsonb         NOT NULL DEFAULT '{}'::jsonb,

  is_read               boolean       NOT NULL DEFAULT false,
  read_at               timestamptz,

  -- Email delivery state machine. Default 'pending' = eligible for the next
  -- digest run if the recipient has email enabled for this type. Worker
  -- transitions to 'sent' (or 'skipped'/'failed'/'not_applicable') once the
  -- digest containing this row has been delivered. Rows are written with
  -- email_status='skipped' upfront when the recipient's prefs disable email
  -- for this type, so the worker query stays simple (status='pending' only).
  email_status          text          NOT NULL DEFAULT 'pending' CHECK (email_status IN (
                                        'pending','queued','sent','skipped','failed','not_applicable'
                                      )),
  email_sent_at         timestamptz,

  created_at            timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_recent
  ON notifications (recipient_member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON notifications (recipient_member_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_email_pending
  ON notifications (created_at) WHERE email_status = 'pending';

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- All access via API service role. A SELECT policy allowing members to read
-- their own rows could be added in Phase 2 if we ever expose this table to
-- the client directly via Supabase auth (Phase 1 always goes through Vercel).

COMMENT ON TABLE notifications IS
  'Per-member event records. Backs the in-app bell, drawer, /notifications page, and the email digest worker (Stage 5). One row per (recipient, event) pair; the article fan-out for follow_new_article writes one row per follower.';
COMMENT ON COLUMN notifications.payload IS
  'Denormalized rendering bits. Conventional keys: actor_name, actor_avatar_url, article_title, article_url, comment_excerpt, order_label. Avoids joins at render time.';
COMMENT ON COLUMN notifications.email_status IS
  'Workflow position for digest delivery. pending = eligible for next digest, queued = picked up by worker, sent = delivered, skipped = recipient has email disabled for this type, failed = delivery error (retried), not_applicable = type never sends email (reserved for future).';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. notification_prefs
-- ────────────────────────────────────────────────────────────────────────────
-- One row per member. Lazy-created on first GET if missing (mirrors the
-- profiles lazy-create pattern). email_address is cached from Ghost so the
-- digest worker does not have to round-trip to Ghost Admin per send.
--
-- prefs jsonb shape (defaults; settings UI writes patches):
--   {
--     "email_enabled": true,
--     "digest_hour": 9,                       -- TUNING: per-user digest delivery hour (0-23)
--     "timezone": "America/New_York",
--     "channels": {
--       "comment_on_article":  { "inapp": true, "email": true  },
--       "reply_to_comment":    { "inapp": true, "email": true  },
--       "mention":             { "inapp": true, "email": true  },
--       "new_follower":        { "inapp": true, "email": false },
--       "follow_new_article":  { "inapp": true, "email": false },
--       "editorial":           { "inapp": true, "email": true  }
--     }
--   }

CREATE TABLE IF NOT EXISTS notification_prefs (
  member_id           text          PRIMARY KEY,
  email_address       text,
  prefs               jsonb         NOT NULL DEFAULT '{}'::jsonb,
  last_digest_at      timestamptz,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE notification_prefs IS
  'Per-member channel and cadence preferences. Backs the Notifications section of /profile/ settings and the email digest worker (Stage 5). Lazy-created on first GET; defaults baked into the API helper, not the DB column default, so changes to defaults flow without a migration.';
COMMENT ON COLUMN notification_prefs.prefs IS
  'Channels matrix + email_enabled + digest_hour + timezone. Shape documented in api/_notifications.js (DEFAULT_PREFS). Settings UI sends partial patches; the PATCH endpoint deep-merges over the stored shape.';
COMMENT ON COLUMN notification_prefs.last_digest_at IS
  'Set by the digest worker after a successful send. Used to scope the next digest window so we never re-send the same notification.';

COMMIT;

-- ============================================================================
-- After apply:
--   1. Verify tables present:
--        \d notifications
--        \d notification_prefs
--
--   2. No data backfill needed. notification_prefs lazy-creates on first
--      /api/notifications/prefs GET; notifications populate as triggers
--      get wired in Stage 4.
--
--   3. Stage 5 (email digest) will add a Vercel cron route + Resend
--      integration. No further schema changes needed for that work.
-- ============================================================================
