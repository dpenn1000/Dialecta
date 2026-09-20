# ALTER COLUMN TYPE uuid USING on a populated column, and the expand-contract alternative

**Source:** PostgreSQL, "ALTER TABLE", https://www.postgresql.org/docs/current/sql-altertable.html,
fetched 2026-09-20. Corroborated against multiple 2026 zero-downtime-migration writeups
surveyed via WebSearch (Xata's "pgroll" post and "Zero-Downtime Schema Migrations in
PostgreSQL" among them; the pattern they describe is standard and consistent across
sources, not particular to one). Verified: the Postgres docs page exists and states the
rewrite and locking behavior directly.

**Lead state:** filed.

## Summary

`ALTER TABLE ... ALTER COLUMN ... TYPE ... USING <expr>` on a populated column is not a
cheap metadata change. The docs are direct: "Changing the type of an existing column
will normally cause the entire table and its indexes to be rewritten," requiring "as
much as double the disk space" during the operation, and `ALTER TABLE` takes an
**ACCESS EXCLUSIVE** lock by default, which blocks all concurrent reads and writes on
that table for the duration. `USING` is mandatory whenever there is no implicit or
assignment cast between the old and new type, which is exactly the `text`-to-`uuid`
case: `USING column_name::uuid`.

The documented-standard alternative is the expand-contract pattern (also called
parallel change): add the new column alongside the old one, backfill it in batches with
a deliberate pause between batches, dual-write both columns from the application during
the transition, cut reads over to the new column once backfill and dual-write have both
proven out, then drop the old column. Each phase is independently deployable and
reversible. The final drop is metadata-only and fast; the expensive rewrite that a
naive `ALTER COLUMN TYPE` would do in one blocking step happens instead as an
incremental, non-blocking backfill.

## What this implies for Dialecta

**This is the largest priced item in `p0-2-runbook.md` Branch C, named exactly.** The
runbook already identifies "the identity model across nine tables (`member_id` against
`user_id uuid`)" as expensive; this note supplies the mechanism and the reason it is
expensive: a bare `ALTER COLUMN member_id TYPE uuid USING member_id::uuid` on
`axis_scores` (36 rows), `axis_events` (27 rows) or any of the other seven would
ACCESS-EXCLUSIVE-lock that table, and the small row counts here do not make this safe,
just quick. It would still block the live anon-key reads that `2026-live-rls-surface.md`
shows are currently serving traffic (`profiles`, `articles`, `axis_scores` are all
fully public).

**The bigger problem is upstream of locking: not every live `member_id` is castable to
uuid.** `practices.md`'s note on the fourth row already flags that live keys child
tables on `member_id` (text) with **no foreign key to `profiles`**, and
`profiles.ghost_member_id` is not null, meaning some identities are Ghost-sourced
strings, not UUIDs, by design (per the migrator mandate itself: "Ghost-sourced ids are
`text` and legacy"). A blind `::uuid` cast would fail outright on any row that is not a
valid UUID literal, which on this schema is an expected, not exceptional, case. The
expand-contract pattern's backfill step is where that gets handled: rows with a real
Supabase `uuid` identity backfill directly, rows with only a Ghost id populate the new
column as `NULL` (or a resolved uuid, if `profiles` can supply one via
`ghost_member_id` lookup) and stay on the legacy path, and nothing is a single
all-or-nothing statement that can fail midway on row one of 27.

**This confirms rather than revises `practices.md`'s identity practice.** The practice
already says Ghost ids stay `text`/legacy and Supabase identities are `uuid`. What this
note adds is the mechanical path for wherever a table needs to carry both during a
transition: a second column, not a single column reinterpreted in place.

## Implies for

Practice: "a populated column's type is never changed with a bare `ALTER COLUMN TYPE`;
add the new column, backfill in batches, dual-write, cut over, then drop the old one."
Backlog: Branch C of `p0-2-runbook.md`, the identity-model item. Related:
`practices.md` "Note on the fourth row."
