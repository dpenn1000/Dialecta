-- Rollback for expand.sql in this folder. Not a migration file, not numbered, not meant to sit
-- in supabase/migrations/: this is what the convener runs by hand, through the same read-write
-- connector that applied expand.sql, if something is found wrong with it before contract.sql
-- ever applies. Reverses expand.sql's eight steps in reverse order. Restores the exact original
-- opinion_map_self_read policy text from _recovered/supabase/migrations/001_v1_1_schema.sql:232-233
-- and the original wide-open anon/authenticated table grants measured before expand.sql ran.
--
-- LIMITS, read before running.
--   * Data loss on the two new columns is expected and is not a problem: profile_id and
--     article_ref_id are dropped outright, and the backfill that populated them is trivially
--     re-derivable by re-running expand.sql, since reader_id and article_id (the source of that
--     backfill) are untouched by this script.
--   * Restoring NOT NULL on reader_id and article_id will fail outright if any row now holds a
--     null there. That can only happen if place_opinion_map_position() already wrote a
--     placement for a profile or article with no Ghost id in the window between expand.sql
--     applying and this script running. If it fails on that step, that is real information
--     (real new-path data exists that predates this rollback), not a bug in this script: stop,
--     do not force the column non-null by deleting rows, and take it back to the convener.
--   * This does not, and cannot, undo a write that already reached live through
--     place_opinion_map_position() and would not otherwise exist. It only removes the schema
--     objects expand.sql added and restores the two grants and the one policy it changed.

begin;

-- 8'. Restore the original policy, exactly as shipped in 001_v1_1_schema.sql: no explicit role
--     (defaults to PUBLIC), the original stale predicate against reader_id.

drop policy if exists opinion_map_self_read on public.opinion_map_positions;

create policy opinion_map_self_read on public.opinion_map_positions
  for select
  using (reader_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub'));

-- 7'. Restore the table-level grants measured before expand.sql: anon and authenticated both
--     held INSERT and UPDATE (safe only because no permissive policy admitted either, which is
--     true again once the objects below are gone).

grant insert, update on public.opinion_map_positions to anon, authenticated;

-- 6'. Drop the new writer. Its EXECUTE grants go with it.

drop function if exists public.place_opinion_map_position(uuid, integer, text, text, jsonb);

-- 5'. Drop the legacy-write bridge.

drop trigger if exists opinion_map_positions_resolve_identity on public.opinion_map_positions;
drop function if exists public.opinion_map_positions_resolve_identity();

-- 4'. Drop the new unique key and its two supporting indexes.

alter table public.opinion_map_positions
  drop constraint if exists opinion_map_positions_profile_article_map_stage_key;

drop index if exists idx_opinion_map_profile;
drop index if exists idx_opinion_map_article_ref_map_stage;

-- 2'. Restore NOT NULL. See LIMITS above: this is the step that fails loudly if new-path data
--     with a null legacy column already exists.

alter table public.opinion_map_positions
  alter column reader_id set not null,
  alter column article_id set not null;

-- 1'. Drop the two new columns. CASCADE takes their own foreign keys and comments with them;
--     nothing else in this schema references either column (confirmed: neither name appears in
--     any other table's constraint, index, or policy as of the reads this folder's migrations
--     were written against).

alter table public.opinion_map_positions
  drop column profile_id,
  drop column article_ref_id;

notify pgrst, 'reload schema';

commit;
