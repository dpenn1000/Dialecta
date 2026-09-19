# supabase/, working context for Claude Code

The Dialecta data layer. Source of truth for shape: `docs/Dialecta_Data_Architecture.md` (v1.2). When the two disagree, the spec wins; surface the drift, do not amend the spec silently.

## Rules

- **Migration naming:** `migrations/YYYYMMDDHHMMSS_short_snake_name.sql`, UTC timestamp, one concern per file. `supabase migration new short_snake_name` generates the name.
- **Never edit a shipped migration.** Once a file has been applied anywhere but your own machine, it is history. Fix forward with a new migration.
- **RLS on every table.** `alter table ... enable row level security` directly after `create table`, then the policies. Public read for published content and profiles; insert and update of own rows through `auth.uid()`. Pipeline writes use the service role from server code only.
- **Ledger tables are append-only.** `axis_events` has select and insert only, no update or delete policy, no trigger that rewrites rows. `axis_scores` is always a replay of the ledger (`replayAxisScores` in `packages/core`), never an incremental update.
- **Identity types:** Ghost member and post ids are `text` (legacy, nullable, unique). Everything Dialecta owns keys on `uuid`. Do not cast one into the other.
- **Locked enums:** `tier` (forum, spark, echo, fog, heat, stance, breach) and `axis` (acuity, reach, calibration, magnanimity, discourse, consistency). Adding a value is a spec change first.
- **Verbatim columns:** `aspirations.statement` and `aspirations.reason` are never modified by the platform. No trigger, no cleanup job touches them.
- Comments in SQL cite the spec section they implement.

## Before you commit a migration

```
supabase start                 # once, local stack
supabase db reset              # applies every migration from scratch
supabase db lint               # must be clean
npm run types                  # regenerates supabase/types.ts (root script)
```

Commit `supabase/types.ts` with the migration that changed it.

## Env

Local: `supabase status` prints the URL and anon key; put them in `apps/web/.env.local`. Never commit real values. `supabase/.temp/` is ignored.
