-- ============================================================================
-- 001_v1_1_schema.sql  (REDRAFTED 2026-04-27 after diagnostic)
-- ----------------------------------------------------------------------------
-- Dialecta Data Architecture v1.1 schema migration — adapted to existing
-- production schema reality.
--
-- DIAGNOSTIC FINDINGS (2026-04-27, rewriting from initial draft):
--
--   1. axis_scores and archetypes tables ALREADY EXIST in production with
--      well-designed schemas using `member_id text` (correct for Phase 1
--      where Ghost member IDs are 24-char hex strings, not UUIDs). Original
--      draft tried to CREATE TABLE these with `contributor_id uuid`;
--      IF NOT EXISTS skipped creation, then CREATE INDEX failed with 42703.
--
--   2. The Data Architecture spec says `uuid` for contributor IDs. Production
--      uses `text` (member_id). Production is correct for Phase 1; spec was
--      forward-looking to Phase 2 Supabase auth without flagging the diff.
--      Spec needs a clarifying note (separate task — backflow into spec).
--
--   3. Enum diagnostic confirmed canonical alignment for axis (perfect 6),
--      tier (perfect 7), and several others. ONE enum is stale: archetype_id
--      contains 9 values, only 3 of which are canonical (advocate, builder,
--      reviser). Missing: skeptic, synthesizer, empiricist, contextualist,
--      illuminator. This migration ADDS those 5 values; legacy values
--      (specialist, generalist, sparring_partner, cartographer, witness,
--      forming) stay until a separate cleanup task retires them with proper
--      data migration.
--
-- THIS MIGRATION ADDS:
--   • 5 missing archetype_id enum values (canonical 8 alignment)
--   • profiles.is_seed                  (column — seed user filter)
--   • comments.delta_acknowledged       (column — Delta Mechanic Stage F)
--   • feed_events                       (table — typed social feed events)
--   • follows                           (table — v1.1, follow graph)
--   • sparring_partners                 (table — v1.1, engagement-derived)
--   • opinion_map_positions             (table — v1.1, Delta + Opinion Map)
--   • Indexes + RLS for the above
--
-- Idempotent: every statement uses IF NOT EXISTS / IF EXISTS guards. Safe
-- to re-run. Schema additions wrapped in transaction; enum expansion runs
-- before transaction (ALTER TYPE ADD VALUE is best practice outside txn).
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 0. archetype_id enum: add the 5 missing canonical values
-- ────────────────────────────────────────────────────────────────────────────
-- Runs OUTSIDE the transaction below: PostgreSQL allows ALTER TYPE ADD VALUE
-- in a transaction in PG12+, but the new value can't be referenced in the
-- same transaction it's added in. Doing it here, outside, keeps the seed
-- migration (002) cleanly able to use these values immediately.
--
-- Legacy values left in place (no data uses them — archetypes table is empty).
-- A future cleanup task will retire: specialist, generalist, sparring_partner,
-- cartographer, witness, forming. See spawned task: "Retire legacy
-- archetype_id enum values".

ALTER TYPE archetype_id ADD VALUE IF NOT EXISTS 'skeptic';
ALTER TYPE archetype_id ADD VALUE IF NOT EXISTS 'synthesizer';
ALTER TYPE archetype_id ADD VALUE IF NOT EXISTS 'empiricist';
ALTER TYPE archetype_id ADD VALUE IF NOT EXISTS 'contextualist';
ALTER TYPE archetype_id ADD VALUE IF NOT EXISTS 'illuminator';


-- ============================================================================
BEGIN;
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. profiles.is_seed — flags fictional contributors so public feeds can hide
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_seed ON profiles (is_seed) WHERE is_seed = true;

COMMENT ON COLUMN profiles.is_seed IS
  'True for fictional dev/test contributors (Maya, Wen, Anselm). Public feeds, opinion maps, sparring detection, and contributor lists must filter WHERE is_seed = false.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. comments.delta_acknowledged — Delta Mechanic Stage F public choice
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS delta_acknowledged boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN comments.delta_acknowledged IS
  'True when the comment was authored via the Delta Mechanic Stage F public-choice flow. Surfaces as the DELTA ACKNOWLEDGED chip on the comment. See Dialecta_Delta_Mechanic_Spec.md.';


-- ────────────────────────────────────────────────────────────────────────────
-- 3. feed_events — typed social feed records with full 12-value enum
-- ────────────────────────────────────────────────────────────────────────────
-- member_id text (not uuid) per established convention. event_type as text
-- + CHECK rather than a real ENUM type — easier to expand later than ALTER
-- TYPE ADD VALUE (which we just had to deal with on archetype_id).

CREATE TABLE IF NOT EXISTS feed_events (
  id                       uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type               text         NOT NULL CHECK (event_type IN (
                                          'archetype_shift',
                                          'fingerprint_milestone',
                                          'sparring_partner_recognized',
                                          'sparring_partner_archetype_shift',
                                          'aspiration_declared',
                                          'recommitment',
                                          'first_forum_comment',
                                          'forum_thread_spotlight',
                                          'new_reader',
                                          'correspondent_established',
                                          'source_milestone',
                                          'delta_acknowledged_published'
                                        )),
  primary_member_id        text         NOT NULL,
  secondary_member_id      text,
  reference_id             uuid,
  display_payload          jsonb        NOT NULL DEFAULT '{}'::jsonb,
  visibility               text         NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','followers')),
  created_at               timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_events_primary    ON feed_events (primary_member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_events_secondary  ON feed_events (secondary_member_id, created_at DESC) WHERE secondary_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feed_events_type_time  ON feed_events (event_type, created_at DESC);

ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feed_events_public_read ON feed_events;
CREATE POLICY feed_events_public_read ON feed_events
  FOR SELECT USING (visibility = 'public');

COMMENT ON TABLE feed_events IS
  'Typed social feed records. Precomputed display_payload avoids joins at render time. Visibility=public is readable by everyone; followers-only entries served via API + service role.';


-- ────────────────────────────────────────────────────────────────────────────
-- 4. follows — v1.1 follow graph (Readers / Sources / Correspondents)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS follows (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id   text          NOT NULL,
  followee_id   text          NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower    ON follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee    ON follows (followee_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS follows_public_read ON follows;
CREATE POLICY follows_public_read ON follows
  FOR SELECT USING (true);

COMMENT ON TABLE follows IS
  'Follow graph. Source perspective: I follow X (follower_id = me). Reader perspective: X follows me (followee_id = me). Correspondent: derived view where (A,B) and (B,A) both exist. Per Dialecta_Relationship_Types.md, follow visibility is public on both profiles — no shadow-following.';


-- ────────────────────────────────────────────────────────────────────────────
-- 5. sparring_partners — v1.1 engagement-derived relationship
-- ────────────────────────────────────────────────────────────────────────────
-- Note: cannot enforce CHECK (member_a < member_b) for canonical ordering on
-- text values without ambiguity (text comparison rules). Enforced in
-- application code instead — the materialization job that detects sparring
-- pairs from comments must always insert with the lower-sorted member_id
-- as member_a.

CREATE TABLE IF NOT EXISTS sparring_partners (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  member_a            text          NOT NULL,
  member_b            text          NOT NULL,
  article_count       integer       NOT NULL DEFAULT 0,
  recognized_at       timestamptz   NOT NULL DEFAULT now(),
  visibility_a        boolean       NOT NULL DEFAULT false,
  visibility_b        boolean       NOT NULL DEFAULT false,
  last_engagement_at  timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (member_a, member_b),
  CHECK (member_a < member_b)
);

CREATE INDEX IF NOT EXISTS idx_sparring_a   ON sparring_partners (member_a);
CREATE INDEX IF NOT EXISTS idx_sparring_b   ON sparring_partners (member_b);

ALTER TABLE sparring_partners ENABLE ROW LEVEL SECURITY;

-- Public chip requires mutual opt-in. The underlying engagement record always
-- exists (and feeds Reviser pathway / Calibration pillar) but is only readable
-- via row-level policy when both parties have opted in. Server-side queries
-- (service role) bypass RLS to compute the calibration / reviser signals.
DROP POLICY IF EXISTS sparring_partners_mutual_visible ON sparring_partners;
CREATE POLICY sparring_partners_mutual_visible ON sparring_partners
  FOR SELECT USING (visibility_a = true AND visibility_b = true);

COMMENT ON TABLE sparring_partners IS
  'Engagement-derived relationship. Materialized nightly from comments by detecting reply pairs across distinct articles. Detection threshold: 5+ articles with mutual reply chains. Public chip requires mutual visibility opt-in; underlying engagement persists regardless of opt-out.';


-- ────────────────────────────────────────────────────────────────────────────
-- 6. opinion_map_positions — v1.1 Opinion Maps + Delta Mechanic
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS opinion_map_positions (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id    text          NOT NULL,
  article_id   text          NOT NULL,
  stage        text          NOT NULL CHECK (stage IN ('pre_read','post_read')),
  coordinates  jsonb         NOT NULL,
  map_type     text          NOT NULL CHECK (map_type IN ('cartesian','ternary')),
  recorded_at  timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (reader_id, article_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_opinion_map_article  ON opinion_map_positions (article_id, stage);
CREATE INDEX IF NOT EXISTS idx_opinion_map_reader   ON opinion_map_positions (reader_id);

ALTER TABLE opinion_map_positions ENABLE ROW LEVEL SECURITY;

-- Individual coordinates are NEVER exposed in row-level reads. Aggregates
-- are computed server-side via service role and exposed only when n >= 20
-- paired pre/post records exist for the article (per Delta spec). Reader
-- sees only their own rows.
-- NOTE: auth.uid() returns uuid in Phase 2; Phase 1 uses Ghost member_id
-- (text) injected via API. RLS clause uses text comparison; if Phase 2
-- migrates to Supabase auth, this clause needs revision.
DROP POLICY IF EXISTS opinion_map_self_read ON opinion_map_positions;
CREATE POLICY opinion_map_self_read ON opinion_map_positions
  FOR SELECT USING (reader_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');

COMMENT ON TABLE opinion_map_positions IS
  'Per-reader position on an article opinion map. Stores both Stage A (pre-read) and Stage C (post-read) snapshots from the Delta Mechanic. Aggregates only published when n>=20 completed pre/post pairs exist. Individual coordinates never exposed in aggregate views.';

COMMENT ON COLUMN opinion_map_positions.coordinates IS
  'JSON shape depends on map_type: cartesian → {"x": -0.4, "y": 0.7}; ternary → {"a": 0.5, "b": 0.3, "c": 0.2} where a+b+c = 1.0.';


-- ============================================================================
COMMIT;
-- ============================================================================
