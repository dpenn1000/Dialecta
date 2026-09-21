# architect: checks

The seat's instruments for the database. Each file is one read-only query against `pg_catalog` or
`supabase_migrations`, headed with the finding that justifies it. In the terms of
`knowledge/2026-architectural-fitness-functions.md`, each is an atomic, triggered fitness function
today: run by hand before a review or after a migration. The goal is to make them continual.

Run them through a read-only connection only. The target shape is the project-scoped, read-only
Supabase MCP described in `docs/handoffs/dialecta-handoff-2026-09-21-architect-access.md`. Until
that exists, the connector in a lead session runs them, and every one of them is a `select`.

## The eight

| File | Holds this true | Baseline, 2026-09-21 | Correct result |
| --- | --- | --- | --- |
| `anon-execute.sql` | No function in `public` is executable by `anon` unless someone decided it should be | First run: 4 (`initialise_contributor_axes` through PUBLIC, 3 trigger functions). After `20260921050000`: 3 trigger functions, left open on purpose and recorded | Empty, or every row justified in writing |
| `migration-history.sql` | Every live migration has a tracked file under the same version, and the file says what ran | First run: 2 of 31 matched by version; 3 renamed; 3 with no file anywhere; the unapplied baseline read as pending by the CLI. Re-run two hours later: 34 live, 2 more renamed, 2 files whose SQL differs from what ran | Every version matches, and `md5_sql_only` matches the file |
| `enum-labels.sql` | Every enum the code restates matches the catalog | 10 enums; all 10 match `Constants` in `supabase/types.ts`; 5 restated by hand in `packages/core` | Equal sets, held by a test in `packages/core` |
| `check-value-lists.sql` | Value lists held in CHECK constraints change only on purpose | 20 lists on 11 tables; one restates the `tier` enum; one carries `'x'` and `'twitter'` for one channel | No diff against the committed snapshot |
| `identity-columns.sql` | A column that names a person is typed and enforced one way | Ghost member id as text in 18 referencing columns, 4 with a foreign key; 8 uuid columns, all 8 with one | One key, every reference enforced |
| `table-hygiene.sql` | Types, keys, row security, foreign key indexes and documentation meet the standard | 0 legacy types; RLS on 31 of 31; 12 foreign keys without a leading index (the advisor agrees, table by table); 6 core tables with no table comment | No unindexed foreign key; every table commented |
| `permissive-deny-policies.sql` | A policy's name matches what it does | 19 permissive `USING (false)` markers from migration 028; 1 per-row `current_setting()` call | Markers declared as markers or made restrictive; no per-row auth call |
| `redundant-indexes.sql` | No index duplicates another | 9 redundant, 3 of them exact duplicates of a unique index. The advisors reported none | Empty |

## Rules for using them

- **Re-run after every fix, with the check, not by reading the migration.** The first revoke on
  `initialise_contributor_axes` read as closed in its own migration text and in two documents.
  `anon-execute.sql` found it open. After the second migration it confirmed the close.
- **A check that has never run is a hypothesis.** Every file here ran against live on 2026-09-21,
  and `permissive-deny-policies.sql` changed a finding on its first run: one defect became nineteen
  deliberate markers.
- **Quote the date with the number.** The database moved four times in the hours these were written.
