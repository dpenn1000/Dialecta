# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source,
named `YYYY-<author>-<slug>.md` with citation, summary, and what it implies for a
named Dialecta surface or a named practice.

| File | Source | Implies for |
| --- | --- | --- |
| `2026-dialecta-voice-check-gate.md` | `scripts/voice_check.py`, against v1.2 "Hard rules" and the upstream Trinity script | Every file this agent touches; the gate covers 3 of 7 hard rules and never reads `.js` or `.ts` |
| `2026-dialecta-voiceignore-import.md` | `.voiceignore` (43 paths) and `.claude/hooks/guard-docs.mjs` | Which exempt file may be cleaned. One of 43 qualifies: `docs/Dialecta_Project_Index.md` |
| `2026-dialecta-platform-voices.md` | `docs/Dialecta_Editorial_Voice.md` v1.2, "Speaker and audience" and "Commenter Message Design Principles" | Naming the speaker before editing; which file each of the four voices owns |
| `2026-dialecta-classify-prompt.md` | `api/classify.js`, `api/comment.js`, `packages/core/src/classification.ts`, backlog A-2 | The classify proposal; the prompt has three copies and the v1.2 rewrite already exists in core |
| `2026-trinity-voice-guide.md` | `_meta/voice/Voice-Guide.md`, Trinity Platform repo | Which rules were inherited and which are Dialecta's; why the two guides stay separate |
