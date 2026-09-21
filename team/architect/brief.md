# architect: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/architect.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/architect.md` |
| Memory | `team/architect/practices.md` |
| Knowledge | `team/architect/knowledge/` |
| Leads | `team/architect/knowledge/reading-list.md` |
| Skills it owns | `/dialecta-research` trains it; it owns no skill of its own |

## Why this seat exists

Created 2026-09-21 at Dan's request: a seat that oversees code quality, optimization, dynamic
functions over hardcoding, and standardization, and that reads the wider world for current
practice. Dan asked whether one seat could also carry data engineering. It can, because both halves
are the same sentence at different layers: a definition exists in one place and the code does
something else. The mandate carries the six findings from 2026-09-20 that prompted it.

The boundary that keeps it from duplicating `reviewer`: `reviewer` judges a change, `architect`
judges what the changes have added up to. A finding visible in a diff belongs to `reviewer`.

## Where it is now

**Two sprints. Armed as of 2026-09-21.**

| | |
| --- | --- |
| Notes | 20 under `knowledge/`, indexed in `knowledge/index.md` |
| Practices | 37 in `practices.md`, each citing a filed note or the charter |
| Database instruments | 8 read-only catalog checks in `checks/`, each run against live |
| Code instruments | 5 pinned tools and 1 of the seat's own in `tools/`, calibrated against known answers |
| Library | `references/README.md`: vendor rulebooks pinned by commit, standards texts, tool docs |
| Access | `docs/handoffs/dialecta-handoff-2026-09-21-architect-access.md`: what works, and the read-only database server this seat still lacks |

**Everything from the first sprint's "next three" is done.** `builder` landed the
`opposing_view_engaged` fix (`c94af0c`) and both tsconfig flags; the convener re-measured the cost at
53 files, not this seat's 28, because `apps/web` typechecks nine files of `packages/core/src` under its
own options. The three by-hand findings are standing checks. knip and jscpd have run, with three
other tools.

**What the second sprint found while calibrating**, each routed to its owner through `exchange/`:

- `initialise_contributor_axes` is dead code. The revoke meant to close it left `anon` holding EXECUTE
  through PUBLIC; the convener closed it and `checks/anon-execute.sql` confirmed. The belief behind
  the bug is alive in `packages/core`, which follows the spec that "forming" is an archetype. Live
  disagrees. `architect-03`.
- The migration tree and the live history disagree: renamed files, files missing, files whose SQL
  is not what ran, and a baseline the CLI reads as pending. It happened again two hours later.
  `architect-04`.
- A person is keyed three ways and an article two, and a policy already compares the wrong key.
  `architect-05`.
- `apps/web` has untyped clients against stale generated types, no tests, and a CI without lint.
  Standards decided and handed over. `architect-06`.
- Classification rows cannot say which prompt produced them, and a free hygiene migration is waiting.
  `architect-07`.
- **Three of this seat's own tool runs reported clean and were wrong.** `tools/README.md` records
  each and what now prevents it.

**Settled with Dan, 2026-09-21:** the name stays `architect`, and the seat has read-only review
access on every platform (`.claude/agents/architect.md`, "Your access", applied by the convener at
`29ad3f9`). The rest of `mandate-proposal.md` is still proposed.

## Next three

1. **Run the eight checks through `supabase-dialecta-ro` once Dan signs in.** The grant is in the
   seat's tools. The first run through it proves the access works and whether each baseline still
   holds.
2. **Make the checks continual.** `migration-history.sql` found the same drift twice in two hours.
   Run it after every applied migration, then on a schedule once a read-only credential exists.
3. **Hold the rebuild to the map** (`architecture/2026-09-21-rebuild-map.md`, Dan's request of
   2026-09-21): the spine's three steps first, and each landing checked against its fitness function.
   Identity (`architect-05`, the map's step 2) and "forming" (`architect-03`) block the most. The
   measure of this seat is how many findings get fixed.
