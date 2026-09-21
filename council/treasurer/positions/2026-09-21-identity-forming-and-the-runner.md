# The downstream runner

*treasurer position, 2026-09-21, question 3 only, for
`council/log/2026-09-21-identity-forming-and-the-runner.md`.*

## Brief

After() with a nightly cron, as the map proposes, and I recommend it: at Dialecta's current and
near-term scale it costs close to nothing, because Vercel bills Active CPU only while code runs
and pauses during a database wait (vercel.com/docs/functions/usage-and-pricing, fetched
2026-09-21). The measured replay, 0.38 ms for a 5,000-comment member, is compute only and already
sits past the scaling spec's own 800-to-1,200 ceiling without troubling a CPU-hour. Both ride the
Pro plan Dialecta already carries. The real limit is wall-clock against `maxDuration`, not a
dollar figure, and nobody has measured the one number that predicts when it bites, or is named to
watch for it.

## Recommend

`after()` for the one member on publish, a nightly cron replaying everyone, no queue yet. At
today's scale, zero comments, articles or follows in 143 days (`docs/MORNING-AUDIT-2026-09-21.md:167`)
against 27 `axis_events` and 3 `classifications`, either path's marginal cost rounds to zero. The
scaling spec's ceiling of roughly 800 to 1,200 comments per contributor before pure replay
degrades (`Dialecta_Supabase_Scaling.md`, "axis_scores recompute latency," option C) describes
synchronous replay on every write. The measured `replayAxisScores`, 0.38 ms for a 5,000-comment
member, sits four to six times past it and is compute time only; `after()` moves it off the
request entirely. Vercel's pricing keeps the dollar cost near zero as it grows too: billing
"pauses ... when your code is waiting for external services" (vercel.com/docs/functions/usage-and-pricing).
Cron Jobs are included on every plan, Pro down to a one-minute interval
(vercel.com/docs/cron-jobs/usage-and-pricing). Provisioned Memory keeps billing through the wait,
but at $0.0106 to $0.0183/GB-hour, a nightly job finishing well inside `maxDuration` costs cents a
year. Both ride the Pro plan Vercel's commercial-use terms already require, paid at $20.20/mo
(`research/2026-vercel-pricing.md`; `research/2026-subscription-command-center.md:32`). The
nightly read load lands on the Supabase compute tier the scaling spec already put in the floor for
RAM-sensitivity reasons unrelated to this decision (Small, $15/mo add-on,
`research/2026-dialecta-supabase-scaling-spec.md`), so this runner adds no new line item.

| Path | Marginal $ today | What bounds it | Source |
| --- | --- | --- | --- |
| `after()` per publish | ~$0; Active CPU pauses on DB wait | The route's `maxDuration` | vercel.com/docs/functions/usage-and-pricing |
| Nightly cron, all members | ~$0; one invocation/night, included on every plan | Same `maxDuration`, over every member at once | vercel.com/docs/cron-jobs/usage-and-pricing |
| Supabase read load | Already inside the Small add-on, $15/mo | Already budgeted, not this decision | `research/2026-dialecta-supabase-scaling-spec.md` |
| A queue, if triggered | Vercel Queues (public beta): first 1M ops free (Hobby), usage-based (Pro); worker still billed at Active CPU | Ops metered in 4 KiB chunks | vercel.com/docs/queues/pricing |

## Veto

Building a queue now. Zero paying members, no comment in 143 days, and `replayAxisScores` still
throws on every live row (`exchange/open/2026-09-21-architect-06`, item 8) leave no measured
benefit to weigh against the cost, and the charter vetoes spend with no path to revenue. If one
becomes necessary, prefer what Dialecta already pays for over a new vendor: Vercel's own Queues, or
Supabase's `pgmq`, which rides the database already running. A third-party queue (Upstash, Inngest)
buys a nicer retry surface with nothing yet to price it against. Either in-platform option
avoids adding a forty-fifth line to a ledger this seat is already trying to shrink
(`research/2026-subscription-command-center.md`).

## The trigger nobody watches

The map's two conditions, a member's replay missing `maxDuration` and the nightly batch passing a
limit, are one number measured twice. Pro's ceiling is 300s by default, 800s generally available,
1,800s in beta (vercel.com/docs/fluid-compute). `pg_cron` is not installed (the frame's "The
runner" table), so the nightly job is itself a Vercel Function bound by that same ceiling, run
once over every member and dominated not by 0.38 ms of compute but by one unmeasured database
round trip (the architect's figure excludes the fetch). That single number, times member count, is the whole
early-warning system, and it doesn't exist yet; nobody is named to watch the dashboard for it either.
Whichever computation the fingerprint debate rules, full replay or an incremental fold, runs inside
this same mechanism and inherits its ceiling. I would change my mind toward a queue sooner the day
someone benchmarks one production fetch against the pooled connection and multiplies it by a
realistic membership projection, or the day the nightly job is wired up and someone times a real run.

## Rebuttal

`builder` and I never opposed each other on the recommendation, and its own rebuttal already says
so; the concession running the other way is mine. I inherited the map's "replay is idempotent, so
the nightly run is also the repair path" without splitting it, and builder's split is right:
`axis_scores` recompute is idempotent, the first `axis_events` write is not, and a `waitUntil`
retry against no unique constraint can double it in a way replay then compounds rather than fixes.
The convener flagged builder's citation as drawn from a file with wrong markers elsewhere; builder
checked and that specific block carries none of that file's "LIVE UNVERIFIED" tags, which narrows
the doubt without closing it. Either way the fix is the same $0 migration, so my dollar number
doesn't move: I'm adding the unique constraint as a named precondition to my own recommendation,
next to the delta/tier fix I already had.

Builder folds in my "nobody watches the trigger" point and proposes wiring the
constraint-violation count and the nightly job's duration into one thing a person checks. I'll
close the one part that's still open: name the person. Dialecta has no ops team; the only
candidate today is Dan, and a two-number dashboard nobody is assigned to read is exactly the
unmonitored infrastructure this seat's charter warns against: "a solo founder can afford to leave
running" is about being watched, as much as being cheap. Both numbers already exist for free on vendor
dashboards, Vercel's function duration and a `pg_constraint` check, so the missing piece isn't a
tool, it's an owner and a threshold, and naming one costs nothing tonight.
