# Postgres enum evolution: what ALTER TYPE can and cannot do

**Source:** PostgreSQL, "ALTER TYPE", https://www.postgresql.org/docs/current/sql-altertype.html,
fetched 2026-09-19. Verified: the page exists and documents both the add and the
rename forms, and documents no removal form.

**Lead state:** filed. The lead's warning is right and its example is wrong.

## Summary

`ALTER TYPE t ADD VALUE [IF NOT EXISTS] 'v' [BEFORE|AFTER 'neighbour']` appends or
inserts an enum value. Three restrictions worth holding:

1. Run inside a transaction block, the new value cannot be used until the
   transaction commits. A migration that adds a value and then writes a row using
   it in the same transaction fails.
2. Position is sort order, not storage order. A value inserted in the middle
   compares more slowly than one appended at the end.
3. `IF NOT EXISTS` downgrades the duplicate case from an error to a notice, which
   is what makes an add idempotent.

`ALTER TYPE t RENAME VALUE 'old' TO 'new'` **is supported**. This is the part the
lead did not know.

**Removal is not supported.** There is no syntax for it. `DROP ATTRIBUTE` is for
composite types, not enums. Removing a value means creating a replacement type,
rewriting every column that uses the old one, and dropping the old type: a
multi-statement migration that rewrites tables, not a one-liner.

## What this implies for Dialecta

**The `tier` enum is not the trap.** The lead named it as the danger. It is not.
The live enum in `supabase/types.ts` is
`"forum" | "spark" | "echo" | "fog" | "heat" | "stance" | "breach"`, which is
exactly the seven values in `supabase/migrations/20260919000000_foundation.sql` and
exactly the locked list in root `CLAUDE.md`. The "Static" and "Off the Air" renames
that root `CLAUDE.md` mentions were settled before the live enum was created. There
is nothing to reconcile here.

**Three other enums are the trap.** All three are live-against-repo mismatches that
a `db push` would hit, and all three involve values the repo has that live does not,
or the reverse:

| Enum | Live | Repo | The problem |
| --- | --- | --- | --- |
| `fp_snapshot_reason` | `first_entry`, `aspiration_declaration`, `recommitment`, `archetype_shift`, `pillar_milestone` | `aspiration_declaration`, `recommitment`, `archetype_shift`, `milestone`, `manual` (a text check) | `milestone` against `pillar_milestone` is a rename. `manual` and `first_entry` each exist on one side only |
| `comment_status` | `pending_review`, `published`, `suppressed` | `draft`, `pending_review`, `published`, `suppressed` (a text check) | Live has no `draft`. The repo's composer flow starts there |
| `archetype_id` | eight archetypes, no `forming` | nine values including `forming` (a text check) | Live carries "forming" in a separate `archetype_confidence` enum instead |

**Reconciling any of them is an expensive migration, not an add.** Each needs a
value removed from one side, and removal is the unsupported operation. Live is a
real enum in all three cases; the repo uses a text column with a check constraint,
which is cheap to change. That asymmetry is an argument for moving the repo toward
live rather than the reverse, and it belongs in the P0-2 decision.

**`RENAME VALUE` makes `milestone` to `pillar_milestone` cheap** if the decision
goes the other way. One statement, no table rewrite. Worth saying out loud, because
the expensive-looking case is the one with a clean escape.

## Implies for

Practice: "a locked enum's value list is checked against live before a migration
names it". Exchange record 2026-09-19-002. Backlog P0-2, D-4 (`fp_snapshots`), A-1
(`comments.status` draft).
