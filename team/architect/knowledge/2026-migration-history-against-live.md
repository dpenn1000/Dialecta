# Two of thirty-one live migrations have a matching file in the repository

**Source:** live `supabase_migrations.schema_migrations` on `mguulnibvzusfvyuowwh`, read only,
2026-09-21 at about 04:20 UTC: `version`, `name`, and an md5 of `statements`. `git ls-files
supabase/migrations` on local `main` at `54c0de1`. A filesystem search for every version under
`C:\Dialecta`, worktrees included. The Supabase CLI reference pages for `supabase migration list` and
`supabase db push`, fetched the same night.

**Lead state:** new. Found while answering item 1 of `docs/handoffs/ARCHITECT-THREAD.md`. Bears on lead 8.

## The count

Live holds **31** applied migrations: **20** from 2026-04-29 to 2026-05-07, none of which has a file in
`supabase/migrations/`, and **11** since 2026-09-01. The eleven:

| Live version | Name | File in the repository |
| --- | --- | --- |
| `20260920192954` | `close_ghost_member_id_as_public_credential` | Tracked, same version |
| `20260920193044` | `publish_the_three_existing_comments` | Tracked, same version |
| `20260921004417` | `profile_claim_tokens` | Tracked as `20260920000200` |
| `20260921004459` | `comment_write_identity` | Tracked as `20260920200500` |
| `20260921004527` | `revoke_anon_execute_on_session_scoped_functions` | Tracked as `20260920214500` |
| `20260921012248` | `revoke_anon_execute_on_initialise_contributor_axes` | **None anywhere on disk** |
| `20260921035036` | `articles_author_fk_for_postgrest_embed` | **None anywhere on disk** |
| `20260921035136` | `revert_speculative_articles_author_fk` | **None anywhere on disk** |
| `20260921040353` | `articles_native_content_columns_additive` | Untracked, in another session's working tree |
| `20260921041504` | `articles_content_backfill_from_site_crawl` | Untracked, same |
| `20260921041813` | `articles_author_profile_id_for_public_embed` | Untracked, same |

Two of 31 have a tracked file under the version live recorded.

## Whether the files say what live ran

md5 of each file against md5 of its live `statements`, first byte for byte (raw, then with line
endings normalised and trailing whitespace trimmed), then with `--` comments and all whitespace
removed from both sides:

| File | Byte match | SQL-only match | What differs |
| --- | --- | --- | --- |
| The three untracked files from tonight | Yes | Yes | Nothing. Written, applied verbatim, named by the version live assigned |
| `close_ghost_member_id…`, `publish_the_three…`, `revoke_anon_execute…` | No | Yes | Comments only |
| `profile_claim_tokens` | No | No, 13 characters | An explicit `begin;` and `commit;` in the file, which `apply_migration` does not need |
| `comment_write_identity` | No | No, 281 characters | The same wrapper, plus the `COMMENT ON FUNCTION get_own_profile_for_comment` string: 475 characters in the file, 169 in the database |

So no tracked file changes behaviour against what live ran. One documents a function differently from
the comment the database actually holds.

## Why the versions drifted

`apply_migration` in the Supabase MCP records the version as the timestamp at the moment it applies.
A file named in advance carries a different timestamp from the moment it is applied. The three files
from tonight were named after applying, which is the pattern that works.

## What the CLI would do with this

The reference is specific. `supabase migration list`: "Only the timestamps are compared to identify
any differences." `supabase db push` records each applied migration by timestamp and skips those
already present, and its `--include-all` flag exists to apply migrations "not found on remote history
table".

On a clean checkout of `main` the CLI therefore sees **four local migrations missing from live**,
the three renamed files plus `20260920000000_baseline_live_schema.sql`, and **twenty-nine live
migrations with no local file**. The baseline is written to recreate the whole live schema, and it is
one flag away from being applied to the database it describes. Nothing has run it. The CLI is not on
`PATH`, but `npm run types` calls it through `npx`, and two copies sit in the npx cache under
`%LOCALAPPDATA%\npm-cache\_npx`, so `npx supabase db push --include-all` needs no download. Whether
it could connect depends on a linked project and the database password, which I did not check and
which live in credential files this seat does not read.

## The fix, for `migrator`

1. Rename the three tracked files to the versions live recorded.
2. Recover the three missing migrations verbatim from `schema_migrations.statements`, where live
   keeps the text.
3. Land tonight's three untracked files. They are another session's to commit.
4. Move `20260920000000_baseline_live_schema.sql` out of `supabase/migrations/`. It is a reference
   reconstruction, and in that folder the CLI reads it as pending.
5. Keep `team/architect/checks/migration-history.sql` as the standing check: it lists live versions
   and names for comparison with the file list, and it is what produced this note.

**First move:** step 4. It is one `git mv`, and it removes the only item on this list that can do
damage.

## What I did not do

Rename, recover or move anything; the migration tree is `migrator`'s. I did not compare the 20
April-to-May migrations with the 44 applied migrations under `_recovered/`, which is the other half
of lead 8.

## Implies for

`exchange/open/2026-09-21-architect-04`, to `migrator`, `decider` and the convener. Practice: a
migration file is named after it is applied, from the version live records, and a check compares the
tree with `schema_migrations` by version and by content.

*Filed 2026-09-21*
