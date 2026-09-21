# "forming" is an archetype value in three places, and not in the one that stores it

**Source:** live project `mguulnibvzusfvyuowwh`, read only, 2026-09-21: `pg_proc`, `pg_trigger`,
`pg_event_trigger`, `proacl`, `has_function_privilege`, `supabase_migrations.schema_migrations`, and
the unified logs stream for the 24 hours before 04:20 UTC. A repository grep across every copy on
this disk. `docs/Dialecta_Data_Architecture.md:150-163`, `packages/core/src/archetypes.ts:1-50`,
`supabase/migrations/20260920000000_baseline_live_schema.sql:661-673`.

**Lead state:** closes the "Not done" section of `exchange/open/2026-09-20-architect-01` and item 1 of
`docs/handoffs/ARCHITECT-THREAD.md`. Corrects two statements in that record.

## Nothing calls `initialise_contributor_axes`

| Where | Method | Callers found |
| --- | --- | --- |
| Every copy of the code on this disk: `apps/web`, `packages/core`, `api/`, `_recovered/` including its 52 production handlers, `_recovered-next/`, `_theme/`, `components/` | Case-insensitive grep for `contributor_axes` and `initiali[sz]e_contributor` over `.js .jsx .ts .tsx .mjs .hbs .html .sql` | 0. Every match is a migration that defines it, a note, or copy in `apps/web/src/strings.ts` describing it |
| The OneDrive concept archive | Same grep | 0 callers; one prose mention in the project index |
| Other database functions | `pg_proc.prosrc ILIKE '%initialise_contributor_axes%'` | 0 |
| Triggers and event triggers | `pg_trigger.tgfoid`, `pg_event_trigger.evtfoid` | 0 |
| A scheduler | `to_regclass('cron.job')` | `pg_cron` is not installed |
| Calls in the last 24 hours | Unified logs: `edge_logs` 214 rows, `postgrest_logs` 179, `postgres_logs` 71 | 0 requests naming it and 0 `invalid input value for enum` errors. The one `postgres_logs` line that names it is the text of migration `20260921012248` being applied |

It is dead code. The log API serves 24 hours at most, so "no calls" holds for that window only; the
repository and catalog results are what make it dead rather than quiet. Something did call it before
the May rewrite, since six members hold `axis_scores` rows, and that caller no longer exists.

## The revoke left anon holding EXECUTE

Migration `20260921012248` ran `revoke execute on function public.initialise_contributor_axes(text)
from anon`. The ACL afterwards:

```
{=X/postgres,postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}
```

The `anon=X` entry is gone. The entry with an empty grantee, `=X`, is PUBLIC, and every role inherits
from PUBLIC, so `has_function_privilege('anon', 'public.initialise_contributor_axes(text)',
'EXECUTE')` still returns true. Reading the ACL for an `anon=` entry says closed. Asking Postgres says
open. The handoff's "one of the four is revoked" is true of the ACL line and false of the privilege.

This is the mirror image of the trap in `2026-postgres-alter-default-privileges.md`. That migration
revoked from PUBLIC and left the explicit anon grant; this one revoked the explicit grant and left
PUBLIC. Closing a function to anon takes both statements, and the only reading that answers the
question is `has_function_privilege`.

The Supabase security advisor, run the same minute, returned three findings under
`authenticated_security_definer_function_executable`, all SECURITY DEFINER functions. It did not
report this one, which is SECURITY INVOKER. The vendor's linter does not cover an invoker function
that anon can execute, so this seat's check has to (`team/architect/checks/anon-execute.sql`).

Consequence today: none. The function aborts on every call and runs under the caller's RLS.

**Closed the same night.** Reported to the convener, which added the revoke from PUBLIC in migration
`20260921050000` (commit `09088c6`) and corrected `docs/OPEN-ITEMS.md` and the handoff in place.
Re-measured with `checks/anon-execute.sql`: the function no longer appears. The check found the
defect and then confirmed the fix, which is the job it exists for.

## The disagreement behind it is still live

| Where | What it says about "forming" |
| --- | --- |
| The spec, `docs/Dialecta_Data_Architecture.md:157` and `:163` | `assigned_archetype` is an enum of nine values ending in `forming`; `confidence` is a 0 to 1 decimal |
| `packages/core/src/archetypes.ts:20-22` | `FORMING = 'forming'`, documented as "The stored value for a contributor whose pattern is still forming"; `ArchetypeAssignment = Archetype \| typeof FORMING` |
| `initialise_contributor_axes`, live and dead | Writes `'forming'` into `archetype_id` |
| The live schema, read from `pg_enum` | `archetype_id` has eight labels and no `forming`. "Forming" is a label of a separate enum, `archetype_confidence` (`forming, emerging, established`), on a NOT NULL column that defaults to it |

Three places say "forming" is an archetype. The database, which holds the rows, says it is a
confidence level. The baseline migration recorded the split at lines 671 to 673, so the divergence
was known to `migrator`. What no note connected is that `packages/core` has already taken the spec's
side: `isArchetypeAssignment('forming')` returns true. The first archetype write from `apps/web` that
stores `FORMING` fails with the same enum error as the dead function. Nothing in `apps/web` writes to
`archetypes` yet: a grep of `apps/web/src`, including the untracked analytics work in the main tree,
finds one reference, a paged `select` in `app/analytics/_lib/load.ts:56`. That is why this is free to
settle now.

## Correcting this seat

`2026-09-20-architect-01` recommended option 1 (create no row until an archetype is assigned) and
argued against option 3 (add `forming` to the enum) because it "contradicts the design split live
already made deliberately". It did not cite the spec, and root `CLAUDE.md` locks the rule that the
spec wins over code, with drift surfaced rather than the spec amended in silence. Under that rule
option 3 is the one that complies, and keeping live's split means amending the spec through its own
process. Both are defensible. Arguing for one without naming the rule it breaks was the error.

It also said option 1 "needs no migration". It does: the function body lives in the database, and
changing what it does is a `CREATE OR REPLACE FUNCTION` applied as a migration. What option 1 avoids
is a table change.

## The decision, restated

Not how to repair a function. Two questions, in this order:

1. **Which model of "forming" wins:** the spec's, a ninth archetype value, or live's, a confidence
   level on a separate column? This is `decider`'s, and Dan's, because either answer amends a spec or
   changes live. The rule and the cost point in opposite directions, and both are filed. The house
   rule says the spec wins. `migrator`'s `2026-postgresql-enum-evolution.md` already names
   `archetype_id` as a live-against-repo mismatch and argues for moving the repo toward live, because
   an enum value can be added but never removed. The cheapest side of the three to change is
   `packages/core`, where "forming" is one constant and one union member.
2. **Then the function.** Drop it rather than repair it: it has no caller, anon can execute it, and
   its body encodes one side of question 1. Make `packages/core` match the winning model before
   anything in `apps/web` writes an archetype.

If live's model wins, `ArchetypeAssignment` stops carrying `forming` and becomes an archetype that
may be absent plus a confidence level, both derivable from `Constants.public.Enums` in
`supabase/types.ts`. If the spec's model wins, `alter type public.archetype_id add value 'forming'`
is additive and permanent (removal is unsupported, per `migrator`'s
`2026-postgresql-enum-evolution.md`), and `archetype_confidence` becomes a second encoding of the
same state that has to be reconciled or retired.

**First move:** settle question 1. Three `archetypes` rows exist today. After launch it is a data
migration.

## What I did not do

Change anything. Every query was a read. I did not measure calls older than 24 hours, and I did not
test what a revoke from PUBLIC would do to the three trigger functions that share the same ACL.

## Implies for

`exchange/open/2026-09-21-architect-03`, to `decider`, `migrator`, `builder` and `security`.
Practices: close a function to a role only when `has_function_privilege` says so; before recommending
a schema option, cite what the spec says, because "live did it deliberately" is not a reason under the
house rule.

*Filed 2026-09-21*
