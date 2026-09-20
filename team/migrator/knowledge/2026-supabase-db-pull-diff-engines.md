# Supabase db pull declarative mode, and migra against pg-delta

**Source:** `supabase db pull --help` and `supabase db diff --help`, Supabase CLI
**2.117.0**, run locally via `npx --yes supabase` on STUDIO-PC, 2026-09-20. Corroborated
against Supabase CLI PR #6391, "make pg-delta the default diff engine everywhere"
(github.com/supabase/cli/pull/6391), and `djrobstep/migra` repository metadata via the
GitHub API, both fetched 2026-09-20.

**Lead state:** filed. The lead's premise, that `p0-2-runbook.md` step 6 "is read from
help text rather than tested," is now tested. `--declarative` is real and does what the
runbook says.

## Summary

Running the actual `--help` output, not a docs page, against the exact CLI version on
this machine settles the reading list's open question directly.

`db pull --declarative` is confirmed: "Replace the declarative schema tree from the
selected database instead of creating a migration; migration history is not updated."
That is a verbatim match to what `p0-2-runbook.md` claims. The runbook's step 6 is
correct as written and does not need revision.

**migra and pg-delta are not two competing third-party tools to choose between. They
are two diff engines inside one CLI**, selected with `--diff-engine migra` or
`--diff-engine pg-delta` on `db pull`, or `--use-migra` / `--use-pg-delta` on `db diff`.
A third, `--use-pg-schema` (pg-schema-diff), is already marked in the help text itself
as "Deprecated: use the pg-delta engine ... or the default migra engine instead." A
fourth, `--use-pgadmin`, shells out to pgAdmin's diff function.

**migra is still the default for `db diff` on 2.117.0**, per the same deprecation
line's own wording ("the default migra engine"). This is despite upstream
`djrobstep/migra` being marked **DEPRECATED** in its own GitHub description, last
pushed 2025-08-25, 88 open issues, no recent releases. Supabase CLI PR #6391 proposes
flipping the default to pg-delta "everywhere," but a companion docs PR (#49889) was
reverted in September 2026, and the flip is not in the version installed on this
machine. `--strict-coverage` ("Fail when bundled pg-delta finds schema objects it
cannot manage") confirms pg-delta ships bundled inside the CLI already, available today
as an opt-in, not a separate install.

## What this implies for Dialecta

**Run `db diff` and migration-mode `db pull` with `--diff-engine pg-delta` explicit,
never bare.** The bare command silently uses the deprecated engine. This costs nothing
extra to do and removes a dependency on an upstream project with no maintenance
activity in over a year.

**Declarative mode sidesteps the engine choice entirely for the read-only
reconnaissance the runbook needs.** `db pull --declarative` does not name an engine in
its own flag description, and the runbook's use of it for Part 1, step 6 stays the
right call: it never touches migration history regardless of which diff engine backs
it internally.

**If migration-mode `db pull` or `db diff` is ever run against live** (Branch C of the
runbook, reconciliation), pass `--diff-engine pg-delta` and read `--strict-coverage`'s
own warning before trusting a clean diff: it can leave schema objects unmanaged rather
than failing, silently, unless that flag is set.

## Implies for

Practice: "diff engine is named explicitly (`pg-delta`), never left to default, on any
`db diff` or migration-mode `db pull`." Backlog P0-2. `team/migrator/p0-2-runbook.md`
step 6 (confirmed correct, no edit needed). See also
`2026-schema-diff-tool-landscape.md` for engines outside the Supabase CLI.
