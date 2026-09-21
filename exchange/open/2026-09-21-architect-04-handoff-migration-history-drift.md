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

## Not done

The fixes, in this order: move the baseline out of `supabase/migrations/`; rename the five files to
the versions live recorded; recover the three missing files verbatim from `schema_migrations.statements`;
reconcile `043008` and the missing `notify` in `051000`; then run the check after every apply.

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
