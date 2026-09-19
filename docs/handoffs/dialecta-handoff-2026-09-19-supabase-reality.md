# Supabase: the live schema against the planned one

*2026-09-19. Written from a session that was asked to help with `npx supabase` setup for P0-2 and
found that the premise of P0-2 does not hold. No migration was applied and no project was created.*

## What P0-2 assumed

Create `dialecta-staging`, apply `supabase/migrations/20260919000000_foundation.sql`, run
`npm run types`, commit `supabase/types.ts`. The backlog reads as a greenfield setup, and P0-5,
P0-6, P0-7, A-7 and the Phase B rows build on that reading.

## What is actually there

Supabase project `mguulnibvzusfvyuowwh`, in the Pennington Media Group organization, not Trinity
Solar. It holds 32 tables and 20 applied migrations dated 2026-04-29 to 2026-05-07, the last named
`035_growth_engine_schema`. It has rows: 14 profiles, 5 articles, 36 axis scores, 27 axis events,
89 reserved handles, 72 quotes.

The 14 profiles match the 14 Ghost members that P0-6 plans to map. This is the live database.

## The collision

The two migration files in this repo create 13 tables. Ten already exist live, with rows:

| Table | Live rows |
| --- | --- |
| `profiles` | 14 |
| `axis_scores` | 36 |
| `axis_events` | 27 |
| `feed_events` | 6 |
| `articles` | 5 |
| `fp_snapshots` | 4 |
| `archetypes` | 3 |
| `comments` | 3 |
| `classifications` | 3 |
| `aspirations` | 0 |

Two more exist under different names: the repo writes `comment_votes` where the live database has
`tier_nominations`, and `opinion_positions` where it has `opinion_map_positions`. Only
`recommitments` has no live counterpart.

Running `supabase db push` against the live project would collide on those ten. Creating
`dialecta-staging` from these files would produce a schema behind production, and every later item
would be built against the wrong shape.

## What the live database has that this repo does not know about

Twenty one tables with no mention in the migrations or the backlog. Grouped:

- **Relationships:** `follows`, `sparring_partners`
- **Publication:** `quotes`, `opinion_map_positions`, `opinion_map_overrides`
- **Identity:** `reserved_handles` (89 rows), `handle_history`, `self_descriptions`
- **Admin:** `admin_roles`, `admin_capabilities`, `admin_role_capabilities`,
  `profile_admin_roles`, `profile_admin_capability_grants`, `admin_audit_log`
- **Engagement:** `notifications`, `notification_prefs`, `share_events`, `celebration_events`
- **Community classification:** `tier_nominations`
- **Intake:** `feedback_items`

Several carry table comments that read as considered design, including the `tier_nominations`
comment describing itself as "the third leg of the three-input final tier model" and the
`axis_events` comment citing `Dialecta_Axis_Mapping_v1.md` by name. Whoever built this was working
from the same specs the backlog cites.

## What this session did

- Generated `supabase/types.ts` from the live project. It is the real schema, 32 tables. The file
  header says where it came from.
- Repointed `npm run types` at the live project. It previously passed `--local`, which needs a
  local stack in Docker, and Docker is not installed on studio-pc. It also called a bare
  `supabase` binary that is neither a dependency nor on the path, so it would have failed twice.
- Corrected the Supabase row in root `CLAUDE.md`, which described four tables and said Live.

## What this session did not do

- No project was created. The only organization the Supabase MCP connection lists is Trinity
  Solar, and creating a Dialecta project there would put a personal project inside the corporate
  account.
- No migration was applied anywhere.
- `supabase/migrations/` was left alone. Deleting or rewriting those two files is a decision, not
  a cleanup.

## The decision this needs

Not a migration to write. Roughly three shapes, for the council or for Dan directly:

1. **Adopt the live schema.** Pull the 20 applied migrations down as the repo's history, delete
   the two September files, and rewrite P0-2 through P0-7 around what exists. The backlog stops
   describing work that is already done.
2. **Branch from live.** Use Supabase branching or a restored copy as the staging environment, so
   staging starts from production rather than from an empty database.
3. **Keep both and reconcile deliberately.** Treat the September migrations as a target schema and
   write the diff against live as its own migration. The most work, and the only option that makes
   sense if the September design is a deliberate replacement rather than an unaware duplicate.

Which one is right depends on something this session cannot determine: whether the two September
migration files were written knowing the live database existed. If they were, this is a planned
rebuild and option 3 is the path. If they were not, option 1 is.
