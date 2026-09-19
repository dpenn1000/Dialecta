-- Migration 028: pre-launch security hardening (advisor sweep)
--
-- Architecture context: The Dialecta theme has zero @supabase/supabase-js
-- imports (verified 2026-05-02). All reads and writes route through the
-- Vercel API + service role key, which bypasses RLS. Policies in this
-- migration are defensive: they make the database safe under future
-- architecture changes or any accidental anon-key exposure.
--
-- Four sections:
--   1. axis_events: enable RLS + service-role-only marker (was: ERROR)
--   2. Twelve internal tables: add explicit service-role-only markers
--      to clear the "RLS enabled, no policy" advisor INFO entries
--   3. profile_effective_capabilities view: switch to security_invoker
--      (was: ERROR -- default DEFINER mode)
--   4. Three trigger functions: pin search_path = '' (was: WARN)
--      and rewrite initialise_contributor_axes to qualify references
--
-- After this migration, get_advisors should return zero security findings.

-- ─── 1. axis_events: enable RLS + service-role-only marker ───────────
ALTER TABLE public.axis_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS axis_events_service_only ON public.axis_events;
CREATE POLICY axis_events_service_only ON public.axis_events FOR SELECT USING (false);

-- ─── 2. Twelve internal tables: explicit service-role-only markers ───
DROP POLICY IF EXISTS admin_audit_log_service_only ON public.admin_audit_log;
CREATE POLICY admin_audit_log_service_only ON public.admin_audit_log FOR SELECT USING (false);

DROP POLICY IF EXISTS admin_capabilities_service_only ON public.admin_capabilities;
CREATE POLICY admin_capabilities_service_only ON public.admin_capabilities FOR SELECT USING (false);

DROP POLICY IF EXISTS admin_role_capabilities_service_only ON public.admin_role_capabilities;
CREATE POLICY admin_role_capabilities_service_only ON public.admin_role_capabilities FOR SELECT USING (false);

DROP POLICY IF EXISTS admin_roles_service_only ON public.admin_roles;
CREATE POLICY admin_roles_service_only ON public.admin_roles FOR SELECT USING (false);

DROP POLICY IF EXISTS classifications_service_only ON public.classifications;
CREATE POLICY classifications_service_only ON public.classifications FOR SELECT USING (false);

DROP POLICY IF EXISTS feedback_items_service_only ON public.feedback_items;
CREATE POLICY feedback_items_service_only ON public.feedback_items FOR SELECT USING (false);

DROP POLICY IF EXISTS notification_prefs_service_only ON public.notification_prefs;
CREATE POLICY notification_prefs_service_only ON public.notification_prefs FOR SELECT USING (false);

DROP POLICY IF EXISTS notifications_service_only ON public.notifications;
CREATE POLICY notifications_service_only ON public.notifications FOR SELECT USING (false);

DROP POLICY IF EXISTS opinion_map_overrides_service_only ON public.opinion_map_overrides;
CREATE POLICY opinion_map_overrides_service_only ON public.opinion_map_overrides FOR SELECT USING (false);

DROP POLICY IF EXISTS profile_admin_capability_grants_service_only ON public.profile_admin_capability_grants;
CREATE POLICY profile_admin_capability_grants_service_only ON public.profile_admin_capability_grants FOR SELECT USING (false);

DROP POLICY IF EXISTS profile_admin_roles_service_only ON public.profile_admin_roles;
CREATE POLICY profile_admin_roles_service_only ON public.profile_admin_roles FOR SELECT USING (false);

DROP POLICY IF EXISTS tier_nominations_service_only ON public.tier_nominations;
CREATE POLICY tier_nominations_service_only ON public.tier_nominations FOR SELECT USING (false);

-- ─── 3. profile_effective_capabilities view: invoker mode ────────────
ALTER VIEW public.profile_effective_capabilities SET (security_invoker = on);

-- ─── 4. Three trigger functions: pinned search_path + qualified refs ─
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.quotes_set_updated_at() SET search_path = '';
ALTER FUNCTION public.initialise_contributor_axes(text) SET search_path = '';

-- initialise_contributor_axes touches public schema objects; rewrite
-- to use fully-qualified names so it executes correctly under empty
-- search_path. set_updated_at and quotes_set_updated_at only call
-- now() (in pg_catalog, implicitly available) and reference NEW
-- (a pseudo-variable, not schema-resolved), so they need no body change.
CREATE OR REPLACE FUNCTION public.initialise_contributor_axes(p_member_id text)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.axis_scores (member_id, axis)
  SELECT p_member_id, unnest(enum_range(NULL::public.axis))
  ON CONFLICT (member_id, axis) DO NOTHING;

  INSERT INTO public.archetypes (member_id, archetype_id, archetype_label)
  VALUES (p_member_id, 'forming', 'Pattern Still Forming')
  ON CONFLICT (member_id) DO NOTHING;
END;
$function$;
