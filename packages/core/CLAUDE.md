# packages/core, working context for Claude Code

The engine. Tier, pillar, and archetype constants; the classifier prompt and parser; final-tier resolution; axis mapping and ledger replay. Everything here is a pure function over plain data.

## Rules
- No I/O. No Supabase, no fetch, no env vars, no Anthropic client. Callers in `apps/web` do the I/O and hand results in.
- Test first. Every exported function has a test in `test/`. `npm test` runs vitest.
- Tunable numbers carry a `// TUNING:` comment so the future Tuning Engine page (`docs/Dialecta_Tuning_Engine_Spec_v1.md`) can find them.
- Scores are replayed from the ledger (`replayAxisScores(events)`), never incremented. Order-independent by construction.
- The prompt has a version (`CLASSIFIER_PROMPT_VERSION`). Bump it on any prompt text change and store it with each classification row.
- Spec sources: `docs/Dialecta_Classification_Engine_Specification.md` (tiers, specificity 0..3, boundaries), `docs/Dialecta_Axis_Mapping_v1.md` (pillar deltas), root `CLAUDE.md` (locked weighting 40/35/15/10). Code that contradicts them is drift; report it, do not amend the spec.

## Known open questions (do not resolve in code)
- Community re-review threshold (how many nominations, what window).
- Under the locked weights, community alone (35%) cannot outweigh AI (40%); it needs self-declaration to agree. Flagged in `resolution.ts`. A change is a spec decision.
- Consistency pillar needs history and is 0 in `axisDeltasFor`.
