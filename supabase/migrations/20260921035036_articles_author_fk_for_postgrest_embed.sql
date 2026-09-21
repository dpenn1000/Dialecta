-- The front page of apps/web returns 500 without this. PostgREST can only embed
-- a related resource when a foreign key tells it the relationship exists, and
-- `articles` had no foreign keys at all, so `getPublishedArticles`'s join to
-- profiles failed with "Could not find a relationship between 'articles' and
-- 'profiles' in the schema cache". Found by running the dev server rather than
-- by reading the code, 2026-09-21.
--
-- Safe to add, measured first: profiles.ghost_member_id already carries a UNIQUE
-- constraint (profiles_ghost_member_id_key), which a foreign key target requires,
-- and all 5 existing articles already match a profile, so nothing is rejected.
--
-- ON DELETE RESTRICT rather than SET NULL because author_member_id is NOT NULL.
-- An author's profile cannot be deleted while their articles exist, which is the
-- correct answer for a record that is meant to be permanent anyway.

alter table public.articles
  add constraint articles_author_member_id_fkey
  foreign key (author_member_id)
  references public.profiles (ghost_member_id)
  on delete restrict;

comment on constraint articles_author_member_id_fkey on public.articles is
  'Author identity, and the reason PostgREST can embed profiles from articles. Added 2026-09-21 after the Next.js front page failed on a join the schema did not declare.';