---
id: 2026-09-19-001
type: advice
from: lead
to: [decider]
subject: The live Supabase schema is 20 migrations ahead of supabase/migrations/
backlog: P0-2
state: open
opened: 2026-09-19
closed:
outcome:
---

## Question

Were the two migration files in `supabase/migrations/`, both dated 2026-09-19, written knowing
that the live Dialecta Supabase project already existed with 32 tables and 20 applied migrations?

That single fact decides the path. If they were written knowing, this is a deliberate rebuild and
the job is to write the diff against live. If they were not, the repo should adopt the live schema
and P0-2 through P0-7 need rewriting around what already exists.

## What I already checked

- Supabase project `mguulnibvzusfvyuowwh`, Pennington Media Group org. 32 tables. 20 applied
  migrations dated 2026-04-29 to 2026-05-07, last named `035_growth_engine_schema`.
- The repo's two migrations create 13 tables. Ten exist live with rows in them, including
  `profiles` at 14, `axis_scores` at 36, `axis_events` at 27 and `articles` at 5. Two exist under
  different names. One, `recommitments`, has no live counterpart.
- The 14 live profiles match the 14 Ghost members that backlog P0-6 plans to map, so this is the
  live database and not an abandoned experiment.
- Live table comments cite `Dialecta_Axis_Mapping_v1.md` by name and describe `tier_nominations`
  as the third leg of the three-input final tier model. Whoever built it worked from these specs.
- Full detail: `docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md`.

## Why I am stuck

Both readings are consistent with what is on disk, and they lead to opposite work.

Adopting live means deleting the two September files and rewriting six backlog rows, which throws
away design work if that design was deliberate. Treating them as a target schema means writing a
reconciliation migration against a production database with real rows, which is the expensive path
and is wasted if the files were simply written without looking.

Nothing in the repo records which it was. `docs/handoffs/current.md` says the scaffold landed on
2026-09-19 and does not mention the live project. The backlog reads as greenfield throughout.

Only Dan knows. This record exists so the question reaches him in one piece rather than being
rediscovered by the next agent that opens `supabase/`.
