---
name: dialecta-research
description: Run a research sprint for one agent (or all): work through its reading list, file one note per source into its tree, then update its standing positions or practices. Use to train an advisor before its first debate or a working agent before its first item, and on a schedule after.
---

Usage: `/dialecta-research <agent|all|council|team> [--max N]`. Default N is 6 sources per agent per run.
The lead session launches each agent as its own subagent, in parallel, with the instructions below.

Two families, one procedure. An advisor lives in `council/<name>/` with `positions.md` and
`research/`; a working agent lives in `team/<name>/` with `practices.md` and `knowledge/`. Read
`<folder>` and `<standing file>` below as whichever pair applies. `council` is the three advisors,
`team` is the six working agents, `all` is all nine.

| Family | Folder | Standing file | Notes tree |
| --- | --- | --- | --- |
| advisor | `council/<you>/` | `positions.md` | `research/` |
| working agent | `team/<you>/` | `practices.md` | `knowledge/` |

A position is contested by design and carries confidence. A practice is settled until evidence
moves it and carries the same. Both are marked `(unsourced)` when no filed note backs them.

## What the advisor does in a sprint

1. Read your mandate (`council/<you>/charter.md` for an advisor, `.claude/agents/<you>.md` for a working agent), your `brief.md`, your standing file, and your reading list. The reading list is a seed written by Claude on 2026-09-19: treat every entry as a lead to verify, not a fact. If a source turns out not to exist or says something different, say so in the note and correct the list.
2. Take the next N entries marked `todo`. For each:
   - Find the source. Prefer the primary text (paper, book chapter, official page). Use `research_summarize` (local model, via the `dialecta-local-research` MCP server) with a `focus` naming the Dialecta surface the source bears on; fall back to `WebFetch` and your own summary if the local server is down.
   - Verify the citation (author, year, venue) against what you fetched.
   - File it with `research_file`: advisor, slug `YYYY-<author>-<short>`, citation, summary, and `implies` bullets that name a specific surface or decision (the classification card, the Pact, the pricing page, backlog id). If the local server is down, write the file by hand in the same template.
   - Mark the entry `filed` in the reading list, or `dead` with a reason.
3. Add at least one new lead you found while reading (a cited work, a counter-study) to the bottom of the reading list as `todo`. The list should grow as fast as it shrinks.
4. Update your standing file: add or revise the positions or practices the new sources support or undercut, with confidence and the filed notes as evidence. A row with no file behind it is marked `(unsourced)`.
5. Return a table: source, filed or dead, one line of what it implies, and the positions changed.

## Rules

- Write only under your own folder, and in `exchange/` when you post a record. Never touch `docs/`, `apps/`, `packages/`.
- One file per source, template fixed by `research_file`. No essays.
- Cite what you read, not what you remember. A claim you cannot find a source for is marked as such.
- Disagree with the founding documents when the evidence does: the philosopher's charter is to keep the thesis honest, not to defend it. Record the disagreement as a standing position; Dan reads those.
- Stay inside the `--max` budget; a sprint is a bounded run, not a crawl.

## After a sprint

An advisor: run `/dialecta-council` on P0-D2 and A-D3 once all three have filed. They should
argue from files rather than from priors.

A working agent: the next three tasks in its `brief.md` are the rest of its training. Update the
brief's `## Where it is now` when a sprint changes it, so the next thread starts from the truth.

Either family: if the sprint surfaced something another agent needs, post it to `exchange/`
rather than leaving it in a note only you read.
