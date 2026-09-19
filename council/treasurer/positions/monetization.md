# Standing position: the monetization model

*Written 2026-09-19, sprint 1. The Project Brief lists monetization as an open design question with no ADR behind it. The charter calls it "open question 8"; in `docs/Dialecta_Project_Brief.md` as it stands it is number 7 of seven, under "Open Design Questions". Same question, and this note is about the question rather than its number.*

**Confidence: medium-high on the cost side, medium on the revenue side, low on anything past year two.** Every infrastructure price below was fetched from the vendor on 2026-09-19 and is filed. Every revenue number is a model rather than a measurement, because Dialecta has no membership revenue to measure. The charter says this advisor's numbers are estimates until Dan supplies current spend and member count. They still are.

---

## The position in one paragraph

Dialecta should fund itself with a **voluntary annual membership, billed once a year through Stripe directly, gating nothing**, with a patronage line beside it for people who want to give more, and with grant money ruled out as a source of operating cost. Advertising is out. Paying contributors from a pooled subscription is out. The platform should decide this before it opens to the public, as the charter requires, and the decision is cheap to make because **the amount of money involved is small enough to be covered by about a dozen people.**

---

## What it costs to run Dialecta

Fixed monthly floor, from vendor pages fetched 2026-09-19:

| Line | Now | After Ghost cutover | Source |
| --- | --- | --- | --- |
| Supabase Pro | $25 | $25 | `../research/2026-supabase-pricing.md` |
| Vercel Pro | $20 | $20 | `../research/2026-vercel-pricing.md` |
| Magic Pages (Ghost) | $15 | $0 | `../research/2026-ghost-magicpages-hosting.md` |
| Resend | $0 | $0 until 100 emails a day | `../research/2026-resend-pricing.md` |
| Anthropic, at 1,000 comments | $2 | $2 | `../research/2026-anthropic-api-pricing.md` |
| **Total** | **$62** | **$47** | |

Annualised: about **$744 now, $564 after cutover**. Two of those lines are less optional than they look. Supabase Free pauses a project after a week of inactivity, so a live site cannot use it. Vercel Hobby is "for personal, non-commercial use", so the first paid membership takes Hobby off the table as a licence matter rather than a capacity one.

Variable cost is one line: the Stage 1 classification call. At Haiku 4.5 rates against the live prompt in `api/classify.js`, that is **about $0.002 a comment**, ceiling $0.004. Ten thousand comments a month is $20. The charter's veto on "per-comment costs that scale linearly with the community" is not triggered at any volume Dialecta will plausibly reach.

Two savings that look available and are not. Prompt caching does not apply, because Haiku 4.5 needs a 4,096-token prefix and Dialecta's system prompt is about 670 tokens, so caching is skipped silently, and padding the prompt to reach the minimum costs more than it saves at low volume. The Batch API's 50 percent discount cannot serve Stage 1, because the Project Brief specifies pre-analysis as instant and on submit, and a batch may take an hour. Both in `../research/2026-anthropic-caching-batch-limits.md`.

**Dialecta's problem is not that it is expensive. It is that nobody has decided who pays the $47.**

## What that means the question is

Kelly's arithmetic run backwards: 1,000 true fans at $100 a year is $100,000, and Dialecta needs $564. That is **six true fans**, or twelve annual memberships at $50, or 51 gifts at Wikimedia's average of $11. Sources: `../research/2008-kelly-1000-true-fans.md`, `../research/2026-wikimedia-fundraising.md`.

The monetization question is not "how does this become a business". It is "how does this cover a bill smaller than one streaming subscription a month without changing what the platform rewards". That question has answers the first one does not, and the council should frame it that way before it argues about models.

## What is ruled out, and why

**Advertising.** The charter vetoes it; MetaFilter is the arithmetic. In October 2012 MetaFilter's traffic fell 40 percent overnight on a Google ranking change and its ad revenue nearly halved within weeks, having done nothing differently. Ad revenue on a discourse site is a derivative of another company's algorithm. `../research/2014-metafilter-ad-collapse.md`.

**Paying contributors from a pooled subscription.** Medium's model splits a pool by member reading time. Two objections point the same way, which is rare enough to record. The treasurer's is arithmetic: pooled payout makes contributor cost scale with contributors while revenue scales with paying members, so ten times the contributors pays each a tenth and the platform has saved nothing. The philosopher's is that paying for reading time rewards the performance of thinking and turns the fingerprint into a scoreboard with cash attached. `../research/2026-medium-partner-program.md`.

**A grant as the operating base.** INN's members take 49 percent of revenue from foundations and the sector calls that mix unbalanced. A grant sets a clock somebody else winds. The charter already vetoes single-grant dependency and this is the sector-scale evidence. Grants remain fine for a discrete build with a start and an end. `../research/2025-inn-index-revenue-mix.md`.

**Routing payments through Patreon or Substack.** Both take 10 percent, for a payment page and a discovery surface. Dialecta has its own site, its own auth and its own member table, and Stripe charges 2.9 percent plus 30 cents for the same transaction. `../research/2026-substack-platform-fee.md`, `../research/2026-patreon-kofi-patronage-fees.md`.

## What is chosen, and the arithmetic behind it

**Annual billing, not monthly.** The most concrete thing in this position, and it costs nothing to implement.

| Charge | Stripe fee | Effective rate |
| --- | --- | --- |
| $1/month | $0.336 | 33.6% |
| $3/month | $0.408 | 13.6% |
| $5/month | $0.480 | 9.6% |
| $50/year | $2.10 | **4.2%** |

Stripe's fixed 30 cents dominates small recurring amounts. A $5 monthly membership costs $5.76 a year in fees on $60 of revenue; a $50 annual membership costs $2.10 on $50. Annual keeps five and a half more points of every membership, cuts the transaction count twelvefold, and takes twelve times as many expired cards and dunning emails off Dan's desk. Never price a charge below about $5; at $1 the processor takes a third. `../research/2026-stripe-processing-fees.md`.

**Voluntary, gating nothing.** Here the treasurer argues against a revenue mechanism on treasurer grounds, so the reasoning matters. A paywall around commenting would raise some money and shrink the contributor pool. At $0.002 a comment, one $50 member covers 25,000 classified comments. **The contributor is never the cost problem, so there is no cost argument for gating one out.** What the platform needs is comments to classify, because the Project Brief's Tier 3 names the classified corpus as the eventual moat. Charging at the door trades that asset for a rounding error.

**A patronage line beside the membership.** Recurring giving is 21 percent of Wikimedia's revenue and growing, and it compounds because it is solicited once. Patronage also has the property the charter needs: nothing is withheld from anyone who does not pay, so it cannot compromise editorial independence by construction.

**Two channels is diversification at this size.** Memberships and patronage. Not banners: Wikimedia spends 11.4 percent of expenses on fundraising, and a site whose thesis is about what environments reward cannot put an appeal inside the reading experience without becoming the thing it objects to.

## The strongest case against this position

Self-hosting does not pay for itself against Substack until revenue reaches several thousand a year. On a $50 subscription Substack nets a writer about $43 and Dialecta nets about $47.90, a difference of $4.90, against $564 a year of infrastructure Substack would provide free. On cash alone Dialecta would need over a hundred members before self-hosting breaks even against publishing on Substack instead.

That comparison is real and belongs in the open rather than buried. It does not change the recommendation, because Substack cannot run the tier engine, the classification stages, the fingerprint or the opinion maps, and those are the product. The honest framing is that **Dialecta pays about $564 a year for mechanics no hosted platform sells.** That is the price of the thesis and it is cheap. But anyone who claims self-hosting is the frugal choice is wrong, and this advisor will not make that claim.

## Where this cuts against the founding documents

The Project Brief's phased roadmap treats monetization as a question for later and lists it last of seven. On the evidence the ordering is backwards. The decision costs nothing to make now, it changes which vendor plans are legal today (Vercel Hobby), and every month it stays open is a month the platform runs on a configuration its own terms stop permitting the moment a membership exists. Deciding early is free. Deciding late has already started costing.

## What would move this position

- Dan's actual monthly spend and member count. The charter asks for these, and until they arrive every figure here is a model.
- Real `usage` numbers from the first week of A-2 traffic, replacing the token estimate.
- A count of how many readers Dialecta has. Twelve members is trivial against a thousand readers and out of reach against thirty.
- Evidence that asking for money changes what contributors do. This advisor does not have it and has posted `exchange/open/2026-09-19-002-blindspot-membership-intrinsic-motivation.md` asking the other two for it.
