# Standing positions

Written by the philosopher. Each row is contested by design and carries a confidence. A position
with no filed note behind it is marked `(unsourced)`. Evidence points at
`council/philosopher/research/`. The reasoning behind each row is in the section under it.

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| P-1. Of the four biases the charter names for the classification card, one holds as stated, one holds in weaker form than its stronger sibling, one belongs to a different surface, and one is contested in its own literature | High | `2015-steindl-reactance`, `2021-rathje-outgroup-animosity`, `2014-barasch-broadcasting-narrowcasting`, `2018-gal-loss-of-loss-aversion` | 2026-09-19 |
| P-2. Legitimacy, not tone, is the card's governing design variable. A contributor who reads the classification as legitimate reflects; one who reads it as illegitimate gets angry immediately | High | `2015-steindl-reactance` | 2026-09-19 |
| P-3. The Classification Engine Specification overstates the card. Calling the commenter message the platform's primary behavior-change mechanism is a hypothesis, and the nearest tested analogue is small and fragile | High that it is unevidenced, medium on the true size | `2021-roozenbeek-accuracy-nudge-replication`, `2021-pennycook-accuracy-nudge` | 2026-09-19 |
| P-4. The permanent public Contrast Strip will bias self-declaration downward and corrupt the 15 percent of classification weight it carries | Medium | `2014-barasch-broadcasting-narrowcasting`, `2016-rost-online-firestorms` | 2026-09-19 |
| P-5. Stage A question 4 should ask for out-group reference by name. It currently aims at the weaker of the two tribal markers | Medium high | `2021-rathje-outgroup-animosity`, `2017-brady-moral-contagion` | 2026-09-19 |
| P-6. Community voting at 35 percent weight needs a bridging aggregator, not a higher threshold. A raw count of same-side voters is still same-side | Medium | `2017-brady-moral-contagion`, `2022-wojcik-birdwatch-bridging` | 2026-09-19 |
| P-7. On P0-D2, the consent question is not open against invite-only. It is whether the Pact discloses classification and the Fingerprint before the first comment. Magic link should lead, Google should follow, and invite-only is defensible only as a capacity measure with an end date | Medium high | `2016-rost-online-firestorms`, `2020-lorenz-spreen-boosting-autonomy`, `2014-barasch-broadcasting-narrowcasting` | 2026-09-19 |
| P-8. The source thesis needs one amendment. The environment does not beat stated values, it distracts people from values they already hold. That is a smaller claim and the one with evidence under it | Medium high | `2021-pennycook-accuracy-nudge` | 2026-09-19 |
| P-9. A membership price, not its size, is what risks moving a contributor from social norms to market norms. The fix is structural separation of payment from classification, not a smaller fee | Medium high | `2004-heyman-ariely-market-norms` | 2026-09-20 |
| P-10. The composer gate and the nudge bar are not two strengths of one mechanism. Only the visible, non-blocking one has a field result behind it | Medium high | `2019-matias-norms-r-science` | 2026-09-20 |
| P-11. Human review of a published tier does not recover the contributor's autonomy interest any better than a non-authoring contest path does, and it costs the platform a real legal position to get there. Community re-review is the answer that does not trade one for the other | Medium high | `2015-steindl-reactance`, `2007-miller-restoration-postscripts`, `council/legal/positions/2026-09-20-tier-label-first-party-speech.md` | 2026-09-20 |
| P-12. A condition on a founding badge is acceptable in the unannounced, after-the-fact form and damaging in the announced form. What decides it is whether the contributor knows the threshold while writing, not how kindly the platform states it | Medium high | `1999-deci-koestner-ryan-undermining`, `2013-anderson-steering-badges` | 2026-09-20 |
| P-13. The fingerprint can show the bad without shame only as dated, countable acts with a zero that looks like zero. A judging channel drawn as undated texture, or sharing a grammar with decorative noise, describes the person where it should describe the act | Medium high | `2007-tangney-moral-emotions`, reading test in `council/log/2026-09-20-fingerprint-legibility-and-model/` | 2026-09-20 |
| P-14. A legible mark beside a vote makes the community vote a review of the author, and the vote then grows the mark. No ordinal channel belongs on a surface where a comment is being judged | Medium | `2017-tomkins-single-double-blind` | 2026-09-20 |
| P-15. The trade-off penalty is the record editorialising. It draws a claim about people in general as a deficit in one person, and the archetype showcase was already bent to fit it. Delete it, by Dan's decision | High that it contradicts the specs, medium on deletion | (unsourced) in the literature; measured by `monotone.py` in the debate folder, and `dialecta-archetype-grid.jsx` read against `Dialecta_Contributor_Identity.md` | 2026-09-20 |

---

## P-1. What the classification card actually triggers

The charter names four candidates. Checked against the literature, they do not stand equally, and
saying so is the point of checking.

**Reactance. Holds as stated, and it is the main event.** Reactance is arousal that follows a threat
to a free behavior, and it drives counterarguing, devaluing the imposed option, and derogating the
source (`2015-steindl-reactance`). The card is a textbook trigger: an unrequested judgment of a
person's own words, delivered at the moment they had decided to act. The predicted failure is not
that contributors feel bad. It is that they dismiss the engine and post unchanged.

**In-group signaling. Holds, but it is the weaker half of a pair, and the charter named the weaker
half.** Out-group language predicts sharing about 4.8 times more strongly than negative affect and
about 6.7 times more strongly than the moral-emotional language Brady et al. measured
(`2021-rathje-outgroup-animosity`, `2017-brady-moral-contagion`). Tribal behavior on Dialecta will
show up as writing about the other side more than as flagging one's own team. See P-5.

**The audience effect. Real, and not on this card.** Audience effects follow audience size:
broadcasting to many raises self-presentation, narrowcasting to one lowers it
(`2014-barasch-broadcasting-narrowcasting`). The card is a narrowcast. The engine speaks to one
person, privately, before anything is published. The audience effect belongs to the Contrast Strip,
the public tier badge and the topology bar. See P-4.

**Loss aversion around tier. Contested, and the platform should stop assuming it.** Gal and Rucker
review the evidence and find loss aversion unsupported as a general principle, with the endowment
effect and status quo bias both admitting explanations that do not need it
(`2018-gal-loss-of-loss-aversion`). Whether a tier drop reads as a loss is an empirical question
about context, not a fact to design around.

Net: one bias to design against, one to redirect, one to move to the right surface, and one to stop
citing until somebody measures it.

## P-2. Legitimacy is the design variable

Threats read as illegitimate produce an immediate emotional response. Threats read as legitimate
produce delayed cognitive reflection instead (`2015-steindl-reactance`, reporting Sittenthaler,
Steindl and Jonas 2015). Reflection is the entire product. So the question the card has to win is
not whether it sounds kind. It is whether the contributor believes the reading was earned.

This gives the charter's veto on classification that hides its reasoning an empirical leg to stand
on, not only an ethical one. The structured analysis grid in Stage 2 of the Discourse Layer, showing
specificity, emotional register, tribal markers, article engagement and opposing view as separate
readings, is the legitimacy mechanism. It is not decoration and it is not a debug view. Removing it
to simplify the card would be the single most damaging change available to this surface.

Two consequences follow. The borderline flag should be shown to the contributor, because a system
that admits a close call reads as more honest than one that does not. And controlling verbs, meaning
should, ought, must and need, are reactance triggers by name in the same review. The system prompt in
`api/classify.js` predates Editorial Voice v1.2, and `scripts/voice_check.py` has no rule for
controlling language today.

## P-3. The card's behavior-change claim is not evidenced

The Classification Engine Specification calls the commenter message "the primary behavior-change
mechanism of the platform." The nearest tested analogue is the accuracy nudge. A preregistered
direct replication failed on its first sample at p = .67, and on a pooled N = 1,583 produced
treatment d = 0.14 against control d = 0.10 at an uncorrected p = .017
(`2021-roozenbeek-accuracy-nudge-replication`).

Dialecta's card differs in four ways that could plausibly make it stronger. It addresses the
contributor's own writing rather than a stranger's headline. It is specific rather than generic. It
repeats. It carries a visible consequence. None of those differences has been tested, so they are
reasons to run the experiment rather than reasons to assume its result.

I am not arguing the card is worthless. I am arguing the spec states as settled a thing the platform
has not measured, and that this is fixable for nearly nothing: the Stage A fields are already logged
per the spec's own System Integration Notes. Log whether the contributor edited after seeing the card
and how the tier moved, and the platform is measuring its central claim instead of asserting it.

Worth saying plainly: the Founding Philosophy does not make this mistake. Article 10 calls the answer
"not assumed" and "the thing being tested." The founding essay is honest here. The engineering spec
is the document that overreached.

## P-4. The Contrast Strip is an audience, and audiences change behavior

The Discourse Layer UX publishes the mismatch between declared tier and engine tier on every comment
that has one, permanently, and calls this "not a warning" but "a statement of fact about how the
system works." Both halves of that are true and the description is still incomplete. The strip is a
fact and it is also a broadcast, and broadcasting is the condition under which people work to avoid
looking bad (`2014-barasch-broadcasting-narrowcasting`).

The failure is specific and it damages a locked number. Self-declaration carries 15 percent of
classification weight. A contributor who expects a permanent public mismatch has one easy way to
avoid it, which is to declare low. Systematic under-declaration would make that 15 percent measure
fear of the strip rather than calibration, and Calibration is one of the six pillars.

Rost et al. point the same way from a different direction: visible identity plus an audience turns a
comment into a performance, and in the one setting measured at scale it made behavior worse rather
than better (`2016-rost-online-firestorms`).

I am not asking for the strip to be removed. Transparency about the engine's fallibility is worth
something real. I am asking that permanence be treated as the variable it is, and that somebody
compare self-declaration distributions for contributors who have received a strip against those who
have not before the design is locked.

## P-5. Ask for the out-group by name

Question 4 of the Stage A prompt asks "Are tribal, rhetorical, or identity-signaling patterns
present?" That aims at in-group signaling. The strongest measured marker in the literature is
reference to an out-group, and the prompt never asks for it (`2021-rathje-outgroup-animosity`).

The Stance and Heat boundary currently turns on whether a comment is mainly expressing feeling or
mainly signaling group membership. Group membership signaling is hard for a classifier to see.
Reference to the other side is easy to see and predicts the behavior better. Adding an explicit
out-group reference check to Stage A is a small prompt change with the best available evidence behind
it, and the same prompt is inline in `api/classify.js`.

## P-6. Community voting needs a bridging aggregator

Moral contagion is bounded by group membership: moral-emotional language spreads more strongly within
a faction than between factions (`2017-brady-moral-contagion`). Dialecta removed the diffusion reward
by sorting on tier before votes, which is the right call. But the vote itself is still a within-group
signal, and a comment that flatters the voting majority can collect the votes that move its tier. At
35 percent of classification weight, that is the largest single opening for the behavior this platform
exists to refuse.

Bridging-based ranking is built for exactly this failure. It surfaces only what people with different
inferred viewpoints agree on, and when deployed it measurably reduced resharing
(`2022-wojcik-birdwatch-bridging`). Dialecta already holds the raw material, because the live Supabase
project has an `opinion_map_positions` table.

This bears on backlog A-D1, which asks about the re-review threshold and whether community judgment
alone may outweigh the AI. The threshold is the wrong knob while the aggregation is a raw count.
Settle what is being counted first. Honest limit: bridging assumes factions are legible, and
disagreements about whether a comment is specific may not split along the axes politics splits on.

## P-7. P0-D2, on consent and autonomy

**The question as framed is not the consent question.** Open against invite-only decides who may
enter. Autonomy is about what happens to a person once inside, and on Dialecta what happens is
unusual: every comment is read by a model, a tier is attached in public, a mismatch may be published
permanently, and a Thinking Fingerprint accumulates from all of it. Consent means the Pact discloses
those four things before the first comment, in plain language, and that the Growth Layer asks again
rather than assuming the first yes covers everything it later does. That is the position. The sign-up
mode is the smaller half of P0-D2.

**On login methods.** Neither magic link nor Google requires a legal name, which the evidence
supports: non-anonymous users were more aggressive than anonymous ones across 532,197 comments, and
the mechanism was performance for an audience (`2016-rost-online-firestorms`). Between the two, magic
link should be presented first and Google second, because Google discloses the sign-up to a third
party and magic link does not. That is a real autonomy difference and it costs one line of ordering in
the UI. Passkeys later raise no concern. Any future proposal for verified real identity has this
study to answer first.

**On open against invite-only.** No autonomy objection to either, and I will not manufacture one.
Invite-only substitutes the platform's judgment of who belongs for the person's own decision to join,
which sits badly with Article 6, so if it ships it should be named as a capacity measure with an end
date rather than as a quality filter. Framed as capacity it is honest, and I concede the treasurer's
cost case for it without argument: every comment is an API call and a small launch is a cheap one. My
constraint cuts the same way, because a principle that produces an empty site protects nobody.

**Recommendation.** Open sign-up with the Pact as the gate, magic link first, Google second. If cost
forces invite-only, time-box it and say in the copy that it is about capacity.

## P-8. One amendment to the source thesis

The Founding Philosophy opens with the claim that human behavior is less influenced by stated values
than by environmental incentives. Pennycook et al. found something adjacent and importantly different:
most people say sharing only accurate content matters to them, that preference is real, and the
environment defeats it by holding attention elsewhere rather than by overriding it. Shifting attention
back was enough to improve what people shared (`2021-pennycook-accuracy-nudge`).

The thesis sets values and environment against each other. The evidence says they are not opponents.
The environment wins by distraction, not by conversion.

This is a refinement and not a refutation, and I am not going to inflate it into one. But it changes
what the platform has to do, and in the platform's favor. Dialecta does not need to install a standard
its contributors lack. It needs to protect one moment, the moment between writing and posting, from
being crowded out. That is a smaller job with better evidence behind it, and it explains why Stage 2
of the Discourse Layer sits exactly where it should. Any future proposal to move classification
feedback into a notification, a digest, or the profile gives up the mechanism and should be refused on
that ground.

## P-9. What payment does to a contributor, answering `treasurer`

Heyman and Ariely found that a price, not its size, switches a person from social norms to market
norms; a non-monetary gift of equal value does not switch the frame (`2004-heyman-ariely-market-norms`).
A $50 membership is not a small version of a $500 one in the way that matters here. It is the same
switch. Once inside a market frame, a person totals up what they received against what they paid,
which is exactly the behavior `treasurer` is right to worry about at Stage 3: a paying member whose
comment lands lower than expected has a transaction to be unhappy about, not just a reading to
disagree with.

The fix is not a smaller fee or a warmer one. Framing cannot out-argue a frame the price itself
installed. The fix is structural: payment status never reaches the classifier, the vote weight, or the
nomination panel, so a market-frame expectation has nowhere to act even if a member holds it. That is
cheaper than it sounds, because it is a thing Dialecta can simply not build rather than a thing it has
to build and enforce. I will not extend this into an argument against membership itself; the treasurer's
arithmetic on what the platform needs to survive stands, and $936 a year is not a sum worth abandoning
a funding model over. Recommendation: fund it, and keep the wall.

**Scope, added 2026-09-20 when the price ladder was put to this seat.** The switch happens once. A
member who has paid anything already holds market norms, so price movement after that first dollar,
including $50 against a pre-announced $100, is movement inside a frame they hold rather than a second
conversion. This position reaches the decision to charge. It does not reach what the price later
does, and stretching it that far would be using a source where it does not apply. The one extension
that does follow: a locked founding price is a louder market signal than a price, so the wall this
position asks for covers the lock on the same terms.

## P-10. The gate and the nudge bar are different mechanisms, answering `designer`

Matias's field experiment isolated the variable designer's D-2 asks about: display the norm, change
nothing about what is enforced, and newcomer compliance rose 8 points, newcomer participation 70
percent (`2019-matias-norms-r-science`). The intervention was visible and non-blocking. It answers
designer's question directly: yes, a threshold that catches almost nothing can still do cultural work,
but the source of that work is the statement being seen, not the gate being enforced. A silent disabled
button is not a smaller version of a posted rule. It is the one part of the mechanism with no result
behind it.

This also answers designer's first question, on reflective friction placed before against after.
Steindl et al. name situational barriers as a reactance trigger in their own right, distinct from
controlling language (`2015-steindl-reactance`). A blocked submit button before any content exists is a
situational barrier with no stated reason, which is the illegitimate-threat condition the same review
found produces immediate emotional response rather than reflection. The card, whatever else is true of
it, discloses its reasoning and closes with a restoration postscript. The gate does neither. D-2 is
right, and the mechanism I would put underneath it is Matias's: keep the nudge bar, keep a floor only
to stop an empty submit, and drop the disabled state.

## P-11. Contest without a new author, answering `legal`

Written in full as a `### philosopher` answer to `2026-09-20-legal-03` in
`exchange/open/2026-09-20-legal-03-blindspot-human-review-aggravates-230.md`. Summary for the table:
the autonomy interest behind "a contributor can contest what is published about them" is real and I
hold it, but it does not require the platform to author a second opinion. Community re-review
(backlog A-7, A-8) gives a non-authoring contest path, and on reactance grounds it may do the dignity
work better than an employee's review would, not just more cheaply. Legal's Section 230 analysis
changed the shape of my answer: I no longer read "human in the loop" as a single mechanism with one
verdict, and I now hold that pre-publication human review is the one contest design actually worth
opposing on both grounds at once.

**Scope, added 2026-09-20 in the fingerprint legibility debate.** P-11 was written for classification
errors, where there is a comment to re-review. The reading test found an error of another kind: a
stranger read heat into Father Anselm's mark, and none of his comments is misclassified. A community
re-review of every one would confirm them all and leave the mark saying the same thing. A render
error has nothing to contest. Its remedy is verification, a count anyone can check beside the mark,
which makes the counts a precondition for a legible public mark. It does not replace the contest path
this position asks for.

## P-12. What decides a conditioned badge, answering Dan

Written in full in `positions/2026-09-20-charter-badge-and-price-ladder.md`. Summary for the table:
the Tier Psychology shame argument does not transfer to a badge, because it was built for a label
applied to a person's thinking against their will, and a mark for having written articles is
voluntary, countable and about output. Charter Writers already hands the first 25 published authors
lifetime comp, so earned distinctions are established practice here and my objection to one more is
soft.

What is not soft is the shape. Deci, Koestner and Ryan (1999), across 128 studies, found expected
completion-contingent rewards undermine free-choice motivation at d = -0.36 while unexpected and
task-noncontingent ones do no damage, because a person not working for the reward does not feel
controlled by it. Anderson et al. (2013) measured the rest on several million Stack Overflow users:
a visible threshold produces a rush before the line, a fall to baseline after, and effort steered off
other contributions. That last finding widens the charter's Goodhart veto past the Fingerprint to any
countable threshold attached to a visible mark.

Three smaller rulings carried in the same position. A condition applied to a badge already granted is
a revocation rather than an absent mark, which is a question of sequence and not of psychology.
Absence becomes legible when the cohort is small and countable, so the size of the founding group
should never be published beside the mark. And where a marker has to rest on a threshold, set it at
one: Anderson's acceleration needs a gap to close, and a threshold of one has no gradient.

**Predicate correction, 2026-09-20.** The first draft of this ruling rendered the marker on
`is_charter` plus `is_author`, inherited from the convener's framing rather than from the schema.
`is_author` records permission rather than work. Migration 006 calls it the gate on
`/api/article/submit`, and migration 010 flips it inside the same update that writes
`pact_signed_name`, so signing the Pact sets it. The predicate is a count of a member's rows in
`articles` at `status = 'published'`. The error is worth keeping on the record because it is the same
failure as the one above arriving from the other side: a mark that tripped at Pact signature would
have distinguished nobody, where a mark inside a published cohort of a hundred distinguishes too
well. Both are a mark whose meaning nobody checked against the population carrying it.

## P-13. Dated acts, and a zero that looks like zero

Written in full in `positions/2026-09-20-fingerprint-legibility-and-model.md`. Summary for the table:
Tangney, Stuewig and Mashek (2007) separate shame, a judgment of the global self, from guilt, a
judgment of a specific act, and report that stable attributions for a failure go with shame
(`2007-tangney-moral-emotions`). A dated act inside a larger record is the specific, unstable case,
a scar. An undated texture across the whole shape is the global, stable one, a wound, and the ring
model draws all tier history that way because `tierMix` holds no dates.

The reading test supplied the measured case. All seven single-mark readers reported heat, the four
heated records and the three calm ones alike, including Father Anselm, whose record holds none,
because the noise floor draws the same wobble the legend calls heat. A count can read zero. An
organic line never looks like zero. Proposed bar for the human study, set before it runs: a heat
reading at least ten times likelier on a record with heat than on one without. The test's ratio was
one.

## P-14. The mark beside the vote

Written in full in the same position. Tomkins, Zhang and Heavlin (2017) gave each paper two reviewers
who could see its authors and two who could not; seeing raised the odds of recommending acceptance
1.63 times for famous authors, among experts (`2017-tomkins-single-double-blind`). The comment card
already carries the author's archetype tag on the same card as the vote controls, and community
voting is 35 percent of a comment's classification. A legible byline mark turns that vote into a
review of the person, and the vote feeds the tier that grows the mark. Article 6 protects difference
without turning it into hierarchy. In a thread: one size for everyone, nominal channels only, the
full mark a tap away.

This sharpens P-6 without replacing it. A bridging aggregator corrects for which faction voted. It
does nothing about a voter who judged the author before the comment. Honest limit: Tomkins measured
experts on papers, so the direction should transfer and the size is unknown.

## P-15. The trade-off penalty

Written in full in the same position. Dolores Vance holds 22 graduations on Discourse, tied for her
highest; the penalty draws it at 70 percent, fifth of six, and a stranger named Discourse her weakest
pillar. The archetype grid says the trade-off pairs "are respected," and its data shows the cost:
the Synthesizer's high Acuity, a pairing Contributor Identity calls "rare and visible," drops to 11,
and the Illuminator's high Discourse drops to 8, her lowest. Dan exempted Consistency because
penalising it "would have the platform say that showing up reliably costs you something elsewhere"
(`packages/core/src/fingerprint-geometry.ts`). The penalty says that about fairness, to each person,
including the ones whose record contradicts it. A real tendency shows in the record unaided. The
exemption assumed the penalty stays, so its deletion is Dan's call.

---

## Where the evidence backed the founding documents

Recording this because an advisor who only finds faults is not being honest either.

- **Article 4, the door held open.** Every commenter message below Breach ending with the option to
  post as-is is a restoration postscript, and restoration postscripts are the tested intervention for
  reducing reactance (`2007-miller-restoration-postscripts`). The rule was right before anybody
  checked. One caveat worth carrying: it was tested as a single exposure, and Dialecta would use one
  on every comment forever. A door held open a hundred times may stop reading as a door.
- **Editorial Voice v1.2, observational rather than evaluative.** Controlling language produced
  message rejection and source derogation in the same study; concrete language drew more attention,
  was judged more important, and improved assessments of the source. The rule requiring one concrete
  suggestion buys credibility for the classifier, not just persuasion.
- **Article 2, the AI reflects rather than gatekeeps.** This is the nudging and boosting distinction
  in other words (`2020-lorenz-spreen-boosting-autonomy`). A nudge steers the next comment; a boost
  leaves the contributor better at writing anywhere, including off Dialecta. Useful test to apply to
  every surface: the structured analysis grid and the seven tier descriptions in the nomination picker
  are boosts, the nudge bar and the commenter message are nudges. Where a surface could be built
  either way, build the boost.
- **Tier Psychology, "why shame doesn't work."** Asserted without a source. Tangney, Stuewig and
  Mashek (2007) supply one: shame, a judgment of the self, goes with hiding and anger turned outward,
  and guilt, a judgment of an act, with repair (`2007-tangney-moral-emotions`). The rule was right at
  the naming layer. It has not yet reached the image (P-13).
