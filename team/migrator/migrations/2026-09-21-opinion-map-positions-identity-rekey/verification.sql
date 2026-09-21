-- Verification for expand.sql, run right after applying it, against project
-- mguulnibvzusfvyuowwh. Every query is read-only except section 3, which writes inside its own
-- BEGIN/ROLLBACK and leaves no residue. Expected results are given inline; a result that does
-- not match is a reason to stop before contract.sql is ever considered, not to proceed and fix
-- forward.

-- ============================================================================
-- 1. The 9 rows, each mapped to the right profile and article.
-- Expect: 9 rows, every one of them true/true/true. This is the same join this folder's
-- expand.sql backfill used, run again against the now-populated columns instead of a plan.
-- ============================================================================

select
  omp.id,
  omp.reader_id,
  omp.profile_id,
  pr.ghost_member_id = omp.reader_id as profile_matches_ghost_id,
  omp.article_id,
  omp.article_ref_id,
  a.ghost_post_id = omp.article_id as article_matches_ghost_id,
  (omp.profile_id is not null and omp.article_ref_id is not null) as fully_backfilled
from public.opinion_map_positions omp
left join public.profiles pr on pr.id = omp.profile_id
left join public.articles a on a.id = omp.article_ref_id
order by omp.recorded_at;

-- ============================================================================
-- 2. No nulls where there should be none.
-- Expect: total = 9, with_profile = 9, with_article = 9, legacy_reader_still_present = 9,
-- legacy_article_still_present = 9. The last two confirm expand.sql did not touch reader_id or
-- article_id's values, only their NOT NULL constraint.
-- ============================================================================

select
  count(*) as total,
  count(profile_id) as with_profile,
  count(article_ref_id) as with_article,
  count(reader_id) as legacy_reader_still_present,
  count(article_id) as legacy_article_still_present
from public.opinion_map_positions;

-- ============================================================================
-- 3. Live's insert shape is still accepted, and still upserts in place rather than duplicating.
-- Mimics _recovered/api/opinion-map/place.js's own payload and onConflict target exactly:
-- {reader_id, article_id, map_index, stage, map_type, coordinates, recorded_at}, upsert on
-- (reader_id, article_id, map_index, stage). Runs as whatever role this query executes under;
-- if that role lacks table-level INSERT (for example this connector's own read-only role,
-- confirmed in exchange/open/2026-09-21-convener-06-blindspot-execute-sql-behaves-read-only.md),
-- run this block through a connection that has it, such as the one that will apply expand.sql,
-- not through the read-only advisor connector this folder's migrations were drafted against.
-- Uses one of the 9 real rows' own reader_id/article_id so the trigger has a real profile and
-- article to resolve against; picks a stage/map_index pair (map_index 1, pre_read) none of the 9
-- rows currently use, to insert fresh rather than collide with real data, then repeats the exact
-- same upsert with different coordinates to prove the second call updates instead of duplicating.
-- Expect: after_first_insert = 1 new row, its profile_id/article_ref_id both resolved (not
-- null); after_second_upsert still 1 row at that key, with the second call's coordinates, not
-- two rows. Everything here rolls back; nothing is left behind.
-- ============================================================================

begin;

insert into public.opinion_map_positions
  (reader_id, article_id, map_index, stage, map_type, coordinates, recorded_at)
values
  ('2f0d5ff2-570e-405a-8b40-ef5552660eb8', '69eff72be5eec200010d5310', 1, 'pre_read', 'binary', '{"x": 0.4}'::jsonb, now())
on conflict (reader_id, article_id, map_index, stage)
do update set coordinates = excluded.coordinates, recorded_at = excluded.recorded_at;

select
  'after_first_insert' as step,
  count(*) as rows_at_key,
  (array_agg(profile_id))[1] is not null as profile_resolved,
  (array_agg(article_ref_id))[1] is not null as article_resolved,
  (array_agg(coordinates))[1] as coordinates
from public.opinion_map_positions
where reader_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8'
  and article_id = '69eff72be5eec200010d5310'
  and map_index = 1
  and stage = 'pre_read';

insert into public.opinion_map_positions
  (reader_id, article_id, map_index, stage, map_type, coordinates, recorded_at)
values
  ('2f0d5ff2-570e-405a-8b40-ef5552660eb8', '69eff72be5eec200010d5310', 1, 'pre_read', 'binary', '{"x": 0.9}'::jsonb, now())
on conflict (reader_id, article_id, map_index, stage)
do update set coordinates = excluded.coordinates, recorded_at = excluded.recorded_at;

select
  'after_second_upsert' as step,
  count(*) as rows_at_key,
  (array_agg(coordinates))[1] as coordinates
from public.opinion_map_positions
where reader_id = '2f0d5ff2-570e-405a-8b40-ef5552660eb8'
  and article_id = '69eff72be5eec200010d5310'
  and map_index = 1
  and stage = 'pre_read';

rollback;

-- ============================================================================
-- 3b. Optional: the new writer, called the way apps/web will call it. Needs an authenticated
-- session context (a real request.jwt.claims with a sub that resolves through some profile's
-- user_id), which the read-only advisor connector this folder was drafted against could not
-- set up (`set local role anon` failed there with "permission denied to set role anon", per the
-- record cited above; the same is likely for `authenticated`). If the connector applying
-- expand.sql can set a local role and a local request.jwt.claims, or if a real claimed test
-- profile exists, this confirms the client-facing path end to end:
--
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub": "<a real auth.users.id with profiles.user_id set>"}';
--   select * from public.place_opinion_map_position(
--     '<a real articles.id>'::uuid, 0, 'pre_read', 'cartesian', '{"x": 0.5, "y": 0.5}'::jsonb
--   );
--   -- expect: one row back, id and recorded_at populated.
--   select * from public.place_opinion_map_position(
--     '<the same articles.id>'::uuid, 0, 'pre_read', 'cartesian', '{"x": 0.1, "y": 0.1}'::jsonb
--   );
--   -- expect: one row back, same id, coordinates now {0.1, 0.1}: revise, not duplicate.
--   reset role;
--
-- If no claimed test profile exists (all 14 live profiles have profiles.user_id null per this
-- session's own read and exchange/open/2026-09-21-architect-05-handoff-identity-one-key.md),
-- section 3 above is the load-bearing check and this one is confirmatory only, run once a test
-- profile is claimed.

-- ============================================================================
-- 4. Grants are as intended: anon/authenticated lose table insert/update; service_role is
-- unaffected; the new function is closed to public and anon, open to authenticated.
-- Expect table_grants: anon_insert=false, anon_update=false, auth_insert=false,
-- auth_update=false, service_insert=true, service_update=true, and select/delete unchanged from
-- before (true for anon/authenticated on select, matching the table's original grant; RLS, not
-- the grant, is what has always denied delete). Expect function_grants: exactly one row,
-- public_exec=false, anon_exec=false, authenticated_exec=true.
-- ============================================================================

select
  'table_grants' as what,
  has_table_privilege('anon', 'public.opinion_map_positions', 'INSERT') as anon_insert,
  has_table_privilege('anon', 'public.opinion_map_positions', 'UPDATE') as anon_update,
  has_table_privilege('anon', 'public.opinion_map_positions', 'SELECT') as anon_select,
  has_table_privilege('authenticated', 'public.opinion_map_positions', 'INSERT') as auth_insert,
  has_table_privilege('authenticated', 'public.opinion_map_positions', 'UPDATE') as auth_update,
  has_table_privilege('authenticated', 'public.opinion_map_positions', 'SELECT') as auth_select,
  has_table_privilege('service_role', 'public.opinion_map_positions', 'INSERT') as service_insert,
  has_table_privilege('service_role', 'public.opinion_map_positions', 'UPDATE') as service_update;

select
  'function_grants' as what,
  has_function_privilege('public', p.oid, 'EXECUTE') as public_exec,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_exec,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_exec
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'place_opinion_map_position';

-- ============================================================================
-- 5. The policy reads the uuid column, scoped to authenticated (see expand.sql section 8 for
-- why not public). Expect one row: opinion_map_self_read, PERMISSIVE, {authenticated}, SELECT,
-- qual containing "profile_id" and "current_profile_id", not "reader_id" and not
-- "request.jwt.claims".
-- ============================================================================

select policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'opinion_map_positions';

-- ============================================================================
-- 6. Shape sanity: the new columns, the new constraint, the two new indexes, the trigger, and
-- both functions all exist. Expect: 2 rows from the first query (profile_id, article_ref_id,
-- both uuid, both nullable); 1 row from the second (the new unique constraint, 4 columns);
-- 2 rows from the third (idx_opinion_map_profile, idx_opinion_map_article_ref_map_stage);
-- 1 row from the fourth (the resolve-identity trigger, BEFORE INSERT OR UPDATE); 2 rows from
-- the fifth (opinion_map_positions_resolve_identity, place_opinion_map_position).
-- ============================================================================

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'opinion_map_positions'
  and column_name in ('profile_id', 'article_ref_id')
order by column_name;

select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conrelid = 'public.opinion_map_positions'::regclass
  and conname = 'opinion_map_positions_profile_article_map_stage_key';

select indexname from pg_indexes
where schemaname = 'public' and tablename = 'opinion_map_positions'
  and indexname in ('idx_opinion_map_profile', 'idx_opinion_map_article_ref_map_stage');

select tgname, pg_get_triggerdef(oid) as def
from pg_trigger
where tgrelid = 'public.opinion_map_positions'::regclass and not tgisinternal;

select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in ('opinion_map_positions_resolve_identity', 'place_opinion_map_position')
order by proname;
