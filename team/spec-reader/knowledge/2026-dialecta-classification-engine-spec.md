# Classification Engine Specification v1.0: the claim threshold, the spectrum, and the tier boundaries

**Source:** `docs/Dialecta_Classification_Engine_Specification.md`, version 1.0, April 2026,
compiled from Session 3 + 9. Read 2026-09-20.

## Summary

The index calls this the operational backbone (`Dialecta_Project_Index.md`, Discourse layer row),
and it was previously verified clean on tier names only (`drift-map.md` E2); the content itself
had no filed note until this sprint.

**Component 1, the Claim Threshold.** A claim is a falsifiable or arguable proposition specific
enough for another person to engage with on substance; the spec gives explicit is/is-not lists (a
specific disagreement counts, an expression of feeling or a tribal allegiance signal does not).
Claim presence is not binary: the **Claim Specificity Spectrum** runs 0 (no claim) to 3
(developed, with reasoning or evidence or a named counter-argument), and specificity is "the
primary discriminator between tiers, particularly between Spark and Forum." A full
claim-level-by-tier table follows: Forum needs level 2 minimum, Spark is 1 to 2 underdeveloped,
Echo and Fog are 0 to 1 by different failure modes (restating versus unclear), Heat is 0 to 1 with
emotion dominant, Stance is any level with tribal framing dominant, Breach is not rated by claim at
all, it is content-target based. The **critical edge case**: a comment can be angry, sharp, or
contemptuous and still qualify for Forum provided it anchors to a specific claim; emotional
register never disqualifies, absence of a claimable proposition does.

**Component 2, the Prompt Architecture.** Two-stage reasoning inside one API call, explicitly "not
optional": Stage A extracts six structured observations (claim, specificity 0 to 3, emotional
register, tribal/rhetorical markers, article engagement specific-or-general, opposing-view
engagement), Stage B assigns the tier, writes the plain-language commenter message, and flags
borderline cases. The full prompt template is reproduced in the spec with a strict output format
(CLAIM/SPECIFICITY/EMOTION/TRIBAL MARKERS/ARTICLE ENGAGEMENT/OPPOSING VIEW ENGAGED/TIER/
BORDERLINE/COMMENTER MESSAGE). The **hardest tier boundaries** each get a named discriminator:
Forum vs. Heat turns on whether emotion is attached to a specific proposition or is the content
itself; Stance vs. Heat turns on primary function, expressing feeling versus signaling group
membership; Spark vs. Echo turns on whether the comment adds something new; Fog vs. Echo turns on
clarity regardless of originality.

System integration notes: Stage A's structured fields get logged with every classification event,
feeding future fine-tuning (Roadmap Phase 5) and community-discourse pattern surfacing;
borderline-flagged comments are preferentially surfaced for community reclassification; both the
AI-suggested and self-declared tier are stored and displayed when they diverge, since the contrast
is itself signal about the commenter's calibration over time. Open questions: author
claim-submission format, whether claim extraction and evaluation should split into separate passes
at scale, the multilingual claim threshold, and a dedicated Stance/Heat labeled test set.

**What this spec does not contain, verified directly rather than inferred.** No final-tier
resolution algorithm, no mention of community voting weight, self-declaration weight, or Stage 2.5
weight. This matters because `docs/plans/backlog.md` row A-4 ("Final-tier resolution on publish:
`resolveFinalTier` from core") cites this spec as its governing document alongside
`core/resolution.ts`. It is not: the weighting and resolution logic live only in
`packages/core/src/resolution.ts`, sourced from root `CLAUDE.md` directly (see
`2026-dialecta-classification-weighting-provenance.md`). This spec's own scope is a single
comment's claim and tier, never a multi-signal final resolution.

## Implies for Dialecta

- Full citation now exists for the operational backbone the index already pointed to but no note
  had opened.
- `docs/plans/backlog.md` A-4's spec citation is imprecise: "Classification Engine Spec" does not
  cover final-tier resolution. The nearer citation candidates are `core/resolution.ts` itself
  (code, not a spec) and root `CLAUDE.md`'s locked weighting; neither is what A-4's Spec column
  names. Not this agent's file to edit; worth a correction alongside the P0-5 citation issue
  already open in `exchange/open/2026-09-19-002-blindspot-adr-spec-drift.md`.
- The live `api/classify.js` system prompt predates Editorial Voice v1.2 per root `CLAUDE.md`'s
  own known-drift list. This spec's prompt template, reproduced in `docs/`, is the parallel
  document a voice check should also cover if `api/classify.js` is ever brought current; out of
  scope for this note to verify line by line.

*Filed 2026-09-20.*
