-- Recorded as 20260921152637 by apply_migration, 2026-09-21, from the migrator seat's
-- team/migrator/migrations/2026-09-21-opinion-map-positions-identity-rekey/expand.sql with its
-- transaction wrapper removed (apply_migration runs in its own). Approved by Dan 2026-09-21.
--
-- opinion_map_positions: add the uuid identity columns now, ahead of the app-wide identity ADR,
-- per Dan's approval 2026-09-21 and step 5 of
-- team/architect/architecture/2026-09-21-delta-mechanic-port.md ("The write path", "Build
-- order"). Designed by the migrator seat on the convener's brief, 2026-09-21.
--
-- WHY THIS CANNOT BE A PLAIN ALTER COLUMN TYPE. Live dialecta.org still writes this table
-- directly: `_recovered/api/opinion-map/place.js`, server-side, Supabase **service role**,
-- `.from('opinion_map_positions').upsert({reader_id: member_uuid, article_id: ghost_post_id,
-- map_index, stage, map_type, coordinates, recorded_at}, {onConflict:
-- 'reader_id,article_id,map_index,stage'})` (`place.js:104` to `115`). That payload names
-- `reader_id` and `article_id` by column name and targets them by name in the upsert's conflict
-- key. Renaming either column, or changing either's type out from under that payload, breaks
-- live's Declare and Reflect the moment this migration is applied: PostgREST would return
-- `column "article_id" does not exist` (a rename) or a type-mismatch error (a retype) on every
-- placement, with no code on this side to fix, since the writer lives in `_recovered/` (frozen,
-- read-only, matches the live deployment byte for byte per root `CLAUDE.md`). So `reader_id` and
-- `article_id` keep their exact name and `text` type in this migration. Nothing about them
-- changes. Expand now; contract (drop them) at cutover, in the paired, unapplied
-- `contract.sql` in this same folder.
--
-- MEASURED against project mguulnibvzusfvyuowwh before writing a line below (this seat's own
-- queries, 2026-09-21, read-only role; independent of, and agreeing with, the architect's own
-- measurement in the port plan cited above):
--   * Columns: id uuid, reader_id text not null, article_id text not null, stage text not null
--     (check: pre_read/post_read), coordinates jsonb not null, map_type text not null (check:
--     cartesian/ternary/binary -- already includes binary, this is not a Phase-1-only schema),
--     recorded_at timestamptz not null default now(), map_index integer not null default 0.
--   * Constraints: opinion_map_positions_pkey (id), opinion_map_positions_reader_article_map_
--     stage_key UNIQUE (reader_id, article_id, map_index, stage). No foreign key on either id
--     column, by original design (the 001 migration's own comment: "Phase 1 uses Ghost
--     member_id (text) injected via API").
--   * RLS: enabled, relforcerowsecurity false. One policy, opinion_map_self_read, PERMISSIVE,
--     roles {public}, SELECT, USING (reader_id = (current_setting('request.jwt.claims',
--     true)::jsonb ->> 'sub')). Stale since Supabase Auth landed: 'sub' is auth.users.id, and
--     every reader_id in the table is a Ghost member id, so this has always matched zero rows
--     for a real session. Nothing calls it today (confirmed again by grep below), so leaving it
--     broken has cost nothing; fixed in this migration anyway since the uuid column that makes
--     it correct is what this migration adds.
--   * Grants: has_table_privilege confirms anon, authenticated AND service_role each hold
--     SELECT, INSERT, UPDATE, DELETE at the table level (information_schema.role_table_grants
--     under-reports this for a role the querying session does not hold; has_table_privilege does
--     not, per exchange/open/2026-09-20-security-03-handoff-grants-measured-b2-holds.md's own
--     trap). RLS denies anon/authenticated's insert/update/delete today only because no
--     permissive policy admits them; the grant itself is already wide open, exactly the B2 shape
--     that record's sequencing rule covers: a revoke has to land in the same migration as, or
--     before, the first write-capable path on the table, never after. This migration is that
--     write-capable path (place_opinion_map_position(), below), so the revoke is right here.
--   * Data: 9 rows, 3 distinct reader_id, 3 distinct article_id, 4 pre_read / 5 post_read. Every
--     row's reader_id matches exactly one profiles.ghost_member_id and every row's article_id
--     matches exactly one articles.ghost_post_id (both columns confirmed UNIQUE on their table,
--     so each join can match at most one row; checked by an explicit LEFT JOIN from this table
--     against both, zero unmatched). The backfill below is not a guess.
--   * profiles.ghost_member_id: text, not null, UNIQUE. profiles.id: uuid pkey. articles.
--     ghost_post_id: text, NULLABLE, UNIQUE (a native, non-Ghost article already has no value
--     here; the schema anticipated this before this migration did). articles.id: uuid pkey.
--   * No function named place_opinion_map_position exists yet (no collision). current_profile_id()
--     exists (`supabase/migrations/20260921053807_articles_author_write_policy.sql`),
--     STABLE SECURITY DEFINER, SET search_path = '', EXECUTE revoked from public/anon, granted to
--     authenticated, owned by postgres. The table itself is also owned by postgres, and postgres
--     holds BYPASSRLS, so a SECURITY DEFINER function owned by postgres reaches this table
--     without needing an insert/update RLS policy at all; the revoke below closes the direct
--     client path without touching the function's own path.
--   * grep across `_recovered/` for `opinion_map_positions`: the only write is place.js above;
--     the only other hit is `api/admin/pulse.js`, which lists the table's own COMMENT text as a
--     tunable's documentation string, not a query against the table. Nothing on live reads this
--     table back. `_recovered/api/article/[id].js` (the one read the front end makes for this
--     surface) selects from `articles` only, never from `opinion_map_positions`.
--
-- COLUMN NAMES. `reader_id`/`article_id` are pinned by live's payload (above) and cannot be
-- reused for the new uuid columns. Supabase's own naming guide, and this project's own
-- measured compliance with it (`team/architect/knowledge/2026-postgres-table-design-standards.md:176`,
-- "singular-table-plus-`_id` exactly: `comment_id`, `article_id`, `profile_id`..."), names a
-- foreign key column for the singular of its target table. `profile_id` is free on this table and
-- is literally one of that note's own examples, so it is used bare, unlike `articles.
-- author_profile_id`, which needs the `author_` prefix only because `articles` conceivably has
-- more than one person-shaped reference; this table has exactly one. `article_id` is not free, so
-- the new column is `article_ref_id`: not a house-standard name today, a placeholder for the
-- standard one. `docs/Dialecta_Data_Architecture.md`, entity 12, already specs the destination
-- shape as plain `reader_id uuid` / `article_id uuid` with no legacy sibling; the paired
-- `contract.sql` gets there by dropping the old text columns and renaming `profile_id` back to
-- `reader_id` and `article_ref_id` back to `article_id`, once live no longer writes the text
-- columns by name. Both are named for that rename, not as a permanent pair of names.
--
-- ON DELETE CASCADE on both new foreign keys, matching the two live tables that already
-- reference these same two targets the same way: `opinion_map_overrides.article_id uuid
-- references articles(id) on delete cascade` and `profile_claim_tokens.profile_id references
-- profiles(id) on delete cascade` (`_recovered/supabase/migrations/022_opinion_map_overrides.sql`;
-- `supabase/migrations/20260920000200_profile_claim_tokens.sql`). A reader's own placements are
-- the reader's own data, the same shape as a claim token, not a ledger; `axis_events` is the
-- table this codebase holds to a stricter, append-only, never-rewritten rule
-- (`supabase/CLAUDE.md`), and this is not that table. Whether a profile can be deleted at all is
-- still open at the app-wide level (`exchange/open/2026-09-21-architect-05-handoff-identity-one-key.md`,
-- "Traps"); this migration matches the two shipped precedents for this specific pair of targets
-- rather than pre-empting that ruling.
--
-- NOT NULL. The brief asks to relax it "on the text columns that would block a member who has no
-- Ghost id." Both `reader_id` and `article_id` are relaxed, not `reader_id` alone: a member with
-- no Ghost id blocks on `reader_id not null` exactly as asked, and by the identical mechanism a
-- native article authored directly in the new app (no Ghost post behind it, already possible
-- today: `articles.ghost_post_id` is nullable) would block on `article_id not null` the first
-- time a reader places a position on it. `place_opinion_map_position()` is written to accept any
-- `articles.id`, Ghost-sourced or not; leaving `article_id not null` in place would make that a
-- half-truth that fails the moment someone uses it on a native article. Flagging this as a
-- judgment call, not a literal reading of the brief, in the handoff to the convener.

-- ---------------------------------------------------------------------------
-- 1. The two uuid identity columns. Nullable: a legacy row this migration cannot resolve (should
--    not exist per the backfill check below, but the column has to allow it structurally) and a
--    future row from a profile or article with no Ghost id both need to store null here without
--    failing.
-- ---------------------------------------------------------------------------

alter table public.opinion_map_positions
  add column profile_id uuid references public.profiles(id) on delete cascade,
  add column article_ref_id uuid references public.articles(id) on delete cascade;

comment on column public.opinion_map_positions.profile_id is
  'The reader, as profiles.id. Added 2026-09-21 to re-key this table ahead of the app-wide identity ADR (team/architect/architecture/2026-09-21-delta-mechanic-port.md, "The write path"). Filled by place_opinion_map_position() on every new write and by the opinion_map_positions_resolve_identity trigger for legacy writes through reader_id. Destined to be renamed to reader_id once the paired contract migration drops the text reader_id column at cutover.';

comment on column public.opinion_map_positions.article_ref_id is
  'The article, as articles.id. Added 2026-09-21, same migration and reasoning as profile_id. Named article_ref_id only because article_id already names the legacy Ghost post id column live still writes to; destined to be renamed to article_id once the paired contract migration drops that column at cutover.';

-- ---------------------------------------------------------------------------
-- 2. Relax NOT NULL on the legacy text columns. See "NOT NULL" above for why both, not just
--    reader_id.
-- ---------------------------------------------------------------------------

alter table public.opinion_map_positions
  alter column reader_id drop not null,
  alter column article_id drop not null;

-- ---------------------------------------------------------------------------
-- 3. Backfill the 9 existing rows. Measured above: every reader_id matches exactly one
--    profiles.ghost_member_id and every article_id matches exactly one articles.ghost_post_id,
--    both target columns UNIQUE, so this join cannot fan out and cannot need a DISTINCT ON.
--    Plain UPDATE, not a trigger, so the one-time backfill and the ongoing resolution stay
--    visibly separate; the trigger is created after this step and only governs writes from here
--    forward.
-- ---------------------------------------------------------------------------

update public.opinion_map_positions omp
set profile_id = pr.id,
    article_ref_id = a.id
from public.profiles pr, public.articles a
where pr.ghost_member_id = omp.reader_id
  and a.ghost_post_id = omp.article_id;

-- ---------------------------------------------------------------------------
-- 4. The new unique key, for place_opinion_map_position()'s own upsert. The existing
--    (reader_id, article_id, map_index, stage) key is untouched and keeps doing exactly what it
--    does today for live's own upsert. A plain UNIQUE constraint allows multiple nulls, which is
--    correct here: a row this migration could not resolve, or a future placement on a
--    Ghost-less profile or article, must not collide with every other such row.
--
--    One index, not two, on the article side. The legacy shape carries both
--    idx_opinion_map_article (article_id, stage) and idx_opinion_map_article_map_stage
--    (article_id, map_index, stage); the second already serves the first's own filter as a
--    prefix scan at this table's size (9 rows). Only the second is mirrored here, deliberately,
--    not a parity oversight; contract.sql notes the same choice where it drops the legacy pair.
-- ---------------------------------------------------------------------------

alter table public.opinion_map_positions
  add constraint opinion_map_positions_profile_article_map_stage_key
  unique (profile_id, article_ref_id, map_index, stage);

create index if not exists idx_opinion_map_profile
  on public.opinion_map_positions (profile_id);

create index if not exists idx_opinion_map_article_ref_map_stage
  on public.opinion_map_positions (article_ref_id, map_index, stage);

-- ---------------------------------------------------------------------------
-- 5. The trigger that keeps the uuid columns filled for live's own writes. Live's service-role
--    upsert only ever sends reader_id/article_id (text); without this, every row live writes or
--    revises from this point forward would carry profile_id/article_ref_id = null, and the new
--    app's own reads and place_opinion_map_position() upsert would never see it. SECURITY
--    DEFINER for the same reason every identity-resolution function in this schema is (comment_
--    tiers, own_comment_readings, current_profile_id): consistent, predictable behavior
--    regardless of which role's statement fires it, not because either live's service_role or
--    this migration's own postgres role strictly needs the elevation here. No EXECUTE grant is
--    given or revoked for it: Postgres does not check EXECUTE on a trigger function to fire it,
--    only the calling role's privilege to perform the INSERT/UPDATE itself (checked via the
--    table grant and RLS, both handled separately below), so the by-name public/anon revoke
--    pattern used for the callable functions in this file does not apply to this one.
-- ---------------------------------------------------------------------------

create function public.opinion_map_positions_resolve_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.profile_id is null and new.reader_id is not null then
    select pr.id into new.profile_id
    from public.profiles pr
    where pr.ghost_member_id = new.reader_id;
  end if;

  if new.article_ref_id is null and new.article_id is not null then
    select a.id into new.article_ref_id
    from public.articles a
    where a.ghost_post_id = new.article_id;
  end if;

  return new;
end;
$$;

comment on function public.opinion_map_positions_resolve_identity() is
  'Fills profile_id/article_ref_id from reader_id/article_id (Ghost ids) whenever a write leaves them null, so live''s legacy service-role upsert (_recovered/api/opinion-map/place.js) keeps both id shapes in sync without knowing the uuid columns exist. A Ghost id with no matching profiles.ghost_member_id or articles.ghost_post_id row (not imported yet) leaves the corresponding uuid column null rather than failing the write; live has never validated either id beyond acceptance today, and this does not add a new failure mode on top of that.';

create trigger opinion_map_positions_resolve_identity
  before insert or update on public.opinion_map_positions
  for each row
  execute function public.opinion_map_positions_resolve_identity();

-- ---------------------------------------------------------------------------
-- 6. place_opinion_map_position(): the one new writer for the ported app. Matches the pattern
--    supabase/migrations/20260921053807_articles_author_write_policy.sql and
--    20260921063139_comment_tier_and_reading_functions.sql just shipped: SECURITY DEFINER,
--    search_path = '' (not the older search_path = public, pg_temp form current_ghost_member_id
--    still carries), every name schema-qualified, plain CREATE so a concurrent definition fails
--    this migration instead of being silently overwritten.
--
--    The reader is never a function argument. It resolves from public.current_profile_id(),
--    the same reason apps/web/src/app/api/comment/route.ts never reads a member id from its own
--    request body. A null resolution (signed in, profile not yet claimed, all 14 legacy profiles
--    today) returns no rows, the same shape public.get_own_profile_for_comment() already uses
--    for the identical case, rather than raising.
--
--    Validation re-runs, in SQL, exactly what place.js validates in JS today (stage in
--    pre_read/post_read, map_type in cartesian/ternary/binary, coordinate shape and range per
--    type, ternary summing to ~1 within the same 0.05 tolerance place.js uses): a client-supplied
--    shape is never trusted twice, only once, and this function is that once. Written as
--    sequential IF statements rather than one compound boolean expression so a malformed value
--    (wrong JSON type in a coordinate key) is always caught by the type check before any numeric
--    cast is attempted; PL/pgSQL statements execute in the order written, a plain multi-term SQL
--    boolean expression is not guaranteed to.
--
--    p_article_id is a real foreign key (article_ref_id references articles(id)), which is
--    already stronger validation than live ever had: place.js accepts any string as
--    ghost_post_id and lets the database hold it, since there was no foreign key to check it
--    against. An article_id for an article that does not exist now fails outright, on the
--    constraint, with no extra code needed here for it.
-- ---------------------------------------------------------------------------

create function public.place_opinion_map_position(
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
  v_reader_id text;
  v_article_ghost_id text;
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

  -- Fill the legacy text columns too, when the profile and article have Ghost ids, so live's
  -- own upsert (which matches on reader_id/article_id, not on the uuid columns) lands on the
  -- same physical row rather than a duplicate if it ever writes this same placement.
  select pr.ghost_member_id into v_reader_id from public.profiles pr where pr.id = v_profile_id;
  select a.ghost_post_id into v_article_ghost_id from public.articles a where a.id = p_article_id;

  return query
    insert into public.opinion_map_positions as omp (
      profile_id, article_ref_id, map_index, stage, map_type, coordinates,
      reader_id, article_id, recorded_at
    )
    values (
      v_profile_id, p_article_id, p_map_index, p_stage, p_map_type, p_coordinates,
      v_reader_id, v_article_ghost_id, now()
    )
    on conflict (profile_id, article_ref_id, map_index, stage)
    do update set
      map_type    = excluded.map_type,
      coordinates = excluded.coordinates,
      reader_id   = excluded.reader_id,
      article_id  = excluded.article_id,
      recorded_at = excluded.recorded_at
    returning omp.id, omp.recorded_at;
end;
$$;

comment on function public.place_opinion_map_position(uuid, integer, text, text, jsonb) is
  'The one writer for a reader''s own opinion-map placement, ported from _recovered/api/opinion-map/place.js. Resolves the reader from current_profile_id(), never from an argument. Upserts on (profile_id, article_ref_id, map_index, stage); backfills reader_id/article_id from the resolved profile/article''s own Ghost ids so live''s separate, still-active upsert on (reader_id, article_id, map_index, stage) lands on the same row. Returns no row for a signed-out or unclaimed caller, matching get_own_profile_for_comment(). team/architect/architecture/2026-09-21-delta-mechanic-port.md, "The write path".';

-- On Supabase a new function in public is executable by PUBLIC (the Postgres default) and by
-- anon and authenticated through default privileges. Each revoked by name in its own statement,
-- the shape 20260921063139_comment_tier_and_reading_functions.sql uses and
-- exchange/open/2026-09-21-convener-06-blindspot-execute-sql-behaves-read-only.md's second
-- finding calls for: a single combined revoke can miss anon, which holds its own default grant
-- separately from PUBLIC's.

revoke execute on function public.place_opinion_map_position(uuid, integer, text, text, jsonb) from public;
revoke execute on function public.place_opinion_map_position(uuid, integer, text, text, jsonb) from anon;
revoke execute on function public.place_opinion_map_position(uuid, integer, text, text, jsonb) from authenticated;
grant execute on function public.place_opinion_map_position(uuid, integer, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Grants: close the direct-client path. Measured above: anon and authenticated both already
--    hold table-level INSERT and UPDATE on opinion_map_positions, safe today only because no
--    permissive policy admits either command. place_opinion_map_position() above is the first
--    write-capable path this table has ever had under RLS, so per this seat's own standing
--    practice (exchange/open/2026-09-20-security-03-handoff-grants-measured-b2-holds.md, "the
--    revoke has to land in the same migration as, or before, the first write policy on that
--    table, never after"), the revoke lands in this same migration, not a later one.
--
--    service_role is unaffected: REVOKE names anon and authenticated only, and even if it named
--    service_role too, RLS does not apply to it (bypasses RLS by role attribute on this
--    project), so live's own direct service-role upsert keeps working exactly as measured above.
--    SELECT and DELETE grants are untouched: the brief asks only for insert and update, DELETE
--    was already refused by RLS (no delete policy exists, unchanged by this migration), and
--    narrowing SELECT is a separate, unasked-for change this migration does not make.
-- ---------------------------------------------------------------------------

revoke insert, update on public.opinion_map_positions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Fix opinion_map_self_read to read the uuid column. The brief's instruction is to change the
--    predicate; doing only that (predicate change, same `roles {public}` the policy has today)
--    would newly break every anon SELECT against this table: with the policy applying to public,
--    Postgres evaluates its USING clause for anon too, and anon has no EXECUTE on
--    current_profile_id() (deliberately, per that function's own comment), so the query would
--    error rather than return zero rows. Today anon silently gets zero rows, because the stale
--    predicate compares reader_id to a JWT sub anon never has. Scoping the policy to
--    authenticated preserves that same zero-rows-no-error outcome for anon (no permissive SELECT
--    policy applies to anon at all, so RLS denies by default, exactly as quiet as today) while
--    letting the predicate call current_profile_id() safely for the role that can actually use
--    it. Flagging this as a judgment call beyond the letter of the brief, made for exactly the
--    reason the standing grant-revoke practice above exists: a policy change is not safe to
--    reason about in isolation from the grants and functions it runs against.
-- ---------------------------------------------------------------------------

drop policy if exists opinion_map_self_read on public.opinion_map_positions;

create policy opinion_map_self_read on public.opinion_map_positions
  for select
  to authenticated
  using (profile_id = (select public.current_profile_id()));

notify pgrst, 'reload schema';

