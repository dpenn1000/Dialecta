# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| filed | Michael Nygard, Documenting Architecture Decisions (2011), the origin of the ADR format | The repo already writes ADRs. The original argument for why they are short, dated and never edited belongs in the tree |
| filed | ADR practice collections and the variants of the format in wide use | ADR-001 through 003 fixed a local template. Knowing the variants says whether the local one is missing a field |
| filed | `.claude/skills/dialecta-council/SKILL.md`: the debate protocol this agent chairs | The chair's own procedure. It should be a filed note so a change to the protocol is a visible change |
| filed | The open decisions in the backlog: P0-D2, A-D1, A-D2, A-D3, and the phase B and C rows | The queue of work. Each row should carry what it blocks and which advisor cares most, before the first council run. Correction: phase B has one row, B-D1, and phase C has none |
| filed | Decision records that were later reversed, and what the record failed to capture | A decision log earns its place by being useful when it was wrong. Worth one note on what to write down for that case. Filed partly: no published case study of a specific reversed ADR was found, only practice guidance. Case study relisted below |
| todo | Jeff Tyree and Art Akerman, "Architecture Decisions: Demystifying Architecture", IEEE Software, 2005 | The source of the richest template and of the Assumptions field. Read so far only through Henderson's transcription, not the paper |
| todo | Zdun and others, "Sustainable Architectural Decisions", the Y-statement format, cited by adr.github.io | A one-sentence decision format. If it holds, the local `## Decision` section could carry the same discipline in a line |
| todo | The WICSA 2015 comparison of seven ADR templates, referenced by adr.github.io | A published comparison beats a collection index for judging whether the local template is missing a field |
| todo | A worked case of an ADR superseded in a public repo, with both records readable | The gap left by the reversal lead. What the first record failed to say is only visible when both records can be read against each other |
