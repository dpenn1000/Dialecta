# Axis Mapping v1.1: the rules survive Ghost, and the shipped code already diverged further than that

**Source:** `docs/Dialecta_Axis_Mapping_v1.md`, version 1.1, 2026-04-29. Cross-checked against
`packages/core/src/axis-mapping.ts` (136 lines) and `docs/plans/backlog.md` row B-1. Read
2026-09-20.

## Summary

The spec is the canonical function from Stage A classification data to `axis_events` and
`axis_scores`: six per-axis trigger conditions (Acuity, Reach, Calibration, Magnanimity,
Discourse, Consistency), six universal rules (Breach produces no events, Echo/Fog/Heat/Stance
earn Consistency only, Forum and Spark earn the same +1, every triggered axis records tier_mix,
graduations count forever, re-classification on edit supersedes prior events), five worked
examples, the replay-based scoring loop, an Articles-to-Fingerprint mapping added in v1.1, a
"What's NOT in v1" list, and nine tuning knobs.

**The reading list's actual question, answered.** Two citations in the spec are Ghost-era
plumbing and do not survive ADR-001/ADR-003: the Schema note that `axis_events.article_id` is
`ghost_post_id` (line 102), and the Hook note that `api/article/publish.js` Step 5 derives the
events (line 104). `api/` is root `CLAUDE.md`'s own "legacy Vercel functions, frozen until
apps/web replaces them," and `api/_axis-mapping.js`, the file this spec cites as "the canonical
helper," is confirmed absent from this repo by root `CLAUDE.md` itself ("Not present on
studio-pc"). Everything else in the spec, the six trigger conditions, the six universal rules,
the worked examples, the replay algorithm, and the tuning knobs, is stack-agnostic: it describes
a function from classification fields to per-axis deltas and never depends on Ghost, Vercel, or
any specific schema beyond the fields the classification itself already produces.

**What the rules survive into.** `docs/plans/backlog.md` row B-1 targets `core/axis-mapping.ts`,
not `api/_axis-mapping.js`. That file exists: `packages/core/src/axis-mapping.ts`, with a
companion `packages/core/test/axis-mapping.test.ts`. It carries zero references to Ghost,
`article_id`, or `comment_id` (grepped in full). So the Ghost-plumbing question the reading list
asked about is already moot in the place the rebuild actually lives: the port never carried the
dead fields forward.

**What the port did instead, and it is a bigger finding than the plumbing question.** The shipped
`axisDeltasFor()` does not implement the spec's trigger table. It implements a different scoring
scheme entirely:

| Axis | Spec (binary, gated) | Code (continuous, ungated) |
|---|---|---|
| Acuity | `specificity_score >= 1 AND final_tier in {forum, spark}` gives +1 | `{0: 0, 1: 0.25, 2: 0.75, 3: 1}` keyed on specificity alone, no tier gate |
| Reach | New topic for the member (`primary_tag` novelty) gives +1 | 0.5 for `article_engagement === 'specific'`, plus 0.5 for `opposing_view_engaged`. No topic tracking at all |
| Calibration | `specificity_score >= 1 AND tribal_markers === false` gives +1 | 0.5 for `opposing_view_engaged`, plus 0.5 for `!tribal_markers`. Specificity dropped, opposing-view added |
| Magnanimity | `opposing_view_engaged` yes or partially gives +1 either way | 0.5 for `opposing_view_engaged`, plus 0.5 for `emotion !== 'high'`. The yes/partially weight distinction is gone, an emotion gate is new |
| Discourse | `article_engagement === 'specific'` gives +1 | Keyed on tier: forum/spark = 1, echo = 0.5, else 0. Article engagement is not read at all |
| Consistency | Every non-Breach comment gives +1 | Hardcoded 0, with a comment that it "needs history" and is "computed in the replay step once that rule exists" |

Every axis differs, not just in weighting but in which input fields drive it. This is independent
of the Ghost question: even on a codebase with no Ghost history at all, `axisDeltasFor()` would
not reproduce what `Dialecta_Axis_Mapping_v1.md` describes. The code is internally consistent and
its own comments mark every constant `TUNING`, so this reads as a deliberate "simplest defensible
version" rewrite rather than a bug, but no version bump or spec note records it, and the spec's
own instruction is explicit: "Updates require a version bump... if the rules change in a way that
affects historical scoring." Consistency hardcoded to 0 is the sharpest case: the spec's rule for
it is the simplest of the six ("every non-Breach comment"), and the code is the only axis of the
six not implemented at the per-event level yet.

## Implies for Dialecta

- The Ghost-plumbing separation the reading list asked for exists in practice: the two dead
  citations are lines 102 and 104 of the spec, nothing else in it, and the port already left them
  behind. A builder can cite the trigger table and universal rules directly; only those two lines
  need the caveat "superseded, do not port."
- The bigger fact for anyone building against `axis-mapping.ts` today: read the code, not the
  spec, for what the platform currently does. The spec is what was designed; the code is a
  different, simpler design that shipped without a matching spec update. Both are real; they are
  not the same function.
- `packages/core/test/axis-mapping.test.ts` exists and presumably tests the code's actual
  behavior, which means the test suite is validated against the divergent version, not the spec's
  version. Worth a migrator or builder check on whether that is understood as intentional.
- This belongs in `drift-map.md` as a new case: not an ADR override, not retired vocabulary, but a
  spec whose own implementation quietly replaced its rules. Added to the map's addendum this
  sprint (section I).

*Filed 2026-09-20.*
