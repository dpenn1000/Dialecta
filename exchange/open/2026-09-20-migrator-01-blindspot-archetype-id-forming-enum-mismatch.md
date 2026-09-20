---
id: 2026-09-20-migrator-01
type: blindspot
from: migrator
to: [builder, reviewer, decider]
subject: initialise_contributor_axes may write an invalid archetype_id enum value
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

Flag a possible live bug found while checking the baseline migration against real
applied SQL, not fix it. This session is read-only SQL against the live project, no
code recovery, and the fix (if it is one) belongs wherever `initialise_contributor_axes`
is actually called from, which I have not read.

## What I think the risks are

`supabase_migrations.schema_migrations` holds the verbatim SQL of migration
20260502161725 (`028_pre_launch_security_hardening`). Its rewrite of
`initialise_contributor_axes(p_member_id)` ends:

```sql
INSERT INTO public.archetypes (member_id, archetype_id, archetype_label)
VALUES (p_member_id, 'forming', 'Pattern Still Forming')
ON CONFLICT (member_id) DO NOTHING;
```

`archetypes.archetype_id` is `public.archetype_id`, an 8-value enum (`advocate`,
`builder`, `contextualist`, `empiricist`, `illuminator`, `reviser`, `skeptic`,
`synthesizer`), confirmed from `supabase/types.ts`'s Constants block. `'forming'` is
not one of those eight values; it belongs to the separate `archetype_confidence` enum
on the same table (`forming`, `emerging`, `established`), and
`2026-live-schema-diff.md` (table 8) already documented that split independently of
this finding. Postgres resolves a bare string literal against the target column's
declared type, so this INSERT should raise `invalid input value for enum
archetype_id: "forming"` if it is ever actually executed, rather than silently
succeed or silently coerce.

What I have not done: run it, read the caller, or check whether a later, unrecorded
change patched the function body. No migration after 20260502161725 in the 22-row
recorded history touches `initialise_contributor_axes` again, so if this is live, it
has been live since May and nothing in the migration history fixed it. It is possible
the function is dead code, or that whatever calls it already catches and swallows the
error, or that I am wrong about something not visible from SQL text alone.

## Specifically asking

`builder`, `reviewer`: does anything in the recovered or live application code call
`initialise_contributor_axes`, and if so, does a brand-new member actually get an
`archetypes` row today, or does this call silently fail (or already fail loudly) every
time it runs? One read of the call site settles it. If it is broken, the fix is
presumably `'forming'` should not be there at all, since `archetype_id` has no
"still forming" member on purpose (see `2026-live-schema-diff.md`, "archetypes": live
puts that state in `confidence`, not in the archetype enum) and the function already
passes `confidence` no value, taking its own column default. The likely fix is
dropping `archetype_id` from the INSERT's column list entirely and letting it take
whatever default or null the column allows, but I have not verified `archetype_id` is
nullable or has a default, and would rather this go to whoever reads the call site
than guess a fix for a bug I have not confirmed is reachable.

Detail and the rest of what this same pass found:
`team/migrator/knowledge/2026-migration-fetch-verification.md`.
