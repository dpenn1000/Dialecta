# The three deferred design tensions

Root `CLAUDE.md`, "Known drift and open work", line 83, names three tensions that "need a session,
not a code edit":

> "archetype assignment vs the Self-Snapshot's three-voice principle; per-comment tier vs
> contributor-level axes; the Reviser archetype depends on the Delta mechanic."

This note answers each one by citation. It does not resolve any of them. Per
`.claude/agents/spec-reader.md`: "When two specs disagree, say so and cite both; do not resolve it."
Each section gives what each spec says in its own words, then names precisely what is not specified.

Quotes are clipped at em dashes rather than altered, per the convention in [drift-map.md](drift-map.md).

**Headline before the detail.** Of the three, only the first is open in the way root `CLAUDE.md`
describes. The second is specified in a document the index does not list. The third is marked
resolved in the index and then reopened as a build dependency by ADR-001, which is a different
problem from the one the line describes. Details in each section; the correction is not the
resolution, and none of the three is resolved here.

---

## Tension 1: archetype assignment against the three voice principle

**Status: open.** Both specs are current, neither is superseded, and the question they leave between
them is unanswered.

### What Contributor Identity says

`docs/Dialecta_Contributor_Identity.md` v1.1, section "The Fingerprint", line 85:

> "Archetypes are platform-assigned, never user-declared."

and, in the same line:

> "the assigned archetype is always derived from observed pattern."

The same spec, section "Open Questions for Future Sessions", line 166, keeps the single archetype
choice open on its own terms:

> "should a contributor whose pattern fits two archetypes equally well be shown both, or should the
> system always pick one? The current design picks one"

### What Growth Layer Principles says

`docs/Dialecta_Growth_Layer_Principles.md`, section "The Six Principles", Principle 6, "The
Self-Snapshot Is a Composition of Three Voices, and the User Holds the Pen". The binding form is in
section "What This Document Constrains", line 114:

> "Engine and community voices must be framed as signals, never verdicts."

> "Divergence between voices must be displayed honestly and never auto-resolved by the platform."

The sharpest statement of the conflict is in the same document, Principle 2, line 39:

> "The line is about *who issues the verdict*. The platform may offer scaffolds, prompts,
> frameworks, and selection mechanisms as **tools the user uses to describe themselves to
> themselves**. The platform may not use those same instruments to **issue verdicts about who the
> user is**."

> "A guided process that helps a user articulate 'I tend to formulate my reply while the other
> person is still talking' is a mirror. A quiz that returns 'You are a Type 4 Communicator' is a
> label. The first belongs in the Growth Layer; the second does not."

A platform assigned archetype is closer to the second than the first on its face. That is the
tension.

### What complicates the framing

The index states the tension as a straight collision. `docs/Dialecta_Project_Index.md`, section
"Harmonization Tensions", item 1, line 202:

> "The Contributor Identity spec assigns one archetype per contributor based on observed pattern,
> closer to a verdict than to a multi-voice composition."

and predicts an outcome:

> "The most likely resolution is that the existing archetype work becomes the *engine voice* inside
> the three-voice composition rather than a standalone label, but that decision should be made
> deliberately, not by default."

But the Growth Layer's own April 2026 addendum does not treat assignment as the problem. Section
"Aspiration and Archetype: The Clean Separation", line 166:

> "the assigned archetype is earned through observation"

and section "Aspiration's One Mechanical Effect", line 176:

> "The assigned archetype is never touched. It remains derived purely from observed pattern. The
> aspiration has no pathway to alter the archetype assignment. This is the constraint that keeps the
> identity layer honest."

So the Growth Layer Principles document endorses the assigned archetype in its own addendum while
Principle 2 of the same document forbids the platform issuing labels. Both sides of the tension are
inside one file.

### What is not specified

`docs/Dialecta_Self_Snapshot_Engine.md` v1.0 is the spec that would settle where the archetype sits.
It does not say. The archetype appears twice in it and neither is the answer:

- Section "Data Model", line 135: captures are stored "at trigger events" including "archetype
  shift". That makes the archetype a trigger, not a voice.
- Section "Relationship to Other Documents", line 173: "Voice 2 sources its data from the same
  pillar/archetype computation pipeline." That makes the archetype a shared data source, not a
  voice.

Its section "The Three Voices" names Voice 1 as the contributor's own, Voice 2 as the engine's
observation, Voice 3 as the community's reflection. The single assigned archetype is named in none
of the three.

**The open question, stated precisely:** whether the assigned archetype is Voice 2, is a fourth
element displayed outside the three voice composition, or is suppressed inside the snapshot view and
shown only on the profile. `Dialecta_Self_Snapshot_Engine.md` v1.0 does not specify it. The index's
prediction at line 202 is a prediction and appears in no spec.

Also unspecified, and load bearing on the same question:
`docs/Dialecta_Contributor_Identity.md` line 165 and
`docs/Dialecta_Data_Architecture.md` "Open Questions" both leave the archetype assignment threshold
open. From Data Architecture: "how much history is required before assigning an archetype rather
than showing 'pattern still forming.'" Until that threshold exists, how confidently the engine
speaks is undefined, which is the same grammar question Principle 6 turns on.

---

## Tension 2: per comment tier against contributor level pillars

**Status: the two documents disagree about whether this is open.** Cited both ways below. Not
resolved here.

### The side that says it is unspecified

`docs/Dialecta_Project_Index.md`, section "Harmonization Tensions", item 2, line 203. The
Classification Engine emits a tier per comment, the Contributor Identity layer aggregates comments
into pillar scores, and of the mapping between them:

> "which tier outcomes feed which pillars and with what weight"

> "is implied but not specified anywhere. This will need to be written before the contributor
> identity layer can actually be computed from real data."

Root `CLAUDE.md` line 83 carries the same position by listing the tension as deferred.

### The side that says it is specified

`docs/Dialecta_Axis_Mapping_v1.md` v1.1, dated 2026-04-29. Its subtitle, line 2:

> "Canonical function from Stage A classification data to axis_events and axis_scores. Closes the
> 'currently illustrative in the prototype' gap in Contributor Identity v1.1 line 164."

Section "Purpose", line 9:

> "Each comment a contributor posts can produce between 0 and 6 records in the immutable
> `axis_events` ledger."

> "is the canonical mapping defined here."

The document is complete in the sense the index asks for. It contains:

| Section | What it settles |
|---|---|
| "Per-axis triggers" | The trigger condition and graduation delta for each of the six pillars, with the tuning knob named for each |
| "Universal rules", rule 1 | "**Breach** comments produce **no axis_events at all**." |
| "Universal rules", rule 2 | Echo, Fog, Heat and Stance "still earn Consistency (presence)" |
| "Universal rules", rule 3 | "**Forum and Spark** earn the same +1 per triggered axis." |
| "Universal rules", rule 4 | Every triggered axis records the comment's `final_tier` in tier_mix |
| "Worst-case examples" | Five worked cases from a full Forum comment (6 events) to a Breach comment (0 events) |
| "Scoring (axis_scores recomputation)" | The replay loop, with the rule that scores are never accumulated incrementally |
| "Articles to Author Fingerprint" | The same mapping for articles, minus Discourse |
| "Tuning knobs" | Nine knobs with current values and tunable ranges |

The pillar side agrees it is closed. `docs/Dialecta_Contributor_Identity.md`, section "Open
Questions for Future Sessions", line 164, on pillar score computation:

> "defined in `Dialecta_Axis_Mapping_v1.md` as of 2026-04-29"

### Why the disagreement exists

`docs/Dialecta_Axis_Mapping_v1.md` is named nowhere in `docs/Dialecta_Project_Index.md`. The index
is the map, and this spec is not on it. See [drift-map.md](drift-map.md) section D5: ten specs are
off the map, and this is the one that costs the most.

### What is still open inside the mapping

The mapping exists, so the tension as stated is answered by
`docs/Dialecta_Axis_Mapping_v1.md`. Three sub-questions inside it are open, by that document's own
account, section "What's NOT in v1":

- **Decay function.** "Older graduations don't fade in the score."
- **Reply-driven Discourse boost.** Discourse counts only via `article_engagement` until threading
  ships.
- **Cross-axis bonus.** "Each axis is binary +1 per triggered comment in v1."

And from its "Tuning knobs" table, one knob is undefined rather than merely tunable: "Per-axis floor
for archetype assignment", current value "undefined". That is the same missing threshold named in
Tension 1.

**One thing to carry into any session on this:** the mapping was written against the Ghost era field
names and hooks. Section "Schema" cites `article_id` as `ghost_post_id`, and section "Hook" names
`api/article/publish.js`. ADR-001 removes Ghost and ADR-003 moves articles into Supabase, so the
trigger logic survives but the field plumbing in this spec does not. The mapping rules and the
plumbing need separating before either is quoted at a builder.

---

## Tension 3: the Reviser archetype depends on the Delta mechanic

**Status: the index marks it resolved. ADR-001 reopens the dependency in a different form.** Both
cited. Not resolved here.

### What the dependency is

`docs/Dialecta_Contributor_Identity.md`, section "The Eight Archetypes", line 96, defines the
Reviser as one who "Publicly updates their position when given good reasons", with the pillar
signature "High Calibration, high Consistency, with visible wave texture from earlier tiers
resolving into Forum."

Section "Why These Eight", line 107:

> "the only archetype defined by *change* rather than a static pattern."

> "The Delta mechanic is the feature that supports this archetype's growth."

Line 109 makes the coupling deliberate:

> "The Advocate and the Reviser exist specifically because the platform's two highest-leverage
> roadmap features (Advocate Engine, Delta mechanic) need cultural backing to actually work. A
> feature without an associated identity is a feature people use once and forget."

### The side that says it is resolved

`docs/Dialecta_Project_Index.md`, section "Harmonization Tensions", item 3, line 204. The entry is
struck through in the source and reads:

> "*Resolved v0.12 (2026-04-30).* Delta Mechanic shipped this evening. The Reviser archetype is now
> unblocked."

The same file, section "Future Sessions", "Delta Mechanic (Session 6)", line 194:

> "**Status:** Built 2026-04-30 (evening). Shipped in the same build cycle as Mention notifications.
> The Reviser archetype in the Contributor Identity spec is now unblocked."

The mechanic has its own spec, `docs/Dialecta_Delta_Mechanic_Spec.md`, which is present in this tree.

Root `CLAUDE.md` line 83 still lists the tension as deferred. On the index's account, that line is
stale.

### The side that reopens it

ADR-001 leaves Ghost entirely and the rebuild is `apps/web`. The Delta mechanic shipped on the Ghost
and Vercel and esbuild stack, per the index's v0.13 entry at line 279, which credits the article page
reading spine as "the structural surface that hosts the pre-read / post-read flow originally
specified in the Delta Mechanic spec". That surface is Ghost theme code. Root `CLAUDE.md` line 13
records that the theme checkout is "Not present on studio-pc as of 2026-09-08. The theme source is
not in this repo."

So the design question is settled and the implementation the index points at is both outside this
repo and outside the stack ADR-001 commits to. `docs/plans/build-plan.md` does not carry a Delta or
pre-read and post-read item in its phase table.

### What is not specified

Whether the Reviser archetype is computable before the Delta mechanic is rebuilt in `apps/web`. The
archetype's pillar signature in `docs/Dialecta_Contributor_Identity.md` line 96 is High Calibration
and high Consistency with tier texture, all of which `docs/Dialecta_Axis_Mapping_v1.md` can already
produce from ordinary comments with no Delta feature present. Whether that is sufficient to assign
the archetype, or whether an explicit acknowledged delta is required, is **not specified** in either
document.

`docs/Dialecta_Delta_Mechanic_Spec.md` section on qualification, line 174, sets a gate on the delta
side, that a qualifying comment must be at Forum tier with "minimum Specificity: named what changed;
minimum Charity: the argument that changed it must be stated fairly". It does not say whether the
Reviser archetype requires any such comment to exist. Note that this line uses two retired pillar
names, Specificity and Charity; see [drift-map.md](drift-map.md) section E1.

One more citation worth having when this is argued. `docs/Dialecta_Project_Index.md`, section
"Execution Prerequisites for the Growth Layer", line 160:

> "Notably, the Growth Layer does **not** depend on the Article Editorial Template, the opinion
> mapping tools, the Steelman/Advocate mechanic, or the Delta mechanic."

So the Growth Layer is explicitly independent of Delta while the Reviser archetype in the
Contributor Identity layer is explicitly coupled to it. Both statements are current.

---

## Summary table

| Tension | Open? | The two citations to put in front of Dan |
|---|---|---|
| 1. Archetype against three voices | Yes, and the live question is narrower than root `CLAUDE.md` states | `Dialecta_Contributor_Identity.md` line 85 against `Dialecta_Growth_Layer_Principles.md` Principle 2 line 39 and the constraint at line 114. `Dialecta_Self_Snapshot_Engine.md` v1.0 does not place the archetype in any voice |
| 2. Tier against pillars | The docs disagree about whether it is open | `Dialecta_Project_Index.md` line 203 says not specified anywhere. `Dialecta_Axis_Mapping_v1.md` v1.1 specifies it in full, and `Dialecta_Contributor_Identity.md` line 164 agrees |
| 3. Reviser against Delta | Resolved as design, reopened as a build dependency | `Dialecta_Project_Index.md` line 204 marks it resolved. ADR-001 retires the stack it shipped on, and root `CLAUDE.md` line 13 records the theme source as absent |

None of the three is resolved in this note. Two of the three need root `CLAUDE.md` line 83 corrected
before the session that resolves them, because the line as written points a reader at the wrong
question.

*Filed 2026-09-19. Read against commit `9a355c0`.*
