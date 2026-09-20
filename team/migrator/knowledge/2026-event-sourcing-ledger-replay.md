# Event sourcing: replaying a ledger against incrementally accumulating state

**Source:** Cross-referenced from search: "Event Sourcing and the History of Accounting,"
dev.to/dealeron, and general event-sourcing literature surveyed via WebSearch,
fetched 2026-09-20. No single canonical page; this note synthesizes a recurring
argument that appears consistently across sources rather than citing one authority.
Treat the citation as weaker than the other notes in this file, per this agent's own
"cite what you read, not what you remember" rule; the underlying claim (compensating
events vs. destructive correction) is well established, not exotic.

**Lead state:** filed, with a caveat on source strength noted above.

## Summary

Two ways to store a running total. Sum a ledger of immutable events on every read (or
on a snapshot cadence), or maintain a single mutable counter that each event updates in
place. The difference that matters here is not performance, it is **what correcting a
mistake costs**.

Ledger replay: a wrong event is not edited. A compensating event is appended, and the
sum from that point forward is correct while the full history, including the mistake
and its correction, stays legible. This is the same shape as double-entry accounting:
"if a mistake is found, the record persists and a later transaction to reverse the
mistake can be added."

Mutable accumulation: a wrong update can be patched directly, cheaply, in place. But if
the only record is the current total and a stream of updates that already collapsed
into it, there is no way to know which update was wrong or to recompute what the total
should have been without an external audit trail. The correction is cheap; proving it
was necessary, or bounding its size, is not.

Real costs on the ledger side: more storage (one row per event, not one row per
entity), and reads that require a fold instead of a lookup, which snapshotting
mitigates but does not remove.

## What this implies for Dialecta

**This is the axis_events.delta question, named precisely.** `2026-live-schema-diff.md`
already found that live `axis_events` has no `delta` column and live counts (mutable
accumulation) where the spec and the repo's migration sum (ledger replay). `supabase/CLAUDE.md`
locks replay as the intended design. This note supplies the "why" behind that lock:
under replay, an axis score that was awarded wrongly is corrected with a new event, and
the full history explains the current number. Under live's current shape, the same
correction is an `UPDATE`, and nothing in the row says a correction happened at all.

**The cost is not symmetric, which matters for pricing Branch C.** Moving live from
mutable-count to ledger-replay is expensive in one direction only: the 27 existing
`axis_events` rows carry no `delta`, so the events that produced today's count cannot
be reconstructed from what live already stores. `p0-2-runbook.md` already flags this
("27 rows carry no way to recover one") as the most expensive item in Branch C. This
note adds the reason it is not just expensive but partially irreversible: there is no
mechanical backfill, because the source information (each event's individual
contribution) was never captured, only its cumulative effect.

**A middle path exists and is worth recording.** Keep live's current rows as an opening
balance (one synthetic "migration" event per subject carrying the pre-cutover total as
its `delta`), and require `delta` going forward. This does not recover the lost
per-event history, but it stops the loss from compounding and makes every future
number explainable. Cheaper than reconstructing the unrecoverable 27, and it is the
practical version of "reconcile," not full replay from day one.

## Implies for

Practice: "a ledger table's rows are never patched to fix a wrong total; a compensating
row is appended instead" (already implicit in `supabase/CLAUDE.md`'s replay lock; this
note is the sourced justification for it, previously unsourced). Backlog: Branch C of
`p0-2-runbook.md`, specifically the `axis_events.delta` item.
