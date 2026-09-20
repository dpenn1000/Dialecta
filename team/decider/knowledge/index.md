# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source,
named `YYYY-<author>-<slug>.md` with citation, summary, and what it implies for a
named Dialecta surface or a named practice.

| File | Source | Implies for |
| --- | --- | --- |
| [2011-nygard-adr-origin.md](2011-nygard-adr-origin.md) | Michael Nygard, "Documenting Architecture Decisions", Relevance blog, 15 November 2011 | The local ADR template keeps four of Nygard's five sections. The one with no counterpart is Context, the forces in tension |
| [2026-henderson-adr-template-variants.md](2026-henderson-adr-template-variants.md) | Joel Parker Henderson, `architecture-decision-record` collection, GitHub, accessed 2026-09-19; Tyree and Akerman 2005; MADR 4.0.0 | Measured against the variants the local template is short exactly one field: the assumptions the decision rests on |
| [2026-microsoft-waf-adr-supersede.md](2026-microsoft-waf-adr-supersede.md) | Microsoft, "Maintain an architecture decision record (ADR)", Azure Well-Architected Framework, 2026-04-10 | A reversal is cheap when the old record named the condition that has since broken, and expensive when it did not |
| [2026-dialecta-council-protocol.md](2026-dialecta-council-protocol.md) | `.claude/skills/dialecta-council/SKILL.md`, this repo, read 2026-09-19 | The chair writes the frame before any advisor runs. P0-D2 gets its `## Question` file first |
| [2026-dialecta-open-decisions.md](2026-dialecta-open-decisions.md) | `docs/plans/backlog.md`, this repo, read 2026-09-19 | Five decisions are Open, not four. P0-D2 is first on merit: it is the only Open row in Phase 0 and it blocks P0-4 |
| [2005-tyree-akerman-architecture-decisions.md](2005-tyree-akerman-architecture-decisions.md) | Jeff Tyree and Art Akerman, "Architecture Decisions: Demystifying Architecture", IEEE Software, 2005 | Decisions form a hierarchy and ripple downstream; a schema choice forcing re-decisions upstream is iteration, not a failed process |
| [2013-zdun-sustainable-architectural-decisions.md](2013-zdun-sustainable-architectural-decisions.md) | Zdun, Capilla, Tran, Zimmermann, "Sustainable Architectural Design Decisions", IEEE Software, 2013 | The Y-statement cuts Status and Assumptions on purpose for reach. Real counter-evidence to `## Holds while`, named rather than resolved quietly |
| [2015-zimmermann-wicsa-template-comparison.md](2015-zimmermann-wicsa-template-comparison.md) | Zimmermann, Wegmann, Koziolek, Goldschmidt, WICSA 2015, seven-template comparison | Templates converge on outcome and reason, diverge on traceability and ownership. The missing field this repo already flagged is a minority gap, not a universal one |
| [2018-npryce-adrtools-amendment-case.md](2018-npryce-adrtools-amendment-case.md) | `npryce/adr-tools`, ADR-0005 (2016) and ADR-0009 (2018) | A record amending rather than superseding is a real third state. What ADR-0005 missed was the exact shape a `## Holds while` line would have caught |
