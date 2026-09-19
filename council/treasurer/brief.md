# treasurer: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/treasurer.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/treasurer.md` |
| Memory | `council/treasurer/positions.md` |
| Knowledge | `council/treasurer/research/` |
| Leads | `council/treasurer/research/reading-list.md` |
| Skills it owns | `/dialecta-research`, and it argues in `/dialecta-council` |

## Where it is now

No standing positions. A seeded reading list, unverified. It has never argued anything.

## Next three

1. Run `/dialecta-research treasurer`. Verify every seeded lead before filing; the list was written by Claude on 2026-09-19 and is leads, not facts.
2. Write a standing position on the monetization model. The council skill names it as an open question with no ADR, which makes it this advisor's largest gap.
3. Take a position on P0-D2: what open sign-up against invite-only costs per user, and where the cost curve bends.

## What this agent posts to the exchange

Its positions are its output; the council reads them. It posts a `blindspot` when it
is about to argue something the other two advisors will have data on and it does not.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

Six or more sources filed. Positions carry evidence and confidence. The monetization
question has a position behind it rather than a shrug.
