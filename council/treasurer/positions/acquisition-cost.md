# Standing position: cost of acquisition, from zero

*Written 2026-09-19, sprint 1. Dan asked for this after confirming paid membership is zero and that the project has been dormant for months. This advisor said on the same day that it would veto building an LTV to CAC model against a $744 floor. Dan asked anyway, so it is built. It is built differently from the standard version, and the reason is in the first section.*

**Confidence: high on the arithmetic, low on the yields.** Every cost figure traces to a filed note. Every channel yield is an estimate with nothing behind it, because Dialecta has no acquisition history to fit to and no analytics to measure with. Those estimates are labelled where they appear and they should not be treated as findings.

---

## What could be measured, and what could not

This advisor went looking for real numbers before modelling anything. Almost nothing was reachable.

| Wanted | Source tried | Result |
| --- | --- | --- |
| Member count, comment count, contributor count | Supabase MCP | **No access.** The connected token is scoped to a "Trinity Solar" organisation. Dialecta's project `mguulnibvzusfvyuowwh` is in Pennington Media Group |
| Readership on dialecta.org | Vercel MCP | **No data.** Web Analytics is not enabled on the `dialecta` project, and the only domain on it is `dialecta.vercel.app`. The real site runs on Ghost at Magic Pages |
| Actual monthly spend | Vercel MCP | **No access.** Billing and team reads return 403 on this token |

**Dialecta currently has no readership measurement this advisor can reach, anywhere.** That is the first finding and it precedes every other one. Acquisition analysis is a ratio, and Dialecta has no denominator.

Magic Pages includes native traffic analytics in its $15, per the pricing page filed in `../research/2026-ghost-magicpages-hosting.md`. That number exists and Dan can read it today. Until he does, everything below is shape rather than size.

## Why the standard model is refused

Cost of acquisition is marketing spend divided by customers acquired. Dialecta's marketing spend is zero and its customers acquired is zero. The standard model has nothing to compute, and filling it with assumed conversion rates and cohort curves would produce a spreadsheet in which every number was invented by the person reading it. That is worse than no spreadsheet, because it looks like evidence.

What replaces it is the question the arithmetic can actually answer: **how much may Dialecta spend to acquire a member before acquisition stops being worth doing.** That has a hard answer and it is the useful one.

## The ceiling on what a member may cost

A $50 annual membership nets $47.90 after Stripe takes 2.9 percent plus 30 cents plus the 0.7 percent Billing fee. The floor is $744 a year. To cover the floor in year one with N members each acquired at cost C:

> N x ($47.90 - C) >= $744

| Cost to acquire one member | Members needed to cover the floor in year one |
| --- | --- |
| $0 | **16** |
| $10 | 20 |
| $20 | 27 |
| $30 | 42 |
| $40 | 95 |
| $47.90 or more | **never** |

The curve is not linear and that is the whole point. Paying $40 to acquire a $50 member does not cost you 80 percent of the member. It costs you six times as many members. At a CAC approaching $47.90 the platform cannot reach its floor at any membership count, because each new member brings in exactly what they cost.

**This rules out paid acquisition before any channel is priced.** Realistic paid acquisition for a niche publication does not come in under $30 a subscriber, and at $30 Dialecta needs 42 members instead of 16. Add renewal risk, since a member acquired in year one who does not renew in year two was a pure loss, and the trade gets worse rather than better.

A venture-backed business answers this by financing the payback gap and waiting for lifetime value. Dan has no capital to front and no investor to be patient on his behalf, so payback has to happen inside year one. **The constraint is not LTV to CAC. It is that Dan cannot afford to wait.**

So the entire acquisition strategy has to be organic, and the real currency is not dollars.

## What acquisition actually costs here: Dan's hours

Cash cost is about zero on every channel worth using. The scarce input is a solo founder's attention. Yields below are estimates with nothing behind them and are marked as such.

| Channel | Cash | Dan's hours (est.) | Plausible yield (est.) | Why |
| --- | --- | --- | --- | --- |
| The existing Ghost member list | $0 | about 2, one honest email | 2 to 5 | **Highest return per hour available.** These people already opted in once. Reactivation is not acquisition and should not be priced like it |
| Personal and family network | $0 | about 4 | 3 to 8 | The project began as a family blog. This is the founding cohort and it is the one Dialecta was designed for |
| The five published articles, organic search | $0 | none ongoing | unpredictable | Free and worth having. Do not build the plan on it. MetaFilter lost 40 percent of traffic overnight on a ranking change, filed in `../research/2014-metafilter-ad-collapse.md` |
| Writing where the audience already is | $0 | about 4 per placement | 1 to 3 per placement | Slow and compounding. It is also the same work as making the product good, which is the only acquisition channel that pays twice |
| The classifier itself as the hook | $0 | already in the build budget | unknown | The tier mechanic is the novel thing Dialecta has. Nothing else on the internet sorts comments into visible tiers. That is the marketing, and A-1 through A-3 already pay for it |
| Paid ads, sponsorships, newsletter swaps | $25 to $60 per member | low | **ruled out** | See the table above |

Adding the top two: **roughly six hours of Dan's time, and zero dollars, plausibly reaches half the 16 members the floor requires.** The full 16 looks like ten to twenty hours spread over weeks.

That is the finding worth acting on. Dialecta's break-even is not a business development problem. It is about two working days of attention, and the first two hours are worth more than the other eighteen.

## The number Dan actually has to choose between

"Profitable" needs defining before any of this means anything, because two completely different projects are hiding behind the word.

| Goal | Annual need | Members at $47.90 net |
| --- | --- | --- |
| Infrastructure paid, Dan paid nothing | $744 | **16** |
| Infrastructure plus $1,000 a month to Dan | $12,744 | **266** |
| Infrastructure plus $50,000 a year to Dan | $50,744 | **1,060** |

The bottom row is worth sitting with. Kelly's "1,000 true fans" is not a round number somebody liked. **It is approximately what it takes to pay one person a living from a small audience**, and Dialecta's arithmetic lands in the same place from a completely different direction. Filed in `../research/2008-kelly-1000-true-fans.md`.

Sixteen members and a thousand members are not the same project at different stages. They need different acquisition strategies, different amounts of Dan's life, and probably different answers on P0-D2. **Sixteen is reachable this autumn on organic effort alone. A thousand is a career.** This advisor's recommendation is to aim at 16, prove the mechanics work on real contributors, and refuse to let anyone plan past it until the platform has produced a single classified comment from a stranger.

## What this advisor recommends

1. **Turn on analytics before anything else.** Read the Magic Pages native analytics this week, since it is already paid for. There is no acquisition work worth doing while the denominator is unknown, and the first number is free.
2. **Email the existing Ghost list.** One honest message about the project waking up. Two hours, highest yield per hour on the list, and it costs nothing to be wrong.
3. **Spend no money on acquisition.** The ceiling table is the argument and this advisor would veto any paid channel proposal at current scale.
4. **Set the target at 16 and say so out loud.** A target nobody has written down cannot be hit or missed.
5. **Do not build a funnel, a CRM, or a cohort model.** All three are instruments for allocating an acquisition budget that does not exist. Revisit at 266 members, not before.

## What would move this position

- The Magic Pages readership number. It converts every yield estimate above from a guess into a conversion rate, and it is the single highest-value fact missing from this entire research tree.
- Confirmation of what the 14 Ghost member records in `profiles` actually are. Dan reports paid membership is zero, and CLAUDE.md reports 14 members. Both are probably true, meaning 14 free subscribers and no paying ones. **Fourteen people who already said yes once is an asset and the analysis above leans on it.** It should be verified rather than assumed.
- A decision on which row of the goal table Dan is aiming at. Everything here is scoped to the first one.
- Real Supabase access for this advisor, or the numbers by hand. The charter has asked twice now.
