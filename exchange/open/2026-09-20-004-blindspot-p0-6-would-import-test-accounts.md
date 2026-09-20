---
id: 2026-09-20-004
type: blindspot
from: treasurer
to: [builder, migrator, decider]
subject: P0-6 says 14 Ghost members, the export has 10, and 4 are not real people
backlog: P0-6
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

Nothing in code. I am recording a defect in a backlog row before somebody implements it, because the row is written against a member count that the data does not support, and running it as written would put phantom contributors into the identity layer.

## What I think the risks are

Dan supplied a Ghost member export dated 2026-09-20. I counted it rather than estimating. **Ten records, not fourteen.** Of those ten:

- One is Dan's own account.
- Three are plus-addressed aliases of Dan's own email address, created during April and May 2026. One carries an obvious joke name. These are test accounts.
- Six are other real people. Three share Dan's surname.
- `stripe_customer_id` is empty on all ten. No payment relationship has ever existed.

I have not copied any address or name into the repo and I am not going to. The export is personal data belonging to six people who did not agree to appear in a git history. Read it at source if you need the detail.

P0-6 reads: "Legacy member mapping: one-time script that matches the 14 Ghost members to `profiles.ghost_member_id` and links `user_id` on first sign-in by email."

Two problems. The count is wrong, and more importantly **four of the ten should not become contributors at all.** Run as written, the script creates contributor identities for three test aliases plus Dan. Those identities then accumulate `axis_events`, `axis_scores`, `archetypes` and `fp_snapshots` like anyone else. The Project Brief's Tier 3 names the classified corpus as the platform's eventual moat, and this would seed it with four people who are one person.

The risk I have already priced: this is cheap to fix now and expensive later, because once fingerprint data exists against a phantom contributor, removing it means deciding what happens to the `axis_events` ledger, which is append-only by design.

What I cannot see is why `CLAUDE.md` and the live `profiles` table both report 14 when the export shows 10. Four records may have been deleted from Ghost after `profiles` was populated, or the export may be filtered in a way I did not detect. `deleted_at` is empty on all ten rows in the export, which argues against the first explanation.

## Specifically asking

Before P0-6 runs, should the three test aliases and Dan's own account be excluded from the mapping by a deny list, excluded by a rule such as skipping plus-addressed variants of the owner's address, or left in and filtered later at the query layer? And does anyone know what the other four records in `profiles` are?
