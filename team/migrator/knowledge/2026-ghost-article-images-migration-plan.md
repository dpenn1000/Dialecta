# Plan: move the five article images off Ghost before cutover

Phase A read the database, read live, and downloaded the five originals (see the inventory and
manifest docs in this folder). This is phase B: where the images go, how the rows get repointed,
and in what order. Nothing here has been run. Every numbered step below is scoped to a future
migrator session working from a proper `supabase/migrations/` file, per this seat's own mandate;
this session wrote no migration and touched no live data.

Confirmed with the convener 2026-09-21: a builder independently found the same gap (no image
column on `articles` in any form, `scripts/import-ghost.mjs` never asked Ghost's Content API for
`feature_image`) while working on the article page, and asked that this plan cover the migration,
the `import-ghost.mjs` fix, and the backfill by name. All three are below. Neither
`apps/web/src/app/articles/[slug]/page.tsx` nor `scripts/import-ghost.mjs` was edited to produce
this plan; both are described, not touched.

## Recommendation

**Supabase Storage, a bucket named `article-media`, keyed on Ghost's own path shape, with a
Next.js rewrite so the old absolute URLs keep resolving.**

- The name and the intent already exist. ADR-003 named `article-media` for exactly this in
  September; `docs/plans/backlog.md` row A-10 repeats it; a migration that would have created it
  was written, aborted mid-run on an unrelated column conflict, and archived
  (`supabase/migrations/_archived_2026-09-19/20260919000100_articles_native.sql`). Nothing needs
  inventing here, only finishing.
- **Path scheme: keep Ghost's.** Store each object at `content/images/{year}/{month}/{filename}`
  inside the bucket, the same tail every URL in the manifest already carries. Two things fall out
  of this for free: the manifest's local paths already mirror it (no renaming step), and a Next.js
  rewrite from `/content/images/:path*` to the Storage object's public URL makes every old absolute
  link on the internet (search results, RSS readers, anyone who bookmarked or embedded a Ghost
  image URL) keep working after Ghost is gone, with no redirect table to maintain by hand. This is
  the `design/dialecta-design-spec.html`-style "keep what already works" choice over a fresh
  scheme that would need one.
- **Size against the plan.** The Supabase organization (`Pennington Media Group`,
  `bivgjuosqiupglntinpy`) is confirmed on the **Pro** plan (`get_organization`, read live
  2026-09-21). This migration's total payload is 8,384,097 bytes, about 8.0 MiB. Even counting the
  site-chrome and avatar images noted but not moved (roughly another 9 MiB, see the inventory doc),
  the whole known image estate is under 20 MiB. Pro-tier pooled storage is measured in tens of
  gigabytes; this migration does not move the needle, and neither would a much larger one. The
  number worth tracking going forward is not this migration's size, it is the rate new articles add
  images once `/write` can upload one, and that is a usage question, not a phase-B blocker.
- **Do not carry the old upload handler's destination forward unchanged.** The legacy
  `_recovered/api/article/upload-image.js` forwarded to Ghost's Admin API, never to Supabase
  Storage, and `legal`'s 2026-09-21 note
  (`exchange/open/2026-09-21-legal-02-blindspot-two-live-facts-outside-the-privacy-notice.md`)
  flags its client-supplied `member_uuid` auth as a live, unresolved compliance gap on a public
  upload route. This migration is a one-time, supervised copy
  of five already-published, already-known images; it is a different risk shape than an open
  upload endpoint. But when A-10 eventually builds a real upload route into `article-media`, it
  should authenticate the session server-side (`getClaims()`, the same pattern `/write` already
  uses), not trust a client-asserted id. Worth a line in whichever brief hands A-10 to a builder.

## Repointing the rows

**The target is `articles.feature_image`, a column that does not exist yet.** It does not need
inventing either: `apps/web/src/lib/articles.ts` already declares it on the `Article` type with a
comment explaining it is unselected only because the column is missing, and
`apps/web/src/app/articles/[slug]/page.tsx` already renders it, gated on presence, styled by
`article.css:39`. Confirmed live 2026-09-21 that no column by this or any image-bearing name exists
on `articles` today.

Three pieces, in the order a migrator session would land them:

1. **Migration: add the column.** `alter table public.articles add column if not exists
   feature_image text;`, nullable, no default, no backfill in the same statement (the backfill is
   its own step below so it can be verified before it runs). No RLS change needed: `articles` already
   has a public select policy per the existing baseline, and this is one more nullable text column
   on a row anon can already read.
2. **Fix `scripts/import-ghost.mjs` so a future run does not lose this again.** Two changes, both
   inside the existing file, neither made by this session:
   - The Content API `fields` parameter in `fetchAllPosts()` currently reads
     `'id,slug,title,html,custom_excerpt,excerpt,published_at,updated_at'`. Add `feature_image`
     to that list; Ghost's Content API returns it as a plain absolute URL on the post object when
     one is set, no extra request needed.
   - `toRow()` currently has no line for it. Add `feature_image: post.feature_image ?? null,` to
     the object it returns. This is a straight passthrough of a field Ghost's own API already
     names `feature_image`, not an invented mapping.
   - Why this matters even though the five live rows were not populated by this script (no Content
     API key is configured, per the script's own header; they came from the 2026-09-08 crawl
     instead): the script is written to be re-run "until the Ghost site is shut off," and it
     upserts on `ghost_post_id`. If it does run again before cutover, for a sixth article or a
     correction to one of the five, it should carry the feature image across on its own rather than
     silently dropping it a second time.
3. **Backfill the five rows,** once the five objects are uploaded and hash-verified (next section),
   pointing each at its object's public Storage URL, not at the Ghost URL it came from. This is the
   step that actually stops the rebuild depending on Ghost.

## Order: upload, verify, rewrite, with a rollback

1. **Upload.** The five files in `_migration/ghost-images/content/images/2026/04/` (see the
   manifest for exact paths and hashes) go to the `article-media` bucket at the matching
   `content/images/2026/04/<filename>` object path. `scripts/migrate-article-images.mjs` (written
   this session, not run) does this when a future session runs it with `--upload`.
2. **Verify each object by hash before anything reads from it.** Download each just-uploaded object
   back and `sha256` it against the manifest's recorded hash. A same-size, same-bucket upload
   succeeding is not proof the bytes match; re-hashing after the round trip is. The script does
   this automatically after every upload and refuses to print the SQL in step 3 if any hash fails.
3. **Rewrite the rows, one transaction, keyed on `ghost_post_id`, with a row-count check.** This
   repo already has a working pattern for exactly this shape of update, twice
   (`20260921041504_articles_content_backfill_from_site_crawl.sql`,
   `20260921043008_articles_restore_paragraph_breaks_from_original_html.sql`): key every `UPDATE`
   on `ghost_post_id`, and assert the row count afterward rather than trusting the statement
   silently did what was intended. The script prints SQL in that shape:

   ```sql
   begin;

   update public.articles set feature_image = $1 where ghost_post_id = $2;
   -- ... one UPDATE per row, five total ...

   do $check$
   declare n int;
   begin
     select count(*) into n from public.articles
       where ghost_post_id in (<the five ids>) and feature_image is not null;
     if n <> 5 then
       raise exception 'feature_image backfill: expected 5 rows set, got %', n;
     end if;
   end
   $check$;

   commit;
   ```

4. **Rollback.** Nothing here is destructive to undo. The column stays nullable, so reverting is
   one statement: `update public.articles set feature_image = null where ghost_post_id in (<the
   five ids>);`. Dropping the column entirely is also safe and reversible up to that same point,
   since nothing else depends on it yet (the SUMMARY_COLUMNS wiring below has not landed). The
   uploaded Storage objects are not deleted by a rollback of the row rewrite; they are inert and
   harmless sitting in the bucket unreferenced, and re-running the backfill later needs them still
   there.
5. **Only after the above is confirmed on the actual database,** a builder-scope change adds
   `feature_image` to `SUMMARY_COLUMNS` in `apps/web/src/lib/articles.ts` so
   `getPublishedArticle` (and, if the list page should show thumbnails too, `getPublishedArticles`)
   actually selects it. The render path and the CSS are already there and do not change. This step
   is explicitly out of this plan's execution, both because `apps/web` has five builders on it
   right now and because it is the one piece that was already correctly deferred by the person who
   wrote the inert `feature_image` field in the first place.

## What is not needed today, and why it is still worth writing down

None of the five live rows has an inline `<img>` in `body_html` or `original_html` (confirmed in
the inventory doc), so there is no `src`/`srcset` rewriting to do for current content. The brief
asked for the mechanism anyway, for when it is needed: a future full-fidelity Ghost import, or a
new article written through `/write` with an inline image. The rule, for whoever needs it: replace
each bare Ghost content URL in the HTML with the migrated object's Storage public URL, and drop the
`/content/images/size/wNNN/` responsive variants entirely rather than reproducing them. Supabase
Storage does not generate resized variants the way Ghost does, and these files are modest enough
(largest is 2.2 MB, see the manifest) that serving one resolution is a reasonable v1; `next/image`
becomes an option for real responsive output once the image host is fixed to Storage rather than
varying between Ghost and Storage, which is exactly the condition the current plain `<img>` in
`[slug]/page.tsx` is waiting on, by its own comment.

## Open questions this plan does not resolve

- The two unstable `_o` files (rows 4 and 5 in the manifest). What is on disk is stable and
  verified against two independent checks; it may or may not be the higher-fidelity original this
  session glimpsed once. Dan's call on whether that matters enough for one more careful check.
- Whether the site-chrome and SEO images noted in the inventory (logo, icon, two SEO photos) should
  also move to `article-media` or a separate bucket at the same time, given `design/logos/` may
  already hold canonical copies of at least two of them under different filenames. Not part of this
  session's scope; flagged, not decided.
- Whether `getPublishedArticles` (the list/home feed), not only the detail page, should also select
  and show `feature_image`. The application code only wires the detail page today.
