# Where the 40/35/15/10 classification weighting came from: not a spec, now shipped code, still an open decision

**Source:** Root `CLAUDE.md` "Locked decisions" line 66. Cross-checked against all of `docs/`,
`packages/core/src/resolution.ts`, `exchange/open/2026-09-19-002-blindspot-adr-spec-drift.md`, and
`team/decider/knowledge/2026-dialecta-open-decisions.md`. Read 2026-09-20.

## Summary

`drift-map.md` F1 already established that the four percentages (AI 40%, community voting 35%,
self-declaration 15%, Stage 2.5 response quality 10%) appear in no spec under `docs/`, and that
the nearest spec statement, `Dialecta_Article_Editorial_Template.md`'s "Weight in the Algorithm,"
is ordinal only and explicitly lists the precise weight as an open calibration question. This note
answers the reading list's actual question, where the numbers came from, as far as the record in
this repo goes.

**They did not come from a spec, and the repo already knows it.** I filed the blindspot that
flagged this in the prior sprint (`exchange/open/2026-09-19-002-blindspot-adr-spec-drift.md`),
asking `decider` directly: are the four classification weighting percentages a decision Dan made
that never reached a spec, or a figure that entered root `CLAUDE.md` by inference. That record is
still open; no answer has landed.

**They are now load-bearing code, not just a locked-decisions bullet.**
`packages/core/src/resolution.ts` implements `resolveFinalTier()` with `RESOLUTION_WEIGHTS = {
ai: 0.4, community: 0.35, self: 0.15, stage25: 0.1 }`, and its own doc comment cites the source
precisely: "Locked weighting (CLAUDE.md, 'Classification weighting')." So the numbers' only
traceable origin, in this repo, is root `CLAUDE.md` itself; the code is honest about that and does
not claim a spec behind it. The algorithm built around the numbers, express each present signal as
a probability distribution over the seven tiers, combine by weighted sum over only the signals
that are present, argmax with ties going to the AI tier, exists nowhere in prose. No document
describes "argmax with an AI tie-break" or "absent signals drop out rather than dilute the sum."
That design is `resolution.ts`'s alone.

**The weighting's fourth input has no home on the comment side.** `stage25Quality` is one of
`resolveFinalTier`'s four inputs, and the code comment says it "backs the self-declared tier." But
`docs/Dialecta_Discourse_Layer_UX.md`, the spec that owns the comment lifecycle, has no Stage 2.5
at all, confirmed by direct grep (zero matches for "2.5" in the whole file; its three stages are
Write and Analyze, AI Reflection and Self-Declaration, Posted). The only Stage 2.5 in `docs/`
belongs to `Dialecta_Article_Editorial_Template.md`, and it is article-scoped by that document's
own framing throughout. `team/builder/knowledge/reading-list.md` already flags this exact gap as a
`todo` lead of builder's own. So the fourth of four locked weights is for an input that has no
comment-side spec describing how it would even be captured.

**Where the open-decisions record stands.** `team/decider/knowledge/2026-dialecta-open-decisions.md`
treats backlog row A-D1 (community re-review threshold, and whether community alone may outweigh
AI) as the live decision, and names `philosopher` as the advisor with the strongest claim on it
"because it moves the locked 40/35/15/10 weighting, which is a founding commitment." That phrase
treats the weighting as settled and Dan-originated. It is not sourced to anything beyond the same
`CLAUDE.md` line this note traces, and A-D1 is a different question, the re-review threshold, not
the weighting's own provenance. The provenance question in the blindspot record remains unanswered
by anyone.

## Implies for Dialecta

- The honest answer to where the weighting came from: nowhere in `docs/`, confirmed independently
  a second time this sprint. It is a `CLAUDE.md` locked decision with no spec behind it (a real
  instance of the case `drift-map.md` F1 already named), it is now implemented in
  `packages/core/src/resolution.ts` citing `CLAUDE.md` as its only source, and the resolution
  algorithm itself, not just the numbers, has no prose spec anywhere. Whether Dan intended the
  numbers as a founding commitment or they entered the doc by inference is still genuinely unknown
  from this repo; only Dan or a dated record outside it could answer that half of the question, and
  I will not infer one.
- Addended to `exchange/open/2026-09-19-002-blindspot-adr-spec-drift.md` this sprint with the
  `resolution.ts` evidence, since it directly bears on the open question posed there to `decider`.
- If `Dialecta_Discourse_Layer_UX.md` ever gains a Stage 2.5 (builder's own reading-list lead),
  `resolveFinalTier`'s `stage25Quality` input would finally have a spec-side source. Until then,
  that quarter of the locked weighting resolves an input the comment spec does not produce.

*Filed 2026-09-20.*
