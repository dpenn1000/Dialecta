-- ============================================================================
-- 007_quotes_table.sql
-- ----------------------------------------------------------------------------
-- The Dialecta Quote Library — durable home for the curated source pool of
-- philosophical, classical, mystical, and speculative-fiction quotations the
-- platform draws on at moments of ritual significance (CONSENT, REFLECTING,
-- POSTED, PACT, RECOMMITMENT, plus pillar / archetype anchoring).
--
-- Until now this lived as a JSON file at:
--   C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\dialecta-quote-library.json
--
-- This migration:
--   1. Creates the `quotes` table mirroring the JSON schema, plus audit /
--      lifecycle fields (status, created_at, updated_at, created_by,
--      updated_by) needed for multi-admin curation and the public-suggest
--      pipeline.
--   2. Adds `is_quote_admin boolean` to profiles for admin-tier auth.
--   3. RLS policies: public can read live quotes only. All write paths and
--      draft / archived reads go through the API service-role layer, where
--      auth tier (public / member / admin) is enforced explicitly.
--
-- After this migration: 008_seed_quotes.sql imports the 70 entries from the
-- JSON file. From that point forward, the Supabase table is canonical and the
-- OneDrive JSON becomes the disaster-recovery export mirror, refreshed on
-- demand via the admin UI's "Export to JSON" button.
--
-- Idempotent: every statement uses IF NOT EXISTS / IF EXISTS guards. Safe to
-- re-run.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. quotes table
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotes (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id     text          UNIQUE NOT NULL,
  text         text          NOT NULL,
  author       text,
  source       text,
  year         integer,
  tags         text[]        NOT NULL DEFAULT ARRAY[]::text[],
  status       text          NOT NULL DEFAULT 'live'
                              CHECK (status IN ('live', 'draft', 'archived')),
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),
  created_by   text,
  updated_by   text
);

CREATE INDEX IF NOT EXISTS idx_quotes_status        ON quotes (status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_id      ON quotes (quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tags_gin      ON quotes USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by    ON quotes (created_by) WHERE created_by IS NOT NULL;

COMMENT ON TABLE quotes IS
  'Curated quote library for Dialecta ritual surfaces. JSON in OneDrive remains the disaster-recovery mirror; this table is the canonical runtime source.';

COMMENT ON COLUMN quotes.quote_id IS
  'Stable slug like ''butler-touch-change''. Used for URL-safe references and external editor wiring.';

COMMENT ON COLUMN quotes.tags IS
  'Faceted tags. Convention: pillar-X, archetype-X, surface-X, theme-X, tradition-X. See Editorial Voice doc.';

COMMENT ON COLUMN quotes.status IS
  'live = visible to editor and public list view; draft = staged (member-submitted or AI-suggested, awaiting admin review); archived = soft-deleted (never hard-deleted, kept for reference).';

COMMENT ON COLUMN quotes.created_by IS
  'Ghost member uuid for admin-created entries; ''member-suggest:<uuid>'' for member submissions; ''ai-suggest'' for AI-generated drafts; ''seed:initial-import'' for the 008 seed migration.';

-- Row-level security: public reads live quotes; everything else routes through
-- the API service role with explicit auth tier checks.
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quotes_public_read_live ON quotes;
CREATE POLICY quotes_public_read_live ON quotes
  FOR SELECT USING (status = 'live');

-- ────────────────────────────────────────────────────────────────────────────
-- 2. profiles.is_quote_admin
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_quote_admin boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_quote_admin
  ON profiles (is_quote_admin) WHERE is_quote_admin = true;

COMMENT ON COLUMN profiles.is_quote_admin IS
  'True for members with quote library curation rights. Admins can create / edit / archive quotes and review drafts. Non-admins (logged-in members) can submit suggestions, which become drafts awaiting admin review. Logged-out visitors can browse live quotes only.';

-- ────────────────────────────────────────────────────────────────────────────
-- 3. updated_at auto-bump trigger
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION quotes_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotes_updated_at ON quotes;
CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION quotes_set_updated_at();

COMMIT;

-- ============================================================================
-- After apply:
--   1. Run 008_seed_quotes.sql to import the 70 entries from the JSON file.
--   2. Promote yourself to admin once your profile row exists:
--      UPDATE profiles SET is_quote_admin = true
--      WHERE ghost_member_id = '<your-ghost-member-uuid>';
-- ============================================================================
