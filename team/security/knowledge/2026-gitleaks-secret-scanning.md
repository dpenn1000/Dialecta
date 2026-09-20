# Gitleaks and TruffleHog, secret scanning

**Source:** Gitleaks, "gitleaks/gitleaks", GitHub repository, a git history and working tree secret scanner, read 2026-09-20. https://github.com/gitleaks/gitleaks

## Summary

Gitleaks is a Go CLI that scans git history, a working tree, or stdin for secrets, using a mix of regex rules and Shannon entropy. The GitHub page shows 29.4k stars, 2.2k forks, and the latest tagged release is v8.24.2. It runs three ways that matter here: as a pre-commit hook (it ships hook definitions for `.pre-commit-config.yaml`), as a one-shot CLI (`gitleaks git`, `gitleaks dir`, `gitleaks stdin`), and as `gitleaks/gitleaks-action` in GitHub Actions.

The repository states gitleaks is feature complete: no new detection features are planned, and future releases are security patches only. That is a real maintenance signal, not neglect, and it is corroborated outside the repo itself. Zachary Rice, gitleaks' original author, published a successor called Betterleaks in February 2026 (v1.1.1 by March), built on BPE tokenization instead of entropy scoring and adding live credential verification. Betterleaks is a drop-in replacement with backward-compatible config and CLI flags, but it is months old against gitleaks' multi-year install base. Gitleaks staying stable and patched is the safer choice for a first gate.

TruffleHog (trufflesecurity/trufflehog, 28k stars, 2,600 forks, AGPL-3.0 as of v3.0) covers more ground: git, filesystems, cloud buckets, and APIs, across 800-plus credential types. Its distinguishing feature is verification: for many credential types it calls the credential's own API and reports the result as verified, unverified, or unknown, which separates a live key from a rotated or placeholder one. It also ships a pre-commit hook and a `trufflesecurity/trufflehog@main` GitHub Action.

Minimal Actions wiring for gitleaks, free for a public repo on a personal account, no license key required:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
- uses: gitleaks/gitleaks-action@v3
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Neither tool reads Vercel or Supabase dashboards; both only see what is in the files they are pointed at.

## Implies for Dialecta

- `vercel.tolken` at the repo root is the live example. A full history search (`git log --all`, scoped to that filename) turns up no commits, so it was never committed, and it currently matches the `*.tolken` line under the "Credentials" block in `.gitignore`. That protection depends on someone having named the extension before the file existed. A content scanner does not: it would flag the token by shape regardless of what the file is called, including if it were ever pasted into a tracked file like `api/classify.js` instead of living in its own file.
- Wire `gitleaks/gitleaks-action@v3` into `.github/workflows/ci.yml` as a new job. The current workflow (checkout, setup-node, `npm ci`, typecheck, test, voice check) runs no secret scan at all today.
- There is no pre-commit hook tooling in this repo yet: no `.husky` directory, no scripts under `.git/hooks`. Adding gitleaks locally means picking a hook runner first, a plain `.git/hooks/pre-commit` calling `gitleaks protect --staged`, or `husky` plus `lint-staged`, not just installing the binary.
- Prefer gitleaks over trufflehog for the first gate: no network calls per finding, so it stays fast enough to run on every commit. TruffleHog's live-verification step is worth adding later as a slower, scheduled CI job once the fast gate exists, since a "verified" result is close to an incident and worth a different response than an "unverified" one.

*Filed 2026-09-20*
