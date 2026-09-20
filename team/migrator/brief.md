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

**The live RLS surface is measured**, not inferred. `scripts/check-env.mjs --rls`
was run against the live project on 2026-09-19 and
`knowledge/2026-live-rls-surface.md` holds the map. Nine tables are closed to the
anonymous key, so `028_pre_launch_security_hardening` did real work. One defect
found: every column on `profiles` is readable without authentication, including
`is_admin`.

## Next three

**Updated 2026-09-20, Mission Zero.** `2026-09-19-001` closed 2026-09-20 on option 1, adopt live,
paired with option 2, branch for staging. The gate item 3 below was written against is cleared. A
migration is now allowed; none was written this session, because Mission Zero's own scope is
answering the exchange, not building. The four migrations below are scoped and unblocked, and are
the actual next work for the first non-Mission-Zero thread:

1. Fix the `profiles` column exposure. Column grants, revoke SELECT from `anon`/`authenticated`
   and grant back an explicit list, `ghost_member_id` first: `2026-09-20-security-02` confirmed
   (reviewer, reading the recovered `/api/comment` handler in full) that it is not just disclosure
   there, it is the entire auth check on a write path. Still the highest-value small migration
   available.
2. The B2 grant-revoke, alongside whichever migration first adds an owner-writes-own-row policy on
   `comments`, `articles` or `aspirations`. Both verbs, INSERT and UPDATE, not UPDATE alone. Must
   land in the same migration as the policy or before it, never after: detail and the reasoning in
   `2026-09-20-security-03-handoff-grants-measured-b2-holds.md` and now in `practices.md`. No
   backlog row owns this yet; recommended into P0-2, pending decider.
3. `classifications.opposing_view_engaged` as the three-value enum, never a boolean, when P0-2's
   rewrite carries the `classifications` table forward from live. Not a decision, a defect; see
   `2026-09-19-002`'s 2026-09-20 appendix.
4. `classifications.model` and `.prompt_version` (backlog A-2), `comments.delta_acknowledged`
   (spec entity 1), and `aspirations.visibility` plus `.research_consent_at` (spec entity 7).
   Write them against live's shape, which is now the settled destination rather than one of three
   options.

Run Part 1 of `p0-2-runbook.md` once Dan has logged in. Steps 1 to 8 are read-only. Two of the
three questions it was written to answer are now answered, so what remains is the authoritative 20
migration names and the **policy text** behind the RLS map, which row counts cannot give. Step 6
is the one that matters.

`2026-09-19-002` (the seven spec deviations) is not fully closed. Item 1 is settled (see above).
Items 2 and 5 are restated as one-sentence questions for Dan in that record's 2026-09-20 appendix.
Item 6 has a recommendation, a `UNIQUE (contributor_id, axis)` constraint on live's `axis_scores`
beside its existing `id`, that does not require picking a side and does not touch a populated
primary key; it still wants Dan's yes.

## Updated 2026-09-20, schema squash session

Dan took item 6 as written and reframed the rest: "there really is almost no real data... what is
the right way to just simplify." That authorized a migration, and this session wrote one, plus
tested the convener's squash recommendation before acting on it rather than assuming it.

**Verdict: squash the intent, not the literal `migration squash` command.** That subcommand only
compresses files already in `supabase/migrations/`, cannot reach live's current schema at all, and
needs the local Docker stack this machine does not have, confirmed against its own `--help` and
the official reference rather than assumed. The real path, and the one this session used:
`db pull --declarative` plus the newly-found `migration fetch --linked` (verbatim historical SQL
from the remote history table's own stored `statements` column, no Docker) for ground truth, a
hand-authored baseline for the file itself, `db lint` to check it, `migration repair` to retire
the 20-row remote history once the baseline is trusted. Full argument, command-by-command, with
sources: `knowledge/2026-schema-squash-runbook.md`. New practice rows filed from it.

**Three files landed in `supabase/migrations/`, none applied anywhere, none run this session (no
mandate to touch the live project, and this session's brief was explicit that it is not the one
that executes):**

- `20260920000000_baseline_live_schema.sql`. All 30 live public tables, read directly from the
  committed `supabase/types.ts` rather than from the 15-table subset
  `2026-live-schema-diff.md` had scoped its comparison to. RLS enabled on every table; `select`
  policies only where `2026-live-rls-surface.md` measured the anon-key behavior (six open, nine
  closed, `quotes` filtered and flagged as a guessed predicate); **no insert, update, or delete
  policy anywhere, on purpose**, matching live's own current safe-by-omission posture and staying
  out of the way of the still-open column-grant fix (Next three, items 1 and 2 below). Every
  column this session could not verify (defaults, check-constraint value lists, a few ambiguous
  foreign keys) is marked `-- LIVE UNVERIFIED:` inline rather than asserted at the same confidence
  as the rest. Not yet diffed against real `migration fetch` output; that diff is the runbook's
  Part 1 Step 9 and Part 2, unstarted, and is what upgrades this file from best-effort to
  confirmed.
- `20260920000100_axis_scores_contributor_axis_unique.sql`. Item 6, executed: `unique (member_id,
  axis)` beside live's own `id`. Column name matches the baseline (`member_id`, not the archived
  repo's `contributor_id`).
- The two September files moved to `supabase/migrations/_archived_2026-09-19/`, not deleted.

**Item 1 needed no separate migration.** The baseline adopts live's `opposing_view_level` enum
directly; writing a second file to "fix" a column the baseline already has correctly would be a
migration with nothing behind it.

**Items 2 and 5 answered in `2026-09-19-002`'s third appendix, not both the same way.** Item 5
(`final_tier` on `classifications`): agreed, argued from the spec's own pairing of `final_tier`
with `resolved_at` and from live's `classifications.comment_id` not being unique, which means
reclassification is modeled as a new row, not an overwrite, and `final_tier` has to travel with
the row that produced it. Item 2 (`stage` against `delta_of`): read
`docs/Dialecta_Delta_Mechanic_Spec.md` in full for the first time this session (prior notes had
only pointed at it); the spec as written today describes exactly one pre-read/post-read pair per
article ("a minimum of 20 completed pairs"), which `stage` implements faithfully and `delta_of`
does not implement at all. That narrows the question, it does not answer it: whether the mechanic
should grow to support more than one revision is a product question about what the Delta mechanic
is for, and this seat routed it to `/dialecta-council` rather than deciding it. Backlog D-3
currently has no `-D` marker flagging it as open; this seat cannot edit `docs/plans/backlog.md` to
add one (outside this session's write scope) and said so in the exchange record instead.

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
