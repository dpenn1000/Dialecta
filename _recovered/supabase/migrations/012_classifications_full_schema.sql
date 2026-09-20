-- ============================================================================
-- 012_classifications_full_schema.sql
-- ----------------------------------------------------------------------------
-- Adds the Stage A reasoning fields and Stage B borderline fields to the
-- classifications table.
--
-- The api/comment.js endpoint already writes these columns on insert (see
-- step 4 of api/comment.js). The baseline schema documented in
-- 000_baseline_documentation.sql lists only the original fields; this
-- migration adds the rest of the shape called for in the Classification
-- Engine Specification.
--
-- Idempotent: every column uses ADD COLUMN IF NOT EXISTS. If your
-- production schema already has these columns (added out-of-band via the
-- Supabase dashboard prior to this migrations folder existing), this
-- migration is a no-op.
--
-- See:
--   * Dialecta_Classification_Engine_Specification.md — defines each field
--   * api/comment.js step 4 — the canonical insert shape
-- ============================================================================

BEGIN;

ALTER TABLE classifications
  ADD COLUMN IF NOT EXISTS claim_text             text,
  ADD COLUMN IF NOT EXISTS specificity_score      smallint,
  ADD COLUMN IF NOT EXISTS emotion                text,
  ADD COLUMN IF NOT EXISTS tribal_markers         boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tribal_example         text,
  ADD COLUMN IF NOT EXISTS article_engagement     text,
  ADD COLUMN IF NOT EXISTS opposing_view_engaged  text,
  ADD COLUMN IF NOT EXISTS borderline_flag        boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS borderline_other_tier  text,
  ADD COLUMN IF NOT EXISTS commenter_message      text;

-- Index for the borderline-flag-driven community reclassification queue.
-- The Classification Engine Spec calls for borderline-flagged comments
-- to be preferentially surfaced for community vote. A partial index on
-- the flag = true subset is the right shape.
CREATE INDEX IF NOT EXISTS idx_classifications_borderline
  ON classifications (borderline_flag)
  WHERE borderline_flag = true;

-- Document the load-bearing fields for future readers.
COMMENT ON COLUMN classifications.claim_text IS
  'Stage A: the claim the engine extracted from the comment, paraphrased or quoted. Null when no claim was found.';
COMMENT ON COLUMN classifications.specificity_score IS
  'Stage A: claim specificity 0-3 per Classification Engine Spec. 0=no claim, 1=vague, 2=specific, 3=developed with reasoning/evidence.';
COMMENT ON COLUMN classifications.emotion IS
  'Stage A: emotional register. One of Low / Medium / High.';
COMMENT ON COLUMN classifications.borderline_flag IS
  'Stage B: true when the engine read the comment as borderline between two tiers. Drives community reclassification queue priority. Never surfaced as a public label per the design decision (compose-time Growth Frame coaching only).';
COMMENT ON COLUMN classifications.borderline_other_tier IS
  'Stage B: when borderline_flag is true, the alternative tier the engine considered. Surfaced to the commenter at compose time as Growth Frame coaching, never on the public card.';
COMMENT ON COLUMN classifications.commenter_message IS
  'Stage B: 1-2 sentence observational message shown to the commenter at Stage 1 reflection. Tone: observational, not evaluative — "this reads as Heat" not "your comment is Heat."';

COMMIT;

-- ============================================================================
-- After apply, sanity check from any SQL client:
--
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'classifications'
--   ORDER BY ordinal_position;
--
-- Expect: id, comment_id, ai_suggested_tier, self_declared_tier, final_tier,
-- classified_at, plus the 10 columns this migration ensures exist.
-- ============================================================================
