-- ============================================================================
-- 018_feedback_items.sql
-- ----------------------------------------------------------------------------
-- The feedback queue. User-submitted bugs, ideas, content notes, and
-- questions land here. Admins (Reviewers and above) triage them via
-- /dev-admin/ Feedback. The "no input dismissed without review" promise is
-- enforced by the status state machine: items default to 'new'; leaving 'new'
-- requires an explicit triage decision, including 'declined' (with reason).
--
-- Three orthogonal axes (kept separate per industry RBAC-for-feedback norms):
--   type      kind of input        bug / idea / content / question / nit
--   priority  urgency              critical / high / medium / low
--   status    workflow position    new / triaged / approved / in_progress
--                                  / shipped / declined / duplicate
--
-- Reporter identity:
--   For members:     reporter_member_id = ghost_member_id, display_name auto-pulled
--   For anonymous:   reporter_member_id NULL, reporter_display_name optional
--   For manual seed: reporter_member_id NULL, display_name set explicitly
--                    (e.g. friend-of-platform feedback collected verbally)
--
-- captured_metadata jsonb holds whatever the client could collect at submit
-- time: device, browser, viewport, page URL, recent console errors. Schema
-- intentionally loose (jsonb) so we can extend without migration churn.
--
-- This migration also seeds the queue with Tom Gaetani's 2026-04-30 morning
-- feedback (verbal, via text to Daniel). These rows are flagged via
-- captured_metadata.source = 'manual_seed' so they're distinguishable from
-- live submissions when we eventually filter or report.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. feedback_items
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feedback_items (
  id                       uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type: what kind of input this is.
  type                     text          NOT NULL DEFAULT 'idea'
                                          CHECK (type IN ('bug','idea','content','question','nit')),

  -- Priority/severity: how urgent.
  priority                 text          NOT NULL DEFAULT 'medium'
                                          CHECK (priority IN ('critical','high','medium','low')),

  -- Status: workflow position.
  status                   text          NOT NULL DEFAULT 'new'
                                          CHECK (status IN ('new','triaged','approved','in_progress','shipped','declined','duplicate')),

  title                    text,
  body                     text          NOT NULL,

  -- Reporter (one of):
  --   - logged-in member: reporter_member_id is the Ghost uuid
  --   - anonymous visitor: both null
  --   - manual seed (friend feedback, support email): reporter_display_name
  --     and reporter_email set, reporter_member_id null
  reporter_member_id       text,
  reporter_display_name    text,
  reporter_email           text,

  -- Auto-captured at submit time. Loose jsonb so we can layer in fields
  -- (screenshot URL, session replay id, console errors, etc.) without
  -- migration churn. Conventional keys: source, device, browser, os,
  -- viewport, page_url, referrer, console_errors, user_agent.
  captured_metadata        jsonb         NOT NULL DEFAULT '{}'::jsonb,

  -- Triage fields, set when status moves out of 'new'. triage_note is
  -- REQUIRED (enforced at app layer) when status = 'declined', so the
  -- "no input dismissed without review" promise has a paper trail.
  triage_note              text,
  owner_profile_id         uuid          REFERENCES profiles(id),
  acknowledged_at          timestamptz,
  acknowledged_by          uuid          REFERENCES profiles(id),
  status_changed_at        timestamptz   NOT NULL DEFAULT now(),
  status_changed_by        uuid          REFERENCES profiles(id),

  submitted_at             timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_items_status        ON feedback_items (status);
CREATE INDEX IF NOT EXISTS idx_feedback_items_priority      ON feedback_items (priority);
CREATE INDEX IF NOT EXISTS idx_feedback_items_type          ON feedback_items (type);
CREATE INDEX IF NOT EXISTS idx_feedback_items_submitted_at  ON feedback_items (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_items_unack         ON feedback_items (submitted_at DESC) WHERE acknowledged_at IS NULL;

COMMENT ON TABLE feedback_items IS
  'User feedback queue. Submissions from /under-construction banner, manual seeds for verbal feedback, and any future intake channels all land here. Triaged via /dev-admin/ Feedback by anyone with the feedback.triage capability.';
COMMENT ON COLUMN feedback_items.type IS
  'What kind of input. bug=something broken, idea=feature/enhancement, content=editorial issue (typo, factual), question=needs answer, nit=small observation.';
COMMENT ON COLUMN feedback_items.priority IS
  'Urgency. critical=fire-alarm/page-blocking, high=front-of-queue, medium=normal, low=parking-lot.';
COMMENT ON COLUMN feedback_items.status IS
  'Workflow position. new=untriaged, triaged=read but no decision yet, approved=will be addressed, in_progress=active work, shipped=resolved, declined=intentionally not pursuing (triage_note required), duplicate=merged into another item (triage_note should reference original).';
COMMENT ON COLUMN feedback_items.captured_metadata IS
  'Loose jsonb for context captured at submit time. Conventional keys: source ("submit_form"|"manual_seed"|"email"|"bug_report"), device, browser, os, viewport ({w,h}), page_url, referrer, console_errors (array), user_agent.';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Row-Level Security
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;
-- All access via API service role. Future: a SELECT policy could allow
-- members to read their own submissions if we surface a "my submitted
-- feedback" view in /profile/.

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Seed: Tom Gaetani's 2026-04-30 morning feedback
-- ----------------------------------------------------------------------------
-- Tom (digital strategy / experience designer, friend of platform) provided
-- verbal feedback via text to Daniel on the morning of 2026-04-30 after
-- browsing dialecta.org for the first time. Seeding directly because Tom
-- doesn't have a member account yet; once he signs up, future submissions
-- will route through the proper /api/feedback endpoint.
--
-- Idempotent: each row's id is deterministic so re-running the migration is
-- a no-op. Use ON CONFLICT to skip if already inserted.
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO feedback_items
  (id, type, priority, status, title, body, reporter_display_name, captured_metadata, submitted_at)
VALUES
  (
    'e80a0001-0000-0000-0000-000000000001'::uuid,
    'bug',
    'medium',
    'new',
    'Sign-up form cursor misalignment',
    'Typing cursor on the sign-up form is not aligned to where letters appear in the input box. Submission worked fine functionally, but the cursor position drifts from the rendered text. Likely a font-size or line-height interaction in the Ghost Portal modal or the custom signup styling. Browser/OS not specified by reporter; would need follow-up to reproduce.',
    'Tom Gaetani',
    jsonb_build_object(
      'source',   'manual_seed',
      'via',      'text feedback to Daniel',
      'date',     '2026-04-30 morning',
      'verbatim', 'the typing cursor was not aligned to the box that the letters appear in as you type. Weird performance of the cursor.',
      'page',     'sign-up form (Ghost Portal modal)'
    ),
    '2026-04-30 12:00:00+00'::timestamptz
  ),
  (
    'e80a0001-0000-0000-0000-000000000002'::uuid,
    'idea',
    'low',
    'new',
    'Add imagery to break up content density',
    'Site is content-heavy. Consider adding imagery of people or things to ground the site while topics get pretty deep. Editorial register is deliberately spare (brass+wood+paper); stock people-photos would erode the periodical feel. If we ever wanted visual rhythm, archetype glyphs or fingerprint thumbnails might add it without going photo-heavy.',
    'Tom Gaetani',
    jsonb_build_object(
      'source',         'manual_seed',
      'via',            'text feedback to Daniel',
      'date',           '2026-04-30 morning',
      'verbatim',       'it is nice but content heavy... an alternative is to break the site up with some additional imagery of people or things that help ground the site while the topics get pretty deep. Just food for thought.',
      'editorial_note', 'register is intentional; declining unless a brass-aligned middle ground emerges'
    ),
    '2026-04-30 12:00:01+00'::timestamptz
  ),
  (
    'e80a0001-0000-0000-0000-000000000003'::uuid,
    'idea',
    'low',
    'new',
    'Save articles for reading later',
    'Add functionality to mark an article for reading later. Reach/retention feature, useful once contributor cohort is established and reading habits form.',
    'Tom Gaetani',
    jsonb_build_object(
      'source',   'manual_seed',
      'via',      'text feedback to Daniel',
      'date',     '2026-04-30 morning',
      'verbatim', 'allow people to mark an article for reading later'
    ),
    '2026-04-30 12:00:02+00'::timestamptz
  ),
  (
    'e80a0001-0000-0000-0000-000000000004'::uuid,
    'idea',
    'low',
    'new',
    'Social sharing from articles',
    'Allow posting to social platforms from this site to expand conversational reach. Reach feature; not aligned with First Quills invited-launch positioning. Revisit at public-launch milestone.',
    'Tom Gaetani',
    jsonb_build_object(
      'source',   'manual_seed',
      'via',      'text feedback to Daniel',
      'date',     '2026-04-30 morning',
      'verbatim', 'post to social from this site to expand conversational reach'
    ),
    '2026-04-30 12:00:03+00'::timestamptz
  ),
  (
    'e80a0001-0000-0000-0000-000000000005'::uuid,
    'idea',
    'low',
    'new',
    'SEO / information architecture review',
    'Information architecture optimization to maximize search rankings. Reporter notes (correctly) that AI is reshaping the SEO landscape as search results return AI-synthesized answers rather than blue-link lists. Defer until public launch; First Quills optimizes for invited contributor depth not search reach.',
    'Tom Gaetani',
    jsonb_build_object(
      'source',         'manual_seed',
      'via',            'text feedback to Daniel',
      'date',           '2026-04-30 morning',
      'verbatim',       'there are ways you may be able to adjust the information architecture to maximize showing up higher in search results. Though Ai is turning this industry on its heads.',
      'reporter_role',  'digital strategy / experience designer (day job)'
    ),
    '2026-04-30 12:00:04+00'::timestamptz
  ),
  (
    'e80a0001-0000-0000-0000-000000000006'::uuid,
    'nit',
    'medium',
    'new',
    'Comment surface not visible enough on first read',
    'Tom suggested adding per-article comments to drive engagement. Dialecta already has the Discourse Layer mounted on post.hbs (Stage 1 shipped 2026-04-29), but Tom did not see it on his first browse. Possible causes: he stayed on /articles/ list view and did not drill into a single article; the comment surface does not render for non-members; or the affordance to engage is not visually prominent enough. Worth confirming which article(s) he viewed and whether the discourse mount renders for guests.',
    'Tom Gaetani',
    jsonb_build_object(
      'source',   'manual_seed',
      'via',      'text feedback to Daniel',
      'date',     '2026-04-30 morning',
      'verbatim', 'if you are looking for more interaction visitors, you could add functionality to add comments on each article',
      'note',     'feature exists; this is a discoverability / first-read visibility issue, not a missing feature'
    ),
    '2026-04-30 12:00:05+00'::timestamptz
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- After apply:
--   1. Verify Tom's seed loaded (expect 6 rows):
--        SELECT type, priority, title FROM feedback_items
--         WHERE captured_metadata->>'source' = 'manual_seed'
--         ORDER BY submitted_at;
--
--   2. /dev-admin/ Feedback tab now reads from this table via
--      /api/admin/feedback (added in this round).
--
--   3. Submission flow (members + anonymous via under-construction banner)
--      and full triage controls (status changes, assign, decline-with-reason)
--      ship in subsequent rounds. v1 surface = read-only list with metadata
--      drilldown.
-- ============================================================================
