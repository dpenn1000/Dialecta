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

Sprints 1 and 2 both ran 2026-09-19. Sixteen sources filed in `research/`, six of them from the seed.
Eighteen standing positions in `positions.md`, each with confidence and a filed note behind it.
Nothing is `(unsourced)`. It has still never argued in council.

Sprint 2 exists because sprint 1 read entirely about behaviour and filed nothing on colour, space,
type or layout, which is half of what this advisor is for. D-11 through D-18 are the craft half, and
unlike the behaviour half they are measured off this repo rather than borrowed from other platforms.
`research/tier-palette-audit.py` reproduces the numbers.

What the audit found. Heat badge text measures 1.96:1 against its own chip where 4.5:1 is required,
and the icon inherits it. Stance measures 4.26:1. Stance and Breach borders are 9.22 CIEDE2000 apart
and closer still under every simulated colour vision deficiency, so the two most serious tiers read
as one colour in the topology bar. Forum's border is 1.50:1 against the card surface, making the tier
the Quality sort exists to surface the least visible of the seven. The one contrast fix already in
the spec was applied to Forum, which measures 6.39:1 and did not need it. Separately, the token set
defines no spacing value, no type size, no line height and no measure, and the spec uses 29 font
sizes and 17 padding values in their place.

The reading list now carries three corrections to the seed and eleven leads, four of them new. No
seed entry turned out to be fabricated; one had the wrong domain, one was attributed to a source that
was not read, and one understated the mechanism it described.

Two positions carry the sprint. On the first comment: no precedent filed gates the act of writing,
and A-1's 12 character gate is both too small to filter anything and implemented as a disabled button
with no message, which is the mechanism two government design systems say to avoid without user
research. On P0-D2: Google OAuth first, because Supabase's own documentation says magic link cannot
deliver to anyone outside the project team without custom SMTP.

Three records are open in `exchange/`: 2026-09-19-002 on the SMTP blocker, 2026-09-19-003 asking
`philosopher` and `treasurer` for the evidence behind the composer gate before the debate, and
2026-09-19-004 to `decider`, because the badge contrast defects sit inside a locked decision and
`exchange/README.md` case 2 says that stops here.

The scope line held in sprint 2 and should keep holding. D-17 states it: the brightness ladder, the
gold, the grain and the nav gradient are not in play, and every craft position is either additive or
a number that is wrong against a normative W3C criterion. Most of the audit is fixable with the tier
icons the design spec already defines, which is why only the two text colours went to `decider`.

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

Then, once those land: propose the spacing and type scales as a concrete addition to
`design/dialecta-design-spec.html` for Dan to accept or refuse, with `scripts/extract-tokens.mjs`
carrying them into `tokens.css`; and write the CI contrast check in D-18, which is additive, touches
no locked value, and would have caught the Heat badge in April.

## What this agent posts to the exchange

Its positions are its output; the council reads them. It posts a `blindspot` when it
is about to argue something the other two advisors will have data on and it does not.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

Six or more sources filed. A position exists on onboarding and on the seven day return,
each with a source and a named Dialecta surface.
