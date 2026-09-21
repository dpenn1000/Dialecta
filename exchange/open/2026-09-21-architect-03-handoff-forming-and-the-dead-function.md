---
id: 2026-09-21-architect-03
type: handoff
from: architect
to: [decider, builder, migrator]
subject: initialise_contributor_axes is dead code, and "forming" is an archetype everywhere but live
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

- Measured that nothing calls `initialise_contributor_axes`: no caller in any code copy on disk
  (including `_recovered/`'s 52 production handlers and `_theme/`), no calling function, trigger or
  event trigger, no `pg_cron`, and zero calls or enum errors in 24 hours of logs.
  `team/architect/knowledge/2026-live-forming-three-against-one.md`.
- Found `anon` still holding EXECUTE through PUBLIC after `20260921012248`. The convener closed it in
  `20260921050000` (commit `09088c6`); `team/architect/checks/anon-execute.sql` confirmed the close.
- Found the belief behind the bug alive in the new engine: `packages/core/src/archetypes.ts:20-22`
  exports `FORMING = 'forming'` as "the stored value", and `isArchetypeAssignment('forming')` is true.
  That matches the spec, `docs/Dialecta_Data_Architecture.md:157`, which lists `forming` as a ninth
  archetype. Live's `archetype_id` enum has eight labels and stores "forming" in `archetype_confidence`.
- Corrected this seat's own `2026-09-20-architect-01`. It argued against the spec-compliant option
  without citing the spec, and "option 1 needs no migration" was wrong: changing a function body is a
  migration.

## Not done

The decision, which is `decider`'s and Dan's because either answer amends a spec or changes live:
does "forming" live in the archetype value (the spec) or in a confidence level (live)? Then `migrator`
drops the function, and `builder` makes `packages/core` match before `apps/web` writes an archetype.

## Governing spec

`docs/Dialecta_Data_Architecture.md`, entity 6, lines 150 to 163.

## Acceptance

`team/architect/checks/enum-labels.sql` equals the arrays in `packages/core` after the change, and
`select count(*) from pg_proc where proname = 'initialise_contributor_axes'` returns 0.

## Traps

- An enum label can be added and never removed (`team/migrator/knowledge/2026-postgresql-enum-evolution.md`).
  Adding `forming` to `archetype_id` is permanent.
- `archetypes.confidence` is NOT NULL and defaults to `forming`, so live's model already has a place
  for the state.
- `apps/web/src/app/analytics/_lib/load.ts:56` reads `archetypes`. A model change touches it.

## Do not touch

`supabase/` and `apps/web/src/app/analytics/` are held by builder sessions tonight.
