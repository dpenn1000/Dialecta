-- 034_profiles_gift_expires_at.sql
--
-- Adds the gift expiry timestamp to profiles. When is_gifted=true and
-- gift_expires_at is NULL, the gift is lifetime (Charter Writers, founding
-- authors). When gift_expires_at is set, the gift lapses at that time and
-- a daily cron will downgrade subscription_tier to 'free'.
--
-- The three founding cohort grants:
--   Charter Writers (first 25 published authors): is_charter=true,
--     is_gifted=true, gift_expires_at=NULL — lifetime comp.
--   Charter Underwriters (first 100 paying members): is_charter=true,
--     is_gifted=false — paid recurring at locked founding price.
--   Founding Voices (first 50 active commenters): is_charter=false,
--     is_gifted=true, gift_expires_at=now()+'1 year' — 1-year comp.
--
-- Independent of 031, 032, 033; composes with all of them.
-- Naming + positioning canonical: see memory project_underwriter_tier.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gift_expires_at timestamptz;

COMMENT ON COLUMN public.profiles.gift_expires_at IS
  'When is_gifted=true: timestamp at which the gift expires. NULL means lifetime (never expires). Lifetime is reserved for Charter Writers (founding-author cohort, first 25 published authors) and any other administrative grants intended to be permanent. Standard 1-year peer-gifts and Founding Voice grants set this to now() + interval ''1 year''. A daily cron will downgrade subscription_tier to ''free'' for rows where gift_expires_at < now() AND is_gifted = true.';
