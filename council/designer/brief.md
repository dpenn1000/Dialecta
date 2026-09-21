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
| Ideas before evidence | `council/designer/studio/` |
| Skills it owns | `/dialecta-research`, and it argues in `/dialecta-council` |

`studio/` was added 2026-09-20 and is the only place here exempt from the sourcing rule. Its README
holds the contract and the three ways an idea leaves. It exists because every other artifact this
advisor owns requires a citation, a new idea has none by definition, and so nothing new was ever
getting written down.

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

Sprint 3 scanned for repositories rather than papers, and the best finds were Dan's own. The APEX
design system in `dpenn1000/trinity-platform` already solves D-15 in his idiom, with a direction
rule this advisor did not have, and already states the colour law that the Heat badge violates.
`dpenn1000/dialecta-api` carries five article endpoints this repo does not, including
`aesthetic-suggest.js`, which is a formatting assistant written in Editorial Voice before v1.2
existed. Raised as 2026-09-19-005. Externally, Radix Colors supplied the one idea that turns the
palette audit into something fixable: a scale is a set of promises between its own steps.

The boundary on Trinity needs restating every time it comes up. Root `CLAUDE.md` says the voice
guides descend from Trinity and the two are "kept separate on purpose". The same holds for design:
take the laws and the method, never the palette or the cockpit look.

## Proposed charter amendment, for Dan

`guard-docs.mjs` blocks this advisor from editing `charter.md`, correctly. This is the proposal, to
accept, change or refuse.

The charter is written entirely in defensive terms: what it fights for, what it would veto, what
constrains it, what it measures. Three sprints produced two audits and one scan, which is what that
charter asks for. Nothing in it says this advisor may propose something new, and nothing names
craft. The mandate says the site should feel "native and inevitable" and then never mentions colour,
space, type or beauty again.

Two clauses would fix it, in the charter's existing register:

> **I propose, not only object.** A council seat that only ever says no is a filter. I bring fresh
> work: a surface nobody asked for, a mechanic that fits the thesis better than the one in the spec,
> a way to make the thing people will actually love. I argue for it with the same evidence I demand
> of others.

> **Fit and finish are mine.** Colour that survives real eyes, space that carries meaning, type a
> person reads without noticing, and the organic native feel that makes this place look like nowhere
> else. Tokens are locked and I do not iterate on them for taste, but a number that is measurably
> wrong is mine to raise, and a system with no rule behind it is mine to propose one for.

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
