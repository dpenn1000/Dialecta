# Glossary

*Written 2026-09-20. The project's own vocabulary, one word per thing. Where a word here disagrees with a word in an older file, this file wins and the older file gets fixed when it is next touched.*

Dialecta is a platform about reasoning through disagreement. Its internal vocabulary should come from deliberation, not from management. That rules out committee, stakeholder, workstream and deliverable, and it keeps council, seat, position, rebuttal and concede, which are the words for what actually happens here.

---

## The body

| Term | Means |
| --- | --- |
| **Council** | The whole standing body, both benches, eleven seats. The thing you convene. Use this word for the group in every context |
| **bench** | A group of seats that work the same way. Two exist |
| **advisory bench** | `treasurer`, `designer`, `philosopher`, `security`, `legal`. They hold positions, argue them, and write no code. Files live under `council/` |
| **working bench** | `builder`, `reviewer`, `voice-editor`, `migrator`, `spec-reader`, `decider`. They do the work and hold practices. Files live under `team/` |
| **seat** | One defined role, with a charter, a brief, and standing claims. A seat persists; the session occupying it does not |
| **agent** | The Claude Code subagent that occupies a seat for one session. An implementation detail, not a role. Say "the treasurer", not "the treasurer agent" |

## Who does what

| Term | Means |
| --- | --- |
| **advisor** | A seat on the advisory bench |
| **practitioner** | A seat on the working bench |
| **chair** | `decider`, when running a debate. The chair has no mandate of its own: it reads positions, names where the disagreement is real, runs at most one more rebuttal round, and writes the synthesis. Outside a debate, `decider` is an ordinary seat |
| **convener** | The session that dispatches missions, lands work, and speaks to Dan. Holds no position and never votes. **This replaces "lead", which currently means three different things in the same files** |
| **Dan** | Decides. Not a seat, not a vote, not bound by a synthesis |

## What gets written

| Term | Means | Lives in |
| --- | --- | --- |
| **charter** | What a seat is for, and where it stops. Written once, changed rarely, and only by Dan | `council/<seat>/charter.md` |
| **brief** | What a seat needs to know to start working. Changes often | `<bench>/<seat>/brief.md` |
| **position** | A claim an advisor will defend in debate, with the source it rests on. An advisory-bench word | `council/<seat>/positions.md` |
| **practice** | A rule a practitioner follows while working. Not argued, applied. A working-bench word | `team/<seat>/practices.md` |
| **record** | One item in the exchange. Four types: `handoff`, `blindspot`, `advice`, `vote`. Format in `exchange/SCHEMA.md` | `exchange/open/`, `exchange/closed/` |
| **ledger** | The one-line index of every record | `exchange/ledger.md` |
| **debate log** | The transcript of one debate: question, positions, rebuttals, chair synthesis, outcome | `council/log/<date>-<slug>.md` |
| **sprint note** | What a seat found while filling its shelf, including what it looked for and did not find | `council/log/sprints/` |
| **ADR** | A decision record. What a debate produces when it produces anything | `docs/decisions/` |

Position and practice are deliberately different words. An advisor's claim exists to be attacked. A practitioner's rule exists to be followed. Collapsing them would hide which one you are reading.

## What happens

| Term | Means |
| --- | --- |
| **sprint** | A research session that fills one seat's shelf. Produces filed sources and a sprint note |
| **debate** | One question, run by the chair: positions, rebuttals, synthesis, outcome. A debate that changes nobody's mind did not happen |
| **rebuttal** | The reply that makes a position survive or fall. A position that has never met one is an opinion |
| **concede** | Marking a position lost on the evidence. The outcome that makes training real, and the one most likely to be skipped |
| **blindspot** | A record raised by one seat about another's work. Carries a duty to answer or concede, not a suggestion |
| **vote** | A record where the chair asks the benches to choose. Advisory to Dan, never binding on him |
| **land** | Rebase onto `origin/main`, run the gates, fast-forward push. `node scripts/land.mjs --agent <seat>`. Not "merge", not "ship" |
| **close** | Move a record to `exchange/closed/` with an `outcome` line. A record with no path out of `open/` is a finding nobody finished |

## Units of work, largest to smallest

| Term | Size | Has |
| --- | --- | --- |
| **mission** | Multi-seat, spans several backlog rows, weeks | An entry gate, a done test, one handoff to the chair, an owner seat |
| **backlog row** | One scoped item, one seat, days | An id (`P0-3`, `A-1`, `B-2`), a spec section, an acceptance test |
| **debate** | One question, one sitting | A synthesis and an outcome |

The chair **charges** a bench with a mission. A mission is dispatched, not assigned.

## Say this, not that

| Not this | This | Why |
| --- | --- | --- |
| committee | Council | One name for one body. "Committee" is the word for a group that meets; "council" is the word for one that decides |
| think tank | Council | Consultancy vocabulary, and it names nothing this project has |
| lead (the role) | convener | "Lead" already means a research source to chase and the ordinary verb. Three meanings in one file is one too many. **A research lead stays a lead**, because "a lead to chase" is unambiguous in a reading list |
| the treasurer agent | the treasurer | The seat is the thing. The agent is how it runs today |
| stakeholder, workstream, deliverable | the person, the mission, the thing | Management words for deliberation work |
| ship, merge | land | One verb for one operation, and it is the name of the script |
| steward (for a seat) | seat, advisor, practitioner | **Taken.** Stewards are Dialecta's invited writers, a public-facing role. Do not overload it |

---

## The one rename, and why now

`tools/committee-api/`, `scripts/committee-service.ps1`, and the service name `DialectaCommittee` all carry the retired word. 265 lines across seven files, nearly all of them inside two files.

**Do it before the service is installed, not after.** The NSSM service does not exist yet. Renaming a path today is an edit; renaming it after Windows has a registered service named `DialectaCommittee` is an uninstall, an edit and a reinstall, plus a stale service if anyone forgets. This is the cheapest hour it will ever cost.

Target: `tools/council-api/`, `scripts/council-service.ps1`, service `DialectaCouncil`, port unchanged, token variable `COUNCIL_API_TOKEN`.

Everything else in this glossary is prose that gets fixed when a file is next touched. This one has a deadline.
