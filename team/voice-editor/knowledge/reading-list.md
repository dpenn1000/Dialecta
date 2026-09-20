# Reading list

Leads rather than facts. Every entry below is a lead to verify: confirm the source exists and
says what this line claims before filing a note on it. A lead that turns out to be wrong or
missing is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| filed | `scripts/voice_check.py`: which rules a regex can decide and which it cannot | The gate is the floor. Knowing exactly what it misses says where a human read is still required. Filed 2026-09-19: it decides 3 of the 7 hard rules and reads no `.js` or `.ts` at all |
| filed | `.voiceignore` and the 1,667 hard hits in the April to May 2026 import | Forty three files are exempt. Filed 2026-09-19: counts confirmed to the digit, but "any one of them may be cleaned" is wrong. `guard-docs.mjs` blocks 26 and 16 more are write-once records, leaving one |
| filed | The platform voices in Editorial Voice v1.2, and which surface each one speaks on | The agent brief says decide the speaker first. Filed 2026-09-19 with each voice mapped to the files that carry it |
| filed | `api/classify.js`: the live classification system prompt, which predates v1.2 and uses em dashes | Named drift in root `CLAUDE.md`. Filed 2026-09-19: the prompt has three copies, `api/comment.js` is the hot path, and `packages/core` already holds the v1.2 rewrite |
| filed | The Trinity Platform Voice Guide these rules descend from, kept separate on purpose | Knowing which rules were inherited and which were written for Dialecta stops a well meant merge of the two. Filed 2026-09-19: source verified at path 1 of the four the `voice` skill lists |
| todo | `.claude/hooks/voice-check.mjs` line 14 against the checker it describes | The comment says the checker honors the `voice-check: ignore-file` marker. No such handling exists in this repo's `voice_check.py`. Either port `_OPT_OUT` from Trinity or drop the claim |
| todo | `strings.ts` line 8: the six reference messages as "the fallback when the classifier's own message fails validation" | `parseClassification` checks only that the message is a non-empty string. Either the comment overstates the code or a voice validator is unwritten, which decides whether a bad message can reach a contributor |
| todo | The Breach message `[name]` placeholder in v1.2 and `strings.ts` | No substitution code exists anywhere. Backlog A-3 ships the card that would render it |
| todo | `docs/Dialecta_Editorial_Voice.md` line 364: the prompt "should defer to this document rather than restate it" | All three prompt copies restate it. Whether a runtime read is wanted, or restatement is the accepted practical form, is unrecorded |
| todo | `docs/handoffs/dialecta-coherence-audit.md`, 540 of the 1,667 hard hits in one file | If the import is ever cleaned wholesale, this file alone decides whether the job is an afternoon or a week |
| todo | The classify prompt copy in `dpenn1000/dialecta-api` at commit `53364fa` | That copy is the one serving contributors today and has never been read in this repo |
| todo | Trinity's "Appendix: the full catalog", the section v1.2 did not take | Worth one read to see whether anything in it belongs on a platform surface |
