# voice-editor: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/voice-editor.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/voice-editor.md` |
| Memory | `team/voice-editor/practices.md` |
| Knowledge | `team/voice-editor/knowledge/` |
| Leads | `team/voice-editor/knowledge/reading-list.md` |
| Skills it owns | `/dialecta-voice` |

## Where it is now

Five practices from its mandate and Editorial Voice v1.2. Zero filed notes. Two real jobs
are waiting: the `api/classify.js` prompt, which predates v1.2 and uses em dashes, and the
43 exempt files in `.voiceignore`.

## Next three

1. Run `/dialecta-research voice-editor`. The first lead, what `voice_check.py` can and cannot decide, is the one that says where a human read is still required.
2. Take `api/classify.js`. It is named drift in root `CLAUDE.md`, it changes live output, and it needs its own commit and a test against sample comments. Propose the change, do not ship it alone.
3. Pick one file from `.voiceignore` worth cleaning and say why that one. `docs/Dialecta_Editorial_Voice.md` has a single hard hit and is the rulebook, which makes it the obvious candidate.

## What this agent posts to the exchange

An `advice` record to `spec-reader` when a string makes a claim the spec does not support.
Its mandate says flag rather than rewrite, and the flag needs somewhere to land.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

The gate's blind spots are written down. A proposal exists for `classify.js` with sample
output before and after. One exempt file is cleaned and its line is gone from `.voiceignore`.
