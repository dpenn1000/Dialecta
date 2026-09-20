-- ============================================================================
-- 004_seed_relationships.sql
-- ----------------------------------------------------------------------------
-- Seeds relationship rows between Dan and the three fictional contributors
-- so all four UI surfaces in the profile page have real test fixtures:
--
--   Maya    = Source        (Dan → Maya follow only)
--   Anselm  = Reader        (Anselm → Dan follow only)
--   Wen     = Correspondent (mutual follow) + Sparring Partner (visible chip)
--
-- Pre-launch fixture data only. Real users build these relationships through
-- normal product interactions (follow buttons, comment-engagement detection
-- for sparring formation). Idempotent: ON CONFLICT DO NOTHING.
--
-- Note on sparring_partners.member_a < member_b CHECK constraint: Dan's
-- ghost_member_id ('2f0d…') sorts before 'seed:wen' because '2' (0x32) <
-- 's' (0x73). So Dan is member_a, Wen is member_b. Both visibility flags
-- set to true so the chip renders publicly.
-- ============================================================================

BEGIN;

-- Maya = Source for Dan. One-way follow.
INSERT INTO follows (follower_id, followee_id) VALUES
  ('2f0d5ff2-570e-405a-8b40-ef5552660eb8', 'seed:maya')
ON CONFLICT (follower_id, followee_id) DO NOTHING;

-- Anselm = Reader for Dan. One-way follow (other direction).
INSERT INTO follows (follower_id, followee_id) VALUES
  ('seed:anselm', '2f0d5ff2-570e-405a-8b40-ef5552660eb8')
ON CONFLICT (follower_id, followee_id) DO NOTHING;

-- Wen = Correspondent for Dan. Mutual follow.
INSERT INTO follows (follower_id, followee_id) VALUES
  ('2f0d5ff2-570e-405a-8b40-ef5552660eb8', 'seed:wen'),
  ('seed:wen', '2f0d5ff2-570e-405a-8b40-ef5552660eb8')
ON CONFLICT (follower_id, followee_id) DO NOTHING;

-- Wen also = Sparring Partner. Both visibility flags opt-in so the chip
-- renders. article_count = 7 is a plausible "they've sparred across
-- seven articles" number for a developed engagement pattern.
INSERT INTO sparring_partners
  (member_a, member_b, article_count, visibility_a, visibility_b)
VALUES
  ('2f0d5ff2-570e-405a-8b40-ef5552660eb8', 'seed:wen', 7, true, true)
ON CONFLICT (member_a, member_b) DO NOTHING;

COMMIT;

-- ============================================================================
-- After apply, sanity-check from any SQL client:
--
--   SELECT follower_id, followee_id FROM follows
--   WHERE follower_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8'
--      OR followee_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8'
--   ORDER BY follower_id, followee_id;
--     → 4 rows (Dan→Maya, Dan→Wen, Wen→Dan, Anselm→Dan)
--
--   SELECT member_a, member_b, article_count, visibility_a, visibility_b
--   FROM sparring_partners;
--     → 1 row (Dan-Wen, 7 articles, both visible)
-- ============================================================================
