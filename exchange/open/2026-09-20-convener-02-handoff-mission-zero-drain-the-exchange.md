---
id: 2026-09-20-convener-02
type: handoff
from: convener
to: [decider]
subject: Mission Zero, drain the exchange, and report what the exercise teaches about the Council
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## Done

Dan has set the order: one small mission first, against this list, then M1 to M4 one at a time in
rising complexity, so the Council trains on real work and systemic defects get repaired as they
surface rather than after.

This is that mission, and the exchange is the right subject for it. It is the only mission whose
subject is the Council itself, its scope is bounded and countable, and it exercises the one
mechanic that has never run at scale. Three records have ever closed, all three today, all three
by the chair in a single pass.

**Scope, measured 2026-09-20:** 23 open records, 45 seat-obligations.

| Seat | Records addressed to it |
| --- | --- |
| `decider` | 12 |
| `builder` | 9 |
| `reviewer` | 5 |
| `treasurer`, `spec-reader`, `philosopher`, `migrator`, `designer` | 4 each |
| `security` | 1 |
| `voice-editor`, `legal` | 0 addressed, 3 raised between them |

By type: 14 blindspots, 5 advice, 3 handoffs, 1 vote.

## Not done

**The scope is answering, not building.** A record reaches an outcome when the question in it has
been answered, not when the work it implies has shipped. "Answered, and the work belongs to
backlog row A-2" is a complete outcome. A seat that starts writing application code here has left
the mission.

This is the line that keeps Mission Zero small and keeps it distinct from M1 to M4. Several
records, especially the three reviewer blockers, imply real code. That code is M1's and M4's. Say
so in the outcome and move on.

**Four outcomes are available and closed is only one of them.**

| Outcome | When |
| --- | --- |
| `closed` | The question is answered on evidence in the repo, and the answer is written into `outcome:` |
| `answered` | A seat has replied substantively and the record stays open pending someone else |
| escalate to Dan | Only Dan holds the fact. Say precisely what you need from him, in one sentence |
| `abandoned` | Events overtook it. Say what overtook it |

**A record nobody can close is a finding, not a failure.** The chair refused to close the
migration-deviations record this morning because three of its seven items are Dan's data model to
decide, and that refusal was the most useful line in the pass. Repeat that judgment wherever it
applies. Do not close a record by deciding something that is not yours.

## Governing spec

`exchange/SCHEMA.md`, the front matter contract and the four record types.

## Acceptance

Three things, and the third is the one Dan asked for.

1. Every one of the 23 records carries an outcome, of the four above.
2. Every seat has engaged at least one record it did not write. **This is the training.** 266
   standing positions exist and not one has been contested by another seat. A seat that only ever
   reads its own findings is not in a council, it is in a diary.
3. A written answer to what the exercise taught, filed by the chair. The chair already has the
   diagnosis of why closing never happened: filing has a forcing function and closing has none.
   Mission Zero is the test of whether a forcing function is enough, or whether the mechanic
   itself needs changing. Report which.

## Traps

- **Do not produce new records to feel productive.** The count going up during a drain is the
  failure mode this mission exists to break. If a genuinely new finding surfaces, file it, and say
  in the outcome that you chose to.
- **`security-01` may already be closable.** It says production serves code existing in no
  repository and was marked as needing Dan because only he held the Vercel token. He supplied it,
  and all 163 files are recovered into `_recovered/`. The premise is gone. The P0-3 overwrite
  question inside it is a different question wearing the same record, so split it rather than
  closing the whole thing on the recovered half.
- **`legal`'s jurisdiction is wrong and that is systemic, not a typo.** Fourteen notes and its
  highest-confidence position rest on Connecticut, including "accept the Connecticut risk rather
  than spend on it" with the CTDPA enforcement numbers behind it. **Dan lives in Arizona.** Nothing
  in this repository has ever stated a jurisdiction, so `legal` inherited the assumption rather
  than inventing it, which is the point: an unstated premise that every note in a tree rests on.
  The consumer-residency half may survive, because CTDPA reaches anyone processing a Connecticut
  resident's data wherever they sit, and Dialecta plausibly has Connecticut readers. The
  establishment half does not. `legal` owns the correction.
- **Ghost tiers is closed by Dan directly.** He has confirmed no tiers were ever configured and
  that Dialecta is leaving Ghost entirely. Any record or open check waiting on that screenshot is
  answered.

## Do not touch

`apps/`, `packages/`, `supabase/`, `docs/`. This mission writes outcomes and answers, nothing else.
`_recovered/` stays quarantine: cite it, promote nothing.
