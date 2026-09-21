# Identity key, forming, and the downstream runner

*Framed by the convener 2026-09-21 for three decisions the architect seat routed to the chair in
`team/architect/architecture/2026-09-21-rebuild-map.md`, "Decisions this needs", and in
`exchange/open/2026-09-21-architect-03` to `-08`. The seat's direct message to the chair expired
undelivered, so the three reach the chair through this log. Protocol:
`.claude/skills/dialecta-council/SKILL.md`. Chaired by `decider`. Dan is asleep and has asked for no
questions tonight: the chair rules where the ruling is its own and leaves a clean decision where it
is his.*

## Question

1. **The identity key.** Should every reference to a person key on `profiles.id` under a foreign
   key, with Ghost ids kept as attributes on `profiles` and a stable `current_profile_id()`
   resolving `auth.uid()` for policies, where ADR-002 names `profiles.user_id`? `decider`
   recommends; Dan decides.
2. **"forming".** Does the spec mean "forming" as a value of the archetype, a ninth member beside the
   eight, or as a confidence level on an archetype, which is how live stores it? `decider`
   recommends; Dan decides.
3. **The downstream runner.** Should axis events, score replay, archetype and feed run in `after()`
   from the publish action for that one member, with a nightly replay of everyone, moving to a queue
   only when a named measurement says so? `decider` rules.

Seats: question 1, `migrator`, `security`, `spec-reader`, and `architect`'s filed position. Question
2, `spec-reader`, `philosopher` and `designer`. Question 3, `builder` and `treasurer`. `spec-reader`
runs on Sonnet rather than its defined Haiku for this debate, since question 2 turns on exact spec
wording.

## The state

Every live figure below is `architect`'s measurement, read only, on 2026-09-21, from the files
named. None is re-measured here: the database connector available to this debate reaches an
unrelated Supabase project, not `mguulnibvzusfvyuowwh`.

### Identity

| | |
| --- | --- |
| A person, three keys | Ghost member id as `text` in 18 columns on 16 tables, 4 of them under a foreign key; profile uuid in 6 columns and auth user uuid in 2, all 8 under one (`team/architect/knowledge/2026-live-schema-hygiene-census.md`, "Identity") |
| The Ghost key's shapes | Of 14 `profiles.ghost_member_id` values, 3 are 24-character hex, 8 are uuid-shaped and 3 are neither |
| `profiles` live | `id uuid` primary key; `ghost_member_id text not null unique`; `user_id uuid unique references auth.users (id) on delete set null`, added 2026-09-20 by `supabase/migrations/20260920000200_profile_claim_tokens.sql` and null on all 14 rows. `profile_claim_tokens.profile_id` already references `profiles (id)` |
| A policy on the wrong key | `opinion_map_positions.opinion_map_self_read` compares `reader_id` with the JWT `sub`. All 9 rows hold Ghost ids, so no Supabase Auth reader can read their own rows through it |
| Tonight's comment write | Scoped by `current_ghost_member_id()`, which reads `profiles.ghost_member_id` where `profiles.user_id = auth.uid()` (`supabase/migrations/20260920200500_comment_write_identity.sql`). A member who joins natively has no Ghost id, and the column is NOT NULL |
| An article, two keys | `articles.id` uuid and `articles.ghost_post_id` text, nullable since `20260921052443`. `comments.article_id` (3 of 3), `axis_events.article_id` (20 of 27, 7 null) and `opinion_map_positions.article_id` (9 of 9) hold Ghost post ids as text with no foreign key, while `apps/web/src/app/api/comment/route.ts:213` writes an `articles.id` uuid into the same column. `articles.author_member_id` and `author_profile_id` agree on all 5 rows and nothing enforces it |
| What ADR-002's migration drew | `supabase/migrations/_archived_2026-09-19/20260919000000_foundation.sql:48`: `user_id uuid primary key references auth.users (id) on delete cascade`, with every person reference pointing at `profiles (user_id)` (lines 85, 117, 200, 236, 256, 280, 302, 323, 396, 397, 421). Archived, never applied |
| What the spec says | `docs/Dialecta_Data_Architecture.md:39`, "Identity Types", Phase 2: "Supabase auth's UUIDs replace Ghost member IDs. Same column names, type changes from `text` to `uuid`." ADR-002, "Specs touched": "Phase 2 (Supabase-native uuid) is now the only phase." `supabase/CLAUDE.md:11`: "Everything Dialecta owns keys on `uuid`." `.claude/agents/migrator.md`: "Supabase identities are `uuid` referencing `profiles.user_id`" |
| Already moving | `security` is designing the `articles` author write policy on the architect's direction to key it on `profiles.id` (`docs/MORNING-AUDIT-2026-09-21.md:38`), and `articles.author_profile_id` is the first table on the profile uuid |
| The form | The map proposes "a note on ADR-002". `docs/decisions/README.md:3`: an ADR is "never edited after Decided; a reversal is a new ADR that supersedes the old one." ADR-004 carries a same-day amendment in place |

### "forming"

| | |
| --- | --- |
| The spec | `docs/Dialecta_Data_Architecture.md:157`: `assigned_archetype` is an enum of the eight "/ forming". `:159`: `confidence` is a 0 to 1 decimal, "Low confidence triggers 'pattern still forming' state". `:163`: "The 'forming' value covers contributors who do not yet have enough history to assign an archetype." |
| The other spec | `docs/Dialecta_Contributor_Identity.md:165`, open question: "how much history is enough to assign an archetype rather than show 'pattern still forming.'" Principle 4 at `:126`, its test at `:135`, the retired Oracle at `:130`. Root `CLAUDE.md:67` locks eight archetypes by name |
| `packages/core` | `src/archetypes.ts:19-22`: `FORMING = 'forming'`, "The stored value for a contributor whose pattern is still forming", and `ArchetypeAssignment` is `Archetype` or `typeof FORMING`. `ARCHETYPE_IDS` holds eight. Exported from `src/index.ts`; no caller in `apps/web` |
| Live | `archetype_id` enum with eight labels and no `forming`, NOT NULL, no default. `archetypes.confidence` is `archetype_confidence` (`forming`, `emerging`, `established`), NOT NULL, default `forming`. `archetype_label` defaults to "Pattern Still Forming". 3 rows (`team/architect/knowledge/2026-live-forming-three-against-one.md`) |
| The dead function | `initialise_contributor_axes()` writes `'forming'` into `archetype_id` and aborts on every call. Nothing calls it: no code on disk, no function, trigger, event trigger or scheduler, and no call in 24 hours of logs |
| April 2026 | `docs/handoffs/dialecta-coherence-audit.md:2051` found `forming` in the then-live `archetype_id` enum and wrote that it "appears to be a state, not an archetype". `:2055` spawned its retirement, and `_recovered/supabase/migrations/007_archetype_enum_canonical_only.sql` retired it with five legacy values by type swap. `:2062` and `:2065` called live's `archetypes` shape, confidence enum included, "positive divergences. The spec should be updated to reflect these production decisions rather than the implementation reverting to a thinner spec. Tracked as a separate doc-patch item." Entity 6 still lists `forming`. No note filed tonight cites these lines |
| The UI that shipped | Shows "Pattern Still Forming" when a contributor has no archetype row: `_recovered/api/contributor.js:117`, `_recovered-next/lib/theme/dialecta-sidebar.jsx:948`, `_recovered-next/lib/theme/fingerprint-page-mount.jsx:137`. `_recovered/api/profile/[id].js:291` selects `confidence`. A grep of `_recovered/api`, `_recovered-next/lib/theme` and `components/` finds no surface displaying `emerging` or `established` as an archetype confidence |
| Two stage vocabularies | `components/dialecta-fingerprint.jsx:943-1067` names four maturity stages for the mark: Newborn (0 comments), Early (about 5), Emerging (about 50), Mature (200 or more). Live's archetype confidence names three: forming, emerging, established |
| The trap | An enum value once added is permanent; removal is a type swap (`team/migrator/knowledge/2026-postgresql-enum-evolution.md`), which `007` already paid for once on this database |

### The runner

| | |
| --- | --- |
| The map | "Axis events, score replay, archetype, feed: `after()` in the publish action, for that one member; a nightly job replays everyone. The scaling spec marks these async. Replay is idempotent, so the nightly run is also the repair path." Move to a queue "when one member's replay no longer fits the route's `maxDuration`, or the nightly replay passes a limit the team sets" |
| The build plan | `docs/plans/build-plan.md:41`: `S --> T[DB triggers: ledger replay, archetype]` |
| The backlog | B-1: "on resolution, write `axis_events` from `axisDeltasFor`; nightly (or on-write) replay into `axis_scores`". B-2: "assign from `axis_scores` pattern, write history, emit `feed_events`" |
| The scaling spec | `docs/Dialecta_Supabase_Scaling.md`, "Write Amplification Per Comment": `comments` and `classifications` sync; `axis_events`, `axis_scores`, `archetypes`, `fp_snapshots`, `feed_events` async. It ranks incremental update with a nightly reconcile first, and of pure replay says it "Does not scale past roughly 800 to 1,200 lifetime comments per contributor on a small Supabase compute instance" |
| The house rule | `supabase/CLAUDE.md:10`: `axis_events` is append-only, and "`axis_scores` is always a replay of the ledger (`replayAxisScores` in `packages/core`), never an incremental update" |
| Measured compute | `replayAxisScores` took 0.38 ms at 17,435 events (5,000 contributions), in memory on STUDIO-PC; those events are 1.71 MB as JSON; the largest live ledger holds 11 events. The fetch is not in the figure (`team/architect/positions-2026-09-20-fingerprint-legibility-and-model.md`, "Cost") |
| The writer today | Nothing writes `axis_events`. `apps/web/src/app/api/comment/route.ts:278-292` leaves the hook unwired on purpose until the promotion pipeline exists. `replayAxisScores` throws on live rows: its type carries the spec's `delta` and `tier_at_contribution`, and live has `tier` and no `delta` (`exchange/open/2026-09-21-architect-06`, item 8) |
| The platform | `apps/web` pins Next.js 15.5.25; `after()` is stable from 15.1 and on Vercel uses `waitUntil`. Dialecta pays for Vercel Pro, $20.20 a month across three projects (`council/treasurer/research/2026-subscription-command-center.md:32`). `pg_cron` is not installed on the live project. No comment, article or follow in 143 days (`docs/MORNING-AUDIT-2026-09-21.md:167`) |
| ADR-004 | A Breach earns no axis event, so its residual reads `classifications` and `comments`, not the ledger |

## Where this meets the fingerprint debate

`council/log/2026-09-20-fingerprint-legibility-and-model.md` has filed its positions and is in its
rebuttal round; its chair has not written. This debate edits none of its files and rules on nothing
it owns.

| Here | There | Where they meet |
| --- | --- | --- |
| 1 | `architect`'s fold, stored per member and served to profile, card and byline; `security`'s single database function returning only what the mark draws | Whatever that stored model keys on is the key ruled here |
| 1 | `legal` owes whether "can never be changed" survives a person's right to delete what they wrote | The map's second ground, "a profile should outlive an account", is a position on the same question |
| 2 | ADR-004's second moment: "First render, when an Archetype or residual first exists" | The model chosen here decides when an archetype first exists |
| 2 | Whether the mark reads time. The Reviser's signature is "visible wave texture from earlier tiers resolving into Forum" (`docs/Dialecta_Contributor_Identity.md:96`) | Assigning an archetype and drawing the mark need the same time-ordered input |
| 2 | The live page's archetype cards (`live-4`) and the mark's stage names | What a forming contributor sees, and whether a confidence level is ever shown, stays with that debate and `designer` |
| 3 | `architect`'s fold "stored at write time"; `treasurer`'s "precompute on write" | A stored fold would run on the runner ruled here, inside its time budget |

## Constraints already locked

- ADR-001: leave Ghost; nothing new is built on it. ADR-002: Supabase Auth is the one identity.
  ADR-003: the editor is built in house. ADR-004: a Breach earns nothing and leaves a residual;
  visibility is chosen in the Pact and confirmed at first render.
- Root `CLAUDE.md`: eight archetypes by name; the spec wins over code, and drift is surfaced, never
  amended silently; seats propose and the convener changes.
- `docs/decisions/README.md`: an ADR is never edited after Decided.
- `supabase/CLAUDE.md`: the ledger is append-only, `axis_scores` is always a replay, Ghost ids are
  `text` and legacy.
- The map's boundary rules (only `lib/data` touches Supabase; only pipeline code holds the service
  key) are the architect's standard, open to Dan's override, and not argued here.
- Classification stays synchronous in the map, and is outside question 3.

## What each seat owes

- **`migrator`**, on 1. The migration under each key: the 18 text columns, the backfill join across
  three Ghost id shapes, `ghost_member_id` NOT NULL for a native member, and where the re-key sits
  against the history repair in `exchange/open/2026-09-21-architect-04`. What `on delete set null`
  and `on delete cascade` each do to a member's comments and ledger. Whether you would run the
  spec's Phase 2 path ("same column names, type changes") or the map's add, backfill, switch and
  drop.
- **`security`**, on 1. Policies through `(select current_profile_id())` against `auth.uid()`
  compared directly: cost, the SECURITY DEFINER surface, and what an unclaimed session resolves to.
  Whether a public `profiles.id` can become a credential the way the Ghost id did
  (`exchange/open/2026-09-21-convener-05`), and whether keying public rows on the auth uuid exposes
  it. What the claim flow needs from either key. The `articles` author policy you are drawing.
- **`spec-reader`**, on 1 and 2. On 1: what ADR-002, "Identity Types" and `supabase/CLAUDE.md`
  require, and whether `profiles.id` refines ADR-002 or reverses it. On 2: which the spec means.
  Entity 6 lists `forming` as a value and also says low confidence "triggers 'pattern still forming'
  state": one state stated twice, or two states. What any other spec says, and where they are silent.
- **`philosopher`**, on 2. What an archetype is for, for the person it describes. Whether "not
  enough history yet" is a pattern or the absence of one, against principle 4, its test and the
  Oracle. What a confidence ladder does to a person who can see where they sit on it. What
  ADR-004's first-render moment needs from the model.
- **`designer`**, on 2. What each model renders on the profile, in the community page's archetype
  filter (B-5) and beside the mark, and what the forming state looks like. The shared word
  "Emerging". Where this stops and the fingerprint debate starts.
- **`builder`**, on 3. The cost and failure modes of `after()` with a nightly replay, of a queue now,
  and of the build plan's database triggers. What the nightly job runs on. Which steps are
  idempotent: the ledger write, the archetype history, the feed events. What the nightly replay
  repairs if the lost step is the ledger write itself. What `replayAxisScores` needs before it runs
  on live rows.
- **`treasurer`**, on 3. The running cost of each, sourced: `after()` and a cron on the plan Dialecta
  pays for, a queue's free and paid tiers, database-side work on Supabase compute. The scaling
  spec's 800 to 1,200 against the measured 0.38 ms. Whether "move when a named measurement says so"
  is a trigger anyone will see, and who watches it.
- **`architect`** is not convened: it is running its own review tonight. Its filed position enters
  below in its own words.

## Positions

*Each seat's `## Brief`, verbatim, advisory bench then working bench. Full positions at the paths
given.*

### designer

*`council/designer/positions/2026-09-21-identity-forming-and-the-runner.md`*

Model "forming" as one always-present status value resolved before any page sees it, the shape
`packages/core` already types (`ArchetypeAssignment = Archetype | FORMING`, `archetypes.ts:20-22`),
not a three-tier confidence badge and not an absent row each surface checks for itself. Strongest
evidence: three shipped files already hand-roll the identical
`archetype ? name : 'Pattern Still Forming'` fallback independently, which is the "same control
behaving differently" failure my charter exists to catch, while the one function that would
replace all three, `archetypeName()`, is already built and called from nowhere.

### philosopher

*`council/philosopher/positions/2026-09-21-identity-forming-and-the-runner.md`*

"Forming" is the absence of a pattern. Five spec lines name it: four describe a state reached
through low confidence or too little history, and one table cell stores it as a ninth archetype
value (`docs/Dialecta_Data_Architecture.md:157`). I recommend the confidence reading with one
correction: below the threshold no archetype exists, where live's NOT NULL column requires one of
the eight beneath a "forming" rung, in a table anon can read. Strongest evidence: Contributor
Identity retired the Oracle for being defined partly by speaking rarely, "an absence rather than a
move" (`docs/Dialecta_Contributor_Identity.md:130`). Forming is defined wholly by one, and fails
principle 4's test (`:135`): no comment text is forming.

### security

*`council/security/positions/2026-09-21-identity-forming-and-the-runner.md`*

Key every person on `profiles.id` and resolve the caller once per statement through
`(select current_profile_id())`. Claiming then moves no reference: `claim_profile()` sets
`profiles.user_id` on one row inside one hardened function (`supabase/migrations/20260920000200_profile_claim_tokens.sql`,
lines 113-165). Keyed on the auth uuid, a claim has to rewrite the 18 Ghost-keyed person columns on
16 tables inside a definer function every later table must join, or the 14 get auth users
pre-created by email, which reopens the email match the claim token replaced. The same column cuts
off a stolen session without deleting a word: Supabase says access tokens of revoked sessions
"remain valid until their expiry time", and nulling `user_id` fails them at every policy on the
next statement.

**Seat:** security. **Written:** 2026-09-21. **Question:** 1. Nothing was sent to a database
tonight.

### treasurer

*`council/treasurer/positions/2026-09-21-identity-forming-and-the-runner.md`*

After() with a nightly cron, as the map proposes, and I recommend it: at Dialecta's current and
near-term scale it costs close to nothing, because Vercel bills Active CPU only while code runs
and pauses during a database wait (vercel.com/docs/functions/usage-and-pricing, fetched
2026-09-21). The measured replay, 0.38 ms for a 5,000-comment member, is compute only and already
sits past the scaling spec's own 800-to-1,200 ceiling without troubling a CPU-hour. Both ride the
Pro plan Dialecta already carries. The real limit is wall-clock against `maxDuration`, not a
dollar figure, and nobody has measured the one number that predicts when it bites, or is named to
watch for it.

### architect

*Filed, not convened: the seat is running its own review tonight. Its position on each question in its
own words, unedited. The convener chose the passages, one per question; the chair should read
`team/architect/architecture/2026-09-21-rebuild-map.md` in full.*

**On 1**, `team/architect/architecture/2026-09-21-rebuild-map.md:51-55`:

> One refinement to ADR-002, for decider. The ADR names `profiles.user_id` as the key, but 14 legacy
> profiles have no auth user yet, and a profile should outlive an account. `profiles.id` carries the
> ADR's intent, one identity the database owns, without either problem. `supabase/CLAUDE.md` already
> says "everything Dialecta owns keys on `uuid`"; the live schema does not, and this is the step that
> makes it true.

**On 2**, `exchange/open/2026-09-21-architect-03-handoff-forming-and-the-dead-function.md:32-34`, which
files no recommendation:

> The decision, which is `decider`'s and Dan's because either answer amends a spec or changes live:
> does "forming" live in the archetype value (the spec) or in a confidence level (live)? Then `migrator`
> drops the function, and `builder` makes `packages/core` match before `apps/web` writes an archetype.

**On 3**, `team/architect/architecture/2026-09-21-rebuild-map.md:67-68`, `:72` and `:75-77`:

> | Step | Runs in | Why |
> | --- | --- | --- |
> | Axis events, score replay, archetype, feed | `after()` in the publish action, for that one member; a nightly job replays everyone | The scaling spec marks these async. Replay is idempotent, so the nightly run is also the repair path |
>
> `after()` is stable in the Next.js 15.5 this app pins, runs in route handlers and server actions, and
> uses Vercel's `waitUntil`. Move to a queue when a measured number says so: when one member's replay no
> longer fits the route's `maxDuration`, or the nightly replay passes a limit the team sets.

### builder

*`team/builder/positions-2026-09-21-identity-forming-and-the-runner.md`*

Rule for `after()` from the comment's resolution action plus a nightly full replay, as the map
recommends, but only once two fixes land: a unique constraint on `axis_events`, which has none
today, and the `delta`/`tier` mismatch between `packages/core` and live that `architect-06`
already flagged. Veto the build plan's database-trigger diagram outright: a trigger either runs
inside the write transaction or forces `packages/core`'s pure engine into a second implementation
in SQL, and `pg_cron` is not even installed to schedule it. Strongest evidence: Vercel's own docs
describe `waitUntil` as best effort, no retries, no durability, and `axis_events`
(`supabase/migrations/20260920000000_baseline_live_schema.sql:574-591`) carries no uniqueness
constraint at all, so one retried write can double an append-only ledger that no later replay can
undo.

### migrator

*`team/migrator/positions-2026-09-21-identity-forming-and-the-runner.md`*

Key every person reference on `profiles.id`, under a foreign key. Keep `profiles.user_id` for one
job only: resolving a session to its profile. ADR-002 names `user_id` as the key, but the
migration that implements ADR-002's own claim flow already anchors elsewhere:
`profile_claim_tokens.profile_id references public.profiles (id) on delete cascade`
(`supabase/migrations/20260920000200_profile_claim_tokens.sql:57`). `user_id` is null on all 14
live profiles and goes null on delete, unfit as what sixteen tables and a ledger hang from.
`profiles.id` is a clean, populated uuid primary key today. I veto keying the rekey on `user_id`
as ADR-002's text names it.

### spec-reader

*`team/spec-reader/positions-2026-09-21-identity-forming-and-the-runner.md`*

**Q1.** ADR-002's Decision (line 15) names `profiles.user_id`, not `profiles.id`; no spec anywhere
names `profiles.id` or `current_profile_id()`, and `Dialecta_Data_Architecture.md` defines no
`profiles` entity at all to arbitrate between them. Changing the referenced column changes what
ADR-002 explicitly decided, which `docs/decisions/README.md:3` says takes a new superseding ADR,
not a note.

**Q2.** `Dialecta_Data_Architecture.md` entity 6 (lines 157, 163) and shipped code
(`packages/core/src/archetypes.ts:19,22`) agree: forming is a stored value of `assigned_archetype`,
a ninth member. Live alone implements the confidence level reading, found in no current spec.

## Before the rebuttals

*The convener's notes, written after reading all seven positions in full. Facts and cross-references
only; no seat is told what to conclude.*

### Corrections to the frame and the positions

- **The `articles` author policy is applied, not being drawn.** The frame's "Already moving" row
  predates it. `supabase/migrations/20260921053807_articles_author_write_policy.sql` is on disk, and its
  header reads "Designed and applied by the security seat on the convener's brief, 2026-09-21". It
  creates `public.current_profile_id()` (line 56), revokes it from `public` and `anon` (line 91), and
  keys the author policies on `author_profile_id = (select public.current_profile_id())` (lines 122,
  137, 142). The key question 1 asks about already backs one policy; its live state is (unmeasured)
  here. `docs/MORNING-AUDIT-2026-09-21.md:38` now marks 2.3 done.
- **The three live `archetypes` rows are April's seeds.** `docs/handoffs/dialecta-handoff-2026-04-27.md:45-47`
  lists Maya Reiss (reviser), Wen Zhao (synthesizer) and Father Anselm Okafor (contextualist), all at
  `established`, with Ghost ids `seed:maya`, `seed:wen` and `seed:anselm`.
  `team/builder/2026-09-20-analytics-spec.md:163`: "3 of 3 contributors who do have no archetype". No
  real contributor holds an archetype row. Whether the census's three Ghost ids of neither shape are
  these three seed ids is (unmeasured).
- **`designer` cites `Contributor_Identity.md:313`** for "the confidence score on the current
  archetype". The line is `docs/Dialecta_Data_Architecture.md:313`, the Archetype Monitor's third step.
  The quotation is exact.
- **`builder`'s "no uniqueness constraint" on `axis_events`** is read from
  `supabase/migrations/20260920000000_baseline_live_schema.sql:574-592`, a hand-written baseline that
  carries wrong markers (`team/architect/knowledge/2026-live-baseline-unverified-markers.md`). A read
  of `pg_constraint` on live settles it; (unmeasured) tonight.
- **`security`'s `## Brief` section runs 128 words** with its closing metadata line and 114 without.
  The log enters it verbatim.

### Where the positions meet

**Question 1.** Every seat that recommends a column recommends `profiles.id`: `migrator`, `security`
and the architect's filed position. `spec-reader` recommends no column and rules on the form: the
change "changes what ADR-002 explicitly decided", which `docs/decisions/README.md:3` routes to a new
superseding ADR, not a note. `migrator` calls it "not a reversal of ADR-002"; the map calls it "one
refinement". `migrator` and `security` agree the ledger's foreign keys should not cascade (`migrator`:
"closer to `restrict` than `cascade`"; `security`: "the ledger's foreign keys are `restrict`"), and
both leave whether a profile may be deleted at all to `legal`.

**Question 2.** Three readings of one spec. `spec-reader`: entity 6 names "one state, stated twice,
stored as a value of the archetype", and "Live alone implements the confidence level reading, found
in no current spec." `philosopher`: forming is "the absence of a pattern"; no archetype exists below
the threshold, and confidence is the monitor's instrument, never a stage shown; it vetoes adding
`forming` to the enum and any model that keeps one of the eight beneath a "forming" rung where `anon`
can read it. `designer`: one always-present value resolved in `lib/data`, the `ArchetypeAssignment`
type `packages/core` already has, whatever the storage; it vetoes showing the three confidence values
as reader-facing copy. On the text itself: `Dialecta_Data_Architecture.md:159` and `:313` put a
confidence on an assigned archetype, and `:379` restates the open threshold question; no spec names
the three levels `forming`, `emerging`, `established`. `philosopher` cites `:312`, `:313` and `:379`;
`spec-reader` cites none of the three.

**Question 3.** `builder` and `treasurer` both recommend the map's shape and defer a queue. `builder`
splits the map's "Replay is idempotent" into two operations, the score recompute (idempotent) and the
first ledger write (not), makes a unique constraint on `axis_events` and the `delta`/`tier` fix
preconditions, and vetoes the build plan's database triggers. `treasurer` prices both paths near zero
on the Pro plan and names the production fetch, unmeasured, as the one number the map's trigger
depends on, with nobody named to watch it. Two seats on other questions bind the runner:
`philosopher`, "The first assignment is therefore not a shift, and nothing about it is published
before the person confirms it. That binds B-2 and the runner in question 3"; and `security`, that the
runner "is service-key code, so it takes its member from the publish action's verified session, never
from the request".

## Rebuttals

*Each seat's `## Rebuttal`, verbatim, in seat order; a heading inside a rebuttal is demoted one level to sit under the seat's name. `architect` was not convened and filed none.*

### designer

The citation correction stands. `:313` is `Dialecta_Data_Architecture.md`, not
`Contributor_Identity.md`; the quoted text is exact, the file name was not. Noted for the record.

spec-reader's strongest point, "Live alone implements the confidence level reading, found in
no current spec," is real but points the wrong way. "The spec wins" stops silent code
drift from becoming truth by default; it does not require reverting a five-month-old, reasoned,
already-executed migration to match a table cell nobody has re-read since. April's audit did the
sanctioned thing: it found `forming` "a state, not an archetype," retired it by type swap, and
asked for the spec to be patched to match (`dialecta-coherence-audit.md:2065`). That patch is
five months late and still the right one. Re-adding `forming` to `archetype_id` to satisfy
entity 6 as written would undo `007` and reopen the permanent-enum trap it closed
(`team/migrator/knowledge/2026-postgresql-enum-evolution.md`), on a table now serving traffic.

philosopher's refinement, adopted outright. The veto on "one of the eight beneath a forming rung"
is stronger than a principle-4 argument alone: `archetypes` is one of six tables `anon` can read
in full (root `CLAUDE.md`, "Known drift"), so a best-guess `archetype_id` held at
`confidence='forming'` would not just be philosophically wrong, it would let any signed-out reader
query a specific named guess no UI has shown anyone yet. My "one resolved value, whatever the
storage" left that door open. Fold philosopher's constraint into mine: the resolved status is
`FORMING` only when no real `archetype_id` is set at all, full stop.

### philosopher

**Conceded.** No spec names live's three levels, and the split I credited to live is already Entity
6's (`Data_Architecture.md:157`, `:159`). "The confidence reading" in my brief was the wrong label: I
recommend absence below a threshold set by the spec's own 0 to 1 decimal. Live's named rungs are an
addition, and with `archetypes` open to anon (`2026-live-rls-surface.md:19`) they are published
whatever a page renders. I'd retire them for the decimal, which names no stage. No convener
correction names this position; the seed identification (`docs/handoffs/dialecta-handoff-2026-04-27.md:45-47`)
confirms its last table row.

**`spec-reader`.** It reads the text right: Entity 6 stores one state as a value
(`team/spec-reader/positions-2026-09-21-identity-forming-and-the-runner.md:48-49`). The dispute is
whether that value is an archetype, and the strongest point against me is its open question, that
principle 4's rejected candidates "are candidates for the eight, not the sentinel" (`:71-73`). Both
horns lead out of the enum. As a candidate, forming fails, as spec-reader finds (`:57`). As a
sentinel it is not an archetype, and a sentinel stored in `archetype_id` reaches every reader of
that type as one: the Monitor's "all eight archetype signatures" (`Data_Architecture.md:312`),
`archetype_shift` (`:314`), the card's tag (P-14). `packages/core` already draws this line:
`ArchetypeAssignment` has nine members, `ARCHETYPE_IDS` and `ARCHETYPES` eight (`archetypes.ts:6-15`,
`:22`, `:29-38`). "Needs no spec edit" (`:65`) holds only while Entity 6 contradicts principle 4,
which the house rule says to surface.

**`designer`.** Conceded in full: one `ArchetypeAssignment`, resolved once in `lib/data` through
`archetypeName()`. That reconciles the three readings: forming is the ninth member of the
assignment, never of the archetype enum. I'd hold one line, on B-5. A facet that makes
still-forming contributors "a browsable peer, not an absence"
(`council/designer/positions/2026-09-21-identity-forming-and-the-runner.md:49`) is the one member
all eight outrank, the ranking principle 2 forbids (`Contributor_Identity.md:121`).

### security

**The form, conceded to `spec-reader`.** Changing ADR-002's column is a reversal in writing, and a
note leaves standing the lines agents build from: `.claude/agents/migrator.md:13` ("Supabase
identities are `uuid` referencing `profiles.user_id`") and `docs/plans/build-plan.md:8`
("`profiles.user_id` is the key"). An agent obeying the ADR over the database is then the only
guard, and `council/security/charter.md:31` vetoes "a control that is only a convention". The
superseding ADR should name `current_profile_id()` as the one resolver and correct those files in
the same change.

**The substance survives.** ADR-002 states its own reason for the column: "`auth.uid()` in RLS is
what lets every engine feature ship without a service-role key in the request path" (line 15).
`current_profile_id()` reads `auth.uid()` inside RLS, and no service key enters the request path.
The comparison gains one lookup, the one that makes revocation a single statement.

**Momentum, conceded.** `migrator` is right that the form now trails the database, and this seat
put it there: `20260921053807` keys a policy on a function no decision names, applied per its
header (unmeasured). If Dan rules `user_id`, it's the first policy to rewrite, and it matches nobody
until a claim lands (`docs/MORNING-AUDIT-2026-09-21.md:38`).

**The convener's count is right.** The section under `## Brief` runs 128 words. The brief is the
paragraph, 114; the metadata line belonged below the section, and the file stays as filed.

**My runner rule, corrected.** It gives the runner its member from the publish action's session.
Under `builder`'s resolution action that can name the wrong person: a final tier takes 35% from
community votes, and the threshold "that triggers a re-review event" is still open
(`packages/core/src/resolution.ts`, lines 4-8 and 18-19). One member's vote can re-resolve
another's comment. The member comes from the comment row the action reads, never from the request
or the voter's session.

### treasurer

`builder` and I never opposed each other on the recommendation, and its own rebuttal already says
so; the concession running the other way is mine. I inherited the map's "replay is idempotent, so
the nightly run is also the repair path" without splitting it, and builder's split is right:
`axis_scores` recompute is idempotent, the first `axis_events` write is not, and a `waitUntil`
retry against no unique constraint can double it in a way replay then compounds rather than fixes.
The convener flagged builder's citation as drawn from a file with wrong markers elsewhere; builder
checked and that specific block carries none of that file's "LIVE UNVERIFIED" tags, which narrows
the doubt without closing it. Either way the fix is the same $0 migration, so my dollar number
doesn't move: I'm adding the unique constraint as a named precondition to my own recommendation,
next to the delta/tier fix I already had.

Builder folds in my "nobody watches the trigger" point and proposes wiring the
constraint-violation count and the nightly job's duration into one thing a person checks. I'll
close the one part that's still open: name the person. Dialecta has no ops team; the only
candidate today is Dan, and a two-number dashboard nobody is assigned to read is exactly the
unmonitored infrastructure this seat's charter warns against: "a solo founder can afford to leave
running" is about being watched, as much as being cheap. Both numbers already exist for free on vendor
dashboards, Vercel's function duration and a `pg_constraint` check, so the missing piece isn't a
tool, it's an owner and a threshold, and naming one costs nothing tonight.

### builder

The convener is right that only `pg_constraint` on live settles the missing unique constraint,
unmeasured tonight; I can't reach it either. But the caution should be sized to what it's citing. I
checked: the `axis_events` block carries none of `2026-live-baseline-unverified-markers.md`'s "LIVE
UNVERIFIED" tags (zero hits), unlike the nine confirmed-wrong lines that file lists elsewhere, all
guesses about a type, default, or enum value. An absent constraint on a block whose neighboring
lines are individually marked CORRECTED or CONFIRMED is a different kind of claim than a guess
already proven wrong. My recommendation doesn't need it settled either way: gate the
writer on the constraint existing, and if `pg_constraint` shows it already does, the gate clears
free; if not, it's the migration this position already asks for. The one-line check for whoever
runs it: `select conname from pg_constraint where conrelid = 'public.axis_events'::regclass and
contype = 'u'`.

`treasurer` and I land on the same shape and both price it near zero at current scale, so there's no
opponent on this question to answer. Treasurer's sharper point is the one I'd fold in: nobody is
named to watch the `maxDuration`/nightly-window number that triggers a queue. That's my ledger gap
again in miniature, a measurement the map assumes without an owner. Whoever adds the unique
constraint should wire both numbers, the constraint-violation count and the nightly job's own
duration, into something a person checks, or the map's own trigger never fires.

Security's bind, that the runner takes its member from the publish action's verified session and
never the request, and philosopher's, that nothing publishes before confirmation, are both already
inside "for that one member, from the publish action" above; I read them as confirmation of that
shape, already in place.

### migrator

spec-reader's point stands as written: ADR-002's Decision line names `profiles.user_id`, not
`profiles.id`, and no spec document anywhere names `profiles.id` or `current_profile_id()`. I do
not dispute the text. Where we differ is the label, "refinement" against spec-reader's "reversal,"
and that label is `decider`'s and Dan's to settle, not mine.

What I can add is cost, which spec-reader's own position says it does not weigh: `user_id` is null
on all 14 live profiles today. Keeping ADR-002's literal column is not a free, paperwork-only
alternative to `profiles.id`; it is a real precondition. No migration can backfill a foreign key
against `user_id` until every legacy member has claimed a profile through `claim_profile()`, and
nothing filed tonight names a date that finishes. `profiles.id` is populated and enforced now.
Whichever column `decider` names, the gap between decided and runnable is not the same size for
both.

One correction to fold in. The convener's note that `articles_author_write_policy` is applied, not
drawn, is more than a status update. I read the file: `current_profile_id()`
(`supabase/migrations/20260921053807_articles_author_write_policy.sql:56`, "Designed and applied
by the security seat") is not a proposal anymore: it already sits on disk and, by its own header,
runs against `articles.author_profile_id`. A new superseding ADR, if that is the form Dan
picks, would ratify code already shipped, not authorize code not yet written. That does not settle
spec-reader's form question. It means the form question is now trailing the database rather than
gating it.

### spec-reader

#### 1. The identity key

`migrator`'s strongest point: shipped code already resolves `auth.uid()` through `profiles.user_id`
to a different column via `current_ghost_member_id()` (`20260920200500:45-55`), so
`current_profile_id()` is "the same function returning `id` instead," not a reversal. I concede the
precedent: an indirection function already departs from ADR-002's literal "`auth.uid()` in RLS"
text, before tonight. That weakens how novel the departure is, not whether it is one. ADR-002's
Decision still names `profiles.user_id` as what other tables reference; nothing shipped changes
that text. Whether the accumulated shape is called "refinement" (the map) or "not a reversal"
(`migrator`), README.md:3 conditions on a changed decision, not on the label chosen for it. The
accumulated drift is now larger than one note plausibly carries.

#### 2. "forming"

Conceded, plainly: I did not cite `Data_Architecture.md:312-313`, and it bears on my reading. Step
3 of the Archetype Monitor describes "the confidence score on the current archetype" changing on
its own, after assignment, separate from entity 6's bootstrap gate. That is real spec text for a
confidence-on-an-archetype mechanism, inside the same document as entity 6, and Data Architecture
never reconciles the two. My "one state, stated twice" answer holds only within entity 6 itself;
across the document it is two mechanisms, undescribed together. `philosopher` hands me the exact
question and I now answer it more precisely, not more narrowly, and it still is not resolved here.
`designer`'s ":313" citation lands on `Contributor_Identity.md`; the line is `Data_Architecture.md`,
per the convener's correction, and I use the corrected one above.

## After the rebuttals

*The convener's notes. Facts only.*

- **Two cited migrations were renamed tonight** to the versions live records, closing part of
  `exchange/open/2026-09-21-architect-04`. `20260920000200_profile_claim_tokens.sql` is now
  `supabase/migrations/20260921004417_profile_claim_tokens.sql`, and
  `20260920200500_comment_write_identity.sql` is now `20260921004459_comment_write_identity.sql`. The
  frame and the positions cite the old names, and line numbers against them have shifted by a few
  lines. The chair cites the new names.
- **Another Ghost-keyed read landed after the positions.**
  `supabase/migrations/20260921063139_comment_tier_and_reading_functions.sql`, applied by `security` on
  the convener's brief per its header, adds two functions whose ownership test is
  `c.member_id = (select public.current_ghost_member_id())` (lines 82 and 122). The re-key in question
  1 moves them too.
- **The fingerprint debate's chair sections landed during the rebuttal round.** The chair here read
  them from `## Chair synthesis` to the end.
- **One point went back to the chair after it wrote.** ADR-005's precondition 3 first set a default
  direction for the ledger's row shape: the spec's `delta` and `tier_at_contribution`, with live
  changing. No seat had argued a direction, and the fingerprint debate carries a filed proposal the
  other way (`team/architect/positions-2026-09-20-fingerprint-legibility-and-model.md:109`). The
  convener put those facts to the chair, which revised the precondition to require agreement without
  ruling which side moves. Nothing else changed.

## Chair roll-call

**designer**, question 2. Argued for one always-present status value, resolved once in `lib/data` through `archetypeName()` into the `ArchetypeAssignment` type `packages/core` already exports, whatever the storage underneath. Its evidence: three shipped surfaces each hand-roll `archetype ? name : 'Pattern Still Forming'`. It vetoed showing live's three confidence values as reader-facing copy anywhere, because "Emerging" is also the mark's third growth stage. In rebuttal it adopted `philosopher`'s constraint outright: the resolved status is "`FORMING` only when no real `archetype_id` is set at all, full stop." Disposition: **carried**. The resolved value and the veto are both in the recommendation, and a fourth copy of the fallback now sits in `apps/web` (`apps/web/src/app/profile/_components/ArchetypeControls.tsx:99`). **Unresolved**: its B-5 facet that makes still-forming contributors "a browsable peer, not an absence", which `philosopher` holds is the one member all eight outrank. Two slips, neither load-bearing: its `:313` citation named the wrong file, as the convener corrected, and "a table now serving traffic" describes a platform with no comment, article or follow in 143 days.

**philosopher**, question 2, with a bind on question 3. Argued that "forming" is the absence of a pattern. The Oracle was retired for being defined partly by an absence (`docs/Dialecta_Contributor_Identity.md:130`); forming is defined by nothing else, and fails principle 4's test (`:135`). Below the threshold no archetype exists, and confidence is the Archetype Monitor's instrument, never a stage of the person. It vetoed adding `forming` to `archetype_id`, and any model that keeps one of the eight beneath a "forming" rung where `anon` can read it. In rebuttal it conceded that "the confidence reading" was the wrong label for what it recommends, which is absence below the spec's 0 to 1 decimal with live's named rungs retired, and conceded `designer`'s resolved value in full: "forming is the ninth member of the assignment, never of the archetype enum." Disposition: **carried** on question 2. Its bind, that the first assignment "is not a shift, and nothing about it is published before the person confirms it", is **carried** into ADR-005, because it follows from ADR-004. **Unresolved**: the B-5 facet, above.

**security**, question 1, with a rule for question 3. Argued that every person keys on `profiles.id`, resolved once per statement through `(select current_profile_id())`. A claim then sets `user_id` on one row, where a key on the auth uuid makes it rewrite 18 columns on 16 tables or pre-create auth users by email; and nulling `user_id` cuts off a stolen session at the next statement without deleting a word. It vetoed ADR-002's drawn shape, `user_id` as primary key cascading from `auth.users` into every person table, and held the ledger's foreign keys to `restrict`. In rebuttal it conceded the form to `spec-reader` ("Changing ADR-002's column is a reversal in writing") and conceded momentum, since its own migration keys a policy "on a function no decision names". Disposition: **carried** on the key and on the ledger's lifecycle; **conceded** the form, which the chair now recommends. Its runner rule, corrected in rebuttal so the member comes "from the comment row the action reads, never from the request or the voter's session", is **carried** into ADR-005. **Unresolved**: its own rules move the helper out of an exposed schema, and `current_profile_id()` was created in `public` (`supabase/migrations/20260921053807_articles_author_write_policy.sql`, line 56).

**treasurer**, question 3. Argued that `after()` with a nightly cron costs close to nothing on the Pro plan Dialecta already pays for, since Active CPU pauses during a database wait. It vetoed building a queue now and, if one is ever needed, prefers Vercel Queues or `pgmq` to a new vendor. It named the number nobody has measured, one production fetch times the member count, and the fact that nobody is assigned to watch it. In rebuttal it adopted `builder`'s split of "replay is idempotent", added the unique constraint as a precondition, and named the owner: "the only candidate today is Dan." Disposition: **carried**. Wrong on the evidence twice, and neither error moves its recommendation. It reads the scaling spec's 800 to 1,200 ceiling as describing synchronous replay, where `docs/Dialecta_Supabase_Scaling.md` lists `axis_scores` as async in its own table and puts the ceiling on ledger reads on a small database instance, which a compute-only 0.38 ms does not test. And it names "a `waitUntil` retry" as what doubles the ledger, where `waitUntil` runs a promise once and cannot rerun it; a duplicate comes from a cron run delivered twice, an action invoked twice, or a repair that inserts blind.

**architect**, filed, not convened. On question 1: `profiles.id`, as "one refinement to ADR-002" recorded in a note. **Carried** on the key; **lost** on the form, since `docs/decisions/README.md:3` makes a changed decision a new record. On question 2 it filed no recommendation, so **silent** as a position; its knowledge note describes live's model winning as "an archetype that may be absent plus a confidence level" (`team/architect/knowledge/2026-live-forming-three-against-one.md:104-105`), which the recommendation follows in storage and departs from at the read boundary, where it keeps `FORMING` as `designer` asks. On question 3: `after()` from the publish action plus a nightly replay, and a queue when a measured number says so. **Carried** as the ruling, with its line "Replay is idempotent, so the nightly run is also the repair path" corrected by `builder`, and its "limit the team sets" given numbers in ADR-005.

**builder**, question 3. Argued for `after()` from the comment's resolution action plus a nightly full replay, once two fixes land: a uniqueness guard on `axis_events`, and the `delta`/`tier` mismatch between `packages/core` and live (`exchange/open/2026-09-21-architect-06`, item 8). It vetoed the build plan's database triggers outright: a second engine in SQL, or replay back inside the writer's transaction, with no `pg_cron` to run the nightly half. It split the map's idempotency claim: recomputing `axis_scores` is idempotent and the first ledger write is not, so the nightly job diffs resolutions against the ledger and inserts only what is missing. In rebuttal it sized the convener's doubt about its baseline citation, supplied the one-line `pg_constraint` check, and took `treasurer`'s point that the trigger needs a watcher. Disposition: **carried**; ADR-005 is its shape. On the evidence: the words it quotes from Vercel, "best effort: no retries, no durability", are not on the page it cites (vercel.com/docs/functions/limitations, fetched 2026-09-21), though the substance holds on two other Vercel pages, cited in the synthesis. It reads the scaling ceiling as assuming "a full recompute inline on the request path", the misreading `treasurer` shares. And its example key, `(classification_id, axis)`, would not guard live's article-sourced rows, which carry no classification id, because Postgres treats nulls as distinct in a unique constraint.

**migrator**, question 1. Argued that every person reference keys on `profiles.id` under a foreign key, with `user_id` kept for one job, resolving a session to its profile, and vetoed keying the re-key on `user_id`. It would run the map's add, backfill, switch and drop rather than the spec's type change in place, which three Ghost id shapes break outright; `profiles.ghost_member_id` loses NOT NULL; the ledger's delete rule is "closer to `restrict` than `cascade`"; and the re-key lands after `architect-04`'s history repair. In rebuttal it did not dispute `spec-reader`'s text, left the label to the chair and Dan, and added the asymmetry: `user_id` is null on all 14 profiles, so ADR-002's literal column "is a real precondition" with no date. Disposition: **carried** on the key, the method, the sequence and the ledger's lifecycle; neutral on the form.

**spec-reader**, questions 1 and 2. On 1: ADR-002's Decision names `profiles.user_id`, no spec names `profiles.id` or `current_profile_id()`, and Data Architecture defines no `profiles` entity, so the change "changes what ADR-002 explicitly decided" and takes a new superseding ADR. In rebuttal it conceded the precedent, `current_ghost_member_id()` already departing from ADR-002's literal `auth.uid()` text, which "weakens how novel the departure is, not whether it is one." It recommended no column, as its mandate requires. Disposition: **carried** on the form. On 2: entity 6 and `packages/core` agree that forming is a stored ninth value, and live alone implements a confidence reading. In rebuttal it conceded it had not cited `docs/Dialecta_Data_Architecture.md:312-313`, where the Monitor keeps a confidence on the current archetype, so across the document the spec carries "two mechanisms, undescribed together." Disposition: its reading of entity 6's table cell stands, and it **lost** on what follows from it, since the chair recommends amending the cell. Its finding that ADR-004's in-place amendment already sits outside README's rule decides the form in question 1.

## Chair synthesis

### The identity key

| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |
| **A.** `profiles.user_id`, as ADR-002 names it; policies compare `auth.uid()` directly | No foreign key can be backfilled: `user_id` is null on all 14 profiles until each claims. Hurrying it means pre-creating auth users by email, which M1 forbids. The applied author policy is rewritten | A claim rewrites 18 person columns on 16 tables inside a definer function; cutting off a stolen session means orphaning or deleting rows; ADR-002's drawing cascades an account deletion into the ledger | A profile outliving its account; the claim flow as built |
| **B.** `profiles.id` under foreign keys; `user_id` binds a session to a profile; `current_profile_id()` resolves every policy (the map, `migrator`, `security`) | Re-key 18 columns on 16 tables, rows in dozens, after `architect-04`'s history repair; `ghost_member_id` loses NOT NULL, as it must under either key; the resolver hardened and tested; a new ADR | One unique-index probe per statement (reasoned, unmeasured); one function whose wrong answer hands one member another's rights on every table | Direct `auth.uid()` comparisons, the pattern Supabase's samples teach |
| **B′.** `profiles.id`, set equal to the auth uuid for native members (Supabase's sample shape) | As B | Two populations under one column: a policy written `= auth.uid()` passes every native test and silently shuts out the 14 | One meaning for `profiles.id` |

Every seat that names a column names `profiles.id`: `migrator`, `security` and the architect's map. Nobody argued for `user_id` on the merits, and `spec-reader` names no column by mandate. The seats also agree on the method (add, backfill, switch, drop, after `architect-04`'s history repair) and on `restrict` for the ledger.

B rests on one measured fact and one mechanism. The fact: `profiles.user_id` is null on all 14 live profiles, so A cannot hang a single foreign key until every legacy member claims, and the one way to hurry that is the email match M1 retired ("never on a bare email match", `docs/plans/phases-and-missions.md:112`). The mechanism: `claim_profile()` sets `user_id` on one row, spends the token and moves no reference (`supabase/migrations/20260921004417_profile_claim_tokens.sql`, lines 116 to 168), and the claim-token table already references `profiles (id)` (line 61). ADR-002's own reason for its column survives the change: "`auth.uid()` in RLS is what lets every engine feature ship without a service-role key in the request path." `current_profile_id()` reads `auth.uid()` inside the policy, and no service key enters the request.

B's cost is concentration. One function answers "who is this" for every policy, so `security`'s rules come with it: wrap every call in a subselect, test the helper before any policy uses it, keep `profiles.id` on its random default (B′ is the trap), give `user_id` no update grant, and read no person id from a request body. That last rule answers `convener-05`. Publication did not make the Ghost id a credential; a handler that looked up a body-supplied copy on the service key did. One rule is already unmet on disk: the function sits in `public`, an exposed schema.

On the lifecycle half, live's `profiles.user_id` is `on delete set null`, so deleting an account unlinks it and keeps the profile. Under B that is a default `legal` can still change: whether a person's words must go when they leave is its question, and a profile can still be deleted on purpose. ADR-002's drawing answers it by cascade before anyone has asked. `restrict` on the ledger's foreign keys, including the `comment_id` cascade `axis_events` carries now, is the reversible choice. A wrong `restrict` fails a delete someone then writes deliberately; a wrong cascade loses a member's history with no error. This sits beside the fingerprint debate's Dan item 3, "What deleting a comment does to the mark", without ruling it. Either answer there, leave nothing public or erase the history too, becomes an explicit step once cascades are gone, and the second also needs `supabase/CLAUDE.md:10`'s append-only rule to name its one exception. The foreign key change lands with the comment delete handler's new rule, or the live delete path starts failing on any comment with ledger rows.

The real disagreement is the form. The map proposes a note on ADR-002; `spec-reader` says a new ADR must supersede it; `security` conceded; `migrator` left it to the chair. `docs/decisions/README.md:3` settles it: "never edited after Decided; a reversal is a new ADR that supersedes the old one." ADR-004's same-day amendment is the one precedent for a note, and it already sits outside that rule; a second would make the exception the practice. The drift is also wider than one line. ADR-002 carries two consequences the record has overtaken. "Foundation migration already keys on `profiles.user_id uuid`" describes a file archived and never applied, and "matched by email on first sign-in" gave way to the claim token in the path-to-launch build, with no record under `docs/decisions/`. The form no seat named exactly is a new ADR that supersedes ADR-002 in part (its key column and those two consequences), records the claim token for the first time, and leaves the rest of ADR-002 standing. ADR-002's text stays as written, and its status line names the new record, as the template provides.

**Recommendation: B, recorded as a new ADR that supersedes ADR-002 in part.** The reason that carried it: `profiles.id` is the only key all fourteen legacy members have today, and the only one a claim can bind without rewriting sixteen tables.

### Forming

| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |
| **A.** A ninth value of the archetype (entity 6's table cell; `packages/core`'s comment) | `forming` added to live's `archetype_id`, permanently, undoing April's `007`; a row for every contributor from the start; `archetype_confidence` then encodes the same state twice | Every reader of the type handles a ninth member: the Monitor's "all eight archetype signatures", `archetype_shift`, B-5's filter. The first real reading arrives as a shift in a feed `anon` reads, with no confirmation | Taking the value back out without another type swap |
| **B.** A confidence ladder on an assigned archetype (live's schema) | None to the schema; the rungs already sit in a table `anon` reads in full | A stored row below the threshold must name one of the eight (NOT NULL): a named guess anyone can query. "Emerging" collides with the mark's stage name | A row for a contributor who has no archetype |
| **C.** Absence: no archetype exists until the Monitor's 0 to 1 confidence clears a threshold, and `FORMING` exists only as the value `lib/data` resolves (`philosopher` and `designer`, in rebuttal) | Drop `initialise_contributor_axes()`; the live defaults that encode forming go; the decimal lands beside the rung column, which goes at cutover; one comment line in `packages/core` | The threshold stays open (`Dialecta_Data_Architecture.md:379`), and so does whether a falling confidence ever returns someone to forming (`Contributor_Identity.md:168`) | Any stage or rung shown to anyone |

`philosopher` and `designer` reached one model in rebuttal: storage holds no archetype until one is earned, and every reader gets one resolved value from `lib/data`. Both veto adding `forming` to the enum, and no seat wants a rung shown to a reader.

Which does the spec mean? Both, in different lines. Entity 6's table cell stores forming as a ninth value (`docs/Dialecta_Data_Architecture.md:157`). Its prose calls forming the state of a contributor without "enough history to assign an archetype" (`:163`). The Monitor keeps "the confidence score on the current archetype" (`:313`). Both open questions set forming against assignment, "rather than showing 'pattern still forming'" (`:379`; `docs/Dialecta_Contributor_Identity.md:165`). `spec-reader` reads the cell right and conceded the rest: two mechanisms, never reconciled. So Dan's question is which line to change. Leaving both is the one answer the house rule excludes.

Three facts outweigh the cell. ADR-004, which Dan decided, already treats a new contributor as having "no Archetype" (line 125) and asks for a confirmation "when an Archetype or residual first exists" (line 135). Under A a contributor holds the value `forming` from the start, as the only writer on disk assumes, so the first real reading arrives as an `archetype_shift` in a feed `anon` reads, and that confirmation never happens. Principle 4 disqualifies an archetype defined by "how often they post" (`Contributor_Identity.md:128`); forming is defined by nothing else. And live already stores absence for every real contributor: its three `archetypes` rows are April's seeds (`docs/handoffs/dialecta-handoff-2026-04-27.md:45-47`), and every shipped surface shows "Pattern Still Forming" when no row exists.

Live's schema, as distinct from its data, is the vetoed state waiting for a writer. `archetype_id` is NOT NULL, so a row below the threshold must name one of the eight under a `forming` rung, in a table `anon` reads in full. No spec names the three rungs, and "Emerging" is already the mark's third growth stage (`components/dialecta-fingerprint.jsx:1007`). The spec's own instrument is the decimal (`:159`), which names no stage. April's audit called live's richer `archetypes` shape, rung enum included, "positive divergences" (`docs/handoffs/dialecta-coherence-audit.md:2065`); C keeps that audit's other finding, that forming "appears to be a state, not an archetype" (`:2051`), and declines the rungs. `designer` vetoed showing them and did not argue for keeping them stored, so the rungs are Dan's second yes or no.

C's costs are small and measured. `initialise_contributor_axes()` has no caller and aborts on every call. `packages/core/src/archetypes.ts:19` calls `FORMING` "The stored value", which becomes the resolved one. The live defaults that encode forming (`confidence` default `forming`, `archetype_label` default "Pattern Still Forming") go. The decimal lands beside the rung column first and the column goes at cutover, because the production profile handler still selects `confidence` (`_recovered/api/profile/[id].js:291`) and the new loader parses it (`apps/web/src/app/profile/_lib/rows.ts:241-254`), though nothing renders it. The four hand-rolled fallbacks collapse into `archetypeName()`.

Outside question 2, and open: whether B-5's filter shows still-forming contributors as a facet (`designer`) or only in the unfiltered list (`philosopher`, on principle 2). It goes to `designer` with the objection attached when B-5 is briefed.

**Recommendation: C, with the rungs retired for the decimal.** The reason that carried it: C is the only reading that keeps ADR-004's first-render confirmation true, and ADR-004 is the one text on this question Dan has already decided.

### The downstream runner

| Option | Costs now | Costs later | Forecloses |
| --- | --- | --- | --- |
| **A.** `after()` in the action that resolves or re-resolves a comment, plus a nightly Vercel Cron job that reconciles, then replays (the map, `builder`, `treasurer`) | A uniqueness key on `axis_events`, core's ledger type and live's table agreed, a cron route that checks `CRON_SECRET`; about $0 on Pro | A lost callback shows only as the next night's repair, one member a day behind; the nightly pass is bounded by its route's `maxDuration` (300 s default, 800 s maximum on Pro) | Nothing: a queue later replaces the transport and keeps every step |
| **B.** A queue now (Vercel Queues, or `pgmq` on Supabase) | A consumer, retry and poison handling, and a new service or extension, with nothing measured to ask for them | Redelivery when a consumer crashes, times out or is rolled out; delivery is at-least-once, so the same key | Nothing structural; effort spent before any traffic |
| **C.** Database triggers (`docs/plans/build-plan.md:41`) | The engine rewritten in SQL, or a trigger calling out through `pg_net`; `pg_cron` installed for the nightly half | Two engines to keep in step, the drift `axis-mapping.ts`'s header records once already; replay back inside the writer's transaction | `packages/core` as the one engine |

The spec leaves only the mechanism open. Data Architecture's "Axis Score Updater" fixes the trigger, a classification resolving, and "Also triggers on community reclassification"; entity 4 fixes the computation, a replay "not accumulated incrementally" (line 120). `builder`, `treasurer` and the map chose A, and nobody defends C; `treasurer` accepted `builder`'s idempotency split, and `builder` accepted `security`'s member rule and `philosopher`'s bind.

Both seats on this question misread the scaling spec's ceiling. `docs/Dialecta_Supabase_Scaling.md` lists `axis_scores` as async in its own table and puts the 800 to 1,200 ceiling on "ledger reads" on "a small Supabase compute instance": a database cost. The measured 0.38 ms at 17,435 events is compute on STUDIO-PC with the fetch left out, so it rules out a compute bottleneck and leaves the spec's claim untested either way. The fetch is the number that decides, as `treasurer` said, and it is (unmeasured).

Vercel's own pages carry the ruling. `waitUntil` only extends the invocation: "If the function times out, the promises will be cancelled" (vercel.com/docs/functions/functions-api-reference/vercel-functions-package), and work scheduled with `after()` on an instance a rollout replaces "disappears without an error anyone sees" (vercel.com/i/message-queue). Vercel Cron is "best effort", can "invoke the same scheduled run more than once", and retries nothing when a run fails (vercel.com/docs/cron-jobs/manage-cron-jobs). A queue delivers "at-least-once" (vercel.com/docs/queues/concepts), which still means sometimes twice. All four were fetched 2026-09-21. So every option needs the same two things: a key that refuses a second insert of one earning event, and a nightly pass that checks every resolution against the ledger, inserts only what is missing, then replays. With both in place a queue changes only the transport, and nothing measured asks for that: no comment, article or follow in 143 days, and a largest ledger of 11 events.

The key needs more care than the examples filed. Live's ledger has two sources, `comment` and `article`, and the source check recorded in the archived baseline puts no classification id on an article row (its live state unmeasured), so `(classification_id, axis)` would guard the 7 comment rows and none of the 20 article rows. A community re-resolution, or a new rule version, must append a successor row rather than collide with the old one or delete it. The fingerprint debate's writer adds "a row per Breach", which earns no axis. Whatever key `migrator` draws covers all three, and a nullable column in it is declared `nulls not distinct`, since Postgres otherwise treats nulls as distinct.

Two rules bind the callback. `after()` runs "even if the response didn't complete successfully" (nextjs.org/docs/15/app/api-reference/functions/after, fetched 2026-09-21), so it reads the committed comment row for the tier and the member, never the action's memory or the voter's session. And ADR-004 ships every visibility level except self-visible disabled until its predicate policy exists, while `archetypes` and `feed_events` are both open to `anon` today. The archetype step therefore writes no first assignment, and no feed event about one, where `anon` can read it before that policy and the owner's first-render confirmation exist.

The fingerprint debate's model, "folded once on the server" and stored at write time, runs on this runner, and that debate's `architect` adopted the scaling spec's option A for the fold: a constant-time update per row, with the nightly replay as the drift check. That debate finishes the fold's computation. This ruling fixes only `axis_scores`, which stays a full replay per member, as `supabase/CLAUDE.md:10` and entity 4 require. A fold updated per row stays safe here if its update commits in the same transaction as the ledger insert that feeds it, so a duplicate the key refuses cannot move it twice.

**Ruling: A, recorded as ADR-005.** The reason that carried it: the pipeline's safety lives in the key and the nightly reconcile, which every option needs, and a queue now buys retries for traffic that does not exist. A queue replaces the transport when either measurement crosses: the nightly job's run time passes half its route's `maxDuration` (150 s at Pro's 300 s default), or the nightly pass inserts a row `after()` lost on two nights in any seven. The job records both on every run, `/analytics` shows them, and Dan owns them, as `treasurer` proposed.

## For Dan

### 1. The identity key

Key every person on `profiles.id`. `profiles.user_id` only links a login to a profile, and one function turns a signed-in session into a profile for every policy. It's the one key all fourteen legacy members already have, so claiming a profile moves nothing. The same migration moves article references onto `articles.id`, which nobody disputed.

Dissent: the architect's map wanted a note on ADR-002 instead of a new record. Nobody argued for `user_id` itself.

Yes or no:

- **(a)** `profiles.id` is the key.
- **(b)** The form: a new ADR that supersedes ADR-002 in part (its key column, the email match and the foundation-migration line) and records the claim token. The rest of ADR-002 stands. ADR-002's text is untouched; its status line names the new record. A note on ADR-002 would be the edit `docs/decisions/README.md:3` rules out.
- **(c)** Nothing erases history as a side effect. The ledger's links become `restrict`, and deleting an account unlinks it and keeps the profile until `legal` says what deletion owes. This sits next to the fingerprint debate's item 3 (what deleting a comment does to the mark): either answer you give there becomes a deliberate step.

Hand edits if yes:

- `docs/Dialecta_Data_Architecture.md`, "Identity Types", the Phase 2 paragraph: persons key on `profiles.id` under foreign keys, Ghost ids stay as attributes, and the move is add, backfill, switch, drop.
- `docs/Dialecta_Data_Architecture.md`: a `profiles` entity, which it lacks and backlog P0-4 already cites.
- `docs/plans/build-plan.md`, "Decisions" (the Identity row) and "Data model".
- `docs/plans/phases-and-missions.md`, lines 10 and 97.
- `docs/plans/backlog.md`, P0-4's spec cell and P0-6's email match.
- Not a spec, for the convener: `.claude/agents/migrator.md:13`.

### 2. "forming"

"Pattern still forming" means no archetype yet. Nothing is stored until the confidence number clears a threshold, and every page gets the words from one shared function. `forming` never joins the eight.

Dissent: `spec-reader` reads the spec's table as storing forming as a ninth archetype, a reading that needs no spec edit. It's right about the table cell; the cell contradicts the same spec's prose, principle 4, and your ADR-004, which gives a new contributor "no Archetype".

Yes or no:

- **(a)** Forming is the absence of an archetype.
- **(b)** Live's three named levels (forming, emerging, established) retire for the spec's plain 0 to 1 number. `philosopher` argued for this; `designer` vetoed ever showing them and did not argue to keep them; April's audit liked them.

Hand edits if yes:

- `docs/Dialecta_Data_Architecture.md`, entity 6: line 157 drops "/ forming"; line 159 says no archetype is assigned below the threshold; line 163 calls forming the state of having none.
- Same file, "Archetype Monitor", steps 3 and 4: a first assignment is not a shift, and it waits for ADR-004's first-render confirmation.
- Nothing in Contributor Identity or root `CLAUDE.md` changes.

### 3. The runner, ruled

Ruled tonight as ADR-005 (`docs/decisions/ADR-005-downstream-runner.md`). The work after a comment's tier settles (ledger, scores, archetype, feed) runs in the background just after the response, for that comment's author, and a nightly job checks it and fills any gap. No queue and no database triggers yet.

Yours to override: the ruling itself, its two thresholds (the nightly job reaching half its time limit; lost work found on two nights in seven), or you as the one who watches them on `/analytics`.

Hand edits it lists: the scaling spec's section 2 and its checklist line, which recommend an incremental update the house rule forbids; Data Architecture's open question on axis delta computation (line 378); and the build plan's diagram.

## Outcome

- **Ruled tonight.** Question 3, recorded as `docs/decisions/ADR-005-downstream-runner.md`: decided by `decider` under the rebuild map's routing, open to Dan's override. The convener adds it to `docs/decisions/README.md` and rewrites backlog rows B-1 and B-2 as its Consequences set out. The chair's four sections are in this log.
- **Waiting on Dan.** Question 1 (the key, the form, the delete rule) and question 2 (absence, and the rungs), each framed above as a yes or no. On his answers, `decider` writes the ADRs at the next free numbers.
- **Exchange records.**
  - `exchange/open/2026-09-21-architect-08`: its three `decider` decisions are answered here, question 3 ruled and questions 1 and 2 recommended. Its other three (the history repair, staging, the data-access boundary) belong to other owners, so it stays open.
  - `exchange/open/2026-09-21-architect-05`: answered by the question 1 recommendation; it closes when Dan rules.
  - `exchange/open/2026-09-21-architect-03`: answered by the question 2 recommendation; `migrator`'s drop of `initialise_contributor_axes()` and `builder`'s change to `packages/core` follow Dan's ruling.
  - `exchange/open/2026-09-21-architect-06`, item 8: unanswered here; ADR-005 makes it a precondition of the ledger writer.
  - `exchange/open/2026-09-21-architect-04`: unanswered here; the question 1 recommendation puts the re-key after it.
  - `exchange/open/2026-09-21-convener-05`: the half addressed to `decider`, whether a public `profiles.id` becomes a credential, is answered by the question 1 recommendation (no person id read from a request); the revokes stay with `security`.
- **Protocol step 6 waits.** Each seat updates its standing `positions.md` or `practices.md` only after Dan rules on questions 1 and 2 and after the fingerprint debate closes, since the two debates share `designer`, `philosopher`, `security`, `treasurer`, `architect`, `builder` and `spec-reader`.
