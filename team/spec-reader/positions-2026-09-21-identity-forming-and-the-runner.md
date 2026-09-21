# spec-reader: identity key and "forming"

## Brief

**Q1.** ADR-002's Decision (line 15) names `profiles.user_id`, not `profiles.id`; no spec anywhere
names `profiles.id` or `current_profile_id()`, and `Dialecta_Data_Architecture.md` defines no
`profiles` entity at all to arbitrate between them. Changing the referenced column changes what
ADR-002 explicitly decided, which `docs/decisions/README.md:3` says takes a new superseding ADR,
not a note.

**Q2.** `Dialecta_Data_Architecture.md` entity 6 (lines 157, 163) and shipped code
(`packages/core/src/archetypes.ts:19,22`) agree: forming is a stored value of `assigned_archetype`,
a ninth member. Live alone implements the confidence level reading, found in no current spec.

## 1. The identity key

**What the specs require.** ADR-002's Decision names one column: "Supabase Auth, magic link plus
Google, with `profiles.user_id` referencing `auth.users`." It ties that column to `auth.uid()` in
RLS, avoiding a service-role key in the request path (ADR-002:15). `Dialecta_Data_Architecture.md`,
"Identity Types" (33 to 49), names no column: twelve entities, none of them `profiles`, so it cannot
arbitrate `profiles.id` against `profiles.user_id`, only that the column is a uuid.
`supabase/CLAUDE.md:11` sets the same low bar. `build-plan.md:8`, `phases-and-missions.md:10,97`,
and `backlog.md:38` (citing "Data Architecture: profiles," an entity that does not exist) all still
carry ADR-002's wording.

**Refines or reverses.** `profiles.id` changes what ADR-002 commits to in writing: the column and
the direct `auth.uid()` comparison. That is a reversal, not a gap filled. `current_profile_id()`
goes further: no ADR, spec, or `.claude/agents/migrator.md` (line 13: "Supabase identities are uuid
referencing `profiles.user_id`") names it. Security's policy work and `articles.author_profile_id`
show momentum toward `profiles.id`, not spec support; `profiles.user_id` being null on all 14 rows
is a problem this seat does not weigh.

**What changes by Dan's hand.** `docs/decisions/README.md:3`: an ADR is "never edited after
Decided," and a reversal "is a new ADR that supersedes the old one." The map proposes a note.
ADR-004 already carries an in-place "Amendment," a precedent for the lighter form, but README names
only "edited" and "superseded," not "amendment," so ADR-004 already sits outside its own rule.
Either path also needs `build-plan.md`, `phases-and-missions.md`, and `backlog.md`'s citation fixed.

**Not settled from the specs.** Whether a note and ADR-004's Amendment are the same governance act:
README.md defines neither term. Whether Data Architecture's Phase 2 sentence was meant to reach a
`profiles` table it predates.

## 2. "forming"

**What the specs require.** `Dialecta_Data_Architecture.md` entity 6 lists forming as the ninth
value of `assigned_archetype` (line 157); `confidence`, a 0 to 1 decimal, "triggers" the "pattern
still forming" state (line 159); then: "The 'forming' value covers contributors who do not yet have
enough history to assign an archetype" (line 163). Entity 6 names one state, stated twice, stored as
a value of the archetype, not a confidence level on one. `packages/core/src/archetypes.ts` ships
that reading: its header cites both specs; `ArchetypeAssignment` is `Archetype | typeof FORMING`
(lines 1 to 2, 22), forming a formal ninth member.

`Dialecta_Contributor_Identity.md` never uses forming as a value; its only use (line 165) shows it
instead of an archetype. Root `CLAUDE.md:67` locks "Eight archetypes" by name. Principle 4's test
ends (line 135): "If no, the archetype is not earnable through doing the work, and it does not
belong on the platform." The Oracle was retired for being an absence rather than a move (line 130);
forming is that same absence. Forming fails that bar, though stored in the same column.

**Refines or reverses.** Neither option refines the other; they are different shapes. Live
implements a third, found in no current spec: `archetype_id` fixed to the eight, NOT NULL, no
default, plus a separate `archetype_confidence` enum of forming, emerging, established. The nearest
root, `dialecta-coherence-audit.md:2062`, a write-once handoff, found the same enum and urged the
spec be updated to reflect it (line 2065), never carried out.

**What changes by Dan's hand.** Entity 6's reading needs no spec edit, only
`initialise_contributor_axes()` and live's enum fixed to match. Live's reading needs entity 6 (157,
159) rewritten and a confidence ladder written down for the first time, plus root `CLAUDE.md:67`
reconciled.

**Not settled from the specs.** Whether Contributor Identity's silence on a confidence ladder means
compatible but unwritten, or never intended. Whether principle 4 was meant to test forming at all:
its rejected candidates, Oracle, Expert, Influencer, Moderate, are candidates for the eight, not the
sentinel.

## Citations

| Claim | Source | What it says |
| --- | --- | --- |
| ADR-002's key column | `docs/decisions/ADR-002-supabase-auth-identity.md:15` | "Supabase Auth, magic link plus Google, with `profiles.user_id` referencing `auth.users`. `auth.uid()` in RLS is what lets every engine feature ship without a service-role key in the request path." |
| ADR-002's stated consequence | `docs/decisions/ADR-002-supabase-auth-identity.md:18` | "Foundation migration already keys on `profiles.user_id uuid`." That migration is `supabase/migrations/_archived_2026-09-19/20260919000000_foundation.sql`, archived, never applied (frame, "What ADR-002's migration drew") |
| No `profiles` entity in Data Architecture | `docs/Dialecta_Data_Architecture.md`, entities 1 to 12 (52 to 273) | Twelve entities defined; `profiles` is not one. Grep of the file confirms zero other hits |
| `profiles.id` and `current_profile_id()` named nowhere in `docs/` | Full text search, `docs/` | Both strings appear only in architect's own artifacts: `team/architect/architecture/2026-09-21-rebuild-map.md`, `docs/MORNING-AUDIT-2026-09-21.md:58`, `exchange/open/2026-09-21-architect-05` |
| Downstream docs still say `profiles.user_id` | `docs/plans/build-plan.md:8`; `docs/plans/phases-and-missions.md:10,97`; `docs/plans/backlog.md:38` | All three restate ADR-002's column. `backlog.md:38` cites "Data Architecture: profiles" as P0-4's governing spec, an entity that does not exist there |
| Migrator's own rule | `.claude/agents/migrator.md:13` | "Ghost-sourced ids are `text` and legacy; Supabase identities are `uuid` referencing `profiles.user_id`." |
| ADR governance rule | `docs/decisions/README.md:3` | "One file per decision, numbered, never edited after Decided; a reversal is a new ADR that supersedes the old one." |
| ADR-004's in-place amendment | `docs/decisions/ADR-004-breach-residuals-on-the-fingerprint.md:96` | "## Amendment, 2026-09-20: the visibility choice belongs in the Pact", appended to a Decided ADR rather than filed as a new one |
| `forming` as the ninth enum value | `docs/Dialecta_Data_Architecture.md:157,159,163` | 157: enum list ends "/ forming". 159: "Low confidence triggers 'pattern still forming' state." 163: "The 'forming' value covers contributors who do not yet have enough history to assign an archetype." |
| Shipped code follows the spec's reading | `packages/core/src/archetypes.ts:1-2,19-22` | Header: "The eight archetypes, plus 'forming' for contributors without enough history... See docs/Dialecta_Contributor_Identity.md and docs/Dialecta_Data_Architecture.md (entity 6)." `ArchetypeAssignment = Archetype \| typeof FORMING` |
| Contributor Identity frames forming as absence, not a value | `docs/Dialecta_Contributor_Identity.md:165` | "Threshold for archetype assignment, how much history is enough to assign an archetype rather than show 'pattern still forming.'" |
| Locked vocabulary | root `CLAUDE.md:67` | "Eight archetypes: Skeptic, Synthesizer, Advocate, Builder, Empiricist, Contextualist, Illuminator, Reviser." |
| The naming test the eight were built on | `docs/Dialecta_Contributor_Identity.md:126,135` | Principle 4: an archetype must name a cognitive move. Test at 135: "If no, the archetype is not earnable through doing the work, and it does not belong on the platform." |
| The Oracle precedent | `docs/Dialecta_Contributor_Identity.md:130` | Retired for being defined by an absence (speaking rarely) rather than a move |
| Live's shape, measured | `team/architect/knowledge/2026-live-forming-three-against-one.md`, cited in `exchange/open/2026-09-21-architect-03` | `archetype_id`: eight labels, NOT NULL, no default. `archetype_confidence`: forming/emerging/established, NOT NULL, default forming |
| April's recommendation, never executed | `docs/handoffs/dialecta-coherence-audit.md:2062,2065` | "`archetypes` has ... `confidence` enum (forming/emerging/established) ... substantially richer than spec's 'current + history' framing." "The spec should be updated to reflect these production decisions ... Tracked as a separate doc-patch item." |
| The dead function | `docs/OPEN-ITEMS.md:33`; `exchange/open/2026-09-21-architect-03` | `initialise_contributor_axes()` inserts 'forming' into `archetype_id`, an enum with no such member; aborts every call |

## Rebuttal

### 1. The identity key

`migrator`'s strongest point: shipped code already resolves `auth.uid()` through `profiles.user_id`
to a different column via `current_ghost_member_id()` (`20260920200500:45-55`), so
`current_profile_id()` is "the same function returning `id` instead," not a reversal. I concede the
precedent: an indirection function already departs from ADR-002's literal "`auth.uid()` in RLS"
text, before tonight. That weakens how novel the departure is, not whether it is one. ADR-002's
Decision still names `profiles.user_id` as what other tables reference; nothing shipped changes
that text. Whether the accumulated shape is called "refinement" (the map) or "not a reversal"
(`migrator`), README.md:3 conditions on a changed decision, not on the label chosen for it. The
accumulated drift is now larger than one note plausibly carries.

### 2. "forming"

Conceded, plainly: I did not cite `Data_Architecture.md:312-313`, and it bears on my reading. Step
3 of the Archetype Monitor describes "the confidence score on the current archetype" changing on
its own, after assignment, separate from entity 6's bootstrap gate. That is real spec text for a
confidence-on-an-archetype mechanism, inside the same document as entity 6, and Data Architecture
never reconciles the two. My "one state, stated twice" answer holds only within entity 6 itself;
across the document it is two mechanisms, undescribed together. `philosopher` hands me the exact
question and I now answer it more precisely, not more narrowly, and it still is not resolved here.
`designer`'s ":313" citation lands on `Contributor_Identity.md`; the line is `Data_Architecture.md`,
per the convener's correction, and I use the corrected one above.
