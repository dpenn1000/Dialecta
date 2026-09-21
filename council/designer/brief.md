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

Three sprints ran 2026-09-19, and a fourth session on 2026-09-20 added `studio/`. Nineteen sources
filed in `research/`, six of them from the seed. Twenty-six standing positions in `positions.md`,
each with confidence and a filed note behind it. Nothing is `(unsourced)`. It has still never argued
in council, though `2026-09-19-003` drew real answers from `philosopher` and `treasurer` and is
functionally a debate that happened in the exchange instead.

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

Four records were opened in `exchange/`, and two came back with more than was asked for.
2026-09-19-002 on the SMTP blocker. 2026-09-19-003 on the composer gate, where `philosopher`
returned Matias (2019), a randomised field experiment across 2,190 r/science discussions in which
displaying the rules, changing nothing about enforcement, raised newcomer compliance 8 points and
participation 70 percent, plus Steindl et al. on situational barriers as a reactance trigger in
their own right; and `treasurer` priced classification at $0.002 a comment and showed the cost
question was never the real one, the abuse path is. 2026-09-19-004 to `decider` on the badge
contrast defects. 2026-09-19-005, where `builder` corrected this seat: the `aesthetic-suggest.js`
text quoted in that record is v1, and production had already moved to a server-side polish engine
with no suggestion cards, so the interaction argued for is not what was last live.

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

## Waiting on Dan

**Resolved 2026-09-20: the charter amendment.** This section used to propose two generative clauses
because the charter was written entirely in defensive terms. Dan rewrote both the charter and the
mandate instead, and went further than the proposal did. Recorded as D-26. Nothing is owed here.

**Open: the mandate's tool list contradicts the mandate.** One line, and it is the thing standing
between this seat and the job it has now been given.

`.claude/agents/designer.md` currently declares:

```
tools: Read, Grep, Glob, Write, WebSearch, WebFetch
```

No `Bash`, and no browser. The prose above that line asks for three things the line forbids. It says
"compute it rather than judging it by eye: you wrote `council/designer/research/tier-palette-audit.py`
for exactly this", and the advisor cannot run that script. It says "Compute what can be computed.
Contrast, type scale ratios, spacing multiples and breakpoints are arithmetic", and the advisor
cannot compute. It ends "End a session with `node scripts/land.mjs --agent designer`", and the
advisor cannot land.

Every measured finding this seat holds, the whole palette audit and the space audit, was produced by
a lead session holding tools the advisor itself does not have. The seat owns the numbers and cannot
reproduce them.

The proposed line, verified against the Claude Code subagent documentation for the
`mcp__<server>__*` pattern:

```
tools: Read, Edit, Write, Grep, Glob, Bash, WebSearch, WebFetch, mcp__Claude_Browser__*, mcp__visualize__*
```

`Bash` runs the audit, computes, and lands. `Edit` replaces wholesale rewrites of `positions.md`,
which is how a session clobbers another session's rows. The browser is how this seat stops
auditing a visual system without looking at it. `mcp__visualize__*` is how it shows Dan a rendered
comparison instead of describing one.

Two additions belong with it, both written out ready to paste in
`council/designer/proposed-mandate-additions.md`: a short section on how to render and inspect a
surface in this environment, because the method is not obvious and cost a session several wrong
turns; and one sentence tightening the write rule, because `Bash` can write anywhere and the folder
fence is currently prose rather than a mechanism.

**Why this is not already done.** The auto mode classifier blocked the edit as self-modification,
which is right: an agent widening its own tool grant is exactly the change a human should make.
No workaround was attempted. The change is Dan's to apply.

## The standing ask

Unchanged, and it still blocks its own positions. D-7 says nothing about the composer can be
settled until first-comment completion is instrumented. That is the next thing worth buying.

## Next three

1. The replies landed and they moved two positions. D-2 is confirmed rather than argued, on
   Matias, and D-5 moves from preference to requirement, because treasurer tied it to the open
   unauthenticated write path rather than to the Anthropic bill. Fold both into `positions.md`
   with the new citations, and close `2026-09-19-003`.
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
