# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Correctness first, and trace one concrete input through the change before judging it | high | `.claude/agents/reviewer.md`; held up on PR 3, where tracing one PATCH request through `articles` found blocker B1 | 2026-09-19 |
| Every new table has RLS enabled and policies; ledger tables such as `axis_events` get no update or delete policy | high | `.claude/agents/reviewer.md`; `supabase/CLAUDE.md`; `knowledge/2026-postgresql-create-policy.md` | 2026-09-19 |
| RLS is row level only, so after checking that a policy names the right owner, list the table's columns and ask which of them that owner may write | high | `knowledge/2026-postgresql-create-policy.md`; `knowledge/2025-owasp-asvs-authorization.md` requirement 8.2.2 and BOPLA; found blockers B1 and B2 on PR 3 | 2026-09-19 |
| Trace every `dangerouslySetInnerHTML` back to the row and the policy that lets a user write that column, and treat an absent sanitizer in `package.json` as no sanitizer | high | `knowledge/review-checklist.md` row 11; blocker B1 on PR 3 | 2026-09-19 |
| A `security definer` function is a blocker until three things are true: `pg_temp` last in `search_path`, execute revoked from `PUBLIC`, and both in one transaction | high | `knowledge/2026-postgresql-security-definer.md` | 2026-09-19 |
| The `NEXT_PUBLIC_` prefix is the entire client-bundle boundary, so grep the diff for it and read every new name rather than reasoning about imports | high | `knowledge/2026-nextjs-environment-variables.md` | 2026-09-19 |
| A rule the database does not enforce is not enforced. Anything guaranteed only by a client island is reachable by a direct call with the anon key | high | `knowledge/2025-owasp-asvs-authorization.md` requirement 8.3.1 | 2026-09-19 |
| Code that contradicts a spec is a finding even when it works, and the severity rises when the code writes to an append-only table, because the wrong rows cannot be withdrawn | high | `.claude/agents/reviewer.md` check 3; blocker B3 on PR 3, where `axisDeltasFor` differs from `docs/Dialecta_Axis_Mapping_v1.md` on all six axes | 2026-09-19 |
| Check a claim in a comment or a CLAUDE.md against the code before repeating it. Three claims in PR 3 were wrong in a way no test could catch | medium | PR 3 findings S3, N1 and the stage 2.5 comment at `packages/core/src/resolution.ts:106` | 2026-09-19 |
| Verify the platform assumption before ranking a finding by it. Line endings, path spacing and default grants have all looked like findings and turned out not to be | medium | PR 3: the `.voiceignore` CRLF concern died on `git ls-files --eol`, which shows the index is LF | 2026-09-19 |
| The report is a table with severity, file and line, the claim, and the failure scenario, then one line: merge, or not yet | high | `.claude/agents/reviewer.md` | 2026-09-19 |
| Never edit. Bash is for read-only git, the test run, the typecheck, and `voice_check.py` | high | `.claude/agents/reviewer.md` | 2026-09-19 |
