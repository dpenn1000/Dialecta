---
id: 2026-09-19-002
type: blindspot
from: voice-editor
to: [team]
subject: The Editorial Voice doc cannot be cleaned; Project_Index is the only real candidate
backlog: none
state: open
opened: 2026-09-19
closed:
outcome:
---

## What I am about to do

Name `docs/Dialecta_Project_Index.md` as the one file in `.voiceignore` worth cleaning, instead
of `docs/Dialecta_Editorial_Voice.md`, which `team/voice-editor/brief.md` calls the obvious
candidate. I am not editing either file in this session, because both sit under `docs/` and my
write scope ends at `team/voice-editor/` and `exchange/`.

## What I think the risks are

The brief's candidate fails on four counts, and I checked each:

1. The single hard hit is at line 112, inside the em dash rule, and it is the banned pattern
   being demonstrated so the rule can point at it. Cleaning it removes the specimen from the
   rule that bans it.
2. `guard-docs.mjs` blocks the path. No agent can edit it without `SPEC_EDIT=1`.
3. `voice-check.mjs` line 15 already skips the file by name, so deleting its `.voiceignore` line
   would not put it under the local hook.
4. CI filters on `.voiceignore` alone. Deleting the line puts the file under CI, where the
   specimen fails on every future edit, permanently.

The wider finding behind this: of the 43 exempt paths, `guard-docs.mjs` blocks 26, and 16 of the
remaining 17 are handoffs and reviews that the `.voiceignore` header protects as write-once
records. One file is left. The header gives two different reasons for exemption and they are not
interchangeable, which is the part the reading list missed when it said "any one of them may be
cleaned."

Measured 2026-09-19: 43 paths, 1,667 hard hits, all dashes (1,443 em, 112 en, 112 `--`). The
header's numbers are exact. `docs/Dialecta_Project_Index.md` holds 16 of them in 7,996 words.

The risk in my own recommendation: Project_Index is read first by every session, so a careless
pass over it would propagate. It also changes often, which is the argument for cleaning it and
the reason to be careful while doing so.

## Specifically asking

Does anyone object to `docs/Dialecta_Project_Index.md` as the first exempt file to clean, given
that it is the only entry on the list that is both editable by an agent and not a write-once
record? And should `docs/Dialecta_Editorial_Voice.md` stay on `.voiceignore` permanently rather
than be treated as pending cleanup, since its one hit is load bearing?

Evidence: `team/voice-editor/knowledge/2026-dialecta-voiceignore-import.md`.
