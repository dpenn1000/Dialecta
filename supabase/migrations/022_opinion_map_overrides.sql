-- ============================================================================
-- 022_opinion_map_overrides.sql
-- ----------------------------------------------------------------------------
-- Disagreement log for opinion-map decisions.
--
-- When an article publishes, the classifier produces ai_analysis.recommended_maps
-- as the AI's read of the article's opinion-map structure. The author can then
-- amend that recommendation through the editor. When the final
-- declaration.opinion_maps differs from the AI's recommended_maps, that
-- disagreement is captured here as a row.
--
-- Purpose: this table becomes the data source for tuning the opinion-mapper
-- skill over time. Patterns in disagreements tell us where the skill drifts
-- from editorial intent. Specific cases tell us what generic-principle
-- adjustments would catch the same class of issues.
--
-- Population: written by api/article/submit.js immediately after the article
-- row is inserted. The compare logic checks for any meaningful difference
-- between the two shapes; trivial differences (e.g., only an author_position
-- shifting by a few hundredths) are ignored.
--
-- Read access: admins only. Not exposed to public or authenticated readers.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS opinion_map_overrides (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id          uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  ghost_post_id       text NOT NULL,

  ai_recommendation   jsonb NOT NULL,    -- ai_analysis.recommended_maps at submission
  final_approved      jsonb NOT NULL,    -- declaration.opinion_maps as published

  editor_note         text,              -- optional: author's reason for the override

  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opinion_map_overrides_article  ON opinion_map_overrides (article_id);
CREATE INDEX IF NOT EXISTS idx_opinion_map_overrides_ghost    ON opinion_map_overrides (ghost_post_id);
CREATE INDEX IF NOT EXISTS idx_opinion_map_overrides_created  ON opinion_map_overrides (created_at DESC);

ALTER TABLE opinion_map_overrides ENABLE ROW LEVEL SECURITY;

-- No SELECT policy: clients cannot read this table. Service role bypasses
-- RLS and is the only path to read these rows. Admin tooling that needs to
-- review the log will go through a service-role API endpoint.

COMMENT ON TABLE opinion_map_overrides IS
  'Append-only log of editor disagreements with the AI opinion-map recommendation. Each row captures the AI''s recommended_maps at submission and the author''s final_approved opinion_maps. Used as tuning data for the opinion-mapper skill. No client SELECT policy; service role only.';

COMMENT ON COLUMN opinion_map_overrides.ai_recommendation IS
  'Snapshot of ai_analysis.recommended_maps at the time of article submission. Array shape.';

COMMENT ON COLUMN opinion_map_overrides.final_approved IS
  'Snapshot of declaration.opinion_maps as the author submitted it. Array shape.';

COMMENT ON COLUMN opinion_map_overrides.editor_note IS
  'Optional author-supplied reason for diverging from the AI recommendation. Null when the author did not explain.';

COMMIT;
