-- Native articles have no Ghost post id, and the publishing engine at /write
-- will not invent one, so this NOT NULL blocked every article that never lived
-- in Ghost. Item 2.2 of the morning audit.
--
-- Dan, 2026-09-21: "We are fully rebuilding this full Next.JS implementation"
-- and "please get this site built". Retiring Ghost as the source of new content
-- is the plan, so this is no longer a decision waiting on him.
--
-- Safe: relaxes a constraint, reversible, and the five existing rows all keep
-- their ghost_post_id. A unique index on the column, if any, allows many nulls
-- in Postgres, so native articles cannot collide with one another. The legacy
-- API looks articles up by ghost_post_id and simply will not find a native one,
-- which is correct: it only knows Ghost.

alter table public.articles alter column ghost_post_id drop not null;

comment on column public.articles.ghost_post_id is
  'The Ghost post this article was imported from, or null for an article written natively in apps/web. Relaxed from NOT NULL 2026-09-21.';

notify pgrst, 'reload schema';
