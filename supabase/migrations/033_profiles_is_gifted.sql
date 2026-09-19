-- 033_profiles_is_gifted.sql
--
-- Adds the gifting flag + audit field to profiles. When another member
-- gifts a year of Dialecta to this member (via the V2 peer-gifting flow:
-- Stripe one-time payment for a 1-year SKU, webhook calls Ghost Admin API
-- to comp the recipient), is_gifted is set true and gifted_by_member_id
-- records the gifter's ghost_member_id.
--
-- The recipient is functionally an Underwriter (subscription_tier='pro')
-- with all the same capabilities. The flag exists so the badge can render
-- the "Honored" variant instead of "Underwriter" — the recipient didn't
-- pay themselves but is honored by a peer's gift, which is a different
-- semantic from self-purchased support.
--
-- Independent of 031 (subscription_tier) and 032 (is_charter); the three
-- columns compose: a Charter Underwriter who was also gifted by another
-- founder would have all three flags set. UI gives Charter precedence
-- visually (it's the rarer founding-cohort signal).
--
-- Naming + positioning canonical: see memory project_underwriter_tier.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_gifted boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gifted_by_member_id text;

COMMENT ON COLUMN public.profiles.is_gifted IS
  'True when this member''s subscription_tier was set to pro by another member''s gift (peer-gifting via Ghost comp). Surfaces as the "Honored" badge variant. Distinct from is_charter (founding cohort). When true, gifted_by_member_id should be set to the gifter''s ghost_member_id.';

COMMENT ON COLUMN public.profiles.gifted_by_member_id IS
  'When is_gifted=true: ghost_member_id of the member who gifted this membership. Audit trail for the peer-gifting mechanic. Null when is_gifted=false.';
