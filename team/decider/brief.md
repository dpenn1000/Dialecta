# decider: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/decider.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/decider.md` |
| Memory | `team/decider/practices.md` |
| Knowledge | `team/decider/knowledge/` |
| Leads | `team/decider/knowledge/reading-list.md` |
| Skills it owns | `/dialecta-decide`, and it chairs `/dialecta-council` |

## Where it is now

Five practices. Zero filed notes. Three ADRs exist. Four open decisions are waiting:
P0-D2, A-D1, A-D2, A-D3. It also chairs the council and calls every vote.

## Next three

1. Run `/dialecta-research decider`. The ADR origin and the reversed-decision lead are the two that change how it writes records.
2. Prepare P0-D2 for the council: the question in a sentence, the locked constraints, and what it blocks. The council skill already names it as the first question.
3. Run one `vote` record end to end on something small, so the format is exercised before it is needed on something that matters.

## What this agent posts to the exchange

It is the only agent that calls a `vote`, and it closes records others abandon. It posts
an `advice` record to Dan when a decision needs a fact only he has.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

P0-D2 is framed and ready for the council. One vote has run. The ADR template is either
confirmed complete or has a named missing field.
