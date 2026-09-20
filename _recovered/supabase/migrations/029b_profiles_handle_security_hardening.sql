-- ============================================================================
-- 029b_profiles_handle_security_hardening.sql
-- ----------------------------------------------------------------------------
-- Clears the three advisor warnings introduced by 029:
--   • extension_in_public (pg_trgm)
--   • anon_security_definer_function_executable (check_handle_not_reserved)
--   • authenticated_security_definer_function_executable (same)
--
-- Mirrors the pattern from 028 + 028b: extensions live in the extensions
-- schema, trigger functions revoke EXECUTE from anon/authenticated/PUBLIC
-- so they can't be called via /rest/v1/rpc/.
--
-- Idempotent.
-- ============================================================================

BEGIN;

-- 1. Move pg_trgm to extensions schema --------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Drop indexes that bind to public.gin_trgm_ops before relocating
DROP INDEX IF EXISTS profiles_handle_trgm;
DROP INDEX IF EXISTS profiles_display_name_trgm;

ALTER EXTENSION pg_trgm SET SCHEMA extensions;

CREATE INDEX IF NOT EXISTS profiles_handle_trgm
  ON profiles USING gin (lower(handle) extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_display_name_trgm
  ON profiles USING gin (lower(display_name) extensions.gin_trgm_ops);

-- 2. Revoke EXECUTE on trigger function ------------------------------------
REVOKE EXECUTE ON FUNCTION public.check_handle_not_reserved() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_handle_not_reserved() FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_handle_not_reserved() FROM authenticated;

COMMIT;
