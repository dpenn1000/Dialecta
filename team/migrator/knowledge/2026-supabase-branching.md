# Supabase branching: what it copies, what it costs, whether it carries data

**Source:** Supabase, "Branching", https://supabase.com/docs/guides/platform/branching,
fetched 2026-09-20. Corroborated against Supabase, "Manage Branching usage",
https://supabase.com/docs/guides/platform/manage-your-usage/branching, fetched
2026-09-20 (via search, pricing figures from that page). Verified: both pages exist.

**Lead state:** filed. The lead's premise ("nobody has checked whether it does what
Branch B assumes") is now checked, and Branch B's assumption is half right.

## Summary

A branch clones the parent project's **configuration and Edge Functions**, deployed
and ready. It does **not** clone data by default: "By default, new branches do not
start with any data or storage objects from your main project. This is meant to better
protect your sensitive production data." Production data can be opted in per branch
(a GitHub-integration seed step, or an "Include data" dashboard toggle), but the
starting state is schema-shaped, not data-populated.

Cost is metered, not flat: **$0.01344 per branch per hour**, and the $10/month compute
credit that offsets the main project does not apply to branch compute. A short PR
preview branch running 30 hours costs about $0.40; a branch left running continuously
costs about $9.70/month. Branching requires the Pro plan or above.

Creation is either automatic (a GitHub integration opens a branch per pull request) or
manual via the dashboard (marked beta on the fetched page).

## What this implies for Dialecta

**Branch B of `p0-2-runbook.md` needs a correction.** The runbook frames branching as
"a copy of production rather than a build from the repo's files," and for schema that
is right. For **data**, it is not automatic: a branch created the plain way starts
empty, which would reproduce the exact problem Branch B exists to avoid (a staging
environment with no realistic rows to test the 10 already-populated tables against).
Getting Branch B to actually behave like "live minus the ability to break live" requires
the explicit data-include step, not the default flow.

**This does not change the recommendation in `2026-09-19-001`.** Branch B still pairs
correctly with Branch A (adopt live): a branch created from live, with data included,
gives exactly the safe-to-break copy that decision needs. It only means the runbook
should not assume the default branch flow is sufficient once someone acts on it.

**Cost is real but small at Dialecta's scale.** One persistent staging branch is under
$10/month. This removes cost as a reason to prefer Branch C (reconcile in place)
over Branch A plus B.

## Implies for

Practice: "a Supabase branch used for staging is created with data included,
explicitly; the default branch flow is schema-only." Backlog P0-2, Branch B of
`p0-2-runbook.md`. This note does not edit the runbook; the correction is recorded
here for whoever executes that branch next.
