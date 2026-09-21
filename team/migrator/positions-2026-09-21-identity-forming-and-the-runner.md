# The identity key

*migrator position, 2026-09-21, for `council/log/2026-09-21-identity-forming-and-the-runner.md`,
question 1. Every live fact below is cited to a filed note; none is measured fresh, per this
debate's rule 3.*

## Brief

Key every person reference on `profiles.id`, under a foreign key. Keep `profiles.user_id` for one
job only: resolving a session to its profile. ADR-002 names `user_id` as the key, but the
migration that implements ADR-002's own claim flow already anchors elsewhere:
`profile_claim_tokens.profile_id references public.profiles (id) on delete cascade`
(`supabase/migrations/20260920000200_profile_claim_tokens.sql:57`). `user_id` is null on all 14
live profiles and goes null on delete, unfit as what sixteen tables and a ledger hang from.
`profiles.id` is a clean, populated uuid primary key today. I veto keying the rekey on `user_id`
as ADR-002's text names it.

## Recommendation

`profiles.id`, matching the architect's recommendation
(`team/architect/architecture/2026-09-21-rebuild-map.md`, "Decisions this needs"). Ghost ids stay
attributes on `profiles` and `articles`, per ADR-001. A `current_profile_id()` function resolves
`auth.uid()` to `profiles.id` for policies.

This is not a reversal of ADR-002, it is the same shape already shipped a day earlier, pointed at
a different column. `current_ghost_member_id()` already resolves `auth.uid()` through
`profiles.user_id` to return `ghost_member_id`
(`supabase/migrations/20260920200500_comment_write_identity.sql:45-55`); `current_profile_id()`
is that function returning `id` instead. `user_id` stays the anchor for which session owns which
profile; it was never a good anchor for which profile a comment belongs to.

## The precedent already on disk

The hygiene census's three identity categories
(`team/architect/knowledge/2026-live-schema-hygiene-census.md`, "Identity: three keys for one
person"): "Profile id" (uuid, 6 columns, 6 tables) is 6 of 6 covered by foreign key; reading that
against `profile_claim_tokens.sql`, all six point at `profiles.id`, one of the 24 single-column
uuid primary keys the census found clean, no exceptions. The separate "Auth user id" category (2
columns) is `profiles.user_id` itself plus `profile_claim_tokens.used_by_user_id`, pointing at
`auth.users`, not at a profile from a child table. No live foreign key targets
`profiles.user_id`. Two nights of real migrations, under shipping pressure, already converged on
the column I recommend.

## The migration

Not the spec's literal Phase 2 line, "same column names, type changes from `text` to `uuid`"
(`docs/Dialecta_Data_Architecture.md:39`), run as a bare `ALTER COLUMN TYPE`. 3 of 14
`ghost_member_id` values are 24-character hex, 8 uuid-shaped, 3 neither
(`2026-live-schema-hygiene-census.md`), so a cast fails outright and the backfill join must know
which Ghost field produced each row. Matching my standing practice
(`2026-postgresql-column-type-remap.md`): add a uuid sibling to each of the 18 Ghost-text columns,
backfill by join through `profiles.ghost_member_id`, cut readers and writers over, then drop or
demote the text column. The map's path.

Two more items. `profiles.ghost_member_id` needs `not null` dropped: a native signup has no Ghost
id, and the column blocks that row today, per the state table. `on delete` needs a per-table
answer: `axis_events` is append-only, never patched in place (`supabase/CLAUDE.md:10`), so
cascading a profile delete through it rewrites history by another name, closer to `restrict` than
`cascade`. A member's comments, an author's own words rather than a ledger, need not take the same
answer. Whether a profile can be deleted at all is `legal`'s question, per the frame; I flag the
conflict, not the right.

## Sequencing

This rekey lands after `architect-04`'s migration-history repair, not beside it
(`exchange/open/2026-09-21-architect-04-handoff-migration-history-drift.md`): three versions still
have no file anywhere on disk, and one applied migration's SQL does not match what is tracked
(`043008`, cause not established). A structural migration against a history not yet true repeats
the failure this repo already lived through: my brief records the September migrations were
written without knowledge of the live schema (`team/migrator/brief.md`). The map's build order
agrees: baseline and history first, rekey second.

## Against this

Two things cut the other way. `docs/decisions/README.md:3` says an ADR is never edited after
Decided, and the map proposes "a note," not a new ADR; ADR-004's same-day amendment is precedent
for something short of a full supersession, but the form is `decider`'s question, unsettled here.
And `opinion_map_self_read` already compares a Ghost-shaped `reader_id` to the JWT `sub` and
matches nothing (`2026-live-schema-hygiene-census.md`), a bug that exists regardless of which key
wins tonight and argues only for finishing the rekey sooner.

## What would change my mind

Evidence that backfilling a person-reference column against `profiles.id` is harder or less
reliable than against `user_id`. I have not seen that; the opposite already shipped. A ruling that
erasure requires deleting the `profiles` row outright, not unlinking `user_id`, would change the
`on delete` design, not the column it keys on.

## Rebuttal

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
