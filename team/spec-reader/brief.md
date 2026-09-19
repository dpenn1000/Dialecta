# spec-reader: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/spec-reader.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/spec-reader.md` |
| Memory | `team/spec-reader/practices.md` |
| Knowledge | `team/spec-reader/knowledge/` |
| Leads | `team/spec-reader/knowledge/reading-list.md` |
| Skills it owns | None; it is the one the others ask |

## Where it is now

Five practices from its mandate. Zero filed notes. It has the largest corpus of any agent,
93 documents, and the corpus contradicts itself in known places.

## Next three

1. Run `/dialecta-research spec-reader`. Its leads are the corpus itself, starting with the project index.
2. Build the drift map: every place an ADR overrides an older spec, and every place a doc uses retired vocabulary. That is the single artifact that stops a confidently wrong citation.
3. Answer the three deferred design tensions in root `CLAUDE.md` with citations, without resolving them. Knowing exactly what each spec says is what makes them decidable later.

## What this agent posts to the exchange

It answers more than it posts. Its one case is a `blindspot` when two specs disagree and
nobody has asked yet, because that disagreement will surface as a build error later.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

A drift map exists. Any question about a tier, a pillar, or an archetype gets an answer
with a file and a heading, and retired names never reach a build.
