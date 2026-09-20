-- ============================================================================
-- 025_tier_nominations.sql
-- ----------------------------------------------------------------------------
-- The community reclassification ledger. Adds the third leg of the three-input
-- final-tier model specified in Dialecta_Article_Editorial_Template.md
-- (lines 109-117) and Dialecta_Classification_Engine_Specification.md
-- (lines 220-226):
--
--   AI suggested tier      — primary signal (already wired)
--   Community vote         — primary signal (this migration)
--   Author/Commenter self  — secondary signal (already wired)
--
-- Each row is one member's structured judgment that a comment belongs in a
-- different tier than the engine assigned. Three fields per the spec:
--   target_tier — the tier the nominator thinks fits
--   reason_key  — a predefined reason from the 7-option list (the reading-
--                 through-reasons step is itself an educational mechanism per
--                 Discourse_Layer_UX.md line 233; do NOT add free-form reason
--                 substitution paths)
--   note        — optional 140-char clarification
--
-- The unique constraint on (comment_id, member_id) means re-nominating
-- replaces the prior nomination rather than stacking. Members change their
-- mind; the ledger reflects current judgment, not history. (If the audit/
-- replay use case ever justifies it, an immutable history table can be
-- layered on top — for v1 this is the simpler shape that matches how
-- nominations are actually used.)
--
-- Resolution logic lives in api/comment/[id]/nominate.js, not in DB triggers.
-- Each insert/update queries tallies and decides whether to flip
-- classifications.final_tier per the NOMINATION_THRESHOLD_TO_SHIFT and
-- NOMINATION_THRESHOLD_BREACH TUNING knobs. Keeping resolution in app code
-- is consistent with the existing _axis-mapping.js pattern.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS tier_nominations (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  comment_id    uuid          NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  member_id     text          NOT NULL,

  -- The tier the nominator thinks the comment should be in. Same enum as
  -- classifications.final_tier. Including 'breach' — Breach nominations are
  -- handled by the same mechanism as any other tier change, with an extra
  -- warning panel surfaced client-side.
  target_tier   text          NOT NULL
                              CHECK (target_tier IN ('forum','spark','echo','fog','heat','stance','breach')),

  -- Predefined reason. Verbatim from RESPONSE_REASONS in
  -- src/dialecta-private-draft.jsx, which is itself the canonical list from
  -- Article_Editorial_Template.md lines 152-158. Do NOT extend without also
  -- updating the client list and the educational reading flow that depends
  -- on reading them in order.
  reason_key    text          NOT NULL
                              CHECK (reason_key IN (
                                'specific_claim',
                                'engages_content',
                                'new_idea',
                                'emotional_only',
                                'group_signal',
                                'unclear',
                                'other'
                              )),

  -- Optional note. 140 chars max per spec; empty string normalized to NULL
  -- by the API layer so this CHECK enforces both shapes.
  note          text          CHECK (note IS NULL OR char_length(note) <= 140),

  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),

  -- One active nomination per member per comment. Re-nominating updates
  -- the existing row (UPSERT pattern) rather than stacking duplicates.
  UNIQUE (comment_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_tier_nominations_comment_id
  ON tier_nominations (comment_id);

CREATE INDEX IF NOT EXISTS idx_tier_nominations_member_id
  ON tier_nominations (member_id);

-- Tally query helper: nominations grouped by (comment_id, target_tier) is
-- the hot path for the resolution check and the feed augmentation.
CREATE INDEX IF NOT EXISTS idx_tier_nominations_comment_target
  ON tier_nominations (comment_id, target_tier);

COMMENT ON TABLE tier_nominations IS
  'Community reclassification ledger — the third leg of the three-input final tier model. One row = one member''s structured judgment that a comment belongs in a different tier than the engine assigned. UNIQUE(comment_id, member_id) means re-nominating replaces, not stacks. Resolution logic lives in api/comment/[id]/nominate.js.';

COMMENT ON COLUMN tier_nominations.target_tier IS
  'The tier the nominator thinks the comment should be in. Same enum as classifications.final_tier. Breach nominations use this same column with an extra warning panel surfaced client-side.';

COMMENT ON COLUMN tier_nominations.reason_key IS
  'Predefined reason from the 7-option list. Reading through them in order is an educational mechanism per Discourse_Layer_UX.md line 233 — do NOT add a free-form-only escape path. ''other'' opens an additional text field but the structured reason still anchors the nomination.';

COMMENT ON COLUMN tier_nominations.note IS
  'Optional clarifying note. 140 chars max per spec. Empty string is normalized to NULL by the API.';

-- ────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- All access is via API service role. RLS is enabled to match the platform
-- pattern (axis_events, classifications, etc.) and to harden against any
-- future direct anon-key path.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE tier_nominations ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================================================
-- After apply:
--   1. Verify table:
--        \d tier_nominations
--      (look for the four CHECK constraints + the UNIQUE + three indexes)
--
--   2. No backfill needed. New surface; starts empty.
--
--   3. The api/comment/[id]/nominate.js endpoint is the only writer.
--      api/comments.js reads tallies and the viewer's own nomination.
--
--   4. Resolution behavior on first nomination flip: when accumulated
--      nominations on a single target_tier cross NOMINATION_THRESHOLD_TO_SHIFT
--      (3 for non-Breach, 5 for Breach), classifications.final_tier flips
--      to that tier. The original commenter sees the change immediately in
--      v1; the "author Stage 2.5 wait window" mechanic from spec line 165
--      is a Phase 2 refinement.
--
--   5. Axis events: a calibration event is appended for the original
--      commenter when the community shifts their tier. This is the
--      Calibration axis finally getting its full signal — until now it has
--      only fired from compose-time specificity, not from community-checked
--      calibration as the Fingerprint spec intended.
-- ============================================================================
