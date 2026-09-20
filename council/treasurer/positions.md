# Standing positions

*Sprint 1, 2026-09-19. Fifteen sources filed in `research/`. Every price carries a fetch date of 2026-09-19 and every one was read from the vendor's own page unless the row says otherwise. Revenue figures are models, not measurements: Dialecta has no membership revenue yet. The charter says this advisor's numbers are estimates until Dan supplies current spend and member count, and they still are.*

*Full arguments: `positions/monetization.md`, `positions/p0-d2-signup.md`. Nothing here has been argued in council yet; none of these has survived a rebuttal.*

## Monetization

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Dialecta's fixed floor is about $62 a month after Ghost cutover, $77 before. Annualised, about $744 and $924. Includes the Supabase Small compute add-on the Scaling spec requires before launch | High | `research/2026-supabase-pricing.md`, `research/2026-dialecta-supabase-scaling-spec.md`, `research/2026-vercel-pricing.md`, `research/2026-ghost-magicpages-hosting.md`, `research/2026-resend-pricing.md` | 2026-09-19, corrected same day |
| Fund the platform with a voluntary annual membership plus a patronage line, gating nothing, and rule grants out of the operating base | Medium | `positions/monetization.md`, `research/2026-wikimedia-fundraising.md`, `research/2025-inn-index-revenue-mix.md` | 2026-09-19 |
| Bill annually, never monthly. Stripe's fixed 30 cents makes a $5 monthly membership cost 9.6 percent in fees against 4.2 percent for $50 a year | High | `research/2026-stripe-processing-fees.md` | 2026-09-19 |
| Never price a single charge below about $5. At $3 the processor takes 13.6 percent, at $1 it takes a third | High | `research/2026-stripe-processing-fees.md` | 2026-09-19 |
| Do not gate commenting behind payment. One $50 member covers 25,000 classified comments, so the contributor is never the cost problem, and the classified corpus is the Tier 3 moat | Medium | `positions/monetization.md`, `research/2026-anthropic-api-pricing.md` | 2026-09-19 |
| Advertising stays vetoed. MetaFilter lost 40 percent of traffic and nearly half its ad revenue in weeks on a Google ranking change, having changed nothing | High | `research/2014-metafilter-ad-collapse.md` | 2026-09-19 |
| Never pay contributors from a pooled subscription. Pooled payout makes contributor cost scale with contributors while revenue scales with paying members | High | `research/2026-medium-partner-program.md` | 2026-09-19 |
| A grant may fund a discrete build with an end date. It may never fund the monthly floor. INN's members take 49 percent from foundations and the sector calls that mix unbalanced | High | `research/2025-inn-index-revenue-mix.md` | 2026-09-19 |
| Do not route payments through Patreon or Substack. Both take 10 percent for a payment page and discovery that Dialecta does not need | High | `research/2026-substack-platform-fee.md`, `research/2026-patreon-kofi-patronage-fees.md` | 2026-09-19 |
| Self-hosting is not the frugal choice. Against Substack it needs over 150 members to break even on cash. It is the right choice anyway, because Substack cannot run the tier engine | Medium-high | `positions/monetization.md`, `research/2026-substack-platform-fee.md` | 2026-09-19, corrected same day |
| Deciding monetization now is free and deciding it late already costs. Vercel Hobby is non-commercial use only, so the first membership changes which plans are legal | High | `research/2026-vercel-pricing.md` | 2026-09-19 |

## Unit cost and the AI spend

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| One Stage 1 classification costs about $0.002, ceiling $0.004, at Haiku 4.5 against the live prompt in `api/classify.js` | Medium-high | `research/2026-anthropic-api-pricing.md` | 2026-09-19 |
| AI is not the budget problem and will not become one. At 10,000 comments a month it is $20 against a $62 fixed floor | High | `research/2026-anthropic-api-pricing.md` | 2026-09-19 |
| Do not plan a prompt-caching discount for the classifier. Haiku 4.5 needs a 4,096-token prefix, the live prompt is about 670, and caching is skipped silently | High | `research/2026-anthropic-caching-batch-limits.md` | 2026-09-19 |
| The Batch API's 50 percent discount cannot serve Stage 1, because the Project Brief specifies pre-analysis as instant and on submit. Use it for backfill, re-scoring and fine-tuning prep | High | `research/2026-anthropic-caching-batch-limits.md` | 2026-09-19 |
| Supabase Pro at $25 is a floor, not a choice: Free projects pause after a week of inactivity | High | `research/2026-supabase-pricing.md` | 2026-09-19 |
| Supabase Team at $599 buys nothing Dialecta needs. Its quotas are identical to Pro | High | `research/2026-supabase-pricing.md` | 2026-09-19 |
| Cancelling Ghost saves $15 a month at best, and the saving turns negative once the mailing list passes 100 sends a day. ADR-001 is right for non-financial reasons and should not be defended on cost | Medium-high | `research/2026-ghost-magicpages-hosting.md`, `research/2026-resend-pricing.md` | 2026-09-19 |

## P0-D2, sign-up

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| On cost alone there is no case for invite-only. The per-user curve is a step function on Supabase compute, first step at roughly 10,000 active users for $45 more a month, which is a rounding error at that size | Medium-high | `positions/p0-d2-signup.md`, `research/2026-dialecta-supabase-scaling-spec.md` | 2026-09-19, corrected same day |
| The email cost curve bends at about 100 members, where Resend's 100-a-day free cap binds. The comment cost curve bends on comments, not accounts | High | `research/2026-resend-pricing.md`, `research/2026-anthropic-api-pricing.md` | 2026-09-19 |
| Dialecta's scaling risk is latency and engineering attention, not vendor spend. The first two walls are connection saturation and `axis_scores` replay, and both cost nothing recurring to fix | High | `research/2026-dialecta-supabase-scaling-spec.md` | 2026-09-19 |
| Nothing in the 47-row backlog builds payments, and Phase C retires Ghost's subscription management in week 8. A billing row must land before Phase C | High | `positions/monetization.md`, blindspot 2026-09-19-003 | 2026-09-19 |
| Earned revenue from the classified corpus is narrower than an open question. The Research Consent Layer already tells contributors their data is not sold and not used for advertising | Medium-high | `research/2025-inn-index-revenue-mix.md` | 2026-09-19 |
| Open sign-up needs a per-account rate limit, email verification and the A-1 composer gate. Without them every spam comment is a paid API call with no ceiling, and it contaminates the Tier 3 corpus | Medium | `positions/p0-d2-signup.md` | 2026-09-19 |
| Invite-only spreads a fixed cost across the fewest possible people, which is the worst version of this platform's cost structure | Medium | `positions/p0-d2-signup.md` | 2026-09-19 |
| Notifications should default to a digest rather than per-event sends. Per-event email scales with users multiplied by activity and crosses the free cap first | Medium | `research/2026-resend-pricing.md` | 2026-09-19 |

## Acquisition, from zero

*Full argument: `positions/acquisition-cost.md`. Paid membership is zero as of 2026-09-19, confirmed by Dan.*

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Paid acquisition is ruled out by arithmetic before any channel is priced. At $30 to acquire a member the floor needs 42 members instead of 16, and at $47.90 it is unreachable at any count | High | `positions/acquisition-cost.md` | 2026-09-19 |
| The binding constraint is not LTV to CAC, it is that Dan has no capital to front, so payback must land inside year one | High | `positions/acquisition-cost.md` | 2026-09-19 |
| Acquisition here is denominated in Dan's hours, not dollars. Sixteen members looks like ten to twenty hours of organic effort and zero spend | Medium, yields are estimates with nothing behind them | `positions/acquisition-cost.md` | 2026-09-19 |
| Emailing the existing Ghost list is the highest return per hour available, because reactivation is not acquisition and should not be priced like it | Medium | `positions/acquisition-cost.md` | 2026-09-19 |
| The reactivation pool is six real people, not fourteen. The 2026-09-20 export holds ten records, of which one is Dan and three are his own plus-addressed test aliases | High, counted from the export | `research/2026-ghost-member-export.md` | 2026-09-20 |
| No Stripe customer has ever existed for any Dialecta member. Zero paying is confirmed at source, not inferred from absent revenue | High | `research/2026-ghost-member-export.md` | 2026-09-20 |
| The personal network channel is already spent. It produced six people in a 17-day window in April 2026 and has produced nobody in the 137 days since | High | `research/2026-ghost-member-export.md` | 2026-09-20 |
| Measure arm's-length members, not members. Three of the six share Dan's surname, and a relative paying $50 is not evidence the platform works. Arm's-length paying members currently stand at zero of three candidates | Medium-high | `positions/acquisition-cost.md` | 2026-09-20 |
| After reactivation returns one to three, Dialecta has no warm audience left. The remaining 13 to 15 come from strangers, which is a season of writing rather than two working days | Medium | `positions/acquisition-cost.md` | 2026-09-20 |
| Turn on analytics before any acquisition work. Magic Pages native analytics is already paid for and unread. There is no CAC without a denominator | High | `positions/acquisition-cost.md`, `research/2026-ghost-magicpages-hosting.md` | 2026-09-19 |
| Build no funnel, CRM or cohort model. All three allocate an acquisition budget that does not exist. Revisit at 266 members | High | `positions/acquisition-cost.md` | 2026-09-19 |
| Sixteen members and a thousand members are different projects, not stages. 16 pays the infrastructure, 266 pays Dan $1,000 a month, 1,060 pays him $50,000 a year, which is roughly where Kelly's number comes from | High | `positions/acquisition-cost.md`, `research/2008-kelly-1000-true-fans.md` | 2026-09-19 |
| ~~This advisor cannot measure anything.~~ **Resolved 2026-09-20.** Dan supplied the member export and the Ghost analytics. Spend is still unmeasured | High | `research/2026-ghost-native-analytics-all-time.md` | 2026-09-20 |
| The measured funnel, all time: 269 unique visitors, 1,876 views, 10 member records, 6 real people, 3 arm's-length, 0 paying | High, counted from the dashboard | `research/2026-ghost-native-analytics-all-time.md` | 2026-09-20 |
| The funnel cannot deliver 16 paying members. At the measured 2.2 percent visitor-to-member rate and a generous 5 percent free-to-paid, 16 paying needs about 14,500 visitors against 269 all time | High | `positions/acquisition-cost.md` | 2026-09-20 |
| At current baseline traffic of about 5 visitors a week, Dialecta gains roughly one member every two years. That is the cost of dormancy as a number | High | `research/2026-ghost-native-analytics-all-time.md` | 2026-09-20 |
| Facebook is the only acquisition channel Dialecta has ever had: 54 visitors, a fifth of all traffic, six times the next non-direct source | High | `research/2026-ghost-native-analytics-all-time.md` | 2026-09-20 |
| Remove organic search from the plan. Google sent 7 visitors and Bing 2 across five and a half months | High | `research/2026-ghost-native-analytics-all-time.md` | 2026-09-20 |
| The ten-person list has never been emailed. Two newsletters exist, each sent to one recipient, 0 percent opens. The silence is self-inflicted and the fix is one email | High | `research/2026-ghost-native-analytics-all-time.md` | 2026-09-20 |

## Where this advisor agrees with another, which is worth recording

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Pooled contributor payouts are vetoed twice over: on cost by this advisor, and on the thesis by the philosopher, since paying for reading time rewards performed thinking and gives the fingerprint a cash value | High | `research/2026-medium-partner-program.md` | 2026-09-19 |

## Open against this advisor

| What | Where |
| --- | --- |
| Whether asking contributors for money changes what they do. The monetization position assumes it does not and has no evidence either way | `exchange/open/2026-09-19-002-blindspot-membership-intrinsic-motivation.md` |
| Whether a membership billing row must land before Phase C retires Ghost's subscription management | `exchange/open/2026-09-19-003-blindspot-no-billing-row-before-ghost-shutdown.md` |
| Whether P0-6 should exclude Dan's account and three test aliases, and why `profiles` says 14 when the export says 10 | `exchange/open/2026-09-20-004-blindspot-p0-6-would-import-test-accounts.md` |

## Corrected the same day it was written

Sprint 1 took a position on Dialecta's cost curve without reading `docs/Dialecta_Supabase_Scaling.md`, which is the spec about Dialecta's cost curve, and recommended a billing model without checking that the backlog builds one. Both corrections are recorded in place rather than patched over: the floor was understated by $15 a month, storage per comment was understated by roughly half, and the claim that nothing bends with user count was too strong. See `research/2026-dialecta-supabase-scaling-spec.md`.
