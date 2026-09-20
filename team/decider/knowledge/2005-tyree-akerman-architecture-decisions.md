# Tyree and Akerman on architecture decisions: assumptions, hierarchy, and iteration

**Source:** Jeff Tyree and Art Akerman, "Architecture Decisions: Demystifying Architecture", IEEE
Software, Vol 22 No 2, March/April 2005, pp 19-27. DOI 10.1109/MS.2005.27. Read via
https://personal.utdallas.edu/~chung/SA/zz-Impreso-architecture_decisions-tyree-05.pdf (the
authors' own posted copy, mirrored on a university site; extracted through a text proxy after
direct PDF parsing failed).

## Summary

Lead confirmed, and upgraded from secondary to primary. The 2026-09-19 note on Henderson's
collection read this template through a transcription; this note reads the paper itself, and the
fourteen fields match exactly, so the transcription was accurate: Issue, Decision, Status, Group,
Assumptions, Constraints, Positions, Argument, Implications, Related Decisions, Related
Requirements, Related Artifacts, Related Principles, Notes.

The paper's own words on Assumptions: "Clearly describe the underlying assumptions in the
environment in which you're making the decision, cost, schedule, technology, and so on." The
stated reason: "environmental constraints (such as accepted technology standards, enterprise
architecture, commonly employed patterns, and so on) might limit the alternatives you consider."
Assumptions records why the option set was narrowed before Positions was even reached, which
Positions and Argument alone do not capture.

Beyond the fields, the paper argues decisions form a hierarchy: one decision "introduce[s] a need
to make other decisions", and because of that, "changes in D01 will likely ripple across the whole
decision hierarchy." When "a downstream decision creates a suboptimum solution," the architect must
"alter some or all dependent decisions," which the paper treats as iteration rather than a defect
in the process. And in agile delivery, decisions are communicated as provisional: "the architect
communicates each decision separately, with the caveat that it's subject to change due [to] the
effects of downstream work."

## Implies for Dialecta

- Confirms `2026-henderson-adr-template-variants.md`'s field list and Assumptions definition.
  Nothing here revises that note's recommendation: one field, not three.
- The hierarchy and ripple point is new, not in the Henderson-only note, and it bears directly on
  a live record. `exchange/open/2026-09-19-002-advice-migration-spec-deviations.md`, still open
  as of this filing, names seven deviations from the Data Architecture spec found in the September
  migrations. Adopting the live schema is a downstream choice that forces re-deciding upstream
  design choices, items 2, 5 and 6 in that record, rather than a single clean revert. Tyree and
  Akerman would call that iteration, not a sign the earlier work or this process failed.
- The "communicated as provisional" point supports treating a `decider` recommendation as
  commit-and-revise at the backlog-row level, distinct from Nygard's rule that the ADR record
  itself, once Decided, is never edited. One governs the work described; the other governs the
  record describing it. They do not conflict, but the difference is worth stating plainly next
  time a recommendation reads as more final than it is.

*Filed 2026-09-20*
