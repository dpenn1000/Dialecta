# The coherence audit's 540 hits, broken down

## Citation

`docs/handoffs/dialecta-coherence-audit.md` (27,535 words, 2,077 lines), checked with
`PYTHONIOENCODING=utf-8 python scripts/voice_check.py`, read 2026-09-20 at commit `c4ca6406`.
Total cross-checked against [[2026-dialecta-voiceignore-import]], which counted 540 for this
file inside the 1,667-hit, 43-file total.

## Summary

The count holds exactly: 540 hard hits, confirmed by running the checker against this one file
in isolation rather than trusting the prior aggregate.

| Rule | Hits | Share of 540 |
| --- | --- | --- |
| em dash | 471 | 87% |
| en dash (mostly date and month ranges: "Phases B-E", "0-3 months") | 69 | 13% |

Both counts are dense but mechanical. Sampling the contexts the checker prints: the em dashes
are almost entirely the label-separator pattern v1.2 names by name ("Diagnostic only, no
fixes", "1, Pilot"), and the en dashes are almost entirely numeric ranges that the hard rule
already has a direct fix for (a plain hyphen). Neither category needs judgment calls at the
density this file shows; both are close to mechanical find-and-replace once a human, not this
agent, decides the file may be touched at all.

The file also carries 67 soft hits, dominated by antithesis padding (43, "X, not Y"
constructions typical of a vision document) and intensifiers (17). Those need a reader, not a
script, and would take materially longer than the hard-rule pass.

## Implies

- **The lead's question is answered: an afternoon, not a week, if it is ever cleaned, and only
  for the hard rules.** 540 mechanical hits in a single file with a consistent, small set of
  patterns (label-separator em dashes, ranged en dashes) is a bounded find-and-replace pass, not
  an editorial rewrite. The 67 soft hits are the part that would take a week, and nothing
  requires those to be fixed for the file to leave `.voiceignore`.
- **This file is still not a candidate for this agent to touch.** [[2026-dialecta-voiceignore-import]]
  already established it is a write-once handoff record; rewriting it changes what the record
  says happened, regardless of how mechanical the edit would be. This note is the effort
  estimate for whoever, someday, decides the record itself should be superseded rather than
  edited.
- **Practice confirmed, not changed:** a hit count from an aggregate note is worth re-running in
  isolation before it is cited elsewhere. It matched here; it will not always.

## Leads this raised

- None new. This closes the lead it was opened to check.
