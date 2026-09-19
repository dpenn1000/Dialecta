---
name: dialecta-migration
description: How schema changes are made on Dialecta. Use for any Supabase migration, RLS policy, enum, or type regeneration.
---

Schema is code in `supabase/migrations/`. The dashboard is read-only for humans and agents. `supabase/CLAUDE.md` has the short rules; `docs/Dialecta_Data_Architecture.md` v1.2 has the entities.

Checklist for a migration PR:
1. New file `YYYYMMDDHHMMSS_<intent>.sql`. Never edit a shipped migration.
2. Every new table: `enable row level security`, one select policy, write policies keyed on `auth.uid()` or `service_role`.
3. Append-only ledgers (`axis_events`) get insert and select only. Scores are recomputed by replaying the ledger, never incremented in place.
4. Ghost ids are `text` and legacy (`profiles.ghost_member_id`, `articles.ghost_post_id`). Everything new keys on `uuid` via `profiles.user_id`.
5. Enums for closed sets (`tier`, `axis`); check constraints for ranges (specificity 0..3, graduation_count 0..22, note length 140).
6. `updated_at` via the shared trigger.
7. `supabase db lint`, then `npm run types`, then `npm run typecheck`. Commit `supabase/types.ts` with the migration.
8. If a spec field has no clean mapping, leave it out and list it in the PR; do not invent a column.

RLS policy template:
```sql
alter table public.<t> enable row level security;
create policy "<t> read published" on public.<t> for select using (<public condition>);
create policy "<t> insert own" on public.<t> for insert with check (auth.uid() = <owner_col>);
create policy "<t> update own" on public.<t> for update using (auth.uid() = <owner_col>);
```
