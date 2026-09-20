# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Start from `docs/Dialecta_Project_Index.md` to find which spec owns the topic, then read only that section | medium | `knowledge/2026-dialecta-project-index.md` | 2026-09-19 |
| Ten specs in `docs/` are named nowhere in the index. Before answering that no spec owns a topic, list the tree | high | `knowledge/2026-dialecta-project-index.md`, `knowledge/drift-map.md` D5 | 2026-09-19 |
| Check `docs/decisions/` before quoting any spec on stack, identity, articles, or phasing. The specs predate the ADRs and none carries a marker | high | `knowledge/drift-map.md` A to C | 2026-09-19 |
| Quote the spec's own words for anything that constrains a build, and cite file and section heading | high | `.claude/agents/spec-reader.md` | 2026-09-19 |
| Cite by section heading first and line number second, and re-grep any line number taken from another document | high | `knowledge/drift-map.md` D3 | 2026-09-19 |
| When two specs disagree, cite both and do not resolve it | high | `.claude/agents/spec-reader.md`, applied in `knowledge/design-tensions.md` | 2026-09-19 |
| A document contradicting itself is the same case as two specs disagreeing. Cite both lines of the one file | high | `knowledge/drift-map.md` D1, D2, B2 | 2026-09-19 |
| When the spec is silent, say not specified rather than inferring | high | `.claude/agents/spec-reader.md` | 2026-09-19 |
| Not specified, not present, and present but superseded are three different answers. Name which one is being given | high | `knowledge/drift-map.md` H | 2026-09-19 |
| A retired name is not automatically drift. Separate live vocabulary from documented rationale, from the engine field against the pillar label, and from a verb describing a practice | high | `knowledge/drift-map.md` E2 to E5 | 2026-09-19 |
| Root `CLAUDE.md` locked decisions are not specs. When a locked value appears in no spec, say so and cite the spec that leaves it open | high | `knowledge/drift-map.md` F1 | 2026-09-19 |
| `docs/handoffs/` and `docs/reviews/` are write once history, not current spec. Never cite one as the current rule | high | root `CLAUDE.md`, "Working conventions" | 2026-09-19 |
| Treat `components/` as April exports, never as spec. Three of them still define a pillar as Charity | high | `knowledge/drift-map.md` E7, H2 | 2026-09-19 |
| Never write a file outside `team/spec-reader/` and `exchange/` | high | `.claude/agents/spec-reader.md`, `.claude/hooks/guard-docs.mjs` | 2026-09-19 |
| Voice v1.2 forbids em dashes, en dashes and `--` as a pause. When a quoted spec passage contains one, clip the quote at the dash and resume it rather than altering the spec's words | high | `scripts/voice_check.py`, root `CLAUDE.md` "Locked decisions" | 2026-09-19 |

## What moved this sprint, and why

The first practice dropped from high to **medium**. The mandate makes the index the entry point, and
the index is missing ten of the twenty three top level specs, including
`docs/Dialecta_Axis_Mapping_v1.md`, which is the one document that answers a question root
`CLAUDE.md` still lists as an open design tension. The method is sound where the map is complete.
Following it without a tree check produces a wrong "not specified", which is the failure this agent
exists to prevent.

Two practices are new and carry no precedent in the mandate: the three way distinction between not
specified, not present and superseded, and the four way classification of retired vocabulary. Both
came out of leads whose premises turned out to be wrong, which is the argument for verifying a lead
before filing on it.
