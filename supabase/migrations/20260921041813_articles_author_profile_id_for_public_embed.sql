-- A join key anon may read, so the front page can embed the author's name.
--
-- 20260921040353 added articles_author_member_id_fkey (author_member_id ->
-- profiles.ghost_member_id). The relationship resolves, but PostgREST's embed
-- joins ON profiles.ghost_member_id, and anon has no SELECT on that column:
-- 20260920192954_close_ghost_member_id_as_public_credential.sql revoked it on
-- purpose, because the recovered api/comment.js treats that value as proof of
-- identity. Result: "permission denied for table profiles". Re-granting it is
-- not an option.
--
-- profiles.id IS in the anon column grant, and it is profiles' primary key. So
-- this adds a pointer to it and the embed goes through that instead.
--
-- What this is NOT:
--   * not a decision about where article identity lives. author_member_id stays,
--     unchanged and NOT NULL, as the source. author_profile_id is derived from it.
--     It is also not the reserved `author_id -> auth.users` question: the name is
--     deliberately different so that column can still be added later with no
--     collision, and profiles.id survives whichever way that decision goes.
--   * no trigger yet. New rows must set it alongside author_member_id; the writer
--     path has both from get_own_profile_for_comment() (profile_id, member_id).
--     A sync trigger is the durable fix and needs a SECURITY DEFINER function,
--     so it waits for security. A row that omits it renders with no byline; it
--     does not error.
--
-- Additive: one nullable column, one backfill of that column, one FK, one index.

alter table public.articles
  add column if not exists author_profile_id uuid;

comment on column public.articles.author_profile_id is
  'profiles.id of the author, derived from author_member_id. Exists so the public read path can embed profiles without reading profiles.ghost_member_id, which is closed to anon. author_member_id remains the source.';

update public.articles a
   set author_profile_id = p.id
  from public.profiles p
 where p.ghost_member_id = a.author_member_id
   and a.author_profile_id is null;

alter table public.articles
  add constraint articles_author_profile_id_fkey
  foreign key (author_profile_id)
  references public.profiles (id);

create index if not exists articles_author_profile_id_idx
  on public.articles (author_profile_id);

do $check$
declare n int;
begin
  select count(*) into n
    from public.articles a
    join public.profiles p on p.id = a.author_profile_id and p.ghost_member_id = a.author_member_id;
  if n <> (select count(*) from public.articles) then
    raise exception 'author_profile_id backfill: % of % rows consistent with author_member_id',
      n, (select count(*) from public.articles);
  end if;
end
$check$;

notify pgrst, 'reload schema';
