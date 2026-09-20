-- ============================================================================
-- 009_steward_orders.sql
-- ----------------------------------------------------------------------------
-- Add the Steward Order schema to profiles. Steward Order is a writer-type
-- taxonomy (40 canonical Orders across 10 Families) shown on the byline and
-- profile of every author. The author always wins the public claim; the AI
-- engine proposes, the author confirms or overrides.
--
-- See:
--   * api/_stewards-skill.js  for the canonical Order list + decision rules
--   * page-stewards.hbs       for the public lexicon
--   * api/article/classify-order.js  for the proposing endpoint (deferred)
--
-- The fields below all live on `profiles`. We deliberately do not introduce
-- a separate `orders` enum: Order slugs are validated by the API endpoint
-- against the skill content (so adding a new Order is a one-file edit in
-- _stewards-skill.js, not a schema migration).
--
-- IDEMPOTENT: every column uses ADD COLUMN IF NOT EXISTS. Safe to re-run.
-- ============================================================================

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS order_id                     text,
  ADD COLUMN IF NOT EXISTS order_label                  text,
  ADD COLUMN IF NOT EXISTS order_family                 text,
  ADD COLUMN IF NOT EXISTS order_assigned_at            timestamptz,
  ADD COLUMN IF NOT EXISTS last_order_classified_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_pending_proposal       jsonb,
  ADD COLUMN IF NOT EXISTS order_negotiation_log        jsonb   NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN profiles.order_id IS
  'Author-confirmed Steward Order slug (e.g. "cartographer", "provocateur"). Null until first classification commits. The author always wins the public claim.';

COMMENT ON COLUMN profiles.order_label IS
  'Display name with article (e.g. "The Cartographer"). Denormalized so byline rendering does not need a lookup.';

COMMENT ON COLUMN profiles.order_family IS
  'Family slug (e.g. "synthetic", "argumentative"). Denormalized for feed-level Family filter performance.';

COMMENT ON COLUMN profiles.order_assigned_at IS
  'Timestamp the author last confirmed their Order, including via re-classification. Updated on every commit.';

COMMENT ON COLUMN profiles.last_order_classified_count IS
  'Number of published articles at the time of the last AI classification. Used to determine when re-classification is due (every 5 articles after the first 3).';

COMMENT ON COLUMN profiles.order_pending_proposal IS
  'Latest classifier output awaiting author confirmation. Shape: {proposed_order_id, proposed_order_label, proposed_order_family, alternative_order_id, alternative_order_label, alternative_order_family, rationale, confidence, classified_at, article_count}. Null when no pending proposal. Cleared on commit.';

COMMENT ON COLUMN profiles.order_negotiation_log IS
  'Append-only log of (proposed, alternative, rationale, confidence, author_chose, author_response, at, article_count) entries. Internal-only, never surfaced to the community.';

CREATE INDEX IF NOT EXISTS idx_profiles_order_family
  ON profiles (order_family) WHERE order_family IS NOT NULL;

COMMIT;

-- ============================================================================
-- VERIFICATION (run separately):
--   SELECT column_name, data_type
--   FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='profiles'
--     AND column_name LIKE 'order%' OR column_name = 'last_order_classified_count'
--   ORDER BY ordinal_position;
-- ============================================================================
