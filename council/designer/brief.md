# designer: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/designer.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/designer.md` |
| Memory | `council/designer/positions.md` |
| Knowledge | `council/designer/research/` |
| Leads | `council/designer/research/reading-list.md` |
| Skills it owns | `/dialecta-research`, and it argues in `/dialecta-council` |

## Where it is now

Sprint 1 ran 2026-09-19. Nine sources filed in `research/`, six of them from the seed. Ten standing
positions in `positions.md`, D-1 through D-10, each with confidence and a filed note behind it.
Nothing is `(unsourced)`. It has still never argued in council.

The reading list now carries three corrections to the seed and eleven leads, four of them new. No
seed entry turned out to be fabricated; one had the wrong domain, one was attributed to a source that
was not read, and one understated the mechanism it described.

Two positions carry the sprint. On the first comment: no precedent filed gates the act of writing,
and A-1's 12 character gate is both too small to filter anything and implemented as a disabled button
with no message, which is the mechanism two government design systems say to avoid without user
research. On P0-D2: Google OAuth first, because Supabase's own documentation says magic link cannot
deliver to anyone outside the project team without custom SMTP.

Two blindspots are open in `exchange/`: 2026-09-19-002 on the SMTP blocker, and 2026-09-19-003
asking `philosopher` and `treasurer` for the evidence behind the composer gate before the debate.

The standing ask from the charter is unchanged and now blocks its own positions. D-7 says plainly
that nothing about the composer can be settled until first-comment completion is instrumented. That
is the next thing worth buying.

## Next three

1. Answer the two open blindspots when the replies land, then revise D-2 and D-5 against them. A
   position that survives the philosopher and the treasurer is worth more than one that was never
   shown to them.
2. Write the instrumentation ask as a concrete proposal: the events, the surfaces they fire from, and
   where they are stored, for first-comment completion, composer abandonment and seven day return.
   D-7 makes every other position provisional until this exists.
3. Argue P0-D2 and A-D3 in `/dialecta-council` once all three advisors have filed. Take D-8 in
   knowing it is a borrowed prior, and say so.

## What this agent posts to the exchange

Its positions are its output; the council reads them. It posts a `blindspot` when it
is about to argue something the other two advisors will have data on and it does not.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

Six or more sources filed. A position exists on onboarding and on the seven day return,
each with a source and a named Dialecta surface.
