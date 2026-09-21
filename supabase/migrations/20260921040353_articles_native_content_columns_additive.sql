-- Step 0, additive only. Makes apps/web/src/lib/articles.ts able to run.
--
-- Supersedes the unrunnable
-- supabase/migrations/_archived_2026-09-19/20260919000100_articles_native.sql,
-- which aborted on `add column status` (status already exists), keyed its
-- policies on a non-existent author_id, and added neither slug, title nor
-- published_at while indexing published_at.
--
-- Deliberately NOT done here, because each is a real decision owned elsewhere:
--   * no author_id uuid column, and no auth.uid() policy. profiles.user_id is
--     null for all 14 profiles, so such a policy would match nothing today.
--     Article identity stays on author_member_id until migrator/decider rule.
--   * status, its CHECK ('draft','classified','published','reclassified') and
--     the articles_public_read policy are untouched. They work.
--   * nothing dropped, renamed, or retyped.
--
-- Column names are taken verbatim from scripts/import-ghost.mjs toRow(), so
-- that script stays a drop-in: it upserts on ghost_post_id, which means a
-- later real Ghost import overwrites anything seeded underneath it.

-- ---------------------------------------------------------------------------
-- 1. Content columns. Every one nullable or defaulted, so the five live rows
--    cannot block the migration.
-- ---------------------------------------------------------------------------

alter table public.articles
  add column if not exists slug text,
  add column if not exists title text,
  add column if not exists excerpt text,
  add column if not exists topic text,
  add column if not exists published_at timestamptz,
  add column if not exists body_html text not null default '',
  add column if not exists body_json jsonb not null default '{}'::jsonb,
  add column if not exists declared_claims jsonb not null default '[]'::jsonb;

comment on column public.articles.body_html is
  'Rendered HTML served to readers. Distinct from original_html, which is the pre-polish author submission.';
comment on column public.articles.slug is
  'URL key for /articles/[slug]. Nullable: Ghost-era rows may not have one yet. Unique among non-null values only.';

-- ---------------------------------------------------------------------------
-- 2. The foreign key PostgREST needs to resolve the author embed.
--
--    articles.ts embeds profiles through a named constraint. Live has no FK on
--    articles at all, which is why the front page fails with "Could not find a
--    relationship between 'articles' and 'profiles' in the schema cache".
--
--    This keys on author_member_id (text, Ghost member id) against
--    profiles.ghost_member_id, which already carries a UNIQUE constraint
--    (profiles_ghost_member_id_key), so it is a legal FK target. Verified
--    before writing: all 5 articles resolve to a profile, 0 orphans, so it
--    validates without touching a row.
--
--    ON DELETE is left at NO ACTION on purpose: deleting a profile that still
--    has articles should fail loudly rather than cascade.
-- ---------------------------------------------------------------------------

alter table public.articles
  add constraint articles_author_member_id_fkey
  foreign key (author_member_id)
  references public.profiles (ghost_member_id);

-- ---------------------------------------------------------------------------
-- 3. Indexes.
-- ---------------------------------------------------------------------------

-- The front page's exact access path: where status = 'published' order by published_at desc.
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

-- /articles/[slug] uses maybeSingle(), which errors on a second match, so slug
-- uniqueness is load-bearing. Partial, so rows without a slug coexist.
create unique index if not exists articles_slug_key
  on public.articles (slug)
  where slug is not null;

create index if not exists articles_topic_idx
  on public.articles (topic)
  where topic is not null;

-- ---------------------------------------------------------------------------
-- 4. PostgREST caches the schema, including relationships. Without this the
--    embed keeps failing on a cache from before this migration.
-- ---------------------------------------------------------------------------

notify pgrst, 'reload schema';
