-- ============================================================================
-- 015_axis_events_article_source.sql
-- ----------------------------------------------------------------------------
-- Extends axis_events to record events from article publications (not
-- just comments). Per Dialecta_Axis_Mapping_v1.1: an author publishing
-- a non-Breach article shapes their Fingerprint just like a comment
-- does, with one rule difference (Discourse is comment-specific, not
-- triggered by articles).
--
-- Schema discriminator: `source` ∈ {comment, article}. Existing rows
-- default to 'comment' (covers all 014 events). For article rows,
-- comment_id and classification_id are null; article_id holds the
-- ghost_post_id (text, matching articles.ghost_post_id).
--
-- Idempotent.
--
-- See:
--   * Dialecta_Axis_Mapping_v1.md (v1.1) — article-side mapping section
--   * api/_axis-mapping.js — deriveArticleAxisEvents helper
--   * api/article/publish.js Step 5 — call site
-- ============================================================================

BEGIN;

ALTER TABLE axis_events ALTER COLUMN comment_id        DROP NOT NULL;
ALTER TABLE axis_events ALTER COLUMN classification_id DROP NOT NULL;

ALTER TABLE axis_events ADD COLUMN IF NOT EXISTS article_id text;
ALTER TABLE axis_events ADD COLUMN IF NOT EXISTS source     text NOT NULL DEFAULT 'comment';

-- Discriminator constraint: each row is either a comment event (with
-- comment_id + classification_id, no article_id) or an article event
-- (with article_id, no comment_id). Guarded against duplicate constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'axis_events'::regclass
      AND contype  = 'c'
      AND conname  = 'axis_events_source_check'
  ) THEN
    ALTER TABLE axis_events
      ADD CONSTRAINT axis_events_source_check CHECK (
        (source = 'comment' AND comment_id IS NOT NULL AND classification_id IS NOT NULL AND article_id IS NULL)
        OR
        (source = 'article' AND article_id IS NOT NULL AND comment_id IS NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_axis_events_article ON axis_events (article_id);
CREATE INDEX IF NOT EXISTS idx_axis_events_source  ON axis_events (source);

COMMENT ON COLUMN axis_events.source IS
  'Event origin: comment (most events) or article (author published a post). The mapping rules differ slightly per Dialecta_Axis_Mapping_v1.1 — articles do not trigger Discourse.';

COMMENT ON COLUMN axis_events.article_id IS
  'Ghost post id (text). Populated only for source=article events. References articles.ghost_post_id without an FK because articles uses ghost_post_id as a non-PK identifier.';

COMMIT;
