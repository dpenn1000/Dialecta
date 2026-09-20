-- ============================================================================
-- 005_articles_table.sql
-- ----------------------------------------------------------------------------
-- Adds the `articles` table that holds the Dialecta-specific layer for each
-- article: AI analysis, author declaration (5 questions per the Editorial
-- Template), Stage 2.5 amendment data, wait window, and tier classification.
--
-- Ghost remains the source of truth for article body content. This table
-- references Ghost posts by ghost_post_id (text, the 24-char Mongo ObjectID
-- Ghost uses as its post ID). One-to-one mapping.
--
-- Hybrid column design:
--   - Hot fields that we filter or rank by are real columns: status,
--     declared_tier, ai_suggested_tier, final_tier.
--   - Richer structured data is jsonb: declaration (5 author questions),
--     ai_analysis (AI's full structured output).
--
-- Status lifecycle:
--   draft       -- saved but not yet classified by AI
--   classified  -- AI has analyzed; author is in Stage 2.5 amendment window
--   published   -- live on Ghost; visible to readers
--   reclassified -- community has shifted final_tier from initial value
--
-- Reclassification history (when it accumulates) goes into ai_analysis as an
-- 'analysis_history' array rather than a separate table. Yagni; we can split
-- to a dedicated table when reclassification volume justifies it.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS, DROP
-- POLICY IF EXISTS pattern.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS articles (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghost_post_id      text NOT NULL UNIQUE,
  author_member_id   text NOT NULL,

  status             text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','classified','published','reclassified')),

  declared_tier      tier,
  ai_suggested_tier  tier,
  final_tier         tier,

  declaration        jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_analysis        jsonb NOT NULL DEFAULT '{}'::jsonb,

  stage_2_5_choice   text
                       CHECK (stage_2_5_choice IS NULL
                              OR stage_2_5_choice IN ('amend','respond','as_is')),
  author_note        text,

  wait_until         timestamptz,

  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_ghost_post_id ON articles (ghost_post_id);
CREATE INDEX IF NOT EXISTS idx_articles_author       ON articles (author_member_id);
CREATE INDEX IF NOT EXISTS idx_articles_status       ON articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_final_tier   ON articles (final_tier)
  WHERE status = 'published';

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS articles_public_read ON articles;
CREATE POLICY articles_public_read ON articles
  FOR SELECT USING (status = 'published');

COMMENT ON TABLE articles IS
  'Per-article Dialecta classification + declaration data. Ghost stores the article body; this table tracks the AI analysis, author declaration (5 questions per the Editorial Template), Stage 2.5 amendment data, wait window, and final tier classification. ghost_post_id is the link key; one-to-one mapping with Ghost posts. The two pre-table articles (Maya On Doubt and Devotion, Daniel solar piece) are intentionally not backfilled here; they remain legacy until or unless retroactive analysis is decided on.';

COMMENT ON COLUMN articles.declaration IS
  'Author declaration shape: { core_claim, scope_boundary, strongest_objection, opinion_axes: [{axis_a, axis_b, type}] }. Filled by the editor at Stage 2.';

COMMENT ON COLUMN articles.ai_analysis IS
  'AI analysis shape: { core_claim_detected, alignment, alignment_note, tier_reason, specificity_score, emotion, tribal_markers, tribal_example, opposing_view_engaged, flagged_passages: [{passage, tier_pull, why}], axis_suggestions: [{axis_a, axis_b, type}], borderline_flag, borderline_other_tier, author_message }. Filled by /api/article/classify.';

COMMIT;

-- ============================================================================
-- After apply, sanity-check from any SQL client:
--
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name = 'articles';
--     -- 1 row
--
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'articles' ORDER BY ordinal_position;
--     -- Returns 13 columns: id, ghost_post_id, author_member_id, status,
--     -- declared_tier, ai_suggested_tier, final_tier, declaration,
--     -- ai_analysis, stage_2_5_choice, author_note, wait_until,
--     -- created_at, updated_at
-- ============================================================================
