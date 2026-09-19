# Dialecta — Social UX Architecture
*Feed Design, Identity Primitives, and the Balance Engineering Problem*
*Version 1.0 — April 2026*

---

## The Core Diagnosis

Dialecta was designed with blog infrastructure and social ambitions, and the gap between those two is the central UX tension the platform must resolve. Most of what exists is a blog with a sophisticated comment system layered on top. The profile, the Fingerprint, the tier history -- those are social primitives. But the frame around them is still "go to an article, read it, comment." That is a visit, not a habitat.

The goal of this document is to define what the social architecture of Dialecta looks like: what the feed carries, how identity functions as a social force, what the viral mechanics are, and where the genuine risks are. These decisions downstream everything else.

---

## The Foundational Choice: Make Friction Feel Social

Three options were considered for how to hold the tension between social UX (fast, frictionless) and the platform's quality standard (intentional friction at the moment of submission):

**Option 1:** Separate the surfaces. The feed and discovery are fast and social. The commenting surface keeps its friction. The two registers coexist.

**Option 2:** Make the friction itself feel social. The AI reflection prompt is framed as a community speaking to you, not a gate blocking you. The friction moment becomes the platform's most socially alive moment.

**Option 3:** Create a low-friction parallel channel. A lightweight "Reactions" layer (placing yourself on the opinion map with one or two taps, without writing) sits alongside full comments.

**Chosen direction: Option 2, with Option 3 as a Phase 3 complement.**

The reason Option 2 is the correct philosophical choice is that it is the only one consistent with the platform's foundational thesis. If the friction feels like a bureaucratic gate, it communicates distrust. If it feels like a community speaking to you, it communicates that people here care enough to push back. Those two social contracts produce completely different behavior. The gate makes people want to circumvent it. The community makes people want to earn it.

The specific implementation: the AI reflection prompt should show the commenter that a similar comment was reclassified to the Forum, and what made the difference. Not "your comment is bad." Instead: "here is what good looks like, and you are close." That is the Growth Frame applied at the moment of highest leverage.

---

## Feed Architecture

The Dialecta feed is not a traditional algorithmic timeline. It is a curated activity stream where each content type earns its place differently.

### Content Type 1: Articles (Hot + Relevant)

Hot is engagement-weighted, but engagement is defined as Forum-tier activity, not raw volume. An article with 12 Forum-tier comments surfaces higher than one with 80 Heat-tier comments. This is a single architectural decision that encodes the platform's values directly into what feels important. Relevant is interest-matched based on the topics a contributor has engaged with before.

### Content Type 2: Thread Spotlights

Not the full comment section -- a single highlighted exchange. Two or three comments forming a genuine back-and-forth, both Forum-rated, where something interesting happened: a position got refined, a counterargument got acknowledged, the opposing case was articulated faithfully and engaged with. The feed card shows the exchange with tier badges visible, a line from the article for context, and a "join this thread" entry point.

This is the platform's primary viral unit. A genuinely good debate excerpt, visually distinguished by quality badges, looks different from anything else on the internet. It is shareable outside the platform precisely because of that visual distinction.

### Content Type 3: Identity Events

This is Dialecta's genuinely novel feed category -- the one that makes it a place where your intellectual life actually happens, rather than a place you visit to read.

Specific events worth surfacing (the four relationship types referenced below — Readers, Sources, Correspondents, Sparring Partners — are defined in `Dialecta_Relationship_Types.md`):

- **Archetype shift** for a Correspondent or Sparring Partner. "Maria has shifted from Synthesizer toward Skeptic across her last 20 comments." This tells you something real happened to how she's engaging and gives you a reason to visit her profile.
- **Sparring Partner recognition.** The platform noticed you and someone else have debated across five separate articles. That recognition appearing in both feeds names a real intellectual relationship.
- **First Forum-tier comment** for a new member. A welcoming event and a quality signal simultaneously.
- **Fingerprint milestone** for someone you follow. "David's Magnanimity pillar crossed 80 for the first time." You now have something specific to say to David.
- **Aspiration declared.** When a contributor publicly declares a growth aspiration, this surfaces as an identity event for followers. "Sarah has declared: I want to argue the opposing case more faithfully before disagreeing with it." This is optionally public — the contributor controls visibility at declaration. The cultural register is intellectual courage and commitment, not self-improvement performance.
- **Recommitment.** When a contributor reaffirms or revises a public aspiration after the ninety-day check-in, this surfaces as a lightweight identity event. Recommitment signals ongoing investment — it is worth noting because it is rarer and more meaningful than the original declaration. Archived aspirations do not generate a feed event.

### Content Type 4: Opinion Map Topology Changes

When aggregate community opinion on a ternary or Cartesian plot shifts meaningfully after a new article or comment thread, that is news. "The community on the climate policy piece shifted 12 points toward Policy-driven over the last 48 hours -- this thread is likely why." This makes the platform feel like it is tracking something real about how people think, not just what they say.

---

## What Dialecta Identity Is, and Why It Is Different

The identity being built here is the hardest kind to fake and the most worth having.

Instagram identity is aesthetic -- entirely curatable. LinkedIn identity is credential-based -- tells you what someone claims to have done. Twitter identity is performative -- rewards wit in 280 characters. Dialecta identity is **demonstrated.** The Fingerprint does not care what you say about yourself. The archetype does not care what you put in your bio. Both are generated entirely from what you actually did, comment by comment, over time.

This makes them resistant to gaming in a way that follower counts and endorsements never are. When someone's Fingerprint shows high Magnanimity and high Calibration, you learn something real about them.

The "addictive in a good way" goal is achievable here because the distinction between healthy and unhealthy engagement loops is whether what you're doing while engaged is making you better or worse. Scrolling outrage content makes you more reactive and less curious. Tracking your Fingerprint growth, watching a debate you're in get reclassified upward, seeing a Sparring Partner relationship get named -- those things make you more invested in thinking well, because thinking well is what produces the rewards.

---

## Viral Mechanics

Viral spread from a quality platform looks different from viral spread on standard social, and designing for the wrong kind undermines the platform.

**The shareable debate clip.** A thread exchange where two contributors with visible Forum badges genuinely refined each other's positions, rendered as a clean image or embed. The badges make the quality legible to someone who has never heard of Dialecta. This is what travel across other platforms.

**The Fingerprint reveal.** When a Fingerprint has an interesting shape -- very high Acuity but low Reach, meaning someone goes deep on one topic but does not venture outside it -- that is a self-discovery moment people share. "Apparently I'm a depth-diver with an underdeveloped Magnanimity axis" is the kind of thing that gets screenshotted.

**The archetype story.** Someone posting about their archetype shift, not because the platform prompted them to, but because it described something real about how they have been changing. Organic sharing like this is worth more than any marketing.

**The reclassification moment.** "I posted something, the AI said it was Heat, I disagreed, the community voted, and they sided with the AI. So I rewrote it and it landed in the Forum on the second try." That story has a beginning, middle, and end. Nobody can tell it about any other platform.

---

## The Balance Engineering Problem

Three genuine risks require active management.

### Risk 1: Volume Before Critical Mass

The feed surface only works when there are enough people generating identity events and Forum-tier exchanges to keep it alive. Launching the feed before there is sufficient community to populate it will make the platform feel like a ghost town. In early phases, the profile page and the article comment section should do the identity work. Let contributors build Fingerprints and accrue archetype history before the feed is asked to surface those things as social events.

**Mitigation:** The feed should be designed in Phase 2 or 3, but it should not be the primary surface until Phase 4, when community mass supports it.

### Risk 2: Pressure to Lower Quality Thresholds

As the platform grows, the classification engine will face pressure to be more generous, because being consistently classified as Heat or Fog is demoralizing and creates churn. That pressure must be resisted architecturally, not just editorially. The tier thresholds and AI prompt architecture should be treated as near-constitutional. The Growth Frame mechanic -- making friction feel like coaching rather than rejection -- is the primary tool for holding that line without losing people.

### Risk 3: Recognition vs. Surveillance

The identity events feed can shade into surveillance if not designed carefully. Surfacing that "Maria shifted archetypes" is interesting. Surfacing a daily digest of every comment Maria made this week is invasive. The rule of thumb: surface milestones and shifts, not activity volume. Contributors should feel recognized, not watched.

---

## Phase-by-Phase UX Evolution

| Phase | Core UX Metaphor | Social Patterns to Build | What to Defer |
|---|---|---|---|
| **1 -- Pilot** | Blog with a strong profile page | Follow/subscribe, comment section, tier display, Pact onboarding | Feed, notifications, discovery |
| **2 -- Engine** | Blog with a living comment system | Notification stub (email-only), "Forum this week" sidebar, nomination UX, Option 2 friction framing | Full feed, Fingerprint sharing |
| **3 -- Mapping** | Blog with spatial engagement | Opinion map with aggregate view, "where you stand" as a social signal, Option 3 lightweight reactions | Real-time activity feed |
| **4 -- Full Platform** | Social platform with editorial depth | Feed as primary surface, persistent composer, shareable Fingerprint states, reclassification event notifications, identity event stream | Fine-tuned ML, mobile app |
| **5 -- Scale** | Social platform with a proprietary quality layer | Native mobile, Delta mechanic, full governance feed | -- |

The key Phase 2 unlock is email notifications. A real-time notification system is not required to deliver the social loop early. An email that says "Your comment was nominated for the Forum" is enough to bring someone back and begins forming the habit before the infrastructure exists to support a full notification center.

---

## The One Architectural Decision That Changes Everything

Whether Dialecta's homepage is a Feed or an Article Page is the single design choice with the most downstream leverage. It determines whether people experience the platform as a publication they visit or a place they live. Everything else -- profiles, notifications, discovery, the opinion maps -- can be retrofitted onto either model. But the primary surface sets the cultural expectation for the whole platform.

If the platform intends to be a social platform by Phase 4, there is a strong argument for building the feed stub as early as Phase 2, even if it is lightly populated. Let people see and understand the activity feed early, so that by the time it has enough content to feel alive, they already know where to look for it.

---

## The Theory of Change

Dialecta will be a genuinely positive force in the world if it solves one specific problem: making high-quality public reasoning more socially rewarding than low-quality public reasoning.

Every major platform has failed to do this not because nobody tried, but because reward mechanics were never aligned with quality. Upvote systems reward popularity. Follower systems reward fame. Engagement algorithms reward virality. None of those are correlated with thinking well.

The Fingerprint, the tiers, and the archetype system are a serious attempt to make demonstrated quality into the primary social currency of a platform. If that works -- if people start caring what their Fingerprint looks like the way they care about their follower count -- then the platform will shape behavior in the right direction without having to enforce it. The environment does the work.

The question to return to when any design decision comes up: does this make thinking well feel more rewarding, or does it quietly create a shortcut around it? The feed design, the notification system, the sharing mechanics -- all of them must pass that test.

---

*Compiled from design session — April 2026*
*Companion documents: Dialecta_Project_Brief.md, Dialecta_Contributor_Identity.md, Dialecta_Relationship_Types.md, Dialecta_Growth_Layer_Principles.md*
