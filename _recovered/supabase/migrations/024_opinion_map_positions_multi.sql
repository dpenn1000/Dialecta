-- ============================================================================
-- 023_opinion_map_positions_multi.sql
-- ----------------------------------------------------------------------------
-- Extends opinion_map_positions to support:
--   1. Multi-map articles (an article can have up to 2 maps; each gets its
--      own placement row per reader-stage)
--   2. The 'binary' map type (added in v2.0 of the opinion-mapper skill)
--
-- Changes:
--   - Add map_index integer column (defaults 0 for back-compat).
--   - Replace UNIQUE (reader_id, article_id, stage) with
--     UNIQUE (reader_id, article_id, map_index, stage).
--   - Replace map_type CHECK to include 'binary'.
--
-- Coordinates shape varies by map_type:
--   cartesian → {"x": 0.0..1.0, "y": 0.0..1.0}
--   ternary   → {"a": 0..1, "b": 0..1, "c": 0..1} with a+b+c = 1.0
--   binary    → {"x": 0.0..1.0}
--
-- Idempotent.
-- ============================================================================

BEGIN;

-- 1. Add map_index column. Default 0 keeps existing single-map placements
--    valid. Existing rows get index 0 automatically.
ALTER TABLE opinion_map_positions
  ADD COLUMN IF NOT EXISTS map_index integer NOT NULL DEFAULT 0;

-- 2. Drop the old UNIQUE constraint (one row per reader-article-stage)
--    and add the new one that includes map_index.
ALTER TABLE opinion_map_positions
  DROP CONSTRAINT IF EXISTS opinion_map_positions_reader_id_article_id_stage_key;

ALTER TABLE opinion_map_positions
  ADD CONSTRAINT opinion_map_positions_reader_article_map_stage_key
  UNIQUE (reader_id, article_id, map_index, stage);

-- 3. Replace the map_type CHECK to allow 'binary'.
ALTER TABLE opinion_map_positions
  DROP CONSTRAINT IF EXISTS opinion_map_positions_map_type_check;

ALTER TABLE opinion_map_positions
  ADD CONSTRAINT opinion_map_positions_map_type_check
  CHECK (map_type IN ('cartesian', 'ternary', 'binary'));

-- 4. Indexes for common query patterns.
CREATE INDEX IF NOT EXISTS idx_opinion_map_article_map_stage
  ON opinion_map_positions (article_id, map_index, stage);

-- 5. Update column comment to reflect the new shapes.
COMMENT ON COLUMN opinion_map_positions.coordinates IS
  'JSON shape depends on map_type: cartesian → {"x": 0..1, "y": 0..1}; ternary → {"a": 0..1, "b": 0..1, "c": 0..1} with a+b+c = 1.0; binary → {"x": 0..1}.';

COMMENT ON COLUMN opinion_map_positions.map_index IS
  'Zero-based index of the map within an article. An article may have up to 2 maps; map_index identifies which one this placement is for. Pre-multi-map placements have map_index 0.';

COMMIT;
