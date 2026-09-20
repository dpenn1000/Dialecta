# Is a published tier label the platform's own speech?

*`legal` standing position, 2026-09-20. Not counsel. Nothing here is legal advice. Every claim
cites a note in `council/legal/research/`. Where the answer needs a lawyer this file says so and
says why.*

## Correction, 2026-09-20, later the same day

**Dialecta is operated from Arizona, which is the Ninth Circuit, not the Second.** Every
statement below about the forum was written on the wrong premise. The correction narrows the case
against the platform without removing it.

- **The algorithmic theory is now weak here.** Doe 1 v. Meta, 2026 WL 1144707 (9th Cir. Apr. 28,
  2026), upheld Section 230 for algorithmic recommendation, held that "matching users with content
  is publishing conduct", expressly distinguished Anderson v. TikTok and cited Dyroff approvingly.
  That is five months old and it is the home circuit
  (`council/legal/research/2026-ca9-doe-v-meta.md`). Wherever this file leans on Anderson to argue
  that running the classifier is expressive activity, discount it heavily.
- **The label theory is untouched, and it was always the better one.** Doe 1 v. Meta is about
  selecting and arranging other people's content. It says nothing about publishing a sentence the
  platform wrote. The CRS statement that 230(c)(1) does not bar a claim based on the content of a
  label a website adds survives whole.
- **Roommates.com is binding here, en banc, and it cuts against the platform.** The material
  contribution test is Ninth Circuit law. It bears on Stage 2 self-declaration and the Contrast
  Strip, where the platform structures what a contributor says about themselves.
- **Nguyen v. Barnes and Noble is binding rather than merely persuasive.** The terms recommendation
  below is stronger than it was written.
- **Arizona's anti-SLAPP does not fill the gap, though it looked at first as though it would.**
  A.R.S. Section 12-751 kept a motive test most states dropped: the movant must show the suit was
  "substantially motivated by a desire to deter, retaliate against or prevent the lawful exercise
  of a constitutional right". A contributor suing over a label wants damages, not deterrence, so
  the motion fails at the threshold and the discovery stay never arrives
  (`council/legal/research/2022-az-ars-12-751-anti-slapp.md`). The defence-cost finding stands.
- **A second defence has since been filed that this file did not have.** Consent to publication is
  a complete defence and fits this platform unusually well. See
  `council/legal/positions/2026-09-20-consent-waiver-and-the-pact.md`. Net confidence that the
  badge is not actionable moves from medium to medium-high.

## The question

Dialecta attaches an AI-assigned tier to a named contributor's comment and publishes it. Is that
label the platform's own speech, or is it part of hosting the contributor's?

## The surfaces this is actually about

Four, and they are not equally exposed. Ranking them is most of the work.

| Surface | What Dialecta publishes | Spec |
| --- | --- | --- |
| Tier badge | One word about one comment | `docs/Dialecta_Classification_Engine_Specification.md` line 53 |
| Commenter message | One or two sentences Dialecta's model wrote about that comment | same, line 142 |
| Contrast Strip | "Commenter declared [Tier]. Engine read [Tier]." Published on every comment with a contrast, permanently | `docs/Dialecta_Discourse_Layer_UX.md` line 109 |
| Breach notice | "Content suppressed. Targets a person, not an idea." Beside a named account, original text never shown | same, line 113 |
| Archetype and fingerprint | A durable public characterisation of how a named person argues, aggregated over their history | `docs/Dialecta_Contributor_Identity.md` lines 68 to 98 |

## The answer, in two parts

The question as framed folds two things together, and separating them changes what Dan should do
about it.

**Part one: Section 230 does not shield the label. This is not close.**

Section 230(c)(1) protects a service from being treated as the publisher of "information provided
by another information content provider", and 230(f)(3) makes anyone responsible "in whole or in
part, for the creation or development" of information a content provider of it
(`2026-usc-section-230-text.md`). Nobody but Dialecta wrote the word Heat. Dialecta wrote the
prompt in `api/classify.js`, runs the model, and publishes the output under its own name.

The Congressional Research Service states the conclusion outright rather than predicting it:
"Section 230(c)(1) would not bar a defamation claim against a social media website based on the
content of a label or disclaimer added by the website to third-party content"
(`2024-crs-section-230-overview.md`). The Digital Media Law Project, writing for exactly this
structure, says an operator who adds commentary is "shielded from liability for the material
created by your user, not for your own statements" (`2014-dmlp-publishing-others-content.md`).
Even the Electronic Frontier Foundation, whose whole position is that the shield should be read
broadly, concedes that 230 "does not protect companies that create ... content"
(`2026-eff-cda-230.md`).

**Part two: losing the shield is not losing the case, and the difference is where the real cost
sits.**

Section 230 is a motion to dismiss defence. It ends a case at the pleadings, cheaply, before
discovery. Without it, an ordinary defamation claim against a one person publisher with no
counsel on retainer survives to discovery and has to be won on the merits. For Dialecta the
exposure created by the tier label is not a judgment. It is defence cost. That distinction is the
most useful sentence in this file, because it points the money at insurance rather than at a
redesign of the core mechanic.

## The strongest case that the label is Dialecta's own speech

1. **The statute's own words reach it.** "In whole or in part" means a service can host one
   string and author another on the same card. That is Dialecta's comment card exactly.
2. **The Supreme Court described this move by name.** Moody v. NetChoice, quoted in Anderson,
   says platforms "will have removed some content entirely; ranked or otherwise prioritized what
   remains; and sometimes added warnings or labels", and thereby "shape other parties' expression
   into their own curated speech products" (`2024-ca3-anderson-v-tiktok.md`).
3. **An appellate court has taken the step into Section 230.** The Third Circuit: "ICSs are
   immunized only if they are sued for someone else's expressive activity or content ... but they
   are not immunized if they are sued for their own expressive activity or content" (same note).
4. **Dialecta's facts are stronger against it than TikTok's were.** TikTok's first party speech
   was an arrangement of other people's videos. Dialecta's is sentences it composed. If selecting
   and ranking is expressive activity, authored prose plainly is.
5. **Anderson's limiting footnote cuts nowhere useful.** Footnote 12 distinguishes a platform
   that promotes without user input from a repository answering a search. Classification is not
   contingent on any reader's input at all. It fires on submission, automatically, every time.
6. **The aggregate surfaces are worse than the badge.** The Contrast Strip publishes, permanently,
   that a named person claimed more for their argument than the engine thought it was worth. The
   archetype publishes a characterisation of how that person thinks. Those are statements about a
   person, not about a comment, and a reader cannot check them against anything on screen.

## The strongest case that it is not a problem

This has to be argued properly, because the first case above is the easy one and stopping there
would be the failure mode of this seat.

1. **Everything except the text is squarely protected.** Sorting, ranking, filtering by tier,
   holding a comment for Stage 2, and suppressing a Breach comment are traditional editorial
   functions. Section 230(c)(2)(A) covers voluntary restriction of material the provider
   considers objectionable in its own words (`2026-usc-section-230-text.md`), and the pre-2024
   circuit consensus covers the rest (`2023-crs-algorithmic-recommendations.md`).
2. **There may be no tort to shield against.** This is the strongest point on this side and it
   does not depend on 230 at all. Defamation needs a false statement of fact. A tier is the
   platform's characterisation within a rubric it publishes, and the AI Classification Card
   publishes the reasoning beside the label: claim, specificity level, emotional register, tribal
   markers, article engagement. The reader sees the whole comment and the whole basis and can
   reject the inference. Opinion resting on fully disclosed facts is the weakest possible
   defamation target.
3. **The tier names were built to be observational, and that is now doing legal work.** Root
   `CLAUDE.md` locks the names; Editorial Voice v1.2 requires observational and never evaluative
   copy; `docs/Dialecta_Classification_Engine_Specification.md` line 186 contrasts "Your comment
   doesn't make a specific point" with "This reads as Heat". The second is not an accusation. The
   platform's ethics produced its best defence by accident.
4. **The plaintiff has to show harm.** What is the reputational injury from being labelled Echo
   on a site with fourteen members? For a private individual, a claim still needs fault and
   damages.
5. **The forum is wrong for Anderson.** Dialecta operates from Connecticut, in the Second
   Circuit, whose Force v. Facebook is on the list of decisions Anderson expressly departs from
   (`2024-ca3-anderson-v-tiktok.md`, footnote 13). Anderson binds nobody here.
6. **No Connecticut consumer can sue over this.** The CTDPA has no private right of action and
   the Attorney General enforces it alone (`2026-ctag-ctdpa-enforcement.md`).

## Where it lands

Section 230 does not cover the label: high confidence. The label is very unlikely to be
actionable anyway: medium confidence, and falling as the surface moves from comment level toward
person level. The Breach notice and the permanent Contrast Strip are the two places where medium
becomes genuinely uncertain, because both publish something about a person that a reader cannot
verify from what is on the page.

## The specific facts that would move it

Each of these is a design choice, which is why they are listed rather than described.

1. **Whether the basis ships with the label.** The AI Classification Card is the defence. A
   future design that collapses it into a bare badge trades the strongest merits argument for
   visual tidiness. This is the one to watch in A-5.
2. **Whether the label is about the comment or about the person.** Badge: comment. Archetype and
   Calibration pillar: person. The further toward person, the weaker the disclosed-basis defence.
3. **Whether it is permanent.** `docs/Dialecta_Discourse_Layer_UX.md` line 109 says the Contrast
   Strip is displayed "permanently". A durable public record of a person's miscalibration is
   closer to a dossier than to a moderation decision.
4. **Whether the copy stays inside what the platform can know.** "Targets a person, not an idea"
   is an observation. "Harassment", "abusive", "threatening", "dishonest", "bad faith" are
   factual accusations with legal contours behind them, and any drift into them changes the
   analysis. Counterman v. Colorado shows what a true threat actually requires, and a classifier
   reading text cannot assess it (`2023-scotus-counterman-v-colorado.md`).
5. **Whether a contributor can contest it.** Community re-review, backlog A-7 and A-8, is a
   correction path. A label with no route to challenge is worse on every axis this file covers.
6. **Whether anything downstream turns on the tier.** The moment a tier gates membership, payment
   or publication, it stops being commentary and starts being a decision about a person.
7. **Whether contributors are named.** They are, and they are private individuals, which sets the
   fault standard at negligence rather than actual malice.

## Where this needs a lawyer, and why

1. **Whether a tier name is capable of defamatory meaning under Connecticut law, and whether the
   disclosed-basis opinion defence carries on these facts.** This is the elements of a state tort
   applied to a specific published artifact. Reading the statute does not answer it, and the
   whole of part two above rests on it.
2. **Whether Force v. Facebook survives Moody v. NetChoice in the Second Circuit.** Predicting
   where a circuit is going is not something an advisor can do from reading opinions, and it
   decides whether Anderson's reasoning ever reaches Dialecta's forum.
3. **Whether a media liability policy covers statements the insured's own model generated.** This
   is a policy wording question and the answer is in an endorsement, not in any source in this
   tree. Ask the broker in writing before binding. If the answer is no, the mitigation this file
   recommends does not exist and the position changes.
4. **What the terms should say about the platform's right to classify and publish.** Terms that
   say the wrong thing are worse than none.

## What to do about it

Do these:

- **Ship the AI Classification Card with the badge, always.** Treat "basis visible beside label"
  as a build constraint on A-5, not a design preference. Per the charter this is the one thing
  here that is vetoable, and the veto attaches to A-5 rather than to the tier system.
- **Guard the classifier prompt with the voice gate.** `exchange/open/2026-09-19-003` records that
  neither voice gate reads `.js` or `.ts`, so all three classifier prompts are unchecked. The
  prompt is where the platform's published characterisations are actually written. That is a
  legal control currently dressed as a style check.
- **Price media liability insurance before launch rather than after.** The exposure is defence
  cost, so this is where money buys the most.
- **Make the Contrast Strip's permanence a decision.** Ask Dan whether "permanently" at
  `docs/Dialecta_Discourse_Layer_UX.md` line 109 is what he meant, or whether it is a word that
  arrived in a draft. A window would cost nothing and remove the worst fact in this file.
- **Take terms by an affirmative act at sign-up.** A footer link does not bind
  (`2014-ca9-nguyen-v-barnes-noble.md`).

Do not do these:

- **Do not rename the tiers.** They are locked, and on this analysis the observational names are
  an asset. Changing them to sound safer would most likely make them worse.
- **Do not add human review in order to recover Section 230.** It does the opposite. A human who
  reviews and approves a label is more authorship, not less, and pushes the platform further into
  230(f)(3). Under GDPR Article 22 human review is a safeguard; here it is an aggravator. Anyone
  proposing it as a legal fix is applying the right instinct to the wrong statute.
- **Do not stop publishing tiers.** This risk should be accepted, not mitigated away. The
  mechanic is the platform. A seat that answers every question with "be careful" is not earning
  its place in the room, and the correct answer here is that the exposure is real, small,
  insurable, and worth carrying.
