# dialecta-api is unreachable without credentials, and the repo is the smaller problem

## Citation

`https://api.github.com/repos/dpenn1000/dialecta-api` and
`https://api.github.com/repos/dpenn1000/dialecta-api/commits/53364fa`, both fetched
unauthenticated 2026-09-20 (404 on both). `https://api.github.com/users/dpenn1000/repos`, same
day (five public repositories, `dialecta-api` not among them). Cross-checked against root
`CLAUDE.md`'s own machine inventory, same commit. Superseded by
`exchange/open/2026-09-20-security-01-advice-deployed-api-has-no-source-repo.md`, filed the same
day by `security`, which this note defers to rather than duplicates.

## Summary

This agent's first attempt at reading `dialecta-api` (the lead this note closes) failed at the
access layer: an unauthenticated GET on the repo and on the specific commit both return HTTP
404, and the repo does not appear in `dpenn1000`'s public listing (`Apps`, `Dialecta`, `DTech`,
`SalesResourcePage`, `tsd-ref-de43d6dcef`). Root `CLAUDE.md`'s own machine table confirms no
local checkout exists either: `C:\dialecta-api` is "named in older handoffs" and "not present on
studio-pc as of 2026-09-08." Three independent checks, one conclusion: nobody without
credentials Dan holds can read this repo from this seat.

**That conclusion is true and much smaller than what `security` found the same day.** Their
record, read after this one was drafted, used an authenticated Vercel token to compare the
deployed artifact against the repo directly, and the repo turns out not to be the live source
either way: the commit the deployment metadata cites, `53364fa8f8...`, does not exist in
`dialecta-api` at all (their authenticated call returns 422 "No commit found for SHA", not 404,
which is itself confirmation the repo is reachable with the right credentials and simply does
not contain that commit). The deployed tree carries roughly 40 files under `api/` against 11 on
the repo's actual `main`, including whole endpoint families (`api/admin/`, `api/article/`,
`api/webhooks/`) that exist nowhere any agent or this machine can currently read.

## Implies

- **The reading list's premise needs correcting, not just the entry.** The lead assumed reading
  `dialecta-api` at `53364fa` was a matter of access this agent now has (WebFetch) and did not
  have before. It is not. No amount of unauthenticated fetching reaches a private repo, and even
  authenticated access would not reach the deployed prompt, because the deployed artifact and
  the repo have diverged past the point of sharing a commit.
- **This agent's own proposal needs a caveat added.** [[2026-dialecta-classify-prompt]] says
  "the copy in `dialecta-api` needs the same edit or the same retirement." That assumed the
  repo's `api/classify.js` is what is live. It may not be. The live prompt, if it
  differs from both `api/classify.js` copies this agent has read, is currently unread by anyone
  and unrecoverable except by the path `security` already scoped (Dan's Vercel token, the
  deployment-files API, `pull-deployed-source.mjs`).
- **Do not re-attempt this lookup unauthenticated in a future sprint.** The answer will not
  change; the blocker is credentials, not search technique. Check `security`'s knowledge tree or
  the exchange for a recovery outcome before spending a WebFetch call on it again.

## Leads this raised

- Once `pull-deployed-source.mjs` runs (blocked on Dan, per `security`'s record), the recovered
  `api/classify.js` and `api/comment.js` (if the deployed tree has its own copies under a
  different path, given the ~40 vs 11 file count) are worth a fourth row in
  [[2026-dialecta-classify-prompt]]'s comparison table. Add to this agent's reading list once
  that record closes.
