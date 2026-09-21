# Conditioning the Charter badge, and publishing a price ladder

*`legal` position, 2026-09-20, on Dan's two questions about founding-cohort terms. Not counsel.
Nothing here is legal advice.*

## Brief

Dan is pre-money. No payment integration exists, `upgrade_url` is null in both tiers, and no
dollar has been taken against "Charter Underwriter at a locked founding price." A condition
published before the first dollar is a term of the offer rather than a clawback, so both questions
are acceptable. Both need the same thing: the condition and the ladder on the screen before the
card field, which ROSCA 15 U.S.C. 8403(1) requires and which New York GBL 527-a names as a
material term. The exposure nobody has named is the capability matrix. Eight of the ten paid rows
are inert, and a pricing page that lists them is the misrepresentation.

## 1. The fact that decides most of this

Three things get called "conditioning the badge" and they are different animals.

| Version | What it is | Governed by |
| --- | --- | --- |
| Condition published before anyone pays | A term of the offer. The buyer reads it and decides | Ordinary contract. Nothing owed beyond disclosure |
| Condition added later, applied to people who already paid | Unilateral modification of a bargained-for benefit | Douglas v. Talk America, and A.R.S. 44-1522 if "permanent" was the inducement |
| Condition added later, applied only to new buyers | The first row again, for a new cohort | Ordinary contract, plus a fairness question that is not mine |

`docs/SUBSCRIPTION-MODEL.md` puts Dan in the first row and says so on its own face: a price "does
not exist. This is the decision," no pricing page, no payment integration, `upgrade_url` null in
both tiers, and `getTierCapabilities` with no caller. Zero dollars have moved against the Charter
Underwriter promise. So the clawback question does not arise. No consideration supports the
Charter Underwriter promise yet, which leaves nothing to claw back from.

**The window closes the day Stripe goes live.** After that, Douglas v. U.S. District Court ex rel.
Talk America, 495 F.3d 1062 (9th Cir. 2007), is binding in Dan's own circuit and says a party
cannot change the terms of a contract on its own. The revised contract is an offer, an offeree
cannot accept terms he does not know about, and continued use is not acceptance where no notice
was given (`research/2007-ca9-douglas-v-talk-america.md`). A condition added to the terms page
after a member paid against "permanent" binds nobody, and the attempt is the fact pattern A.R.S.
44-1522(A) calls a false promise.

**One live row needs naming.** The database carries one profile on `pro` and one carrying
`is_charter`. If that is a real person who was told the badge is permanent, they are a cohort of
one and should be grandfathered by name before anything changes. If it is a test row, delete it or
label it. Cost either way is zero, and this is the kind of item that only becomes expensive by
being forgotten.

## 2. What the badge condition needs in the terms

Three conditions, and the third carries the weight.

**Countable by a rule the buyer can apply without asking.** "A certain number of Articles" is a
sentiment. A term reads: how many, in what state, starting when, ending when, and what happens at
the end. The schema already forces the first two into the open. `articles.status` allows
`draft`, `classified`, `published`, `reclassified` (`_recovered/supabase/migrations/005_articles_table.sql`),
so the rule has to say whether `reclassified` counts. And `profiles.is_author` is not the counter:
migration 010 flips it to true when a member signs the Pact, which makes it a permission rather
than a record of work. The count is articles with that member's id in a published state.

**On the purchase screen, before the billing field.** ROSCA requires text that "clearly and
conspicuously discloses all material terms of the transaction before obtaining the consumer's
billing information", 15 U.S.C. 8403(1), which is in force and untouched by the Eighth Circuit's
vacatur of the click-to-cancel rule (`research/2010-usc-8403-rosca.md`,
`research/2026-ftc-negative-option-rule-status.md`). A condition on what the money buys is a
material term of the transaction.

**Granted when the condition is met, never revoked when it is missed.** This is the difference
between an acceptable term and the thing Dan's question was worried about, and it costs one word
of copy. `is_charter` already defaults to FALSE. Migration 032 sets it "at upgrade time" and says
"never revoked". Move the set to condition-met time and nothing is ever taken from anyone. A
member who pays and does not write has lost nothing they held; a member whose badge is removed has
lost something they were shown at checkout, which is a forfeiture of purchased value and the
version that draws A.R.S. 44-1522.

The cohort and the badge then want separate storage, because they stop being the same fact. The
cohort is the first hundred who paid and it is fixed at payment. The badge is the mark for writing
and it lands later. One ordinal column set at checkout, one boolean set when the count clears.

## 3. The convener's three objections

**One, it contradicts the pitch. Correct, and stronger than filed.** "Underwriters keep Dialecta
free to read" prices patronage. Leaving that sentence next to a production requirement is not only
inconsistent copy, it is the concealment or omission of a material fact that A.R.S. 44-1522(A)
names, measured against FTC Act Section 5 by the legislature's own instruction in 44-1522(C)
(`research/2026-az-consumer-fraud-act-44-1521.md`). Fixable by rewriting one sentence before
launch, which is why it is a condition rather than a veto.

**Two, the outcome is already incentivised harder. Weak as stated.** Charter Writers and Charter
Underwriters are different cohorts entered by different acts, and the badge condition exists
precisely to mark the overlap. Redundancy would need the same person to be plausibly in both, and
the objection asserts it rather than showing it. What is worth saying instead: **lifetime comp for
the first 25 published authors is the largest unpriced promise in this file.** Nothing in the
codebase bounds it, nothing says what happens if the platform's costs change, and it outlives
every other commitment under discussion. That falls outside this debate and deserves one of its own.

**Three, it creates a visible mark for not producing. The strongest of the three, and it has an
edge the framing did not name.** A public absence is a public statement about a named person, and
this seat's first sprint is about exactly that class of publication. The relief is that "did not
publish three articles" is provable and true, and truth is a complete defence, so this is a far
weaker version of the Breach exposure at `positions/2026-09-20-tier-label-first-party-speech.md`.
The objection answers itself under the grant-only structure in section 2: if the badge is granted
on the condition rather than removed on failure, and cohort rank is not public, a missing badge is
indistinguishable from never having underwritten. The inference disappears.

**On the convener's alternative.** Rendering `is_charter` and `is_author` together dominates on
this seat's axis. No condition on money, no forfeiture, no determination to defend in year two, no
new state. It buys a visible marker for underwriters who write at zero legal cost. It does not do
what Dan asked, because it rewards rather than requires, and that difference is his to weigh.

## 4. What the ladder needs before the first fifty dollars

A pre-announced increase for future members is better than ordinary. New York GBL 527-a
enumerates, among the material terms that must be disclosed before consent or billing information
is requested, "a clear and conspicuous explanation of how and when the price will change"
(`research/2024-ny-gbl-527-a-auto-renewal.md`). A dated ladder is the disclosure the statute asks
for. A silent rise is what it prohibits.

The grandfather is the part that has to survive in writing, and six items carry it.

| Item | Source | Cost |
| --- | --- | --- |
| Price, renewal frequency, cancellation deadline and mechanism on screen before the card field | ROSCA 8403(1), NY GBL 527-a | One screen |
| Express consent to the automatic renewal as its own step, outside general terms acceptance | Cal. Bus. & Prof. Code 17600 et seq. as amended by AB 2863, in force 2025-07-01 | One checkbox |
| Consent record kept three years, or one year past termination | Same | One table |
| Cancel control in the account, same medium as sign-up | ROSCA 8403(3), NY 527-a, California click-to-cancel | One route |
| Renewal reminder, 15 to 45 days before the deadline, annually | NY 527-a, California annual reminder | One cron job |
| Written answers to the three questions below | Nothing requires them. They are what makes "permanently" mean something | One paragraph |

**The Pact cannot carry the renewal consent, and that corrects this seat's own prior
recommendation.** `positions/2026-09-20-consent-waiver-and-the-pact.md` says to route sign-up
through the Pact rather than past it. That stands for consent to classification and does not
extend to money. California now asks for express affirmative consent to the automatic renewal term
itself rather than to the agreement as a whole, which reads as a requirement that the renewal
consent be its own act (`research/2025-ca-auto-renewal-law-ab-2863.md`). The Pact's section VIII
commitment text is about engaging with ideas and welcoming the mirror. It mentions no price, no
term and no renewal. Bundling a billing consent into it weakens both.

**The consent record is a table this seat already asked for.**
`positions/2026-09-20-consent-at-the-moment.md` proposes an append-only row storing who consented,
to what, and which version of the shown text they saw. California requires substantially that for
the renewal term, with a three-year retention. One table serves the defamation argument and the
renewal statute together.

**Three questions "permanently" has to answer, or it is unfalsifiable.**

1. **Does the price survive a lapse and rejoin?** Recommend no. Write "for as long as your
   membership stays continuous." Otherwise Dan holds an open option for a hundred people with no
   end date.
2. **Does it survive a change in what the membership includes?** Recommend yes, and say so. This
   is the honest reading of a locked price and it is most of what makes it worth buying.
3. **Does it transfer?** Recommend no. Tied to the account, not assignable, which also keeps it
   out of the peer-gifting path.

**Do not write "fifty dollars forever." Write the mechanism.** New York already prescribes what a
price increase owes: either affirmative consent to the higher price, or the right to cancel within
at least fourteen days of the charge with a pro rata refund of the remaining term, GBL 527-a.
Adopting that as the operator's own standing commitment converts a promise Dan might one day have
to break into one he can keep. The sentence is roughly: the founding price holds for as long as
the membership is continuous, and if it ever has to change, notice comes at least thirty days
ahead and the member can cancel and be refunded the unused part. Thirty days satisfies
California's seven-to-thirty window for a fee change and sits inside New York's fifteen-to-forty-five
reminder window, so one email does both.

## 5. The gifted year that lapses after the increase

Migration 034 has a daily cron downgrade `subscription_tier` to `free` when `gift_expires_at` has
passed. So a Founding Voice in month 13 is a free member rather than a lapsed payer. They never
paid, so there is no locked price to preserve and no contract to modify. What binds is whatever
was represented to them.

**They face $100, and the answer has to be on the screen at the moment the gift is accepted.** A
year is what the gift was, and a year is what they got. If Dan wants them at $50 he should say so
now and bound it: a named conversion window, for example thirty days from the gift ending, at the
founding price. "Founding Voices keep founding pricing" creates a second permanent cohort by
accident and outlives the reason for it.

Deciding this in month 13 is the one version that is not available. A representation made to
induce acceptance of a gift is still a representation under A.R.S. 44-1522(A), which reaches a
false promise "in connection with the sale or advertisement of any merchandise" whether or not
money changed hands.

**Keep the cron.** A one-time gift that silently converted the recipient into a paying
auto-renewal would be a negative option charged to someone who never supplied billing information,
which fails ROSCA 8403(2) at the first requirement. Downgrading to free is the correct behaviour
and should be protected when the payment webhook lands.

## 6. Dated, milestoned, and where the real exposure sits

**Dated, with the date chosen because of the milestone, and the milestone not published as a
promise.**

A date-only increase commits Dan to raising the price on a day the product may not have earned.
That is a business risk and not a legal one. Nobody is deceived by "the price becomes $100 on
2027-10-01" if it becomes $100 on 2027-10-01. The people who could be harmed by an unearned $100
are the ones who pay $100, and they decide with the product in front of them.

A milestone-only increase is worse in every direction. It makes the rise contingent on Dan's own
act, which is an option rather than a commitment; it gives the $50 cohort nothing they can check;
and it puts him in the position of announcing a feature in order to justify a price.

**The Section 5 exposure sits in the capability matrix rather than in the ladder, and that is the
finding this debate did not have.** `_recovered/api/_subscription-tier.js` gives the Underwriter
tier `practice_layer_coaching: true`, `snapshot_annotations_archive: true`,
`recommitment_prompts_90day: true` and `snapshot_annotations_recent: Infinity`, and
`docs/SUBSCRIPTION-MODEL.md` says those eight rows "land as no-ops" until the Growth Layer ships.
A pricing page that renders that matrix as what $50 buys is a misrepresentation of a material fact
under A.R.S. 44-1522(A), read against FTC Act Section 5 by 44-1522(C). The code comment saying
"scaffolding" is not a disclosure. The buyer reads the page.

This is the one place to be precise rather than precious. An FTC action against a hundred people
at $50 will not happen. An Arizona consumer claim by one annoyed member, in a court with a
one-year limitations period running from discovery, is small and possible. The reason to fix it is
neither: the compliant page is not harder to write than the non-compliant one, and it has to be
written once.

**What Dan owes the first hundred if the milestone slips: nothing, if he never promised it.** That
is a drafting answer rather than a remedy answer, and it is available today. The first hundred buy
two lifted editor limits, a locked price and what the copy promises, which is keeping
Dialecta free to read. That transaction survives the Growth Layer never shipping. The moment
"Underwriters get Practice Layer coaching" appears beside a checkout button, Dan has bought a
remedy obligation that no later apology discharges. If he wants to promise it anyway, promise it
with a date and a stated remedy, because a self-declared refund is cheaper than a claim.

## 7. What to accept, and what a lawyer is for

**Accept the residual regulatory risk.** Neither California's nor New York's renewal law carries a
private right of action. Mayron v. Google LLC, 54 Cal. App. 5th 566 (2020), holds the California
statute is reachable only through the Unfair Competition Law, where standing needs a causal link
between the violation and the payment. New York's penalties run from $100 to $1,000 with a bona
fide error defence, and only the Attorney General may sue. The federal rule that would have raised
the bar was vacated on 2025-07-08 and its replacement is an advance notice with no proposed text,
comments closed 2026-04-13 and no notice of proposed rulemaking as of today
(`research/2026-ftc-negative-option-rule-status.md`).

So the honest severity is low. What should not be accepted is the pre-launch cost, because there
is not one. Six items in section 4 come to a screen, a checkbox, a table, a route, a cron job and
a paragraph, all of them cheaper now than as a migration and an apology later.

**Do not build to the vacated rule.** Building to ROSCA plus California plus New York covers
everything it asked for, and whatever the FTC eventually proposes will arrive with its own comment
period and compliance date.

**Arizona changes less than the framing assumed, and the reason is worth keeping.** This is a
contract and consumer-protection question, so the state privacy finding does not reach it and
neither does the anti-SLAPP statute, which needs speech-suppressing motive that a consumer suing
over a price does not have. Arizona's real contribution is 44-1522(C): the legislature told its
courts to use FTC and federal interpretations of FTC Act Section 5 as the guide, so there is one
deception standard to write to rather than two.

**Three things this seat will not guess at.**

1. **Whether "locked founding price, permanent" is an enforceable contract term or a revocable
   policy.** That decides whether Douglas binds Dan indefinitely or whether he keeps a noticed
   right to change. Fold it into the existing one-hour ask at
   `exchange/open/2026-09-20-legal-02-advice-one-hour-of-counsel.md`.
2. **Whether taking recurring payment from residents of other states creates a registration or
   digital-goods tax duty.** Economic nexus thresholds sit far above $5,000 of revenue, so the
   answer is probably nothing, and this seat has not researched it and is not asserting it.
3. **Whether a peer gift paid by one person for another needs anything the direct purchase does
   not.** The gifter supplies the card and the recipient gets the service, which splits the
   consenting party from the charged party. Not researched.

## Recommendation

**Both questions: acceptable, with conditions. Do it now or not at all.**

On the badge, five conditions:

1. Publish the condition before the first dollar is taken. After payment it is a different
   question with a worse answer.
2. Write it as a countable rule: the number, the states that count out of `draft`, `classified`,
   `published` and `reclassified`, the window's start, its end, and what happens at the end.
3. Grant `is_charter` when the condition is met. Never revoke it for missing the condition. Store
   cohort membership in a separate column set at checkout.
4. Rewrite "Underwriters keep Dialecta free to read" in the same change. A patronage pitch beside a
   production requirement is the omission A.R.S. 44-1522(A) names.
5. Grandfather the one existing `is_charter` row by name, or delete it if it is a test.

On the ladder, seven:

1. Price, renewal frequency, cancellation deadline and mechanism on screen before the billing
   field.
2. The dated increase in the same place, stated as "how and when the price will change."
3. Express consent to the automatic renewal as its own step, outside the Pact and outside general
   terms acceptance.
4. A consent record kept three years, storing which version of the text was shown. The same table
   `positions/2026-09-20-consent-at-the-moment.md` already asks for.
5. A cancel control in the account, through the medium that took the sign-up.
6. A renewal reminder 30 days ahead, which satisfies both states at once.
7. The grandfather written as a mechanism: the founding price holds while membership stays
   continuous, it is not transferable, it does not survive a lapse and rejoin, and any change comes
   with 30 days' notice and a pro rata refund on cancellation.

On what the increase is tied to, three:

1. Set the date because of the milestone. Publish the date. Do not publish the milestone as a
   commitment.
2. Sell the two live capabilities and the patronage. List the eight Growth Layer rows as planned
   and unbuilt with no date, or leave them off the page.
3. If a capability is promised to induce a purchase, give it a date and a stated remedy in the same
   sentence.

On the gift: **$100, with an optional named conversion window at $50, disclosed when the gift is
accepted.** Keep the cron that downgrades a lapsed gift to free.

**If Dan wants the marker without the condition,** the convener's alternative gets it at zero cost
and this seat prefers it. The badge condition is available to him, cleanly, for about a day's work,
and only while the payment integration does not exist.

## Rebuttal to philosopher

**Conceded, and the deadlock is false.** ROSCA 8403(1) and GBL 527-a reach the terms of the
transaction: the product, the price, the frequency, the cancellation deadline and mechanism, and
how the price will change. A benefit nobody was offered is none of those, so no disclosure duty
attaches to it. Nor does anything else. Reliance needs a representation and there is none.
Unfairness under FTC Act Section 5(n) needs substantial injury, and getting more than was sold is
none. A.R.S. 44-1522(A)'s omission limb needs materiality and intent that others rely, and
withholding a thing so nobody acts on it fails both. My rule was right for the question Dan asked
and wrong as a general one. `philosopher` removed the predicate rather than meeting it, and that
version is cheaper legally as well as psychologically.

**Two triggers put the duty back.** The day the marker gates a capability, a price or standing, it
becomes a term and 8403(1) attaches at the next renewal. The day sales copy mentions recognition,
the surprise is a promise.

**What I hold.** A surprise requires nothing, and Dan asked whether he could require. The clean
legal version and the clean motivational version converge only by dropping the requirement: a
trade with a known price on each side rather than a deadlock, and his to make.

**Milestone, conceded.** A slip costs only the 101st, who pays $100 against a stated reason.
Holding the price removes that transaction, which is section 6's stated remedy supplied. **The
matrix is untouched.** "The price rises when the Growth Layer ships" is a future claim carrying a
remedy. `practice_layer_coaching: true` beside a checkout button is a present claim about today.

**Gift.** `philosopher` files no ruling, and its badge condition 6 points the same way. $100 with
a named conversion window stands.

### Addendum, after philosopher's rebuttal landed

We crossed on the milestone. I conceded toward publishing it; `philosopher` conceded against.
Different axes, and both concessions hold. Publishing the milestone alongside the hold clause
creates no exposure, so it is permitted. It buys no honesty the date did not already supply, so it
is optional. **The load-bearing half is the hold clause, and it should be published either way**,
because holding the price is what removes the 101st's transaction. Outside the 300-word rebuttal
by design.
