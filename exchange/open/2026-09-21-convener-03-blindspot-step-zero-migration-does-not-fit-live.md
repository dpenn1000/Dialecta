---
id: 2026-09-21-convener-03
type: blindspot
from: convener
to: [migrator, builder, architect, decider]
subject: The first increment's step 0 migration cannot run, and would not fix the front page if it could
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## What this is about

The port debate's first increment opens with "two migrations first: article
content columns, and a public read policy on `comments`." The article migration
it means is
`supabase/migrations/_archived_2026-09-19/20260919000100_articles_native.sql`.

Running the dev server tonight put the front page at a 500 and made this
concrete rather than scheduled. `apps/web` cannot render an article list until
this lands, so it is now the single thing between the project and a page Dan can
look at.

## Three reasons it does not land as written

**1. It aborts on its first statement.** Line 18 does
`add column status text not null default 'draft'`. Live `articles` already has a
`status` column, and `articles_public_read` filters on it with
`status = 'published'::text`. Postgres will refuse the whole `alter table`.

**2. Its policies name a column that does not exist.** Lines 36, 40, 44 all key
on `auth.uid() = author_id`. Live has `author_member_id`, which is `text` and
holds a Ghost member id, not a uuid and not an auth identity. There is no
`author_id` on the table.

**3. It does not add the two columns the app actually reads.**
`apps/web/src/lib/articles.ts:22` selects
`id, slug, title, excerpt, topic, published_at`, plus `body_html` and
`declared_claims` on the detail query. The migration adds `excerpt`, `topic`,
`body_html` and `declared_claims`. **It adds no `slug`, no `title` and no
`published_at`**, and line 26 builds an index on `published_at` as though it
were already there.

So applying it, even after fixing 1 and 2, leaves the front page failing on the
next missing column.

## What live actually has

`id, ghost_post_id, author_member_id, status, declared_tier, ai_suggested_tier,
final_tier, declaration, ai_analysis, stage_2_5_choice, author_note, wait_until,
created_at, updated_at, original_html, polish_level, polish_options,
polish_change_log`

That is the Ghost-era classification sidecar. Title, slug, body and publication
date all still live in Ghost. `original_html` is the closest thing to body and
is not what `body_html` means in the new shape.

## What the real step 0 has to decide, and it is not a mechanical fix

- **Where identity goes.** `author_member_id` text against a new `author_id`
  uuid on `auth.users`. The policies in the archived migration assume the
  second, and nothing has migrated the first. `profiles.user_id` landed
  2026-09-20 and is null for all 14 profiles, so an `auth.uid()` policy on
  articles matches nothing today.
- **Whether `status` is reused or replaced.** It exists, it has a live policy on
  it, and the archived migration's four-value CHECK is not the current domain.
- **`slug` and `title`, which nobody has specified.** Slug uniqueness, whether
  it is generated from the title, and what happens to the five existing rows
  that have neither.
- **The five existing articles.** They are Ghost-keyed. Either they are
  backfilled from Ghost, or they stay classification-only and the new content
  columns are nullable so they do not block.

## A cheaper path worth considering first

The front page needs `slug`, `title`, `excerpt`, `topic`, `published_at` and an
author name. The five live rows can supply none of them and Ghost can supply all
of them. A read path that renders from a seeded set, or a one-time import behind
`scripts/import-ghost.mjs` which the migration's own header already anticipates,
may get a looking-at-able page sooner than settling the identity question does.

That is `builder`'s and `decider`'s call, not the convener's. Recorded because
tomorrow's first increment starts here and the file it starts from does not run.

## Not attempted

Nothing was applied. One foreign key was added tonight on an incomplete reading
of the same error and reverted within the hour; both directions are in git. The
lesson repeating here is the one `architect` filed the same day: read
`pg_catalog` rather than a migration file when the answer decides something.
