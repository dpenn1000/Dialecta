---
id: 2026-09-21-architect-04
type: handoff
from: architect
to: [migrator, convener]
subject: The migration tree and live history disagree, and tonight's migrations added two more
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Reconciled every live migration with the tracked tree by version and by SQL-only md5 (comments and
whitespace stripped on both sides): `team/architect/checks/migration-history.sql`,
`team/architect/knowledge/2026-migration-history-against-live.md`. Live holds 34: 20 from April and
May with no file here, and 14 since 2026-09-01.

| State | Count | Versions |
| --- | --- | --- |
| Tracked under the live version, same SQL | 5 | `192954`, `193044`, `040353`, `041504`, `041813` |
| Tracked under the live version, **different SQL** | 1 | `043008`, cause not established |
| Tracked under a **different version** | 5 | `000200` is live `004417`; `200500` is `004459`; `214500` is `004527`; `050000` is `043631`; `051000` is `044120` |
| **No file anywhere on disk** | 3 | `012248`, `035036`, `035136` |

Of the five renamed, `044120` also differs in content: live ends with `notify pgrst, 'reload schema';`
and the committed `20260921051000_close_comments_member_email_to_public.sql` does not. Replayed from
the file, the email grant change would not reach PostgREST's cache. The others differ only by an
explicit `begin;`/`commit;` wrapper and, in `004459`, one `COMMENT ON` string.

The unapplied `20260920000000_baseline_live_schema.sql` sits in `supabase/migrations/`, where the CLI
reads it as pending: `migration list` compares "only the timestamps", and `db push --include-all`
applies migrations "not found on remote history table".

### Re-measured after the convener's fixes, backup branch at `c42ebf1`

The convener renamed its three files to their live versions and restored the `notify` line.
Re-measured by version and SQL-only md5, not read from the commit message:

| State | Versions |
| --- | --- |
| Fixed and confirmed | `004527`, `043631`, `044120`: right version, same SQL as live |
| Still under another version | `004417` (file `20260920000200_profile_claim_tokens.sql`), `004459` (file `20260920200500_comment_write_identity.sql`) |
| Still no file anywhere | `012248`, `035036`, `035136` |
| SQL differs from what ran | `043008`, cause not established; **`041504`, new**: commit `de0b9f6` edited the backfill "to survive a db reset" after it had been applied |
| Local only, read as pending | `20260920000000_baseline_live_schema.sql` |

Seven of fourteen now match. The new one is the other half of this drift: a migration edited after it
ran. A change to an applied migration belongs in a new migration, and the file that ran stays as it
ran.

## Not done

In this order: move the baseline out of `supabase/migrations/`; rename the two remaining files;
recover the three missing ones verbatim from `schema_migrations.statements`; reconcile `043008`. Then
run the check after every apply.

`041504` is a ruling, not a cleanup, and the convener is right that my first fix does not work.
`supabase db reset` replays migrations in order, so a later migration cannot soften an earlier one's
self-check: restore the original and the replay fails again. Fidelity to what ran and replay on a
fresh database pull opposite ways, and the cause is upstream. It is a data backfill keyed on live
rows, sitting in the schema path that `db reset` replays. For `migrator` to rule on: keep the edited
file and record the divergence in its header, or move data backfills out of the replayed path
(`supabase/seed.sql` for development, a one-off script for production) and restore the file. The
convener has left it as edited, with a comment saying so.

## Governing spec

None. This is a measurement of a live system.

## Acceptance

`team/architect/checks/migration-history.sql` against `git ls-files supabase/migrations`: every
live version has a file under the same version, with the same SQL-only md5.

## Traps

- `apply_migration` stamps the version at the moment it applies. A hand-picked round number
  (`050000`, `051000`) guarantees a mismatch. Name the file from the version live records.
- A byte mismatch is usually comments. Compare with comments and whitespace stripped before calling
  it drift.

## Do not touch

`supabase/` is held by the articles builder session tonight. Coordinate through the convener.
