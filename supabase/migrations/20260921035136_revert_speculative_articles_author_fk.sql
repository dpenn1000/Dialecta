-- Reverting a constraint I added an hour ago on an incomplete diagnosis.
--
-- The Next.js front page fails with "Could not find a relationship between
-- 'articles' and 'profiles'", and I read that as a missing foreign key. It is
-- not. apps/web/src/lib/articles.ts asks for `slug, title, excerpt, topic,
-- published_at, body_html, declared_claims` and an embed through a constraint
-- named `articles_author_id_fkey`. The live articles table has none of those
-- columns and no author_id: it is still the Ghost-era classification sidecar
-- keyed on ghost_post_id, with author_member_id as text.
--
-- So the app was written against 20260919000100_articles_native.sql, which has
-- never been applied. The fix is that migration, which is already step 0 of the
-- port debate's first increment, not a constraint bolted onto the old shape.
--
-- Dropping rather than leaving it, because the article schema is about to
-- change and a speculative constraint nobody planned, with ON DELETE RESTRICT
-- against a column that migration may replace, is worse than nothing.

alter table public.articles drop constraint if exists articles_author_member_id_fkey;