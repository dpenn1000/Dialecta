-- 031_profiles_subscription_tier.sql
--
-- Adds the subscription tier scaffold to profiles. Two tiers initially
-- (free, pro). Default 'free'. No payment integration yet; the field
-- exists so feature gates (candidate count, polish runs, future Pro-only
-- features) have a single source of truth, and admins can manually
-- toggle a member's tier for testing via dev-admin.
--
-- The CHECK constraint is intentionally permissive: it allows 'free' and
-- 'pro' today, with room to add named higher tiers (e.g. 'pro_plus',
-- 'foundational') later by ALTER-ing the constraint. We do NOT use a
-- Postgres ENUM type because adding values to enums is more disruptive
-- than relaxing a CHECK constraint.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'pro'));

-- Audit trail: when did this tier last change, and by whom.
-- subscription_tier_updated_at is set by a trigger; subscription_tier_set_by
-- is set by the application (the admin's member_id when toggled via
-- dev-admin, or 'system' for automated changes from a future payment
-- webhook). Both nullable; first-time creation leaves them null.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier_updated_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier_set_by text;

CREATE OR REPLACE FUNCTION public.profiles_subscription_tier_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    NEW.subscription_tier_updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_subscription_tier_touch ON public.profiles;
CREATE TRIGGER profiles_subscription_tier_touch
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_subscription_tier_touch();

COMMENT ON COLUMN public.profiles.subscription_tier IS
  'Subscription tier scaffold (free|pro). Manually toggled today; will be driven by a payment webhook when billing is added.';
COMMENT ON COLUMN public.profiles.subscription_tier_updated_at IS
  'Last time subscription_tier changed. Set by the profiles_subscription_tier_touch trigger.';
COMMENT ON COLUMN public.profiles.subscription_tier_set_by IS
  'Application-level audit: ghost_member_id of the admin who toggled the tier (via dev-admin), or "system" for automated changes (future payment webhook).';
