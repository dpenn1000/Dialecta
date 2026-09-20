# Opinion-Mapper · Tuning Queue (toward v2.5)

Living list of observed failure modes, proposed skill edits, and calibration
test cases. Compiled from author/admin smoke-tests after each skill version.
The next focused tuning pass will draw from this file; interim observations
get appended here rather than ad-hoc skill edits.

**Current shipped version:** 2.4.0 (2026-05-03 — candidate_maps reordered to
first JSON field, target count 4 → 3, accepts max_candidates override).

**Status:** queued for v2.5. No active edits in flight.

---

## Observation log

Each entry: **what we saw**, **why it's a problem**, **proposed skill
treatment**. Entries are pre-decision — the v2.5 pass will choose which
to act on and how.

### 1. Politically-loaded poles slip through the fairness test

**Seen 2026-05-03:** Article on universal education / global poverty.
Recommended ternary topic was *"What gets kids out of poverty?"* with poles
**Free schools / Good jobs / Strong families**.

The "Strong families" pole carries political loading (it reads as a
right-leaning trope) that a reader with progressive politics would feel as
the model tipping its hand against them — the inverse of the fairness test.
The pole isn't wrong as a stance, but the *framing* is loaded.

**Why current rules don't catch it:**
- 18-year-old test passes (clear, plain English)
- Mutual-exclusivity passes (three real causal claims)
- Author-tilted check is about which view the *author* endorses, not about
  which side a *reader* is keyed to politically

**Proposed treatment for v2.5:** Add a 4th pole test — the **"both sides
recognize themselves" test** — beyond the existing fairness test. Phrase it
as: *for each pole, ask whether a reader who holds that stance would
recognize themselves on first read AND whether a reader who disagrees would
feel the pole was named without political coding.* Add an explicit list of
loaded framings to avoid as poles when neutral alternatives exist:
"strong/traditional families," "real Americans," "common sense," "elite,"
etc. Not a forbidden list — these can appear if the article is explicitly
about them — but a yellow-flag list to consider rephrasing.

---

### 2. Binary chosen when a real third position was available

**Seen 2026-05-03:** Same education article. Picker also surfaced a binary
**"Should education be free for everyone?"** with poles *Free for all / Pay
your way*. The obvious third position — **subsidized / sliding-scale /
means-tested** — was missing. The binary stretched a debate that the
article's domain itself supports as ternary.

**Why current rules don't catch it:**
The shape-preference rule says *"ternary preferred, do not force."* But the
model interpreted "do not force" as permission to settle on binary the
moment it found two clean stances, without actively looking for a third.

**Proposed treatment for v2.5:** Add a **"third-stance check"** before
committing to binary. Phrase it as: *before producing a binary candidate,
explicitly ask: is there a real third stance the article does not take a
side on (a hybrid, a phased approach, a means-tested middle, a "depends
on context" that names the context)? If yes, lift to ternary. Binary is
last resort, not default fallback.*

Companion pattern: a small set of recognized "real third positions" that
commonly hide between binary framings, as inspiration only — not poles to
copy:
- Funding questions: "subsidized / sliding-scale / means-tested"
- Reform questions: "phased / pilot-then-scale"
- Identity questions: "context-dependent / situational"
- Policy questions: "local control / federalist middle"

---

### 3. Synthesis poles ("a bit of both") — partially addressed v2.3.0

**Status:** v2.3.0 added the synthesis-pole prohibition + a regex-based
validator that catches obvious patterns. Smoke-tested clean across the
five article foundations.

**Watch for in v2.5 testing:** subtler hedge framings the regex doesn't
catch: "context matters," "all of the above," "depends," paraphrases of
"both" using different vocabulary. If we see one slip through, add to the
detector pattern list.

---

### 4. Cerebral / jargon poles — addressed v2.0 → v2.1

**Status:** v2.1.0's topic-as-question + 18-year-old test enforcement
appears to have eliminated the original "Faith and Scale" / "Economic
model × Implementation scope" failure mode. Five-article smoke test
returned clean output across the board.

**Watch for in v2.5 testing:** if testing reveals new jargon-y output,
the existing forbidden-patterns list in "What a pole is NOT" can extend.

---

### 5. Topic must be a question — addressed v2.1.0

**Status:** v2.1.0 mandates topic ends in `?`, validator enforces.
Working as intended on the smoke test set. No regressions observed.

---

### 6. Latency, not a skill issue but worth tracking

Adaptive thinking on Opus 4.7 takes 30-180s for a 7-15K-char article.
Not addressable via prompt; would require model swap or async
architecture. v2.4.0's reorder of candidate_maps to first field
unlocked SSE streaming so the picker can render candidates incrementally
(client-side mitigation). Editor migration to streaming still pending.

---

## Calibration test set

Five article foundations + selected production articles. After each skill
edit, re-run smoke tests against this set and compare output vs. expected
shape. Articles live in `OneDrive\Websites\Dialecta\Write Layer\Articles\`.

| Article | Expected primary shape | Calibration concern |
|---|---|---|
| We Become What We Inhabit | ternary on environment vs character vs awareness | Should NOT include "both matter" pole |
| The Conversation Is Doing Something to You | ternary on what forms character | Watch the responsibility-tension second-debate question |
| On the Far Shore of Fear | ternary on what humans reach for under post-scarcity | Multi-themed; should not force two maps |
| dialecta-article-01-machine | ternary on what's making us angrier | Watch for political loading in poles |
| dialecta-article-02-divided | ternary on what's polarizing us | Already-explicit research framing — should land cleanly |
| (production) Move-house essay | ternary on what wakes you up | Author-position should weight inner waking; saw "A bit of both" creep in pre-v2.3 |
| (production) Universal education | ternary on funding (with subsidized middle) | The 2026-05-03 binary failure that motivates §2 above |

---

## Process notes

- **Append observations here as you find them**, with date + context. Don't
  edit SKILL.md mid-conversation; let observations accrue and choose a
  coherent v2.5 treatment in one focused pass.
- **One skill version per coherent change set.** v2.0 → v2.1 (topic-as-
  question) → v2.2 (multi-candidate) → v2.3 (synthesis prohibition + shape
  preference) → v2.4 (reorder + count). Each version solved a thematic
  problem; v2.5 should be the same.
- **Test before deploying**: smoke-classify.mjs against the calibration set
  before promoting a new version. The script is at
  `scripts/smoke-classify.mjs`; takes 4-6 minutes for the 3 short articles,
  ~10 for the full 5.
