# Dialecta Supabase Scaling spec: the cost curve this advisor got wrong

**Source:** `docs/Dialecta_Supabase_Scaling.md`, v1.0, April 2026. Internal canonical spec, read 2026-09-19. Companion to `docs/Dialecta_Data_Architecture.md`.

*Filed after the fact. Sprint 1 wrote a position on where Dialecta's cost curve bends without reading this document, which is the document about where Dialecta's cost curve bends. Two positions were wrong and are corrected below.*

## Summary

The spec's first principle contradicts what this advisor argued from vendor pricing alone: **"Storage is not the first wall. Connection saturation and `axis_scores` recompute cost are."**

What breaks first, in the spec's order:

1. **Connection saturation**, on the first traffic spike. Vercel serverless functions fan out database connections faster than Supabase's direct pool allows. Fix is the Supavisor transaction-mode pooler, which is a connection-string change.
2. **`axis_scores` recompute latency.** The current spec replays `axis_events` on every classification. A contributor with 1,000 lifetime comments means 2,000 to 4,000 ledger reads on every new comment they post. Pure replay "does not scale past roughly 800 to 1,200 lifetime comments per contributor on a small Supabase compute instance." Recommended fix is incremental update with nightly reconciliation, which keeps writes O(1).
3. **Feed reads under article virality.** 500 comments served to 5,000 readers is the stated realistic spike. Fix is a materialized view.
4. **Compute tier ceiling.** "Supabase Pro ships with a Micro compute instance by default. Shared CPU, ~1 GB RAM. The `axis_scores` replay pattern is RAM-sensitive."

Write amplification per comment: seven tables touched, **roughly 3 to 5 KB net new storage**, two synchronous writes and the rest async.

Compute sizing guidance, with the pre-launch checklist requiring the jump off Micro:

| Compute | RAM | When |
| --- | --- | --- |
| Micro (default) | ~1 GB | Pre-launch testing only |
| Small | ~2 GB | Launch through ~10,000 active users |
| Medium | ~4 GB | ~10,000 to 50,000 active users |
| Large | ~8 GB | Past 50,000 active users |

The spec adds the right caveat: "The signal for jumping a tier is sustained p95 query time creeping above ~200ms on profile loads, not a specific user count. Watch the dashboard, not the calendar."

Note the document is April 2026 and predates ADR-001. Its Phase 4 section says "Ghost is the confirmed production stack" and treats the Next.js migration as deferred. That framing is stale; the operational content is not.

## Implies for Dialecta

- **The floor was understated by $15 a month.** Supabase Pro at $25 ships Micro, and the pre-launch checklist requires Small, which the vendor page prices at $15. Launch-ready Supabase is $40, not $25. Corrected in `../positions/monetization.md`.
- **The per-user cost curve exists after all, as a step function.** Compute goes Small to about 10,000 active users, then Medium at $60, then Large at $110. Sprint 1 claimed nothing in the stack bends with user count. That was wrong. It bends in steps, the first step is at roughly 10,000 active users, and each step costs $45 then $50 more a month. The conclusion on P0-D2 survives, because $45 a month at 10,000 active users is a rounding error against any membership revenue at that size. The reasoning did not survive and is corrected in `../positions/p0-d2-signup.md`.
- **Storage per comment is 3 to 5 KB, not the 2 KB this advisor assumed.** The 8 GB Pro allowance covers roughly 1.6 to 2.7 million comments, not four million. Still not the wall. The estimate was wrong by about half and the correction is filed rather than quietly patched.
- The two genuine first walls cost nothing recurring to fix. Supavisor pooling is a connection string. Incremental `axis_scores` update is engineering time in A-2's neighbourhood. **This is the cheapest kind of scaling problem, and the treasurer should say so: Dialecta's scaling risk is latency and engineering attention, not vendor spend.**
- The pre-launch checklist has five items and the monitoring list has five more, including "Anthropic API rate limit headroom logged per `/api/classify` call". That last one is the measurement this advisor asked for in `2026-anthropic-api-pricing.md`, already specified by someone else. Use it rather than re-specifying it.

*Filed 2026-09-19*
