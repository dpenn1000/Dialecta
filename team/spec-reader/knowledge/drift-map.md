# Drift map

Every place a decision record overrides an older spec, and every place a doc still carries
retired vocabulary. Built 2026-09-19 by direct read of `docs/` at commit `9a355c0`.

The specs predate `docs/decisions/`. None of them says so on its own face. A spec quoted without
this map reads as current when it is not, which is how a confidently wrong citation happens.

**Quoting convention.** Editorial Voice v1.2 forbids em dashes, en dashes, and `--` in anything a
person reads. Several spec passages contain em dashes. Quotes below are clipped at the dash and
resumed as a second span rather than paraphrased or altered. Nothing inside a quotation mark is
reworded.

**Scope.** `docs/` only, 23 top level specs plus `docs/decisions/`, `docs/plans/`,
`docs/handoffs/`, `docs/reviews/`, `docs/articles/`, `docs/drafts/`. 71 files. The brief's figure of
93 documents does not match this tree; 71 is the count on disk.

---

## Quick reference: read this before citing

| About to cite | Stop, because |
|---|---|
| Anything in `Dialecta_Data_Architecture.md` about Ghost, Phase 1, or Phase 2 | ADR-001 and ADR-002 collapsed the two phase model. See A1, A2, B1 |
| `Dialecta_Project_Brief.md` "Tech Stack Options" | Tier 1 is closed by ADR-001. Tier 2 is also partly foreclosed by ADR-003. See A3, C1 |
| `Dialecta_Project_Index.md` on the Next.js migration | The index says the migration is closed. ADR-001 reverses that. See A5 |
| `Dialecta_Supabase_Scaling.md` Phase 4 trigger | Says Ghost is confirmed. ADR-001 reverses it, and no ADR names this file. See A4 |
| `dialecta-profile-ghost-integration.md` anything | Historical per ADR-001, still sitting in `docs/` root, and full of retired archetypes. See A6, E3 |
| The mapping from per comment tier to pillar scores | The index says it is unspecified. `Dialecta_Axis_Mapping_v1.md` specifies it in full. See D4 |
| Classification weighting percentages | No spec states them. See F1 |
| An entity table type in `Dialecta_Data_Architecture.md` | The entity tables contradict the Identity Types section of the same file. See B2 |
| Any spec not named in the index | 10 real specs are off the map. See D5 |
| A comment-side Stage 2.5, anywhere it is cited (A-3, `CLAUDE.md`'s weighting, the Editorial Template's symmetry table, the Delta Mechanic Spec) | Named in four places, defined in none. See I4 |
| The article aesthetic/polish pass (`aesthetic-suggest.js`) as a designed feature | No governing spec. Two docs name the file in passing; neither specifies it. See J1 |

---

## A. ADR-001 overrides: leave Ghost entirely

`docs/decisions/ADR-001-leave-ghost.md`, 2026-09-19, Status: Decided. Decision section: "Leave
Ghost now." Its own `## Specs touched` names three files. Two more carry the same superseded claim
and are not named.

### A1. Data Architecture still states Ghost as the confirmed stack

`docs/Dialecta_Data_Architecture.md`, section "Ghost CMS Integration Notes (Phase 1)", line 372:

> "The Phase 2 Next.js + Supabase migration is currently deferred per platform direction (Ghost is
> the confirmed production stack)."

ADR-001 reverses this. Named in ADR-001 `## Specs touched` as "mark historical". Not marked. The
sentence reads as present tense fact.

### A2. The same file's Phase 1 and Phase 2 framing

`docs/Dialecta_Data_Architecture.md`, section "Identity Types: Phase 1 vs Phase 2", lines 33 to 48,
and the v1.2 changelog at line 5. The whole two phase structure assumes Ghost occupies Phase 1.
ADR-002 `## Specs touched`: "Phase 2 (Supabase-native uuid) is now the only phase."

### A3. Project Brief Tier 1 is closed

`docs/Dialecta_Project_Brief.md`, section "Tech Stack Options", subsection "Tier 1 Launch Fast
(0 to 6 months)", line 177: "Ghost CMS + Custom React Components". Line 184 recommends it for
"Getting the concept live, proving community mechanics, validating the tier system with real
humans."

ADR-001 `## Specs touched`: "Tier 1 (Ghost) is closed; Tier 2 is the build." Named. The spec is
unmarked.

### A4. Supabase Scaling carries the same superseded claim and no ADR names it

`docs/Dialecta_Supabase_Scaling.md`, line 203:

> "Currently deferred per platform direction. Ghost is the confirmed production stack."

This is the same claim as A1, in a different file. It appears in no ADR's `## Specs touched`.
**Gap.** An agent reading the scaling spec for Phase 4 guidance gets the pre ADR answer with
nothing to warn it.

### A5. The index itself says the migration is closed

`docs/Dialecta_Project_Index.md`, section "Cleanup Items", Resolved, v0.12 entry, line 297:

> "Next.js migration is no longer 'deferred'; it is closed. To reopen the question, a specific
> concrete blocker on the current stack would need to be named."

ADR-001 is that reopening. This is the most dangerous single line in the corpus, because the
mandate in `.claude/agents/spec-reader.md` says to start from the index. Following the method
exactly lands on a statement that the rebuild is closed. Named in no ADR. **Gap.**

### A6. The Ghost integration doc was never moved

ADR-001 `## Specs touched`: "docs/dialecta-profile-ghost-integration.md: historical, move to
`docs/handoffs/` at cutover." Still at `docs/dialecta-profile-ghost-integration.md`, in the root of
the spec folder, with no historical marker. See also E3 for its retired vocabulary.

---

## B. ADR-002 overrides: Supabase Auth is the one identity

`docs/decisions/ADR-002-supabase-auth-identity.md`. Decision: "Supabase Auth, magic link plus
Google, with `profiles.user_id` referencing `auth.users`."

### B1. Identity Types section, both phases

`docs/Dialecta_Data_Architecture.md`, section "Identity Types: Phase 1 vs Phase 2", line 37:

> "All references to Ghost-side identities"

> "are stored as `text`, not `uuid`."

Line 39 describes Phase 2 as a future "Supabase auth migration". Under ADR-002 there is one phase.
Named in ADR-002 `## Specs touched`. Correctly named, not marked in the spec.

### B2. The entity tables contradict the Identity Types section of the same file

Not an ADR matter. A trap inside one spec, and it survives the ADR.

`docs/Dialecta_Data_Architecture.md`, section "The Nine Core Data Entities", entity 1 `comments`,
lines 61 and 62, give `author_id` and `article_id` as type `uuid` with the note "References Ghost
member ID in Phase 1". The Identity Types section, line 37, says those must be `text`. Line 48
admits the conflict:

> "Where prior versions of this document said `uuid` for fields like `comments.author_id` or
> `axis_scores.contributor_id`, read that as `text` in Phase 1."

The entity tables were never corrected. Under ADR-002 the type is `uuid` again, but referencing
`auth.users` rather than a Ghost member. A reader taking the entity table at face value now gets
the right type for the wrong reason, and would carry the Ghost framing with it.

---

## C. ADR-003 overrides: build the editor and article server in-house

`docs/decisions/ADR-003-native-editor.md`. Decision: "Own editor." Storage is "TipTap JSON in
`articles.body_json`".

### C1. ADR-003 forecloses part of the Tier 2 that ADR-001 points at

ADR-001 says "Tier 2 is the build". `docs/Dialecta_Project_Brief.md` line 189 defines Tier 2 as:

> "Next.js + Headless CMS (Sanity or Contentful) + Supabase"

ADR-003's options table rejects "Sanity or another headless CMS". So Tier 2 as written is not the
build either: its CMS component is foreclosed, its Next.js and Supabase components stand. Neither
ADR states this interaction. **Gap.** A builder told "Tier 2 is the build" would reach for Sanity.

### C2. The note ADR-003 asks for does not exist

ADR-003 `## Specs touched`: "docs/Dialecta_Article_Editorial_Template.md: no change to the flow;
add a note that the composer is the implementation surface."

Verified: `docs/Dialecta_Article_Editorial_Template.md` contains no reference to a composer, an
editor, or an implementation surface. The instruction was not carried out. The flow itself is
unchanged and remains citable as written.

### C3. ADR-003 names a section of Data Architecture that does not exist

ADR-003 `## Specs touched`: "docs/Dialecta_Data_Architecture.md, `articles` entity: the new columns
above."

Verified: `docs/Dialecta_Data_Architecture.md` has no `articles` entity. Its entity list runs
`comments`, `classifications`, `axis_events`, `axis_scores`, `fp_snapshots`, `archetypes`,
`aspirations`, `feed_events`, `comments (community voting)`, `follows`, `sparring_partners`,
`opinion_map_positions`. Articles are Ghost's in that document, per section "Ghost CMS Integration
Notes (Phase 1)", line 364: "Ghost owns: articles, member authentication, subscription management,
email delivery."

**Gap.** An agent told to add columns to the `articles` entity in Data Architecture will find no
such entity. The columns ADR-003 lists are real and are in `docs/plans/build-plan.md`; the spec
target is not.

---

## D. The index contradicts itself and is incomplete

`docs/Dialecta_Project_Index.md` v0.16 is the mandated entry point. Six problems.

### D1. The index gives the Article Editorial Template two steelman references it does not have

Line 75 describes `Dialecta_Article_Editorial_Template.md`: "Contains two pending Steelman to
Advocate references, see Cleanup Items."

Line 261, in Resolved v0.14, says the opposite: "zero matches in
`Dialecta_Article_Editorial_Template.md`, zero in `Dialecta_Project_Brief.md`."

Verified by grep: zero occurrences of "steelman" in either file, any case. Line 261 is right and
line 75 is wrong. The Article Editorial Template uses "Advocate prompt" at line 54.

### D2. The index's own Future Sessions section contradicts its Resolved section

Lines 188 to 190, "Steelman to Advocate Terminology Scrub": "Status: Partially complete." and
"Three other files still carry 'Steelman' references."

Line 261 calls the same scrub "verified moot" with only two intentional verb usages left.

Verified: the two remaining usages are verb usages and are correct as written. See E4. The Future
Sessions entry is stale.

### D3. The index cites a line number that moved

Line 261 places the surviving verb usage in `Dialecta_Editorial_Voice.md` at "line 264". The actual
location is line 203. Editorial Voice was rewritten to v1.2 on 2026-09-08 and the line numbers
shifted. Any citation of Editorial Voice by line number taken from the index is stale.

### D4. The index says the tier to pillar mapping is unspecified. It is fully specified.

Line 203, Harmonization Tension 2, says of the mapping from per comment tier to contributor pillar
scores that it is:

> "implied but not specified anywhere"

and that it "will need to be written before the contributor identity layer can actually be computed
from real data."

`docs/Dialecta_Axis_Mapping_v1.md` v1.1, 2026-04-29, is that document. Its subtitle, line 2:

> "Closes the 'currently illustrative in the prototype' gap in Contributor Identity v1.1 line 164."

It carries a per axis trigger table, six universal rules, five worked examples, the axis_scores
recomputation loop, an article side mapping table, a list of what is not in v1, and nine tuning
knobs. `docs/Dialecta_Contributor_Identity.md` line 164 agrees it is closed:

> "defined in `Dialecta_Axis_Mapping_v1.md` as of 2026-04-29"

The index never names `Dialecta_Axis_Mapping_v1.md` anywhere. See D5.

### D5. Ten specs are not on the map

The mandate says to start from the index to find which spec owns a topic. These files exist in
`docs/` and are named nowhere in the index:

| Spec | What it owns |
|---|---|
| `Dialecta_Axis_Mapping_v1.md` | The canonical tier to pillar mapping. See D4 |
| `Dialecta_Self_Snapshot_Engine.md` | The three voice composition, v1.0 |
| `Dialecta_Founding_Philosophy.md` | Founding thesis |
| `Dialecta_Activity_Rhythm_View.md` | Engagement cadence surface |
| `Dialecta_Discourse_Layer_UX.md` | Comment surface UX and the control bar |
| `Dialecta_Growth_Scroll.md` | Growth scroll surface |
| `Dialecta_Relationship_Types.md` | Follows, sparring partners, correspondents |
| `Dialecta_Supabase_Scaling.md` | Scaling and the Phase 4 trigger. See A4 |
| `Dialecta_Tuning_Engine_Spec_v1.md` | The tuning knob surface |
| `dialecta-profile-ghost-integration.md` | Historical per ADR-001. See A6 |

Following the mandated method exactly misses the spec that answers Harmonization Tension 2.

### D6. Known Gaps says there are none

Line 148: "None currently. All previously tracked conceptual gaps have been closed." Three
harmonization tensions remain listed at lines 202 to 205 in the same file, and the ADR drift above
is unrecorded.

---

## E. Retired vocabulary

Canonical, from `.claude/agents/spec-reader.md` and root `CLAUDE.md` "Locked decisions":

- Tiers: Forum, Spark, Echo, Fog, Heat, **Stance** (was Static), **Breach** (was Off the Air)
- Pillars: **Acuity** (was Specificity), **Reach** (was Range), Calibration, **Magnanimity** (was
  Charity), Discourse, Consistency
- Archetypes: **Skeptic** (was Challenger), Synthesizer, **Advocate** (was Diplomat, never
  steelman), Builder, Empiricist, Contextualist, Illuminator, **Reviser** (replaced Oracle)

Three classes. Only the first needs a fix.

### E1. Live retired vocabulary, constrains a build

| File and line | Text | Retired term |
|---|---|---|
| `Dialecta_Delta_Mechanic_Spec.md`:174 | "Each qualifying comment at Forum-tier (minimum Specificity: named what changed; minimum Charity: the argument that changed it must be stated fairly)" | Specificity, Charity |
| `Dialecta_Growth_Scroll.md`:59 | "Mature asymmetry, Acuity and Charity as defining poles" | Charity |

Both are capitalized pillar names, not the lowercase engine term, and the Delta Mechanic one sets a
gate on a build rule. Neither file was covered by the index's Cleanup item 10, which surveyed only
`Dialecta_Classification_Engine_Specification.md`, `Dialecta_Project_Brief.md` and
`Dialecta_Tier_Psychology.md` before declaring the propagation "verified moot" at line 264. The
survey was scoped too narrowly. `Dialecta_Growth_Scroll.md` line 59 is the clearest case, because it
pairs the new name Acuity with the retired name Charity in one clause.

### E2. The retired tier names are not live anywhere. The lead's premise was wrong.

The reading list lead implied docs still use Static for Stance and Off the Air for Breach as live
vocabulary. Verified false for this tree.

`Dialecta_Classification_Engine_Specification.md`, the file the April 2026 coherence audit called
the worst offender, now reads Stance and Breach: lines 60 and 61 in the tier table, lines 118 and
119 in the prompt template, lines 199 and 200 in the boundary discussion. The fix landed.

Every surviving occurrence of Static or Off the Air in `docs/` is documented rationale or changelog.
See E3.

### E3. Correct historical usage, do not change

| File and line | Why it is correct |
|---|---|
| `Dialecta_Tier_Psychology.md`:137, 150 | Explains why Stance was chosen over Static, and lists Static among rejected alternatives. This is the document whose job is to record the renaming |
| `Dialecta_Tier_Psychology.md`:172, 176 | Same for Breach over Off the Air |
| `Dialecta_Cleanup_Continuation.md`:19 | Changelog line recording the rename |
| `Dialecta_Contributor_Identity.md`:130 | "The Oracle (retired)", with the reason it was retired |
| `Dialecta_Editorial_Voice.md`:301 | "Principle of Charity, formalized by Neil Wilson, 1959". The philosophical principle, not the pillar |
| `Dialecta_Contributor_Identity.md`:48 | "the philosophical Principle of Charity". Same |

### E4. Steelman as a verb, intentional

Two occurrences in `docs/`, both confirmed intentional by the index at line 261: "Correct as
written; do not change."

- `Dialecta_Contributor_Identity.md`:48, "A contributor with high Magnanimity does not strawman;
  they steelman."
- `Dialecta_Editorial_Voice.md`:203, "Write one sentence that steelmans the position you most
  disagree with."

The archetype is Advocate. The verb describes the intellectual practice. The distinction is
deliberate and the two files preserve it.

### E5. Engine vocabulary against pillar label, correct by design

Lowercase `specificity` is an engine field, `Acuity` is the pillar. The docs keep these apart on
purpose. `Dialecta_Axis_Mapping_v1.md` line 19 shows it done right: the axis is **Acuity**, the
trigger condition is `specificity_score >= 1`. `Dialecta_Classification_Engine_Specification.md`
line 38, "The Claim Specificity Spectrum (0 to 3)", is the engine term and is correct.

Do not scrub these. The index recorded the reasoning at line 264: "Engine vocabulary versus pillar
label are intentionally distinct layers; the docs preserve that distinction correctly."

### E6. Retired archetypes live in the Ghost integration doc

`docs/dialecta-profile-ghost-integration.md`:

- Line 447: "Desktop ARCHETYPES has eight entries ending in **Diplomat, Builder, Empiricist,
  Contextualist, Illuminator, Oracle**."
- Line 449: mobile "has eight entries ending in **Advocate** (replaces Diplomat) and **Reviser**
  (replaces Oracle)."
- Line 465: proposes to "revert mobile to Diplomat + Oracle until Steelman/Advocate is formally
  decided."
- Line 457: calls it a decision "still flagged 'no decision reached yet' in the project memory".

Advocate and Reviser are locked in root `CLAUDE.md`. The decision was made. This file is marked
historical by ADR-001 but sits unmarked in the spec folder root. Highest risk of a wrong citation
of any file in `docs/`, because it reads as a live open question.

### E7. Outside `docs/`, for the record

Outside the mandate's scope, flagged because it is build facing. `components/dialecta-fingerprint.jsx`
line 96 and `components/dialecta-fingerprint-engine.jsx` line 129 both define an axis with
`key: "charity", label: "Charity"`, and `components/dialecta-growth-scroll-v5.jsx` line 21 does the
same. `components/dialecta-fingerprint.jsx` line 1476 describes an archetype as one who "Steelmans
opposing views. Heavy Calibration and Charity". Root `CLAUDE.md` notes these are "the older April
project exports". They are not canonical and should not be read as spec.

---

## F. A locked decision with no spec behind it

### F1. The classification weighting percentages are in no spec

Root `CLAUDE.md`, "Locked decisions", line 63:

> "Classification weighting: AI 40%, community voting 35%, self-declaration 15%, Stage 2.5 response
> quality 10%."

Searched all of `docs/` for those figures and for any two digit percentage. They do not appear. The
nearest spec statement is ordinal only, `docs/Dialecta_Article_Editorial_Template.md`, section
"Weight in the Algorithm", line 110:

> "The author's choice at Stage 2.5 carries real but subordinate weight in the final tier
> determination:"

with AI and community as "primary signal" and author self-declaration and the Stage 2.5 response as
"secondary signal", lines 112 to 115. The ranking matches the percentages. The numbers do not
come from a spec.

Worse, the same file's "Open Calibration Questions", line 198, lists as still open:

> "The precise weight of Stage 2.5 disagreement in the final tier algorithm."

So the spec calls open what root `CLAUDE.md` calls locked. If asked what the spec says about
classification weighting, the answer is: the ordering is specified, the percentages are **not
specified in `docs/`**, and the spec that owns the question lists the exact weight as open.

---

## G. Table and entity names that will not match

### G1. `comment_votes` against `tier_nominations`

`docs/Dialecta_Self_Snapshot_Engine.md` line 70 sources Voice 3 from:

> "Indicators sourced from `comment_votes` and `classifications`"

`docs/plans/build-plan.md` line 48 also names `comment_votes`. Root `CLAUDE.md` "Known drift",
line 72, records that the live Supabase project calls this table `tier_nominations`. Spec and build
plan agree with each other and both differ from the live database.

### G2. Nine entities, twelve entries, `comments` twice

`docs/Dialecta_Data_Architecture.md`, heading at line 52: "The Nine Core Data Entities". The section
numbers entities 1 through 12. Entity 1 is `comments` and entity 9 is also headed `comments`, as
"comments (community voting)", which is the votes table rather than a second comments table. The
heading count and the entity numbering have drifted apart across the v1.1 and v1.2 revisions.

---

## H. Not present locally, which is not the same as not specified

This agent has three possible answers, not two, and the third is easy to lose:

- **Not specified.** The spec exists, was read, and is silent. Say not specified, do not infer.
- **Not present.** A document is named in the archive and its content is absent from this tree. The
  question may well be specified, in a file nobody here can read.
- **Present but superseded.** The file is on disk and is an older export. Reading it gives a
  confident answer that is out of date.

### H1. The count is wrong

The reading list lead and the task framing both say eleven files. Root `CLAUDE.md`, section "Known
drift and open work", names **twelve** paths plus "two logos", and one of the twelve is a glob
covering an unknown number of files. Root `CLAUDE.md` itself states no number.

### H2. Verified status of each named path

| Named in root `CLAUDE.md` | Status in this tree |
|---|---|
| `Fundamentals/Dialecta_Stewards_Reflection.txt` | **Present.** `docs/Dialecta_Stewards_Reflection.txt`, 8,145 bytes, real content. The entry is wrong |
| `Fundamentals/dialecta-quote-library.json` | **Absent.** `design/dialecta-quote-library.html` is a different file in a different format |
| `Data Handling/dialecta_data_architecture.svg` | **Absent.** No svg by that name anywhere |
| `Write Layer/Articles/*.txt` | **Absent as `.txt`.** `docs/articles/` holds six `.md` files. Whether they are that content converted is not determinable from this tree |
| `Dialecta-Private-Draft-Mode.jsx` | **Absent** |
| `Fundamentals/dialecta-discourse-layer.jsx` | **Present but superseded.** `components/dialecta-discourse-layer.jsx` |
| `Fundamentals/dialecta-fingerprint-engine.jsx` | **Present but superseded.** `components/dialecta-fingerprint-engine.jsx` |
| `Fundamentals/Components/WoodFrameProgressBar.jsx` | **Absent** |
| `Growth Layer/dialecta-growth-scroll-v5.jsx` | **Present but superseded.** `components/dialecta-growth-scroll-v5.jsx` |
| `Opinion Map/dialecta-opinion-maps.jsx` | **Absent.** `components/dialecta-opinion-map-briefing.html` is a different file |
| `Private Draft Mode/dialecta-s11-private-draft-mode.jsx` | **Absent** |
| `Profile Pages/dialecta-profile-responsive.jsx` | **Present but superseded.** `components/dialecta-profile-responsive.jsx` |
| two logos, unnamed | **Not determinable.** `design/logos/` holds sixteen files. Which two were meant is not specified |

Four present but superseded, seven absent, one present and wrongly listed, one glob, one pair not
identifiable.

The superseded class is root `CLAUDE.md`'s own characterization, same bullet: "The `components/`
copies of the jsx files are the older April project exports." That is why those four are not simply
present, and section E7 above is what reading them wrong costs.

### H3. What is out of reach, and what still answers it

A question that would be settled by one of the seven absent files gets "not present locally" and a
pointer, never "not specified".

| Topic | Absent source | Prose spec that still covers the intent |
|---|---|---|
| Quote library seed data, as data | `dialecta-quote-library.json` | `design/dialecta-quote-library.html`, and the seed library in `docs/Dialecta_Editorial_Voice.md` |
| The data architecture diagram | `dialecta_data_architecture.svg` | `docs/Dialecta_Data_Architecture.md` in prose |
| Private Draft Mode component behavior | two private draft files | `docs/Dialecta_Discourse_Layer_UX.md` |
| The WoodFrameProgressBar contract | `WoodFrameProgressBar.jsx` | None found. Not present and not specified |
| The opinion maps component as shipped | `dialecta-opinion-maps.jsx` | `docs/Dialecta_Project_Brief.md` "Opinion Mapping Tools", `docs/Dialecta_Delta_Mechanic_Spec.md` |
| Article source text as first drafted | `Write Layer/Articles/*.txt` | `docs/articles/`, six `.md` files |

So design intent is usually readable even where the component is not. Say which of the two is being
answered from. `WoodFrameProgressBar` is the one case that is both absent and unspecified.

### H4. Two corrections owed to root `CLAUDE.md`

Neither is this agent's to make, so both are reported rather than edited: the Stewards Reflection
entry is wrong, and the list conflates absent with present but superseded. The retrieval instruction
in the same bullet, "open them once in Explorer to download, then re-copy", is a user side action.
Nothing in this repo can recover these files.

---

## I. Found during the 2026-09-20 sprint, not from the ADR/vocabulary sweep

### I1. Axis Mapping v1.1's own implementation replaced its rules, not just its Ghost fields

`docs/Dialecta_Axis_Mapping_v1.md`'s two Ghost-era citations (line 102 `ghost_post_id`, line 104
`api/article/publish.js`) are dead per ADR-001/003 and the port at
`packages/core/src/axis-mapping.ts` never carried them forward, confirmed by a full-file grep.
But the port also does not implement the spec's binary, tier-gated trigger table at all: every one
of the six axes uses different input fields and continuous rather than binary deltas, and
Consistency is hardcoded to 0 pending a history rule the spec does not need. Neither the spec nor
a version bump records this. Full account: `2026-dialecta-axis-mapping-v1.md`.

### I2. Tier Psychology's own status line marks Stance and Breach provisional; the lock does not

`docs/Dialecta_Tier_Psychology.md` v1.1's closing status line: "The Stance and The Breach names
are still provisional pending user testing." Root `CLAUDE.md` "Locked decisions" states the same
two names with no caveat. The reverse of F1: here a spec hedges a name the lock treats as settled,
rather than a lock with no spec behind it at all. Full account:
`2026-dialecta-tier-psychology.md`.

### I3. The classification weighting is no longer just unspecified, it is now shipped code sourced straight from CLAUDE.md

F1 established the percentages are in no spec. `packages/core/src/resolution.ts` now implements
them (`RESOLUTION_WEIGHTS`), with a doc comment that cites root `CLAUDE.md` as the only source,
honestly, and a weighted-sum-with-AI-tie-break algorithm that exists in no prose document at all.
One of its four inputs, `stage25Quality`, has no comment-side spec to source it from:
`docs/Dialecta_Discourse_Layer_UX.md` has no Stage 2.5, confirmed by grep; only the article side
does. Full account: `2026-dialecta-classification-weighting-provenance.md`.

### I4. A fourth document assumes a comment-side Stage 2.5, and none of the four defines it

`docs/Dialecta_Delta_Mechanic_Spec.md` line 33 and line 160 both reference "Stage 2.5" as an
existing step in comment classification ("mirror the comment classification system's Stage 1 /
Stage 2 / Stage 2.5 / Stage 3 structure"; a DELTA ACKNOWLEDGED comment "passes through the normal
classification engine (Stage 1 → Stage 2 → Stage 2.5)"). The spec's own mechanic is six stages
labeled A through F and is a different system, article-level position tracking, not comment
classification. It never says what a commenter sees or does at a comment-side Stage 2.5.

That makes four citations of a comment-side Stage 2.5 and zero definitions of one: this spec,
`docs/plans/backlog.md` A-3 ("Discourse Layer UX, Stage 2 and 2.5"), root `CLAUDE.md`'s locked 10
percent for "Stage 2.5 response quality," and `Dialecta_Article_Editorial_Template.md`'s symmetry
table (line 33: `| **2.5** | **Amendment Window** | **Amendment Window** |`). The Editorial
Template is the only document that ever writes out Stage 2.5 content, and its detailed section
("## Stage 2.5 — The Amendment Window," from line 94) describes only the article side: Amend,
Respond for the Record, Post As-Is, `amend_until`. Full account:
`2026-dialecta-delta-mechanic-spec.md`.

---

## J. A feature with working production code and no governing spec

### J1. `aesthetic-suggest.js` is real, deliberate code. No spec in `docs/` designs it.

`_recovered/api/article/aesthetic-suggest.js`, flagged by `designer`
(`2026-09-19-005-blindspot-aesthetic-suggest-exists-in-production.md`): a Haiku-backed article
polish engine, four levels (light, standard, editorial, custom), server-side at submit time,
`polished_html` plus `change_log` output, byte-for-byte prose preservation outside a fixed set of
policy transforms (punctuation hygiene, a hard one-way em-dash and en-dash removal policy, smart
quotes, layout-cruft removal, sources-section and pseudo-header tagging, and at higher levels
thematic breaks, pullquote extraction, list conversion, emphasis additions).

`docs/Dialecta_Article_Editorial_Template.md`, the document that specs what happens when an author
submits an article, never mentions it. Grepped for "polish," "aesthetic," "pullquote," "thematic
break," "change_log," "em-dash": zero hits, every term.

Two documents name the file without designing it. `Dialecta_Tuning_Engine_Spec_v1.md`, section "5.
Polish Engine (future)," treats it as existing, "TUNING-marked" code and scopes only a future
admin panel to expose its length budgets, suggestion caps, and distribution rules as knobs, v3
priority. `Dialecta_Project_Index.md`'s own build-log entries (its running session history, not a
governing section) record after the fact that Polish v2 shipped with four levels, server-side at
submit, byte-for-byte preservation, matching the code closely, which is history, not a spec that a
builder could build from or a reviewer could check code against.

Backlog A-10 and A-11 cite the Article Editorial Template as their governing spec; that spec is
silent on this entire feature. A builder working A-10 from the cited spec alone would not know
this code, or the design intent behind it, exists.

---

## What this map does not cover

- `docs/handoffs/` and `docs/reviews/` are write once records, read as history rather than as
  current spec. They contain many retired names by design. Not audited here beyond confirming the
  fixes they describe landed.
- Whether the live Supabase schema matches any of these specs. Root `CLAUDE.md` line 72 and
  `exchange/open/2026-09-19-001` own that question.

*Filed 2026-09-19. Read against commit `9a355c0`. Re-verify line numbers after any spec edit;
D3 is what happens when they move. Section I appended 2026-09-20. I4 and section J appended
2026-09-20, Mission Zero pass.*
