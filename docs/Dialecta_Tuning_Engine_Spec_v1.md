# Dialecta — Tuning Engine Spec v1
*A hidden admin page that surfaces the platform's tunable parameters, shows analytics on how each is performing, and lets the operator dial values as data accumulates.*
*Version 1.0 — 2026-04-29*

---

## Why this exists

The platform makes many subjective judgments: which tier a comment is, which axes a comment touches, which articles climb the Hot ranking, when an archetype shift counts as a real shift versus noise. Each judgment is governed by thresholds, weights, and prompts that are educated guesses on day one. As real comments and real authors accumulate, the disagreement between the platform's judgments and the contributors' judgments becomes the most valuable signal for tuning the engine.

The Tuning Engine page is where that signal becomes legible. Every constant in the codebase marked with a `// TUNING:` comment surfaces here, paired with the analytics that show how it's currently performing.

---

## Foundational pattern: user-rejection-as-signal

Whenever the platform makes a judgment a user can override, the diff is a calibration signal. The Tuning Engine's first job is making those diffs visible per knob.

Examples:
- `self_declared_tier ≠ ai_suggested_tier` — tier engine miscalibration on specific boundaries
- `borderline_flag` correlation with actual user overrides
- `core_claim_detected` vs author's declared `core_claim` — extraction quality
- `opposing_view_engaged` vs author's "Strongest Objection" declaration — same loop at the article level
- Future: archetype-shift triggers vs user dismissals
- Future: Hot-ranked articles vs reader engagement

Each becomes a panel: the metric, the recent trend, the specific examples, the relevant knob.

---

## Architecture

**Page:** `/tuning/` — gated by an `is_admin` flag on profiles (or a hardcoded list of member_ids for v1, before the flag exists).

**Pattern:** mirrors the Quotes page (existing precedent for an editorial admin surface). Single React mount, fetches its own data, no special auth besides the admin gate.

**Data sources:**
- `axis_events`, `classifications`, `articles`, `comments`, `feed_events` — Supabase reads for analytics
- A `tuning_config` table (new) — holds the live values of each tunable knob, falls back to code-level defaults when a row is absent. Allows operator changes without a redeploy.

**Knob lifecycle:**
1. Code defines a default constant with a `// TUNING:` annotation.
2. Tuning Engine reads from `tuning_config` first; falls back to the code default.
3. Operator changes a value via the admin UI; the change writes to `tuning_config`.
4. Production code reads the new value on next request (no redeploy).
5. A "preview against historical data" view shows what the change would have done.

---

## Panels (priority order for v1 build)

### 1. Tier Engine Calibration

The foundational panel. For each tier boundary (Echo/Spark, Spark/Forum, Heat/Stance, etc.):

- Disagreement rate: % of comments where `self_declared_tier ≠ ai_suggested_tier` for this boundary
- Direction: do users systematically declare HIGHER or LOWER than the AI?
- Drilled examples: 10 most recent overridden comments at this boundary, body + AI tier + user tier + classifier reasoning
- Knobs: per-boundary prompt language (links out to `api/classify.js` line numbers); `borderline_flag` threshold; specificity_score threshold for each tier

Drives the next prompt-sharpening pass.

### 2. Hot Ranking

Tier weights from `index.jsx` `useProfileFeed` / `_feed` endpoint:
- Per-tier weight (Forum=5, Spark=3, Echo=1, Fog=0, Heat=-1, Stance=-2, Breach=-100)
- `SCORE_JITTER` magnitude (1.5)
- Recency vs Hot balance

Panel renders the live ranking of the last 20 articles under current weights, with a "preview under different weights" toggle.

### 3. Axis Mapping

The constants from `Dialecta_Axis_Mapping_v1.md`, exposed as adjustable values:
- Acuity specificity threshold
- Reach topic source
- Calibration emotion gate (currently none)
- Magnanimity yes-vs-partially weight
- Discourse 'general' engagement credit
- Consistency decay function

Preview view: "what would my Fingerprint look like under different rules" — replay the axis_events ledger for a chosen contributor under proposed alternative rules.

### 4. Wait Windows

Comment compose ritual:
- 8s pre-reflection
- 12s Stage-2.5 lock
- 60-min malleability

Panel shows completion rate at each step (drop-off analytics) and the median time-to-edit / time-to-delete within the malleability window. Drives "is the pacing right" decisions.

### 5. Polish Engine (future)

Length-calibrated intervention budget tiers, per-type suggestion caps, pullquote distribution rules. Already TUNING-marked in `api/article/aesthetic-suggest.js`.

### 6. Feed Events Triggers (future, depends on event volume)

- First-Forum-comment threshold
- Sparring Partner detection (currently 5 articles with mutual replies)
- Archetype-shift sensitivity
- Fingerprint milestone thresholds

Panel sits idle until enough activity to make these meaningful.

---

## Implementation cadence

**v1 (build first):** Tier Engine Calibration panel. Highest signal for engine improvement. Other panels can stub.

**v2:** Hot Ranking + Axis Mapping panels. The two surfaces with the broadest behavioral consequences.

**v3:** Wait Windows analytics, Polish Engine, Feed Events. These are higher-noise, lower-signal until activity volume is up.

**Stretch:** scheduled background agents that surface "knobs that need attention" — e.g., "tier boundary X has 40% disagreement this week, drill in" — so the operator doesn't need to inspect every panel manually.

---

## Inline annotation convention

Every tunable constant in the codebase gets a `// TUNING:` comment naming the knob and any relevant range:

```js
// TUNING: Acuity specificity threshold (Dialecta_Axis_Mapping_v1)
const ACUITY_SPECIFICITY_MIN = 1;
```

Grep `// TUNING:` across the repo to discover knobs ready for the panel. The `_axis-mapping.js` helper is the canonical example.

When a knob graduates from constant to `tuning_config` row, the comment updates:

```js
// TUNING: Acuity specificity threshold — overridable via tuning_config.acuity_specificity_min
```

---

## What this is NOT

- Not a feature-flag system. Knobs are quantitative tunings, not on/off feature toggles.
- Not a CMS. Content lives in Ghost / Supabase tables; the Tuning Engine touches numerical and prompt parameters.
- Not user-facing. Hidden admin surface only. The platform's behavior changes; the platform doesn't expose its knobs.

---

## References

- `project_tuning_engine.md` (memory file) — original design intent
- `Dialecta_Axis_Mapping_v1.md` — first formal canonical spec with TUNING knobs
- `api/article/aesthetic-suggest.js` — existing TUNING-annotated knobs (length budgets, suggestion caps, distribution rules)
- `index.jsx` `useProfileFeed` / `_feed` — Hot ranking weights, marked TUNING
- `api/classify.js` — tier-engine prompt (the deepest knob)

*Authored 2026-04-29. The Tuning Engine itself is queued; this spec is the charter for when it's built.*
