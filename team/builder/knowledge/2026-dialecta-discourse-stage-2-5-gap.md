# The comment flow's Stage 2.5 does not exist in the document A-3 cites

**Source:** `docs/Dialecta_Discourse_Layer_UX.md` (full document, "The Three-Stage Flow" section),
against `docs/Dialecta_Article_Editorial_Template.md` ("Symmetric Stage Flow" and the "Stage 2.5"
section), `docs/Dialecta_Delta_Mechanic_Spec.md:33`, `docs/plans/backlog.md` row
A-3, root `CLAUDE.md`'s classification-weighting line, and
`exchange/open/2026-09-19-002-blindspot-adr-spec-drift.md`. Read 2026-09-20.

## Summary

`Dialecta_Discourse_Layer_UX.md` names its own structure "The Three-Stage Flow" and specifies
exactly three: Stage 1 (Write and Analyze), Stage 2 (AI Reflection and Self-Declaration), Stage 3
(Posted). No Stage 2.5 appears anywhere in the document, by that name or any other. The sibling
`Dialecta_Article_Editorial_Template.md` asserts stage-for-stage symmetry in a table (lines
29-34) and lists "2.5 | Amendment Window | Amendment Window" for both the comment system and the
article system, but that assertion lives in the article document. The comment document was never
written to match it: its own flow jumps from Stage 2 straight to Stage 3 with no amendment window
in between. Backlog row A-3 cites "Discourse Layer UX, Stage 2 and 2.5" as its governing spec, a
section that is not in the file it names, the same failure shape `spec-reader` already flagged
for P0-5 (a backlog row citing a section absent from the named document).

It is also not obvious the article's Stage 2.5 shape transplants cleanly even if someone wrote it
in. The Article Editorial Template's Stage 2.5 (lines 94-117) is three options, Amend / Respond
for the Record / Post As-Is, built for a full article with its own `amend_until` field (backlog
A-11). The comment flow's Stage 2 already does some of that job differently: the self-declaration
panel lets a commenter pick a tier other than the AI's before posting at all, and the contrast
note it shows then ("The AI reads this as X. You're declaring Y. Both will be visible.") is close
to what the article's Option B does after the fact. Writing a comment-side Stage 2.5 is a design
decision, not a copy job.

One smaller instance of the same imprecision, noticed in passing: the document reuses the label
"Stage 3" for two different headings, the posted-comment state at line 77 and the reclassification
nomination panel at line 177.

Correction to the lead: the reading list asked whether the comment flow "inherits" Stage 2.5 from
the Article Editorial Template. It does not, by any textual reference. The Discourse Layer
document neither names Stage 2.5 nor points to the article document for it; the symmetry claim is
one-directional, asserted in the article spec and never picked up on the comment side.

## Implies for Dialecta

- A-3 is not buildable as scoped today. Its governing-spec citation names a section absent from
  the cited document, which is a spec gap to report rather than a section to infer. Posted as
  `exchange/open/2026-09-20-builder-01-blindspot-discourse-stage-2-5-missing.md`.
- Whoever specifies the comment-side Stage 2.5 has to choose between transplanting the article's
  three-option shape onto a much shorter unit of content, or designing something that accounts
  for Stage 2's self-declaration and contrast note already covering part of the same ground.
- Root `CLAUDE.md`'s locked "Stage 2.5 response quality: 10%" and A-4's `resolveFinalTier` have no
  comment-side behavior to measure. This is the same open thread `spec-reader` raised for the
  article side (the Article Editorial Template's own "Open Calibration Questions" calls the exact
  weight still open); here it is confirmed unwritten, not merely unweighted, on the comment side
  too.
- The brief's blocking question, whether the comment flow inherits Stage 2.5 or needs its own
  section, is answered: it needs its own section, written from nothing, not inherited by
  reference.

*Filed 2026-09-20*
