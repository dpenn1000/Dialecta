-- Migration 027: aspirational_archetype on profiles
--
-- A contributor's archetype is assigned by the platform based on their
-- actual engagement patterns. The aspirational archetype is the
-- contributor's declared growth target, set from the ArchetypeSelector
-- modal on their profile (the "+ Set aspiration" pill in the badge row)
-- or from the Settings drawer. The platform uses it to surface behavioral
-- guidance ("how to become The Reviser"); it does not influence the
-- assigned archetype.
--
-- Allowed values are enforced at the API layer (api/profile/[id].js)
-- against the eight-archetype list, mirroring the signature_font pattern,
-- so the list can evolve without a schema change. NULL means the
-- contributor has not declared an aspiration.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS aspirational_archetype text NULL;

COMMENT ON COLUMN public.profiles.aspirational_archetype IS
  'Contributor''s declared aspirational archetype (one of: skeptic, synthesizer, advocate, builder, empiricist, contextualist, illuminator, reviser). NULL when unset. Allowlist enforced at the API layer.';
