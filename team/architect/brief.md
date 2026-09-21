# architect: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/architect.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/architect.md` |
| Memory | `team/architect/practices.md` |
| Knowledge | `team/architect/knowledge/` |
| Leads | `team/architect/knowledge/reading-list.md` |
| Skills it owns | `/dialecta-research` trains it; it owns no skill of its own |

## Why this seat exists

Created 2026-09-21 at Dan's request: a seat that oversees code quality, optimization, dynamic
functions over hardcoding, and standardization, and that reads the wider world for current
practice. Dan asked whether one seat could also carry data engineering. It can, because both halves
are the same sentence at different layers: a definition exists in one place and the code does
something else. The mandate carries the six findings from 2026-09-20 that prompted it.

The boundary that keeps it from duplicating `reviewer`: `reviewer` judges a change, `architect`
judges what the changes have added up to. A finding visible in a diff belongs to `reviewer`.

## Where it is now

Trained, one sprint, 2026-09-20. Eight notes under `knowledge/`, indexed in `knowledge/index.md`.
Leads 1 through 6 are filed and two of them came back with their premise corrected. Thirteen
researched practices are in `practices.md` alongside the two from the charter. Four new leads added
(11 through 14), so the list grew by four and shrank by six.

Both live examples in the old "next three" are settled, and both came back confirmed.

**`opposing_view_engaged` is confirmed and worse than flagged.** The boolean fold in
`packages/core/src/classification.ts:33` is not where anything is lost. The loss is at
`apps/web/src/app/api/comment/route.ts:260`, which widens the boolean back to the enum as
`'yes' : 'no'`, so a model answer of `partially` is stored as `yes`. Live holds 3 classification
rows and one is already `partially`, which proves the value is real and that the fix is free today.
No migration needed; the live column is already the right type. See
`knowledge/2026-live-opposing-view-fold.md` for the three-file fix and the test list.

**The baseline migration is unapplied and nine of its markers are wrong.** Verified against
`pg_catalog`, not `types.ts`. Two are type errors (`article_id` declared `uuid` on `comments` and
`opinion_map_positions`, text on both live) that would make the resulting database unable to hold
live data. Two more are defaults the live CHECK constraint forbids. One is an error inherited by
citation: `migrator` correctly noted that `types.ts` cannot show check constraints, then concluded
`feed_events.event_type` was unconstrained, and the baseline quoted the conclusion without the
caveat. Live has a 12-value CHECK. Fourteen markers are confirmed right. See
`knowledge/2026-live-baseline-unverified-markers.md`.

**Two findings outside both examples.** `apps/web` is missing `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes`, which `packages/core` has, and turning both on costs zero errors
across 28 files, measured. And `initialise_contributor_axes()` cannot complete: it inserts
`'forming'` into `archetypes.archetype_id`, an enum with no such member, so the call always aborts.

**Two cautions for the next thread.** The Supabase MCP's `list_projects` misroutes to another
organisation's project from a subagent session; pass `project_id` explicitly and confirm the
database by its own table names before reading. And `scripts/voice_check.py` is in the main tree,
not only in the worktrees.

## Next three

1. **Hand the two confirmed fixes to `builder` and watch them land.** The `opposing_view_engaged`
   write path and the two tsconfig flags. Both are specified to the line in `knowledge/`, both are
   free now and not later, and the measure of this seat is how many findings get fixed.
2. **Turn this sprint's three by-hand findings into standing checks.** The anon EXECUTE audit, the
   schema-against-`pg_catalog` assertions, and the enum-against-union check are each one query or
   one test. Nothing would catch any of them a second time. Leads 12 and 13 are the reading.
3. **Run `knip` and `jscpd` and report the numbers.** Lead 14. `2026-duplicate-logic-tool-landscape.md`
   judged both worth adopting and deliberately did not run them, so "defined twice" is still being
   done by eye. `packages/core/src/index.ts` is a 103-line barrel and the obvious first target.
