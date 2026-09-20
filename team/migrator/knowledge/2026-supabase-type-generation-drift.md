# Type generation into supabase/types.ts, and how it drifts

**Source:** Supabase, "Generating TypeScript Types",
https://supabase.com/docs/guides/api/rest/generating-types, fetched 2026-09-19.
Verified: the page exists and documents all three source flags.

**Lead state:** filed. The lead called drift a silent failure. It is, and this
session found a second kind of drift the lead did not anticipate, which is load
bearing for the schema diff.

## Summary

`supabase gen types typescript` reads a schema by introspection and writes
TypeScript. Three sources: `--local` (the Docker stack), `--project-id <ref>` (a
remote project), `--db-url` (any connection string). The docs acknowledge the
output "is not what you expect" in places, giving the example of a view column
generated as nullable when the author expects not null, because introspection
reports what the catalog says rather than what was intended. Staying in sync is
either a scheduled job that regenerates and commits, or regenerating by hand after
each migration. The docs do not mandate a CI check.

## What this implies for Dialecta

**`npm run types` points at the live project, so the generated file is evidence
about production, not about this repo.** The script in `package.json` is
`npx --yes supabase gen types typescript --project-id mguulnibvzusfvyuowwh`, and the
header comment in `supabase/types.ts` says the same. Running it does not validate
`supabase/migrations/`; it overwrites the file with the live shape. Anyone who runs
`npm run types` expecting to check their migration gets a file that silently
disagrees with the migration they just wrote, and the disagreement looks like their
mistake.

**The drift that matters most here is a type collapse, and it limits every
conclusion drawn from `supabase/types.ts`.** The generator maps both `text` and
`uuid` to the TypeScript `string`. The evidence is inside the file: live
`profiles.id` and live `profiles.ghost_member_id` are both `string`, and those two
cannot be the same Postgres type given that `ghost_member_id` holds 24-character
Ghost hex ids per `docs/Dialecta_Data_Architecture.md` v1.2. So the generated file
**cannot settle whether live `member_id` columns are `text` or `uuid`**, which is
precisely the Phase 1 against Phase 2 question the Identity Types section governs
and the single most consequential unknown in the schema diff.

Two pieces of circumstantial evidence point at `text`, and neither is proof:
live `axis_events` declares foreign keys to `classifications` and `comments` but
**none for `member_id`**, and live `profiles.ghost_member_id` is not null while the
repo's is nullable. An unconstrained id column is what a Ghost-sourced text id
looks like. Settling it needs `db pull` or a catalog query, not this file.

**Four other things the generated file cannot show**, all of which bound the diff
in `2026-live-schema-diff.md`: RLS policies, check constraints, indexes, and
defaults. Defaults are partly inferable, because a column optional in `Insert` but
present in `Row` has a default or is generated. Nothing else is recoverable.

**What it does show reliably:** table and column names, nullability, enum
membership, and declared foreign keys. Every claim in the schema diff rests on
those four and says so where it does not.

## Implies for

Practice: "`supabase/types.ts` is evidence about the live project, and it cannot
distinguish `text` from `uuid`". Backlog P0-2, P0-6 (Identity Types).
Exchange record 2026-09-19-002.
