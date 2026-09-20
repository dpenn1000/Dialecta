# Standing position: cost of acquisition, from zero

*Written 2026-09-19, sprint 1. Dan asked for this after confirming paid membership is zero and that the project has been dormant for months. This advisor said on the same day that it would veto building an LTV to CAC model against a $744 floor. Dan asked anyway, so it is built. It is built differently from the standard version, and the reason is in the first section.*

**Confidence: high on the arithmetic, low on the yields.** Every cost figure traces to a filed note. Every channel yield is an estimate with nothing behind it, because Dialecta has no acquisition history to fit to and no analytics to measure with. Those estimates are labelled where they appear and they should not be treated as findings.

---

## What could be measured, and what could not

This advisor went looking for real numbers before modelling anything. Almost nothing was reachable.

*This section is kept as written on 2026-09-19 because it records what was true before Dan supplied the data, and because the conclusion it reached was wrong in an instructive way.*

| Wanted | Source tried | Result |
| --- | --- | --- |
| Member count, comment count, contributor count | Supabase MCP | **No access.** The connected token is scoped to a "Trinity Solar" organisation. Dialecta's project `mguulnibvzusfvyuowwh` is in Pennington Media Group |
| Readership on dialecta.org | Vercel MCP | **No data.** Web Analytics is not enabled on the `dialecta` project, and the only domain on it is `dialecta.vercel.app`. The real site runs on Ghost at Magic Pages |
| Actual monthly spend | Vercel MCP | **No access.** Billing and team reads return 403 on this token |

**Resolved 2026-09-20.** Dan supplied the Ghost member export and the Ghost 6 native analytics dashboard. Dialecta now has a measured funnel, filed in `../research/2026-ghost-member-export.md` and `../research/2026-ghost-native-analytics-all-time.md`. Spend is still unmeasured.

### The measured funnel, all time, 6 April to 20 September 2026

| Stage | Count | Rate on visitors |
| --- | --- | --- |
| Unique visitors | **269** | |
| Total views | 1,876 | 7.0 per visitor |
| Member records created | 10 | 3.7% |
| Real people, excluding Dan and three test aliases | **6** | **2.2%** |
| Arm's-length, excluding Dan's relatives | 3 | 1.1% |
| Paying | **0** | 0% |

Sources: Direct 194, **Facebook 54**, ig 9, Google 7, Gmail 2, Bing 2. Newsletter: two sends, one recipient each, 0 percent opens. **The ten-person list has never been emailed.**

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
| The existing Ghost member list | $0 | about 2, one honest email | **1 to 3** | Still the highest return per hour available, on a much smaller base than this position first assumed. Six real people, three of them family. Reactivation is not acquisition and should not be priced like it |
| ~~Personal and family network~~ | | | **already spent** | **Struck out 2026-09-20.** The member export shows this channel already ran in April 2026 and returned six people in seventeen days before going quiet. It is not a fresh source. Counting it would be counting the same six people twice |
| ~~The five published articles, organic search~~ | | | **9 visitors, all time** | **Struck out 2026-09-20.** Google sent 7 visitors and Bing 2 across five and a half months. MetaFilter's lesson was not to build the plan on Google. The measurement says there is nothing there to build on |
| **Facebook** | $0 | about 1 per post | **the only channel with evidence** | 54 visitors, a fifth of all traffic and the largest non-direct source by six times. It is the one channel that has ever brought a stranger to Dialecta, and it is already in Dan's hands |
| Writing where the audience already is | $0 | about 4 per placement | 1 to 3 per placement | Slow and compounding. It is also the same work as making the product good, which is the only acquisition channel that pays twice |
| The classifier itself as the hook | $0 | already in the build budget | unknown | The tier mechanic is the novel thing Dialecta has. Nothing else on the internet sorts comments into visible tiers. That is the marketing, and A-1 through A-3 already pay for it |
| Paid ads, sponsorships, newsletter swaps | $25 to $60 per member | low | **ruled out** | See the table above |

*Corrected 2026-09-20 against `../research/2026-ghost-member-export.md`, the first measured source in this tree. The original version said the top two channels reached half of 16 in about six hours. It was wrong twice: the member list is six real people rather than fourteen, and the personal network is not a second channel because it is what produced those six.*

The honest version is worse and more useful. **Reactivation plausibly returns one to three members, and after that Dialecta has no warm audience left.** The remaining 13 to 15 have to come from people who have never heard of it.

*Corrected again 2026-09-20 against the analytics. "A season of writing in public" was still too optimistic, and the measurement says by how much.*

### What the funnel says 16 paying members actually costs

At the measured 2.2 percent of visitors becoming real free members, and a generous 5 percent of free members converting to paid, the visitor to paying rate is about **0.11 percent**.

| Target | Visitors required at measured rates | Against 269 all time |
| --- | --- | --- |
| 1 paying member | about 900 | 3.3x |
| 16 paying members | about **14,500** | **54x** |

Current baseline traffic is about 5 unique visitors a week. At that rate and that conversion, **Dialecta gains roughly one member every two years.** That is the cost of dormancy stated as a number.

**So the funnel cannot deliver 16, and saying otherwise would be the invented-spreadsheet problem this position opened by refusing.** The path to 16 runs through asking six people directly, and then through building a channel that does not currently exist. Those are different activities and only the first one is cheap.

Dialecta's break-even is still not a money problem. It is a sustained-attention problem, which for a solo founder reviving a dormant project is the harder of the two.

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

0. **Measure arm's-length members, not members.** Three of the six share Dan's surname. A relative paying $50 is telling Dan they love him, which is worth having and is not evidence the platform works. The number that carries information is paying members who are not related to Dan and not doing him a favour. It is currently zero, out of three candidates.
1. ~~**Turn on analytics before anything else.**~~ **Done 2026-09-20.** Ghost 6 native analytics was already running and unread. The denominator is 269.
2. **Email the existing Ghost list, which has never been emailed.** Two newsletters exist and each went to one recipient. Ten people opted in and have heard nothing in five months. This is still the highest return per hour available and it is now also the most obviously overdue thing on the list.
2a. **Post to Facebook when you publish.** It is the only channel with evidence behind it, it costs about a minute, and the late-April traffic peak of 68 a week is what it looks like when Dan does it.
3. **Spend no money on acquisition.** The ceiling table is the argument and this advisor would veto any paid channel proposal at current scale.
4. **Set the target at 16 and say so out loud.** A target nobody has written down cannot be hit or missed.
5. **Do not build a funnel, a CRM, or a cohort model.** All three are instruments for allocating an acquisition budget that does not exist. Revisit at 266 members, not before.

## What would move this position

- The Magic Pages readership number. It converts every yield estimate above from a guess into a conversion rate, and it is the single highest-value fact missing from this entire research tree.
- ~~Confirmation of what the 14 Ghost member records actually are.~~ **Answered 2026-09-20 by the member export.** Ten records, of which one is Dan and three are his own plus-addressed test aliases. Six real people, three of them family. No `stripe_customer_id` has ever existed on any of them. The guess in the first version of this position, that there were fourteen free subscribers, was wrong on the count and right on the conclusion. Filed as `../research/2026-ghost-member-export.md`.
- Why `CLAUDE.md` and `profiles` both say 14 when the export says 10. Backlog P0-6 is written against the 14 and would import three test aliases as contributors. Posted as `exchange/open/2026-09-20-004`.
- A decision on which row of the goal table Dan is aiming at. Everything here is scoped to the first one.
- Real Supabase access for this advisor, or the numbers by hand. The charter has asked twice now.
