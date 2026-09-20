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

---

## Appended 2026-09-20 by migrator

`2026-09-19-001` closed yesterday on option 1, adopt live, paired with option 2, branch for
staging. That resolves the frame this record's seven items sit inside: whichever way items 2, 5
and 6 go, the destination schema is live's, not the September files'. Three things follow from
Dan's partial answer and from the chair's refusal to close this record this morning.

**Item 1 needs no one.** `classifications.opposing_view_engaged` must be the three-value enum,
`yes` / `partially` / `no`, never a boolean. A boolean cannot hold "partially" and the repo's
version silently drops it into one of the other two. This was already the least defensible of the
seven; adopting live settles it further, since live already has the enum
(`opposing_view_level`) and adopting live means we inherit it for free rather than writing a fix.
It is a defect, not a decision. It belongs to P0-2, the row already rewriting the repo's
migrations around live, to carry forward; backlog A-2, the classification job that will actually
populate this column, is the row that must not reintroduce it in code once P0-2 lands the schema.

**Items 2 and 5, restated as one sentence each, for Dan.**

Item 2: should a reader's opinion-map placement be stored as a labeled before-and-after pair per
article (`stage`, what the spec says and what live already does), or as an open-ended chain where
each new placement points back to the one it revises (`delta_of`, what this repo's migration and
backlog D-3 assume)? The pair costs nothing to adopt, since live already has it, and covers
exactly one pre-read and one post-read snapshot; the chain costs a new migration against a live
table and a rewrite of D-3's own description, and buys the ability for a reader to revise a
placement more than once, which nothing currently asks for but which the chain shape would
support.

Item 5: should a comment's resolved tier live on the classification record that produced it
(`classifications.final_tier`, spec and live), or on the comment itself (what this repo's
migration did)? On classifications, each classification attempt keeps its own result, which
matters the day a comment gets reclassified, and it costs nothing to adopt since live already has
it there. On comments, the value is one join closer for any code that only wants "this comment's
tier right now," but a reclassification has to overwrite that single value rather than layering a
new classification row underneath it, and nothing on record says that trade was deliberate.

**Item 6 has an answer that was not in the original three, and it does not need Dan to pick a
side.** Dan asked what the composite key question even is. In plain terms: every table needs
something that tells two rows apart. Most tables here use a plain `id`, a random value with no
meaning beyond "this one row." That is a surrogate key. It guarantees uniqueness by construction
but says nothing about what should be unique in practice, so nothing stops two rows both meaning
"Dan's acuity score" unless something else checks for that. September's migration used
`(contributor_id, axis)` itself as `axis_scores`'s identity instead, a natural or composite key
(composite because it is two columns). That makes a second "Dan's acuity score" row impossible;
the database refuses the insert. The cost is giving up the plain `id` column, and live already has
`id` on this table, so changing the key now is a real migration against populated rows, the kind
`practices.md` already treats as needing care.

**The UNIQUE-constraint option gets both, and does not touch a populated table's primary key.**
Postgres allows exactly one primary key per table but any number of additional `UNIQUE`
constraints. Leave live's `id` exactly as it is, and add:

```sql
alter table axis_scores
  add constraint axis_scores_one_row_per_axis unique (contributor_id, axis);
```

That is the same guarantee the composite key was for (a second row for the same contributor and
axis is refused), it keeps the `id` column live already has, and it changes nothing about
existing rows beyond checking, once, that no contributor already has two rows for the same axis,
which is the expected state of a table that has been replayed correctly. This is a single
additive statement, not a rebuild.

Recommend: keep live's `id` as the primary key on `axis_scores` and add the
`UNIQUE (contributor_id, axis)` constraint beside it. `archetypes` may want the equivalent
(`UNIQUE (contributor_id)`), on the same logic, but only if it is meant to hold one current
archetype per contributor; backlog B-2 says the archetype monitor should "write history," and if
that means more than one archetype row per contributor over time rather than one row updated in
place, the unique constraint would be wrong for that table specifically. That is a one-line
confirmation, not a blocker, and no answer is assumed either way.

What is left for Dan is now three short answers, not seven items' worth of reading: the
one-sentence question on item 2, the one-sentence question on item 5, and whether the
UNIQUE-constraint recommendation on item 6 is adopted as written. Item 1 needs nothing further
from anyone and would be fixed the moment a migration is allowed to ship as part of P0-2, which it
now is; not doing so in this mission because the mission's scope is answering.

---

## Appended 2026-09-20 by migrator, third pass

A migration is now allowed, per this session's brief, and three of this record's items move.
Full reasoning and the files themselves:
`team/migrator/knowledge/2026-schema-squash-runbook.md`,
`supabase/migrations/20260920000000_baseline_live_schema.sql`,
`supabase/migrations/20260920000100_axis_scores_contributor_axis_unique.sql`.

**Item 6 is executed, not just recommended.** The UNIQUE-constraint migration is written:
`unique (member_id, axis)` on `axis_scores`, landing beside live's own `id`, exactly as the prior
appendix proposed and Dan then took as the decision. `archetypes` still gets no equivalent
constraint; the one-line confirmation that appendix asked for (whether the archetype monitor
writing history, per backlog B-2, means more than one archetype row per member over time) is
still not on record.

**Item 1 needed nothing further, and the baseline confirms why: adopting live carries the fix
in, it does not add it.** `opposing_view_level` is one of the nine true Postgres enums the
baseline declares, read directly from `supabase/types.ts`, and
`classifications.opposing_view_engaged` uses it. There is no separate migration for this, and
writing one anyway would be a change with nothing behind it: the baseline already IS live's
shape, and live's shape was never the boolean. A no-op file would violate the same "one migration
per change" rule this record's other items lean on to argue their own cases.

**Item 5, final_tier on classifications: agreed, and it is more than "live already does it this
way."**

The spec pairs `final_tier` with `resolved_at | timestamp | Null until final_tier is confirmed`
in the same entity (2, classifications), and that pairing is the argument, not just the
placement. `resolved_at` is not a fact about a comment; it is a fact about one classification
attempt reaching a conclusion. A comment does not have a single resolved-at moment if it can be
reclassified, and it can: the Classification Pipeline's own step 7 writes
`classifications.final_tier`, and the Axis Score Updater triggers "on community reclassification"
as a named, separate event from first classification. Backlog A-8 is that re-review path, still
Todo.

The baseline's own modeling makes the stakes concrete. `classifications.comment_id` is **not**
unique live, unlike the archived September migration's `unique references comments`. That means
more than one classification row per comment is not just possible, it is how reclassification is
meant to work: each attempt is its own row, with its own `ai_suggested_tier`,
`self_declared_tier`, `resolved_at`, and `final_tier`, all four together. Put `final_tier` on
`comments` instead, and a reclassification has exactly one place to write it: overwriting the
single value in place, which severs it from the classification row that actually produced it and
destroys the record of what it was before. Every question a DM or a contributor might ask later,
"what did this comment's tier used to be, and why did it change", is answerable for free on
`classifications` and unanswerable on `comments` without a change log bolted on beside it.

So yes: `final_tier` belongs on `classifications` because it is the output of a classification,
and specifically because a comment can have more than one of those over its life. The baseline
already carries it there, matching live and the spec both.

**Item 2, stage against delta_of: this is a product question, and I am routing it rather than
deciding it.**

What the Delta mechanic is for determines the schema, not the other way round, and the two shapes
answer different questions. `stage` (pre_read / post_read) says a reader's position is captured
exactly twice per article: once before, once after. `delta_of` (the archived migration's
self-reference to "the earlier placement this revises") says a position can be revised any number
of times, each new placement pointing back at the one before it. Those are different products.
One measures a single moment of reflection; the other tracks an open-ended history of a reader
changing their mind about the same question.

`docs/Dialecta_Delta_Mechanic_Spec.md` (v1.0, April 2026), which I read in full this session and
which `2026-live-schema-diff.md` had only pointed at, not read, is unambiguous about which product
it currently describes: Stage A happens once, at article load. Stage C happens once, at "article
fully read (progress bar complete)." The community aggregate is gated on "a minimum of 20
completed pairs", plural pairs, not a chain of open-ended revisions. There is no mechanism
anywhere in that document for a third placement. Live's `stage` column is a faithful
implementation of the mechanic as specced today. `delta_of` implements something the current spec
does not describe at all.

That finding narrows the question; it does not answer it. The real question is whether the
one-pair model is what the Delta mechanic should stay, or whether letting a reader revise their
position more than once over an article's life is a real product improvement that the spec simply
has not caught up to yet, the same way v1.1 caught up to `follows` and `sparring_partners` after
they were live before they were specced. That is a craft-and-audience question, exactly what
`dialecta-council` exists for ("any feature that touches ... craft, audience, or what the platform
asks of a person"), and it is not this seat's to decide: I write schema from a settled product
answer, I do not settle the product answer myself.

**Recommending, not deciding:** run `/dialecta-council` on this question before D-1 (which D-3
depends on) lands, since the answer changes what `opinion_map_positions` needs to carry going
forward, and changing it after real position data exists is a populated-column migration, not a
free edit. Backlog D-3 currently reads "before/after placement, `delta_of`" with no `-D` marker
flagging it as an open question for Dan; whoever has write access to `docs/plans/backlog.md` (not
this seat, per this session's own write scope) may want to give it one, or fold it into the
existing D-3 row so the council run has a numbered home instead of only this exchange record.

The baseline in `supabase/migrations/20260920000000_baseline_live_schema.sql` carries `stage`
forward as live has it today, correctly, since adopting live means adopting live's current shape.
That is not a resolution of this question, only the default that holds until Council and Dan
settle it. If the answer comes back "revisions, not just a pair," the mechanical path is an
additive `delta_of uuid references opinion_map_positions(id)` column beside `stage`, not a
replacement of it: nothing here forecloses either direction.
