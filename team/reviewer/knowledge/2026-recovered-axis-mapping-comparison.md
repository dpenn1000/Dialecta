# The recovered axis-mapping implementation, compared against packages/core on all six axes

**Source:** `_recovered/api/_axis-mapping.js` (quarantined, recovered from a Vercel deployment artifact) against `docs/Dialecta_Axis_Mapping_v1.md` and `packages/core/src/axis-mapping.ts`. Read 2026-09-20. Cited per this sprint's terms: quarantine, promote nothing from it.

## Summary

Blocker B3 on `exchange/open/2026-09-19-002-handoff-pr-3-review.md` says `packages/core/src/axis-mapping.ts` diverges from the spec on all six axes. The recovered file gives a second implementation to compare against the same spec. It matches the spec on all six axes, essentially exactly, as an event-per-trigger model rather than the repo's continuous partial-credit model. Axis by axis:

| Axis | Spec | `packages/core` (`axisDeltasFor`) | `_recovered` (`deriveAxisEvents`) |
|---|---|---|---|
| Acuity | `specificity_score >= 1` AND tier in {forum, spark}, binary +1 | `ACUITY_BY_SPECIFICITY` table, 0/0.25/0.75/1 by specificity, no tier gate at all | `specificity >= 1 && ACUITY_ELIGIBLE_TIERS.has(finalTier)`, matches |
| Reach | new `primary_tag` for this member, binary +1 | `(article_engagement==='specific'?0.5:0) + (opposing_view_engaged?0.5:0)`, no topic signal anywhere | `articleTopic && !priorTopics.has(articleTopic)`, matches, and is the only version that receives topic history as an input at all |
| Calibration | `specificity_score >= 1` AND not tribal, binary +1 | `(opposing_view_engaged?0.5:0) + (!tribal_markers?0.5:0)`, substitutes opposing view for specificity | `specificity >= 1 && !tribalMarkers`, matches |
| Magnanimity | opposing view yes or partially, equal weight, binary +1 | `(opposing_view_engaged?0.5:0) + (emotion!=='high'?0.5:0)`, adds an emotion gate the spec does not have for this axis (the spec explicitly says emotion is not gated, under Calibration) | `MAGNANIMITY_ELIGIBLE.has(opposingView)`, matches, no emotion term |
| Discourse | `article_engagement === 'specific'`, binary +1, tier-independent except Breach | `DISCOURSE_BY_TIER` table keyed on `ai_suggested_tier`, ignores `article_engagement` entirely | `DISCOURSE_ELIGIBLE_ENGAGEMENT.has(engagement)`, matches |
| Consistency | every non-Breach comment, binary +1 | hardcoded `0`, comment says it "needs history" and is deferred to a future replay rule | unconditional push after the Breach check, matches |

Three findings go beyond "the weights differ":

1. **Reach in `packages/core` cannot be fixed by retuning weights.** `axisDeltasFor(classification: ClassificationResult)` is never given a topic or a member's prior topics; `ClassificationResult` (`packages/core/src/classification.ts`) carries no such field. The function does not have the data the spec's Reach trigger needs. The recovered version's signature carries `articleTopic` and `priorTopics` as separate arguments precisely because this cannot be derived from a classification alone.
2. **Consistency in `packages/core` cannot accrue, ever, as written.** `replayAxisScores` sums whatever delta each event carries; every event this function would ever produce for Consistency carries `0`. This is not a miscalibration, it is a pillar that structurally never moves, which is a more severe defect than blocker B3's table already states (it says Consistency is "hardcoded 0 at line 72"; this note adds that the replay step gives it no path to recover, since replay only sums what it is given).
3. **`packages/core` has no article-side mapping and no malleability re-classification path at all**, not a wrong one. The spec's v1.1 addition (`docs/Dialecta_Axis_Mapping_v1.md`, "Articles to Author Fingerprint") and universal rule 6 (re-classification) are both implemented in the recovered file (`deriveArticleAxisEvents`, `deletePriorAxisEventsForClassification`) and absent from `packages/core/src` entirely (grepped for both names and for `classification_id`; no match outside `axis-mapping.ts` and `classification.ts`, and neither implements them). See `2026-axis-mapping-malleability-window.md` for the second of these in detail.

**Corroborating, not conclusive, provenance:** `docs/Dialecta_Axis_Mapping_v1.md`'s own References section names `api/_axis-mapping.js` as "the implementation (the canonical helper that turns this spec into code)," and root `CLAUDE.md` separately notes "Handoffs also reference `api/_axis-mapping.js`; it is not in this repo." The recovered file's path and name match that citation exactly. This raises confidence that the recovered file is the artifact the spec's own author had in mind, not an unrelated draft, but it is still quarantined evidence, not a verified chain of custody.

## Does this close blocker B3

No. The blocker is about `packages/core/src/axis-mapping.ts`, the file `apps/web` will actually import once B-1 ships, and that file is unchanged by anything found today. What changes is confidence and precision: B3 was already correct at the level of "diverges on all six axes," and this comparison confirms that claim was not an overstatement, gives a row-by-row target for what "matches the spec" looks like in code, and surfaces that two of the six axes (Reach, Consistency) need a signature change, not just a formula change, plus two entire code paths (article events, re-classification) that do not exist yet at all. It sharpens B3 into something a fix can be scoped against. It does not touch severity: B-1 is still `Todo` in `docs/plans/backlog.md`, so nothing has shipped against this function yet, and the append-only cost the original finding warned about has not yet been paid.

## Implies for Dialecta

- Whoever fixes B3 has a concrete axis-by-axis target now, with the two structural gaps (Reach's missing topic-history input, Consistency's missing accrual path) called out as signature changes rather than constant tweaks.
- The quarantine boundary held: nothing here recommends copying code out of `_recovered/`, only using it as a reference for what a spec-faithful version does.
- Appended as a correction to `exchange/open/2026-09-19-002-handoff-pr-3-review.md`, since it bears directly on an open blocker on that record.

*Filed 2026-09-20*
