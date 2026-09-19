# ADR template variants in wide use, and what they add to Nygard

**Source:** Joel Parker Henderson, `architecture-decision-record` collection, GitHub, accessed 2026-09-19. https://github.com/joelparkerhenderson/architecture-decision-record. Two templates in it read in full: Jeff Tyree and Art Akerman (from "Architecture Decisions: Demystifying Architecture", IEEE Software, 2005) and MADR 4.0.0, released 2024-09-17, https://adr.github.io/madr/. Cross-checked against https://adr.github.io/.

## Summary

Lead confirmed. Collections of ADR variants exist and are maintained, and the variants differ in a way that answers the question the lead was set to answer.

The Henderson collection catalogs at least nine named templates: Nygard, Tyree and Akerman, MADR, EdgeX, arc42, the Alexandrian pattern, a business case template, Planguage, and Larranaga's Important Technical Decisions.

Tyree and Akerman is the richest, at fourteen fields: Issue, Decision, Status, Group, Assumptions, Constraints, Positions, Argument, Implications, Related Decisions, Related Requirements, Related Artifacts, Related Principles, Notes. **Assumptions** is defined as "the underlying assumptions in the environment in which you're making the decision, cost, schedule, technology, and so on." **Positions** is the list of viable alternatives considered. **Argument** is why one position won.

MADR 4.0.0 has nine parts, three of them required: Context and Problem Statement, Considered Options, Decision Outcome. The optional ones are Decision Drivers, Consequences, Confirmation, Pros and Cons of the Options, More Information, plus YAML front matter. **Decision Drivers** are the forces or concerns that steer the outcome. **Confirmation** is how compliance with the decision will later be checked.

Across the three, the field that Nygard lacks and that everyone else added in some form is the same one: the conditions under which the choice is right. Tyree calls it Assumptions, MADR calls it Decision Drivers, Nygard folds it into Context. The second common addition, the list of alternatives, the local template already has.

## Implies for Dialecta

- Measured against the variants, the local template is complete on options and consequences and short exactly one field: **the assumptions the decision rests on**. Tyree's Assumptions, MADR's Decision Drivers and Nygard's Context are three names for it. Nothing in `## Question`, `## Options considered`, `## Decision`, `## Consequences` or `## Specs touched` holds it.
- The local `## Options considered` table already beats Nygard. Its four columns, Costs now, Costs later, Forecloses, are a compressed Pros and Cons of the Options, and "Forecloses" is a column none of the surveyed templates has. Keep it. This is not a gap.
- MADR's **Confirmation** is the second candidate, and it should be declined for this repo. Dialecta already has `## Specs touched` plus a backlog row moving to Decided, which is where compliance shows up. Adding Confirmation would duplicate that.
- Tyree's Related Decisions is worth nothing here yet at three ADRs, and `docs/decisions/README.md` already indexes them. Revisit at roughly fifteen records.
- One field, not three. The recommendation to Dan is a single new section and nothing else, because Nygard's stated reason for the format is that long records do not get written.

*Filed 2026-09-19*
