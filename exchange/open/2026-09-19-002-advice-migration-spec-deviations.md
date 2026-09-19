---
id: 2026-09-19-002
type: advice
from: migrator
to: [decider]
subject: Seven repo deviations from Data Architecture v1.2: drift to revert, or design to record
backlog: P0-2
state: open
opened: 2026-09-19
closed:
outcome:
---

## Question

Root `CLAUDE.md` locks the rule "the spec wins. Surface drift, propose a code fix,
do not amend the spec silently." The two migrations in `supabase/migrations/`
deviate from `docs/Dialecta_Data_Architecture.md` v1.2 in seven places. Applied
literally, the rule says revert all seven.

Does it? Or are some of these deliberate design that should amend the spec instead,
with the migrations left alone?

I am asking about the rule applied to this list, not about each field one at a time.
If the answer is that they need deciding individually, that is a different shape of
record and I will open one per field.

## What I already checked

Full comparison in `team/migrator/knowledge/2026-live-schema-diff.md`, which reads
both migrations against the spec and against the live schema in `supabase/types.ts`.
The seven, in descending order of what they cost:

**1. `classifications.opposing_view_engaged` is a boolean and the spec says enum.**
Spec entity 2: `opposing_view_engaged | enum | yes / partially / no`. The migration
declares `boolean not null default false`, which cannot represent "partially" and
folds it into one of the other two. The live database has the three-value enum.
This is the only one of the seven where the repo destroys information the spec asks
for, and where classification output would be silently lossy.

**2. `opinion_positions` drops `stage` and substitutes `delta_of`.** Spec entity 12
requires `stage` (pre_read / post_read) and says the table "Captures both the Stage
A pre-read snapshot and the Stage C post-read snapshot of the Delta mechanic flow".
The migration has no `stage`; it has `delta_of`, a self-reference to the earlier
placement being revised. That is a chain of revisions rather than a labelled pair.
Live has `stage` and matches the spec. Backlog D-3 is already written against the
repo's model ("before/after placement, `delta_of`"), so this deviation has been
absorbed into the plan.

**3. `feed_events.event_type` is missing five values the spec lists.** Spec v1.1
expanded the enum to twelve and the changelog names the additions. The migration's
check constraint has seven and omits `sparring_partner_archetype_shift`,
`new_reader`, `correspondent_established`, `source_milestone` and
`delta_acknowledged_published`. Four of the five are relationship events, which
connects to item 7.

**4. `comments` is missing `delta_acknowledged`.** Spec entity 1 lists it; live has
it. A plain omission as far as I can tell, with no compensating field.

**5. `final_tier` moved from `classifications` to `comments`.** The spec puts it on
`classifications` (entity 2) and live agrees with the spec. The repo's
`classifications` has `ai_suggested_tier` and `self_declared_tier` but no
`final_tier`. Nothing in the repo records the reason, and the resolution logic in
`packages/core` is the thing that would care.

**6. `axis_scores` and `archetypes` drop the spec's `id` primary key.** Both spec
entities list `id uuid`. The migration uses `(contributor_id, axis)` and
`contributor_id` respectively as natural keys. Live keeps `id` on both. This one
looks like a considered simplification rather than an oversight, which is why it is
in the list rather than fixed.

**7. Spec entities 10 and 11 are not implemented at all.** `follows` and
`sparring_partners` are numbered entities in v1.2 and exist live with nearly the
spec's columns. Neither migration mentions them, and the `feed_events` comment in
the migration asserts "Followers are not modelled yet", which is true of the repo
and false of the database.

### Separately: repo fields with no spec line

The mandate says not to invent a mapping. These exist in the migrations and have no
counterpart anywhere in v1.2, so I am flagging rather than mapping them. I am not
asking about them in this record.

- `classifications.model` and `classifications.prompt_version`. Required by backlog
  A-2, absent from the spec, absent from live. Probably right and probably needs a
  spec line.
- `axis_scores.raw_total`. The spec's `axis_scores` has no accumulator. Live has
  `comment_count` instead, which is a different model, and the spec settles neither.
- `articles` entirely. The spec has no `articles` entity; Ghost owned articles in
  Phase 1. ADR-003 authorizes the native editor, so `body_json`, `body_html`,
  `status`, `declared_claims`, `suggested_axes` and `amend_until` have an ADR behind
  them but no Data Architecture entity.
- `profiles` entirely, for the same reason. No spec entity exists for it.
- `comment_votes.target_tier`, `.reason` and `.note`. Spec entity 9 lists only `id`,
  `comment_id`, `voter_id`, `vote_type` and `created_at`.
- `opinion_positions` map types `radar` and `barycentric`. Spec lists cartesian and
  ternary.
- `fp_snapshots.reason` value `manual`. Not in the spec's five, not in live's five.

## Why I am stuck

The rule in root `CLAUDE.md` is locked and unambiguous, and following it mechanically
would be wrong for at least two of the seven.

Item 6 (dropping `id`) is a better schema than the spec describes. A composite key
on `(contributor_id, axis)` enforces the one-row-per-contributor-per-axis invariant
that the spec states in prose and cannot enforce with a surrogate key. Reverting it
would add a column and remove a guarantee.

Item 2 (`stage` against `delta_of`) has already propagated. Backlog D-3 is written
against `delta_of`. Reverting the migration means rewriting a backlog row and
re-deciding the Delta mechanic's data model, which is a product decision wearing a
schema costume.

Meanwhile item 1 is not defensible on any reading. A boolean cannot hold three
values, the spec and the live database both say three, and the classification
pipeline would quietly lose the middle one.

So the seven are not one kind of thing, and I cannot tell from the repo which kind
each is. What separates "deliberate improvement" from "drift" here is authorial
intent, and nothing on disk records it. The same unknown sits under
`2026-09-19-001`: whether the September migrations were written with knowledge of
the live database. If they were written blind, items 2 and 6 are likelier to be
accidents that happen to look clever. If they were written deliberately, they are
design and the spec is behind.

That is why this record goes to `decider` rather than `spec-reader`. `spec-reader`
can confirm what the spec says, and I have already read it. The question is what to
do when the spec is possibly the thing that is out of date, and amending a spec is
Dan's.

**What I am doing while this is open.** Not writing migrations. The diff, the
migration history note and `team/migrator/p0-2-runbook.md` are filed and do not
depend on the answer. Item 1 is the one I would fix first whichever way the rest
goes, because live and the spec already agree with each other against the repo.

---

## Appended 2026-09-19 by migrator

Evidence filed on `2026-09-19-001` bears on this record and narrows it, without
closing it.

The scaffold containing both migrations was authored in a Cowork session and
delivered to studio-pc as `dialecta-scaffold.zip`, per
`docs/handoffs/dialecta-handoff-2026-09-19-studio-pc.md`. That author had no access
to the live database, had a stale four-table summary of it in root `CLAUDE.md`, and
instructed Dan to `db push` the result into a new project. The whole foundation,
439 lines across 13 tables, was produced in one pass from the spec.

That changes the odds on the seven, though not uniformly.

**Four now read as drift rather than design**, and I would fix them without further
instruction if the rest were settled:

- Item 1, `classifications.opposing_view_engaged` as a boolean. Already indefensible;
  now also unlikely to have been a choice.
- Item 3, `feed_events.event_type` missing five values. The five were added in spec
  v1.1 and listed in its changelog. Missing them looks like reading the entity table
  and not the changelog.
- Item 4, `comments.delta_acknowledged` missing. Same cause, same section of the
  spec.
- Item 7, `follows` and `sparring_partners` unimplemented. Both are numbered spec
  entities added in v1.1. The pattern across items 3, 4 and 7 is one author missing
  the same v1.1 additions, which is a single oversight with three symptoms rather
  than three decisions.

**Three still need Dan**, and the new evidence does not touch them:

- Item 2, `stage` against `delta_of`. Backlog D-3 is written against `delta_of`, so
  reverting it is a product decision whoever wrote it.
- Item 5, `final_tier` moved to `comments`. Still unexplained either way.
- Item 6, the dropped `id` on `axis_scores` and `archetypes`. Still a better key
  than the spec describes, regardless of how it got there.

The question at the top of this record stands as asked. The answer is now more
likely to be "revert the first four, decide the last three" than a single rule
applied to all seven.
