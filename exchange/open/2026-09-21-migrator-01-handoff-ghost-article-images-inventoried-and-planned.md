---
id: 2026-09-21-migrator-01
type: handoff
from: migrator
to: [convener]
subject: Five article images inventoried, downloaded, verified; migration planned, not executed
backlog: A-10
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Phase A of the image migration Dan asked for ("We also need the Article photos from
Ghost/Magic Pages"). Read only against the database and the live site; nothing written to
Supabase, Storage, `apps/web`, or `scripts/import-ghost.mjs`.

- `team/migrator/knowledge/2026-ghost-article-images-inventory.md`: what the database holds (no
  image column anywhere in `public`, confirmed against all 32 tables; zero inline `<img>` in any
  of the five articles' `body_html` or `original_html`), what the live site holds instead (one
  feature image per article, found via `og:image`/`twitter:image`/`figure.post-feature`), the
  variant-to-original mapping rule, the storage and upload-route findings, and the counts.
- `team/migrator/knowledge/2026-ghost-article-images-manifest.md`: the five downloaded files,
  each with source URL, local path, bytes, sha256, content type, pixel dimensions, and the article
  it belongs to.
- `team/migrator/knowledge/2026-ghost-article-images-migration-plan.md`: the recommendation
  (Supabase Storage, bucket `article-media`, Ghost's own path scheme kept, a Next.js rewrite for
  old absolute URLs), the exact repoint mechanism, and the order (upload, verify by hash, rewrite
  in one transaction, rollback).
- `scripts/migrate-article-images.mjs`: uploads the five files and verifies each by a round-trip
  hash, or prints the row-rewrite SQL on its own with `--print-sql-only`. Not run in upload mode
  this session. `--print-sql-only` was run (no network, no Storage, no DB) to confirm it produces
  correct SQL; the output matches the plan exactly.
- Five originals downloaded to `C:\Dialecta\_migration\ghost-images\content\images\2026\04\`
  (gitignored), 8,384,097 bytes total, sha256-verified twice against the manifest.
- `.gitignore` gets one addition, `_migration/`, confirmed with `git check-ignore -v` against a
  real file inside it. No other file outside this seat's own folder was touched.

**Addressed mid-session:** the convener flagged that a builder independently found the same
missing-column gap while working on the article page, and asked that the plan name three things:
the migration adding `articles.feature_image`, the fix to `scripts/import-ghost.mjs`'s Content API
`fields` list, and the backfill. Checked independently before the message arrived (same finding,
same evidence: no image column live, `import-ghost.mjs` requests
`id,slug,title,html,custom_excerpt,excerpt,published_at,updated_at` and nothing named `image`).
All three are in the plan by name, in the order they'd land. Neither
`apps/web/src/app/articles/[slug]/page.tsx` nor `scripts/import-ghost.mjs` was edited; both are
described only, per that instruction.

## Not done

**No migration, no upload, no row rewrite.** This session's mandate was read-only against the
database and Storage; the plan is written for a future migrator session (or this seat, in a
session scoped to write) to execute. `articles.feature_image` does not exist yet; the
`article-media` bucket does not exist yet.

**Two of the five images carry an unresolved provenance question**, not a missing file. What's on
disk for `the-moment-you-stop-waiting-for-your-life-to-start` and
`knowledge-without-borders-why-education-must-be-free` is verified stable and current, but a
higher-fidelity `_o` original was glimpsed once for each and not captured before it reverted to
match the smaller, already-optimized path. Detail in the inventory doc, section 3. Not re-chased,
in keeping with "go gently."

**Site-chrome and avatar images are noted, not migrated.** Logo, icon, two SEO photos, three
profile avatars. Out of this task's scope (article photos); listed in the inventory doc so nobody
has to wonder whether they were missed.

## Governing spec

`docs/decisions/ADR-003-native-editor.md`, "Consequences": "Images: Supabase Storage bucket
`article-media`, signed uploads from the editor." The plan carries that name and intent forward;
it does not depart from it.

## Acceptance

- `sha256sum` against all five local files matches the manifest, run twice (once at download,
  once while writing the manifest table), both times from the files already on disk.
- Live-site checks: five article pages, the home page, and `robots.txt` all returned HTTP 200. A
  deliberately bogus filename returned a real 404 (negative control, confirms the server does not
  soft-404 everything). Zero 403s, zero 429s, zero bot challenges across roughly thirty requests.
- `node scripts/migrate-article-images.mjs --print-sql-only` runs clean and prints the exact SQL
  quoted in the plan. `node scripts/migrate-article-images.mjs` (no flags) prints its usage line
  and exits 0. Neither touches the network. `--upload` was not run.
- `python scripts/voice_check.py --strict` run against every markdown file this session wrote.
  Three of four report clean (the inventory, the plan, this record). The manifest reports 4 hard
  hits, all the same cause: manifest row 2's downloaded file has a real, unedited ChatGPT export
  filename that happens to carry two double-hyphen dates, and the manifest's job is to reproduce
  its source URL and local path exactly, so that name appears twice in one row. The checker has no
  exemption for a quoted external filename; rewriting it to dodge the regex would make the
  manifest wrong for the one thing it exists to be right about. Left as is rather than either
  claiming a false clean or corrupting the data. Judgment call, flagged for review rather than
  made silently.

## Traps

- **`_o` does not reliably mean "the true, larger original."** Byte-identical to the bare path for
  two of five images, genuinely larger and stable for one, and unstable (larger once, then
  settling to match the bare path) for two. Check before assuming either way; do not treat `_o`
  as a universal signal on this host.
- **The column name is already decided, do not re-derive it.** `apps/web/src/lib/articles.ts`
  already types `feature_image` on `Article`, and `apps/web/src/app/articles/[slug]/page.tsx`
  already renders it behind a null check, styled by `article.css:39`. Both are inert only because
  the column and the data are missing. A future session should wire to this name, not invent a
  different one.
- **The archived migration is not a shortcut.** `supabase/migrations/_archived_2026-09-19/
  20260919000100_articles_native.sql` already contains `article-media` bucket-creation SQL, but it
  aborted mid-run on an unrelated `add column status` conflict and was never fixed forward; the
  schema has moved since. Read it for the bucket/policy shape, do not replay it as-is.
- **Storage grants are open under an empty policy list.** `storage.objects` and `storage.buckets`
  both have RLS enabled with zero policies, but `anon` still holds raw SELECT/INSERT/UPDATE/DELETE
  table grants on both (matches `council/security/research/2026-live-storage-surface.md`,
  2026-09-20). Whichever migration creates `article-media` and its first policy should revoke the
  blanket grant first or alongside, not after, the same rule this seat's `practices.md` already
  carries for the `public` schema.
- **The legacy upload handler is not a template to reuse.** `_recovered/api/article/
  upload-image.js` forwarded to Ghost's Admin API, never to Supabase Storage, and trusted a
  client-supplied `member_uuid`. `legal`'s open note
  (`exchange/open/2026-09-21-legal-02-blindspot-two-live-facts-outside-the-privacy-notice.md`)
  flags that exact auth model as a live compliance gap on a still-deployed route. A-10's real
  upload path should authenticate the session server-side instead.

## Do not touch

- `apps/web/` (five builders on it today, per the brief; also holds the already-inert
  `feature_image` field and render path this plan wires to, described but not edited here).
- `scripts/import-ghost.mjs` (the two-line fix it needs is in the plan; not made this session).
- `supabase/migrations/` (no migration written; the column and bucket are future, scoped work).
- `_migration/` (gitignored local staging for the five downloaded originals; not for git).
