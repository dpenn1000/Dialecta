-- anon-execute.sql
-- Every function in public that the anon role can execute, and why.
--
-- Why this exists: on 2026-09-21 migration 20260921012248 revoked EXECUTE from
-- anon on initialise_contributor_axes and anon could still execute it, through
-- the PUBLIC entry (=X/postgres) left in the ACL. The night before, the reverse:
-- a revoke from PUBLIC left an explicit anon grant. Reading the ACL for an
-- "anon=" entry answers neither case. has_function_privilege answers both,
-- because it resolves PUBLIC and role membership.
--
-- The Supabase advisor does not replace this: its function lints cover
-- SECURITY DEFINER only, and an invoker function anon can execute is outside them.
--
-- Closed by migration 20260921050000 (commit 09088c6), which added the revoke from
-- PUBLIC. Re-measured with this query the same night: initialise_contributor_axes no
-- longer appears; the three trigger functions remain, left open on purpose.
--
-- Read the output: every row is a function anon can call over PostgREST as
-- /rest/v1/rpc/<name>. via_public = true means a revoke from anon alone will not
-- close it. Expected result is an empty set, or rows each justified in writing.

select p.proname                                   as function_name,
       pg_get_function_identity_arguments(p.oid)   as args,
       p.prosecdef                                 as security_definer,
       t.typname = 'trigger'                       as is_trigger_function,
       coalesce(p.proacl::text, '(default: PUBLIC holds EXECUTE)') as acl,
       (p.proacl is null or p.proacl::text ~ '(^\{|,)=X')           as via_public,
       coalesce(p.proacl::text ~ '(^\{|,)anon=X', false)            as explicit_anon_grant
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_type t on t.oid = p.prorettype
where n.nspname = 'public'
  and has_function_privilege('anon', p.oid, 'EXECUTE')
order by p.prosecdef desc, is_trigger_function, p.proname;
