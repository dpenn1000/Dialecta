# Supabase: plan pricing and overage rates

**Source:** Supabase, "Pricing", fetched 2026-09-19. https://supabase.com/pricing

## Summary

| Plan | Price | Database | Egress | MAUs | File storage |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | 500 MB, shared CPU, 500 MB RAM | 5 GB | 50,000 | 1 GB |
| Pro | $25 | 8 GB, then $0.125/GB | 250 GB, then $0.09/GB | 100,000, then $0.00325/MAU | 100 GB, then $0.0213/GB |
| Team | $599 | same as Pro | same as Pro | same as Pro | same as Pro |

Cached egress is billed separately at $0.03/GB beyond 250 GB on Pro.

Compute add-ons run from Micro at $10/month to 16XL at $3,730/month, with Small at $15 and Medium at $60.

The decisive line for Dialecta is not a price. It is this: **"Free projects are paused after 1 week of inactivity."** A public site with sign-ups cannot run on a plan that pauses itself. Supabase Pro at $25 is the floor, not a choice.

Running the Pro quotas against Dialecta's shape:

- 8 GB of database at the Scaling spec's stated 3 to 5 KB of write amplification per comment is roughly 1.6 to 2.7 million comments before the first $0.125 overage. An earlier version of this note assumed 2 KB and said four million.
- 100,000 included MAUs against 14 live Ghost members is five orders of magnitude of headroom.
- 250 GB of egress at roughly 500 KB per page load is about 500,000 page loads a month.

## Implies for Dialecta

- $25/month is a fixed cost from the day the site opens. **Corrected 2026-09-19: $25 is not the launch-ready price.** Pro ships a Micro instance, and `docs/Dialecta_Supabase_Scaling.md` puts the jump to Small on its pre-launch checklist because the `axis_scores` replay pattern is RAM-sensitive. Launch-ready Supabase is $40. See `2026-dialecta-supabase-scaling-spec.md`.
- The compute ladder is the one line here that does track user count, in steps: Small to about 10,000 active users, Medium at $60, Large at $110. Small in absolute terms, real in shape, and sprint 1 first claimed no such curve existed.
- On P0-D2, Supabase gives no reason to prefer invite-only over open sign-up. Auth is free to 100,000 monthly active users. Anyone arguing that open sign-up costs money has to point at something other than the database.
- The first quota Dialecta crosses is egress, and it crosses at around half a million page loads a month. That is a success problem, and at $0.09/GB it is a cheap one.
- The live project `mguulnibvzusfvyuowwh` holds 32 tables and 20 applied migrations. Confirm which plan it is on before this floor is treated as fact; the charter asks Dan for current spend and this is one of the lines.
- Team at $599 buys nothing Dialecta needs. Its included quotas are identical to Pro. It is an organisational feature tier, and this advisor would veto the spend.

*Filed 2026-09-19*
