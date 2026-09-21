-- Completing a revoke that did not take effect, found by the architect seat.
--
-- 20260921012248 revoked EXECUTE from anon and left PUBLIC holding it. The ACL
-- read {=X/postgres, postgres=X, authenticated=X, service_role=X}: the leading
-- =X is PUBLIC, which every role inherits from, so anon could still execute.
-- The mirror of the night before, when migrations revoked PUBLIC and left anon.
-- On Supabase a function needs both revoked, and needs measuring afterwards.
--
-- Safe: nothing calls it, measured by architect across every code copy on disk,
-- every function, trigger, event trigger and pg_cron, and 24 hours of logs.

revoke execute on function public.initialise_contributor_axes(text) from public;
