# Dialecta — Relationship Types
*Readers, Sources, Correspondents, and Sparring Partners — the dyadic layer above individual identity*
*Version 1.0 — April 2026*

---

## Purpose

This document specifies Dialecta's **relationship layer** — the four types of dyadic connection the platform recognizes between contributors. It is a sibling document to `Dialecta_Contributor_Identity.md` (which represents one contributor) and `Dialecta_Social_UX_Architecture.md` (which describes how relationships surface in the feed).

The unit of analysis here is the **pair**, not the individual. The Contributor Identity layer answers *who is this person becoming?* The Relationship layer answers *who are they becoming this with?*

---

## The Foundational Insight

The platform's relational anthropology (per `Dialecta_Founding_Philosophy.md` Article 3: *the isolated self is insufficient*) operates at three scales:

1. **Per-comment** — the Discourse Layer (Classification Engine)
2. **Per-contributor** — the Contributor Identity Layer (Six Pillars, Eight Archetypes)
3. **Per-pair** — the Relationship Layer (this document)

Most social platforms recognize one or two relationship types — friend / not-friend, follower / followed. Dialecta recognizes four because intellectual life produces more than one kind of meaningful tie. A Reader is not the same as a Source. A Source you also follow back (Correspondent) carries a different social charge than one you do not. And the person who consistently challenges your thinking in comment threads (Sparring Partner) may not be in your follow graph at all — but the relationship is real.

**Engagement is a core platform tenet.** Relationships earned through sustained intellectual exchange are visible to both parties because that visibility is part of what makes them feel real. The platform does not hide the connections the work produces.

---

## The Four Types

### 1. Readers — *People who follow you*

Asymmetric, inbound. Someone has chosen to receive your activity in their feed. The platform shows you who your Readers are because being read is part of the social contract of writing in public.

| Property | Value |
|---|---|
| Direction | Asymmetric (in) |
| Detection | Direct — they clicked Follow |
| Visibility | Public on both profiles |
| Cardinality | Unbounded |

### 2. Sources — *People you follow*

Asymmetric, outbound. You have chosen to receive their activity in your feed. Sources are the contributors whose voices shape what you encounter on the platform.

| Property | Value |
|---|---|
| Direction | Asymmetric (out) |
| Detection | Direct — you clicked Follow |
| Visibility | Public on both profiles |
| Cardinality | Unbounded |

### 3. Correspondents — *You follow each other*

Symmetric. Mutual follow. A Correspondent is a Reader and a Source simultaneously — the bidirectional intellectual-attention relationship. On other platforms this maps loosely to "friend" or "peer," but Dialecta names it specifically because the bidirectional commitment is meaningful in its own right.

| Property | Value |
|---|---|
| Direction | Symmetric |
| Detection | Derived — intersection of Sources and Readers |
| Visibility | Public on both profiles, surfaced as a distinct type (not just two follows) |
| Cardinality | Unbounded but typically smaller than Readers or Sources |

### 4. Sparring Partners — *People you have engaged in sustained back-and-forth with, regardless of follow status*

Engagement-derived, not follow-derived. A Sparring Partner is recognized when two contributors have demonstrably engaged with each other across multiple articles — the kind of intellectual dance Dialecta exists to cultivate. Sparring Partner is the only relationship type the platform names for the contributor rather than the contributor declaring it. It surfaces the real relational structure that the work itself produces.

| Property | Value |
|---|---|
| Direction | Engagement-derived (no direction) |
| Detection | Algorithmic — comment-reply pairs across **5+ separate articles**, both A→B and B→A reply directions present (one-directional reply chains do not qualify) |
| Visibility | Public on both profiles, both parties recognized simultaneously when the threshold is crossed |
| Cardinality | Naturally limited — sustained engagement is not abundant |

The four types are **not mutually exclusive**. A Sparring Partner may also be a Source, Reader, or Correspondent. The model describes distinct kinds of tie, not a partition of the contributor's social graph.

---

## Detection Rules — Summary

| Type | Trigger | Computed |
|---|---|---|
| Reader | Follow event (other → you) | Direct |
| Source | Follow event (you → other) | Direct |
| Correspondent | Both follow events present | Derived nightly + on follow event |
| Sparring Partner | 5+ articles where both A→B and B→A comment replies exist | Derived nightly |

The Sparring Partner threshold (5 articles) is tunable. It should be selective — recognizing too many Sparring Partners makes the recognition meaningless; too few makes the platform feel cold. Five is a starting point; revise after observing real engagement patterns.

---

## Visibility & Consent

**Default visibility for all four types is public.** The platform's commitment to engagement-as-celebrated means relationships earned through intellectual work are surfaced, not hidden. The Pact onboarding includes consent to this visibility model.

**Per-relationship opt-out for Sparring Partner.** A contributor may opt out of being publicly listed as a specific person's Sparring Partner. The relationship still exists in the engagement data (and in the Reviser pathway, the Calibration pillar, etc.), but the public chip is suppressed on both profiles. This balances the platform's visibility tenet with contributor dignity — a person who finds a particular pairing socially awkward can quietly remove the public surface without erasing the underlying engagement.

**Asymmetric follows do not get per-relationship opt-out.** Reader and Source visibility is part of the platform's transparency commitment (per Project Brief Core Rule: *full platform transparency*). A user can either follow publicly or not follow.

**Aggregate counts** (number of Readers, Sources, Correspondents, Sparring Partners) are always public on a contributor's profile. Counts communicate engagement scale without exposing specific relationships.

**No private follows.** The platform does not support shadow-following. Transparency is constitutional.

---

## Feed Surfacing — Identity Events

Per `Dialecta_Social_UX_Architecture.md`, the feed includes Identity Events. The relationship-type events that surface:

| Event | Trigger | Surfaces to |
|---|---|---|
| **New Reader** | Someone starts following you | You (low-priority, batched) |
| **Correspondent established** | Mutual follow completed | Both parties |
| **Sparring Partner recognized** | 5-article threshold crossed | Both parties |
| **Sparring Partner archetype shift** | A Sparring Partner's archetype changes | The other Sparring Partner |
| **Source milestone** | A Source achieves a Fingerprint pillar milestone | You |

New Source events (you followed someone) are not surfaced — that is your own action, not news. Sparring Partner recognition is the highest-value Identity Event in this category because it names a relationship the contributor did not consciously construct.

---

## Data Model

A single `follows` table supports Readers, Sources, and Correspondents:

| Column | Type | Notes |
|---|---|---|
| follower_id | uuid | The Source perspective |
| followee_id | uuid | The Reader perspective |
| created_at | timestamp | For event surfacing and history |

Correspondents are a derived view (rows where both `(A,B)` and `(B,A)` exist).

Sparring Partner is computed from the `comments` table by detecting reply pairs across articles. The computation runs nightly and stores results in a `sparring_partners` materialized view:

| Column | Type | Notes |
|---|---|---|
| contributor_a | uuid | Lower id of the pair (canonical ordering) |
| contributor_b | uuid | Higher id of the pair |
| article_count | int | Distinct articles with mutual replies |
| recognized_at | timestamp | When threshold first crossed |
| visibility_a | bool | A's opt-in for public chip |
| visibility_b | bool | B's opt-in for public chip |
| last_engagement_at | timestamp | For decay logic (see Open Questions) |

---

## Relationship to Other Documents

- **`Dialecta_Founding_Philosophy.md`** — Article 3 (the isolated self is insufficient) is the philosophical ground for recognizing relationships at all
- **`Dialecta_Contributor_Identity.md`** — Sibling document, individual layer; this document is the dyadic layer above
- **`Dialecta_Social_UX_Architecture.md`** — Specifies how relationship events surface in the feed; this document specifies what they are
- **`Dialecta_Data_Architecture.md`** — Will need to add the `follows` table and `sparring_partners` materialized view to the canonical schema
- **`dialecta-pact.html`** — Should include the visibility model in onboarding so consent is informed

---

## Open Questions

1. **Sparring Partner threshold tuning.** Five articles is a starting point. Should be revised after observing real engagement patterns. May warrant tier-weighting (Sparring Partners across Forum-tier exchanges count more than across Heat-tier).
2. **Sparring Partner naming on the public chip.** Should the public profile chip identify the other party by name, or only show "5 active Sparring Partners" as a count? Naming creates social texture; counting protects the relationship. Default proposal: chip shows count publicly, names visible only to logged-in viewers (especially the other party).
3. **Sparring Partner decay.** If two contributors stop engaging for an extended period, does the status persist forever or fade? Default proposal: decay slowly — after 12 months without new mutual replies, the relationship is archived (still in data, no longer surfaced as active).
4. **Correspondent + Sparring Partner overlap surfacing.** When someone is both, does the profile show both chips or merge them? Default proposal: show both — they describe different things (one is declared follow, the other is observed engagement).
5. **Reciprocity of opt-out.** When one party opts out of a public Sparring Partner chip, the other party loses the chip too (since it surfaces on both profiles). Is this the right behavior, or should the non-opted-out party still see their side? Default proposal: the chip disappears from both sides — the relationship's public existence requires mutual consent.

---

*Version 1.0 — April 2026*
*Companion documents: `Dialecta_Contributor_Identity.md`, `Dialecta_Social_UX_Architecture.md`, `Dialecta_Founding_Philosophy.md`*
