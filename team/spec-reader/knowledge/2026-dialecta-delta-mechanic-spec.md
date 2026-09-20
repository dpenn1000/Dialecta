# Delta Mechanic Spec: its own six stages, and two bare references to a comment-side Stage 2.5 it never defines

**Source:** `docs/Dialecta_Delta_Mechanic_Spec.md` v1.0, April 2026, read in full. Cross-checked
against `docs/Dialecta_Discourse_Layer_UX.md`, `docs/Dialecta_Article_Editorial_Template.md`, root
`CLAUDE.md`, and `docs/plans/backlog.md` A-3. Read 2026-09-20, Mission Zero pass, closing the last
open seed lead plus item 2 of this agent's "Next three."

## Summary

Builder's lead (`2026-09-19-002-advice-a1-composer-request-path.md`) asked whether this spec is
where a comment-side Stage 2.5 actually lives, since it describes the comment flow as Stage 1, 2,
2.5, 3. **It is not.** The spec is not itself a Stage 2.5 definition and it does not contain one.

**What this document actually specifies.** A distinct six-stage mechanic for article-level position
tracking, labeled A through F (Pre-read snapshot, Reading, Post-read snapshot, Delta calculation,
Delta reveal, Public choice), built around a draggable 2D plot on the article's opinion-map axes. It
computes a private before/after delta and, on the reader's choice, can seed a draft comment tagged
DELTA ACKNOWLEDGED. This is the infrastructure the Reviser archetype depends on. None of it is the
comment classification flow.

**Where it asserts a comment-side Stage 2.5 without defining one.** Twice.

- Line 33: "The delta mechanic operates across six sequential stages that mirror the comment
  classification system's Stage 1 / Stage 2 / Stage 2.5 / Stage 3 structure. The symmetry is
  structural, not cosmetic."
- Line 160: "Classification: The comment from Option A passes through the normal classification
  engine (Stage 1 → Stage 2 → Stage 2.5)."

Both treat "Stage 2.5" as an existing, settled step in comment classification. Neither describes
what a commenter sees or does there. Grepped the whole file for stage content beyond these two
lines: none.

**The count is now four, not one.** Before this note, three places in the corpus assumed a
comment-side Stage 2.5: `docs/plans/backlog.md` A-3's citation ("Discourse Layer UX, Stage 2 and
2.5"), root `CLAUDE.md`'s locked 10 percent weighting for "Stage 2.5 response quality," and
`Dialecta_Article_Editorial_Template.md`'s symmetry table, line 33 of that file: `| **2.5** |
**Amendment Window** | **Amendment Window** |`. This spec is the fourth, and the first one found
that references the gap twice in one document. `docs/Dialecta_Discourse_Layer_UX.md`, the document
that actually owns the comment lifecycle, has zero matches for "2.5," confirmed independently by
`builder` and by this agent on separate reads.

**The only place Stage 2.5 gets real content is article-only.**
`Dialecta_Article_Editorial_Template.md`'s own section, "## Stage 2.5 — The Amendment Window" (from
line 94), describes three options, Amend, Respond for the Record, Post As-Is, built around a full
article draft and an `amend_until` field. None of it names a single comment. The symmetry table
asserts the mirror; the detailed section never builds the comment-side half of it.

## Implies for Dialecta

- Answers `2026-09-20-builder-01-blindspot-discourse-stage-2-5-missing.md` for `builder`: the more
  serious of the two cases named in that record. A-3's citation does not point at real content
  under the wrong label; it points at a stage specified nowhere, assumed real by four independent
  documents.
- Strengthens `2026-09-19-002-blindspot-adr-spec-drift.md` (this agent's own, F1 /
  `2026-dialecta-classification-weighting-provenance.md`): `resolveFinalTier`'s `stage25Quality`
  input, 10 percent of the locked weighting, has no comment-side spec to source it from anywhere
  in `docs/`, now checked against a fourth document and still absent.
- The fix is a `docs/` edit only Dan can make or commission: either write the comment-side Stage
  2.5 into `Dialecta_Discourse_Layer_UX.md`, or correct all four citations (A-3, `CLAUDE.md`, the
  Editorial Template's symmetry table, and this spec's two lines) to say the stage does not exist
  for comments yet. Not this agent's call to pick between them.

*Filed 2026-09-20, Mission Zero pass.*
