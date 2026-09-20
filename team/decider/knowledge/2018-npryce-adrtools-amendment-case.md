# A record amending, not superseding: adr-tools' own ADR-0005 and ADR-0009

**Source:** `npryce/adr-tools`, `doc/adr/0005-help-comments.md` (dated 2016-02-13) and
`doc/adr/0009-help-scripts.md` (dated 2018-06-26), both read in full via the GitHub API,
2026-09-20. https://github.com/npryce/adr-tools/blob/master/doc/adr/0005-help-comments.md and
the same path for 0009.

## Summary

The lead as written asked for a superseded ADR with both records readable. What turned up is close
but not exact, and the gap between the two is itself the finding. `npryce/adr-tools`, the origin
project of the `adr` CLI this whole practice runs on, dogfoods its own tool across nine ADRs. None
supersedes another. Two **amend**: ADR-0005 is marked "Amended by [9. Help scripts]" and ADR-0009
is marked "Amends [5. Help comments]." Both stay Status: Accepted. Neither is marked Superseded,
and the tool ships `adr new -s` for exactly that relationship; whoever wrote ADR-0009 chose the
softer one on purpose.

ADR-0005 (2016) decided that help text lives in specially formatted comments at the top of each
script, parsed with `grep` and `cut`. Its own Consequences section named a real weakness in
advance: "This won't work if any subcommands are not implemented as scripts that use '#' as a
comment character." That is not what broke it.

ADR-0009 (2018, two years later) gives the actual reason for revision: "it means that help text
cannot include calculated values, such as the location of files." Static comment text cannot
compute anything; a subcommand whose help needed to show a real path had no way to produce it. The
fix keeps ADR-0005's mechanism for the simple case and adds generated help scripts for the case
that needs a computed value.

What the first record failed to capture, stated plainly: ADR-0005 anticipated the wrong failure
mode. It correctly foresaw a syntax problem, a non-`#` comment character, and missed the capability
problem, static text cannot compute, that actually forced the change two years later. The record
that revised it did not say ADR-0005 was wrong. It said the world ADR-0005 was written for did not
yet include dynamic help text.

## Implies for Dialecta

- Real evidence for the standing practice "record the condition the decision rests on, not only
  the reason that carried it" (`practices.md`, sourced from Henderson and the Microsoft WAF note).
  ADR-0005 recorded a reason and one anticipated risk. Neither was "help text will need to include
  a computed value someday," which is exactly the kind of condition a `## Holds while` line exists
  to hold. Had ADR-0005 said "holds while help text stays static," ADR-0009 would have confirmed an
  expiry instead of discovering a surprise.
- Nygard's own rule, never edited once accepted, mark superseded instead, is not universal even
  inside the project that built the tooling for it. Amend-in-place-by-cross-reference, old record
  kept Accepted, pointed at its own revision, is a real, used third state next to Accepted and
  Superseded. Worth naming to Dan as a option for a decision that a later one narrows without
  reversing, rather than forcing every revision through Superseded.
- Closes the reading list's own prior partial result honestly. No case of a superseded ADR with a
  clean what-it-missed story turned up this sprint either. What turned up instead answers the same
  underlying question, what does a later record see that the first one didn't, through the closest
  real, verifiable analogue this seat could find. Marked `filed`, not reopened as `todo`: the
  question the lead existed to answer now has a sourced answer, even though the artifact shape is
  Amended rather than Superseded.

*Filed 2026-09-20*
