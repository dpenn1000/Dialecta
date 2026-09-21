# spec-reader position: port or rewrite

## Brief

Fifty-one recovered files carry a five-month-old implementation of specs that were still being
written. Spec fidelity, not line count or Ghost coupling, is what should sort which ones port:
`dialecta-private-draft.jsx` builds a full comment-side Stage 2.5, a twelve-second lock then
Accept, Amend, or Respond-for-Record, with wait-time constants `Dialecta_Tuning_Engine_Spec_v1.md`
names as real and tracked. `Dialecta_Discourse_Layer_UX.md`, the document whose own purpose line
claims to specify this exact file, describes a three-stage flow with no Stage 2.5 at all. Four
other documents already assumed a comment-side Stage 2.5 existed and never defined one; this file
built it, and nobody wrote down why.

## Method and what I have not read

Every finding below is anchored to a file I opened directly this session, quoted where the spec's
own words matter, or to another seat's position I am told not to re-derive (named where used). I
did not read `dialecta-editor.jsx`, `dialecta-discourse-layer.jsx`, or `dialecta-private-draft.jsx`
end to end; each is 1,200 to 4,700 lines. I read their docblocks in full and the specific functions
named below (grep-located, then read in context), which is enough to verify what a file claims
about itself and whether that claim holds, not enough to certify every line. Anything I have not
read is marked provisional.

Dan's position carries real weight and I am not arguing against porting. I am arguing that "port"
is not one verb here: a file that implements a spec faithfully should port close to as-is because
the decision behind it was already made carefully. A file that contradicts a decided spec ports a
bug if nobody notices. A file that implements something no spec describes is porting an
undocumented product decision, silently, which is a different risk from either of the other two and
the one this tree has the most of.

---

## 1. Files that implement a spec faithfully

These are the strongest port candidates in the tree on content and structure. Most still carry
Ghost identity at the wire layer (see section 4), which is a separate, already-measured cost
(`builder`'s and `security`'s ghost-coupling positions) and does not touch the verdict here: the
UX and business logic is worth keeping, only the plumbing underneath it needs redoing.

**`dialecta-editor.jsx`, `DeclareStage` (lines 4158-4356).** Implements
`Dialecta_Article_Editorial_Template.md`'s five Declaration Layer questions (lines 44-67) field for
field: Core Claim, Scope Boundary, Strongest Objection, Suggested Tier, Opinion Mapping Suggestion,
split across two screens the code calls "breaths" rather than one, which the spec does not forbid
("Five questions. No more," line 42, says nothing about layout). The Suggested Tier question
renders the same seven-tier grid the spec asks for and shows the tier's plain-language meaning
inline, matching "same system as comments, required" (line 59).

**`dialecta-editor.jsx`, `Stage25` (lines 2830-2900).** Implements
the spec's "Stage 2.5" section, subtitled "The Amendment Window" (line 94), almost word
for word: three options labeled Amend, Respond for the Record, Post As-Is (spec lines 100-107, code
lines 2861-2877), and the footer text "A reasoned disagreement nudges the tier slightly toward your
declared position. The engine and the community stay primary" (code line 2896) restates the spec's
"Weight in the Algorithm" section almost verbatim: "a well-reasoned disagreement with the AI nudges
the tier slightly toward the author's declared position" (spec line 115). This is the cleanest
one-to-one match in the whole tree.

**`dialecta-nomination-panel.jsx`.** Its own docblock says so and is right: "Implements Stage 3 of
Dialecta_Discourse_Layer_UX.md (lines 177-258) and the third leg of the three-input final-tier model
from Dialecta_Article_Editorial_Template.md (lines 109-117)." I read the UX spec's Stage 3 section
directly: Step 1 (all seven tiers as a single-column list, Breach divided off below a "Pact
violation" divider), Step 2 (seven predefined reasons plus a 140-character note), the Breach
Distinction warning panel, and a receipt-strip confirmation state. The component's own three states
(Closed, Composing, Submitted/receipt) and its `NON_BREACH_TIERS` / `BREACH_TIER` split match this
structurally. Strong port candidate; the file even names its own citation, which no other file in
the tree does as precisely.

**`dialecta-article-classification.jsx`.** Docblock: "Per the Article Editorial Template, AI
analysis is disclosed alongside the published article, never used to gate publication." That is a
near-verbatim restatement of the spec's own sentence: "The AI's analysis is disclosed alongside the
published article, never used to gate publication" (`Dialecta_Article_Editorial_Template.md` line
80). `ArticleTierBadge`'s three-way readout (author-declared, engine-suggested, final) matches
the spec's "Community Influence" section, subtitled "Post-Publication": "The author's self-declared
tier, the AI-suggested tier, and the community-voted tier are all publicly visible" (line 140).

**`dialecta-community-feed.jsx`, `dialecta-community.jsx`, `dialecta-community-author.jsx`,
`dialecta-community-contributors.jsx`.** The task frames these as surfaces nobody has named a spec
for. One exists and the file names it: `dialecta-community-feed.jsx`'s docblock cites
`Dialecta_Social_UX_Architecture.md` by name, and I read that spec in full (147 lines). The match is
close to exact: the four content types (Article Hot+Relevant, Thread Spotlight, Identity Event,
Opinion Map Topology Change) are the spec's own "Feed Architecture" section headings in the same
order; the code's comment "That single architectural decision encodes the platform's values into
what climbs the feed" paraphrases the spec's "This is a single architectural decision that encodes
the platform's values directly into what feels important" (spec line 39); the code's "Risk 3:
surface milestones, NEVER activity volume. Recognition vs. surveillance" quotes the spec's own
section header and rule of thumb almost exactly (spec lines 106-108). `dialecta-community.jsx`'s
three-surface model and `dialecta-community-author.jsx`'s Author View are also consistent with this
spec's phase table, though the "three-surface model" label itself is sourced only to an internal
memory reference in the code comments, not to text in `docs/` (worth a line in section 3). Strong
port candidates for the same reason as the feed: real design work, faithfully built, only the
`viewer=<ghost_member_id>` query params need re-sourcing.

**`dialecta-opinion-map-placement.jsx`, `ArticlePreReadMap` and `usePlacement`.** Docblock: "Reader-
side placement layer for opinion maps. The Delta Mechanic." I read `Dialecta_Delta_Mechanic_Spec.md`
in full. Stage A ("Pre-Read Snapshot") requires the pre-read widget before the reader engages
content and says nothing about the author's own position; the code enforces "Author position is
HIDDEN on pre-read so the reader's starting point is not biased by knowing where the author
landed," which is the spec's own concern (the pre-read framing is "curiosity, not registration,"
spec line 54) applied correctly. This file implements Stages A and C (capture only, not
calculation, reveal, or the public-choice DELTA ACKNOWLEDGED flow: see section 3). Port the
capture mechanism; the rest of the mechanic does not exist yet anywhere in this tree.

**`dialecta-fingerprint-engine.jsx`.** Covered in full by `docs/FINGERPRINT.md`, which I read and
treat as already-verified prior work rather than re-deriving. Summary for this position: the six
axes match `Dialecta_Contributor_Identity.md`'s Six Pillars exactly (renamed from the engine's
earlier specificity/charity/originality labels to acuity/magnanimity/reach), the petal-graduation
and tier-mix-texture model matches the same spec's "The Fingerprint" section ("tall smooth Acuity
petal," "wave texture... earlier Stance behaviour," Contributor Identity lines 70-77), and ADR-004's
Breach-residual decision fits the engine's existing turbulence/dilution architecture without a
rewrite, per `designer`'s read. One real gap, not a contradiction: Breach produces no representation
in the data object at all today, because `packages/core/src/axis-mapping.ts` zeroes every axis on a
Breach comment (Universal Rule 1) and nothing carries a Breach count forward into the fingerprint's
input shape. Nothing here was dropped in the port; that channel never existed to drop.

---

## 2. Files that contradict a spec

Porting these ports the contradiction silently. Two of the three below contradict a decided ADR,
which is a higher bar than contradicting a five-month-old prototype doc, and I read both sides
before saying which one is right.

**`dialecta-editor.jsx`'s own architecture choice contradicts ADR-003.** The file's header states
its own design plainly: "Architecture choices: - contenteditable + execCommand toolbar (no TipTap
dependency)." `docs/decisions/ADR-003-native-editor.md` (2026-09-19, Status: Decided) chose the
opposite: "Own editor on ProseMirror (TipTap) storing document JSON in Supabase... Storage is TipTap
JSON in `articles.body_json`." This is not a stale-doc-versus-live-code case like the axis mapping
finding below; it is a dated, decided architecture document that names a specific, different
technology than what the recovered file uses, and the backlog already commits to the ADR's answer:
`docs/plans/backlog.md` A-10 reads "Editor island: TipTap on ProseMirror, headings, quotes, links,
images to Supabase Storage `article-media`, autosave drafts to `articles.body_json`," citing
"ADR-003; Article Editorial Template" as its spec. **ADR-003 is right.** It is the later, dated,
consequence-bearing decision (a migration, three backlog rows, a named storage column), against a
prototype's own five-month-old header comment. Consequence for the port: `DeclareStage`,
`Stage25`, the declaration state shape, and the stage-flow scaffolding around them are worth
porting; the `contenteditable`/`execCommand` text-editing core inside `ComposeStage` is not, and
needs to be rebuilt on TipTap as A-10 already specifies.

**The publish and submit calls across `dialecta-editor.jsx`, `dialecta-classify-stream.js`, and
`dialecta-article-classification.jsx` contradict ADR-001 and ADR-002.** `FinalStage.handlePublish`
(lines 2463-2540) posts to `/api/article/submit` then `/api/article/publish`, threading
`ghost_post_id` through both calls and sending `member_uuid` as the sole authorship credential.
`dialecta-article-classification.jsx` reads back via `GET /api/article/<post-id>` keyed the same
way. `docs/decisions/ADR-001-leave-ghost.md` (Decided): "Leave Ghost now." `docs/decisions/ADR-002-
supabase-auth-identity.md` (Decided): "Supabase Auth... with `profiles.user_id` referencing
`auth.users`," not a client-asserted Ghost member id. **ADR-001 and ADR-002 are right**, for the
same reason as above: decided, dated, and already reflected in backlog rows A-10 through A-12 and
the `apps/web` auth callback route `builder` and `security` both cite. This is not a defect
isolated to the editor. `security`'s and `builder`'s ghost-coupling positions already measured this
across the whole tree (55 call sites, 21 files, 19 of 28 prop-receivers gating a mutation on the
same unproven id); I am not re-measuring it, only confirming that the specific files named in this
prompt sit inside that count and that the ADRs, not the recovered API layer, are the standard to
port against.

**`dialecta-sidebar.jsx`'s `DeltaCard` contradicts `Dialecta_Delta_Mechanic_Spec.md`'s own founding
principles, and the contradiction is sharper than a missing feature.** I read `DeltaCard`,
`DeltaBar`, and the `generateMockPulse` function that feeds them (lines 140-224, 805-850) directly.
`generateMockPulse`'s own comment: "Mock declared / shifted positions for The Delta card. Realistic
shape." The function fabricates specific numbers with a seeded pseudo-random generator and
`DeltaCard` renders them as a confident, specific claim: "{shifted} of {declared} updated their
position," with copy that varies by the fabricated percentage ("A piece that moved more readers
than most"). `Dialecta_Delta_Mechanic_Spec.md`'s own "Founding Principles" state "The mechanic
reflects, it does not evaluate" and its Stage D section requires "a minimum of 20 completed pairs
before being shown (to prevent small-sample inference)" for any community aggregate. The mock
implements neither constraint: there is no real Stage D calculation behind the number and no sample
floor, because there is no real sample. **The spec is right, and this is not a case of picking a
side: the code's own comment says it is a placeholder** ("Real distribution comes from
/api/comments... when the endpoint lands"). The risk is specific to porting: if `DeltaCard` moves
into `apps/web` without its data source being rebuilt against a real Stage D computation and the
20-pair gate, it ships a fabricated, confidently-worded statistic to real readers. Port the card's
visual shape if wanted; drop `generateMockPulse` outright and do not wire the card to anything until
Stage D through F of the actual mechanic exist, which they do not, anywhere in this tree (next
section).

---

## 3. Files that implement something no spec describes

This is where the tree earns the most scrutiny, because a silent port of these ships a decision
nobody reviewed as if it were settled.

**`dialecta-private-draft.jsx`'s `STAGE25` is the sharpest example in the whole tree, and it is a
decision nobody wrote down, not a feature nobody decided.** I read the stage enum, the wait-time
constants, and the `Stage25Stage` function directly. Line 67: `const WAIT_STAGE25_MS = 12000`.
Line 832: `function Stage25Stage({ analysis, declaredTier, onAccept, onAmend, onRespond, onBack })`,
with an "Accept & post" button (line 887) alongside Amend and Respond, and copy at line 724: "You
can accept this read, suggest a different tier, or amend what you wrote. None of these choices are
wrong." That sentence structure, down to "None of these choices are wrong," is reused from the
article-side spec's own Stage 2.5 copy: "Here's what the engine noticed. You can amend your
submission, respond to the suggestion for the record, or post as-is. None of these choices are
wrong" (`Dialecta_Article_Editorial_Template.md` line 98). So this is not an invented feature: it is
the article-side Stage 2.5 language and structure, deliberately carried over to comments, with a
tuned 12-second lock. `Dialecta_Tuning_Engine_Spec_v1.md` line 88 lists "12s Stage-2.5 lock" as a
real, tracked tuning constant, alongside "60-min malleability" (line 89), which `dialecta-discourse-
layer.jsx`'s own docblock also references ("malleability counters, edit/delete controls," "Edit /
Delete on own comments during malleable window"). But `Dialecta_Discourse_Layer_UX.md`, the
document whose own Purpose section states it "specifies the complete Discourse Layer UX as built in
`dialecta-discourse-layer.jsx`," describes a three-stage flow (Write and Analyze; AI Reflection and
Self-Declaration; Posted) with zero mention of Stage 2.5, malleability, or a hardening window,
confirmed by direct grep (zero matches for "2.5," "malleab," or "harden" in that file). This makes
five documents that now touch a comment-side Stage 2.5 or its timing without ever specifying it as
comment-side behavior: `docs/plans/backlog.md` A-3, root `CLAUDE.md`'s locked weighting, the
Editorial Template's symmetry table, `Dialecta_Delta_Mechanic_Spec.md` (my prior note, drift-map I4),
and now a fifth flavor named but not designed in `dialecta-discourse-layer.jsx`'s own DEFERRED
section: "Author-Stage-2.5-before-flip wait window for nomination resolution," a different,
unbuilt mechanic again. **Read plainly: this is a real, deliberate, carefully-tuned product decision
that was built and never written down anywhere `docs/` covers.** Whoever ports this needs to decide,
consciously, whether comments get a Stage 2.5 at all, not inherit the answer by default because the
file happened to compile.

**`dialecta-profile-order.jsx` ("Steward Order") is a feature nobody decided, not merely a decision
nobody wrote down, and the distinction matters.** The file implements "the AI-proposes / author-
confirms negotiation card," 40 canonical Orders, and a rule that "The Satirist is the only declared
Order, present in the picker but never proposed by the AI," backed by real endpoints
(`/api/article/classify-order`, `/api/profile/order`) that `docs/Dialecta_Project_Index.md`'s
changelog confirms shipped ("v0.8... Steward Order surfaces shipped"). I searched `docs/` for a
structural spec: none exists. `docs/Dialecta_Stewards_Reflection.txt` is real and relevant but is a
naming-philosophy essay, the same genre as `Dialecta_Tier_Psychology.md`'s naming rationale, not a
structural spec: it explains why "Steward" and "Order" were chosen as vocabulary and states "No one
applies to be a Steward. No one is appointed... Recognition follows from the patterns," but never
lists the 40 Orders, never defines the Satirist exception, and never describes the AI-propose/
author-confirm negotiation mechanic. `Dialecta_Contributor_Identity.md`, the document that owns
every other identity-classification system on the platform (Six Pillars, Eight Archetypes), never
mentions Order at all. Unlike Stage 2.5, there is no partial spec to extend here; there is a
philosophy of why the thing should exist and a working implementation of what it is, with nothing
connecting them. This is the "feature nobody decided" case the task asks me to distinguish: the
ethical/naming reasoning is documented and good; the actual taxonomy and its detection logic were
never reviewed as a design, only shipped.

**The Polish panel confirms `drift-map.md` J1 a second time, from the client side.**
`dialecta-editor.jsx`'s `PolishReadStage` (lines 3337 onward) calls `POST /api/article/aesthetic-
suggest` with `polish_level`/`polish_options`, and `AiHintButton` inside `DeclareStage` calls the
same endpoint with a `kind` discriminator (`opposing`, `missing-axis`) for a "Suggest a sharper
opposing argument" / "Suggest a missing axis" hint on two of the five declaration fields. My prior
note (`drift-map.md` J1) established that `_recovered/api/article/aesthetic-suggest.js`, the server
side, has no governing spec in `docs/`. This is the caller confirming the same gap from the other
end: `Dialecta_Article_Editorial_Template.md` never mentions polish, aesthetic suggestions, or a
per-field AI hint button, and grepping it for "polish," "hint," or "aesthetic" returns nothing.
`Dialecta_Tuning_Engine_Spec_v1.md` names the polish engine as an existing thing to expose knobs for
later, which is not a design of the feature (per this seat's own standing practice: naming a file is
not designing what it does). Port candidate for the UI shell; the underlying feature still needs
someone to write down what it is supposed to do before a builder can check the code against
anything.

**`dialecta-editor.jsx`'s `TagPicker` (primary topic plus open secondary tags, lines 400-470) has no
spec anywhere.** I grepped `Dialecta_Article_Editorial_Template.md`, `Dialecta_Project_Brief.md`,
and `Dialecta_Data_Architecture.md` for "tag": nothing describes an article tagging system at all.
Low-stakes compared to the above (a picker over a fixed `TOPICS` list, no trust decision, no
classification consequence I found), but it is still a real design surface, the primary/secondary
distinction and the topic taxonomy itself, that nobody wrote down.

**The opinion-map tooling elaborates well past what any spec chose.**
`Dialecta_Project_Brief.md`'s "Opinion Mapping Tools" section (lines 120-154) offers three loosely
sketched options (2-axis Cartesian, recommended for launch; Ternary, "signature feature"; Radar/
Spider, 5 to 7 axes) as a brainstorm, not a decision, and never mentions a "binary" continuum type.
The recovered code decided several things the Brief never did:
`OpinionMapsInput`/`dialecta-opinion-map-picker.jsx` cap an article at 2 simultaneous maps, invented
a third "binary" map type alongside cartesian and ternary, and wrote validation rules ("binary
cannot be the only map," specific pole-label counts per type) with no spec backing any of the
specific numbers. `dialecta-opinion-map-picker.jsx`'s docblock also names "the AI's 2-4 candidate
framings (skill v2.2.0+)," a versioned subsystem no document in `docs/` names. None of this
contradicts the Brief, since the Brief never decided; it is real design work sitting entirely
outside any spec. Worth porting as a working system, but whoever owns opinion maps should write down
the decision the code already made (2 maps, three types, binary's pairing restriction) rather than
let the code stay the only record of it.

**Smaller, noted for completeness rather than argued at length.**
`dialecta-classify-stream.js`'s SSE streaming protocol (`phase`/`thinking`/`candidate`/`result`
events, a "thinking feed" UX) is an implementation detail beyond `Dialecta_Classification_Engine_
Specification.md`'s description of "two-stage reasoning inside one API call"; it does not
contradict that description, it just adds transport-layer design the spec never touches.
`dialecta-reflection-bar.jsx` is a shared timing-ritual primitive (used by the editor today, named
in `dialecta-private-draft.jsx`'s own docblock as shared with "the comment private draft mode") that
no spec names specifically; it carries no business logic and is low-risk to port regardless.
`dialecta-archetype-grid.jsx` is, per `designer`'s read, not live code at all: its own docstring
says "NOT imported by the runtime bundle. Reserved for the build-time SVG generator," so it is a
data table feeding a build script, not a UI surface, and the port question for it is different in
kind from every other file named in this prompt.

---

## The axis-mapping question, answered directly

**Does the recovered client agree with `packages/core/src/axis-mapping.ts`? It does not disagree,
because it does not implement the same computation at all, and conflating the two is the risk here.**
`dialecta-article-classification.jsx` and `dialecta-classify-stream.js` are consumers of a
classification result (tier, specificity, claim text, opinion-map axis suggestions for a single
article), not producers of `axis_events`/`axis_scores`. `dialecta-fingerprint-engine.jsx` consumes
`graduations` and `tierMix`, already computed upstream; it does not recompute per-axis deltas from
raw classification fields. Neither recovered file re-implements the six-axis trigger table, so
neither can be said to agree or disagree with it the way `axis-mapping.ts` disagrees with its own
spec (my prior note, `2026-dialecta-axis-mapping-v1.md`: the shipped port already replaced the
spec's binary, tier-gated trigger table with a continuous, differently-keyed scheme on every axis,
undocumented). That divergence is real and already filed, but it is a `packages/core`-versus-spec
question, not a `_recovered-next`-versus-port question. The one place "axis" appears in the
recovered client is the opinion-map poles (Cost-first vs Planet-first, and so on), a reader-position
concept from the Delta Mechanic and the Declaration Layer's Q5, entirely separate from the Six
Pillars axes `axis-mapping.ts` governs. The two systems share a word and nothing else; a porting
session should not let the shared vocabulary imply a shared implementation to check against.

---

## The rule: what a porting session does when a file and a spec disagree

Check whether the spec is a **decided, dated, consequence-bearing document** (an ADR, or a spec a
current backlog row already cites as its own governing source) or an **illustrative, undated, or
self-described-as-deferred one**. If the former, the spec wins and the file gets rewritten to match
it, not ported with a comment explaining the gap: this is the ADR-001/002/003 case in section 2, and
the backlog already agrees with the ADRs (A-10 through A-12 cite them directly), so there is no
live disagreement left to adjudicate, only work left to do. If the spec is silent, superseded on its
own face, or explicitly marks the question open, the file is not "wrong," and treating it as a
contradiction to resolve is a category error: the real task is writing the decision down at the
moment of the port, not picking a winner. `Dialecta_Tuning_Engine_Spec_v1.md` naming a value, or a
docblock claiming a spec it does not fully match, does not count as the file winning either; it
counts as evidence the decision was real and specific, which is exactly the citation a newly-written
spec section should use. Either way, the disagreement gets written into `docs/` before or alongside
the port. A silent port, in either direction, is how `stage_2_5_choice` ended up cited four times
and defined nowhere in the first place.

---

## Where this leaves the porting plan, stated as files

Not a full plan; the four other seats own the estimate, the coupling cost, and the design-token
verdict, and I am not re-deriving those. This is what spec fidelity alone argues for, file by file,
among the files named in this prompt.

- **Port close to as-is (UX and state logic; identity plumbing still needs the rewire section 2 and
  the ghost-coupling positions already cost out):** `DeclareStage` and `Stage25` inside
  `dialecta-editor.jsx`; `dialecta-nomination-panel.jsx`; `dialecta-article-classification.jsx`;
  `dialecta-community-feed.jsx`, `dialecta-community.jsx`, `dialecta-community-author.jsx`,
  `dialecta-community-contributors.jsx`; the pre-read/post-read capture half of
  `dialecta-opinion-map-placement.jsx`; `dialecta-fingerprint-engine.jsx` (per `docs/FINGERPRINT.md`
  and `designer`'s read); `dialecta-reflection-bar.jsx`; `dialecta-tier-badge.jsx` (fixing the
  Heat/Stance contrast defect `designer` already found in it, in the same pass).
- **Adapted (logic survives, something specific and named changes):** `dialecta-private-draft.jsx`'s
  stage flow, once someone decides whether comments keep Stage 2.5 and writes that decision down;
  `dialecta-classify-stream.js`, kept as a transport layer once the endpoint it calls exists on the
  new stack; `dialecta-opinion-map.jsx`/`-picker.jsx`, kept once the 2-map cap and the binary type
  are written up as a real decision rather than an implicit one; `PolishReadStage` and
  `AiHintButton`, kept once the polish feature has a spec to be adapted against.
- **Rewritten (surface kept, code not):** the `contenteditable`/`execCommand` editing core inside
  `dialecta-editor.jsx`'s `ComposeStage`, against ADR-003 and backlog A-10's TipTap decision; every
  Ghost-based submit/publish/fetch call named in section 2, against ADR-001 and ADR-002.
- **Dropped, or rebuilt from nothing rather than ported:** `generateMockPulse` and the data plumbing
  behind `dialecta-sidebar.jsx`'s `DeltaCard` (the card's visual shape may survive; the fabricated
  numbers must not). Stages D through F of the Delta mechanic itself do not exist anywhere in this
  tree to drop or port; they are net-new work regardless of how this debate resolves.
- **No spec exists yet, and the port should not proceed silently:** `dialecta-profile-order.jsx`.
  This is the one file in the set where I would tell `decider` to hold the port, not because the
  code is bad, but because 698 lines and two live endpoints are a large amount of unreviewed product
  surface to carry into `apps/web` under Dan's "port as much as possible," and nobody has yet said
  in writing what the 40 Orders are or should be.

## Rebuttal

Builder puts `dialecta-private-draft.jsx` in day one of the slice and calls it adapted.
Migrator calls its comment-post path the one surface unblocked today. Neither ruling touches
Stage 2.5. Builder's adaptation notes cover dropping `member_uuid` and renaming POST fields,
nothing else. Migrator's unblock is RLS and column existence. Two seats priced two different
layers of this file and neither looked at the layer I checked. That confirms the gap my brief
names rather than arguing with it.

Given migrator's finding, holding the whole file is the wrong call: stalling the slice's only
fully-unblocked surface over one sub-flow inside 1,796 lines is disproportionate, and most of
the file has nothing to do with that sub-flow.

Ship the compose ritual with Stage 2.5 disabled: comment posts go straight from AI reflection
to Posted, the three-stage flow `Dialecta_Discourse_Layer_UX.md` already describes, with zero
mentions of Stage 2.5, confirmed by grep in my own brief. Cost: close to nothing, since the
flag-off path is already the documented one, and it still delivers what builder and migrator
both priced: a real, session-verified write path rendered with a tier badge.

Shipping Stage 2.5 live and writing the spec after is the worse order. It puts a twelve-second
lock and an Accept, Amend, or Respond choice in front of real commenters in week one, on a
mechanic nobody outside this file decided, and a later no becomes a behavior change on shipped
product instead of a design review. That is what my own rule is for: write the decision down
at the port, don't inherit it because the file compiled.
