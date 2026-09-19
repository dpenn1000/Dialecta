# Dialecta — Axis Mapping v1.1
*Canonical function from Stage A classification data to axis_events and axis_scores. Closes the "currently illustrative in the prototype" gap in Contributor Identity v1.1 line 164.*
*Version 1.1 — 2026-04-29 (article-side mapping added)*

---

## Purpose

The Six Pillars of Intellectual Character (Acuity, Reach, Calibration, Magnanimity, Discourse, Consistency) compose the Living Fingerprint. Each comment a contributor posts can produce between 0 and 6 records in the immutable `axis_events` ledger. The exact rule for which axes are touched and how — what counts as a graduation, what records as tier_mix, what produces no event — is the canonical mapping defined here.

This spec replaces the "currently illustrative" placeholder in Contributor Identity v1.1 with a real, implemented, tunable function. Every value below marked **TUNING** is a knob the future Tuning Engine page will expose.

---

## Per-axis triggers

| Axis | Trigger condition | Graduation delta | Notes |
|---|---|---|---|
| **Acuity** | `specificity_score >= 1` AND `final_tier ∈ {forum, spark}` | +1 | Specificity 2-3 weights heavier in tier_mix; graduation count is +1 regardless. **TUNING:** specificity threshold (currently `>= 1`); per-score weight scheme |
| **Reach** | `primary_tag` of the comment's article is a topic this member hasn't engaged before | +1 | Same topic later → no event. Tracks engaged topics in member's `axis_events` history (replay) or per-member topic cache. **TUNING:** what counts as "topic" (primary_tag vs declared opinion_axes vs all tags) |
| **Calibration** | `specificity_score >= 1` AND `tribal_markers === false` | +1 | Emotion is *not* gated — passion-with-substance is calibrated. The anti-signal is tribal framing. **TUNING:** does emotion play any role; tribal_markers strictness |
| **Magnanimity** | `opposing_view_engaged ∈ {yes, partially}` | +1 either way | "Honest effort counts" — partial engagement still earns. tier_mix differentiates. **TUNING:** weight differential between yes and partially |
| **Discourse** | `article_engagement === 'specific'` | +1 | Future: replies to other comments add additional Discourse graduations once threading ships in Phase 2.5. **TUNING:** does 'general' engagement earn partial credit |
| **Consistency** | Every non-Breach comment | +1 | The act of returning to the conversation IS the signal. **TUNING:** decay function (currently none — graduations count forever) |

---

## Universal rules

1. **Breach** comments produce **no axis_events at all**. They are suppressed by design and don't shape identity.
2. **Echo / Fog / Heat / Stance** still earn Consistency (presence). Echo additionally earns Discourse if `article_engagement === 'specific'` (you said agreement to *this article*, not just floated past). They earn nothing on Acuity, Calibration, Magnanimity unless their classification meets those triggers — which by definition for Echo/Fog/Heat/Stance, it usually doesn't (no specific claim, or tribal framing, or no opposing view engaged).
3. **Forum and Spark** earn the same +1 per triggered axis. Tier_mix tells the visual story (Forum-heavy fingerprints render differently from Spark-heavy ones).
4. **Every triggered axis** records the comment's `final_tier` in tier_mix. So a Heat comment shows up in Consistency's tier_mix even though it added no precision graduations — the fingerprint is honest about your full history.
5. **Graduations count forever** in the score. Display-side rendering may fade older ones; the ledger does not decay. **TUNING:** future decay function for display only.
6. **Re-classification on edit** (the malleability window): when a comment is edited within its 60-min window and re-classified, prior axis_events for that classification are superseded — the new classification's axis_events become canonical. Implementation: delete prior axis_events with the same `classification_id` before appending the new ones.

---

## Worst-case examples (to test the mapping)

### Forum comment with full engagement

`final_tier=forum, specificity_score=3, tribal_markers=false, opposing_view_engaged=yes, article_engagement=specific, article.primary_tag='economics' (member's first economics comment)`

→ 6 axis_events: Acuity +1, Reach +1, Calibration +1, Magnanimity +1, Discourse +1, Consistency +1. Maximum graduation per comment. tier_mix on each: forum +1.

### Echo comment that engages the article

`final_tier=echo, specificity_score=0, tribal_markers=false, opposing_view_engaged=no, article_engagement=specific, primary_tag already in member's history`

→ 2 axis_events: Discourse +1, Consistency +1. tier_mix: discourse.echo +1, consistency.echo +1.

### Heat comment

`final_tier=heat, specificity_score=0, tribal_markers=false, opposing_view_engaged=no, article_engagement=general`

→ 1 axis_event: Consistency +1. tier_mix: consistency.heat +1.

### Stance comment with new topic

`final_tier=stance, specificity_score=1, tribal_markers=true, opposing_view_engaged=no, article_engagement=general, primary_tag is a new topic`

→ 2 axis_events: Reach +1, Consistency +1. (Reach fires because the topic is new; Acuity/Calibration both gate on tribal_markers=false, so neither fires.) tier_mix: reach.stance +1, consistency.stance +1.

### Breach comment

→ 0 axis_events. Suppressed entirely.

---

## Scoring (axis_scores recomputation)

After each comment's axis_events are appended, axis_scores is recomputed by replaying the ledger for that contributor:

```
For each axis a in [acuity, reach, calibration, magnanimity, discourse, consistency]:
  graduation_count = COUNT(axis_events WHERE member_id=X AND axis=a)
  tier_mix = aggregate(axis_events.tier WHERE member_id=X AND axis=a)
  topic_phases = aggregate(axis_events.topic WHERE member_id=X AND axis=a) [for Reach especially]
  Update axis_scores row for (X, a)
```

Per Data Architecture: *"recomputed from the axis_events ledger after each event — never accumulated incrementally — which eliminates floating-point drift and keeps the materialized state honest."*

---

## Articles → Author Fingerprint (added v1.1)

Authors publishing articles shape their Fingerprint just like commenters do, with the same triggers minus Discourse. An article and a comment both produce up to 5-6 axis_events apiece; the author's published work is no less identity-shaping than their conversation.

| Axis | Article trigger | Same as comments? |
|---|---|---|
| **Acuity** | `ai_analysis.specificity_score >= 1` AND `final_tier ∈ {forum, spark}` | ✅ Same |
| **Reach** | Article's `primary_tag` is a NEW topic for this author | ✅ Same |
| **Calibration** | `ai_analysis.specificity_score >= 1` AND `ai_analysis.tribal_markers === false` | ✅ Same |
| **Magnanimity** | `ai_analysis.opposing_view_engaged ∈ {yes, partially}` | ✅ Same — and articles have an explicit "Strongest Objection" declaration which is exactly this signal |
| **Discourse** | **NOT triggered by articles** | ❌ Different |
| **Consistency** | Article published (non-Breach) | ✅ Same — publishing IS showing up |

**Why Discourse is off for articles:** Discourse measures *sustained back-and-forth* per Contributor Identity v1.1. Articles START conversations rather than continuing them. Authors who write substantive long-form but never comment will have low Discourse, which is honest about their pattern: they produce, they don't converse.

**Schema:** `axis_events` carries a `source` discriminator (`comment` | `article`). Article events have `article_id` (ghost_post_id) populated and `comment_id` / `classification_id` null. Migration 015 added the columns + a CHECK constraint enforcing the discriminator.

**Hook:** `api/article/publish.js` Step 5 derives + inserts events + recomputes axis_scores after a successful publish. Drafts don't trigger; only published articles count.

**Re-publish / edit:** Initial publish only in v1. Subsequent Ghost-side edits don't re-trigger the derivation. Edge case, low concern.

**Per-article weight:** Currently uniform +1 per axis (same as comments). **TUNING:** future per-article weight (e.g., +N graduations per article) revisits this once data shows whether articles are systematically under-counted relative to their effort.

---

## What's NOT in v1

- **Decay function.** Older graduations don't fade in the score. Display layer may fade visually; that's a rendering choice.
- **Reply-driven Discourse boost.** Threading ships in Phase 2.5; until then, Discourse only counts via `article_engagement`.
- **Cross-axis bonus.** No "this comment was so good it earns more on Calibration." Each axis is binary +1 per triggered comment in v1; tier_mix carries the texture.
- **Article re-classification on edit.** When a Ghost post is edited after publish, axis_events for that article are not re-derived. v2 work.
- **Per-article weighting.** Articles earn the same +1 as comments per axis. Worth revisiting once data shows the disparity.

---

## Tuning knobs (consolidated for the future Tuning Engine page)

| Knob | Current value | Tunable range / consideration |
|---|---|---|
| Acuity specificity threshold | `>= 1` | Could raise to `>= 2` if Forum-only is wanted |
| Acuity tier_mix weight by specificity | uniform +1 | Could weight 1, 2, 3 differently |
| Reach topic source | `primary_tag` | Could expand to all tags or declared opinion_axes |
| Calibration emotion gate | none | Could add a high-emotion + low-specificity exclusion |
| Calibration tribal_markers strictness | binary block | Could weight tribal_example severity |
| Magnanimity yes vs partially weight | both +1 | Could make partially +0.5 or +0 |
| Discourse 'general' engagement | no event | Could earn +0.5 or +1 |
| Consistency decay | none | Could half-life by N months idle |
| Per-axis floor for archetype assignment | undefined | Likely a minimum graduation threshold per axis |

---

## References

- `Dialecta_Contributor_Identity.md` v1.1 — pillar definitions
- `Dialecta_Data_Architecture.md` — axis_events / axis_scores table shape, recomputation rule
- `api/_axis-mapping.js` — implementation (the canonical helper that turns this spec into code)
- Future: `Dialecta_Tuning_Engine_Spec_v1.md` — the page that exposes these knobs

*Authored 2026-04-29. Updates require a version bump and a corresponding migration if the rules change in a way that affects historical scoring.*
