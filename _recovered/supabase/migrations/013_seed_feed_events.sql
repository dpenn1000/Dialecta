-- ============================================================================
-- 011_seed_feed_events.sql
-- ----------------------------------------------------------------------------
-- Seeds initial feed_events rows so the Profile Live Feed has visible
-- content the moment a contributor lands on their profile. Six events,
-- six distinct event types, spread across the past 32 hours.
--
-- All events use seed:<name> contributor ids (seed:maya / seed:wen /
-- seed:anselm) so they are identifiable as pre-launch fixture data.
-- Real users will accumulate events through the actual generators that
-- v1.5 will wire into the classify / profile-update / follows endpoints.
--
-- Display names for the secondary contributor in relationship events are
-- looked up from the live profiles table at insert time via a subquery,
-- so the seed stays correct without hardcoding Dan's display_name here.
--
-- Idempotent: explicit fixed UUIDs + ON CONFLICT (id) DO NOTHING. Safe to
-- re-apply, and easy to delete by id if the fixture set needs revision.
-- ============================================================================

BEGIN;

INSERT INTO feed_events
  (id, event_type, primary_member_id, secondary_member_id, display_payload, visibility, created_at)
VALUES
  -- 1. Fingerprint milestone — Maya's Calibration pillar reaches 50
  ('11111111-1111-1111-1111-111111111111',
   'fingerprint_milestone',
   'seed:maya', NULL,
   '{"pillar": "Calibration", "threshold": 50}'::jsonb,
   'public',
   now() - interval '32 hours'),

  -- 2. First Forum-tier comment — Anselm earns his first Forum classification
  ('22222222-2222-2222-2222-222222222222',
   'first_forum_comment',
   'seed:anselm', NULL,
   '{}'::jsonb,
   'public',
   now() - interval '20 hours'),

  -- 3. Aspiration declared — Wen declares aspiration toward The Reviser
  ('33333333-3333-3333-3333-333333333333',
   'aspiration_declared',
   'seed:wen', NULL,
   '{"archetype_label": "The Reviser"}'::jsonb,
   'public',
   now() - interval '14 hours'),

  -- 4. Correspondent established — Wen and Dan become Correspondents
  ('44444444-4444-4444-4444-444444444444',
   'correspondent_established',
   'seed:wen', '2f0d5ff2-570e-405a-8b40-ef5552660eb8',
   jsonb_build_object('other_name', COALESCE(
     (SELECT display_name FROM profiles WHERE ghost_member_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8'),
     'Daniel')),
   'public',
   now() - interval '8 hours'),

  -- 5. Archetype shift — Maya shifts from The Skeptic toward The Synthesizer
  ('55555555-5555-5555-5555-555555555555',
   'archetype_shift',
   'seed:maya', NULL,
   '{"previous_archetype": "The Skeptic", "new_archetype": "The Synthesizer"}'::jsonb,
   'public',
   now() - interval '4 hours'),

  -- 6. Sparring partner recognized — Wen and Dan become Sparring Partners
  ('66666666-6666-6666-6666-666666666666',
   'sparring_partner_recognized',
   'seed:wen', '2f0d5ff2-570e-405a-8b40-ef5552660eb8',
   jsonb_build_object('other_name', COALESCE(
     (SELECT display_name FROM profiles WHERE ghost_member_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8'),
     'Daniel')),
   'public',
   now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- After apply, sanity-check from any SQL client:
--
--   SELECT event_type, primary_member_id, created_at FROM feed_events
--   ORDER BY created_at DESC;
--     -> 6 rows; sparring_partner_recognized is most recent
--
--   SELECT event_type, display_payload FROM feed_events
--   WHERE id = '44444444-4444-4444-4444-444444444444';
--     -> display_payload.other_name should match Dan's profiles.display_name
--        (or 'Daniel' fallback if his row has display_name NULL)
-- ============================================================================
