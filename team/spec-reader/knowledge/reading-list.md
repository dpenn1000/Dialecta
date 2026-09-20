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

## Open

New leads found while reading the five above. Each one is a question this agent will be asked and
cannot currently answer from a filed note.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | `docs/Dialecta_Axis_Mapping_v1.md` v1.1 in full, separated into mapping rules against Ghost era plumbing | It answers Harmonization Tension 2, and the index does not list it. Its `Schema` and `Hook` sections name `ghost_post_id` and `api/article/publish.js`, both retired by ADR-001 and ADR-003. The rules survive the plumbing; nobody has written down which is which |
| todo | `docs/Dialecta_Self_Snapshot_Engine.md` v1.0 against `docs/Dialecta_Growth_Layer_Principles.md` Principle 6 | The spec that should place the assigned archetype in the three voice composition is silent on it. Worth a note of its own before the Tension 1 session, so that session starts from what is specified rather than from the index's prediction |
| todo | The nine other specs the index omits, one line each on what each owns | Half the corpus is off the map. Until this exists, answering "no spec owns that" requires a tree walk every time. See `2026-dialecta-project-index.md` |
| todo | `docs/Dialecta_Tier_Psychology.md` on the seven tiers, the naming principles and the commenter message tone standard | The mandate's canonical name list comes from `.claude/agents/spec-reader.md`, not from a spec. This is the spec that owns the names and the reasoning, and it is the single most likely subject of a question. No filed note covers it |
| todo | `docs/Dialecta_Classification_Engine_Specification.md`: the claim threshold, the 0 to 3 spectrum, the tier boundary rules | The operational backbone, per the index. Every classification question routes here. Verified clean on tier names; the content itself is unfiled |
| todo | Where the classification weighting percentages in root `CLAUDE.md` came from | They are locked as a decision and appear in no spec, while `docs/Dialecta_Article_Editorial_Template.md` line 198 lists the exact weight as an open question. See `drift-map.md` section F1. Either a spec is missing or the lock is premature |
| todo | `docs/Dialecta_Editorial_Voice.md` v1.2 as a constraint on this agent's own output | This agent writes notes that Voice v1.2 governs. It has never read the governing spec end to end, only run the regex subset in `scripts/voice_check.py` |
