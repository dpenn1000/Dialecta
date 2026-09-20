# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source,
named `YYYY-<author>-<slug>.md` with citation, summary, and what it implies for a
named Dialecta surface or a named practice.

Two files below break that naming on purpose. `drift-map.md` and `design-tensions.md` are standing
artifacts rather than per source notes: each one spans several sources and is meant to be looked up
by topic, not by citation. Everything else follows the convention.

| File | Source | Implies for |
| --- | --- | --- |
| `drift-map.md` | `docs/decisions/ADR-001` to `003` against the specs they override, plus a full retired vocabulary sweep of `docs/` | Every citation this agent gives. Read the quick reference table before quoting any spec on stack, identity, articles, vocabulary, or classification weighting |
| `design-tensions.md` | The three deferred tensions in root `CLAUDE.md`, answered against `Dialecta_Contributor_Identity.md`, `Dialecta_Growth_Layer_Principles.md`, `Dialecta_Self_Snapshot_Engine.md`, `Dialecta_Axis_Mapping_v1.md`, `Dialecta_Delta_Mechanic_Spec.md` | The session that resolves them. Two of the three are stated wrongly in root `CLAUDE.md` line 83 |
| `2026-dialecta-project-index.md` | `docs/Dialecta_Project_Index.md` v0.16, May 2026 | The method itself. Which spec owns which topic, and the six places the map is wrong |
| `2026-dialecta-axis-mapping-v1.md` | `docs/Dialecta_Axis_Mapping_v1.md` v1.1, cross-checked against `packages/core/src/axis-mapping.ts` | Any Axis Mapping citation. The trigger table and universal rules are portable; two Ghost-era lines are not; the shipped code implements neither, a different scheme entirely |
| `2026-dialecta-self-snapshot-engine.md` | `docs/Dialecta_Self_Snapshot_Engine.md` v1.0 | Design Tension 1. Confirms archetype is not Voice 1, 2, or 3 anywhere in the spec that would place it |
| `2026-dialecta-omitted-specs-map.md` | The nine specs `drift-map.md` D5 names, one line each, verified | Answering what a given spec owns for any of the nine without a tree walk |
| `2026-dialecta-tier-psychology.md` | `docs/Dialecta_Tier_Psychology.md` v1.1 | The tier-naming canon and the commenter message tone standard. Flags Stance/Breach as provisional in the spec, locked in `CLAUDE.md` |
| `2026-dialecta-classification-engine-spec.md` | `docs/Dialecta_Classification_Engine_Specification.md` v1.0 | The claim threshold, the 0 to 3 spectrum, and the hardest tier boundaries. Confirms it does not cover final-tier resolution, despite backlog A-4 citing it for that |
| `2026-dialecta-classification-weighting-provenance.md` | Root `CLAUDE.md` line 66, cross-checked against `packages/core/src/resolution.ts` | Where the 40/35/15/10 weighting came from. Now shipped code sourced from `CLAUDE.md` alone; the algorithm itself has no spec anywhere |
| `2026-tools-doc-drift-and-link-checking.md` | GitHub search API, four queries | Tooling this seat could adopt. `lychee` for this seat's own links; nothing recommendable for doc-drift or spec-conformance tooling; ADR tools don't solve the ADR-to-spec link gap |
