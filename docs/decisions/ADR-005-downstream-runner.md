# ADR-005: The work after a comment resolves runs in `after()`, reconciled nightly; a queue waits for a measurement
*2026-09-21. Status: Decided by `decider` under the rebuild map's routing, open to Dan's override.*

Debate: `council/log/2026-09-21-identity-forming-and-the-runner.md`, question 3. Proposal: `team/architect/architecture/2026-09-21-rebuild-map.md`, "Write paths".

## Question
Where axis events, the `axis_scores` replay, archetype assignment and feed events run once a comment's tier resolves, and what moves them to a queue. It blocked B-1, B-2 and step 7 of the rebuild map's build order.

## Options considered
| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |
| `after()` in the action that resolves or re-resolves a comment, plus a nightly Vercel Cron job that reconciles, then replays | A uniqueness key on `axis_events`; core's ledger type and live's table agreed; a cron route checking `CRON_SECRET`; about $0 on Pro | Work lost by `after()` waits for the next night's repair; the nightly pass is bounded by its route's `maxDuration` (300 s default, 800 s maximum on Pro) | Nothing: a queue later swaps the transport and keeps every step |
| A queue now (Vercel Queues, or `pgmq` on Supabase) | A consumer, retry handling and a new service or extension, with nothing measured to ask for them | Redelivery on crash, timeout or rollout; delivery is at-least-once, so the same key | Nothing structural |
| Database triggers (`docs/plans/build-plan.md`, "Architecture") | The engine rewritten in SQL, or a trigger calling out through `pg_net`; `pg_cron` installed for the nightly half | Two engines to keep in step; replay back inside the writer's transaction | `packages/core` as the one engine |

## Decision
`after()` in the server action that resolves a comment's final tier, at publish and at every community re-resolution, for the author read from the committed comment row. A nightly Vercel Cron job checks every resolution against `axis_events`, inserts only what is missing, then replays every member. No queue and no database triggers. The spec already fixes the trigger and the computation (`docs/Dialecta_Data_Architecture.md`, "Axis Score Updater" and entity 4); this rules the mechanism.

The reason that carried it: the pipeline's safety lives in a uniqueness key and the nightly reconcile, and every option needs both. Work scheduled with `after()` on an instance a rollout replaces "disappears without an error anyone sees" (vercel.com/i/message-queue); cron delivery is "best effort" and can run twice (vercel.com/docs/cron-jobs/manage-cron-jobs); queue delivery is at-least-once (vercel.com/docs/queues/concepts); all fetched 2026-09-21. A queue now buys retries for traffic that does not exist: no comment, article or follow in 143 days, and the largest ledger holds 11 events.

It holds while two measurements stay under their lines: the nightly job's run time below half its route's `maxDuration` (150 s at Pro's 300 s default), and the nightly pass finding work `after()` lost on fewer than two nights in any seven. The job records both on every run, `/analytics` shows them, and Dan owns them. Either crossing moves the transport to a queue; the steps and the key stay.

## Consequences
- **Backlog B-1**, the convener's edit: "On each resolution and re-resolution, in `after()`: insert `axis_events` under the uniqueness key and replay that member's `axis_scores`. A nightly Vercel Cron job reconciles, then replays everyone (ADR-005)." Blocked by A-4, the identity re-key (the map's step 2), `exchange/open/2026-09-21-architect-06` item 8, and the key.
- **Backlog B-2**: runs in the same `after()` step and nightly job, under precondition 7. Blocked by B-1 and by Dan's ruling on "forming".
- **Build plan**: the Architecture diagram's `DB triggers: ledger replay, archetype` node goes.
- **Scaling spec**: section 2 and the pre-launch checklist recommend an incremental update of `axis_scores` with a nightly reconcile, which `supabase/CLAUDE.md:10` forbids and entity 4 rules out ("not accumulated incrementally"). Declined for `axis_scores`. The spec's 800 to 1,200 ceiling estimates database reads; the 0.38 ms measured over 17,435 events is compute alone, and the per-member fetch, still (unmeasured), is what tests the ceiling.
- **Preconditions** the `migrator` and `builder` briefs carry, all before the writer ships:
  1. `migrator` reads `pg_constraint` on live `axis_events` first. The key identifies one earning event: it covers every source the writer keeps (live has `comment` and `article`, and article rows carry no classification id), lets a re-resolution or a new rule version append a successor row, covers a Breach row if the fingerprint debate puts one in this table, and declares any nullable column `nulls not distinct`.
  2. `axis_events.member_id` carries the person key Dan rules on in this debate's question 1, so the writer lands after the re-key.
  3. `packages/core`'s `AxisEvent` and live `axis_events` agree, and `replayAxisScores` runs clean on the 27 live rows. Which side moves is not ruled here. It stays with `exchange/open/2026-09-21-architect-06` item 8, beside the fingerprint debate's filed proposal for "a `LedgerRow` type written from the live table" (`team/architect/positions-2026-09-20-fingerprint-legibility-and-model.md:109`); entity 3's own `delta` note, "Breach contributes negative delta", already conflicts with ADR-004; and an answer that amends entity 3 is Dan's.
  4. The callback reads the committed comment row for the tier and the member, never the request, the voter's session or the action's memory: `after()` runs even when the action throws (nextjs.org/docs/15).
  5. Every write is an overwrite derived from the ledger or an insert under a unique key naming what it records, archetype history and `feed_events` included.
  6. The nightly route is pipeline code, refuses any request whose `Authorization` header does not carry `CRON_SECRET`, and reconciles everything outstanding, never a time window, so a missed or doubled run costs nothing.
  7. No first assignment, and no feed event about one, reaches a table `anon` can read (`archetypes` and `feed_events` today) before ADR-004's predicate policy and the owner's first-render confirmation exist.
- **The fingerprint debate**: its fold, stored at write time, runs on this runner, and whether it updates per row or refolds is that debate's. A per-row update commits in the same transaction as the ledger insert that feeds it, and the nightly pass is its drift check.
- Classification is outside this ruling.

## Specs touched
- `docs/Dialecta_Supabase_Scaling.md`, "2. `axis_scores` recompute latency for power users": option A declined for `axis_scores` (ADR-005); the path is per-member replay off the request with a nightly reconcile; the 800 to 1,200 figure is an estimate the per-member fetch will test.
- `docs/Dialecta_Supabase_Scaling.md`, "Pre-Launch Checklist": the `axis_scores` line reads as decided by ADR-005, replacing "Recommendation: incremental with nightly reconcile."
- `docs/Dialecta_Data_Architecture.md`, "Open Questions", "Axis delta computation": drop the pairing with the scaling spec's option A, which contradicts entity 4.
- `docs/plans/build-plan.md`, "Architecture": the `DB triggers: ledger replay, archetype` node becomes `after()` in the resolving action and a nightly Vercel Cron job.
