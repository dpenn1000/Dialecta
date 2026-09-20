---
id: 2026-09-20-security-01
type: advice
from: security
to: [decider]
subject: Production API serves code that exists in no repository, and P0-3 would overwrite it
backlog: P0-3
state: open
opened: 2026-09-20
closed:
outcome:
---

## Question

Should recovering the deployed `dialecta-api` source be made a prerequisite of P0-3, before
`git.deploymentEnabled` is flipped back on?

## What I already checked

Vercel deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7` holds every production alias including
`dialecta.vercel.app`. It was created 2026-05-08, its `source` is `cli`, and its recorded git
metadata is `dialecta-api` at `53364fa8f836b929e485c755c984bbeae561a2e3`.

That commit does not exist. `GET /repos/dpenn1000/dialecta-api/commits/53364fa...` returns HTTP 422
and `"No commit found for SHA"`. A full clone plus `git fetch --all --tags` gives one branch at
`9238a9cc`, and `git cat-file -t` on the deployed SHA fails. The repository's `pushed_at` is
2026-04-28, ten days before the deployment.

The trees differ in size, not just in commit. Repository `main` carries 11 files under `api/`. The
deployed tree carries about 40, including `api/admin/` (`members.js`, `member-tier.js`, `team.js`,
`pulse.js`, `articles.js`, `feedback.js`), `api/webhooks/member-added.js`, `api/_capabilities.js`
and eleven endpoints under `api/article/`. A recursive search of `C:\Users\dan` and `C:\Dialecta`
for `aesthetic-suggest.js`, `_capabilities.js` and `member-added.js` returns nothing outside
`node_modules`.

Full detail and the route list in `team/security/knowledge/2026-vercel-deployed-api-provenance.md`
and `team/security/knowledge/live-surface-inventory.md`.

## Why I am stuck

The fork is about ordering, and both branches are Dan's rather than mine.

Flip P0-3 first. A successful production build from `dpenn1000/Dialecta` takes the alias, and the
May deployment stops serving. Roughly 29 endpoints that exist only in that artifact go dark, and
the artifact is the only copy, so the loss is not recoverable by rollback once the project is
reconfigured. Right now the only thing preventing this is that all five 2026-09-20 production
builds carry `state: ERROR` and `vercel.json` sets `git.deploymentEnabled: false`. Root `CLAUDE.md`
already notes that a failed build leaves the alias in place. That is currently load bearing.

Recover first. The cost is one Vercel token and one script run. The deployment file API returns the
whole `src/` tree: `GET /v6/deployments/{id}/files` gives the tree, `GET /v7/deployments/{id}/files/{uid}`
gives each node base64 encoded, and a walk writing every `src/` node to disk reconstructs it.
`pull-deployed-source.mjs`, written during the 2026-09-20 sprint, does exactly that and was sent to
Dan directly rather than committed, because `scripts/` is outside this agent's fence. It reads
`VERCEL_TOKEN` from the environment, so it needs Dan's account and no agent can run it. Once the
tree is on disk it commits to `dialecta-api` and the question closes permanently.

Three other open items are waiting on the same action, which is why I am asking rather than
noting it. `2026-09-20-security-02` cannot be settled without reading `api/comment.js`. The live
surface inventory carries 30 routes marked `unread` for the same reason. And root `CLAUDE.md` cites
this SHA as though it were retrievable, which is a line that should be corrected from the
measurement rather than from memory.

One correction to the record while this is open. Record 2026-09-20-005 describes the profile GET
finding as verified from the deployed source. The file read was `api/profile/[id].js` on
`dialecta-api` main, which is not the deployed artifact. The finding itself stands, because a GET
created a real row in production, so the live behaviour corroborates it. The provenance claim was
looser than stated.
