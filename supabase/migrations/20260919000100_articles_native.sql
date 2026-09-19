-- Articles are native to Supabase from day one. Ghost is out.
--
-- Source: docs/decisions/ ADR-001 and ADR-003. This supersedes the Phase 1
-- Ghost integration notes in docs/Dialecta_Data_Architecture.md. The legacy
-- articles.ghost_post_id text column stays so a one-time import
-- (scripts/import-ghost.mjs) can be re-run idempotently; nothing else reads it.
--
-- body_json holds the editor document (TipTap JSON). body_html is the rendered
-- HTML served to readers. Both are written together by the editor.

-- ---------------------------------------------------------------------------
-- articles: native content columns
-- ---------------------------------------------------------------------------

alter table public.articles
  add column body_json jsonb not null default '{}'::jsonb,
  add column body_html text not null default '',
  add column status text not null default 'draft'
    check (status in ('draft', 'declared', 'published', 'archived')),
  add column declared_claims jsonb not null default '[]'::jsonb,   -- Article Editorial Template, author-declared key claims
  add column suggested_axes jsonb,                                   -- opinion map axes proposed by pre-analysis, null until run
  add column amend_until timestamptz,                                -- window in which the author may amend after publishing
  add column excerpt text,
  add column topic text;

create index articles_status_published_idx on public.articles (status, published_at desc);
create index articles_topic_idx on public.articles (topic);

-- Replace the foundation policies, which keyed on published_at, with status-based ones.
drop policy if exists "published articles are public to read" on public.articles;
drop policy if exists "authors insert their own articles" on public.articles;
drop policy if exists "authors update their own articles" on public.articles;

create policy "published articles are public to read"
  on public.articles for select
  using (status = 'published' or auth.uid() = author_id);

create policy "authors insert their own articles"
  on public.articles for insert
  with check (auth.uid() = author_id);

create policy "authors update their own articles"
  on public.articles for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- storage: article media
-- ---------------------------------------------------------------------------

-- Public read bucket for images embedded in articles. Uploads are not yet
-- opened to clients: signed upload URLs, issued by a server action to the
-- article's author, come later (backlog, editor island A-10). Until then only
-- the service role writes here.
insert into storage.buckets (id, name, public)
values ('article-media', 'article-media', true)
on conflict (id) do nothing;

drop policy if exists "article media is public to read" on storage.objects;
create policy "article media is public to read"
  on storage.objects for select
  using (bucket_id = 'article-media');
