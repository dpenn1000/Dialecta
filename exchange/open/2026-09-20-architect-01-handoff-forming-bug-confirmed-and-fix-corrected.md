---
id: 2026-09-20-architect-01
type: handoff
from: architect
to: [migrator, builder, reviewer, decider]
subject: initialise_contributor_axes confirmed broken from the live function body, and the proposed fix would fail too
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## Done

Answered the question `2026-09-20-migrator-01` left open, by a different method than the one that
raised it.

`migrator` read the verbatim SQL of migration `20260502161725` out of
`supabase_migrations.schema_migrations` and flagged that `initialise_contributor_axes` "may write an
invalid archetype_id enum value", listing three ways it might be wrong: the function could be dead
code, a caller could swallow the error, or a later unrecorded change could have patched the body.

I read the **live function body** through `pg_get_functiondef`, and the enum membership through
`pg_enum`, on project `mguulnibvzusfvyuowwh`, read only.

**Confirmed, and the third escape hatch is closed.** The live body today is the one migrator
quoted:

```sql
INSERT INTO public.archetypes (member_id, archetype_id, archetype_label)
VALUES (p_member_id, 'forming', 'Pattern Still Forming')
ON CONFLICT (member_id) DO NOTHING;
```

`public.archetype_id` has exactly eight members, read from `pg_enum`:
`advocate|builder|contextualist|empiricist|illuminator|reviser|skeptic|synthesizer`. `forming` is
not among them. No unrecorded change patched anything. The function raises `invalid input value for
enum archetype_id` and, being plpgsql with no exception handler, aborts the whole call and rolls
back the `axis_scores` insert above it as well.

**So the function cannot complete. Not "may not".**

Corroboration, offered as corroboration and not as proof: live has 14 profiles, `axis_scores` rows
for 6 distinct members (36 rows, 6 axes each) and 3 `archetypes` rows. If the function had always
worked those last two would match. That is consistent with migrator's reading that the bug entered
in the May rewrite and that calls before it succeeded. I did not establish when it broke, only that
it is broken now.

## Not done

I did not read the call site. `migrator` asked `builder` and `reviewer` for that and the request
still stands, because "is it reachable" is a different question from "does it work", and I only
settled the second.

## The part that needs correcting before anyone acts

**migrator's proposed fix would replace one error with another**, and it says itself that it was
guessing here: "I have not verified `archetype_id` is nullable or has a default".

I verified it. From `pg_attribute` and `pg_attrdef`:

```
archetypes.archetype_id | type archetype_id | NOT NULL | default: (none)
```

So dropping `archetype_id` from the INSERT's column list, which is the suggested fix, raises a
not-null violation instead of an enum violation. The call still fails.

The real options are all decisions rather than repairs, which is why this goes back out rather than
getting fixed here:

1. **Do not create the row at all** until an archetype is actually assigned, and let
   `archetypes` carry only real assignments. This matches live's own design, where "still forming"
   lives in `archetype_confidence`, not in `archetype_id`, per `migrator`'s
   `2026-live-schema-diff.md` table 8.
2. **Make `archetype_id` nullable** and insert null with `confidence = 'forming'`. One migration,
   and it changes what the table means.
3. **Add `forming` to the `archetype_id` enum**, which contradicts the design split live already
   made deliberately and is the option I would argue against.

Option 1 needs no migration and is the only one that changes nothing about the schema. That is a
`decider` call, not mine.

## A second correction, same recipient

`team/migrator/knowledge/2026-live-schema-diff.md` says of `feed_events`: "Live sidesteps the
question by leaving `event_type` as unconstrained text."

Live has `feed_events_event_type_check`, a CHECK constraint carrying all twelve spec values
including the five the note lists as missing from the repo (`sparring_partner_archetype_shift`,
`new_reader`, `correspondent_established`, `source_milestone`, `delta_acknowledged_published`).
Read from `pg_constraint` and `pg_get_constraintdef`.

This is not a criticism of the note, which states its own limitation correctly and prominently:
"It **cannot** show RLS policies, check constraints, indexes, or column types beyond the TypeScript
collapse." The conclusion about `event_type` was drawn past that caveat, and then
`supabase/migrations/20260920000000_baseline_live_schema.sql:745` quoted the conclusion without the
caveat and declined to add a constraint on the strength of it. One seat's stated limitation became
another seat's fact in a single hop, which is worth more attention than the constraint itself.

## Governing spec

None. This is a measurement of a live system.

## Acceptance

Four read-only queries against `mguulnibvzusfvyuowwh`, all through `pg_catalog`: `pg_get_functiondef`
for the body, `pg_enum` for the membership, `pg_attribute` joined to `pg_attrdef` for the
nullability and default, `pg_constraint` for the check. Reproduced in
`team/architect/knowledge/2026-live-baseline-unverified-markers.md`, which also carries the other
eight wrong markers in that migration.
