# GitHub Dependabot

**Source:** GitHub, "Dependabot", GitHub Docs, a native dependency update and vulnerability alert service, plus its open source engine `dependabot/dependabot-core`, read 2026-09-20. https://docs.github.com/en/code-security/dependabot ; https://github.com/dependabot/dependabot-core

## Summary

Dependabot is a GitHub-native feature, not something installed into a repository so much as turned on by a config file. It has two independent parts. Dependabot alerts read the GitHub Advisory Database against a repo's manifests and open automatically, with no config file needed, on any public repository. Dependabot version and security updates go further and open pull requests, and those need a `.github/dependabot.yml` file naming each package ecosystem (`npm`, `github-actions`, and so on) and an update schedule.

The engine behind the pull requests is open source: `dependabot/dependabot-core`, 5.8k stars, 1.5k forks, MIT licensed, with update logic for npm, Docker, GitHub Actions, and a long list of other ecosystems. It resolves the latest safe version, updates the manifest and lockfile, and writes a PR description carrying the changelog and release notes for the bump. GitHub runs this engine on your behalf; cloning `dependabot-core` only matters if you want to run the resolution logic yourself, which nothing here needs.

Cost and setup for a public solo repository: free, with no workflow file at all for alerts. Security and version update PRs need the config file above but no Actions minutes, since Dependabot runs on GitHub's own infrastructure, not in the repo's CI runners.

What it does not do: it has no opinion on application logic, authentication, or authorization. It flags that `@supabase/supabase-js` or `next` carries a known CVE and offers the version bump. It says nothing about a route that never checks who is calling it, which is the class of bug this project has. That is dependency hygiene, not a substitute for `reviewer` or `security` reading the code.

## Implies for Dialecta

- No `.github/dependabot.yml` exists in this repo (confirmed by listing `.github/`, which holds only `workflows/ci.yml`). Dependabot alerts may already be silently active for `dpenn1000/Dialecta` since it is a public repo, but nobody has looked, and no update PRs will appear without the config file.
- The dependency surface worth scheduling: root `package.json` (`@supabase/supabase-js`), `apps/web/package.json` (`next` 15.5.25, `react`/`react-dom` 19.1.0, `@supabase/ssr`, `@tiptap/react`, `@tiptap/starter-kit`), and `packages/core/package.json` (`vitest`). A minimal config covers the `npm` ecosystem at each of those three directories, one `updates:` entry per workspace (or the newer glob-capable `directories` key, if current when this is wired), plus a `github-actions` entry for `.github/workflows/ci.yml` itself.
- This is the cheapest item on the whole list: one file, no CI job, no Actions minutes spent. It belongs in this sprint's actual follow-up commit even though this note only files knowledge.
- Once `.github/dependabot.yml` exists, its update PRs still go through the same `ci.yml` gate (typecheck, test, voice check) as any other PR, so it does not bypass review; it only proposes the diff.

*Filed 2026-09-20*
