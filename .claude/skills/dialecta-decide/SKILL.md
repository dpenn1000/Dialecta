---
name: dialecta-decide
description: How decisions are made and recorded on Dialecta. Use when a backlog item is marked "Dan", when a builder hits a spec gap, or when Dan asks "should we".
---

Decisions are made by Dan, argued by the `decider` agent, and recorded as ADRs in `docs/decisions/`. Builders never decide; they report the gap and stop.

Flow: `decider` frames options and recommends → Dan picks (in Claude Code or a Cowork session) → `decider` writes the ADR and marks the backlog row Decided → Dan edits the affected spec by hand (specs are hand-tended) → the item becomes a builder brief.

Record template (`docs/decisions/ADR-NNN-<slug>.md`):

```
# ADR-NNN: <decision in one line>
*<date>. Status: Decided | Superseded by ADR-MMM.*

## Question
One sentence. What it blocked.

## Options considered
| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |

## Decision
What was chosen and the one reason that carried it.

## Consequences
What changes in the backlog, the schema, the specs (sections Dan will edit by hand).

## Specs touched
- docs/<file>.md, section "<heading>": <what needs to change>
```

Numbering is sequential across the repo. An ADR is never edited after Decided; a reversal is a new ADR that supersedes it. `docs/decisions/README.md` lists them.

Open decisions live in `docs/plans/backlog.md` as rows whose Id ends in `-D<n>`. The lead session should surface the top one at the start of any session where the next build item is blocked on it.
