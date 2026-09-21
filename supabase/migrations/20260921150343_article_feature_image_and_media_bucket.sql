-- Article photos move off Ghost (Magic Pages) into Supabase Storage.
-- Plan: team/migrator/knowledge/2026-ghost-article-images-migration-plan.md,
-- approved by Dan 2026-09-21. The five objects are uploaded by
-- scripts/migrate-article-images.mjs and verified by hash; the rows are
-- repointed in a separate step once they are.

alter table public.articles add column if not exists feature_image text;

comment on column public.articles.feature_image is
  'Public URL of the article''s featured image. The legacy five point at their copies in the article-media bucket, moved from Ghost on 2026-09-21. Null when an article has none.';

-- The bucket ADR-003 named. Public read, like the images were on Ghost;
-- writes go through the service role until /write gets an upload route (A-10).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-media', 'article-media', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do nothing;
