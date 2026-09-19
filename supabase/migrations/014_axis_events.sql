-- ============================================================================
-- 014_axis_events.sql
-- ----------------------------------------------------------------------------
-- Creates the axis_events table — the immutable append-only ledger that
-- backs every contributor's Fingerprint per Dialecta_Data_Architecture.md
-- and Dialecta_Axis_Mapping_v1.md.
--
-- Schema gap addressed: the Data Architecture spec described axis_events
-- as designed-for-production from day one, but no migration ever created
-- the table. Migration 001 created feed_events, follows, sparring_partners,
-- opinion_map_positions but not axis_events. The seed axis_scores rows
-- for Maya/Wen/Anselm were inserted directly by migration 002 with no
-- ledger backing them. This migration finally creates the table so live
-- comments can write events; seed scores remain untouched (recompute is
-- per-member and seeds don't post real comments).
--
-- One row per (member, comment, axis) where the comment's classification
-- triggered that axis per the v1 mapping. Up to 6 rows per comment (all
-- axes touched), down to 0 (Breach is suppressed entirely).
--
-- Idempotent: every CREATE uses IF NOT EXISTS.
--
-- See:
--   * Dialecta_Axis_Mapping_v1.md — canonical mapping function
--   * Dialecta_Data_Architecture.md §3 (axis_events) — table contract
--   * api/_axis-mapping.js — implementation + TUNING annotations
--   * api/comment.js step 5 (after this migration) — call site
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS axis_events (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         text           NOT NULL,
  axis              axis           NOT NULL,
  classification_id uuid           NOT NULL REFERENCES classifications(id) ON DELETE CASCADE,
  comment_id        uuid           NOT NULL REFERENCES comments(id)        ON DELETE CASCADE,
  tier              tier           NOT NULL,
  topic             text,
  created_at        timestamptz    NOT NULL DEFAULT now()
);

-- The hot read path is "give me everything for member X grouped by axis"
-- — that's the axis_scores recompute.
CREATE INDEX IF NOT EXISTS idx_axis_events_member_axis
  ON axis_events (member_id, axis);

-- Edit / re-classification path: when a comment is re-classified within
-- its malleability window, prior events for that classification get
-- deleted before the new ones are appended.
CREATE INDEX IF NOT EXISTS idx_axis_events_classification
  ON axis_events (classification_id);

CREATE INDEX IF NOT EXISTS idx_axis_events_comment
  ON axis_events (comment_id);

-- axis_scores needs a UNIQUE(member_id, axis) for the upsert pattern in
-- recomputeAxisScores. The table was created without it; add it now.
-- DO block guards against the case where the constraint already exists
-- under a different name.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'axis_scores'::regclass
      AND contype  = 'u'
      AND conname  = 'axis_scores_member_axis_unique'
  ) THEN
    ALTER TABLE axis_scores
      ADD CONSTRAINT axis_scores_member_axis_unique UNIQUE (member_id, axis);
  END IF;
END $$;

COMMENT ON TABLE axis_events IS
  'Immutable append-only ledger of contributor pillar events. One row per (member, comment, axis) per the canonical mapping in Dialecta_Axis_Mapping_v1.md. axis_scores is recomputed by replaying this ledger for the affected member after each comment.';

COMMENT ON COLUMN axis_events.topic IS
  'Article topic slug, populated only for Reach events. Tracks distinct topics the member has engaged. Other axes leave this null.';

COMMIT;

-- ============================================================================
-- After apply, verify with:
--
--   SELECT count(*) FROM axis_events;        -- expect 0 (fresh table)
--   SELECT * FROM information_schema.columns
--     WHERE table_name = 'axis_events' ORDER BY ordinal_position;
--
-- And check the unique constraint:
--   SELECT conname FROM pg_constraint
--     WHERE conrelid = 'axis_scores'::regclass AND contype = 'u';
-- ============================================================================
