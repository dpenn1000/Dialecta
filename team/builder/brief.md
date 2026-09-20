# builder: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/builder.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/builder.md` |
| Memory | `team/builder/practices.md` |
| Knowledge | `team/builder/knowledge/` |
| Leads | `team/builder/knowledge/reading-list.md` |
| Skills it owns | `/dialecta-brief` briefs it; it owns no skill of its own |

## Where it is now

Sprint run 2026-09-19. Seven notes in `knowledge/`: the six reading-list leads plus one on what
A-1 requires. All six leads are `filed` and none is `dead`, but four carry a correction, so the
leads were right about their sources and wrong in what they assumed those sources said. The
corrections are in each note under "Correction to the lead" and summarised in the reading list.

Practices went from five rows to thirteen. Nine cite a filed note. The rest cite
`apps/web/CLAUDE.md`, `packages/core/CLAUDE.md` or root `CLAUDE.md`. No row cites the mandate on
its own any more, which was the point of the sprint.

One practice moved on evidence rather than gaining it. "Classification never blocks the comment
insert in the request path" is now marked contested, because `docs/Dialecta_Discourse_Layer_UX.md`
Stage 1 has the composer waiting on the Claude API while `.claude/agents/reviewer.md` check 1
makes that a correctness finding. That is posted as `exchange/open/2026-09-19-002` to
`spec-reader` and it is open.

The island list now has a mechanism behind it, written up under "Why the island list is what it
is" in `practices.md`. Reading it turned up drift: the mandate's list omits the article editor and
says votes and nominations where `apps/web/CLAUDE.md` says votes. The app file is the one to
follow.

Still true: this agent has built nothing. A-1 remains blocked behind P0-2 and P0-4, and is now
also waiting on `2026-09-19-002`.

Two things that cost the next thread time if it does not know them. The
`dialecta-local-research` MCP server did not connect this session, so every source here was read
through `WebFetch` and summarised by hand rather than by the local model. The server binary and
Ollama both answer when probed directly from this worktree, so the failure is the session's MCP
connection and not the tool. Separately, `research_file` cannot file for this agent at all: it
accepts only `treasurer`, `designer` and `philosopher` and writes to `council/<advisor>/research/`,
so the team half of `/dialecta-research` has no tool behind it and the notes are written by hand
in the same template.

## Next three

1. Read `exchange/open/2026-09-19-002`. If `spec-reader` has answered, fold the outcome into the
   contested practice and into `knowledge/2026-dialecta-a1-composer-requirements.md`, then close
   the record and rewrite its ledger line. If it is still open, leave it and take item 2.
2. Take the top lead on the reading list: `docs/Dialecta_Discourse_Layer_UX.md` has no Stage 2.5,
   though A-3 cites one, the Delta Mechanic spec assumes one, and root `CLAUDE.md` locks it at ten
   percent of the weighting. Read the Article Editorial Template's Stage 2.5 and establish whether
   the comment flow inherits it or needs its own section. That decides whether A-3 is buildable.
3. Run `npm install` at the root and read the `setAll` signature that `@supabase/ssr` 0.12.7
   actually ships. The docs show two arguments and a one-argument version would drop the cache
   headers without failing. `node_modules` is absent from this worktree, so the check has not been
   made.

## What this agent posts to the exchange

A `handoff` to `reviewer` on every finished item, with `## Traps` filled. An `advice`
record to `spec-reader` the moment a brief and a spec disagree, which its mandate already
tells it to stop for and which now has an address.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

Six leads filed or marked dead. Practices carry evidence from `knowledge/`, not from the
mandate. The agent can say what a client island costs and why the composer is one.
