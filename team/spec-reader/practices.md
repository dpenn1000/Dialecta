# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Start from `docs/Dialecta_Project_Index.md` to find which spec owns the topic, then read only that section | medium | `knowledge/2026-dialecta-project-index.md`, `knowledge/2026-dialecta-omitted-specs-map.md` | 2026-09-20 |
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
| A spec being current and a spec's own implementation being current are not the same claim. Check `packages/` against a spec before citing the spec as what the platform does today | high | `knowledge/2026-dialecta-axis-mapping-v1.md` | 2026-09-20 |
| A locked decision can outrun its own governing spec into shipped code. Check `packages/core` for a `CLAUDE.md`-cited constant before calling a locked value merely undocumented | high | `knowledge/2026-dialecta-classification-weighting-provenance.md` | 2026-09-20 |
| A spec's own status line can contradict a later locked-decisions summary of the same fact. Both are real; cite both and name which document is being asked | medium | `knowledge/2026-dialecta-tier-psychology.md` | 2026-09-20 |
| `drift-map.md` D5's one-line guesses at what an omitted spec owns are a starting point, not a citation. Read the file before repeating the guess | high | `knowledge/2026-dialecta-omitted-specs-map.md` | 2026-09-20 |
| A document's own heading or topic sentence is not the document. A hedge built on the heading alone can reverse completely once the body is read; read the full document before citing it as support, even under time pressure from another agent's blocking question | high | `2026-09-19-002-advice-a1-composer-request-path.md`, correction dated 2026-09-20 | 2026-09-20 |
| Naming a file and designing a feature are different claims. A spec that references another artifact by name (a "TUNING-marked" file, an API route) is not a spec for that artifact's behavior. When asked whether a spec "describes" something, check for design content, not just a mention | high | `drift-map.md` J1 | 2026-09-20 |
| When a spec-versus-backlog disagreement turns out to be spec-versus-spec-versus-backlog, with every governing document on one side, the leftover question is no longer which citation is right. It is whether the outlying artifact encodes real undocumented intent, which only Dan or decider can settle | high | `2026-09-19-002-advice-a1-composer-request-path.md` | 2026-09-20 |

## What moved 2026-09-19, and why

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

## What moved 2026-09-20, and why

Four new practices, all sourced to this sprint's notes: code can outrun its own spec silently
(`2026-dialecta-axis-mapping-v1.md`), a locked decision can graduate into shipped code sourced only
from `CLAUDE.md` (`2026-dialecta-classification-weighting-provenance.md`), a spec's status line and
a later locked-decisions summary can disagree about the same fact
(`2026-dialecta-tier-psychology.md`), and `drift-map.md` D5's one-line guesses need the same
verification as any other lead before they are repeated as fact
(`2026-dialecta-omitted-specs-map.md`).

None of the six reading-list leads worked this sprint turned out dead, but two came back
significantly wider than written: the Axis Mapping lead asked only about Ghost-era field names and
the answer included a full scoring-scheme divergence the lead did not anticipate, and the
weighting-provenance lead asked where a number came from and the answer became "it is now code, not
just a locked bullet." Read a lead as a question to verify, not as a bound on what the note covers.

## What moved 2026-09-20, Mission Zero pass

Three new practices, all sourced to answering four exchange records addressed to this seat directly
rather than to a self-directed reading-list sprint. The exchange forced two corrections a standing
sprint would not have: a prior hedge in `2026-09-19-002-advice-a1-composer-request-path.md`, that
`Dialecta_Supabase_Scaling.md`'s connection-saturation section might justify backlog A-1's async
design on the merits, was built on the section heading alone and reversed completely on a full
read, the document's own write-amplification table and its "already working in your favor" section
both endorse the blocking design Stage 1 specifies. And `designer`'s direct question, whether any
spec describes the article aesthetic pass, needed the new distinction between a document naming a
file and a document designing what it does; `Dialecta_Tuning_Engine_Spec_v1.md` does the former for
`aesthetic-suggest.js` and could be misread as the latter under time pressure.

The last seed-batch lead, `Dialecta_Delta_Mechanic_Spec.md`, closed clean and came back worse than
queued: not a comment-side Stage 2.5 definition, but a fourth document assuming one exists without
defining it. See `knowledge/2026-dialecta-delta-mechanic-spec.md` and `drift-map.md` I4.
