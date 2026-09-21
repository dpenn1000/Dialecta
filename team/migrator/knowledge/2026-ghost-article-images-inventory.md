# Ghost article images: what exists, where, and what the database does not hold

Phase A of the image migration Dan asked for 2026-09-21: find the Article photos before Ghost and
Magic Pages go away at cutover. Read only. Method below so the counts can be checked.

## Method

- Database: Supabase MCP against project `mguulnibvzusfvyuowwh` (confirmed by name, "Dialecta",
  org "Pennington Media Group", and by `articles`, `comments`, `profiles` all present). Every read
  is a plain `select` against `information_schema`, `public`, or `storage`. Nothing written.
- Live site: `curl`, one identifying user agent (`DialectaMigrationBot/1.0`), sequential requests
  with a pause between them. Five article pages, the home page, `robots.txt`. Zero bot challenges,
  zero 403s, zero 429s, across roughly thirty requests this session.

## 1. The database holds no article images at all

No column in any of the 32 `public` tables has `image` in its name. `articles` has no
`featured_image`, no `og_image`, no `twitter_image`, nothing of the kind. The full column list
(confirmed live) is: `id, ghost_post_id, author_member_id, status, declared_tier,
ai_suggested_tier, final_tier, declaration, ai_analysis, stage_2_5_choice, author_note, wait_until,
created_at, updated_at, original_html, polish_level, polish_options, polish_change_log, slug,
title, excerpt, topic, published_at, body_html, body_json, declared_claims, author_profile_id`.

The five published rows were checked directly for inline images, in both content columns:

| slug | ghost_post_id | body_html has `<img` | original_html has `<img` |
| --- | --- | --- | --- |
| on-the-far-shore-of-fear | 69eff72be5eec200010d5310 | no | no |
| on-doubt-and-devotion-when-faith-pauses | 69efc475e5eec200010d5299 | no | no |
| the-conversation-communities-keep-having-about-solar-and-what-the-evidence-actually-says | 69d5c5c083cd72000193f0cd | no | no |
| the-moment-you-stop-waiting-for-your-life-to-start | 69f2937b4e51770001fb5218 | no | no |
| knowledge-without-borders-why-education-must-be-free | 69f2594b4e51770001fb51d7 | no | no |

`body_json` is `{}` on all five (never converted from HTML, per `scripts/import-ghost.mjs`'s own
TODO), so there are no image nodes to read there either. `body_html` and `original_html` on all
five came from `20260921041504_articles_content_backfill_from_site_crawl.sql`, a text crawl of the
live pages taken because no Ghost Content API key is configured in this repo and no Ghost export
exists on disk. That migration's own header says italics, links and list markup were lost in the
flattening; it says nothing about images because there were none to lose. This is not a gap in the
crawl. It is that Ghost never put the feature image inside the post body; Ghost carries it as a
separate post property, alongside the content, which is exactly what this repo's own code already
expected before this session started (see section 4).

**This means step 1 of the brief, read the database for images, correctly returns nothing.** The
images are real and they matter; they simply never entered Supabase at all. Step 2 is where they
are.

## 2. What the live site carries that the database does not

Every one of the five article pages, fetched live, carries a feature image in three places: Ghost's
own `og:image` and `twitter:image` meta tags, and a `figure.post-feature` image at the top of the
article body (confirmed by DOM order in the fetched HTML: post-feature, then post-breadcrumb, then
post-title). None of the five pages has any other `<img>` inside the article content itself, so
each article has exactly one photo, not several.

| Article | Ghost original (bare path) | Filename pattern |
| --- | --- | --- |
| on-the-far-shore-of-fear | `/content/images/2026/04/v855sq14xoazk8EBm4D6o9WUjoc3qMMtQLZ2u6nBw...T0O.jpg` (147-char generated name, truncated here; full name in the manifest) | Long random token. Consistent with an AI image generator's own export name |
| on-doubt-and-devotion-when-faith-pauses | `/content/images/2026/04/` + a literal ChatGPT export filename (dated Apr 27; exact name in the manifest, row 2) | Unedited ChatGPT download name |
| the-conversation-communities-keep-having-about-solar-and-what-the-evidence-actually-says | `/content/images/2026/04/9315c5f3-932a-4ee2-b802-5e5eacdf31f1.png` | UUID-style generator export |
| the-moment-you-stop-waiting-for-your-life-to-start | `/content/images/2026/04/3f252122-0cf9-45cf-82e4-f3a34b454df4.png` | UUID-style generator export |
| knowledge-without-borders-why-education-must-be-free | `/content/images/2026/04/RyRy.png` | Short, hand-chosen name |

Four of the five are 1536x1024 (the standard size a ChatGPT-family image generation call
returns); the fifth (`on-the-far-shore-of-fear`) is 2048x1365, a different tool's aspect ratio.
None of these look like stock photography or a real photograph of a person; they read as
AI-generated cover art chosen per piece, which fits the filenames.

### Also on the live site, not article photos, noted and not downloaded

The task scope is article photos. Three other kinds of image turned up while reading the five
pages and the home page, worth naming so nobody wonders whether they were missed:

- **Site chrome.** `Dialecta---Hero-Logo---PNG.png` (nav logo, every page) and
  `Dialecta-Icon-White.png` (an icon, seen only as a resized variant on every page, resolves at
  its own unsized path too, 124,958 bytes). `design/logos/` in this repo already holds a
  same-content logo under a slightly different filename (`Dialecta - Hero Logo - PNG.png`, spaced
  instead of dashed), which is the canonical copy per root `CLAUDE.md` ("never reconstruct from
  fragments"). Left alone.
- **Home page SEO images.** `Dialecta-SEO-Photo-1.png` and `Dialecta-SEO-Photo-2.png`
  (2026/05, both exactly 1,577,356 bytes, home page only, not tied to any article).
  `design/logos/Dialecta-SEO-Photo.png` (singular) already exists in the repo; whether it is one
  of these two or an earlier version is not confirmed. Left alone.
- **Profile avatars**, the note step 2 asked for. `profiles.avatar_url` is set for 3 of 14
  profiles, all Ghost-hosted: a sailing-photo filename for Daniel Pennington,
  `Family-Selfie.webp` (Kathryn Pennington), `1000001867.webp` (Rylie Pennington), all under
  `/content/images/2026/05/`. A fourth profile (Right Said Fred) carries a Gravatar URL, a
  third party service, not Ghost, not this migration's concern. The rest are null or empty. None
  of the four were downloaded; this is the note the brief asked for, not a copy.

## 3. Variant mapping and the `_o` originals

Ghost serves a resized copy at `/content/images/size/w{N}/` or `/content/images/size/w{N}h{N}/`,
ahead of the same `/{year}/{month}/{filename}` tail. Stripping that `size/...` segment recovers
the canonical serving path. Observed on this site: `size/w1200/2026/04/<file>` (the og:image
variant Ghost generated for all five articles) and `size/w256h256/2026/04/Dialecta-Icon-White.png`
(the icon).

The canonical serving path is not always the true original. Ghost's optimizer can silently
re-encode the upload at the canonical path and keep the untouched bytes at the same name with an
`_o` suffix. All five article images have a working `_o` file. For three of five it is a
genuinely different, larger file than the bare path:

| Article | bare path, bytes | `_o` path, bytes | different? |
| --- | --- | --- | --- |
| on-the-far-shore-of-fear | 129,564 | 150,650 | yes |
| on-doubt-and-devotion-when-faith-pauses | 1,896,067 | 1,896,067 | no, identical |
| the-conversation-communities... | 2,216,055 | 2,216,055 | no, identical |
| the-moment-you-stop-waiting... | 2,083,150 | 2,289,067 on first check, then 2,083,150 | see caveat below |
| knowledge-without-borders... | 2,038,175 | 2,213,269 on first check, then 2,038,175 | see caveat below |

**Caveat, stated plainly rather than smoothed over.** For the last two rows, the first `HEAD`
against the `_o` path returned a larger Content-Length than the bare path, the same pattern as row
one. A later `HEAD`, taken immediately before download, and the download itself, both returned the
bare path's smaller size instead. `on-the-far-shore-of-fear`'s `_o` was rechecked the same way and
stayed at 150,650 across two checks minutes apart, so this is not something every `_o` path does.
The most likely read is that Magic Pages' image service holds the true original at `_o` for a
limited window and these two had aged out between the first probe and the download. What is on
disk for these two files is confirmed current and stable (two independent checks agree), but it is
not confirmed to be the larger original glimpsed once. Flagged for Dan rather than re-fetched
again; the brief asked to go gently, and repeatedly hammering the same two paths trying to catch a
transient state is the opposite of gentle. If the higher-fidelity original matters, the move is
one more careful check, not a bulk re-download.

## 4. What this repo already built, waiting for exactly this

Independently of this session, and dated the same day: `apps/web/src/lib/articles.ts` already
declares `feature_image?: string | null` on its `Article` type, with a comment recording that no
such column exists live (verified against the Supabase MCP, all 32 tables, 2026-09-21) and that
`scripts/import-ghost.mjs` never requested `feature_image` from Ghost's API either. The field is
deliberately left out of the row `select`, because selecting a column that does not exist fails
every article page.

`apps/web/src/app/articles/[slug]/page.tsx` already renders it: a `figure.post-feature` block
sitting first inside the article, bled to the card's edges, gated behind
`article.feature_image ? ... : null`, with a comment noting the live DOM order was confirmed
2026-09-21 and that this is expected to move from Ghost to Supabase Storage at cutover. The CSS
(`article.css:39`) already styles `.article-feature-image` full width with rounded top corners. A
plain `<img>` was used on purpose, not `next/image`, because the host is not fixed yet (Ghost
today).

So the column name, the render path, and the styling are already settled by other work on this
same day. What is missing is the column itself, the data in it, and the objects it would point at.
That is what the plan (`2026-ghost-article-images-migration-plan.md`) proposes to add.

## 5. Storage today

`storage.buckets` holds one bucket, `feedback-screenshots` (public, 5MB limit, image MIME types
only, created 2026-05-01), and it is empty (`storage.objects` has zero rows across the whole
project). `article-media`, the bucket ADR-003 named for exactly this purpose, does not exist.
`pg_policies` for the `storage` schema returns zero rows: no policy exists on either
`storage.buckets` or `storage.objects`.

This matches `council/security/research/2026-live-storage-surface.md` (2026-09-20), which also
found `anon` still holds raw table-level SELECT/INSERT/UPDATE/DELETE grants on both storage tables
despite the empty policy list, the same grant-before-policy gap this seat's own `practices.md`
already tracks for the `public` schema. Worth carrying into whichever migration creates
`article-media`: revoke the blanket grant before or alongside the first policy, not after.

The reason `article-media` does not exist live: `supabase/migrations/_archived_2026-09-19/
20260919000100_articles_native.sql` creates it, but that file's own successor
(`20260921040353_articles_native_content_columns_additive.sql`) records that it "aborted on `add
column status` (status already exists)" and was archived rather than fixed forward. Confirmed
independently here: `supabase_migrations.schema_migrations`, the live applied history, has no row
mentioning media, bucket, or image.

**Where an upload would go today, and why not to reuse it as is.** The legacy Vercel function
`_recovered/api/article/upload-image.js` accepts a base64 image, normalizes it with `sharp`
(resize, EXIF rotate and strip, WebP encode; 2400px/q82 for articles, 1024px/q80 for identity
purposes), and forwards the result to **Ghost's** Admin API, not Supabase Storage. It never wrote
to Storage; this is why `storage.objects` is empty. Auth is a client-supplied `member_uuid`,
gated by `profiles.is_author` for article purpose. `legal`'s 2026-09-21 note
(`exchange/open/2026-09-21-legal-02-blindspot-...md`) found this exact route still live in
production, corrected the seat's own earlier position that image-upload law does not apply here,
and asked for it to be turned off or gated pending an NCMEC CyberTipline registration. That finding
is about a standing public upload endpoint reachable by anyone who can name a member; it does not
describe this migration, which moves five images Dan and the authors already published, under this
session's own supervision, into a bucket nothing else writes to yet. It does mean the plan should
not recommend bringing this handler's auth model forward unchanged for A-10's own upload route.

`apps/web/src/app/write/page.tsx`, the new editor, has no image upload at all today.
`apps/web/src/components/editor/stages-draft.tsx` says so directly in its own porting notes: the
recovered editor's FeaturePhoto stage "is not ported: it uploaded through
`/api/article/upload-image` with member_uuid in the body, and apps/web has no storage bucket or
upload route yet."

## 6. Counts

- Articles inventoried: 5 of 5 published.
- Distinct image URLs found this session: 5 article feature images, 2 site-chrome images (logo,
  icon), 2 home-page SEO images, 3 profile avatars. 12 total under `www.dialecta.org/content/images/`,
  plus one external Gravatar URL out of scope.
- Downloaded (phase A, this run): the 5 article feature images only. 8,384,097 bytes, about 8.0
  MiB. See the manifest for the exact source used for each.
- Broken links: 0. Every URL checked returned 200, including a deliberate bogus filename used as a
  negative control (404, confirming the server does not soft-404).
- Bot challenges, 403s, 429s: 0, across roughly thirty requests to `www.dialecta.org`.
