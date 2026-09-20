---
id: 2026-09-19-002
type: blindspot
from: spec-reader
to: [team]
subject: Three backlog rows cite a spec section that does not exist or a value no spec states
backlog: P0-5
state: open
opened: 2026-09-19
closed:
outcome:
---

## What I am about to do

I have filed `team/spec-reader/knowledge/drift-map.md`, which records every place ADR-001, ADR-002
and ADR-003 override an older spec, and every place a doc still carries retired vocabulary. I am
posting this because three rows in `docs/plans/backlog.md` point at spec text that is either absent
or superseded, and a builder taking those rows at face value will produce work that has to be
redone rather than reviewed.

## What I think the risks are

Already seen and accounted for: that the specs predate the ADRs is known and recorded in root
`CLAUDE.md`. That the live Supabase schema is ahead of this repo is already open as
`2026-09-19-001`. Neither covers the three below.

**P0-5 cites a section that does not exist.** Its spec column reads "ADR-003; Data Architecture:
articles". `docs/Dialecta_Data_Architecture.md` has no `articles` entity. Its entity list is
`comments`, `classifications`, `axis_events`, `axis_scores`, `fp_snapshots`, `archetypes`,
`aspirations`, `feed_events`, `comments (community voting)`, `follows`, `sparring_partners`,
`opinion_map_positions`. That spec's section "Ghost CMS Integration Notes (Phase 1)" line 364 says
"Ghost owns: articles". ADR-003's own `## Specs touched` names the same non existent section. The
column shape the row needs is real and is in `docs/plans/build-plan.md`; the spec citation is not.
Same applies to A-10 and A-11, which cite the Article Editorial Template for a composer note that
ADR-003 asked for and that was never added.

**A-4 needs a number that no spec states.** The row is final tier resolution via `resolveFinalTier`.
Root `CLAUDE.md` locks the weighting as AI 40 percent, community 35, self declaration 15, Stage 2.5
response quality 10. Those figures appear nowhere in `docs/`. The only spec statement is ordinal:
`docs/Dialecta_Article_Editorial_Template.md` section "Weight in the Algorithm" lines 112 to 115
gives AI and community as primary signal and the other two as secondary. The same file's "Open
Calibration Questions" line 198 lists "The precise weight of Stage 2.5 disagreement in the final
tier algorithm" as still open. So the spec calls open what the locked decisions list calls settled.
Whoever writes `resolveFinalTier` will either hardcode the percentages with no spec behind them or
stall.

**B-4 ports a file that carries a retired pillar name.** The row is to port
`components/dialecta-fingerprint-engine.jsx` to TypeScript. That file defines an axis at line 129 as
`key: "charity", label: "Charity"`. Charity was renamed to Magnanimity and Magnanimity is locked in
root `CLAUDE.md`. Two sibling files carry the same key. A faithful port moves a retired pillar name
into `packages/core`.

Also worth knowing, not a backlog blocker: three specs still state that Ghost is the confirmed
production stack, and two of the three are named in no ADR.
`docs/Dialecta_Project_Index.md` line 297 says of the Next.js migration "it is closed", and
`docs/Dialecta_Supabase_Scaling.md` line 203 says "Ghost is the confirmed production stack". The
index is the document the spec reading method starts from.

## Specifically asking

Two questions, one for `decider` and one for whoever picks up P0-5 first.

For `decider`: are the four classification weighting percentages a decision Dan made that never
reached a spec, or a figure that entered root `CLAUDE.md` by inference? A-4 cannot be built without
an answer, and I will not infer one. If they are real they belong in an ADR or in the Classification
Engine spec, because `docs/Dialecta_Article_Editorial_Template.md` line 198 currently contradicts
them.

For P0-5: do you want the `articles` column shape from `docs/plans/build-plan.md` and ADR-003, and
the backlog's spec citation corrected, or should the Data Architecture spec gain an `articles` entity
first? I cannot edit either file. I can supply the exact column list and the two citations.

### spec-reader: addendum 2026-09-20

New evidence for the `decider` question above, found while filing this sprint's reading list.
`packages/core/src/resolution.ts` now implements `resolveFinalTier()` with `RESOLUTION_WEIGHTS = {
ai: 0.4, community: 0.35, self: 0.15, stage25: 0.1 }`, and its own doc comment names the source:
"Locked weighting (CLAUDE.md, 'Classification weighting')." So the code itself, written after this
record was opened, already answers the "never reached a spec" half of the question: it traces to
`CLAUDE.md` and nowhere else, by its own author's account. What is still unanswered is the other
half, whether Dan set the four numbers deliberately or they entered the doc by inference; nothing
in this repo settles that, and I am not inferring one.

One more thing worth having in front of `decider` alongside this: the resolution algorithm itself
(each present signal as a probability distribution over seven tiers, weighted sum over only the
signals present, argmax with ties to the AI tier) exists in no prose document anywhere, not even as
the ordinal statement `Dialecta_Article_Editorial_Template.md` gives. If the weighting is ever
written into a spec, the mechanism, not only the four numbers, is what is missing.

Full account: `team/spec-reader/knowledge/2026-dialecta-classification-weighting-provenance.md`.

### spec-reader: reframed for Council debate, 2026-09-20 Mission Zero pass

Dan wants this argued, not decided from here. Restating it in a form a debate can take, not
resolving it.

**What the four numbers do.** `packages/core/src/resolution.ts`, `RESOLUTION_WEIGHTS = { ai: 0.4,
community: 0.35, self: 0.15, stage25: 0.1 }`. Each present signal becomes a probability distribution
over the seven tiers; the four distributions combine by weighted sum over only the signals actually
present, so an absent signal drops out rather than diluting the sum; the final tier is the argmax of
the combined distribution, ties going to the AI tier. That tie-break is a second thumb on the scale
beyond the headline 40 percent and belongs in the same debate, not just the four percentages.

**What turns on them.** `resolveFinalTier` sets `final_tier`, the number every published comment and
article carries. That number drives the topology bar, the default Quality sort (tier rank first,
votes second), Forum-tier comment counts on article cards (backlog A-9, a locked UI decision), and
the Reviser archetype's own requirement that each qualifying acknowledgment be classified at
Forum-tier (`Dialecta_Delta_Mechanic_Spec.md`, Reviser Requirements). Move the split and you move who
clears Forum, which changes what a new reader sees first and who becomes a Reviser. Not a scoring
detail. It sets the platform's visible standard.

**What a seat would need to argue for a different split.** No worked example, calibration data, or
prose rationale exists anywhere in `docs/` for why it is 40/35/15/10 rather than any other four
numbers summing to 100; confirmed again this sprint, the figures appear in no spec. A seat arguing
for a change cannot cite a documented principle on record now. It would have to argue from: what the
platform's stated design commitments already imply (the Quality-sort default is itself a claim about
how much AI versus community should shape what a reader sees first, and that claim is written down
even though the percentages are not); a concrete case where the current split produces a result the
platform's own values would call wrong; or the standing claim in
`team/decider/knowledge/2026-dialecta-open-decisions.md`, that backlog row A-D1, whether community
alone may outweigh AI, "moves the locked 40/35/15/10 weighting, which is a founding commitment."
That line treats the split as settled and Dan-originated. It is not sourced beyond the same
`CLAUDE.md` line this record already traces, so a seat could equally argue A-D1 and this weighting
are one decision wearing two record numbers, not two.

**One fact the Council should have before it argues percentages, not after.** The fourth number,
`stage25Quality` at 10 percent, has no comment-side source to draw from. Confirmed today
(`2026-09-20-builder-01-blindspot-discourse-stage-2-5-missing.md`): no spec defines a comment-side
Stage 2.5 anywhere, checked directly against `Dialecta_Delta_Mechanic_Spec.md` this pass. Debating
what stage25's weight should be is debating the weight of an input the platform cannot currently
produce.

Not closing this. Leaving it open for the Council pass.
