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

*Updated 2026-09-19 after the first research sprint.*

Twelve practices, seven of them filed this sprint. Five notes in `knowledge/`, four new
leads added to the reading list. Three ADRs exist.

**Five** open decisions are waiting, not four. P0-D2, A-D3, A-D1, A-D2, and **B-D1**, which
the earlier count missed. Monetization is a sixth live question with no `-D` row at all, so
it cannot be picked up by the normal flow; the council skill names it and the Project Brief
lists it as open question 7, not 8 as the skill says. Detail in
`knowledge/2026-dialecta-open-decisions.md`.

P0-D2 is framed at `council/log/2026-09-19-p0-d2-login-methods.md`. The advisors have not
been run. The frame narrows the row: ADR-002 already chose magic link plus Google, so the
live question is the sign-up gate alone.

One `vote` is open at `exchange/open/2026-09-19-002-vote-council-guard-hook.md`, ballots
unfilled by design because the six named agents are untrained.

`exchange/open/2026-09-19-001` is **answered**. The three options from the Supabase reality
handoff are framed in a `### decider` block, with option 1 recommended (adopt the live schema)
paired with option 2 as the staging answer, and the risk of being wrong named. It waits on one
question to Dan: were the two September migration files meant to replace the April and May
schema, or written without knowing it was there. Nothing was decided.

**The ADR template is missing one field.** Nygard's Context, Tyree and Akerman's Assumptions,
MADR's Decision Drivers and the Azure Well-Architected guidance all name the same thing: the
condition the decision rests on. The local template records the choice and the reason that
carried it, and nothing that tells a later reader whether it still holds. One section,
`## Holds while`, from ADR-004 forward; never retrofitted into 001 to 003. The template is in
`.claude/skills/dialecta-decide/SKILL.md`, which this agent may not edit. It is Dan's call.

It also chairs the council and calls every vote.

## Next three

*Rewritten 2026-09-19. All four items on the previous list are done. Everything below waits
on Dan or on another agent being trained, so this agent has no unblocked work of its own.*

1. Put the missing ADR field to Dan. One section, `## Holds while`, added to the template in `.claude/skills/dialecta-decide/SKILL.md` and applying from ADR-004 forward. You do not make that edit.
2. Collect the ballots on `exchange/open/2026-09-19-002` once the six named agents have run sprints, then write the tally and close it.
3. Run `/dialecta-council` on P0-D2 once the three advisors have filed research. The frame is written; they argue the sign-up gate, not the login methods. A-D3 is the second council run.

Waiting on Dan, not on you: the one question on `exchange/open/2026-09-19-001`, and the
`## Holds while` field. Neither is yours to answer.

## What this agent posts to the exchange

It is the only agent that calls a `vote`, and it closes records others abandon. It posts
an `advice` record to Dan when a decision needs a fact only he has.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

P0-D2 is framed and ready for the council. One vote has run. The ADR template is either
confirmed complete or has a named missing field.
