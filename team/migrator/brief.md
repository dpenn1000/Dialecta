# migrator: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/migrator.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/migrator.md` |
| Memory | `team/migrator/practices.md` |
| Knowledge | `team/migrator/knowledge/` |
| Leads | `team/migrator/knowledge/reading-list.md` |
| Runbook | `team/migrator/p0-2-runbook.md` |
| Skills it owns | `/dialecta-migration` |

## Where it is now

Trained, as of 2026-09-19. Eleven practices, up from five. Seven filed notes, up from
zero. The five seeded leads are all filed and five new ones are open.

The three tasks the last brief set are done:

- **The schema diff exists.** `knowledge/2026-live-schema-diff.md` compares all 13
  tables the repo creates against live and against the spec. Verdict on each. The
  two known renames are confirmed (`comment_votes` to `tier_nominations`,
  `opinion_positions` to `opinion_map_positions`) and four findings are new: live
  `axis_events` has **no `delta` column**, so live counts where the spec sums; live
  `aspirations` has **no `visibility`**, which the Growth Engine branches on; live
  `comments` requires four not-null columns the repo lacks; and the repo omits spec
  entities 10 and 11 (`follows`, `sparring_partners`) entirely, both of which are
  live.
- **The migration history is read.** `knowledge/2026-live-migration-history.md`
  reconstructs 19 of the 20 names from the repo's own handoffs and marks the list as
  unverified, because the authoritative list is in the live database. The useful
  findings: live already has a `profiles.is_seed` flag, which is the mechanism
  backlog B-D1 needs; `002_seed_dev_users` means the 14 live profiles are not 14
  real people; `007_archetype_enum_canonical_only` shows this database already paid
  the cost of narrowing an enum once; and `026b` shows the live history followed
  fix-forward, the same rule this repo enforces.
- **P0-2 is a runbook.** `p0-2-runbook.md`, every command checked against CLI 2.117.0.

Two corrections to what the last brief assumed. The enum lead called `tier` the
trap; it is not, the live `tier` enum is identical to the repo's seven values. The
real enum mismatches are `fp_snapshot_reason`, `comment_status` and `archetype_id`.
And the CLI does not need installing: `npx --yes supabase` resolves 2.117.0 on
studio-pc, verified.

P0-2 is still blocked on a decision, not on a login. Two exchange records are open
and both go to `decider`: `2026-09-19-001` asks whether the September migrations
were written knowing live existed, and `2026-09-19-002` asks whether seven repo
deviations from the spec are drift to revert or design to record.

**`2026-09-19-001` now has its answer, appended as evidence on the record.** Dan was
asked and did not remember, and pointed out the work was done on studio-pc. It was.
The scaffold arrived as `dialecta-scaffold.zip` from a Cowork chat, per
`docs/handoffs/dialecta-handoff-2026-09-19-studio-pc.md`, whose install instructions
tell Dan to create `dialecta-staging` and `db push` into it. Root `CLAUDE.md` at
commit `96b26b8` described Supabase as four tables and Live, and the migration
issues `create table` for all four. No session on this machine wrote the SQL, and
the live project was first read at 19:07:49Z on 2026-09-19, 35 minutes after the
scaffold was committed, only because Dan asked for help with the Supabase npx.

So the migrations were written without knowledge of the live schema, which is the
branch the record itself maps to adopting live. The record stays open because
closing it is `decider`'s, and Dan has not confirmed the finding.

Read `docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md` first if you
are new to this. `supabase/types.ts` is generated from the live project and is the
real shape, with the limits set out in
`knowledge/2026-supabase-type-generation-drift.md`.

## Next three

1. Run Part 1 of `p0-2-runbook.md` once Dan has logged in. Steps 1 to 8 are read-only and answer the three things the repo cannot: the real 20 migration names, whether `028_pre_launch_security_hardening` exists, and what the live RLS policies actually are. Append the output to exchange record `2026-09-19-001`.
2. Verify the live RLS policies against the mandate, using whatever step 6 recovers. This is the one invariant in `.claude/agents/migrator.md` that this agent currently cannot check on any database, because `supabase/types.ts` does not carry policies. The `pgTAP` lead in the reading list is the fallback if `db pull --declarative` does not return them.
3. Do NOT write a migration until `2026-09-19-001` closes. When it does, the three smallest migrations are already scoped and are needed under all three options: `classifications.model` and `.prompt_version` (backlog A-2), `comments.delta_acknowledged` (spec entity 1), and `aspirations.visibility` plus `.research_consent_at` (spec entity 7). Write them against whichever schema wins.

## What this agent posts to the exchange

An `advice` record to Dan through `decider` for any spec field that will not map.
That is already its mandate; the exchange is where it goes. `2026-09-19-002` is the
worked example.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

All three met on 2026-09-19.

- Enum and constraint traps are filed with examples:
  `knowledge/2026-postgresql-enum-evolution.md` and
  `knowledge/2026-postgresql-domains-vs-checks.md`.
- Every field in both migrations is either mapped to a spec line or listed as an
  open question: `knowledge/2026-live-schema-diff.md` for the mapping, exchange
  `2026-09-19-002` for the questions.
- P0-2 is a runbook: `p0-2-runbook.md`.

The next bar is narrower. This agent has read a database it has never connected to.
Everything in `knowledge/` about live is inference from a generated types file and
from handoff prose. Done next time means the inferences are checked against the
database itself, and the ones that were wrong are marked wrong.
