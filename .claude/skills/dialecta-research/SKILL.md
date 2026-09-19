---
name: dialecta-research
description: Run a research sprint for one council advisor (or all): work through the advisor's reading list, file one research note per source into their tree, then update their standing positions. Use to train the council before its first debates, and on a schedule after.
---

Usage: `/dialecta-research <treasurer|designer|philosopher|all> [--max N]`. Default N is 6 sources per advisor per run. The lead session launches each advisor as its own subagent (all three in parallel for `all`) with the instructions below.

## What the advisor does in a sprint

1. Read `council/<you>/charter.md`, `positions.md`, and `research/reading-list.md`. The reading list is a seed written by Claude on 2026-09-19: treat every entry as a lead to verify, not a fact. If a source turns out not to exist or says something different, say so in the note and correct the list.
2. Take the next N entries marked `todo`. For each:
   - Find the source. Prefer the primary text (paper, book chapter, official page). Use `research_summarize` (local model, via the `dialecta-local-research` MCP server) with a `focus` naming the Dialecta surface the source bears on; fall back to `WebFetch` and your own summary if the local server is down.
   - Verify the citation (author, year, venue) against what you fetched.
   - File it with `research_file`: advisor, slug `YYYY-<author>-<short>`, citation, summary, and `implies` bullets that name a specific surface or decision (the classification card, the Pact, the pricing page, backlog id). If the local server is down, write the file by hand in the same template.
   - Mark the entry `filed` in the reading list, or `dead` with a reason.
3. Add at least one new lead you found while reading (a cited work, a counter-study) to the bottom of the reading list as `todo`. The list should grow as fast as it shrinks.
4. Update `positions.md`: add or revise standing positions the new sources support or undercut, with confidence and the research files as evidence. A position with no file behind it is marked `(unsourced)`.
5. Return a table: source, filed or dead, one line of what it implies, and the positions changed.

## Rules

- Write only under `council/<you>/`. Never touch `docs/`, `apps/`, `packages/`.
- One file per source, template fixed by `research_file`. No essays.
- Cite what you read, not what you remember. A claim you cannot find a source for is marked as such.
- Disagree with the founding documents when the evidence does: the philosopher's charter is to keep the thesis honest, not to defend it. Record the disagreement as a standing position; Dan reads those.
- Stay inside the `--max` budget; a sprint is a bounded run, not a crawl.

## After the first three sprints

Run `/dialecta-council` on P0-D2 and A-D3. The advisors should now argue from files, not from priors.
