# spec-reader: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/spec-reader.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/spec-reader.md` |
| Memory | `team/spec-reader/practices.md` |
| Knowledge | `team/spec-reader/knowledge/` |
| Leads | `team/spec-reader/knowledge/reading-list.md` |
| Skills it owns | None; it is the one the others ask |

## Where it is now

Twenty-two practices, twelve filed notes, two standing artifacts (`drift-map.md`,
`design-tensions.md`). Three passes run: 2026-09-19 against commit `9a355c0` (five seed leads, four
filed clean, one corrected), 2026-09-20 (the six leads left open, all filed, none dead), and a third
2026-09-20 pass answering Mission Zero's exchange drain directly rather than a self-directed sprint.

The drift map exists: `knowledge/drift-map.md`. It covers the ADR overrides (sections A to C), the
index's six internal defects (D), the retired vocabulary sweep in four classes (E), a locked decision
that no spec states (F), two table name collisions (G), the cloud only files (H), a fourth kind of
drift (I): a spec whose own shipped implementation quietly replaced its rules, a spec whose own
status line hedges a name root `CLAUDE.md`'s lock treats as settled, and, found closing the Mission
Zero exchange records, a fourth document that cites a comment-side Stage 2.5 without defining it
(I4). Section J is new and a different class again: a feature with working, deliberate production
code and no governing spec anywhere in `docs/` (`aesthetic-suggest.js`, the article polish engine).
Lead with its quick reference table before quoting any spec on stack, identity, articles, vocabulary,
classification weighting, the axis-mapping trigger rules, Stance/Breach naming, a comment-side Stage
2.5, or the article aesthetic pass.

The three deferred tensions are answered in `knowledge/design-tensions.md`, with both sides cited and
none resolved. Tension 1 (archetype against the three voice principle) now has independent
confirmation, not just a summary: `knowledge/2026-dialecta-self-snapshot-engine.md` re-read the
Self-Snapshot spec directly and confirms archetype is absent from both its Data Model table and its
Open Questions, not merely unplaced.

The ten specs the index omits (practice 2) are now fully covered rather than just named: Axis
Mapping and Self-Snapshot Engine each got a full note
(`2026-dialecta-axis-mapping-v1.md`, `2026-dialecta-self-snapshot-engine.md`), and the other eight
got a verified one-liner in `2026-dialecta-omitted-specs-map.md`, two of them corrected from
`drift-map.md` D5's original guess once actually read.

The classification weighting question (F1) moved from "no spec states it" to "no spec states it, and
it is now shipped code": `packages/core/src/resolution.ts` implements `RESOLUTION_WEIGHTS` straight
from the `CLAUDE.md` line this agent already flagged, with a resolution algorithm that exists in no
prose document at all. Full account: `2026-dialecta-classification-weighting-provenance.md`.

Answered the blocking advice record from `builder` on backlog A-1
(`exchange/open/2026-09-19-002-advice-a1-composer-request-path.md`): confirmed the disagreement
between `Dialecta_Discourse_Layer_UX.md` Stage 1's blocking read and backlog A-1's enqueue read is
real, cited both, did not resolve it. Added the `resolution.ts` evidence to the still-open blindspot
on classification weighting. Cast a ballot on the council-guard vote now that a research sprint, the
vote's own stated unblock condition, has run.

**Mission Zero pass, 2026-09-20.** Answered all four exchange records addressed to this seat.
Closed the last seed-batch lead: `Dialecta_Delta_Mechanic_Spec.md` is not a comment-side Stage 2.5,
it is a fourth document that cites one without defining it (`builder`'s
`2026-09-20-builder-01-blindspot-discourse-stage-2-5-missing.md`, now `drift-map.md` I4). Corrected
this seat's own earlier hedge on `advice-a1-composer-request-path` after a full read of
`Dialecta_Supabase_Scaling.md`: that document endorses the blocking design Stage 1 specifies, it
does not justify A-1's enqueue design, which moves the open question from spec-reading to a product
call only Dan or `decider` can make. Answered `designer`'s direct question on
`2026-09-19-005`: no spec in `docs/` designs the article aesthetic pass; working production code
exists for a feature nobody wrote a governing spec for (`drift-map.md` J1, new section). Reframed
this seat's own open blindspot on the 40/35/15/10 classification weighting
(`2026-09-19-002-blindspot-adr-spec-drift.md`) into a form the Council can debate, per Dan's
instruction not to resolve it from this seat. Checked the council-guard vote before touching it:
already cast, did not re-vote.

Nothing in `docs/`, `apps/`, or `packages/` was edited. Everything above is reported, not fixed.
Corrections still owed to files this agent cannot write: root `CLAUDE.md` line 83 and its cloud only
list, `docs/Dialecta_Project_Index.md` on four counts plus the ten omitted specs,
`docs/plans/backlog.md` P0-5 and A-4's spec citations, A-3's Stage 2.5 citation (now confirmed
unspecified four ways over), and whichever spec should carry the classification weighting or the
aesthetic pass, if either ever does.

## Next three

1. `docs/Dialecta_Editorial_Voice.md` v1.2 end to end, as a constraint on this agent's own output.
   Carried over from the seed batch, the one lead still not worked.
2. `packages/core/src/classification.ts` against the Classification Engine Spec's Stage A fields,
   the natural next place to check for the kind of spec-versus-code drift `axis-mapping.ts` turned
   out to have.
3. `docs/Dialecta_Data_Architecture.md` in full. Cited piecemeal across drift-map A1, A2, B1, B2,
   C3, and G2, never read end to end or filed as its own source.

## What this agent posts to the exchange

It answers more than it posts. Its one case is a `blindspot` when two specs disagree and
nobody has asked yet, because that disagreement will surface as a build error later.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

A drift map exists. Any question about a tier, a pillar, or an archetype gets an answer
with a file and a heading, and retired names never reach a build.
