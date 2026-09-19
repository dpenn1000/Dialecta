# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | `scripts/voice_check.py`: which rules a regex can decide and which it cannot | The gate is the floor. Knowing exactly what it misses says where a human read is still required |
| todo | `.voiceignore` and the 1,667 hard hits in the April to May 2026 import | Forty three files are exempt. Any one of them may be cleaned, which is this agent's work when Dan asks |
| todo | The platform voices in Editorial Voice v1.2, and which surface each one speaks on | The agent brief says decide the speaker first. The list of speakers should be a filed note rather than a lookup each time |
| todo | `api/classify.js`: the live classification system prompt, which predates v1.2 and uses em dashes | Named drift in root `CLAUDE.md`. Changing it changes live output, so it needs its own commit and its own test |
| todo | The Trinity Platform Voice Guide these rules descend from, kept separate on purpose | Knowing which rules were inherited and which were written for Dialecta stops a well meant merge of the two |
