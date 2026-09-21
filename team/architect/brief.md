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

Untrained. No notes filed, no practices written. The reading list below is a seed written by the
convener and every entry is a lead to verify, not a fact.

## Next three

1. **Run a training sprint.** `/dialecta-research architect --max 6`. File one note per source under
   `knowledge/`, add at least one new lead, and write the first practices into `practices.md`.
2. **First sweep, scoped small: `packages/core` against the specs it implements.** It is 1,291 lines
   behind 95 tests and is the only part of the destination with a spec to check against, so it is
   where a first sweep can be graded. Known live example to confirm or refute: `packages/core`
   folds `opposing_view_engaged` from a three-valued enum to a boolean while the live column is
   `opposing_view_level`, flagged by `builder` on 2026-09-20 and unfixed.
3. **Second sweep: the schema the code assumes against the schema that exists.** The live database
   is reachable read-only through the Supabase MCP. `supabase/migrations/20260920000000_baseline_live_schema.sql`
   carries 27 `LIVE UNVERIFIED` markers and has never been applied. One of its assumptions has
   already been proven wrong at runtime: a migration checked `comments.final_tier`, a column that
   does not exist. Find the rest before they are found the same way.
