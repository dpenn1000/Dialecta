---
name: dialecta-research
description: Run a research sprint for one agent (or all): work through its reading list, file one note per source into its tree, then update its standing positions or practices. Use to train an advisor before its first debate or a working agent before its first item, and on a schedule after.
---

Usage: `/dialecta-research <agent|all|council|team> [--max N]`. Default N is 6 sources per agent per run.
The lead session launches each agent as its own subagent, in parallel, with the instructions below.

Two families, one procedure. An advisor lives in `council/<name>/` with `positions.md` and
`research/`; a working agent lives in `team/<name>/` with `practices.md` and `knowledge/`. Read
`<folder>` and `<standing file>` below as whichever pair applies. `council` is the five advisors,
`team` is the six working agents, `all` is all eleven.

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

## Finding tools and repositories, not only reading

A source that changes what you believe is worth a note. **A tool that changes what you can do is
worth more**, and nothing in this sprint finds one unless you go looking. Spend part of every
sprint on the second kind.

Three places, in this order:

1. **The GitHub API through `WebFetch`**, which needs no auth and no shell:
   `https://api.github.com/search/repositories?q=<terms>&sort=stars&order=desc&per_page=10`
   Read `stargazers_count`, `pushed_at` and `archived` before you read the description. A
   four-year-dead repository with 20k stars is a museum piece, not a dependency.
2. **The local stack, which costs nothing per call.** Ollama runs on this machine with
   `qwen3-coder:30b`, `qwen2.5:14b`, `qwen3:8b` and `nomic-embed-text`. The
   `dialecta-local-research` MCP server already indexes every filed note across both families and
   answers semantic queries over them. **Search the index before you search the web**: another
   seat may have filed the thing you are about to go find.
3. **What the repository already carries.** `_recovered/` holds 163 files of production source
   recovered from a Vercel artifact, including 52 API handlers and 44 applied migrations. It is
   quarantine, so cite it freely and promote nothing from it.

File a tool the same way you file a source, with `implies` naming what it would let Dialecta or
this seat do that it cannot do today. A tool note that cannot finish that sentence is a bookmark,
and bookmarks do not go in the tree.

## Finish the research before the build, and question your own finding

Dan, 2026-09-20: **"Always complete research, question the findings, do a second pass if
necessary, and then build when we are confident."**

That is the house pace and it is not caution for its own sake. One day's work produced six things
that already existed, four line counts that were false, and three traps where the plausible
reading was the wrong one. Every one of them was cheap to catch by looking again and expensive to
carry forward.

**What a second pass actually means here.** Not re-reading your own note. Re-deriving the finding
by a different method and seeing whether it lands in the same place.

| The first pass | The second pass |
| --- | --- |
| A grep count of files matching a term | Reading enough of them to say what the match means |
| A line count | A line count that excludes compiled output, minified bundles and vendored code |
| What a document says a system does | What the implementation does |
| A number another seat reported | The number re-derived from the source, with your method stated |

**State your method.** A count without a stated method cannot be reconciled with a different count,
and two seats reporting different numbers for the same thing is common and usually means they
measured different things. `builder` and `security` both measured Ghost coupling in the recovered
front end on 2026-09-20 and reported figures that look contradictory and may not be. Neither
stated its method precisely enough to tell.

**When two seats disagree on a number, that is a finding rather than an error.** Say so, name the
other seat's figure, and say what would distinguish them. Do not average, do not defer, and do not
quietly adopt the other number.

**Confidence is a thing you are allowed to lack.** A brief that says the evidence does not reach
the question is a result. `circulation` refused to invent a replacement funnel figure and that
refusal was worth more than a number would have been.

## When a control depends on the answer, read the source

Three separate traps on 2026-09-20, all the same shape: **the thing that looks like the answer is
the thing that is wrong.** Not one of them could have been caught by reading more carefully,
because in each case the plausible reading was the wrong one and nothing signalled it.

| The trap | What it looks like | What it is |
| --- | --- | --- |
| `proxy.ts` | Every current Next.js sample puts auth checks there | Renamed from `middleware.ts` in 16.0.0. `apps/web` is on 15.5.25, so the file is never invoked and the check fails open, silently |
| `information_schema` | The standard place to read grants | Reported a grant that a direct `has_column_privilege` call contradicted |
| `identity_data->>'email_verified'` | The provider's verification claim | A normalised struct most providers never fill, stored as a confident `false` rather than a null |

Each was found by reading the implementation, and each had already produced or nearly produced a
wrong control. So: **documentation and a field name are enough to form a hypothesis and not enough
to build a control on.** When something you are about to recommend decides whether a check passes,
read the source that implements it and cite the file and the commit, not the doc.

This is a cost, so spend it where it pays: on the thing the control reads, not on everything.

**Judge a dependency before you recommend it.** Last release, open issue count, licence, and
whether one person can abandon it. `security` holds the supply-chain position and will ask.

## Rules

- Write only under your own folder, and in `exchange/` when you post a record. Never touch `docs/`, `apps/`, `packages/`.
- One file per source, template fixed by `research_file`. No essays.
- Cite what you read, not what you remember. A claim you cannot find a source for is marked as such.
- Disagree with the founding documents when the evidence does: the philosopher's charter is to keep the thesis honest, not to defend it. Record the disagreement as a standing position; Dan reads those.
- Stay inside the `--max` budget; a sprint is a bounded run, not a crawl.

## After a sprint

An advisor: run `/dialecta-council` on P0-D2 and A-D3 once all five have filed. They should
argue from files rather than from priors.

A working agent: the next three tasks in its `brief.md` are the rest of its training. Update the
brief's `## Where it is now` when a sprint changes it, so the next thread starts from the truth.

Either family: if the sprint surfaced something another agent needs, post it to `exchange/`
rather than leaving it in a note only you read.
