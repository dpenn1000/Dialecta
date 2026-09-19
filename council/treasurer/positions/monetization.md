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
| Supabase Small compute add-on | $15 | $15 | `../research/2026-dialecta-supabase-scaling-spec.md` |
| Vercel Pro | $20 | $20 | `../research/2026-vercel-pricing.md` |
| Magic Pages (Ghost) | $15 | $0 | `../research/2026-ghost-magicpages-hosting.md` |
| Resend | $0 | $0 until 100 emails a day | `../research/2026-resend-pricing.md` |
| Anthropic, at 1,000 comments | $2 | $2 | `../research/2026-anthropic-api-pricing.md` |
| **Total** | **$77** | **$62** | |

Annualised: about **$924 now, $744 after cutover**.

*Corrected 2026-09-19, same day. The first version of this table omitted the Supabase compute add-on and read $62 and $47. Supabase Pro ships a Micro instance, and `docs/Dialecta_Supabase_Scaling.md` puts "Compute tier upgraded from Micro to Small" on its pre-launch checklist, because the `axis_scores` replay pattern is RAM-sensitive. Small is $15. The floor was understated by $15 a month and every figure derived from it has been re-run below.* Two of those lines are less optional than they look. Supabase Free pauses a project after a week of inactivity, so a live site cannot use it. Vercel Hobby is "for personal, non-commercial use", so the first paid membership takes Hobby off the table as a licence matter rather than a capacity one.

Variable cost is one line: the Stage 1 classification call. At Haiku 4.5 rates against the live prompt in `api/classify.js`, that is **about $0.002 a comment**, ceiling $0.004. Ten thousand comments a month is $20. The charter's veto on "per-comment costs that scale linearly with the community" is not triggered at any volume Dialecta will plausibly reach.

Two savings that look available and are not. Prompt caching does not apply, because Haiku 4.5 needs a 4,096-token prefix and Dialecta's system prompt is about 670 tokens, so caching is skipped silently, and padding the prompt to reach the minimum costs more than it saves at low volume. The Batch API's 50 percent discount cannot serve Stage 1, because the Project Brief specifies pre-analysis as instant and on submit, and a batch may take an hour. Both in `../research/2026-anthropic-caching-batch-limits.md`.

**Dialecta's problem is not that it is expensive. It is that nobody has decided who pays the $62.**

## What that means the question is

Kelly's arithmetic run backwards: 1,000 true fans at $100 a year is $100,000, and Dialecta needs $744. That is **eight true fans**, or sixteen annual memberships at $50, or 68 gifts at Wikimedia's average of $11. Sources: `../research/2008-kelly-1000-true-fans.md`, `../research/2026-wikimedia-fundraising.md`.

The monetization question is not "how does this become a business". It is "how does this cover a bill of about $62 a month without changing what the platform rewards". That question has answers the first one does not, and the council should frame it that way before it argues about models.

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

## The gap nobody has a row for

Sprint 1 recommended annual Stripe billing without checking whether anything in the plan builds it. It does not.

`docs/Dialecta_Data_Architecture.md` line 364 states the Phase 1 boundary: "Ghost owns: articles, member authentication, subscription management, email delivery." **Subscription management is Ghost's, and only Ghost's.**

`docs/plans/backlog.md` carries 47 rows across Phases 0, A, B, Cutover, C and D. Reading every row that touches members or money: P0-6 maps the 14 legacy Ghost members onto `profiles`, C-1 moves the newsletter to Resend and imports Ghost subscribers, A-D3 asks who may publish. **There is no row for payments, billing, a Stripe integration, a membership record, or an entitlement check.** Not one, in any phase.

Phase C is titled "Newsletter and Ghost shutdown" and lands in week 8. So the plan as written retires Dialecta's only subscription infrastructure in week 8 and replaces it with nothing, because nobody asked the question this position is answering.

That is not a criticism of the backlog. The backlog is correct given that monetization was an open question with no ADR; you cannot schedule work for a decision nobody has made. It is the cost of leaving the decision open, arriving on schedule, and it is the concrete form of the argument two sections down about deciding late.

What follows if this position is adopted:

- A backlog row for membership billing, blocked by nothing and sized honestly. A Stripe Checkout session, a webhook, a `memberships` table, and an entitlement read is a real week of work, not an afternoon.
- It must land **before** Phase C, not after, or there is a window with no way to take money and no way to honour what Ghost members already have.
- The 14 live Ghost members are the migration problem in miniature. P0-6 maps their identity. Nothing maps their subscription status, and this advisor does not know whether any of them pays. That is a question for Dan and it is on the charter's list already.
- Scope and cost have moved past what the brief assumed, so a blindspot is posted: `exchange/open/2026-09-19-003-blindspot-no-billing-row-before-ghost-shutdown.md`.

This advisor argued for a revenue model while the plan was quietly removing the machinery to collect it. Recording that rather than patching it.

## The strongest case against this position

Self-hosting does not pay for itself against Substack until revenue reaches several thousand a year. On a $50 subscription Substack nets a writer about $43 and Dialecta nets about $47.90, a difference of $4.90, against $744 a year of infrastructure Substack would provide free. On cash alone Dialecta would need over 150 members before self-hosting breaks even against publishing on Substack instead.

That comparison is real and belongs in the open rather than buried. It does not change the recommendation, because Substack cannot run the tier engine, the classification stages, the fingerprint or the opinion maps, and those are the product. The honest framing is that **Dialecta pays about $744 a year for mechanics no hosted platform sells.** That is the price of the thesis and it is cheap. But anyone who claims self-hosting is the frugal choice is wrong, and this advisor will not make that claim.

## Where this cuts against the founding documents

The Project Brief's phased roadmap treats monetization as a question for later and lists it last of seven. On the evidence the ordering is backwards. The decision costs nothing to make now, it changes which vendor plans are legal today (Vercel Hobby), and every month it stays open is a month the platform runs on a configuration its own terms stop permitting the moment a membership exists. Deciding early is free. Deciding late has already started costing.

## What would move this position

- Dan's actual monthly spend and member count. The charter asks for these, and until they arrive every figure here is a model.
- Real `usage` numbers from the first week of A-2 traffic, replacing the token estimate.
- A count of how many readers Dialecta has. Twelve members is trivial against a thousand readers and out of reach against thirty.
- A reading of whether any earned-revenue line survives the data promises already made. `docs/Dialecta_Growth_Layer_Principles.md` commits, in the Research Consent Layer, that contributor data is "not sold, not used for advertising, not shared with third parties". Selling corpus or opinion-map access is therefore not an open council question for consented data; it is already promised away. See `../research/2025-inn-index-revenue-mix.md`, corrected.
- Evidence that asking for money changes what contributors do. This advisor does not have it and has posted `exchange/open/2026-09-19-002-blindspot-membership-intrinsic-motivation.md` asking the other two for it.
