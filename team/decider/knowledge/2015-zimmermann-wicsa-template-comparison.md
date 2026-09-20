# Seven templates, one shared gap: traceability and ownership, not assumptions

**Source:** Olaf Zimmermann, Lukas Wegmann, Heiko Koziolek, Thomas Goldschmidt, "Architectural
Decision Guidance Across Projects: Problem Space Modeling, Decision Backlog Management and Cloud
Computing Knowledge", WICSA 2015, pp 85-94. Read via the lead author's self-archived preprint,
https://ozimmer.ch/assets/admentor-wicsa2015ubmissionv11nc.pdf, extracted through a text proxy
after two direct PDF fetches failed to parse. Cross-checked against an independent search summary
of the same paper.

## Summary

Lead confirmed, and it is the comparison the reading list wanted: a published paper, not a
maintained collection index. Seven templates, ordered by age: IEEE 42010 Template V2.2 (2011), IBM
UMF (1998, internal), Tyree/Akerman (2005), Bredemeyer Key Decisions (2005), Nygard's ADR (2011),
arc42 (2012), Y-statements (2012).

Their conclusion, close to verbatim: "there are many formats, with consensus about the core
attributes/aspects (e.g., AD outcome and why-justification), but significant variability regarding
traceability links and other types of attributes/aspects." IBM UMF and Tyree/Akerman read as the
most comprehensive; Nygard, arc42 and Y-statements sit at the lean end. Their practical
recommendation is not to crown one template but that "tools for decision capturing and sharing
should be flexible and configurable" across templates, because the split is real rather than a
maturity gap one template will close.

**Reliability caveat, checked against primary evidence this seat already holds.** The extraction
also claimed Nygard's ADR has no Status field at all. That is directly contradicted:
`doc/adr/0001` through `0009` of `npryce/adr-tools`, the origin project of the Nygard-style
tooling (read in full this same sprint, see `2018-npryce-adrtools-amendment-case.md`), and this
repo's own `docs/decisions/*.md`, all carry a `## Status` section. The extraction likely misread a
comparison-table column: Nygard is short on the accountability and traceability fields the table
tracks separately, not on Status. The broader conclusion above is corroborated by an independent
source before this fetch and is kept. The specific "Nygard has no Status field" line is not kept
and should not be repeated.

## Implies for Dialecta

- The field this repo already flagged as missing, the condition a decision rests on, is not the
  axis this comparison found most templates fighting over. Assumptions, Decision Drivers and
  Context is a solved problem across most of the field (Henderson note, Tyree note filed
  alongside); traceability and ownership are the open one. That does not weaken the `## Holds
  while` recommendation, it narrows the claim: the local template shares this gap with a
  well-documented minority (Tyree, MADR), not with every template surveyed.
- Ownership is a field the local template and Nygard both lack, and this seat has not previously
  raised it. Worth one line to Dan alongside `## Holds while`, not a second ADR field on its own:
  `docs/decisions/README.md` already carries authorship informally through git and the agent name
  in the file, so this may already be covered outside the template proper.
- Method note for this seat: a PDF comparison table is the one shape this sprint's tools read
  least reliably. Cross-check a single-source table extraction against a primary artifact already
  in hand before filing it as fact, the way the Status claim was caught here rather than repeated.

*Filed 2026-09-20*
