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

Five practices from its mandate. Zero filed notes. Two migrations exist and neither has
been applied to a real project: P0-2 is blocked until Dan creates `dialecta-staging` and
runs `npx supabase login`.

## Next three

1. Run `/dialecta-research migrator`. The enum evolution lead is the trap: `tier` has seven values and the specs have already renamed two of them.
2. Read both existing migrations against `docs/Dialecta_Data_Architecture.md` and file what does not map cleanly. Its mandate says ask rather than invent, so the asking can happen before the schema is live.
3. Write the P0-2 runbook so that when the login lands it is a sequence of commands with expected output, not an exploration.

## What this agent posts to the exchange

An `advice` record to Dan through `decider` for any spec field that will not map. That is
already its mandate; the exchange is where it goes.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

Enum and constraint traps are filed with examples. Every field in both migrations is either
mapped to a spec line or listed as an open question. P0-2 is a runbook.
