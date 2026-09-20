# The live migration names, read as a design history

**Sources read:** every mention of a numbered migration filename across
`docs/handoffs/` and `docs/Dialecta_Project_Index.md`, plus root `CLAUDE.md` and
`docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md`. Compiled
2026-09-19.

**Status of the list: reconstructed, not authoritative.** The live project reports
20 applied migrations. This note recovers 19 distinct names from the repo's own
handoffs, and `team/migrator/brief.md` supplies a twentieth,
`028_pre_launch_security_hardening`, which appears nowhere in `docs/`. The two sets
line up at 20 by arithmetic, and that is not the same as verifying they are the same
20. The handoff dates the applied migrations 2026-04-29 to 2026-05-07 while four of
the names below are attested as applied on 2026-04-27, so at least the date range
and this list disagree.

The authoritative list is `supabase_migrations.schema_migrations` in the live
project. Reading it needs `supabase db pull` or a catalog query, neither of which
this session was permitted to run.

**The SQL text is not on this machine.** These files live in
`C:\dialecta-api\supabase\migrations`, and root `CLAUDE.md` records that
`C:\dialecta-api` is not present on studio-pc. Only the names and the handoff prose
about them survive here.

## The reconstructed list

| Name | Attested in | What it did |
| --- | --- | --- |
| `000_baseline_documentation` | handoff 2026-04-27 | Comment-only marker for pre-existing `profiles`, `comments`, `classifications` |
| `001_v1_1_schema` | handoff 2026-04-27, coherence audit | Additive: `feed_events`, `follows`, `sparring_partners`, `opinion_map_positions`, 2 column adds, archetype enum expansion |
| `002_seed_dev_users` | handoff 2026-04-27 | Seeds Maya, Wen, Anselm plus 18 `axis_scores` and 3 archetype rows |
| `004_seed_relationships` | feed architecture handoff | Seeds Dan against Maya, Anselm, Wen |
| `007_archetype_enum_canonical_only` | handoff 2026-04-27 evening | Narrowed the archetype enum to canonical values |
| `010_pact_agreement` | evening rollup | Pact agreement columns on `profiles` |
| `011_comment_malleability` | engines build | `comments.hardened_at not null default (now() + interval '1 hour')`, plus index |
| `012_classifications_full_schema` | engines build | Stage A fields on `classifications`, plus a partial index for the reclassification queue |
| `014_pact_signed_name` | evening rollup | `profiles.pact_signed_name` |
| `020_comments_parent_id` | project index | One-level threading; replies of replies normalize to the top-level ancestor |
| `022_opinion_map_overrides` | project index | `opinion_map_overrides` |
| `023_comments_mentions` | project index | `comments.mentions jsonb` |
| `024_opinion_map_positions_multi` | project index | More than one map per article |
| `025_tier_nominations` | project index | The third input to `final_tier`, shipped 2026-04-30 |
| `026_signature_font` | project index | `profiles.signature_font`, nine hand-script faces |
| `026b_signature_font_default_fix` | project index | Fix-forward on 026 |
| `027_aspirational_archetype` | project index | First Growth Layer feature in production, 2026-05-01 |
| `028_pre_launch_security_hardening` | `team/migrator/brief.md` only | Not described anywhere in `docs/` |
| `033_celebration_events` | share architecture | Append-only event log, 7 event types, service-role RLS |
| `035_growth_engine_schema` | root `CLAUDE.md`, handoff | The last applied migration |

Gaps in the numbering: 003, 005, 006, 008, 009, 013, 015 to 019, 021, 029 to 032,
034. Sixteen numbers unaccounted for against a highest number of 035 and a reported
count of 20 applied. Either those numbers were written and never applied, or they
were never written, or they were applied and no handoff mentions them. The repo
cannot distinguish these.

## What the names imply about the live design

**Five things, in descending order of how much they should weigh on the P0-2
decision.**

### 1. Whoever built this followed the same rule this repo enforces

`026b_signature_font_default_fix` is the evidence. A bad default in `026` was
corrected by a new numbered file with a letter suffix rather than by editing `026`.
That is fix-forward, which is the first rule in both `.claude/agents/migrator.md`
and `supabase/CLAUDE.md`. The live history was maintained by someone working to the
same discipline, which raises the cost of discarding it.

### 2. The live database contains seeded personas mixed with real rows, and live already has the column to mark them

`002_seed_dev_users` inserts Maya, Wen and Anselm. `004_seed_relationships` wires
them to Dan. Both are recorded as applied to production, not to a local stack.

So the live count of 14 profiles is not 14 real people. The handoff treats the 14
live profiles matching the 14 Ghost members as the proof that this is the live
database, and that inference still holds, but any migration or script that assumes
every profile is a person is wrong.

Two backlog rows already circle this without knowing the live shape: B-5
("Community page: real members only, archetype filter, no seeded personas") and
B-D1 ("Dan: retire or label the seeded personas (Okafor, Reiss, Zhao)"). Note the
names do not match: the handoffs say Maya, Wen and Anselm; the backlog says Okafor,
Reiss and Zhao. Either there are two sets of seeds or one set was renamed.

The useful finding: **live `profiles` already has an `is_seed` boolean**, per
`supabase/types.ts`. The mechanism B-D1 needs exists. B-D1 is a labelling decision,
not a schema change.

### 3. The live project hit the enum problem in its first week and solved it by narrowing

`001_v1_1_schema` expanded the archetype enum. Six migrations later
`007_archetype_enum_canonical_only` narrowed it back to canonical values. Narrowing
an enum is the operation Postgres does not support directly, per
`2026-postgresql-enum-evolution.md`, so `007` had to recreate the type or rewrite
the columns. Somebody paid that cost once already, in April, on this database.

This is the strongest available argument for treating the live enum lists as
expensive to change and the repo's text-plus-check columns as cheap.

### 4. `028_pre_launch_security_hardening` is the one name that matters most and the one with no description

The name says RLS and grants were reviewed deliberately before launch. If so, live
RLS is not absent and may be stricter than the repo's, and the migrator mandate's
central invariant is probably satisfied live in some form. None of that is verified:
`types.ts` cannot show policies, the SQL is on a machine that is not here, and no
handoff in `docs/` mentions this migration at all. It is the highest-value unknown
in the live schema and the first thing a `db pull` should be read for.

### 5. The names describe features the backlog still lists as Todo

`025_tier_nominations` is backlog A-7. `027_aspirational_archetype` is Growth Layer
work the backlog puts in Phase D. `020_comments_parent_id` is threading. `033` is
share and celebration events, which the backlog does not mention. `035` is named
`growth_engine_schema`, and the Growth Engine is a pipeline in
`docs/Dialecta_Data_Architecture.md` that the backlog schedules for week 11 and
later.

The backlog is ordered as though none of this exists. This is the concrete form of
what the handoff means by "the backlog stops describing work that is already done".
A count of how many backlog rows are affected is a decider question, not a migrator
one, and it is larger than the six rows P0-2 through P0-7.

## The detail worth reading twice

`000_baseline_documentation` is a comment-only file, and the handoff records the
TODO at the top of it: "back-fill authoritative DDL via Supabase CLI `db pull`
someday."

The gap this session is documenting was recorded as a known gap in April 2026, by
the person who created it, with the exact command that would close it. It was never
run. Five months later the same missing `db pull` is what makes the P0-2 decision
hard.

## Implies for

Exchange records 2026-09-19-001 and 2026-09-19-002. `team/migrator/p0-2-runbook.md`,
step 5. Backlog B-5 and B-D1 (`profiles.is_seed` exists). Practice: read the remote
migration history before writing against a database the repo did not create.
