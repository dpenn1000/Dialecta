-- articles: an author writes the content they own and cannot write classification output.
-- Precondition 3 of apps/web/src/app/api/article/route.ts. Designed and applied by the security
-- seat on the convener's brief, 2026-09-21.
--
-- Measured in pg_catalog before writing: relacl gave anon and authenticated arwdDxtm, with no
-- PUBLIC entry and no column ACLs. The one policy was articles_public_read (select, to public,
-- status = 'published'). No triggers. profiles.user_id is UNIQUE, null on all 14 rows, and not
-- readable by authenticated; profiles.id and profiles.is_author are.
--
-- THE HOLE. final_tier and ai_suggested_tier share the row with the author's own declared_tier,
-- so "an author may write their own row" lets an author write final_tier = 'forum' onto their
-- own article. PR-3 blocker B2 (exchange/open/2026-09-19-002-handoff-pr-3-review.md), on the one
-- table that still carries a tier column.
--
-- CLOSED BY COLUMN PRIVILEGE, NOT BY A CHECK.
--   * A WITH CHECK sees the new row, so "final_tier is null" holds on insert and refuses every
--     revision of a classified article, and all five live rows are classified. A subquery can
--     read the stored row, so immutability is expressible in a policy, but permissive policies
--     OR together and any later permissive update policy would lift it. A missing column
--     privilege fails before any policy is consulted, and no policy grants it back. So the update
--     policy is silent on tiers, and a revision carries the pipeline's tier through untouched.
--   * A column REVOKE does not override a table grant ("the table-level grant is unaffected by a
--     column-level operation", PostgreSQL, GRANT). So the table-level INSERT and UPDATE bits go,
--     and authenticated gets back exactly the columns the route writes: its `content` object on
--     update; that plus slug, author_member_id, author_profile_id, status and published_at on
--     insert. anon gets nothing back. SELECT is untouched, so reads and RETURNING are unchanged.
--
-- EACH ADMITTED COLUMN IS HELD TO WHAT THE ROUTE WRITES. The route writes through the session
-- client, so the database cannot tell it from a hand-built PostgREST request carrying the same
-- cookie, and a column the grant admits takes any value that caller sends. So:
--   * Both author ids are the caller's own. The byline embeds through author_profile_id
--     (lib/articles.ts); /write, the revise link and analytics go through author_member_id.
--     Pinning one leaves the other free to name somebody else. author_profile_id is the key,
--     through current_profile_id(), the function the architect's rebuild map names for every
--     policy (team/architect/architecture/2026-09-21-rebuild-map.md, "The spine, first").
--     author_member_id is pinned beside it until that column is retired.
--   * Author status is required to insert and to revise, so clearing is_author stops both.
--   * status is 'published', the only value the route writes.
--   * published_at is within five minutes of now(). The route writes new Date(); a free value
--     would let an author hold the top of the front page, which orders by published_at, or
--     backdate an article. STUDIO-PC's clock read within 3 seconds of now(), round trip included.
--   * final_tier and ai_suggested_tier are null at insert. The grant already makes both
--     unwritable; the check holds the row to it if a table-level grant is ever restored.
--
-- Left on the table grant: DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN. No delete policy
-- exists, so RLS refuses a delete, and PostgREST never issues TRUNCATE.

-- ---------------------------------------------------------------------------
-- Identity helpers. SECURITY DEFINER because authenticated cannot read
-- profiles.user_id. Each is scoped internally to auth.uid() and returns only a
-- value the caller can already read about their own profile. Plain CREATE, not
-- CREATE OR REPLACE, so a concurrent definition fails this migration rather
-- than being silently overwritten.
-- ---------------------------------------------------------------------------

create function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.profiles p
  where p.user_id = auth.uid();
$$;

comment on function public.current_profile_id() is
  'The calling session''s own profiles.id, or null when signed out or unclaimed. SECURITY DEFINER to read profiles.user_id, which authenticated cannot; profiles.user_id is UNIQUE, so at most one row. Call it as (select public.current_profile_id()) so a policy evaluates it once per statement.';

create function public.current_member_is_author()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.is_author
  );
$$;

comment on function public.current_member_is_author() is
  'Whether the calling session''s own profile has is_author set. False when signed out or unclaimed, never null. SECURITY DEFINER to read profiles.user_id, which authenticated cannot. A route may call it to refuse a non-author with a clear message before attempting a write.';

-- On Supabase a new function in public is executable by PUBLIC (the Postgres
-- default) and by anon (default privileges). Both are revoked by name.
revoke execute on function public.current_profile_id() from public, anon;
revoke execute on function public.current_member_is_author() from public, anon;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_member_is_author() to authenticated;

-- ---------------------------------------------------------------------------
-- Grants: which columns. The table-level write bits go; the route's columns
-- come back to authenticated only.
-- ---------------------------------------------------------------------------

revoke insert, update on public.articles from anon, authenticated;

grant insert (
  title, excerpt, topic, body_json, body_html, declared_claims,
  declaration, declared_tier, stage_2_5_choice, author_note,
  slug, author_member_id, author_profile_id, status, published_at
) on public.articles to authenticated;

grant update (
  title, excerpt, topic, body_json, body_html, declared_claims,
  declaration, declared_tier, stage_2_5_choice, author_note
) on public.articles to authenticated;

-- ---------------------------------------------------------------------------
-- Policies: which rows.
-- ---------------------------------------------------------------------------

create policy articles_author_insert
  on public.articles for insert
  to authenticated
  with check (
    author_profile_id = (select public.current_profile_id())
    and author_member_id = (select public.current_ghost_member_id())
    and (select public.current_member_is_author())
    and status = 'published'
    and published_at between now() - interval '5 minutes' and now() + interval '5 minutes'
    and final_tier is null
    and ai_suggested_tier is null
  );

-- Identity and author status only. Both are the same before and after a
-- revision, which is why they belong in a WITH CHECK and a tier does not.
create policy articles_author_update
  on public.articles for update
  to authenticated
  using (
    author_profile_id = (select public.current_profile_id())
    and author_member_id = (select public.current_ghost_member_id())
    and (select public.current_member_is_author())
  )
  with check (
    author_profile_id = (select public.current_profile_id())
    and author_member_id = (select public.current_ghost_member_id())
    and (select public.current_member_is_author())
  );

notify pgrst, 'reload schema';
