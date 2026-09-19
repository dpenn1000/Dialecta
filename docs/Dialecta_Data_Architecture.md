# Dialecta — Data Architecture
*The Ground Truth Document for Storage, Computation, and Data Flow*
*Version 1.0 — April 2026*

---

## Purpose

This document defines how every piece of data on Dialecta is stored, computed, and called upon. It is the reference all other sessions design against. If a feature assumes data exists, this document defines where that data lives, what shape it takes, and what produces it.

Nothing in this document describes what users see. It describes what the system knows and how it knows it.

---

## The Three-Layer Architecture

Every data operation on Dialecta belongs to one of three layers. Understanding the separation is the prerequisite for understanding anything else.

**Inputs** are events that trigger pipeline activity. A comment posted, a vote cast, an aspiration declared, a recommitment made. Each event carries a structured payload. Inputs do not write to the database directly — they trigger Compute.

**Compute** is the set of serverless/edge functions that run in response to events. These functions call the Anthropic API, perform calculations, and write results to the Store. Compute is stateless — it reads from the Store when it needs context, does its work, and writes back. It does not hold data between calls.

**Store** is the Supabase / PostgreSQL database. It is the only source of truth. Compute writes to it. Render reads from it. Nothing is authoritative unless it is in the Store.

**Render** is the set of React components that read from the Store and output UI. The Fingerprint renderer, the Profile view, the Feed, the Growth shelf — these are all consumers. They do not compute. They do not store. They receive data and return markup.

The critical constraint: **the Fingerprint renderer is a Render layer component**. It reads axis data from the Store and outputs an SVG. It has no memory between renders. Whatever six axis values are passed to it, it draws. All computation that produces those values happens upstream in Compute and is persisted in Store before the renderer ever runs.

---

## The Nine Core Data Entities

### 1. comments

The raw comment record. In Phase 1 (Ghost CMS), Ghost handles article and member storage, but Dialecta owns the comment table from day one. The classification pipeline is called on submit, which means Dialecta's API must receive the comment before it is published.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| author_id | uuid | References Ghost member ID in Phase 1; Supabase auth user in Phase 2 |
| article_id | uuid | References Ghost post ID in Phase 1 |
| body | text | Raw comment text |
| status | enum | draft / pending_review / published / suppressed |
| created_at | timestamp | |
| published_at | timestamp | Null until published |

---

### 2. classifications

One record per comment. The full output of the classification pipeline — Stage A analysis fields plus Stage B tier assignment. This is the most important table in the system: it is the raw material from which all contributor identity data is derived.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| comment_id | uuid | Foreign key → comments |
| claim_text | text | Extracted or paraphrased claim. "None identified" if absent |
| specificity | integer | 0–3 |
| emotion | enum | low / medium / high |
| tribal_markers | boolean | |
| tribal_example | text | Null if tribal_markers = false |
| article_engagement | enum | specific / general |
| opposing_view_engaged | enum | yes / partially / no |
| ai_suggested_tier | enum | forum / spark / echo / fog / heat / stance / breach |
| self_declared_tier | enum | Null if commenter accepted AI suggestion |
| final_tier | enum | Resolved tier after any community voting |
| borderline_flag | boolean | |
| borderline_other_tier | enum | Null if borderline_flag = false |
| commenter_message | text | The 1–2 sentence reflection shown to the commenter |
| classified_at | timestamp | |
| resolved_at | timestamp | Null until final_tier is confirmed |

The delta between ai_suggested_tier and self_declared_tier is meaningful signal that feeds the Calibration axis over time. Both are always stored.

---

### 3. axis_events

The immutable append-only ledger. One record per comment per axis that comment touches. This table is never updated — records are only appended. Any historical axis state can be reconstructed by replaying the ledger. This immutability is what makes the Fingerprint unfakeable: you cannot retroactively alter the record of what someone actually wrote.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| contributor_id | uuid | |
| comment_id | uuid | Foreign key → comments |
| classification_id | uuid | Foreign key → classifications |
| axis | enum | acuity / reach / calibration / magnanimity / discourse / consistency |
| delta | decimal | Contribution to this axis from this comment. Quality-gated — Breach contributes negative delta |
| tier_at_contribution | enum | The final_tier at time of contribution |
| created_at | timestamp | Immutable |

Not every comment contributes to every axis. A comment that engages specifically (Acuity delta) but stays within one topic (no Reach delta) and doesn't reference an opposing view (no Magnanimity delta) generates two or three axis_event records, not six.

---

### 4. axis_scores

The materialized current state. One record per contributor per axis (six records per contributor). This is what the Fingerprint renderer reads. It is recomputed from the axis_events ledger after each classification event resolves — not accumulated incrementally — which eliminates floating-point drift and keeps the materialized state honest.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| contributor_id | uuid | |
| axis | enum | acuity / reach / calibration / magnanimity / discourse / consistency |
| graduation_count | integer | Number of qualifying contributions |
| tier_mix | jsonb | Distribution of tiers behind the graduations. Drives petal texture |
| last_updated | timestamp | |

The tier_mix field is a JSON object mapping tier names to counts: `{"forum": 42, "spark": 18, "echo": 3, "heat": 7}`. The Fingerprint renderer uses this distribution to determine whether a petal renders smooth (high Forum concentration) or with wave texture (significant early Heat or Stance that has since resolved).

---

### 5. fp_snapshots

Point-in-time fingerprint captures. Stores the full six-axis state at a specific moment with a reason code. This table is what makes the Growth visualization possible — without it, you can recompute current state from the ledger but cannot efficiently retrieve "what did this fingerprint look like at aspiration declaration." The snapshot solves expensive ledger replay at render time.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| contributor_id | uuid | |
| snapshot_at | timestamp | |
| reason | enum | aspiration_declaration / recommitment / archetype_shift / milestone / manual |
| axis_scores | jsonb | Full copy of all six axis scores and tier_mix values at snapshot time |

---

### 6. archetypes

Current assigned archetype and full assignment history. The archetype is derived from the pattern of axis_scores — not stored as a simple field on the contributor record — because the assignment needs to be auditable and because changes over time are themselves meaningful data that surfaces in the Feed.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| contributor_id | uuid | |
| assigned_archetype | enum | skeptic / synthesizer / advocate / builder / empiricist / contextualist / illuminator / reviser / forming |
| axis_pattern | jsonb | The axis signature that triggered this assignment |
| confidence | decimal | 0–1. Low confidence triggers "pattern still forming" state |
| assigned_at | timestamp | |
| history | jsonb | Array of prior archetype assignments with timestamps |

The "forming" value covers contributors who do not yet have enough history to assign an archetype. The history field enables the arc visualization on the profile and the archetype shift event in the Feed.

---

### 7. aspirations

The user-authored growth record. Verbatim storage is required — the platform never paraphrases or summarizes what the contributor wrote. The declaration fingerprint snapshot is stored by reference to fp_snapshots, creating an immutable "from" baseline.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| contributor_id | uuid | |
| statement | text | Verbatim. Never modified by the platform |
| reason | text | Why this matters to them. Also verbatim |
| target_archetype | enum | Optional. Null if aspiration is not archetype-anchored |
| axis_commitments | jsonb | Ranked array of axis names the contributor is committing to move. Minimum one |
| declaration_snapshot_id | uuid | Foreign key → fp_snapshots. The "from" baseline |
| declared_at | timestamp | |
| expires_at | timestamp | declared_at + 90 days |
| status | enum | active / expired / archived |
| visibility | enum | public / private |
| research_consent | boolean | Separate from aspiration. Null = not yet asked |
| research_consent_at | timestamp | |

Recommitments are a child table of aspirations. Each recommitment record stores: aspiration_id, action (reaffirm / revise / archive), new_statement if revised, new_reason if revised, snapshot_id at recommitment (foreign key → fp_snapshots), recommitted_at. If action is reaffirm, the expires_at on the parent aspiration is extended by 90 days.

---

### 8. feed_events

Typed event records for the social feed. Precomputed display payloads avoid expensive joins at feed render time.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| event_type | enum | archetype_shift / fingerprint_milestone / sparring_partner_recognized / aspiration_declared / recommitment / first_forum_comment / forum_thread_spotlight |
| primary_contributor_id | uuid | |
| secondary_contributor_id | uuid | Null except for sparring_partner events |
| reference_id | uuid | Points to the relevant record (comment_id, aspiration_id, etc.) |
| display_payload | jsonb | Precomputed display data for the feed card |
| visibility | enum | public / followers |
| created_at | timestamp | |

The display_payload is precomputed at write time so the Feed component can render cards without additional queries. It contains whatever the card needs: contributor name, archetype name, axis name, article title, etc.

---

### 9. comments (community voting)

Community votes are not a separate entity — they are stored as a child table of comments: `comment_votes`. One record per vote per comment.

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| comment_id | uuid | |
| voter_id | uuid | |
| vote_type | enum | upvote / downvote / nominate_up / nominate_down |
| created_at | timestamp | |

Enough nominate_up or nominate_down votes trigger a reclassification event, which re-runs the classification pipeline and potentially changes the final_tier on the classifications record.

---

## The Compute Pipelines

### Classification Pipeline

Trigger: comment posted event.

1. Receive comment body, author ID, article ID.
2. Fetch article key claims from Ghost API (3–5 claims per article, submitted by author at publication).
3. Call Anthropic API with comment body + article claims + classification prompt. Receive Stage A fields + Stage B tier + commenter message as structured JSON.
4. Write one record to classifications with all Stage A fields, AI-suggested tier, borderline flag, commenter message.
5. Return tier suggestion and commenter message to the UI. Comment is not yet published.
6. User responds: accept AI tier, or self-declare a different tier. Self-declared tier written to classifications.self_declared_tier.
7. Comment status set to published. classifications.final_tier set to self_declared_tier if overridden, otherwise to ai_suggested_tier.
8. Trigger the Axis Score Updater (async, does not block publish).

This pipeline is the only synchronous call to the Anthropic API in the standard flow. Everything downstream is async.

---

### Axis Score Updater

Trigger: classification event resolves (final_tier confirmed). Also triggers on community reclassification.

1. Compute axis deltas from the resolved classification record. Determine which axes this comment touches and by how much, based on the Stage A fields and final tier.
2. Append records to axis_events for each axis touched.
3. Recompute axis_scores for this contributor across all six axes by replaying the relevant axis_events records. Update the six axis_scores records.
4. Hand off to Archetype Monitor.

---

### Archetype Monitor

Trigger: runs at the end of every Axis Score Updater invocation.

1. Read the contributor's current axis_scores.
2. Check the updated pattern against all eight archetype signatures.
3. If the pattern crosses a threshold for a new archetype (or the confidence score on the current archetype has changed significantly), update the archetypes record. Write the prior assignment to the history array.
4. If archetype changed: write a feed_events record of type archetype_shift.
5. Check fingerprint milestone thresholds (e.g. first time any axis crosses a graduation threshold). Write feed_events records for any milestones crossed.
6. Check whether any active aspiration's recommitment trigger conditions are met (90 days elapsed OR fingerprint delta from declaration snapshot exceeds threshold). If yes, queue recommitment prompt for next user session.

---

### Growth Engine

Trigger: aspiration declared or recommitment event.

On aspiration declaration:
1. Take a fingerprint snapshot (write to fp_snapshots with reason = aspiration_declaration).
2. Map the aspiration's axis_commitments to a ranked coaching priority list.
3. Store the priority list for use by the Practice Layer.
4. If visibility = public, write a feed_events record of type aspiration_declared.
5. If research_consent has not been asked for this contributor, flag for surfacing at next session open.

On recommitment:
1. Take a fingerprint snapshot (write to fp_snapshots with reason = recommitment).
2. Compute delta between declaration snapshot and current snapshot.
3. Update aspiration record with new status, new expires_at if reaffirmed, new statement if revised.
4. Update coaching priority list if axis_commitments changed.
5. If visibility = public, write a feed_events record of type recommitment.

---

## The Event Pipeline: Comment Submission

The most important flow on the platform, step by step:

1. Contributor types comment and hits submit.
2. Dialecta API receives comment body + author_id + article_id.
3. Classification Pipeline fires synchronously.
4. AI analysis returns. Commenter sees tier suggestion and commenter message.
5. Commenter accepts or overrides. Final tier confirmed.
6. Comment written to comments table with status = published.
7. Classification record finalized with final_tier.
8. Axis Score Updater fires asynchronously.
9. axis_events records appended.
10. axis_scores records recomputed.
11. Archetype Monitor runs.
12. Archetype updated if threshold crossed. Feed events written if milestones or archetype shift.
13. If contributor has an active aspiration: Growth Engine checks recommitment trigger.

The contributor sees steps 1–6 in real time. Steps 7–13 happen in the background and surface on next profile load or feed refresh.

---

## Ghost CMS Integration Notes (Phase 1)

Ghost owns: articles, member authentication, subscription management, email delivery.

Dialecta owns from day one: comments, classifications, axis_events, axis_scores, fp_snapshots, archetypes, aspirations, feed_events.

The integration boundary:
- Article key claims are a custom Ghost field (added via Ghost's custom fields or injected via the Ghost Admin API at publication time).
- Member IDs from Ghost are used as author_id in the comments table. No user data is duplicated — Dialecta references Ghost member IDs but does not replicate member records.
- Comment submission bypasses Ghost entirely. The comment UI calls Dialecta's API directly. Ghost renders articles; Dialecta handles the comment lifecycle.
- In Phase 2 (Next.js + Supabase), Ghost is replaced as the article layer. The Dialecta data layer (comments onward) requires no migration.

---

## Open Questions

- **Axis delta computation**: the exact function from Stage A fields and tier to axis delta values. Currently illustrative. Needs a dedicated calibration session with test comments.
- **Archetype confidence threshold**: how much history is required before assigning an archetype rather than showing "pattern still forming." Likely a minimum graduation count per axis.
- **Recommitment fingerprint delta threshold**: what magnitude of fingerprint shift constitutes a "meaningful" early trigger. Needs calibration against real data.
- **Practice Layer exercise storage**: the queue of coaching exercises per contributor, filtered and sorted by axis priority, is not yet defined as a data entity.
- **Sparring Partner detection**: the logic that identifies when two contributors have engaged across enough separate threads to generate a sparring_partner_recognized feed event.

---

*Version 1.0 — April 2026*
*Companion documents: Dialecta_Contributor_Identity.md, Dialecta_Growth_Layer_Principles.md, Dialecta_Classification_Engine_Specification.md*
