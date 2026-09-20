-- ============================================================================
-- 002_seed_dev_users.sql  (REDRAFTED 2026-04-27 after diagnostic)
-- ----------------------------------------------------------------------------
-- Three fictional contributors for development and UI testing.
-- All flagged is_seed = true so production filters can hide them at launch.
--
-- Source: src/index.jsx HERO_PROFILES — carefully-designed mock contributors
-- whose distributions were authored thoughtfully. Seeding them into Supabase
-- displaces the hardcoded mock data and lets all React components render
-- against real database state instead of imports.
--
-- DIAGNOSTIC FINDINGS APPLIED:
--   • member_id is text (not uuid) — Phase 1 uses Ghost member ID strings
--   • Existing axis_scores and archetypes tables already have correct
--     schemas — this seed inserts into them as-is
--   • archetypes table has richer schema than original draft expected:
--     archetype_id (enum), archetype_label (text), confidence (enum),
--     axis_pattern (jsonb), history (jsonb)
--   • archetype_id enum was just expanded by 001 to include canonical 8
--
-- TRANSLATION APPLIED:
--   • Legacy axis names → canonical (specificity→acuity, charity→magnanimity,
--     originality→reach). Other three (calibration, discourse, consistency)
--     unchanged. This translation matches the canonical `axis` enum that
--     production already uses correctly.
--
-- Idempotent: ON CONFLICT DO NOTHING on uniqueness constraints. Safe to re-run.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- profiles — three seed contributors
-- ────────────────────────────────────────────────────────────────────────────
-- profile.id is uuid (Supabase PK convention)
-- ghost_member_id is text per existing schema; seeds use 'seed:<name>'
-- pattern so any join-result shows the seed identity at a glance.

INSERT INTO profiles (id, ghost_member_id, display_name, bio, avatar_url, location, is_seed)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'seed:maya',
    'Maya Reiss',
    'Retired librarian. Eighteen months on Dialecta, about seventy comments. Writes weekly and carefully, mostly about theology with secondary interests in mental health and psychology. Updates her positions publicly when the evidence shifts. Reads more than she replies.',
    NULL,
    NULL,
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'seed:wen',
    'Wen Zhao',
    'Software engineer, 34. Six months on Dialecta, almost daily. Arrived politically fired up and learned the hard way — early Discourse rings carry visible Heat and Stance from political fights that have since calmed. These days writes mostly about music theory, acoustics, and the cross-domain patterns he sees as an engineer.',
    NULL,
    NULL,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'seed:anselm',
    'Father Anselm Okafor',
    'Catholic priest and theology teacher, 68. Ten months on Dialecta, about ninety comments. Almost everything he writes is theology — small inflections in Calibration and Discourse come from pastoral conversations where psychology and mental health touch his work. Works within the tradition rather than inventing new framings, and wouldn''t have it any other way.',
    NULL,
    NULL,
    true
  )
ON CONFLICT (ghost_member_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- axis_scores — Maya Reiss (Careful Reader / Reviser)
-- Pattern: high Calibration + Magnanimity, modest Reach, low Discourse
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO axis_scores (member_id, axis, graduation_count, tier_mix) VALUES
  ('seed:maya', 'acuity',      14, '{"forum": 10, "spark": 3, "echo": 1}'::jsonb),
  ('seed:maya', 'calibration', 17, '{"forum": 13, "spark": 3, "echo": 1}'::jsonb),
  ('seed:maya', 'magnanimity', 15, '{"forum": 12, "spark": 2, "echo": 1}'::jsonb),
  ('seed:maya', 'discourse',    5, '{"forum": 2,  "spark": 2, "echo": 1}'::jsonb),
  ('seed:maya', 'consistency', 11, '{"forum": 7,  "spark": 2, "echo": 1, "fog": 1}'::jsonb),
  ('seed:maya', 'reach',        9, '{"forum": 4,  "spark": 3, "echo": 1, "fog": 1}'::jsonb)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- axis_scores — Wen Zhao (Engaged Enthusiast / Synthesizer)
-- Pattern: high Consistency + Reach (cross-domain), Heat/Stance in
-- Discourse from earlier political fights, high overall activity
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO axis_scores (member_id, axis, graduation_count, tier_mix) VALUES
  ('seed:wen', 'acuity',       9, '{"forum": 5,  "spark": 3, "echo": 1}'::jsonb),
  ('seed:wen', 'calibration',  9, '{"forum": 4,  "spark": 3, "echo": 1, "fog": 1}'::jsonb),
  ('seed:wen', 'magnanimity', 10, '{"forum": 5,  "spark": 3, "echo": 1, "fog": 1}'::jsonb),
  ('seed:wen', 'discourse',   17, '{"forum": 6,  "spark": 3, "echo": 1, "heat": 5, "stance": 2}'::jsonb),
  ('seed:wen', 'consistency', 19, '{"forum": 13, "spark": 4, "echo": 2}'::jsonb),
  ('seed:wen', 'reach',       16, '{"forum": 9,  "spark": 5, "echo": 1, "fog": 1}'::jsonb)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- axis_scores — Father Anselm Okafor (Domain Specialist / Contextualist)
-- Pattern: very high Acuity (theology specialist), very low Reach (single
-- domain), some Heat in Discourse from pastoral edge cases
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO axis_scores (member_id, axis, graduation_count, tier_mix) VALUES
  ('seed:anselm', 'acuity',      19, '{"forum": 15, "spark": 3, "echo": 1}'::jsonb),
  ('seed:anselm', 'calibration', 11, '{"forum": 7,  "spark": 2, "echo": 1, "fog": 1}'::jsonb),
  ('seed:anselm', 'magnanimity', 15, '{"forum": 11, "spark": 2, "echo": 1, "fog": 1}'::jsonb),
  ('seed:anselm', 'discourse',   13, '{"forum": 8,  "spark": 2, "fog": 1, "heat": 2}'::jsonb),
  ('seed:anselm', 'consistency', 12, '{"forum": 8,  "spark": 2, "echo": 1, "fog": 1}'::jsonb),
  ('seed:anselm', 'reach',        4, '{"forum": 3,  "spark": 1}'::jsonb)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- archetypes — current canonical assignment per contributor
-- ────────────────────────────────────────────────────────────────────────────
-- Justification:
--   Maya   → Reviser       — "Updates her positions publicly when the evidence shifts"
--   Wen    → Synthesizer   — "cross-domain patterns he sees as an engineer"
--   Anselm → Contextualist — "works within the tradition rather than inventing new framings"
--
-- All three confidence = 'established' — their bio descriptions describe
-- mature contribution patterns (18mo/6mo/10mo tenure with substantial volume).
-- axis_pattern left as empty jsonb placeholder; computed pattern can be
-- backfilled by a future archetype-pattern computation pass.
-- history left as empty array — these are the seeds' first assignments.

INSERT INTO archetypes (member_id, archetype_id, archetype_label, confidence, axis_pattern, history) VALUES
  ('seed:maya',   'reviser',       'The Reviser',       'established', '{}'::jsonb, '[]'::jsonb),
  ('seed:wen',    'synthesizer',   'The Synthesizer',   'established', '{}'::jsonb, '[]'::jsonb),
  ('seed:anselm', 'contextualist', 'The Contextualist', 'established', '{}'::jsonb, '[]'::jsonb)
ON CONFLICT DO NOTHING;


COMMIT;

-- ============================================================================
-- After apply, sanity-check from any SQL client:
--
--   SELECT display_name, ghost_member_id, is_seed FROM profiles
--   WHERE is_seed = true ORDER BY display_name;
--     → 3 rows (Maya, Wen, Anselm)
--
--   SELECT member_id, axis, graduation_count
--   FROM axis_scores
--   WHERE member_id LIKE 'seed:%'
--   ORDER BY member_id, axis;
--     → 18 rows (3 contributors × 6 pillars)
--
--   SELECT member_id, archetype_id, archetype_label, confidence
--   FROM archetypes
--   WHERE member_id LIKE 'seed:%'
--   ORDER BY member_id;
--     → 3 rows
-- ============================================================================
