# The Charter badge, and what early commitment earns

*Framed by the convener 2026-09-20 for two seats, `legal` and `philosopher`, at Dan's instruction.
Protocol: `.claude/skills/dialecta-council/SKILL.md`. No chair seat on this one; the convener
assembles and reports.*

## Question

**One.** Dan, verbatim, on the Charter badge being permanent: "Would it be acceptable to require
them to submit a certain number of Articles in the first year to lock it in?"

**Two.** Dan, verbatim, put on the table while the seats were working: "Perhaps we offer $50 today
with a pre-decided increase to $100 a year from now?"

They are one question wearing two hats. Both ask what early commitment earns.

## What the structure says today

Assembled in `docs/SUBSCRIPTION-MODEL.md`. Three founding cohorts compose from three independent
columns, so a person can sit in more than one.

| Cohort | Who | `is_charter` | `is_gifted` | `gift_expires_at` | Gets |
| --- | --- | --- | --- | --- | --- |
| Charter Writers | First 25 published authors | true | true | `NULL` | Lifetime comp |
| Charter Underwriters | First 100 paying members | true | false | n/a | Paid recurring, locked founding price |
| Founding Voices | First 50 active commenters | false | true | `now() + 1 year` | One year comp |

Migration `032_profiles_is_charter.sql` makes the permanence the point: "Locked at upgrade time,
never revoked even if `subscription_tier` later lapses. Distinct from `subscription_tier` (which
can change) so the two live as separate columns."

The positioning copy on the free tier, in `_recovered/api/_subscription-tier.js`: "Underwriters
keep Dialecta free to read. Iterate polish without limit. See more of the framings the engine
considered."

Live state: 14 profiles, 1 on `pro`, 13 on `free`, 1 carrying the Charter flag, 0 gifted. No
payment integration anywhere. `getTierCapabilities` has no caller. `upgrade_url` is `null` in both
tiers. Eight of the ten paid capability rows are inert until the Growth Layer ships.

The plumbing to count articles exists: `articles.author_member_id` with a status CHECK of
`draft / classified / published / reclassified`, and `profiles.is_author`.

## The three objections the convener would raise on the badge, written to be attacked

1. **It contradicts the pitch.** "Underwriters keep Dialecta free to read" prices patronage, paying
   so other people can read. Requiring the patron to also produce converts it into a membership
   with performance conditions, which is a different product and would need different copy.
2. **The outcome is already incentivised, harder.** Charter Writers gives the first 25 published
   authors lifetime comp. That is a larger incentive to write than a badge, aimed at the same year
   and the same behaviour.
3. **It creates a visible mark for not producing.** A person who paid, did not write, and now lacks
   a badge their cohort carries is publicly marked, on a platform whose tier psychology was built
   to convert shame into accountability.

## The alternative to test the badge condition against

`is_charter` and `is_author` are both already columns, so a person who both underwrote and wrote is
already representable with no new state. A distinct rendering for that combination gets Dan a
visible marker for underwriters who also write, with no clawback, no condition on money, and
nothing taken from anyone.

## Why the ladder changes what is being ruled on

"Locked founding price" is a promise with nothing behind it today, because no higher price exists
for it to be locked against. That is part of why the badge was carrying the weight of the founding
reward. A published ladder moves that weight off the badge: the first hundred would hold $50
permanently against a stated $100, which is checkable, dated and worth real money. If that is what
early commitment earns, the badge may not need a condition at all.

Test that rather than adopt it. A purely financial founding reward may be the thing that converts a
patron into a customer, which is `philosopher`'s own social-to-market concern pointed at a new
target.

## What each seat owes

**`legal`, on the badge.** Whether taking money against "Charter Underwriter at a locked founding
price" and then conditioning part of it on future behaviour is a clawback on a consumer promise,
what it would need in the terms, and whether Arizona changes the answer. Nothing in this codebase
carries enforceable terms yet, which is this seat's own open finding. Say plainly whether it can be
done cleanly if Dan wants it, and what it costs.

**`legal`, on the ladder.** A pre-announced increase for future members is an ordinary priced change
with notice. The sticky part is grandfathering: the first hundred keeping $50 permanently is a
promise made at the moment of payment and it has to survive in writing. Say what the ladder needs
in the terms before the first person pays $50, and what a gifted year that lapses after the
increase renews at, $50 or $100.

**`philosopher`, on the badge.** Whether a condition on a badge is compatible with what the platform
claims to be, and specifically whether the absence of an earned mark reads differently from the
presence of a penalty. This seat has argued the platform must not shame. Test whether that applies
here or whether this is an ordinary earned distinction and the objection is soft.

**`philosopher`, on the ladder.** Whether a published ladder is honest urgency or manufactured
scarcity. The house test is whether the cost of delay is specific and true rather than vague, and
$50 against a dated $100 is specific. Rule on whether that survives P-9, which says the price
crossing zero is what matters and its size does not. If size does not matter, a ladder is free. If
it does, say why.

**Both, on what the increase is tied to.** Eight of the ten paid capabilities do not exist yet. $50
is honest for two lifted editor limits today; $100 is honest once the Growth Layer ships. A
date-only increase commits Dan to raising the price on a day the product may not have earned it.
Say whether the ladder should be dated, milestoned, or both, and what he owes the first hundred if
the milestone slips.

**Both.** Dan asked whether it is acceptable, not whether you like it. If the answer is acceptable
with conditions, name the conditions. If a seat thinks the convener's three objections are weak,
say so with reasons.

## Positions

*Briefs concatenated verbatim and unedited, in seat order, per the protocol. Full positions:*
*`council/legal/positions/2026-09-20-charter-badge-and-price-ladder.md`,*
*`council/philosopher/positions/2026-09-20-charter-badge-and-price-ladder.md`.*

### legal

Dan is pre-money. No payment integration exists, `upgrade_url` is null in both tiers, and no
dollar has been taken against "Charter Underwriter at a locked founding price." A condition
published before the first dollar is a term of the offer rather than a clawback, so both questions
are acceptable. Both need the same thing: the condition and the ladder on the screen before the
card field, which ROSCA 15 U.S.C. 8403(1) requires and which New York GBL 527-a names as a
material term. The exposure nobody has named is the capability matrix. Eight of the ten paid rows
are inert, and a pricing page that lists them is the misrepresentation.

### philosopher

Both are acceptable with conditions, and my shame objection is soft where the convener aimed it. A
badge nobody held is not a badge taken away, and the first 25 authors already get lifetime comp, a
larger earned distinction than a ring. What decides the badge is whether the condition is announced
while the person writes. Deci, Koestner and Ryan (1999), 128 studies: expected completion-contingent
rewards undermine free-choice motivation at d = -0.36, unexpected ones do not, and positive feedback
enhances it at d = +0.33. Same badge, opposite signs. On the ladder, P-9 raises no objection, because
the switch to market norms happened at the first dollar.


## Rebuttals

*Appended verbatim from each seat's own file. `legal`'s addendum sits outside its 300-word
rebuttal by design, because the two seats crossed on the milestone and something had to be left
standing.*

### legal

#### Rebuttal to philosopher

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

#### Addendum, after philosopher's rebuttal landed

We crossed on the milestone. I conceded toward publishing it; `philosopher` conceded against.
Different axes, and both concessions hold. Publishing the milestone alongside the hold clause
creates no exposure, so it is permitted. It buys no honesty the date did not already supply, so it
is optional. **The load-bearing half is the hold clause, and it should be published either way**,
because holding the price is what removes the 101st's transaction. Outside the 300-word rebuttal
by design.

### philosopher

#### Rebuttal to legal

**The deadlock is false, because my version drops Dan's question.** ROSCA reaches material terms of
the transaction. In my version nothing about the transaction is conditioned: `is_charter` is granted
at checkout unconditionally, and a member who never writes gets everything they paid for. A rendering
conferred later takes nothing and promises nothing, so there is no term to disclose and no bargain
for Douglas to modify. Legal's screen and my silence never meet. They miss only because my version
rewards where Dan asked to require, which legal says too. If he wants the requirement, the seats are
incompatible and it should not be built.

**Conceded, to legal.** The grant-only structure in section 2 beats my sequence objection. Setting
the flag at condition-met time never creates the thing to be lost.

**Conceded, with a size.** Deci measured people doing a task for an experimenter, and I applied it to
people buying a membership. Two stretches. The undermining reaches the member who would have written
anyway, a subset rather than the cohort, since one who would never write has no motivation to
undermine. And -0.36 comes from a tangible-reward corpus where a badge is symbolic and should land
softer. What holds at measured range is the expected-against-unexpected moderator. Anderson carries
the magnitude, on badges, at scale.

**Legal is right on the milestone and I over-reached.** "$100 on 2027-10-01" is specific and true,
the whole house test. The milestone answered whether the $100 is earned, a fairness question rather
than an honesty one, and publishing it buys no honesty the date did not supply.

**The capability matrix strengthens the patronage framing.** A feature ladder hands a member a list
to total against what they paid, the market-norm behaviour P-9 predicts. Patronage leaves nothing to
total. Section 5 and P-9 want the same page.

#### Correction to my own badge condition

My recommendation said to render the marker on `is_charter` plus `is_author`. That is wrong, and the
framing it came from is wrong with it. `is_author` records permission rather than work: migration 006
calls it the gate on `/api/article/submit`, meaning may write, and migration 010 flips it inside the
same update that writes `pact_agreed_at` and `pact_signed_name`, so signing the Pact sets it. Some
profiles carry it from manual seeding. The predicate I should have named is the one legal wrote
against, `articles.author_member_id` joined to profiles on `status = 'published'`.

**Set the threshold at one, and nowhere higher.** Anderson's acceleration needs a gap to close, and a
threshold of one has no gradient: a member is at zero or finished. Three articles is a quota. One
published article is a categorical act, and the distinction between them is the whole of my section
3. The 25 lifetime-comp authors sit in a separate cohort awarded for being first rather than for
volume, so they add no second denominator inside the hundred.

**The error is evidence for the position.** A mark rendered on a flag that trips at Pact signature
would have appeared on every participating underwriter, a distinction that distinguishes nobody. That
is the mirror of section 2. There, a missing mark becomes legible because the denominator is small;
here, the mark becomes meaningless because the denominator is everyone. Same mistake either way, a
mark whose meaning nobody checked against the population carrying it.


## Joint outcome

*Two seats, both filed, both rebutted. They converged, so the convener records the outcome rather
than chairing a synthesis. `decider` writes the ADR if Dan decides; the next number is ADR-005.*

### Roll-call

**`legal`: carried.** The timing analysis decides the badge question, and neither seat contested
it. Conceded the deadlock and conceded the milestone.

**`philosopher`: carried.** The announced-against-unannounced moderator decides what a condition
costs, and neither seat contested it. Conceded the sequence objection to `legal`'s grant-only
structure, conceded that Deci was applied past its measured range and sized the stretch, conceded
the milestone, and corrected its own predicate when the convener's framing turned out to be wrong.

### Both questions: acceptable

**The badge, yes, and the window is open now.** No dollar has moved against "Charter Underwriter
at a locked founding price." No payment integration exists, `upgrade_url` is null in both tiers,
and `getTierCapabilities` has no caller. A condition published before the first payment is a term
of the offer rather than a clawback, so the question Dan asked has no clawback in it. The window
closes the day Stripe goes live: after that, Douglas v. Talk America (9th Cir., binding in Arizona)
makes a later-added condition an offer nobody accepted.

**The ladder, yes, and it is better than ordinary.** New York GBL 527-a enumerates "how and when
the price will change" among the terms owed before billing information is requested, so a dated
increase is the disclosure the statute already asks for. `philosopher`'s P-9 raises no objection,
because the switch from social to market norms happened at the first dollar and its size does not
move it. What a published ladder binds is Dan, not the members.

### What requiring it costs

The only legally clean version of Dan's question is the announced one, because a condition on what
the money buys has to be on the screen before the card field. The announced version is the exact
configuration Deci, Koestner and Ryan measured across 128 studies: expected completion-contingent
rewards undermine free-choice motivation at d = -0.36, unexpected ones do not, and positive
feedback runs the other way at d = +0.33.

That is a trade with a known price on each side rather than a deadlock, and it is Dan's to make.
The price is paid by the members who would have written anyway.

### The version both seats prefer

Neither seat was asked to recommend it and both arrived at it.

| | |
| --- | --- |
| Grant | `is_charter` unconditionally at checkout, never revoked, migration 032 unchanged |
| Marker | A distinct rendering on `is_charter` plus at least one row in `articles` at `status = 'published'` |
| Threshold | One. A threshold of one has no gradient, so a member is at zero or finished |
| Timing | Conferred after the writing |
| Announcement | None, and no progress counter anywhere in the product |
| Cohort size | Never published beside the mark |

It requires nothing, so no disclosure duty attaches. It takes nothing, so there is no clawback and
no bargain to modify. An unannounced mark is the +0.33 configuration rather than the -0.36 one.

**Two triggers put the legal duty back,** filed by `legal` and unopposed. The day the marker gates
a capability, a price or standing, it becomes a term and ROSCA 8403(1) attaches at the next
renewal. The day any sales copy mentions recognition, the surprise has become a promise.

### The milestone, where the seats crossed

`legal` conceded toward publishing it. `philosopher` conceded against. Different axes, both
concessions sound, and `legal`'s addendum is what leaves something standing: publishing the
milestone alongside the hold clause creates no exposure, so it is permitted; it buys no honesty the
date did not already supply, so it is optional.

**The hold clause is the load-bearing half and ships either way.** If the milestone slips, the
price holds and a new date is published. That removes the only transaction a slip can cost money,
which belongs to the 101st member.

### The finding nobody asked for

The live FTC Act Section 5 exposure is the capability matrix, not the ladder.
`_recovered/api/_subscription-tier.js` marks `practice_layer_coaching`,
`recommitment_prompts_90day`, `snapshot_annotations_archive` and unlimited annotations true on the
Underwriter side, and `docs/SUBSCRIPTION-MODEL.md` says on its own face that eight of the ten rows
are inert. A pricing page rendering them is a present claim about what $50 buys today, which is the
omission A.R.S. 44-1522(A) names.

`philosopher` reached the same page from P-9: a feature ladder hands a member a list to total
against what they paid, and totalling is the market-norm behaviour. Patronage leaves nothing to
total. Section 5 and P-9 want the same pricing page, which is unusual enough to record.

### A correction to the convener's framing

The framing said `is_charter` plus `is_author` already represents a person who underwrote and
wrote. It does not. `is_author` is a permission flag that trips when a member signs the Pact
(`_recovered/supabase/migrations/010_pact_agreement.sql`, and the `become_author` branch at
`_recovered/api/profile/[id].js` lines 1614 to 1626), and some profiles carry it from manual
seeding. So the flag tracks onboarding and seeding rather than writing, and a marker rendered on it
would mark people who never wrote.

**One claim in the convener's own correction did not survive checking,** and `philosopher` caught
it. The convener wrote that the Pact gates every comment, which would have made the flag universal
across the cohort. No code path outside `_recovered/api/profile/` reads a Pact column, so the Pact
is the onboarding gate by design intent rather than a check on the comment path. The predicate
finding stands without it. Three of fourteen profiles have signed.

`philosopher` took the useful half out of it: a mark nobody lacks and a mark almost nobody holds
fail the same way, which is a meaning nobody checked against the population carrying it.

### The convener's three objections, tested

**One, it contradicts the pitch. Carried, by both seats on different grounds.** `legal` makes it a
disclosure duty: a patronage pitch beside a production requirement is the omission A.R.S. 44-1522(A)
names, so "Underwriters keep Dialecta free to read" gets rewritten in the same change or the
condition does not ship. `philosopher` makes it the market-norms finding above.

**Two, the outcome is already incentivised harder. Weak as written,** per `legal`, which named what
sits underneath it: lifetime comp for the first 25 published authors is the largest unpriced
promise in the model and no seat has looked at it.

**Three, it creates a visible mark for not producing. The weakest of the three,** per `philosopher`.
The Tier Psychology shame argument was built for a label applied to a person's thinking against
their will; a mark for having written is voluntary, countable and about output. The real mechanism
is a small countable denominator, which is why "never publish the cohort size" does work that a
gentler tone would not.

### The gift

$100 on renewal, with an optional named conversion window at $50, disclosed when the gift is
accepted. Keep the cron that downgrades a lapsed gift to free. Filed by `legal`, unopposed.

### Still open

- The price itself, $50 against $100. Neither seat priced it and neither was asked to.
- Lifetime comp for the first 25 authors, unpriced and unexamined.
- Nothing in this repository carries enforceable terms of any kind. That is the gate in front of
  every condition above, and it is `legal`'s own standing finding rather than a new one.
