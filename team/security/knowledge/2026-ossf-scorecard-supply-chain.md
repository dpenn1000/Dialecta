# OSSF Scorecard, Allstar, and Harden Runner

**Source:** Open Source Security Foundation (OpenSSF), "ossf/scorecard", GitHub repository, an automated supply chain risk scorer, read 2026-09-20. https://github.com/ossf/scorecard

## Summary

Scorecard runs about 30 checks (branch protection, code review, pinned dependencies, maintained status, and more) against a repository and scores each 0 to 10, with an aggregate score and a stated reason for every deduction. The repo shows 5.7k stars, 723 forks, and an active commit history (3,106 commits on `main`). It runs as a GitHub Action on a schedule or on push, as a CLI, or as a Docker image, and results can publish to the repository's own Security tab as SARIF, or to the public deps.dev listing and an OpenSSF badge if the repo opts in. For a solo-maintained repo the value is a checklist made concrete: instead of guessing whether branch protection or pinned Action SHAs matter, Scorecard names the specific gap and the specific fix.

Two other OpenSSF-adjacent tools cover different ground and fit this repository differently.

`ossf/allstar` (1.5k stars, 771 commits) is a GitHub App that continuously enforces org-level policy (branch protection, CODEOWNERS presence, no binary artifacts committed, and more) and can auto-remediate some violations. Allstar is built around organization-wide coordination: it needs its own GitHub App registration and an `.allstar` control repository, and the OpenSSF-hosted instance was retired, so running it now means self-hosting the App or a daemon. That is real infrastructure for one person's single project to take on.

`step-security/harden-runner` (1.3k stars, 116 forks, Apache-2.0, latest v2.21.0) takes a different angle: it runs as the first step inside a GitHub Actions job and monitors that runner's network egress, file writes, and process activity for the duration of the job, flagging connections to domains outside an allowlist. On GitHub-hosted runners, the Community tier (network anomaly detection, automatic baseline, domain allowlisting) is free for public repositories with no subscription. It becomes priced, or a no-op without a subscription, on private repositories or self-hosted runners.

## Implies for Dialecta

- `dpenn1000/Dialecta` is public (confirmed via `gh repo view`), so `harden-runner` fits here and `allstar` does not. Allstar's org-level GitHub App model is built for a company running one policy across many repos; it is not built for one person's two repos.
- Add `step-security/harden-runner` as the first step of the `check` job in `.github/workflows/ci.yml`, before `actions/checkout`, in audit mode first (`egress-policy: audit`) to see what `npm ci` and `npm test` actually reach before tightening to `block` with an explicit allowlist.
- Add a Scorecard workflow on a schedule (weekly `cron` is the common choice) rather than on every push, since its checks are about repository configuration, not code correctness, and do not need to gate a PR.
- Scorecard's "Dangerous-Workflow" and "Pinned-Dependencies" checks apply directly to `.github/workflows/ci.yml` today: `actions/checkout@v4` and `actions/setup-node@v4` are pinned to major-version tags, not commit SHAs, which is exactly what that check flags.

*Filed 2026-09-20*
