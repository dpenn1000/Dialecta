-- ============================================================================
-- 003_archetype_enum_canonical_only.sql
-- ----------------------------------------------------------------------------
-- Retire the 6 legacy values from the `archetype_id` PostgreSQL enum, leaving
-- only the canonical 8 archetypes.
--
-- BACKGROUND:
--   • The `archetype_id` enum was created out-of-band via the Supabase
--     dashboard before this migrations folder existed. The April 2026 audit
--     found it held 9 values, only 3 of which were canonical (advocate,
--     builder, reviser).
--   • Migration 001 added the 5 missing canonical values (skeptic, synthesizer,
--     empiricist, contextualist, illuminator) via ALTER TYPE ADD VALUE,
--     bringing the enum to 14 values: 8 canonical + 6 legacy.
--   • The 6 legacy values (specialist, generalist, sparring_partner,
--     cartographer, witness, forming) remain accepted by Postgres on insert.
--     Until they're dropped, any code path that constructs an archetype
--     string is one typo away from corrupting the dataset that drives the
--     fingerprint, profile, and feed_events.archetype_shift derivations.
--
-- PRE-FLIGHT (verified 2026-04-27 against production):
--   • Q1 — `SELECT archetype_id, COUNT(*) FROM archetypes GROUP BY archetype_id;`
--     returned 3 rows, all canonical (reviser=1, synthesizer=1, contextualist=1).
--     No legacy values in use → no data UPDATE step needed.
--   • Q2 — pg_attribute join over t.typname = 'archetype_id' returned exactly
--     one column: public.archetypes.archetype_id. No other table uses the
--     enum → single ALTER COLUMN suffices.
--
-- STRATEGY (PostgreSQL has no DROP VALUE for enums — type swap is the
-- standard pattern):
--   1. CREATE a new enum type holding only the canonical 8.
--   2. ALTER the column to the new type via text-cast roundtrip. Every
--      existing row's value (reviser, synthesizer, contextualist) is also a
--      member of the new enum, so the cast is total.
--   3. DROP the old type.
--   4. RENAME the new type to take the original name.
--
-- IDEMPOTENT: a clean re-run performs the same swap (new→canonical, old gone,
-- renamed to original) with no semantic change. Wrapped in a single
-- transaction — partial failure rolls back cleanly with no orphan type.
--
-- APPLY: paste this file into Supabase SQL editor and run. Verify with the
-- diagnostic at the bottom.
-- ============================================================================


BEGIN;


-- ────────────────────────────────────────────────────────────────────────────
-- 0. Pre-flight assertions — fail loudly if assumptions break
-- ────────────────────────────────────────────────────────────────────────────
-- These re-check the conditions that made this migration safe to write. If
-- the database has drifted (legacy rows added, new columns adopting the
-- enum), the migration aborts with a clear message instead of silently
-- losing data inside a generic cast error.

DO $$
DECLARE
  legacy_count        integer;
  unexpected_columns  integer;
BEGIN
  -- 0a. No rows hold legacy values.
  SELECT COUNT(*) INTO legacy_count
  FROM archetypes
  WHERE archetype_id::text IN (
    'specialist', 'generalist', 'sparring_partner',
    'cartographer', 'witness', 'forming'
  );

  IF legacy_count > 0 THEN
    RAISE EXCEPTION
      'Pre-flight failed: % row(s) in archetypes still hold legacy archetype_id values. Map them to canonical values before re-running this migration.',
      legacy_count;
  END IF;

  -- 0b. No other column anywhere in the schema is typed archetype_id.
  SELECT COUNT(*) INTO unexpected_columns
  FROM pg_attribute a
  JOIN pg_class     c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_type      t ON t.oid = a.atttypid
  WHERE t.typname = 'archetype_id'
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND NOT (n.nspname = 'public'
             AND c.relname = 'archetypes'
             AND a.attname = 'archetype_id');

  IF unexpected_columns > 0 THEN
    RAISE EXCEPTION
      'Pre-flight failed: % unexpected column(s) typed archetype_id. This migration only swaps public.archetypes.archetype_id; extend it to ALTER each additional column before re-running.',
      unexpected_columns;
  END IF;
END
$$;


-- ────────────────────────────────────────────────────────────────────────────
-- 1. Create the canonical-only replacement enum
-- ────────────────────────────────────────────────────────────────────────────
-- Alphabetical ordering for a stable enumsortorder across environments —
-- the cast roundtrip below uses text values, so order doesn't affect data
-- correctness, but stable ordering keeps diagnostic queries deterministic.

CREATE TYPE archetype_id_canonical AS ENUM (
  'advocate',
  'builder',
  'contextualist',
  'empiricist',
  'illuminator',
  'reviser',
  'skeptic',
  'synthesizer'
);


-- ────────────────────────────────────────────────────────────────────────────
-- 2. Swap the column to the new type
-- ────────────────────────────────────────────────────────────────────────────
-- DROP DEFAULT first as a defensive no-op: if the out-of-band table
-- definition set a default referencing a value of the old type, the type
-- swap below would fail. Stripping it preempts that. (No-op if there is
-- no default — `archetypes.archetype_id` was created NOT NULL with no
-- default per spec, but production was created out-of-band so we don't
-- assume.)

ALTER TABLE archetypes
  ALTER COLUMN archetype_id DROP DEFAULT;

ALTER TABLE archetypes
  ALTER COLUMN archetype_id TYPE archetype_id_canonical
  USING archetype_id::text::archetype_id_canonical;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. Retire the legacy enum and rename the canonical one in its place
-- ────────────────────────────────────────────────────────────────────────────
-- After step 2, no column references the old `archetype_id` type, so DROP
-- succeeds. The rename re-uses the original type name so application code
-- and downstream pg_type lookups continue to work unchanged.

DROP TYPE archetype_id;

ALTER TYPE archetype_id_canonical RENAME TO archetype_id;


COMMIT;


-- ============================================================================
-- VERIFICATION — run separately in Supabase SQL editor after applying:
--
--   -- 1. Enum holds exactly the canonical 8, alphabetical:
--   SELECT enumlabel FROM pg_enum
--     WHERE enumtypid = 'archetype_id'::regtype
--     ORDER BY enumsortorder;
--   -- expected:
--   --   advocate, builder, contextualist, empiricist,
--   --   illuminator, reviser, skeptic, synthesizer
--
--   -- 2. Existing seed rows preserved:
--   SELECT archetype_id, COUNT(*) FROM archetypes
--     GROUP BY archetype_id ORDER BY archetype_id;
--   -- expected: contextualist=1, reviser=1, synthesizer=1
--
--   -- 3. Legacy values can no longer be inserted (must ERROR):
--   --   INSERT INTO archetypes (contributor_id, archetype_id, is_current)
--   --     VALUES ('00000000-0000-0000-0000-000000000000'::uuid,
--   --             'specialist', true);
--   -- expected error: invalid input value for enum archetype_id: "specialist"
-- ============================================================================
