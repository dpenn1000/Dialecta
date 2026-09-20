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

Nineteen practices, ten filed notes, two standing artifacts (`drift-map.md`, `design-tensions.md`).
Two sprints run: 2026-09-19 against commit `9a355c0` (five seed leads, four filed clean, one
corrected), and 2026-09-20 (the six leads that were left open, all filed, none dead).

The drift map exists: `knowledge/drift-map.md`. It covers the ADR overrides (sections A to C), the
index's six internal defects (D), the retired vocabulary sweep in four classes (E), a locked decision
that no spec states (F), two table name collisions (G), the cloud only files (H), and, new this
sprint, a fourth kind of drift entirely (I): a spec whose own shipped implementation quietly replaced
its rules, and a spec whose own status line hedges a name root `CLAUDE.md`'s lock treats as settled.
Lead with its quick reference table before quoting any spec on stack, identity, articles, vocabulary,
classification weighting, the axis-mapping trigger rules, or Stance/Breach naming.

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

Nothing in `docs/`, `apps/`, or `packages/` was edited. Everything above is reported, not fixed.
Corrections still owed to files this agent cannot write: root `CLAUDE.md` line 83 and its cloud only
list, `docs/Dialecta_Project_Index.md` on four counts plus the ten omitted specs,
`docs/plans/backlog.md` P0-5 and A-4's spec citations, and whichever spec should carry the
classification weighting, if one ever does.

## Next three

1. `docs/Dialecta_Editorial_Voice.md` v1.2 end to end, as a constraint on this agent's own output.
   Carried over from the seed batch, the one lead not yet worked.
2. `docs/Dialecta_Delta_Mechanic_Spec.md` in full, to confirm or correct whether it is where a
   comment-side Stage 2.5 actually lives, which would close part of the gap
   `2026-dialecta-classification-weighting-provenance.md` found.
3. `packages/core/src/classification.ts` against the Classification Engine Spec's Stage A fields,
   the natural next place to check for the kind of spec-versus-code drift `axis-mapping.ts` turned
   out to have.

## What this agent posts to the exchange

It answers more than it posts. Its one case is a `blindspot` when two specs disagree and
nobody has asked yet, because that disagreement will surface as a build error later.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

A drift map exists. Any question about a tier, a pillar, or an archetype gets an answer
with a file and a heading, and retired names never reach a build.
