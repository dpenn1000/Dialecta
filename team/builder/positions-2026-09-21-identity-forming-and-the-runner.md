# builder position: the downstream runner (question 3)

## Brief

Rule for `after()` from the comment's resolution action plus a nightly full replay, as the map
recommends, but only once two fixes land: a unique constraint on `axis_events`, which has none
today, and the `delta`/`tier` mismatch between `packages/core` and live that `architect-06`
already flagged. Veto the build plan's database-trigger diagram outright: a trigger either runs
inside the write transaction or forces `packages/core`'s pure engine into a second implementation
in SQL, and `pg_cron` is not even installed to schedule it. Strongest evidence: Vercel's own docs
describe `waitUntil` as best effort, no retries, no durability, and `axis_events`
(`supabase/migrations/20260920000000_baseline_live_schema.sql:574-591`) carries no uniqueness
constraint at all, so one retried write can double an append-only ledger that no later replay can
undo.

## The runner I'd rule for

`after()` on the comment's resolution action, for that one member, plus a nightly job replaying
every member's ledger. This matches the map and fits what's measured: nothing here has run in 143
days, the largest live ledger holds 11 events, and `replayAxisScores` took 0.38 ms over 17,435
events, 5,000 contributions, in memory (`team/architect/positions-2026-09-20-fingerprint-legibility-and-model.md`,
"Cost"), four times past the 800 to 1,200 comment ceiling `Dialecta_Supabase_Scaling.md` names for
pure replay. That ceiling assumed a full recompute inline on the request path, which `after()`
already removes.

Shipping it costs two fixes first, blocking regardless of topology:

| Fix | Why it blocks any topology | Source |
| --- | --- | --- |
| `packages/core`'s `AxisEvent` (`delta`, `tier_at_contribution`) does not match live `axis_events` (`tier`, no `delta` column) | `replayAxisScores` throws on the first live row it reads, on any schedule | `axis-mapping.ts:155-160`; `architect-06` item 8; baseline migration comment: "No delta column... a different model from the spec" |
| `axis_events` carries a source check but no unique constraint on, say, `(classification_id, axis)` | Nothing stops a duplicated write from posting one comment's deltas twice into a table that is select-and-insert only, forever | `supabase/migrations/20260920000000_baseline_live_schema.sql:574-592`; the only index, at line 592, is `axis_events_member_idx (member_id, axis, created_at)` |

## Two things the map calls replay

The map's case for the nightly job doubling as repair rests on one line: "Replay is idempotent."
True of only one of the two operations involved:

| Operation | Idempotent today | Why |
| --- | --- | --- |
| Recompute `axis_scores` from `axis_events` | Yes | Pure, order independent by construction (`axis-mapping.ts:176-179`; `packages/core/CLAUDE.md`: "replayed from the ledger, never incremented") |
| Write a resolved comment into `axis_events` for the first time | No | No unique constraint (table above); `waitUntil` gives no signal on whether it already ran, "best effort: no retries, no durability," and dies with the invocation (vercel.com/docs/functions/limitations) |
| Archetype history, `feed_events` (B-2) | Unaddressed | Not built yet; no filed idempotency story |

If `after()` commits the ledger insert but the process is reclaimed before it reports success,
nothing tells the nightly job the row exists already. Rerunning `axisDeltasFor` for everyone and
inserting blind can write one comment twice: repair running backward. The fix rides with the
constraint above: diff resolved comments against `axis_events.classification_id` (required by
`axis_events_source_check`), insert only what's missing, and let the constraint catch a race.

## Database triggers, vetoed

`build-plan.md:41`'s diagram, `S --> T[DB triggers: ledger replay, archetype]`, is the one option
this position rules out entirely. The frame's state table half-answers it: `pg_cron` isn't
installed live, so there's no in-database scheduler for a nightly half. The on-write half fails
too: replay inside a trigger means reimplementing `packages/core`'s pure engine in SQL, a second
engine beside the first (unsourced beyond this: Postgres triggers run inside the writing
transaction by default, putting replay cost back on the request the scaling doc's split exists to
avoid). `packages/core/CLAUDE.md` is explicit that callers do the I/O and the engine does none.
`axis-mapping.ts`'s own header names this cost: it "used to implement a different... scheme" that
drifted from spec, which this year's rewrite closes out. A trigger reopens that door.

## The queue

Not vetoed, deferred. Nothing in the stack provides one today: no Upstash, no pgmq, no Vercel
Queue, and root `vercel.json` carries no `crons` or queue block. Vercel Queues would close the
durability gap outright, guaranteed delivery with retries for up to 32 attempts (same source), but
at zero comments in 143 days there's no measured number to justify a new provider and failure
surface. I'd move the moment the map's trigger fires: one member's replay missing `maxDuration`, or
the nightly job, which scales with member count rather than daily traffic, missing its own window.
A queue only relocates replay either way; `supabase/CLAUDE.md` already forecloses the scaling doc's
own preferred alternative, incremental update.

## What would change my mind

A measured `maxDuration` or nightly-window breach moves me to a queue. Evidence that traffic
arrives faster than the two fixes above can land moves me to leave the hook unwired longer, the
position `apps/web/src/app/api/comment/route.ts:278-293` already takes, rather than ship it against
a ledger nothing protects from a double write.

## Rebuttal

The convener is right that only `pg_constraint` on live settles the missing unique constraint,
unmeasured tonight; I can't reach it either. But the caution should be sized to what it's citing. I
checked: the `axis_events` block carries none of `2026-live-baseline-unverified-markers.md`'s "LIVE
UNVERIFIED" tags (zero hits), unlike the nine confirmed-wrong lines that file lists elsewhere, all
guesses about a type, default, or enum value. An absent constraint on a block whose neighboring
lines are individually marked CORRECTED or CONFIRMED is a different kind of claim than a guess
already proven wrong. My recommendation doesn't need it settled either way: gate the
writer on the constraint existing, and if `pg_constraint` shows it already does, the gate clears
free; if not, it's the migration this position already asks for. The one-line check for whoever
runs it: `select conname from pg_constraint where conrelid = 'public.axis_events'::regclass and
contype = 'u'`.

`treasurer` and I land on the same shape and both price it near zero at current scale, so there's no
opponent on this question to answer. Treasurer's sharper point is the one I'd fold in: nobody is
named to watch the `maxDuration`/nightly-window number that triggers a queue. That's my ledger gap
again in miniature, a measurement the map assumes without an owner. Whoever adds the unique
constraint should wire both numbers, the constraint-violation count and the nightly job's own
duration, into something a person checks, or the map's own trigger never fires.

Security's bind, that the runner takes its member from the publish action's verified session and
never the request, and philosopher's, that nothing publishes before confirmation, are both already
inside "for that one member, from the publish action" above; I read them as confirmation of that
shape, already in place.
