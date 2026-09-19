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
