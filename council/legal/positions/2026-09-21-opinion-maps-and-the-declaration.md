# Opinion maps and the declaration: legal position

*Council review convened 2026-09-21. Question, constraints, and evidence:
`council/log/2026-09-21-opinion-maps-and-the-declaration.md`. Not counsel; nothing here is legal
advice.*

## Brief

Verified by screenshot on both localhost:3050 and dialecta.org, before and after clicking: the
engine's full reading, ending in "disclosed alongside the article, never used to gate publication,"
does not render by default. It sits inside a collapsed "How the engine read this" toggle; only the
tier word shows without that click. The debate's locked constraint requires that sentence to stay
true regardless of what changes. Today it is true only where the markup is technically reachable,
not where a reader who opens Declare encounters it. Consent and the Milkovich disclosed-
basis defense both turn on what a reader was shown, not on what merely existed in the page.

## Where this mandate reaches

`designer` owns whether three poles look balanced on the canvas. `philosopher` owns whether a
binary map on a meaning-of-life piece betrays the platform's stated aim of moving readers past
binary thinking. I own two narrower things inside both questions: what the AI-generated text on
these two surfaces has to disclose to stay defensible, and what the platform's own sentences
("never used to gate publication," the Reflect placement's "other readers can't see it") commit it
to. I read both live surfaces signed out, per the brief: `http://localhost:3050/articles/on-the-far-
shore-of-fear` and `https://www.dialecta.org/on-the-far-shore-of-fear/`, no sign-in, no placement.

## The opinion maps

### The disclosed basis already covers the badge, and it covers the author's dot too

`positions.md`'s standing finding on the tier badge is that it is "unlikely to be actionable," on
two defences: the basis is published beside it, and the contributor consented after being shown
what would be published (`research/1990-scotus-milkovich-v-lorain-journal.md`,
`research/1977-restatement-583-consent-to-defamation.md`). Both extend cleanly to the "Author's
position" marker on the ternary and binary maps and to the three flagged passages, and nobody has
filed that extension yet.

The coordinate is AI-authored. The opinion-mapper skill instructs the model to "find the author's
position" and "locate it as a coordinate within the structure" (`_recovered/api/_skills/opinion-
mapper.js`, "How you think about an article," item 5), and separately requires that "the poles
describe positions any reader could hold" while "the author's stance is captured as
`author_position`: a point in the map's coordinate space, not a label" (same file, "The structure-
vs-author distinction"). `classify.js`'s output schema carries that coordinate on every candidate
(same skill file, "Output schema"). But it is not published over the
author's head. The picker hands the author 2 to 4 AI-drafted candidates, each with its own
`author_position` already plotted, and normalizes whichever one the author picks before the author
clicks Save (`_recovered-next/lib/theme/dialecta-opinion-map-picker.jsx` lines 58 to 96, docblock
lines 1 to 16: "The author selects 1 OR 2 candidates and clicks Save; the chosen set becomes
declaration.opinion_maps"). What renders on the published page is read straight out of that saved
declaration, not out of `ai_analysis` (`apps/web/src/components/opinion-map/data.ts` lines 118 to
152 parse `author_position` from `m.author_position` inside `declaration.opinion_maps`, confirmed
against the five published rows on project `mguulnibvzusfvyuowwh`). That Save is the same
affirmative-act structure the standing Nguyen position already treats as consent
(`research/2014-ca9-nguyen-v-barnes-noble.md`), applied here to a coordinate instead of a tier. And
the coordinate never appears without the material that produced it on screen beside it: the
author's own Core Claim, Scope Boundary and Strongest Objection sit above it in the author's own
words, and the engine's flagged passages quote the exact sentences that pulled the reading, with a
stated reason for each (`apps/web/src/strings.ts` lines 2804 to 2828, `opinionMap.declaration`).
Milkovich's problem is an undisclosed factual predicate. None exists here.

**Nothing to fix.** This is confirmation, filed so the next debate does not have to re-derive it.

### A pole that fails the skill's own honesty checks is a legal defect, not only a craft one

The convener's own note on this piece: "the ternary options on that piece don't answer their own
question in parallel: 'Drift to excess' is a prediction of what people do, not something humans
'need to find meaning.'" (`council/log/2026-09-21-opinion-maps-and-the-declaration.md`, "Three
things the convener noticed"). The skill this candidate came from has a rule for exactly this
failure: a pole must be "something a reader could land on," never "a characterization" of what
people do in general (`opinion-mapper.js`, "What a pole is NOT"), and honesty check 3 asks the
model to verify the three poles are mutually exclusive positions on one question before submitting
(same file, "Honesty checks"). This candidate shipped anyway.

That matters here because the disclosed-basis defence above depends on the map reading as a
neutral structure a reader can check against the article, not as the platform's own claim about
what people do. A pole that fails the skill's own parallelism test stops being "a position a reader
could hold" and starts being asserted fact about human behaviour, which is a different and less-
defended kind of sentence. The gap is not that no review exists: the Article Editorial Template
already commits to "periodic editorial review" where "real humans read a sample of AI suggestions
monthly and flag anything that feels punitive, confusing, or tone-deaf"
(`docs/Dialecta_Article_Editorial_Template.md` lines 86 to 90). Nothing in that review currently
checks a shipped map against the skill's own honesty checks; it checks tone.

**Recommendation.** Add the skill's own honesty checks to what the monthly review reads, not just
tone. Cost: none beyond the review the Editorial Template already promises; it is a checklist
addition, not new machinery. Forecloses nothing.

### The binary map on this article is inferred religious belief, published

This article's binary map: "Where does meaning come from? Fixed tradition / Open inquiry," the
author's position plotted on it, visible to any reader signed in or not, on both surfaces I read.
"Religious or philosophical beliefs" is listed, verbatim, as a special category of personal data
under GDPR Article 9(1) and as sensitive personal information under Cal. Civ. Code
1798.140(ae)(1)(D) (`research/2016-gdpr-art-9-special-categories.md`,
`research/2026-ca-civ-1798-140-sensitive-personal-information.md`, both read and filed this
session). A dot on this axis is an inference about that category, not the belief stated outright,
and Article 9's doctrine on inferred special-category data (the reasoning, not a specific case read
this session) treats a reasonable inference as inside the category, not outside it.

This is not a new exposure. `research/2025-ct-public-act-25-113.md`, filed 2026-09-20, already
found the door: "The door into CTDPA is the comment text, not the fingerprint... The live
`opinion_map_positions` table is the same exposure with a schema around it." What I am adding is
that the author-facing half of that same table is public by design where the reader-facing half is
not. I confirmed the reader-facing half directly this session: `opinion_map_positions` carries
exactly one SELECT policy, `opinion_map_self_read`, restricted to role `authenticated` with
`qual: profile_id = current_profile_id()` (`pg_policies` on project `mguulnibvzusfvyuowwh`, queried
2026-09-21). No other member's query can return a reader's placement; the promise in
`apps/web/src/strings.ts` line 2701, "Your placement is private: other readers can't see it," is
true, and the code comment above it names the same policy as the reason
(lines 2693 to 2695). The author's declared position on the same kind of axis carries no such
gate. The dot is meant to publish; that is the whole point of Declare.

Consent under GDPR 9(2)(a) has to be specific to the special-category processing, not folded into
a general terms acceptance. An author who is shown a candidate with a dot already on a religion
axis and clicks Save has done something close to that. A reader whose Reflect placement lands on
the same kind of axis has consented only to placing a dot, not to anything naming the category.

This does not change the standing posture: accept the privacy risk at this size, no home-state
statute, revisit at the first EU or UK member (`positions.md`, "Accept the privacy risk," and
L-14). It sharpens what that first member exposes: not an abstract fingerprint question,
but a live, publicly rendered inference on a named religious-belief axis, on a real published
piece, today.

**Recommendation.** When a candidate map's topic or poles fall inside a recognized sensitive-
inference category (religion, health, sexual orientation, immigration status, political party),
say so in that candidate's `rationale` field, which the author already reads before Save. Cost: one
sentence added to the opinion-mapper skill's instructions for writing `rationale`; no schema change,
since `rationale` is already free text on every candidate (`opinion-mapper.js`, "Output schema").
Forecloses nothing; it makes the one act that most resembles specific consent actually specific,
for the cases where that will matter first.

## The overlay's length

### The fold already happened

Dan's question asks how likely a reader is to read roughly 685 to 813 words. I checked what a
reader actually meets by default, on both builds, before answering that. On `dialecta.org`, before
clicking anything, the accessibility tree under the Declare dialog ends at a button reading "How
the engine read this" next to the word "Spark"; Tier Reasoning, the Alignment note, the Core Claim
the engine detected, the Note to the Author, all three flagged passages, all three tensions, and
the closing line are absent from the tree entirely. After one click on that button, all of it
appears. The same button, in the same collapsed state, renders on `localhost:3050` (screenshot
confirmed both before and after). This is not a difference between the two builds; it is one
design, shipped in both.

The words the convener measured are real and they are all disclosed somewhere a reader can reach.
But "disclosed alongside the article" (`docs/Dialecta_Article_Editorial_Template.md` line 80,
`apps/web/src/strings.ts` line 2820) and "a reader can reach it if they click through" are not the
same fact, and the difference is exactly where the legal weight sits. Milkovich's defence needs the
basis disclosed; the consent-at-the-moment principle already on file needs the record of "what was
shown at the moment it mattered"
(`positions/2026-09-20-consent-at-the-moment.md`). A sentence sitting in the DOM behind an unclicked
toggle was not shown at the moment anything mattered to the reader who never clicked it.

### What folding can cost, and what it cannot

Two different things are being asked to shrink, and they carry opposite legal weight.

**Restatement costs nothing to cut.** The convener already flagged one instance: the overlay prints
the author's Core Claim, then, separately, the engine's "Core Claim the Engine Detected," which
restates it in 57 more words (`council/log/2026-09-21-opinion-maps-and-the-declaration.md`, "Three
things the convener noticed"). Folding that into one comparison view loses no disclosed basis,
because it was not new information the first time.

**The flagged passages, the tensions, and the closing sentence are the disclosed basis itself.**
Each flagged passage is a direct quote from the article plus a stated reason
(`apps/web/src/strings.ts` lines 2816 to 2817, `flaggedPassages`, `tensions`). Cutting the quote or
the reason, not just shortening the surrounding prose, is the one edit that would weaken the
Milkovich defence, because it is the thing standing between "here is our reading" and "here is our
reading, and here is exactly what in your own words produced it."

**Recommendation.** When trimming, cut restatement and connective framing freely; hold the quoted
passages, their stated reasons, and the closing disclosure sentence to their current substance even
if the surrounding prose shrinks. This is a boundary for `voice-editor` and `designer` to work
inside, not a rewrite I am proposing myself.

**Recommendation.** Promote the closing sentence, "the engine's reading is disclosed alongside the
article, never used to gate publication. The author's voice is the published one," out of the
collapsed accordion so it renders next to the tier badge that is already visible before any click,
on both the `apps/web` port and the legacy build. Cost: the sentence already exists
(`apps/web/src/strings.ts` line 2820); this moves where it renders, which is a small layout change
in two codebases rather than new copy. Forecloses nothing, and it is the cheapest way to make the
debate's own locked constraint true in practice rather than true only in markup.

### A re-run can silently outdate a sign-off

`api/article/admin-resetup-maps.js` lets an admin re-run classification against an already-
published article and overwrite `declaration` and `ai_analysis` directly (lines 86 to 107: builds
`newDeclaration` from the admin's chosen candidates and writes it, with no prior version kept, no
notice to the author, and no fresh Stage 2.5). The route is gated on `is_admin` (lines 61 to 73), so the
exposure is bounded to deliberate admin action, not routine operation. But if this debate's outcome
changes what the engine's reading contains, going forward, and someone later re-runs an already-
published article through the changed skill, the author's original Stage 2.5 choice (amend, respond
for the record, or post as-is per `docs/Dialecta_Article_Editorial_Template.md` lines 100 to 107)
was a decision about the old reading, not the new one. The standing principle already on file, "a
consent that cannot be proved is one the platform does not have," and "each sign-off must store
which version of the shown text the person saw" (`positions/2026-09-20-consent-at-the-moment.md`),
applies here without modification: if the shown text changes after the sign-off, the sign-off no
longer describes what is live.

**Recommendation.** When `admin-resetup-maps.js` changes the tier, the core claim detected, or the
flagged passages (not just formatting), log the prior `ai_analysis` and `declaration` before
overwriting, and route the change through Stage 2.5 again rather than a silent write. Cost: reuse
the append-only audit pattern the codebase already has for admin actions
(`public.admin_audit_log`, confirmed present on `mguulnibvzusfvyuowwh`) rather than building
anything new; one more Stage 2.5-shaped moment for the rare case of a re-run. Forecloses nothing;
it only slows down a tool that is already admin-gated and already described as a smoke-test
surface.

### The Pulse sidebar, noticed in passing

Not part of Dan's question, and flagged briefly because it sits in the same reading spine and
touches the same "is this real, is this disclosed" ground. Live's sidebar on this article shows "9
reading now," "1 still malleable, next hardens in 37m," "1 Steward reading," and "The Delta: 5 of 38
updated their position," none of them labeled. Two widgets lower on the same sidebar carry explicit
labels: "Mocked, live feed coming" and "Sample placement, in build." I could not confirm from source
whether the first set is real or another unlabeled sample: `_theme/assets/js/post.js` is a minified
bundle with no literal match for the strings I read on screen, and the delta-mechanic build audit
that found no aggregate query anywhere did not cover `_theme/` (`team/architect/architecture/2026-
09-21-delta-mechanic-port.md` scoped its grep to `_recovered/` and `_recovered-next/`). The Delta
Mechanic spec requires a 20-pair minimum before any aggregate renders (`docs/Dialecta_Delta_
Mechanic_Spec.md` lines 103 to 108); "5 of 38" clears that bar if real. `apps/web`'s own convention
on the same sidebar says "Live signal coming" rather than inventing a number, which is the more
defensible posture either way. If the live numbers are not wired to a real query, they are the same
category as the capability-matrix finding already on file elsewhere in `positions.md`: a
representation FTC Act Section 5, imported into Arizona law by A.R.S. 44-1522(C)
(`research/2026-az-consumer-fraud-act-44-1521.md`), reaches. Worth a builder's five minutes to
confirm; not worth this debate's time beyond naming it.

## Recommendations, collected

| # | Recommendation | Costs | Forecloses |
| --- | --- | --- | --- |
| 1 | None. Keep `author_position` and the flagged passages architected as they are: AI-drafted, author-reviewed, saved by an affirmative act, shown beside their own basis | Nothing | Nothing |
| 2 | Add the opinion-mapper skill's own honesty checks (parallel poles, mutual exclusivity, no synthesis pole) to the monthly editorial review the Editorial Template already promises | A checklist line, no new process | Nothing |
| 3 | When a candidate map touches a recognized sensitive-inference category, say so in that candidate's `rationale` field before the author's Save | One sentence in the skill's instructions, no schema change | Nothing; sharpens consent, does not create a new gate |
| 4 | Promote the closing disclosure sentence out of the collapsed accordion so it renders unconditionally next to the tier badge | A layout change in two codebases; the sentence already exists | Nothing |
| 5 | When trimming the overlay, cut restatement and framing; hold the flagged-passage quotes, their stated reasons, and the closing sentence to their current substance | A boundary for the editing pass, not new work | Trims that touch the quotes or the closing sentence specifically |
| 6 | Version `ai_analysis`/`declaration` before `admin-resetup-maps.js` overwrites them, and route a substantive re-run through Stage 2.5 again | Reuse of the existing `admin_audit_log` pattern | Slows a rare, already admin-gated action |
| 7 | Label or wire the Pulse sidebar's presence and delta numbers the way its own neighboring widgets already are | A label string, or the query the spec already specifies | Nothing on this debate's scope |

## Design spec and the Pact

I am not proposing a design-spec change myself. If Dan adopts recommendation 4, it touches the
Declare overlay's layout, which is `design/dialecta-design-spec.html` territory; that edit is
`designer`'s and Dan's to make, not mine to draft.

No Pact change is required by anything in this position. If Dan adopts recommendation 3, one
sentence could be added to the Pact's existing classification-consent language noting that some
axes may reflect inferred sensitive categories; optional, and only worth it once a candidate has
actually triggered recommendation 3 in practice. Nothing here reopens the seven Pact lines already
tracked in `exchange/open/2026-09-21-legal-01`.
