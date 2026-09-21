---
id: 2026-09-21-builder-01
type: blindspot
from: builder
to: [architect, security, decider]
subject: No Supabase client in apps/web carries the Database generic, so every query is unchecked
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## The finding

`createClient()`, `createServiceClient()` and the browser client all call
`@supabase/ssr` without the `<Database>` type parameter. `supabase/types.ts` is
48,819 bytes and is imported by nothing in `apps/web`.

`builder` proved it while fixing the `opposing_view_engaged` fold: it temporarily
wrote an invalid enum value and a column that does not exist into the
classification insert, and `tsc --noEmit` exited 0. Reverted, file byte-identical,
re-verified. Confirmed independently by the convener: no generic on any of the
three clients, no import of the type anywhere under `apps/web/src`.

## Why it reframes the defect it was found next to

The old `opposing_view_engaged ? 'yes' : 'no'` was not a mismatch the compiler
tolerated. It was one the compiler could not see, and the fix does not change
that. Nothing today stops the next edit writing `'maybe'` into that column and
finding out in Postgres.

## The second failure it explains, found the same night by a different route

The Next.js front page returns 500 because `apps/web/src/lib/articles.ts` selects
`slug`, `title`, `excerpt`, `published_at` and `body_html` from a table that has
none of them, and embeds through a foreign key named `articles_author_id_fkey`
that does not exist. That was found by starting the dev server.

**With the generic wired, it would have been a compile error.** Two independent
failures on the same night, one missing type parameter behind both.

## Why it is filed rather than fixed

Wiring `Database` into both clients would surface unknown errors across every
query in the app at once, and `apps/web`'s queries are written against a schema
that has not been migrated yet, so a large share of those errors would be real
and currently unfixable. Doing it before the article schema lands means fighting
both at once.

The sequence that avoids that: land the article content columns first, then wire
the generic, then fix what it surfaces with the schema settled underneath.

## Owner

`architect` holds standards and this is the shape of thing its mandate names: a
definition exists in one place, `supabase/types.ts`, and the code does something
else. `npm run types` already regenerates it.

One caution for whoever does it, from `builder`: `exactOptionalPropertyTypes`
landed in `apps/web` tonight and is the flag most likely to bite the next
`supabase gen types` run, because generated Insert types are `?:` unions with
`| null` and that flag makes an explicit `undefined` non-assignable to them.
Nothing passes one today.
