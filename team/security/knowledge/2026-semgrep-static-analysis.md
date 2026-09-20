# Semgrep and CodeQL, static analysis for JavaScript and TypeScript

**Source:** Semgrep, "semgrep/semgrep", GitHub repository, a pattern-based static analyzer, read 2026-09-20. https://github.com/semgrep/semgrep

## Summary

Semgrep matches rules written to look like the source code they target, rather than needing a full data-flow model, which makes rules fast to write and fast to run. The repo shows 16.7k stars, 1.1k forks, and an active `develop` branch with 10,297 commits. It ships `.pre-commit-hooks.yaml`, so it runs as a pre-commit hook directly, and it runs in GitHub Actions either as a plain CLI step or via `semgrep ci`, which reads the diff and can comment on a pull request. The Semgrep Registry (registry.semgrep.dev) hosts community rule packs; the repo's own description cites over 2,000 community rules across 30-plus languages. Individual pack pages render client-side and did not return readable content through a plain fetch here, so the exact rule count of any one pack is not verified in this note, but named packs exist for Node-specific issues (`p/nodejsscan`) and OWASP-mapped findings (`p/owasp-sf`), alongside general JavaScript and TypeScript packs. The dependable first invocation is `semgrep --config auto`, which selects packs based on the languages and frameworks it detects in the repository.

GitHub CodeQL (`github/codeql`, 10.1k stars, MIT, 90,161 commits) takes the opposite approach: it compiles code into a relational database and runs queries with real data flow and taint tracking, which catches a bug a pattern match misses, such as a value flowing from a request body to a database call across several functions, at the cost of a slower analysis. Its "default setup" needs no workflow file at all, a checkbox in the repository's Security tab is enough, and it is free for public repositories on GitHub.com.

Neither tool understands Supabase row level security or a missing `require_role` check by itself; both flag code shapes, not authorization intent. What they do catch here is the shape of bug this project already has: a handler that reads a request body or a route param and writes to a database or calls a paid API with no check above it.

## Implies for Dialecta

- `apps/web`'s `eslint.config.mjs` runs `next/core-web-vitals` and `next/typescript` only, and `npm run lint` is not even called in `.github/workflows/ci.yml` today (the workflow runs typecheck, test, and the voice check, and stops). This project currently ships no static analysis gate of any kind, security-focused or otherwise.
- CodeQL's default setup is the lowest-effort addition given the repo is public: no new workflow file, no maintenance burden, and it covers both `apps/web` (JavaScript/TypeScript) and the legacy `api/` functions.
- Semgrep is the better fit for the two bug classes already named in this project's own `security` agent brief (`.claude/agents/security.md`): an unauthenticated write and a missing auth check on an API route. A rule like `p/owasp-sf`, or a short custom rule matching a request parameter reaching a Supabase `.insert()` or `.update()` call with no auth check earlier in the same function, is the kind of thing pattern matching finds cheaply that taint analysis would also find, more slowly.
- The concrete target for a custom rule is `api/profile/[id].js`'s live counterpart in `dpenn1000/dialecta-api`: the finding already on record (`team/security/practices.md`) is a GET that inserts a row with a caller-controlled `display_name`. A rule flagging "an HTTP handler with no `req.method` branch that also calls a Supabase write" would have caught the shape of it, had it run against that repository.
- Wire semgrep as a pre-commit hook first, since nothing runs pre-commit today, then add `semgrep ci` to `.github/workflows/ci.yml` once the pre-commit pass is quiet against the existing tree.

*Filed 2026-09-20*
