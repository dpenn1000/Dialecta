# RLS performance: the six mechanisms, and which ones bind before there are rows

**Source:** Supabase Docs, "RLS Performance and Best Practices",
https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv,
fetched 2026-09-20. The page carries its own benchmark table; the figures below are quoted from it
and are not re-derived here.

**Lead state:** filed, lead 2.

## The six, with mechanism and reported figure

| # | Rule | Mechanism | Reported |
| --- | --- | --- | --- |
| 1 | Index every column a policy filters on | B-tree on the policy predicate's column | 171ms to under 0.1ms on 100k rows |
| 2 | Wrap every function call in a subselect: `(select auth.uid())` | Forces an `initPlan`, so the optimizer caches one result instead of calling per row | 179ms to 9ms |
| 3 | Same wrap on SECURITY DEFINER helpers: `(select is_admin())` | Same `initPlan` | 11,000ms to 7ms, and 178,000ms to 12ms |
| 4 | Filter client-side as well as in the policy | Fewer rows reach the policy at all | 171ms to 9ms |
| 5 | Invert join-shaped policies | `team_id in (select ... where user_id = auth.uid())` instead of `auth.uid() in (select ... where team_id = table.team_id)` | 9,000ms to 20ms |
| 6 | Always name roles with `TO authenticated` | anon is rejected before any predicate runs | 170ms to under 0.1ms |

The page's own words on rule 2, which is the one that generalises furthest: "Wrapping the function
in some SQL causes an `initPlan` to be run by the optimizer which allows it to 'cache' the results
versus calling the function on each row."

## The part the lead asked for

The lead's framing is the useful one: find out what makes them slow before there are rows. Live
carries 3 comments, 3 classifications, 14 profiles and 36 axis_scores rows, so nothing here is
measurable on this database today and will not be until it is expensive to change.

Four of the six are free to adopt now and cost real money later.

- **Rules 2, 3 and 6 are text.** They change how a policy is written, never what it means. Applying
  them to a policy that does not exist yet costs nothing. Retrofitting them means rewriting every
  policy in a migration and re-testing each one.
- **Rule 1 is an index per policy predicate.** On an empty table an index is instant. On a large one
  it is a lock or a `CONCURRENTLY` dance.
- **Rules 4 and 5 are call-site and policy-shape decisions** that follow the data model, so they are
  judged per case rather than adopted wholesale.

Rule 6 is worth separating out because it is not only performance. `TO authenticated` narrows the
policy's reach, so it is a correctness and least-privilege control that happens to also be fast.
A policy with no `TO` clause applies to PUBLIC, which is the same default that put EXECUTE on four
functions in `2026-postgres-alter-default-privileges.md`. Same root cause, different object type.

## What this implies for Dialecta

- **The rebuild adds policies to every table it creates, and the cheapest moment to get all six
  right is the moment the policy is first written.** That moment is now.
- **`(select auth.uid())` and `TO authenticated` belong in whatever template or checklist governs a
  new policy**, so they are the default spelling rather than an optimisation someone remembers.
- **Rule 1 has a concrete target already.** Live keys every child table on `member_id`, per
  `migrator`'s `2026-live-schema-diff.md`, and that is what a per-member policy will filter on. Any
  table whose policy reads `member_id` wants an index on `member_id`.
- **This is a standing check, not a one-off.** "Every policy names a role and wraps its function
  calls" is decidable by reading `pg_policies.qual` and `pg_policies.roles`, so it can be a test
  rather than a review habit.

## Implies for

Practice: "a new RLS policy names its role and wraps every function call in a subselect, and any
column it filters on gets an index in the same migration." Backlog P0-4 and every table the rebuild
creates. Related: `2026-postgres-alter-default-privileges.md` on the PUBLIC default.

*Filed 2026-09-20*
