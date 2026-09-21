---
id: 2026-09-21-migrator-02
type: handoff
from: migrator
to: [convener]
subject: opinion_map_positions expand/contract drafted; live's writer confirmed, nothing applied
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Step 5 of `team/architect/architecture/2026-09-21-delta-mechanic-port.md` ("Build order"), on
Dan's 2026-09-21 approval. Read only against project `mguulnibvzusfvyuowwh`; nothing applied.

- Confirmed live's writer independently: `_recovered/api/opinion-map/place.js`. Server-side,
  Supabase **service role**. Upserts one row on `(reader_id, article_id, map_index, stage)`;
  validates `stage`/`map_type`/coordinate shape in JS before writing, nothing DB-side beyond the
  two existing CHECK constraints. `grep` across all of `_recovered/` for `opinion_map_positions`:
  `place.js` is the only writer; the only other hit, `api/admin/pulse.js`, quotes the table's own
  `COMMENT` text as a tunable's documentation string, not a query. `_recovered/api/article/[id].js`,
  the one read the front end makes for this surface, selects from `articles` only. Nothing on
  live reads `opinion_map_positions` back.
- Measured the live schema directly (read-only role, `pg_catalog` and `has_table_privilege`, not
  `information_schema`): columns, both CHECK constraints, the one UNIQUE constraint, the three
  indexes, RLS state, the one SELECT policy's exact text, and anon/authenticated/service_role's
  table grants, all matching the architect's plan exactly. Re-ran the backfill join myself: all 9
  rows match exactly one `profiles.ghost_member_id` and exactly one `articles.ghost_post_id`
  (both UNIQUE columns), zero unresolved.
- Four files, this seat's own folder, none applied anywhere:
  - `team/migrator/migrations/2026-09-21-opinion-map-positions-identity-rekey/expand.sql`
  - `.../contract.sql` (written for cutover, explicitly not to be run now)
  - `.../rollback_expand.sql`
  - `.../verification.sql`

## Not done

Nothing was applied; this seat had no `apply_migration` access for this task and was told not to
use it if it did. `supabase db lint` was not run (no local CLI/Docker session available this
task; the two shipped reference migrations this one pattern-matches were themselves hand-verified
against live rather than linted, per their own headers). `npm run types` was not run;
`supabase/types.ts` needs regenerating once `expand.sql` applies. No pgTAP test written
(`practices.md` already carries this as a standing gap: Docker unavailable on studio-pc).

## Governing spec

`team/architect/architecture/2026-09-21-delta-mechanic-port.md`, "The write path" and "Build
order" row 5. `docs/Dialecta_Data_Architecture.md`, entity 12 (`opinion_map_positions`), for the
target column shape (`reader_id uuid`, `article_id uuid`) `contract.sql`'s renames arrive at.

## Acceptance

`verification.sql` in the same folder, six sections, meant to run right after `expand.sql`
applies. Expected results are inline in the file. None of it has run against a live-applied
`expand.sql`, since nothing has been applied; section 3's upsert-shape check was checked by hand
for syntax only, not executed.

## Traps

- `reader_id` and `article_id` cannot be renamed or retyped in `expand.sql`. Live's own upsert
  payload names them by string (`place.js:104` to `115`) and targets them by name in its
  `onConflict` key; either change breaks live's next placement immediately on apply, not at some
  later read. This is the one fact that decided the whole expand/contract split.
- `article_id` was not available for the new uuid column's name; the standard, and the name
  `docs/Dialecta_Data_Architecture.md`'s own target schema uses, is the bare singular-table name.
  `profile_id` was available and is used bare, matching
  `team/architect/knowledge/2026-postgres-table-design-standards.md`'s own cited examples
  ("`comment_id`, `article_id`, `profile_id`...") and `get_own_profile_for_comment()`'s own return
  column of the same name. `article_ref_id` is a placeholder pending `contract.sql`'s rename; not
  the intended permanent name.
- Fixing `opinion_map_self_read`'s predicate alone, without also scoping the policy to
  `authenticated`, would have newly broken every anon SELECT against this table: left applying to
  `public`, Postgres evaluates `current_profile_id()` for anon too, and anon deliberately has no
  EXECUTE on it, so the query would error rather than return zero rows the way it silently does
  today. `expand.sql` scopes the policy to `authenticated` for this reason. Flagged in the
  migration's own comments as a judgment call past the literal brief.
- NOT NULL is relaxed on both `reader_id` and `article_id`, not `reader_id` alone. `article_id`
  blocks a native, non-Ghost article's first placement by the same mechanism `reader_id` blocks a
  Ghost-less member; `articles.ghost_post_id` is already nullable today, so this is not
  hypothetical. Also a judgment call past the literal brief, flagged the same way in `expand.sql`.
- `ON DELETE CASCADE` on both new foreign keys matches the only two live tables that already
  reference these same two targets (`opinion_map_overrides.article_id`,
  `profile_claim_tokens.profile_id`, both CASCADE already), not a fresh decision.
  `architect-05`'s open question about a profile's own deletability is still open at the app-wide
  level; this migration matches existing precedent for this one table rather than pre-empting it.
- The trigger (`opinion_map_positions_resolve_identity`) is the only thing standing between
  live's writes and a permanently null `profile_id`/`article_ref_id` going forward. It is
  SECURITY DEFINER for consistency with every other identity function in this schema, not
  because either `postgres` (this migration's own role) or `service_role` (live's role) strictly
  needs the elevation to read `profiles`/`articles`.
- `CREATE OR REPLACE FUNCTION` in `contract.sql` keeps `place_opinion_map_position()`'s existing
  grants because the signature does not change; `contract.sql` does not re-grant EXECUTE. If a
  future edit to this function ever changes its argument list, that stops being true.

## Do not touch

`apps/web/` (nothing there calls `place_opinion_map_position()` yet; that wiring is builder's,
per the port plan's own "Not done"). `docs/plans/backlog.md` (Decision 4 in the port plan,
resequencing D-1/D-2/D-3, is explicitly convener's). Nothing in `_recovered/` was edited, only
read.
