-- ============================================================================
-- 035_growth_engine_schema.sql
-- ----------------------------------------------------------------------------
-- Storage layer for the Growth Engine + Growth History Scroll build.
-- All schema decisions captured in memory: project_growth_engine_scroll_scope.md
--
-- Five additions:
--   1. fp_snapshot_reason enum (5 trigger types)
--   2. fp_snapshots table (point-in-time fingerprint captures)
--   3. aspirations table (verbatim statement + reason + axis_commitments
--      + declaration_fingerprint + consent flags)
--   4. self_descriptions table (Voice 1 of three-voice composition;
--      verbatim user words, never overwritten)
--   5. profiles.current_aspiration_id FK
--
-- Tier-gating note: leverages existing profiles.subscription_tier
-- (migration 031) for Practice Layer access. New aspirations.coaching_consent
-- is the per-aspiration opt-in (orthogonal to tier).
--
-- Architecture: theme has zero @supabase/supabase-js imports; all
-- reads/writes go through Vercel API + service role key. Service-role-only
-- marker policies follow the 030 share_events pattern.
--
-- Idempotent.
-- ============================================================================

BEGIN;

-- ─── 1. Enum: fp_snapshot_reason ──────────────────────────
DO $$ BEGIN
  CREATE TYPE public.fp_snapshot_reason AS ENUM (
    'first_entry',
    'aspiration_declaration',
    'recommitment',
    'archetype_shift',
    'pillar_milestone'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── 2. Table: fp_snapshots ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fp_snapshots (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id                text NOT NULL REFERENCES public.profiles(ghost_member_id) ON DELETE CASCADE,
  captured_at              timestamptz NOT NULL DEFAULT now(),
  reason                   public.fp_snapshot_reason NOT NULL,
  fingerprint_data         jsonb NOT NULL,
  archetype_at_capture     text,
  aspiration_at_capture    jsonb,
  png_url                  text,
  annotation               text,
  annotation_generated_at  timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fp_snapshots_member_captured
  ON public.fp_snapshots(member_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS fp_snapshots_reason
  ON public.fp_snapshots(reason);

ALTER TABLE public.fp_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fp_snapshots_service_only ON public.fp_snapshots;
CREATE POLICY fp_snapshots_service_only ON public.fp_snapshots
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.fp_snapshots IS
  'Point-in-time fingerprint captures, used by the Growth History Scroll. One row per trigger event (first_entry, aspiration_declaration, recommitment, archetype_shift, pillar_milestone). Curation computed at read time.';

COMMENT ON COLUMN public.fp_snapshots.fingerprint_data IS
  'Per-axis payload at capture moment: {axis_key: {graduations, tier_mix, topic_phases}}. Frozen, immutable after insert.';

COMMENT ON COLUMN public.fp_snapshots.aspiration_at_capture IS
  'Frozen jsonb copy of the active aspiration at capture moment (NOT an FK). Lets the scroll render correctly even if the live aspiration row is later edited.';

COMMENT ON COLUMN public.fp_snapshots.png_url IS
  'Supabase storage URL of rendered PNG. Nullable: snapshot row inserted first, PNG uploaded async. Live engine never renders in the scroll (perf constraint per Living Fingerprint testing).';

-- ─── 3. Table: aspirations ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.aspirations (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id                   text NOT NULL REFERENCES public.profiles(ghost_member_id) ON DELETE CASCADE,
  statement                   text NOT NULL,
  reason                      text NOT NULL,
  target_archetype            text,
  axis_commitments            jsonb NOT NULL DEFAULT '{}'::jsonb,
  declaration_fingerprint_id  uuid REFERENCES public.fp_snapshots(id) ON DELETE SET NULL,
  declared_at                 timestamptz NOT NULL DEFAULT now(),
  expires_at                  timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  status                      text NOT NULL DEFAULT 'active',
  coaching_consent            boolean NOT NULL DEFAULT false,
  research_consent            boolean NOT NULL DEFAULT false,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aspirations
  DROP CONSTRAINT IF EXISTS aspirations_status_check;
ALTER TABLE public.aspirations
  ADD CONSTRAINT aspirations_status_check
  CHECK (status IN ('active', 'archived', 'recommitted', 'lapsed'));

CREATE INDEX IF NOT EXISTS aspirations_member_status
  ON public.aspirations(member_id, status);
CREATE INDEX IF NOT EXISTS aspirations_member_declared
  ON public.aspirations(member_id, declared_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS aspirations_one_active_per_member
  ON public.aspirations(member_id)
  WHERE status = 'active';

ALTER TABLE public.aspirations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aspirations_service_only ON public.aspirations;
CREATE POLICY aspirations_service_only ON public.aspirations
  FOR ALL USING (false) WITH CHECK (false);

DROP TRIGGER IF EXISTS aspirations_set_updated_at ON public.aspirations;
CREATE TRIGGER aspirations_set_updated_at
  BEFORE UPDATE ON public.aspirations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.aspirations IS
  'Contributor-declared growth commitments. Verbatim statement and reason in the user''s own words (Principle 6). One active per contributor at a time (enforced by partial unique index).';

COMMENT ON COLUMN public.aspirations.axis_commitments IS
  'jsonb shape A locked 2026-05-06: {axis_key: bool}. Upgradable to ordered priority array later without schema change.';

COMMENT ON COLUMN public.aspirations.coaching_consent IS
  'Opt-in to AI-supported Practice Layer coaching. Renewed each declaration cycle per Principle 4. Orthogonal to profiles.subscription_tier (which gates Underwriter-tier features).';

COMMENT ON COLUMN public.aspirations.declaration_fingerprint_id IS
  'FK to fp_snapshots row captured at declaration moment. Enables the scroll to show the contributor where they were when they declared.';

-- ─── 4. Table: self_descriptions ───────────────────────────
CREATE TABLE IF NOT EXISTS public.self_descriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           text NOT NULL REFERENCES public.profiles(ghost_member_id) ON DELETE CASCADE,
  prompt_id           text NOT NULL,
  statement_verbatim  text NOT NULL,
  recorded_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS self_descriptions_member_prompt
  ON public.self_descriptions(member_id, prompt_id, recorded_at DESC);

ALTER TABLE public.self_descriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS self_descriptions_service_only ON public.self_descriptions;
CREATE POLICY self_descriptions_service_only ON public.self_descriptions
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.self_descriptions IS
  'Voice 1 of the Self-Snapshot Engine: the contributor''s own self-description in their own words. Stored verbatim, never overwritten. Multiple entries per (member, prompt) over time form the history of self-description revisions.';

COMMENT ON COLUMN public.self_descriptions.prompt_id IS
  'References the prompt library (defined in code, not in DB). ~8 prompts, opt-in only, free-text only, no Likert/menus per Principle 6.';

-- ─── 5. profiles.current_aspiration_id ─────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_aspiration_id uuid
  REFERENCES public.aspirations(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.current_aspiration_id IS
  'FK to the contributor''s currently active aspiration row. NULL if none. Mirrors profiles.aspirational_archetype (denormalized cache for quick read; both updated together when an aspiration becomes active).';

COMMIT;
