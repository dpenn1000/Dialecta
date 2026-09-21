# Forming

## Brief

Model "forming" as one always-present status value resolved before any page sees it, the shape
`packages/core` already types (`ArchetypeAssignment = Archetype | FORMING`, `archetypes.ts:20-22`),
not a three-tier confidence badge and not an absent row each surface checks for itself. Strongest
evidence: three shipped files already hand-roll the identical
`archetype ? name : 'Pattern Still Forming'` fallback independently, which is the "same control
behaving differently" failure my charter exists to catch, while the one function that would
replace all three, `archetypeName()`, is already built and called from nowhere.

## Recommendation

Whatever `migrator` chooses underneath (a value, a nullable column, a guaranteed row), every
renderer should read one resolved value from `lib/data`, matching the rebuild map's own rule that
only `lib/data` touches Supabase. `packages/core/src/archetypes.ts` already has the type
(`ArchetypeAssignment`, line 22) and the function (`archetypeName()`, line 48) for this. Nothing in
`apps/web` calls it yet (`exchange/open/2026-09-21-architect-03`).

## The cost already paid

Three surfaces already reimplement the same fallback by hand instead of sharing one:
`_recovered/api/contributor.js:117`, `_recovered-next/lib/theme/dialecta-sidebar.jsx:948`, and
`fingerprint-page-mount.jsx:137`, each its own `archetype ? name : 'Pattern Still Forming'`.
`_recovered/api/profile/[id].js:1264-1265` documents the punt in a comment: "front-end falls back
to 'Pattern Still Forming' when null." My charter: "the same control behaving the same way
everywhere... Divergence is a defect even when each instance is defensible on its own." Three
defensible instances, one real defect.

## Against the ninth-value reading

Spec entity 6 lists forming inside the same enum as the eight archetypes
(`Dialecta_Data_Architecture.md:157`), but that reading was tried on live once and reversed. The
April 2026 audit found it in `archetype_id`, wrote that it "appears to be a state, not an
archetype" (`dialecta-coherence-audit.md:2051`), and `007_archetype_enum_canonical_only.sql`
retired it by type swap to the canonical eight, still true on live today. The same audit called
the separate `confidence` enum a "positive divergence" and asked for the spec to be patched to
match it (`:2065`); that patch never landed. The spec's own prose elsewhere agrees with live, not
with its own table row: confidence is "the confidence score on the current archetype"
(`Contributor_Identity.md:313`), a property of an assignment already made, and both of its
open-question restatements frame the choice as binary, archetype or "pattern still forming"
(`:165`, `:379`), never three tiers.

## The filter and the shared word

| | One status value | Confidence shown as a badge |
|---|---|---|
| B-5 filter | One facet; still-forming contributors are a browsable peer, not an absence | Archetype facet is null for 11 of the frame's 14 profiles (3 hold a row); needs a bolted-on "unassigned" bucket |
| Vocabulary | Never puts "emerging" in front of a reader | Collides with the fingerprint mark's third growth stage, also named "Emerging" (`components/dialecta-fingerprint.jsx:1006`): same word, different axis, statistical certainty against raw comment count |

I would veto rendering `archetype_confidence`'s three values as reader-facing copy anywhere, on
the collision alone. That is a boundary call about vocabulary, not about the mark's own rendering,
which stays with tonight's other debate.

## What would change my mind

Evidence that a single resolved value cannot be produced cheaply at the `lib/data` boundary,
forcing every surface back to its own null check. Nothing filed tonight shows that.

## Rebuttal

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
