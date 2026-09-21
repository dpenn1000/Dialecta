# architect: thread handoff

*Written 2026-09-21 for Dan. The seat was created and trained in one evening. This is what it is,
what it found, and what to ask it next.*

## What it is

A thirteenth seat on the working bench, created at Dan's request for a "Project Managing Coding
expert" overseeing quality, optimisation, dynamic functions over hardcoding, and standardisation,
plus data engineering. One seat rather than two, because both halves are the same sentence at
different layers: **a definition exists in one place and the code does something else.**

| | |
| --- | --- |
| Mandate | `.claude/agents/architect.md` |
| Brief | `team/architect/brief.md` |
| Practices | `team/architect/practices.md`, 13 researched plus 2 from the charter |
| Notes | `team/architect/knowledge/`, 8 filed plus an index |
| Reading list | `team/architect/knowledge/reading-list.md`, 14 leads, 6 worked |
| Model | opus |

**The boundary that keeps it from duplicating `reviewer`:** `reviewer` judges a change, `architect`
judges what the changes have added up to. A finding visible in a diff belongs to `reviewer`. Every
one of the six failures that justified the seat was invisible in a diff.

Two constraints against the way a quality seat normally fails. Every finding names the file, the
line and the fix, because a finding without a fix is a complaint. And the list is ranked with a
stated first move, because twenty unranked possibilities is a list nobody acts on.

## What its first sprint found

**Ranked first, and losing data every time a comment is classified.** `opposing_view_engaged` was
flagged by `builder` as a fold in `packages/core`. The fold is not where the loss is.
`apps/web/src/app/api/comment/route.ts:260` widens the boolean back out as `'yes' : 'no'`, so a
model answer of `partially` stores as `yes`, permanently and per row, biased one way. Live already
holds a `partially` row. Three files, no migration. **Assigned to `builder` on 2026-09-21.**

**More urgent than either example it was given.** `initialise_contributor_axes()` cannot complete:
it inserts `'forming'` into `archetypes.archetype_id`, an enum with no such member, so the call
aborts and rolls back the `axis_scores` insert with it. `migrator` had flagged this as "may";
`architect` confirmed it from the live function body and found `migrator`'s proposed fix would also
fail, since `archetype_id` is NOT NULL with no default. **Still open, needs a real answer.**

**It corrected the convener.** My revoke migration closed the three functions I named and verified.
`architect` measured the whole schema and found four more holding `anon` EXECUTE, and established
why the pattern keeps failing: the per-schema `REVOKE ... FROM PUBLIC` form is accepted, succeeds,
and does nothing. Only the global form works. One of the four is revoked; three trigger functions
are left open with the reasoning recorded.

**On the baseline migration** it counts 26 markers where the file says 27, could not reconcile the
difference, and refused to adopt either number. Nine markers are wrong, two of them type errors
that would leave the database unable to hold Ghost-keyed article ids.

**The best single finding, for what it says about the Council.** The baseline says live leaves
`feed_events.event_type` unconstrained, citing `migrator`. Live has a 12-value CHECK. `migrator`
correctly stated that `types.ts` cannot show check constraints, then drew a conclusion past its own
caveat, and the baseline quoted the conclusion without it. **One seat's stated limitation became
another's fact in one hop.**

**Also:** `apps/web` is missing `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`, both on
in `packages/core`, with no root config and no `extends`, so the two workspaces keep diverging. Cost
measured with a probe tsconfig rather than by editing the repo: zero errors across 28 files.
**Assigned to `builder` on 2026-09-21.**

**Tooling verdict:** adopt `knip` and `jscpd`, skip `ts-prune` (subsumed) and `madge` (no push in
eight months, 127 open issues). Each judged on last release, open issues and licence rather than on
stars. It nearly asserted a `ts-prune` deprecation from memory and checked the README, which says
the opposite.

## How it works, which is the part worth knowing

It re-derived rather than re-read. It corrected the premise of its own seeded reading list when the
lead said a setting was "already on in this repository" and it was on in one workspace only. It
stated its method on every count. It declined to adopt a number it could not reconcile. And it
stopped when the Supabase MCP misrouted to another organisation's project from a subagent session,
passed `project_id` explicitly, and confirmed Dialecta by its own table names before reading
anything.

## What to ask it next

1. **The `initialise_contributor_axes` fix**, which it found and nobody has solved. It is the only
   open item from its own sprint that it did not hand to someone else.
2. **The rename that defeated three searches.** `WoodFrameProgressBar.jsx` became
   `dialecta-reflection-bar.jsx` and three independent searches concluded it was lost. A name in a
   document that no longer matches the code is exactly its mandate, and a practice for catching that
   class does not exist yet. See `exchange/open/2026-09-21-convener-02`.
3. **The second sweep from its brief**, which it has not run: the schema the code assumes against
   the schema that exists. This is now urgent rather than theoretical. `apps/web` was written
   against `20260919000100_articles_native.sql`, which has never been applied, so its front page
   asks the live `articles` table for `slug`, `title`, `excerpt`, `published_at` and `body_html`
   and none of them exist.
4. **Whether a root `tsconfig.json` both workspaces extend is the right structural answer.**
   `builder` was asked to report on the cost and told not to build it, because standards are this
   seat's territory.

## How to reach it

`/dialecta-research architect --max 6` runs another training sprint. For a sweep, dispatch it with a
scoped target and remind it that every finding needs a file, a line, a fix and a rank.
