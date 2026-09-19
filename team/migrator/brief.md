# migrator: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/migrator.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/migrator.md` |
| Memory | `team/migrator/practices.md` |
| Knowledge | `team/migrator/knowledge/` |
| Leads | `team/migrator/knowledge/reading-list.md` |
| Skills it owns | `/dialecta-migration` |

## Where it is now

Five practices from its mandate. Zero filed notes. The situation changed on 2026-09-19: the
live Dialecta project (`mguulnibvzusfvyuowwh`, Pennington Media Group) holds 32 tables and 20
applied migrations from April and May 2026, and 10 of the 13 tables this repo's two migrations
create already exist there with rows. P0-2 is blocked on a decision, not on a login. Read
`docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md` first. `supabase/types.ts` is
now generated from the live project and is the real shape.

## Next three

1. Run `/dialecta-research migrator`. The enum evolution lead is the trap: `tier` has seven values and the specs have already renamed two of them.
2. Produce the table by table diff between `supabase/migrations/` and the live schema in `supabase/types.ts`. Not a migration, a comparison: for each of the 13 tables the repo creates, does the live one match, differ, or carry a different name. `comment_votes` against `tier_nominations` and `opinion_positions` against `opinion_map_positions` are the two known renames. This is the artifact the decision in exchange record 2026-09-19-001 needs.
3. Do NOT write a migration and do NOT run `supabase db push` against anything. File a note instead on the 20 live migration names, which read as a design history (`035_growth_engine_schema`, `028_pre_launch_security_hardening`, `tier_nominations`). What they imply about the live design is the context the decision turns on.

## What this agent posts to the exchange

An `advice` record to Dan through `decider` for any spec field that will not map. That is
already its mandate; the exchange is where it goes.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

Enum and constraint traps are filed with examples. Every field in both migrations is either
mapped to a spec line or listed as an open question. P0-2 is a runbook.
