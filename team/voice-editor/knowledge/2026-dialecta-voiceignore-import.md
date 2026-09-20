# The 43 exempt files and who is allowed to clean them

## Citation

`.voiceignore` (header plus 43 paths) and `.claude/hooks/guard-docs.mjs`, read 2026-09-19 at
commit `060dede`. Counts measured with `PYTHONIOENCODING=utf-8 python scripts/voice_check.py`
over all 43 paths the same day.

## Summary

The header's numbers hold exactly. 43 paths, all present, **1,667 hard hits**, and all of them
are dashes:

| Hard rule | Hits |
| --- | --- |
| em dash (U+2014) | 1,443 |
| en dash (U+2013) | 112 |
| `--` pause | 112 |

One file carries a third of the total: `docs/handoffs/dialecta-coherence-audit.md`, 540 hits in
27,535 words. The next largest is `docs/Dialecta_Tier_Psychology.md` at 108.

### The lead's second sentence is wrong

`reading-list.md` said "Any one of them may be cleaned." Cross the list against
`guard-docs.mjs` and that collapses. The hook blocks every path under `docs/` except
`docs/handoffs/`, `docs/reviews/`, `docs/plans/`, `docs/decisions/`, and
`docs/Dialecta_Project_Index.md`.

| Group | Count | Can an agent edit it |
| --- | --- | --- |
| Canonical specs and articles | 26 | No. `guard-docs.mjs` blocks them |
| Handoffs | 15 | Yes, but write-once by the header's own reason |
| Reviews | 1 | Yes, but write-once |
| `docs/Dialecta_Project_Index.md` | 1 | Yes, and not write-once |

**One of 43 is cleanable by this agent.** The other 42 are blocked by the hook or
protected as records of what happened. The two exemption reasons in the header are not
interchangeable, and the difference decides who may act.

### The rulebook is the wrong candidate

The brief named `docs/Dialecta_Editorial_Voice.md` as the obvious file to clean, on the grounds
of a single hard hit. The hit is at line 112, inside the em dash rule, and it is the banned
pattern being demonstrated so the rule can point at it. Removing it removes the specimen from
the rule that bans it. Three further reasons:

1. `guard-docs.mjs` blocks the path.
2. `voice-check.mjs` line 15 already skips the file by name, so deleting its `.voiceignore` line
   would not put it under the local hook.
3. CI filters on `.voiceignore` alone. Deleting the line puts the file under CI, where the
   specimen fails on every future edit, permanently.

Filed as blindspot `2026-09-19-002`.

## Implies

- **`docs/Dialecta_Project_Index.md` is the file to clean first.** 16 hard hits in 7,996 words,
  the lowest dash density of any substantial file on the list. Root `CLAUDE.md` calls it the
  first thing to read when orienting, and the working conventions require updating it whenever a
  spec changes, so it keeps being edited while the gate keeps skipping it. Cleaning it and
  deleting its line puts the highest-churn exempt file back under CI.
- **A handoff or a review is never the answer to "what should we clean".** Rewriting one changes
  what the record says happened. The header says so and the reason is sound.
- **The list is paths, not patterns**, so a new handoff is gated normally. Anything written from
  here forward is held to v1.2 whether or not the import is ever cleaned.
- **Nothing outside `docs/` is exempt**, which is true and also misleading: the gates never read
  `.js` or `.ts` in the first place. See [[2026-dialecta-voice-check-gate]].

## Leads this raised

- `docs/handoffs/dialecta-coherence-audit.md` holds 540 of the 1,667 hits. If the import is ever
  cleaned wholesale, that file alone decides whether the job is an afternoon or a week.
- The `.voiceignore` header says the files "carry 1,667 hard-rule hits between them, all dashes."
  Confirmed to the digit. Worth re-measuring after any cleanup so the header stays honest.
