# Dialecta — Activity Rhythm View
*Patterns of When and How a Contributor Shows Up, Without Prescription*
*Version 1.0 — April 2026*

---

## Purpose

This document specifies the **Activity Rhythm View** — the Growth Layer feature that surfaces patterns in how a contributor engages with the platform over time. Per `Dialecta_Growth_Layer_Principles.md`, the Rhythm View is one of two "Seeing" features (paired with the Self-Snapshot Engine) that compose the contributor's understanding of where they currently are.

Where the Self-Snapshot Engine answers *who you are becoming as a communicator*, the Activity Rhythm View answers *when and how you show up*.

The two features are operationally distinct but conceptually paired. Both must be reachable from the same surface, and both must obey the same trustee framing.

---

## The Foundational Principle

The Rhythm View must show patterns without prescribing what to do about them. The interpretive work belongs to the contributor, not the platform.

This is the constraint per `Dialecta_Growth_Layer_Principles.md` line 113:
> *"Activity Rhythm View must be user-private by default, with any sharing or display being a deliberate user choice. It must show patterns without prescribing what to do about them."*

The Rhythm View is a mirror. The contributor decides what their reflection means.

---

## What It Shows

The Rhythm View renders the contributor's engagement patterns across multiple dimensions. The dimensions worth surfacing for Phase 1:

1. **Temporal cadence**
   - Time of day they tend to comment
   - Day of week distribution
   - Activity intensity over weeks/months (heatmap-style)

2. **Topic distribution**
   - Which topics they engage with most often
   - How topic distribution has shifted over time
   - Topics they have written about once vs. consistently

3. **Tier distribution over time**
   - Their tier mix this month vs. last month vs. all-time
   - Whether the mix is shifting toward Forum/Spark or away

4. **Discourse cadence**
   - Average length of comment threads they participate in
   - Ratio of original comments to replies
   - Time between comments in a thread (how quickly they respond)

5. **Engagement breadth**
   - Number of distinct articles engaged with per week/month
   - Concentration vs. spread (do they go deep on one piece or wide across many)

6. **Quiet periods**
   - Gaps in posting cadence, displayed honestly without judgment
   - Returns from quiet periods are visible (often a meaningful moment)

---

## What It Does Not Show

Equally important — what the Rhythm View must **never** do:

- **No scoring.** No "engagement score," no daily/weekly target, no streak counter framed as progress.
- **No comparison to other contributors.** Not even anonymized. The rhythm is the contributor's, full stop.
- **No prescription.** No "you should comment more," no "your activity has dropped — try posting today."
- **No "ideal" benchmark.** No platform-defined optimal cadence. Rhythm is descriptive, not normative.
- **No notification triggers based on pattern detection.** The Rhythm View does not hunt the contributor down. It is a place the contributor goes to look at themselves.

These constraints are what distinguish the Rhythm View from every analytics dashboard on every other platform.

---

## Visual Treatment

The Rhythm View is a quiet visualization. Possible primary treatments:

- **Calendar heatmap** for temporal cadence (similar to GitHub's contribution graph, but without the implicit "more is better" framing — color intensity must read as descriptive, not as approval)
- **Stacked area chart** for tier distribution over time
- **Treemap or sparkline grid** for topic distribution
- **Timeline ribbon** for discourse cadence (each thread is a horizontal segment showing the contributor's contributions within it)

The visual register should feel closer to the Growth Scroll's archival/observational treatment than to a dashboard. **Cinzel and IM Fell English** (the Growth Scroll's typography) may be appropriate here too — the Rhythm View is part of the same archival journal aesthetic.

The view is private by default. When a contributor opts to share part of it (e.g., as part of their public profile), the shared view should preserve the descriptive register and never expose data the contributor hasn't explicitly chosen.

---

## Privacy & Visibility

**Default visibility: private.** The Rhythm View is the contributor's mirror, not their public face. Most patterns the view shows would be inappropriately granular to expose publicly.

**Optional public surfaces** the contributor can choose to expose:
- Aggregate cadence indicator on public profile (e.g., "active over the past 30 days" — binary, not a score)
- Topic distribution summary if the contributor wants to communicate their interest landscape

**Always private:**
- Specific time-of-day patterns
- Quiet-period detail
- Comment-by-comment cadence within threads

The Pact onboarding includes the Rhythm View privacy model so consent is informed.

---

## Data Sources

The Rhythm View does not require new entities. It composes from existing data:

| Pattern shown | Data source |
|---|---|
| Temporal cadence | `comments.created_at` + `comments.published_at` |
| Topic distribution | `comments.article_id` joined to article topic tags |
| Tier distribution | `classifications.final_tier` joined to comments |
| Discourse cadence | `comments` parent/child reply structure (thread participation) |
| Engagement breadth | `comments.article_id` distinct counts per time window |
| Quiet periods | gaps in `comments.published_at` for the contributor |

All computations are read-only against existing tables. No new schema additions.

---

## Integration with Other Growth Layer Features

- **Paired with the Self-Snapshot Engine:** the two "Seeing" features surfaced together. Likely a single profile section with two tabs or two side-by-side panels.
- **Upstream of the Aspiration Tool:** a contributor reviewing their rhythm patterns may notice something they want to change — and that noticing is the precondition for declaring an Aspiration. The Rhythm View does not prompt aspiration declarations directly (per the no-prescription constraint), but it creates the conditions in which a contributor naturally moves toward one.
- **Independent of the Practice Layer:** even with Practice Layer deferred to Phase 4+, the Rhythm View functions fully — it is observational and does not depend on coaching mechanics.
- **Visible alongside the Growth Scroll:** rhythm patterns over the same time periods that the Growth Scroll snapshots cover. The two visualizations together give the contributor *what they did* (rhythm) and *what shape it produced* (snapshots).

---

## Open Questions

1. **Time window defaults.** What time windows does the Rhythm View show by default? Likely a "last 30 days" + "last 12 months" + "all time" tabbing pattern. Refine through use.
2. **Visualization library.** Likely D3.js or Observable Plot for the calendar heatmap and timeline ribbon. Decision deferred to build session.
3. **Bootstrap state.** A new contributor with one or two comments has no rhythm to show. The view should render gracefully — perhaps a single welcome line acknowledging that rhythm becomes legible after a few weeks of activity.
4. **Active sharing flow.** When a contributor opts to share part of the Rhythm View on their public profile, what does the sharing flow look like? Likely a granular per-pattern toggle, defaulting to most-restrictive. Needs UX design.
5. **Cross-references in feed.** Should rhythm anomalies (a long quiet period followed by a return, an unusually concentrated burst on one topic) be allowed to surface as Identity Events in the feed? **Default proposal: no.** The Rhythm View is the contributor's private mirror; feed surfacing would violate the no-surveillance constraint per `Dialecta_Social_UX_Architecture.md` Risk 3 ("Recognition vs. Surveillance"). The contributor can manually share patterns if they choose.

---

## Relationship to Other Documents

- **`Dialecta_Growth_Layer_Principles.md`** — establishes the no-prescription, user-private-by-default constraints. Constraining reference.
- **`Dialecta_Self_Snapshot_Engine.md`** — paired Seeing feature.
- **`Dialecta_Social_UX_Architecture.md`** — Risk 3 (Recognition vs Surveillance) is the principle that keeps the Rhythm View from becoming an activity feed.
- **`Dialecta_Data_Architecture.md`** — all rhythm computations read from existing entities; no schema additions required.

---

*Version 1.0 — April 2026*
*Companion documents: `Dialecta_Self_Snapshot_Engine.md`, `Dialecta_Growth_Layer_Principles.md`*
