# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

## Worked 2026-09-19

The five seed leads. Four filed, one filed with its premise corrected. None turned out to be dead;
one turned out to be backwards, which is recorded rather than discarded.

| State | Lead | Outcome |
| --- | --- | --- |
| filed | `docs/Dialecta_Project_Index.md` v0.16: which spec owns which topic, and the open tensions it names | `2026-dialecta-project-index.md`. Verified. The map is real and useful for ten specs and silently omits ten others. Six internal defects recorded |
| filed | The superseded vocabulary across the archive: Static for Stance, Off the Air for Breach, steelman for Advocate | `drift-map.md` section E. **Premise corrected.** No doc in `docs/` uses a retired tier name as live vocabulary; the Classification Engine fix landed. Two genuine retired pillar names survive, in files nobody had surveyed |
| filed | The three deferred design tensions named in root `CLAUDE.md` | `design-tensions.md`. Verified they are named there, line 83. Two of the three are stated wrongly on that line |
| filed | ADR-001, ADR-002 and ADR-003, and what each one overrides in the older specs | `drift-map.md` sections A to C. Verified. Each ADR carries its own `## Specs touched`; between them they miss two files, name one section that does not exist, and leave one instruction uncarried |
| filed | The cloud-only OneDrive files that did not copy on 2026-09-08 | `drift-map.md` section H. **Count corrected:** twelve named paths plus two logos, not eleven. One is present and wrongly listed, four are present but superseded, seven are absent |

## Worked 2026-09-20

Six leads, the first six of seven then open. All six filed; none dead. Two came back wider than the
lead expected: the Axis Mapping lead asked about Ghost plumbing and the bigger finding was that the
shipped code replaced the rules themselves, and the weighting-provenance lead asked where the
numbers came from and the bigger finding was that they are now shipped code sourced from `CLAUDE.md`
directly, with an algorithm no document describes.

| State | Lead | Outcome |
| --- | --- | --- |
| filed | `docs/Dialecta_Axis_Mapping_v1.md` v1.1 in full, separated into mapping rules against Ghost era plumbing | `2026-dialecta-axis-mapping-v1.md`. The Ghost plumbing is two lines and the port already dropped them. **Premise widened:** the port also replaced the trigger table itself with a different, continuous scheme on every axis, which the lead did not anticipate |
| filed | `docs/Dialecta_Self_Snapshot_Engine.md` v1.0 against `docs/Dialecta_Growth_Layer_Principles.md` Principle 6 | `2026-dialecta-self-snapshot-engine.md`. Verified directly: archetype is absent from the Data Model table and from the five Open Questions, not merely unplaced |
| filed | The nine other specs the index omits, one line each on what each owns | `2026-dialecta-omitted-specs-map.md`. Two of nine needed `drift-map.md` D5's guess corrected once read: Founding Philosophy is explicitly internal-only, and Growth Scroll is a session record, not a spec |
| filed | `docs/Dialecta_Tier_Psychology.md` on the seven tiers, the naming principles and the commenter message tone standard | `2026-dialecta-tier-psychology.md`. Full naming rationale and the five-rule tone standard filed. **New finding:** the spec's own status line still calls Stance and Breach provisional; root `CLAUDE.md`'s lock carries no such caveat |
| filed | `docs/Dialecta_Classification_Engine_Specification.md`: the claim threshold, the 0 to 3 spectrum, the tier boundary rules | `2026-dialecta-classification-engine-spec.md`. Filed clean. **New finding:** the spec does not cover final-tier resolution at all, though backlog row A-4 cites it for exactly that |
| filed | Where the classification weighting percentages in root `CLAUDE.md` came from | `2026-dialecta-classification-weighting-provenance.md`. Confirmed: no spec, anywhere. **New since the lead was written:** the numbers are now implemented in `packages/core/src/resolution.ts`, sourced from `CLAUDE.md` directly, and the resolution algorithm itself has no prose spec at all |

## Worked 2026-09-20, Mission Zero pass

One seed lead closed, plus one unqueued finding filed as a byproduct of answering the exchange
directly (`exchange/README.md`'s learning loop: a record that closes without teaching anyone
something was overhead).

| State | Lead | Outcome |
| --- | --- | --- |
| filed | `docs/Dialecta_Delta_Mechanic_Spec.md` in full, to confirm or correct whether it is where a comment-side Stage 2.5 lives | `2026-dialecta-delta-mechanic-spec.md`. **Confirmed false, and worse than the lead framed it.** Not a Stage 2.5 definition; it is a fourth document that cites "Stage 2.5" as an existing comment-classification step (twice) without ever defining it. `drift-map.md` I4 |
| filed (unqueued) | Whether any spec in `docs/` describes the article aesthetic/polish pass, asked directly by `designer` in `2026-09-19-005-blindspot-aesthetic-suggest-exists-in-production.md` | `drift-map.md` J1. No governing spec. Two documents name `aesthetic-suggest.js` in passing (`Dialecta_Tuning_Engine_Spec_v1.md`, `Dialecta_Project_Index.md`'s build log); neither specifies its design. Working production code for a feature nobody wrote a spec for |

## Open

Two leads left from the seed batch and the six worked 2026-09-20.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | `docs/Dialecta_Editorial_Voice.md` v1.2 as a constraint on this agent's own output | This agent writes notes that Voice v1.2 governs. It has never read the governing spec end to end, only run the regex subset in `scripts/voice_check.py` |
| todo | `packages/core/src/classification.ts` against `docs/Dialecta_Classification_Engine_Specification.md`'s Stage A output fields | `axis-mapping.ts` turned out to implement a different scheme than its own spec, undocumented (`2026-dialecta-axis-mapping-v1.md`). `classification.ts` is the natural next file to check for the same kind of drift, since `axisDeltasFor()` takes a `ClassificationResult` from it as its only input |
| todo | `docs/Dialecta_Data_Architecture.md` in full | Cited more than almost any other spec, piecemeal, across `drift-map.md` A1, A2, B1, B2, C3 and G2. Never read end to end or filed as its own source, despite being the file every entity-table and identity-type question eventually routes to |
