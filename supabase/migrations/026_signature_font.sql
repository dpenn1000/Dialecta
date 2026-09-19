-- Migration 026: signature_font on profiles
--
-- Each contributor picks a hand-script Google Font when they sign the Pact.
-- That choice becomes their "signature" and is rendered:
--   1. On the Pact page after sealing (the canonical use)
--   2. Below the display name on /profile/<member>
--   3. As a sign-off byline at the end of authored articles
--
-- Default 'Pinyon Script' matches the existing pre-picker behavior so any
-- profile created before this migration renders unchanged.
--
-- The allowed values are enforced at the API layer (api/profile/[id].js +
-- api/_signature-fonts.js) rather than via a CHECK constraint, so adding a
-- new font is a code change, not a schema change.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signature_font text NOT NULL DEFAULT 'Pinyon Script';

COMMENT ON COLUMN public.profiles.signature_font IS
  'Google Font family used to render this contributor''s signature on the Pact page, profile page, and authored articles. Allowlist enforced at the API layer.';
