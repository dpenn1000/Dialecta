# Migrator training, the env files, and the live RLS surface

*2026-09-19, branch `claude/vigorous-pike-a8b098`. A migrator training session that
answered the open Supabase question and measured what the live database actually
exposes. No migration was written. Nothing was written to the live database.*

## The headline

**Exchange record `2026-09-19-001` has its answer.** The two September migrations
were written **without knowledge of the live database**. Evidence below. On that
record's own logic, the repo should adopt the live schema and P0-2 through P0-7 need
rewriting around what exists.

**One security defect found.** Every column on live `profiles` is readable by an
unauthenticated visitor, including `is_admin`, `subscription_tier`,
`pact_signed_name`, `order_negotiation_log` and `ghost_member_id`.

## How the question got answered

Dan was asked whether the September migrations were written knowing the live project
existed. He did not remember, and pointed out the work was done on studio-pc, so
there should be a record. There was.

1. **The scaffold arrived as a zip from a Cowork chat.**
   `dialecta-handoff-2026-09-19-studio-pc.md` opens by telling Dan to download
   `dialecta-scaffold.zip`. The author was a Cowork session with no access to the
   live project.
2. **That same handoff tells Dan to `db push` into a new project**: "create the
   `dialecta-staging` Supabase project and run `npx supabase link` and `db push`".
   Nobody aware of 32 live tables writes that instruction. This is the strongest
   evidence and it is in the repo rather than in a transcript.
3. **Root `CLAUDE.md` at commit `96b26b8` said Supabase was Live with four tables**
   (`profiles`, comments, classifications, votes). The foundation migration issues
   `create table` for all four. The author had a stale summary and did not verify it.
4. **No session on studio-pc wrote the SQL.** Thirteen session histories under
   `~/.claude/file-history/` and none contains the migration. The file was already on
   disk when the studio-pc session opened.
5. **The live project was first read 35 minutes after the scaffold was committed.**
   Session `995db9f2` committed the scaffold at 18:34:58Z. The string
   `mguulnibvzusfvyuowwh` first appears at 19:07:49Z, after Dan asked "Help me with
   the Supabase npx" at 19:05:28Z. Discovery needed the Chrome dashboard, because the
   Supabase MCP connection lists only Trinity Solar.

The record stays open, because closing it belongs to `decider` and Dan has not
confirmed the finding.

## What the live database exposes

Measured with `scripts/check-env.mjs --rls`, read-only, counts and statuses only.
Full map in `team/migrator/knowledge/2026-live-rls-surface.md`.

**Closed to the anonymous key**, nine tables: `comments` 0 of 3, `classifications`
0 of 3, `axis_events` 0 of 27, `reserved_handles` 0 of 89, `notifications` 0 of 6,
`admin_roles` 0 of 4, `fp_snapshots` 0 of 4, `share_events` 0 of 7, and `quotes`
filtered to 70 of 72.

**Fully public**, six tables: `profiles` 14, `articles` 5, `axis_scores` 36,
`archetypes` 3, `feed_events` 6, `follows` 14.

So `028_pre_launch_security_hardening` did real work. Combined with the fix-forward
discipline visible in the migration names (`026b` patched `026` rather than editing
it), the live database was built by someone working carefully. That raises the cost
of discarding it.

## The defect

RLS is row-level. All 14 profile rows are public, so every column on them is public
too, unless column grants narrow them. None do. Five columns were probed and all
five are readable without authentication. Live `profiles` carries roughly 30 columns
past the repo's version, so the real list is longer than the five confirmed.

The fix is column grants or a public-profile view. Both are migrations, so both wait
on `2026-09-19-001`.

## Two consequences for the backlog

**A-5 renders empty for logged-out visitors.** The public comment thread reads
`comments`, and anon sees zero of three rows. The repo's migration intends published
comments to be publicly readable. Live disagrees. Whether the three rows are simply
unpublished, or the policy excludes anon entirely, needs the policy text rather than
row counts.

**The repo and live disagree on `axis_events` as well.** The repo declares
`create policy "axis events are public to read" using (true)`. Live returns 0 of 27
to anon. Opposite intentions on the same table.

## The environment on studio-pc

Three credentials verified against the live services, not merely present in a file:

| Variable | File | Verified |
| --- | --- | --- |
| `SUPABASE_URL` | `C:\Dialecta\.env` | correct project |
| `SUPABASE_SERVICE_KEY` | `C:\Dialecta\.env` | HTTP 200 |
| `ANTHROPIC_API_KEY` | `C:\Dialecta\.env` | HTTP 200 |
| `NEXT_PUBLIC_SUPABASE_URL` | `C:\Dialecta\apps\web\.env.local` | correct project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `C:\Dialecta\apps\web\.env.local` | working |
| `CLAUDE_CODE_OAUTH_TOKEN` | User environment variable | set, untested |

Notes for whoever picks this up:

- **The Supabase CLI does not need installing.** `npx --yes supabase` resolves
  2.117.0 on studio-pc.
- **`apps/web` reads `apps/web/.env.local`, not the repo root.** Next resolves env
  files from the directory holding `next.config.ts`. A key in `C:\Dialecta\.env.local`
  is invisible to the app, which reads as a broken key and is not one.
- **Nothing in this repo reads a `VERCEL_*` variable.** A Vercel token in `.env` is
  inert.
- `C:\Dialecta\.env` still carries a duplicate empty `ANTHROPIC_API_KEY` on line 2
  ahead of the working one. `scripts/check-env.mjs` warns about it on every run.

## Traps

- **Do not test an anon key against `/rest/v1/`.** The introspection root rejects
  publishable keys with a 401 even when the key is good. Probe a real table instead.
  An earlier version of the check script got this wrong and reported a working key as
  rejected.
- **`supabase db pull` in migration mode is not read-only.** The CLI help for 2.117.0
  says it "may record them in that database's migration history". Use
  `--declarative`, which the same help says does not create migrations or update
  history.
- **`supabase/types.ts` cannot distinguish `text` from `uuid`.** The generator maps
  both to `string`, so the file cannot settle the Phase 1 against Phase 2 identity
  question. It also carries no RLS policies, check constraints, indexes or defaults.

## Do not touch

- `supabase/migrations/`. Unchanged by this session, on purpose. Deleting or
  rewriting those two files is the decision in `2026-09-19-001`, not a cleanup.
- The live database. Nothing was written to it and nothing should be until that
  record closes.

## What is filed

- `team/migrator/`: seven knowledge notes, eleven practices, a refreshed brief, and
  `p0-2-runbook.md` with every command checked against CLI 2.117.0.
- `exchange/open/2026-09-19-001`: the forensic answer and the RLS measurement,
  appended as corrections. Still open.
- `exchange/open/2026-09-19-002`: seven repo deviations from Data Architecture v1.2,
  asking `decider` which are drift and which are design.
- `scripts/check-env.mjs`: the diagnostic, plus a narrow Bash allow rule in
  `.claude/settings.json` scoped to its two invocations.

## Next

1. Close `2026-09-19-001`. Everything downstream waits on it.
2. Fix the `profiles` column exposure as the first migration after it closes.
3. Run Part 1 of `team/migrator/p0-2-runbook.md`, which is read-only, for the
   authoritative migration names and the RLS policy text.
