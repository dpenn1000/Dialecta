# Dialecta — Feed Architecture Conceptualization Handoff
*Three-surface model, Community feed scope, dopamine-for-good thesis, infrastructure state*
*2026-04-29*

---

## Purpose of this doc

This is a paste-forward handoff for the chat that owns Community / feed / social-graph work. It captures a conceptualization arc that happened in the theme-building chat, where the question of "what is the live feed and how does it differ from the Community page" came up while scoping the Commenting and Private Draft engines.

The theme-chat is going back to building the Discourse Layer engines (post.hbs comments + Private Draft Mode). The Community feed work belongs to a different chat. This doc carries the synthesis forward so that chat does not have to redo the conceptualization.

---

## The starting question

While scoping the Commenting + Private Draft build, the live feed (comments under an article on post.hbs) and the Community page were initially conflated. Pulling them apart surfaced a real question: what does each surface actually do, and how do they avoid being redundant?

The exploration produced a three-surface model and a dopamine-for-good thesis grounded in the founding docs. Both are summarized below.

---

## The dopamine-for-good thesis (foundationally backed)

The user surfaced the question: *"Everyone deserves a little 'degenerate' scrolling from time to time, but what if that scrolling could make you happier, more thoughtful, and more engaged? What if it didn't just target clicks, tribalism, and rage baiting?"*

This is **not** a deviation from the project philosophy. It is the project's stated thesis. Multiple foundational docs name it explicitly.

**`Dialecta_Growth_Layer_Principles.md`:**
> *"what if the same reward loops that other platforms use to make reflexive engagement addictive could be redirected to make meaningful development addictive?... meaningful collaboration and dialogue can be made addictive in the same structural sense that shallow engagement currently is, and doing so is one of the most important things Dialecta can prove."*

**`Dialecta_Social_UX_Architecture.md`:**
> *"The 'addictive in a good way' goal is achievable here because the distinction between healthy and unhealthy engagement loops is whether what you're doing while engaged is making you better or worse."*

And later, on the Loop's mechanics:
> *"contains the same elements those platforms exploit — variable reward, visible progress, social proof, near-misses, intrinsic feedback — but each element is pointed at depth rather than reflex, and each is gated by the user's own ongoing consent."*

**`Dialecta_Founding_Philosophy.md` (Article 8):**
> *"Dialecta's founding wager is that the same logic can be run in the opposite direction... The platform does not ask its contributors to be better people. It engineers conditions in which thinking well is the most rewarding thing they can do here."*

**`Dialecta_Tier_Psychology.md`:**
> *"You don't change behavior by asking people to be better. You change behavior by designing environments where better behavior is the path of least resistance."*

So the real question for the feed is not "is dopamine OK here" but **"which dopamine, on which surface, gated how."**

---

## The three-surface model

| Surface | Purpose | Content |
|---|---|---|
| **Article comments** (post.hbs) | Depth on *this* argument | Topology bar, sort, comment cards, nomination |
| **Profile page** | Identity layer + private mirror | **Public:** Fingerprint, archetype, Readers/Sources/Correspondents/Sparring Partners, Declared shelf (aspirations). **Private:** Activity Rhythm View |
| **Community page** | The platform's social feed | The four content types from `Dialecta_Social_UX_Architecture.md` (see next section) |

### Why the Profile is not a feed surface

Earlier in the conversation, a "Facebook-like Profile feed" was floated. The docs argue against it: the Activity Rhythm View doc is explicit that the Rhythm View is the contributor's *private mirror*, and *"cross-references in feed: default proposal no"* because feed surfacing would violate Risk 3 (Recognition vs. Surveillance) per the Social UX Architecture doc.

The Profile is the identity layer (Fingerprint, archetype, relationships, Declared aspirations) plus the private mirror (Rhythm View). The dopamine-for-good engine lives on **Community**, not Profile.

### Why article comments are not a feed surface

Article comments are anchored to one argument. The reader has just finished the piece and is in a judgment / weigh-in mode. The topology bar shows the shape of *this* thread. Quality-first sort sets the norm for the local conversation. This is depth, not breadth.

### Why Community is the dopamine engine

A Community page that is just "all comments, recency-sorted" is a Twitter feed and cuts against the founding principle. To earn its visit, Community must do something the article comments cannot: show the discourse *as a system.* That is what the four content types in the Social UX Architecture doc are designed for.

---

## The four Community feed content types (per `Dialecta_Social_UX_Architecture.md`)

The Dialecta feed is defined as a **curated activity stream**, not an algorithmic timeline. Each content type earns its place differently:

### 1. Articles (Hot + Relevant)
- **Hot is Forum-tier-engagement-weighted, not raw volume.** An article with 12 Forum-tier comments outranks one with 80 Heat-tier comments.
- This single architectural decision encodes the platform's values into what climbs the feed.
- Relevant is interest-matched based on topics the contributor has engaged with before.

### 2. Thread Spotlights (the platform's "primary viral unit")
- Curated 2-3 comment exchanges where something interesting happened: a position got refined, a counterargument got acknowledged, an opposing view got stated faithfully and engaged with.
- Both Forum-rated.
- The doc names this *"the platform's primary viral unit"* because a debate excerpt with visible quality badges looks different from anything else on the internet.
- Cards show the exchange with tier badges visible, a line from the article for context, and a "join this thread" entry point.
- Shareable outside the platform precisely because of the visual distinction.

### 3. Identity Events (the genuinely novel category)
The events worth surfacing, per the Social UX Architecture doc:
- **Archetype shift** for a Correspondent or Sparring Partner. *"Maria has shifted from Synthesizer toward Skeptic across her last 20 comments."*
- **Sparring Partner recognition.** Both parties' feeds. Names a relationship the contributor did not consciously construct. Highest-value Identity Event in this category per the Relationship Types doc.
- **First Forum-tier comment** for a new member. Welcoming event + quality signal.
- **Fingerprint milestone** for someone you follow. *"David's Magnanimity pillar crossed 80 for the first time."*
- **Aspiration declared.** Optionally public, contributor-controlled at declaration. Cultural register: intellectual courage, not self-improvement performance.
- **Recommitment.** When a contributor reaffirms or revises a public aspiration after the ninety-day check-in. Rarer and more meaningful than the original declaration.
- **Source milestone.** When a Source achieves a Fingerprint pillar milestone.

**The Risk 3 constraint applies hard here:** surface *milestones and shifts*, never activity volume. Contributors should feel *recognized*, not *watched.*

### 4. Opinion Map Topology Changes
- When aggregate community opinion on a ternary or Cartesian plot shifts meaningfully after a new article or comment thread, that is news.
- *"The community on the climate policy piece shifted 12 points toward Policy-driven over the last 48 hours — this thread is likely why."*
- Makes the platform feel like it is tracking something real about how people think, not just what they say.

---

## What is already built (verified 2026-04-29)

The feed infrastructure is more complete than the chat initially assumed.

### Database (Migration 001 v1.1, applied)
- `follows` table with RLS, indexes, public read policy, FK to `profiles.ghost_member_id`
- `sparring_partners` table with mutual-visibility opt-in, RLS that requires both parties to opt in for the public chip
- **`feed_events` table with all 12 event types from the spec already enumerated as a CHECK constraint:** `archetype_shift`, `fingerprint_milestone`, `sparring_partner_recognized`, `sparring_partner_archetype_shift`, `aspiration_declared`, `recommitment`, `first_forum_comment`, `forum_thread_spotlight`, `new_reader`, `correspondent_established`, `source_milestone`, `delta_acknowledged_published`. Has `visibility` enum (`public` / `followers`) and a precomputed `display_payload` jsonb to avoid joins at render time.
- `opinion_map_positions` table for Cartesian + ternary positions, with pre/post stages for the Delta Mechanic
- `profiles.is_seed` flag so public feeds can hide fictional contributors (Maya, Wen, Anselm)

### Seed data (Migration 004)
- Dan + 3 fictional contributors: Maya = Source, Anselm = Reader, Wen = Correspondent + Sparring Partner (visible chip)

### API
- `POST /api/profile/:id` with `_action: 'follow' | 'unfollow'`. Idempotent. Verifies both profiles exist before insert.
- `GET /api/profile/:id` returns readers / sources / correspondents / sparring partners with disjoint bucketing (mutual follows are correspondents, not double-counted).

### Theme
- `page-community.hbs` exists. Mounts `#dialecta-community-root`, passes `data-viewer-uuid`.
- **Currently renders a contributors directory** (list of people with archetype, Steward Order, bio, Follow button via `/api/profile/_list`). Not a feed.
- Inline client-side search filter; no search backend needed at current scale.

---

## What is NOT built yet

- The **Community feed render layer** (the four card types: Article-Hot, Thread Spotlight, Identity Event, Opinion Topology Change)
- The **`feed_events` generators**: when does each of the 12 event types fire? On what trigger? Written by which job? Some are obvious (`first_forum_comment` fires when a contributor's first comment is classified Forum); others need design (`forum_thread_spotlight` requires a curation algorithm to detect "something interesting happened" exchanges).
- Any **personalized cut** of the feed (the spec implies follower-targeted Identity Events but does not specify whether Community is global / personalized / both)
- The **Sparring Partner detection job** (nightly materialization from comments, threshold 5 articles with mutual replies)
- A **decision** about what happens to the existing contributors directory when the feed ships

---

## Open decisions for this chat

### Decision 1: Build path

**(a) Spec-faithful, all four content types from day one.** Originally framed as the heavier first move because it requires `follows`. *That cost is already paid.* The infrastructure is there. The remaining work is the render layer + the event generators + the curation logic for Thread Spotlights.

**(b) Three content types now, Identity Events deferred to Phase 2.5.** Skip the Identity Events render and their generators for v1. Ship Articles (Forum-weighted Hot), Thread Spotlights, Opinion Map Topology Changes. Add Identity Events as a follow-up pass.

**Recommendation: (a).** The infrastructure investment that originally made (a) expensive has already been made. Skipping Identity Events in v1 leaves the most distinctive part of the social UX architecture on the table when the table is already set. Identity Events are also the most spec-grounded, doc-supported, and philosophically distinctive content type. They are the platform's unique social UX move.

### Decision 2: What happens to the existing contributors directory

The current `page-community.hbs` is the contributors directory. Building the feed means deciding its fate.

- **Replace.** Community page becomes the feed. Contributors directory moves to `/contributors/` or similar.
- **Combine.** Feed renders at top, contributors directory below.
- **Tabs.** Community page has Feed / Contributors as two views.

**Recommendation: Tabs.** The feed answers *"what's happening?"* and the directory answers *"who's here?"* — both legitimate Community questions. Tabs let either be the default depending on what kind of visit you're making (returning vs. discovery), and nothing has to be deleted.

This is a taste call, not a technical one. Confirm before building.

### Decision 3: Personalized cut

Is Community a global feed, a personalized-from-your-network feed, or both as tabs?

The Social UX Architecture doc names Identity Events that surface *to followers* (e.g., aspiration declared surfaces to people who follow that contributor), implying personalization exists. But it doesn't specify the page-level model.

Options:
- **Global only.** Simpler. Cold-start friendly (new users see something).
- **Personalized only.** Stronger habit loop, but cold start is empty.
- **Both as tabs.** Default to global for new users, personalized for users with a follow graph. Highest UX value, slightly more build.

**Recommendation: Both as tabs**, default determined by whether the viewer has any Sources. Maps cleanly to the existing tab pattern from Decision 2 if that direction is chosen.

### Decision 4: Phase staging

The Social UX doc explicitly says the feed *"should be designed in Phase 2 or 3, but should not be the primary surface until Phase 4, when community mass supports it."* (Risk 1: Volume Before Critical Mass.)

Implication: build the surface now, but do not promote Community to the homepage yet. The current homepage (Articles list at `/`) stays. Community is reachable via nav, not the default.

This is consistent with the existing Ghost setup and shouldn't require any nav changes.

---

## Constraints to honor when building

These are spec-grounded and non-negotiable:

1. **Hot is Forum-weighted, not volume-weighted.** Encodes platform values into ranking. Implementation: `forum_count * w1 + spark_count * w2 + ...` with weights heavily favoring Forum / Spark and downweighting Heat / Stance. Treat Echo / Fog as zero. Breach as negative or excluded.
2. **Identity Events surface milestones and shifts, never activity volume.** Recognition vs. surveillance. The Activity Rhythm View doc explicitly forbids feed surfacing of rhythm anomalies.
3. **The off-ramp is real.** Right to mute, hide, opt out of Identity Events about you, no streak loss, no guilt copy. *"The off-ramp is not a concession. It is what makes the on-ramp meaningful."*
4. **The friction stays.** The 3-stage comment submission ritual (write → reflect → declare) is the quality mechanic. The feed surrounds it; it does not replace it. Comment composition does NOT happen on the Community feed.
5. **Filter `is_seed = false` from public feeds.** The fictional contributors are seed data. They appear in the contributors directory by design (filling out the social graph for testing) but should not pollute Identity Events.
6. **Theory of change test.** Every design decision passes: *"does this make thinking well feel more rewarding, or does it quietly create a shortcut around it?"*
7. **No algorithmic amplification.** Curation is rule-based, not engagement-optimizing. No "comments you missed because they're outraging others" mechanic.
8. **Tier badges are visible everywhere.** The brightness ladder (Forum lightest, Breach darkest) is the system's primary signal at scan distance. Every comment / thread spotlight on the feed must display the tier badge.

---

## Suggested build order

If (a) + Tabs + Both-personalized-and-global is the path:

1. **Schema additions** (likely none — verify by reading 001_v1_1_schema.sql; the tables are there).
2. **`feed_events` generators** — write the triggers for each of the 12 event types. Some are simple INSERT-on-insert hooks; others need a nightly job (Sparring Partner detection, Thread Spotlight curation). The `display_payload` is precomputed at write time so render is a flat read.
3. **Feed read API** — `GET /api/feed?cut=global|personal&viewer=:uuid&limit=N&before=:cursor`. Joins `feed_events` to articles / comments / profiles to enrich beyond the precomputed payload only when needed.
4. **Render layer** — four card components, one per content type. Use the brass design tokens (`--brass-gradient`, `--brass-shadow`, `.dialecta-brass`) for visual cohesion with the rest of the platform.
5. **Tab integration on `page-community.hbs`** — Feed / Contributors. Default tab = Feed for users with Sources, Contributors for users without. Move the existing ContributorsList into the Contributors tab.
6. **Nav decision** — leave Community as a nav item, do NOT make it the homepage (Risk 1).

Sparring Partner detection (nightly job, threshold = 5 articles with mutual replies, A→B and B→A both required) is independently useful and could ship before the feed render.

---

## Source references

All citations for the synthesis above:

- `Dialecta_Founding_Philosophy.md` — Articles 1-10, Section IV (intellectual lineage), Section V (productive tensions)
- `Dialecta_Social_UX_Architecture.md` — Feed Architecture, Identity Events, Risks 1-3, Phase mapping, Theory of Change
- `Dialecta_Growth_Layer_Principles.md` — Foundational Insight (the dopamine-for-good thesis), Six Principles, the Loop
- `Dialecta_Activity_Rhythm_View.md` — What it shows / does not show, Privacy & Visibility, the no-feed-surfacing constraint
- `Dialecta_Relationship_Types.md` — Four types, detection rules, visibility & consent, feed surfacing table
- `Dialecta_Tier_Psychology.md` — Brightness ladder, three psychological zones, behavioral design
- `Social_Media__Human_Behavior__and_the_Rewiring_of_Society.md` — Sections II (behavioral conditioning), VIII (systems over intentions), IX (strategic response)

Code references:

- `C:\dialecta-api\supabase\migrations\001_v1_1_schema.sql` — `follows`, `sparring_partners`, `feed_events`, `opinion_map_positions` tables
- `C:\dialecta-api\supabase\migrations\004_seed_relationships.sql` — Dan + Maya/Anselm/Wen seed relationships
- `C:\dialecta-api\api\profile\[id].js` — follow/unfollow endpoint, GET with relationship buckets
- `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\page-community.hbs` — current contributors directory mount

---

## Where to pick up

Open this doc in the chat that owns Community / feed work. Pick up at "Decision 1" and walk down. The infrastructure recon is done; the questions are conceptual / UX.

The theme-chat is returning to the Commenting + Private Draft engine build (Sprint 3 in the launch roadmap, mobile-aware from day one).

---

*2026-04-29 — Feed architecture conceptualization handoff. Companion to: `dialecta-handoff-2026-04-28-evening.md`.*
