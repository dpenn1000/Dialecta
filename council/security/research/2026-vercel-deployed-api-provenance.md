# The deployed API has no source repository

**Source:** Vercel Deployments API (`/v6/deployments`, `/v6/deployments/{id}/files`) and the GitHub REST API (`/repos/dpenn1000/dialecta-api/commits/{sha}`), both read 2026-09-20. Deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`.

## Summary

The Vercel project `dialecta` (`prj_ngCEgluQjeA7SK0DMuy92WDVv1cG`) serves production from a single
deployment, `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`, created 2026-05-08 and still holding the aliases
`dialecta.vercel.app`, `dialecta-dpenn1000-7707s-projects.vercel.app` and
`dialecta-dpenn1000-7707-dpenn1000-7707s-projects.vercel.app`. Its `readyState` is `READY` and its
`source` is `cli`, meaning it was pushed from a workstation rather than built from a git event.

Its recorded git metadata is `githubRepo: dialecta-api`, `githubOrg: dpenn1000`,
`githubCommitRef: main`, `githubCommitSha: 53364fa8f836b929e485c755c984bbeae561a2e3`.

That commit does not exist. The GitHub API answers
`GET /repos/dpenn1000/dialecta-api/commits/53364fa8f836b929e485c755c984bbeae561a2e3` with
HTTP 422 and `"No commit found for SHA"`. A full clone plus `git fetch --all --tags` produces one
branch, `main`, at `9238a9cc90f83f596048bb75d99b1126002dc596`, and `git cat-file -t` on the
deployed SHA fails. The repository's `pushed_at` is 2026-04-28T00:41:43Z, ten days before the
deployment was created.

The two trees are also different sizes. Repository `main` carries 11 files under `api/`. The
deployed source tree carries roughly 40, including an `api/admin/` directory (`members.js`,
`member-tier.js`, `team.js`, `pulse.js`, `articles.js`, `feedback.js`), `api/webhooks/member-added.js`,
`api/_capabilities.js`, `api/_ghost-admin.js`, `api/_notifications.js`, and eleven endpoints under
`api/article/`. A recursive search of `C:\Users\dan` and `C:\Dialecta` for three filenames that
appear only in the deployment (`aesthetic-suggest.js`, `_capabilities.js`, `member-added.js`)
returns nothing outside `node_modules`.

The deployment artifact is therefore the only extant copy of the code serving production. It has
been serving unchanged for four and a half months.

## Implies for Dialecta

- This is the reason the `security` mandate says to read the deployed source and name which copy
  was read. For this API there is no other copy. `reviewer` cannot reach this code at all, and
  neither can a `git log`.
- Any rollback, redeploy or project reconfiguration on the `dialecta` Vercel project risks
  replacing roughly 29 endpoints with nothing. The five 2026-09-20 production builds from
  `dpenn1000/Dialecta` all carry `state: ERROR`, which is the only reason the May deployment is
  still aliased. Root `CLAUDE.md` already records that a failed build leaves the alias in place.
  That is load bearing, not incidental, and `vercel.json` setting `git.deploymentEnabled: false`
  is currently what holds it.
- Backlog P0-3 plans to flip `git.deploymentEnabled` back on. Recovering this source is a
  prerequisite for P0-3, not a follow-up to it. A successful build from `Dialecta` would take the
  alias and the May code would stop serving.
- The recovery is mechanical: `scripts/pull-deployed-source.mjs` style walk of
  `/v6/deployments/{id}/files`, writing each `src/` node to disk, then a commit into
  `dpenn1000/dialecta-api`. It needs a Vercel token, so it needs Dan's account.
- Treat `githubCommitSha` on a Vercel deployment as a claim rather than a fact. A `source: cli`
  deployment records whatever the local checkout reported, including a commit that was never
  pushed. Verify it against the forge before citing it as provenance. Root `CLAUDE.md` cites this
  SHA as though it were retrievable.
- The live surface inventory this agent's brief asks for cannot be built from any repository. It
  has to be built from the deployment file tree. See `live-surface-inventory.md`.

*Filed 2026-09-20*
