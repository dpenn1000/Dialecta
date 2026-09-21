# Thirty-one tables against the standard

**Source:** live project `mguulnibvzusfvyuowwh`, Postgres 17.6, read only, 2026-09-21 between 04:10
and 04:40 UTC. One catalog query per concern, each kept as a file under `team/architect/checks/`:
`table-hygiene.sql`, `identity-columns.sql`, `permissive-deny-policies.sql`. The Supabase database
advisors (the `splinter` lint suite) through the MCP `get_advisors`, performance and security, at
04:19 UTC. `pg_policies` for three policies. The PostgreSQL 17 row security page for how policies
combine.

**Lead state:** new. The first measured baseline of the live schema's organization and hygiene. The
standards it is measured against are in `2026-postgres-table-design-standards.md` and
`2026-append-only-tables-at-scale.md`, filed in the same sprint.

## Clean, measured

A sweep that finds nothing is a result, so these go first. Across 31 tables and 313 columns:

| Check | Result |
| --- | --- |
| `timestamp` without time zone | 0 columns |
| `varchar(n)` or `char(n)` | 0 columns |
| `json` rather than `jsonb` | 0 columns |
| Row level security enabled | 31 of 31 tables |
| Single-column uuid primary keys with a default | 24 of 24, all `gen_random_uuid()` |

The type hygiene that "Don't Do This" asks for is already there. The rest of this note is where it is
not.

## Identity: three keys for one person

Method: every column whose name matches `(^|_)(member|user|author|profile)_id$`, with whether a foreign
key covers it. Blind spot: columns named otherwise, such as `follows`, `sparring_partners`,
`opinion_map_positions.reader_id` and the `*_by` audit columns. `reader_id` turned out to matter, below.

| Key | Type | Referencing columns | Tables | Covered by a foreign key |
| --- | --- | --- | --- | --- |
| Ghost member id | `text` | 18, plus `profiles.ghost_member_id` itself | 16 | **4 of 18** |
| Profile id | `uuid` | 6 | 6 | 6 of 6 |
| Auth user id | `uuid` | 2 | 2 | 2 of 2 |

The uuid columns are fully enforced. The Ghost-keyed columns mostly are not: `axis_scores`,
`archetypes`, `axis_events`, `comments`, `feed_events` (two columns), `notifications` (two),
`share_events`, `celebration_events`, `tier_nominations`, `notification_prefs`,
`feedback_items.reporter_member_id` and `profiles.gifted_by_member_id` can each hold an id no member
has. The four that are covered: `articles.author_member_id` (added tonight), `aspirations`,
`fp_snapshots`, `self_descriptions`.

**The key itself holds three shapes.** Of 14 `profiles.ghost_member_id` values, 3 are 24-character hex
(the shape of a Ghost member id), 8 are uuid-shaped, and 3 are neither. Any join against a Ghost
export has to know which Ghost field each row came from.

**A policy already depends on the wrong one.** `opinion_map_positions.opinion_map_self_read` compares
`reader_id` with the JWT `sub`. All 9 rows, from 3 readers, hold values that match
`profiles.ghost_member_id`; none matches an `auth.users` id. Under Supabase Auth, which ADR-002
adopted, `sub` is the auth user id, so a signed-in reader can read none of the existing rows through
this policy. It works only for a token whose `sub` is a Ghost member id.

ADR-001 leaves Ghost. Sixteen tables key their rows on the id Ghost issued, and the identity question
`2026-09-21-convener-03` raised for `articles` is the same question for all sixteen. Tonight's
`articles.author_profile_id` is the first table to move to the profile uuid, the direction the six
enforced uuid columns already take.

## Integrity and indexes

**12 foreign keys have no index leading with their columns**, by my query. The advisor's
`unindexed_foreign_keys` lint reports 12 too, and the two agree table by table:
`admin_role_capabilities` 1, `aspirations` 1, `feedback_items` 3, `profile_admin_capability_grants` 2,
`profile_admin_roles` 1, `profile_claim_tokens` 2, `profiles` 1, `reserved_handles` 1. Every one sits
on a table of 17 rows or fewer, so all twelve cost nothing to add now.

## Policies

- **Nineteen permissive `USING (false)` policies, and they are markers, not controls.** First read as
  one defect on `handle_history`; `checks/permissive-deny-policies.sql` then found nineteen, on
  eighteen tables, most named `*_service_only`. Migration `028_pre_launch_security_hardening`
  (`_recovered/supabase/migrations/`, lines 10 to 45) added them on purpose as "service-role-only
  markers", which clears the advisor's `rls_enabled_no_policy` lint, and 029, 030 and 035 kept the
  convention. Postgres combines permissive policies "using OR", so a false branch grants nothing and
  removes nothing: each marker leaves access exactly where default deny already puts it. Nothing is
  exposed. The finding is the name. `service_only` and `handle_history_no_writes` read as enforced,
  and a later permissive grant on the same table would override them without a word. `AS RESTRICTIVE`
  makes the name true, and it is a convention decision for `security` rather than a fix.
  `handle_history_no_writes` is also what trips the advisor's `multiple_permissive_policies` warning on
  that table.
- **`comments` has two permissive SELECT policies for `authenticated`**, published rows or your own.
  OR is the intended meaning, the cost is per-row evaluation at scale, and merging them clears the
  warning. Low priority.
- **`opinion_map_self_read` calls `current_setting()` per row**, the advisor's `auth_rls_initplan`
  warning. The subselect wrap is a text change, and it belongs with the identity rewrite above rather
  than before it.

## Documentation

Six of 31 tables carry no `COMMENT ON TABLE`: `archetypes`, `articles`, `axis_scores`,
`classifications`, `comments` and `profiles`, the six the product is built around. 243 of 313 columns
carry no column comment.

## The advisors, as a baseline

| Lint | Level | Count | Verdict |
| --- | --- | --- | --- |
| `unindexed_foreign_keys` | INFO | 12 | Fix, free now |
| `auth_rls_initplan` | WARN | 1 | Fix with the identity rewrite |
| `multiple_permissive_policies` | WARN | 2 | `handle_history` is the no-op policy; `comments` is low priority |
| `unused_index` | INFO | 40 | **Do nothing.** With 3 comments and 5 articles the planner scans every table, so an index with no scans says nothing about need. Re-measure after launch |
| `auth_db_connections_absolute` | INFO | 1 | Auth capped at 10 connections. A setting for scale, `security`'s and Dan's |
| `rls_enabled_no_policy` | INFO | 1 | `profile_claim_tokens`, closed on purpose per its own table comment |
| `authenticated_security_definer_function_executable` | WARN | 3 | `claim_profile`, `current_ghost_member_id`, `get_own_profile_for_comment`, granted to `authenticated` on purpose by their migrations |

The advisor does not report the invoker function `anon` can still execute; see
`2026-live-forming-three-against-one.md`.

## Ranked

1. **The identity decision**, for `decider`: one key for a person across sixteen tables, and what the
   Ghost-keyed columns become. First, because every table built before it is settled adds another
   Ghost-keyed column, and `opinion_map_self_read` shows the cost already arriving.
2. **Move the baseline out of `supabase/migrations/`**, for `migrator`: see
   `2026-migration-history-against-live.md`.
3. **Settle "forming"**, for `decider`: see `2026-live-forming-three-against-one.md`.
4. **One free migration**, for `migrator`: the 12 foreign key indexes, `tier_nominations.target_tier`
   retyped to the `tier` enum, one of `'x'` or `'twitter'` dropped from `share_events`, and
   `handle_history_no_writes` dropped or made restrictive. Zero or near-zero rows behind every item.
5. **`COMMENT ON` the six core tables**, for `migrator`, from the spec entities that define them.

## What I did not do

Change anything. I did not read row contents beyond the counts and formats above, and I did not
census the columns the identity regex misses.

## Implies for

`exchange/open/2026-09-21-architect-05`. Practices: identify a column by its values as well as its
name; judge an `unused_index` finding against traffic, never alone.

*Filed 2026-09-21*
