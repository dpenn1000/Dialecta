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
| A code comment claiming a fallback or a validation is unverified until both the validator and its call site are read. A type check (`typeof v !== 'string'`) is not a content check | high | `knowledge/2026-dialecta-fallback-never-fires.md` | 2026-09-20 |
| An LLM system prompt cannot defer to a document at runtime. A spec that says "defer to X" is describing authoring discipline (derive from, version against), not a live dependency, and should be read that way even when its wording overclaims | high | `knowledge/2026-dialecta-prompt-restatement-is-the-form.md` | 2026-09-20 |
| An unauthenticated 404 on a named external repo is not proof the repo does not exist, only that this seat cannot see it. Cross-check the owner's public listing before concluding either way, and check whether another seat already has authenticated access before re-attempting the lookup | high | `knowledge/2026-dialecta-api-repo-inaccessible.md` | 2026-09-20 |
| The gate's fence, front matter, and URL stripping gap has a five-line fix already proven upstream in the Trinity script. Reach for that port before adding a new linting dependency for the same defect | high | `knowledge/2026-dialecta-hook-opt-out-gap.md` | 2026-09-20 |
| Before recommending a tool found by GitHub star count, check `pushed_at`, `archived`, and whether the top result is a mirror, a near-zero-star clone, or (for AI-detection searches specifically) a humanizer mislabeled as a detector | high | This sprint's tool search (2026-09-20): `write-good` last pushed 2025-03-10 despite 5,089 stars; several "AI text detector" results were humanizers, the opposite of what a voice gate needs | 2026-09-20 |
