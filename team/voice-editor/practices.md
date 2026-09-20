# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Read `docs/Dialecta_Editorial_Voice.md` first every time, never from memory of it | high | `.claude/agents/voice-editor.md` | 2026-09-19 |
| Observational: the message describes the comment and never judges the person | high | `docs/Dialecta_Editorial_Voice.md` v1.2 | 2026-09-19 |
| Two sentences per commenter message, and every tier below Breach ends with the door open | high | root `CLAUDE.md` locked decisions; `knowledge/2026-dialecta-platform-voices.md` | 2026-09-19 |
| Decide the speaker and the reader before editing a single sentence | high | `knowledge/2026-dialecta-platform-voices.md` | 2026-09-19 |
| A claim that cannot be verified from the spec is flagged, never rewritten into a different claim | high | `.claude/agents/voice-editor.md` | 2026-09-19 |
| A green `--strict` run is a floor, not a pass. The gate decides 3 of the 7 hard rules; name the mechanism, headers, and "reads as" still need a read | high | `knowledge/2026-dialecta-voice-check-gate.md` | 2026-09-19 |
| The gate's file scope decides what it protects. Neither CI nor the hook reads `.js` or `.ts`, so every system prompt is unguarded | high | `knowledge/2026-dialecta-voice-check-gate.md` | 2026-09-19 |
| Run the checker with `PYTHONIOENCODING=utf-8` on Windows, or a multi-file run aborts silently at the first character outside cp1252 | high | `knowledge/2026-dialecta-voice-check-gate.md` | 2026-09-19 |
| Treat a hard hit inside a code fence, a URL, front matter, or a quoted specimen as a false positive and say so, rather than editing the source to satisfy the regex | high | `knowledge/2026-dialecta-voice-check-gate.md`; `knowledge/2026-trinity-voice-guide.md` | 2026-09-19 |
| A file's presence in `.voiceignore` does not make it cleanable. Check `guard-docs.mjs` for permission and the header for whether the file is a write-once record | high | `knowledge/2026-dialecta-voiceignore-import.md` | 2026-09-19 |
| When a prompt or a string is duplicated, fix the copy on the hot path or say plainly which copies were left | high | `knowledge/2026-dialecta-classify-prompt.md` | 2026-09-19 |
| An inherited Trinity rule and a Dialecta rule carry equal force, and only the Dialecta ones can be argued from the platform's thesis. Do not merge the two guides | medium | `knowledge/2026-trinity-voice-guide.md` | 2026-09-19 |
