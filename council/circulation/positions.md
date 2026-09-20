# Circulation: standing positions

*Sprint 1, 2026-09-20. This seat was created today and files its first ten sources in `research/`
in the same sprint that produced this file. Every position below cites a filed note or says
`(unsourced)`. Nothing here has been argued in council yet; none of it has survived a rebuttal.*

## The funnel

| Position | Confidence | Evidence | Filed |
| --- | --- | --- | --- |
| **The 17,000-visitor figure the Council has been quoting is not a forecast and should not be quoted as one.** It is one point computed from a rate measured on a site with zero published comments and zero published discourse, contaminated further because most of its numerator is Dan's own personal network rather than strangers | High | `research/2026-dialecta-funnel-correction.md` | 2026-09-20 |
| The true stranger-conversion rate is currently unmeasured, not measured-and-low. Two effects push in opposite directions (personal-network contamination inflates it; an empty comments section likely suppresses it) and neither is sized | High | `research/2026-dialecta-funnel-correction.md` | 2026-09-20 |
| The correction is a re-measurement, not a better estimate. It happens once real discourse is live and at least one channel has sent a batch of genuinely cold visitors, and it sits after Dan's "finished before anyone is invited" line, not before it | Medium-high | `research/2026-dialecta-funnel-correction.md`, `charter.md` | 2026-09-20 |
| Treasurer's arithmetic on the rate as given (14,500 to 17,000 visitors) is not disputed. What is disputed is that the rate is safe to project forward onto a different, not-yet-built product | High | `research/2026-dialecta-funnel-correction.md`, `council/treasurer/positions/acquisition-cost.md` | 2026-09-20 |

## Where Dan's effort goes

| Position | Confidence | Evidence | Filed |
| --- | --- | --- | --- |
| **Facebook is where the first hour goes.** It is the only channel with a measured, non-zero, non-personal-network return (54 of 269 visitors, 20 percent, six times the next non-direct source), it costs about a minute a post, and its share-card rendering can be verified before posting, unlike X's | High | `council/treasurer/research/2026-ghost-native-analytics-all-time.md`, `research/2026-opengraph-and-x-card-share-surface.md` | 2026-09-20 |
| Direct, personal outreach to the 6 known real people is a distinct, already-proven channel at n=6, and does not require solving arrival at all. It is reactivation, not acquisition, and should not be priced like acquisition | High | `research/2026-dialecta-funnel-correction.md`, `council/treasurer/positions/acquisition-cost.md` | 2026-09-20 |
| Email the existing 10-person Resend list. It has never been sent a real email in its life, the tool to do it is already paid for and idle, and this is the single cheapest, most overdue move available | High | `research/2026-resend-broadcasts-tool.md`, `research/2008-kelly-arrival-and-direct-reach.md` | 2026-09-20 |
| Organic search is not a year-one channel. Google and Bing together sent 9 visitors across 5.5 months; nothing about a 5-article blog changes that math soon | High | `council/treasurer/research/2026-ghost-native-analytics-all-time.md` | 2026-09-20 (adopted from treasurer) |
| Hacker News and Reddit are legitimate second-stage channels for Dialecta's actual content (long-form argument), better suited to it than Facebook in principle, but single-shot and high-variance: a new, unknown domain posted by its own operator reads as the self-promotion pattern both platforms police, with no cheap second attempt if it misfires | Medium | `research/2026-hacker-news-guidelines-self-promotion.md` | 2026-09-20 |
| The one HN/Reddit move this seat might otherwise reach for, asking the existing list or network to upvote a submission, is explicitly and specifically banned on HN and should never be recommended, even informally | High | `research/2026-hacker-news-guidelines-self-promotion.md` | 2026-09-20 |
| Reddit's specific self-promotion mechanics and ban patterns (reading list row 7) | (unsourced) | `research/reading-list.md`, row marked `todo` | not yet filed |
| Whether Dialecta's own contributors are its best distribution channel, and whether author recruitment is a distribution question or an editorial one | (unsourced) | `brief.md`, standing question | not yet filed |

## Paid acquisition, as an acquisition cost, never as revenue

| Position | Confidence | Evidence | Filed |
| --- | --- | --- | --- |
| **Paid acquisition (Google or Meta ads) is not worth spending on at Dialecta's current scale.** Even the smallest technical minimums cost $30-150 a month against a $78 floor never covered organically; the practical floors the platforms' own algorithms need to function cost many multiples of that. This is arithmetic, not a principle, and it does not touch treasurer's revenue veto | High | `research/2026-paid-acquisition-minimum-spend-arithmetic.md` | 2026-09-20 |
| The threshold that would change this: a full month of free-channel (Facebook) data producing a real baseline conversion rate to compare a paid dollar's return against. That data does not exist yet | Medium-high | `research/2026-paid-acquisition-minimum-spend-arithmetic.md`, `research/2026-dialecta-funnel-correction.md` | 2026-09-20 |
| MetaFilter's lesson generalises past revenue: a single channel Dialecta does not control, right now Facebook is 100 percent of non-direct, non-personal traffic, can vanish on someone else's schedule the way MetaFilter's ad revenue did. A second arrival channel is worth building before Facebook is trusted as "the plan," independent of whether that channel is ever paid | Medium-high | `research/2014-metafilter-acquisition-concentration.md` | 2026-09-20 |

## The share surface

| Position | Confidence | Evidence | Filed |
| --- | --- | --- | --- |
| The share card (Open Graph image, title, description) is Dialecta's actual front door under Dan's own strategy, not the homepage. What it is allowed to say about a named person is a joint question with `legal` and `designer`, not something this seat settles alone | High | `charter.md`, `brief.md`, `exchange/open/2026-09-20-circulation-01-blindspot-share-card-off-platform-exposure.md` | 2026-09-20 |
| The mechanical build is simple and not blocked on anyone: `og:title`, `og:description`, `og:image`, `og:url` on every article covers Facebook and, by fallback, X | High | `research/2026-opengraph-and-x-card-share-surface.md` | 2026-09-20 |
| Set `twitter:card` to `summary`, not `summary_large_image`, as a defensive default. X's large-image card format has repeatedly stopped rendering headline text since 2023, and the headline is the entire proof the share strategy depends on | Medium-high | `research/2026-opengraph-and-x-card-share-surface.md` | 2026-09-20 |
| Test every card on Facebook's Sharing Debugger before relying on it. X retired its own Card Validator in 2022 and never replaced it, so X is a platform Dialecta can post to but cannot verify against first | High | `research/2026-opengraph-and-x-card-share-surface.md` | 2026-09-20 |

## Measurement and tooling

| Position | Confidence | Evidence | Filed |
| --- | --- | --- | --- |
| Instrumenting arrivals-by-source is this seat's first standing ask, and it is at risk of going dark rather than merely staying unbuilt: Ghost's native analytics produced every number this seat has, and Dialecta is already committed to leaving Ghost with nothing named to replace it | High | `research/2026-plausible-analytics-tool.md`, `charter.md` | 2026-09-20 |
| Plausible Analytics (self-hosted, AGPL-3.0, 29k stars, actively maintained) is a real candidate to be that replacement; whether self-hosted or on Plausible Cloud is a cost question for `treasurer`, not decided here | Medium | `research/2026-plausible-analytics-tool.md` | 2026-09-20 |
| Neither a share-card generator nor a sitemap tool needs to be adopted from outside. Both already ship inside the Next.js version apps/web runs, unused, at zero new dependency cost. This is a scheduling gap, not a tooling gap | High | `research/2026-nextjs-native-share-and-sitemap-tooling.md` | 2026-09-20 |
| No new RSS/newsletter tool is needed. Resend Broadcasts, already paid for, already does the job the reading list asked about; the blocker was never tooling | High | `research/2026-resend-broadcasts-tool.md` | 2026-09-20 |

## Login methods (P0-D2)

*Sprint 2, 2026-09-20. Written against the convener's reframe of P0-D2, which asked this seat
whether a familiar login measurably increases arrival or whether that is assumed. Full position:
`positions/2026-09-19-p0-d2-login-methods.md`.*

| Position | Confidence | Evidence | Filed |
| --- | --- | --- | --- |
| **No independent evidence shows social login increases signup completion.** The figure repeated industry-wide traces to a single 2011 vendor-commissioned stated-preference survey (Janrain/Blue Research), and the one peer-reviewed study found (Gafni & Nissim) measures attitude, not behavior | High | `research/2026-social-login-conversion-evidence-review.md` | 2026-09-20 |
| Real company results are thin and cut both ways. The one closest to Dialecta's actual business, paid conversion rather than raw signups, shows social login raising signups while lowering the signup-to-paid rate | Medium-high | `research/2026-social-login-conversion-evidence-review.md` | 2026-09-20 |
| Dialecta has zero signups ever, so there is no funnel here to correct, only one to build and measure honestly once P0-4 ships. Any claim that social login will lift Dialecta's conversion is a hypothesis, not a banked benefit | High | `brief.md`, `positions/2026-09-19-p0-d2-login-methods.md` | 2026-09-20 |
| Facebook being 100 percent of non-direct arrival argues for testing Facebook login, not for assuming it converts. Arrival and authentication are separate decisions, and pairing both to the one channel already carrying this seat's largest concentration risk doubles that platform's leverage over Dialecta rather than diversifying it | Medium-high | `research/2014-metafilter-acquisition-concentration.md`, `positions/2026-09-19-p0-d2-login-methods.md` | 2026-09-20 |
| Reddit fails as a login provider on this seat's own terms before any other seat's: zero measured Dialecta arrivals from it against Facebook's 54, and it is not a native Supabase Auth provider, so it would need a custom OAuth build for a channel that has never sent this site a single visitor | High | `research/2026-supabase-native-oauth-providers.md` | 2026-09-20 |
| Every added login provider is a consent screen between a stranger and their first comment. Choice at that specific decision point is a cost this seat owns, not a free benefit that offsets the arrival question | (unsourced, this seat's own reasoning from its funnel-step mandate) | `positions/2026-09-19-p0-d2-login-methods.md` | 2026-09-20 |

## Where this seat agrees with treasurer, and is now the owner of record

*Treasurer covered acquisition territory in `positions/acquisition-cost.md` on 2026-09-19, the day
before this seat existed, because nobody else could. The findings below are treasurer's; this seat
adopts them as its own standing positions rather than re-deriving them, and will extend or correct
them from here.*

| Position | Confidence | Evidence | Filed |
| --- | --- | --- | --- |
| The personal-network channel is already spent: it produced 6 people in a 17-day window in April 2026 and nobody since. Reactivation, not a fresh source | High | `council/treasurer/positions/acquisition-cost.md` | adopted 2026-09-20 |
| At current baseline traffic (about 5 visitors a week) and the unmeasured-for-strangers rate, Dialecta gains roughly one member every two years. That is the cost of the site sitting dormant, stated as a number | High | `council/treasurer/research/2026-ghost-native-analytics-all-time.md` | adopted 2026-09-20 |

## Open against this seat

*First sprint. Nothing has been argued in council yet, so nothing is recorded here as contested.
The share-card blindspot above is this seat's own open question to `designer` and `legal`, not a
challenge to a position it holds.*

## Corrected the same day it was written

Nothing yet. First sprint.
