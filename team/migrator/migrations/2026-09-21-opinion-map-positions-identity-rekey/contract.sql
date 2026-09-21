-- Proposed path: supabase/migrations/<TIMESTAMP>_opinion_map_positions_identity_contract.sql
-- STATUS: written, NOT applied, NOT to be applied now. This is the cutover half of the
-- expand/contract pair in this folder. Apply it only once dialecta.org no longer runs
-- `_recovered/api/opinion-map/place.js` against this project, i.e. once live is retired or
-- repointed at apps/web, per Decision 3 in
-- team/architect/architecture/2026-09-21-delta-mechanic-port.md ("Build order"). Applying this
-- while live is still writing reader_id/article_id by name reproduces exactly the break the
-- expand migration exists to avoid: PostgREST would return `column "reader_id" does not exist`
-- on live's next placement.
--
-- What this does, in order: drops the trigger and function that exist only to bridge live's
-- legacy writes (opinion_map_positions_resolve_identity), drops the now-unused legacy text
-- columns and the constraints/indexes that reference them, renames the uuid columns into the
-- bare names docs/Dialecta_Data_Architecture.md entity 12 already specs (reader_id uuid,
-- article_id uuid), renames the expand migration's provisional constraint/index names to match,
-- rewrites opinion_map_self_read and place_opinion_map_position() to the new names, and drops
-- nothing else. `apps/web`'s own call to place_opinion_map_position() does not change: same five
-- arguments, same two-column return shape, before and after this migration. Only the function's
-- internals and the table's own column names move.
--
-- ON THE RENAMES NOT BEING GUESSED. ALTER TABLE ... RENAME COLUMN updates every dependency-
-- tracked reference to that column automatically. CHECK constraints, indexes and RLS policies
-- are all stored as parsed expressions tied to the column by catalog dependency (pg_depend), the
-- same mechanism that already lets a view or a policy survive a column rename elsewhere in this
-- project; opinion_map_self_read would in fact keep working through the rename with no edit at
-- all. It is dropped and rewritten here anyway, not left to the implicit rename, matching this
-- repo's own standing practice that RLS policy text is always hand-written and never left to
-- inference (2026-supabase-declarative-schemas.md). A PL/pgSQL function body is different: it is
-- opaque text with no catalog-tracked reference to the columns it mentions, so
-- place_opinion_map_position() would NOT follow the rename on its own and is explicitly
-- CREATE OR REPLACEd below with the new names. CREATE OR REPLACE FUNCTION keeps the function's
-- OID and every existing grant when the signature is unchanged (Postgres, CREATE FUNCTION), so
-- the expand migration's EXECUTE grant to authenticated and revokes from public/anon are not
-- re-stated here; they already hold.

begin;

-- ---------------------------------------------------------------------------
-- 1. Retire the legacy-write bridge. Nothing will call this after cutover: live is the only
--    writer that ever sent a bare reader_id/article_id payload, and live is what cutover retires.
-- ---------------------------------------------------------------------------

drop trigger if exists opinion_map_positions_resolve_identity on public.opinion_map_positions;
drop function if exists public.opinion_map_positions_resolve_identity();

-- ---------------------------------------------------------------------------
-- 2. Drop the constraint and indexes that reference the legacy text columns, explicitly and by
--    name, ahead of dropping the columns themselves, rather than relying on a column drop to
--    take them with it.
-- ---------------------------------------------------------------------------

alter table public.opinion_map_positions
  drop constraint if exists opinion_map_positions_reader_article_map_stage_key;

-- idx_opinion_map_article (article_id, stage) has no direct successor: expand.sql's own step 4
-- already chose idx_opinion_map_article_ref_map_stage as the one article-side index going
-- forward (see that file's comment on the same choice). Not reinstated here as a third index.
drop index if exists idx_opinion_map_article;
drop index if exists idx_opinion_map_article_map_stage;
drop index if exists idx_opinion_map_reader;

-- ---------------------------------------------------------------------------
-- 3. Drop the legacy text columns. This is the one irreversible step in this migration; the
--    paired rollback for the expand half (rollback_expand.sql, this same folder) cannot restore
--    these values once this runs, only the expand migration's own additions can be rolled back,
--    and only before this file ever applies.
-- ---------------------------------------------------------------------------

alter table public.opinion_map_positions
  drop column reader_id,
  drop column article_id;

-- ---------------------------------------------------------------------------
-- 4. Reclaim the bare names docs/Dialecta_Data_Architecture.md entity 12 specs.
-- ---------------------------------------------------------------------------

alter table public.opinion_map_positions rename column profile_id to reader_id;
alter table public.opinion_map_positions rename column article_ref_id to article_id;

alter table public.opinion_map_positions
  rename constraint opinion_map_positions_profile_article_map_stage_key
  to opinion_map_positions_reader_article_map_stage_key;

alter index idx_opinion_map_profile rename to idx_opinion_map_reader;
alter index idx_opinion_map_article_ref_map_stage rename to idx_opinion_map_article_map_stage;

comment on column public.opinion_map_positions.reader_id is
  'The reader, as profiles.id. uuid from 2026-09-21; text (Ghost member id) before the cutover migration that dropped the legacy column and renamed this one into its place.';

comment on column public.opinion_map_positions.article_id is
  'The article, as articles.id. uuid from 2026-09-21; text (Ghost post id) before the cutover migration that dropped the legacy column and renamed this one into its place.';

-- ---------------------------------------------------------------------------
-- 5. Rewrite the policy against the renamed column. Hand-written, not left to the rename's own
--    dependency tracking; see header.
-- ---------------------------------------------------------------------------

drop policy if exists opinion_map_self_read on public.opinion_map_positions;

create policy opinion_map_self_read on public.opinion_map_positions
  for select
  to authenticated
  using (reader_id = (select public.current_profile_id()));

-- ---------------------------------------------------------------------------
-- 6. Rewrite place_opinion_map_position() against the renamed columns: the reader/article
--    columns in the INSERT list, the ON CONFLICT target, and the legacy-column backfill (gone,
--    nothing left to backfill) all change. The five arguments and the two-column return shape
--    do not; nothing calling this function needs to change for this migration to apply.
-- ---------------------------------------------------------------------------

create or replace function public.place_opinion_map_position(
  p_article_id uuid,
  p_map_index integer,
  p_stage text,
  p_map_type text,
  p_coordinates jsonb
)
returns table (id uuid, recorded_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_sum numeric;
begin
  v_profile_id := public.current_profile_id();
  if v_profile_id is null then
    return; -- signed in but unclaimed, or signed out: no row, same shape as get_own_profile_for_comment()
  end if;

  if p_map_index is null or p_map_index not in (0, 1) then
    raise exception 'map_index must be 0 or 1';
  end if;

  if p_stage is null or p_stage not in ('pre_read', 'post_read') then
    raise exception 'stage must be pre_read or post_read';
  end if;

  if p_map_type is null or p_map_type not in ('cartesian', 'ternary', 'binary') then
    raise exception 'map_type must be cartesian, ternary, or binary';
  end if;

  if p_coordinates is null or jsonb_typeof(p_coordinates) <> 'object' then
    raise exception 'coordinates must be a JSON object';
  end if;

  if p_map_type = 'cartesian' then
    if not (p_coordinates ? 'x' and p_coordinates ? 'y') then
      raise exception 'cartesian coordinates require {x, y} numbers in [0, 1]';
    end if;
    if jsonb_typeof(p_coordinates -> 'x') <> 'number' or jsonb_typeof(p_coordinates -> 'y') <> 'number' then
      raise exception 'cartesian coordinates require {x, y} numbers in [0, 1]';
    end if;
    if (p_coordinates ->> 'x')::numeric < 0 or (p_coordinates ->> 'x')::numeric > 1
       or (p_coordinates ->> 'y')::numeric < 0 or (p_coordinates ->> 'y')::numeric > 1 then
      raise exception 'cartesian coordinates require {x, y} numbers in [0, 1]';
    end if;

  elsif p_map_type = 'ternary' then
    if not (p_coordinates ? 'a' and p_coordinates ? 'b' and p_coordinates ? 'c') then
      raise exception 'ternary coordinates require {a, b, c} numbers in [0, 1]';
    end if;
    if jsonb_typeof(p_coordinates -> 'a') <> 'number' or jsonb_typeof(p_coordinates -> 'b') <> 'number'
       or jsonb_typeof(p_coordinates -> 'c') <> 'number' then
      raise exception 'ternary coordinates require {a, b, c} numbers in [0, 1]';
    end if;
    if (p_coordinates ->> 'a')::numeric < 0 or (p_coordinates ->> 'a')::numeric > 1
       or (p_coordinates ->> 'b')::numeric < 0 or (p_coordinates ->> 'b')::numeric > 1
       or (p_coordinates ->> 'c')::numeric < 0 or (p_coordinates ->> 'c')::numeric > 1 then
      raise exception 'ternary coordinates require {a, b, c} numbers in [0, 1]';
    end if;
    v_sum := (p_coordinates ->> 'a')::numeric + (p_coordinates ->> 'b')::numeric + (p_coordinates ->> 'c')::numeric;
    if abs(v_sum - 1) > 0.05 then
      raise exception 'ternary coordinates {a, b, c} must sum to ~1, got %', v_sum;
    end if;

  elsif p_map_type = 'binary' then
    if not (p_coordinates ? 'x') then
      raise exception 'binary coordinates require {x} number in [0, 1]';
    end if;
    if jsonb_typeof(p_coordinates -> 'x') <> 'number' then
      raise exception 'binary coordinates require {x} number in [0, 1]';
    end if;
    if (p_coordinates ->> 'x')::numeric < 0 or (p_coordinates ->> 'x')::numeric > 1 then
      raise exception 'binary coordinates require {x} number in [0, 1]';
    end if;
  end if;

  return query
    insert into public.opinion_map_positions as omp (
      reader_id, article_id, map_index, stage, map_type, coordinates, recorded_at
    )
    values (
      v_profile_id, p_article_id, p_map_index, p_stage, p_map_type, p_coordinates, now()
    )
    on conflict (reader_id, article_id, map_index, stage)
    do update set
      map_type    = excluded.map_type,
      coordinates = excluded.coordinates,
      recorded_at = excluded.recorded_at
    returning omp.id, omp.recorded_at;
end;
$$;

comment on function public.place_opinion_map_position(uuid, integer, text, text, jsonb) is
  'The one writer for a reader''s own opinion-map placement. Resolves the reader from current_profile_id(), never from an argument. Upserts on (reader_id, article_id, map_index, stage), both uuid since the cutover migration. Returns no row for a signed-out or unclaimed caller, matching get_own_profile_for_comment().';

notify pgrst, 'reload schema';

commit;
