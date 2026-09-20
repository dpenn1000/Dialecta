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
| `2026-dialecta-hook-opt-out-gap.md` | `.claude/hooks/voice-check.mjs` vs `scripts/voice_check.py`, against the Trinity upstream's `_OPT_OUT` | The ignore-marker claim is false and the fix is a five-line port, not a design decision |
| `2026-dialecta-fallback-never-fires.md` | `apps/web/src/strings.ts`, `packages/core/src/classification.ts` (`requireString`, `parseClassification`) | The strings.ts fallback has no validator and no caller; sharpens exchange record `2026-09-19-003` |
| `2026-dialecta-breach-name-unwired.md` | Repo-wide grep for `[name]`, `api/comment.js` | No substitution exists yet; becomes urgent at backlog A-3, not before |
| `2026-dialecta-prompt-restatement-is-the-form.md` | `docs/Dialecta_Editorial_Voice.md` line 364, `packages/core/src/classification.ts` | Restatement is the only form an LLM prompt can take; the doc's wording overclaims |
| `2026-dialecta-coherence-audit-density.md` | `docs/handoffs/dialecta-coherence-audit.md`, measured directly | Cleaning the hard-rule hits is an afternoon; the soft-rule hits are the week |
| `2026-dialecta-api-repo-inaccessible.md` | GitHub API (unauthenticated), root `CLAUDE.md` machine inventory | dialecta-api is unreachable from this seat without credentials; defers to security's deeper finding |
