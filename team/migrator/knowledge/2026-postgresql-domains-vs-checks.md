# Check constraints against domains for bounded values

**Source:** PostgreSQL, "CREATE DOMAIN",
https://www.postgresql.org/docs/current/sql-createdomain.html, fetched 2026-09-19.
Verified: the page exists, documents the `VALUE` keyword form, and carries the
`NOT NULL` caveat quoted below.

**Lead state:** filed. The lead asked whether specificity (0 to 3) and graduation
count (0 to 22) could be domains. They could. They should not be.

## Summary

A domain is a reusable type carrying its own constraints, checked when a value is
converted to the domain type:

```sql
create domain specificity_score as int check (value between 0 and 3);
```

Four documented properties drive the recommendation:

1. **The `NOT NULL` caveat.** A column of a domain with `NOT NULL` can still read
   as null, on the nullable side of an outer join or from an empty scalar subquery,
   because the constraint is checked on conversion rather than on read. Postgres
   states the best practice directly: design the domain to allow null, and put
   `NOT NULL` on the column.
2. **Constraints are assumed immutable.** They are examined when a value is first
   converted, not at other times. Changing the underlying condition does not
   revalidate existing rows, and the docs warn this can break a dump and restore.
3. CHECK expressions cannot contain subqueries or reference anything but `VALUE`.
4. Multiple domain constraints are tested in alphabetical order by name.

## What this implies for Dialecta

**Keep both as column check constraints. Three reasons, in order of weight.**

**Reuse is the whole argument for a domain, and there is no reuse here.** Each
bound is used exactly once. `specificity` appears on `classifications` and nowhere
else. `graduation_count` appears on `axis_scores` and nowhere else. A domain buys
central maintenance across many columns; across one column it buys a second object
to keep in step with the spec.

**Property 2 is a live hazard for `graduation_count`.** The 0 to 22 bound is a
tuning number, not a law, and `docs/Dialecta_Data_Architecture.md` leaves the
archetype confidence threshold open, which is the kind of open question that moves
numbers like this. If the bound later widens, a column check can be dropped and
re-added with a validation pass over existing rows. A domain constraint would not
revalidate, so the database would quietly hold rows that violate the current
declaration. A constraint that is not enforced on the rows already stored is worse
than no constraint, because it reads as enforced.

**Domains are on the list of things `supabase db diff` does not capture**, per
`2026-supabase-declarative-schemas.md`. Choosing domains narrows a future option
for no present gain.

**One caveat against my own recommendation.** If the 0 to 3 specificity bound ever
spreads to a second table, for instance if article pre-analysis scores specificity
the way comment classification does, the reuse argument turns real and this should
be revisited. That is a plausible future given backlog A-11.

## Implies for

Practice row: bounded values stay as column check constraints, revisited only when
a bound appears on a second table. Backlog A-2 (`specificity`), B-1
(`graduation_count`).
