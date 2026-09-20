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
| Proposals | `team/voice-editor/proposals/` |
| Skills it owns | `/dialecta-voice` |

## Where it is now

Twelve practices, five filed notes, seven open leads. The first sprint ran 2026-09-19 and
cleared all five seeded leads. None was dead, though two carried wrong claims that the notes
correct.

What the sprint established:

- **The gate decides 3 of the 7 hard rules in v1.2.** Name the mechanism, headers, and "reads
  as" have no pattern at all, and two of those three are regex-decidable. A probe produced four
  hard hits that were all false positives and missed seven real violations.
- **Neither gate reads `.js` or `.ts`.** CI checks `*.md` and `apps/web/src/strings.ts`; the
  hook checks the same. Every classifier prompt sits outside both. That is how `api/` drifted.
- **The classifier prompt has three copies**, and `api/comment.js` is the hot path, not
  `api/classify.js`. `packages/core/src/classification.ts` already holds the v1.2 rewrite,
  versioned and tested. The proposal is about adoption, not authorship.
- **`.voiceignore` is exact**: 43 paths, 1,667 hard hits, all dashes. But only one of the 43 is
  cleanable by an agent. `guard-docs.mjs` blocks 26 and 16 more are write-once records.
- **The brief's own cleaning candidate was wrong.** `docs/Dialecta_Editorial_Voice.md` holds one
  hard hit and it is the banned pattern being demonstrated inside the rule that bans it.

Open on the exchange: `2026-09-19-002` (the cleaning target), `2026-09-19-003` (the gate never
reads the prompts, addressed to builder, reviewer and decider before A-2 is built).

Not done: nothing was cleaned. Both remaining candidates sit under `docs/`, outside this
agent's write scope, and `guard-docs.mjs` blocks the path.

## Next three

1. Take the answer on `2026-09-19-003`. It decides whether A-2 generates the commenter message
   at all, which decides whether this agent can ever gate engine output.
2. Clean `docs/Dialecta_Project_Index.md` (16 hard hits, 7,996 words) and delete its
   `.voiceignore` line. Needs `SPEC_EDIT=1` or Dan, since `guard-docs.mjs` allows the path but
   this agent's write scope does not reach `docs/`.
3. Work the `strings.ts` lead: its header calls the six reference messages a fallback for when
   the classifier's message "fails validation", and no voice validation exists. Either the
   comment overstates the code or the validator is unwritten.

## What this agent posts to the exchange

An `advice` record to `spec-reader` when a string makes a claim the spec does not support.
Its mandate says flag rather than rewrite, and the flag needs somewhere to land. A `blindspot`
when the brief and the evidence disagree, which is what happened to task three this sprint.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

The gate's blind spots are written down. A proposal exists for `classify.js` with sample output
before and after. One exempt file is cleaned and its line is gone from `.voiceignore`.

The first two are done. The third needs a write scope this agent does not have.
