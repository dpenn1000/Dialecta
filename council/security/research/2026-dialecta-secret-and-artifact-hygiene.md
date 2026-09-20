# Secret and artifact hygiene across this estate

**Source:** This agent, 2026-09-20, measuring `C:\Dialecta`, a fresh clone of
`dpenn1000/dialecta-api`, and the file tree of deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`.
Secret values were never read or printed; the checks are on names, ignore rules, history and
artifact contents.

## Nothing is committed

Neither repository has ever committed a credential path. `git log --all --full-history` across
`vercel.tolken`, `vercel.token`, `.env`, `.env.local` and `.env.production` returns zero commits in
`C:\Dialecta`, and zero for `.env`, `.env.local` and `vercel.token` in `dialecta-api`. The
2026-09-19 `vercel.tolken` incident produced an untracked file and nothing in history.

## The ignore rules, and what they cover

`C:\Dialecta/.gitignore` carries a deliberate credentials block: `*.token`, `*.tolken`, `*.pem`,
`*credentials*.json`, plus `.env`, `.env.*` and `!.env.example`. Tested against `git check-ignore`,
`vercel.token`, `vercel.tolken`, `.env`, `.env.local` and `.env.production` are all ignored. The
typo that caused the incident is covered and so is the correct spelling, which is the right repair.

The class is still open. `secrets.json`, `service-key.txt`, `supabase-service-key.txt`,
`creds.yaml` and `token.txt` are all reported NOT IGNORED. A denylist of filename shapes fails on
the first name nobody predicted, and the incident that prompted this block was itself an
unpredicted name.

`dialecta-api/.gitignore` is thinner: `node_modules/`, `.env.local`, `.env`, `.vercel`,
`.claude/settings.local.json`. No `*.token`, no `*.pem`. The repository that holds the production
API has weaker rules than the one that does not.

## What shipped to Vercel

The deployment uploaded its whole working directory. There is no `.vercelignore`, so the artifact
carries `CLAUDE.md`, `.mcp.json`, `.claude/settings.local.json`, `docs/`, `supabase/migrations/` and
all of `scripts/`, none of which Vercel routes or serves. They are retrievable by anyone with read
access to the Vercel project.

Two of those were worth opening, and both belong to `dialecta-api` as it stood in May 2026 rather
than to this repository. The artifact's `.mcp.json` holds one server and no credential,
`https://mcp.supabase.com/mcp?read_only=false`. Its `.claude/settings.local.json` is a Claude Code
permission allowlist with no credential in it. Neither leaks a secret.

Say which repository a file came from when it came out of an artifact. `C:\Dialecta/.mcp.json`
today holds one server, `dialecta-local-research`, and no Supabase entry at all. The two files have
the same name and nothing else in common.

`scripts/` does leak something else. The backfill logs committed alongside the scripts,
`backfill-fp-snapshots-2026-05-07T01-23-15-089Z-apply.log.json` among about twenty others, contain
real contributor display names paired with Ghost member identifiers, in the clear, in the
artifact. Two of those identifiers are UUID shaped, which is the value discussed in
`2026-dialecta-comment-credential-chain.md`.

## Where the service key sits

Every deployed handler read so far constructs its Supabase client the same way:

```js
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
```

`SUPABASE_SERVICE_KEY` carries `bypassrls`. Every authorization decision in this API is therefore
made in application code, with the database's own controls switched off for the whole request.
This is the normal shape for a server-side function and it is not a finding on its own. It is the
reason a missing check in a handler is a total bypass rather than a partial one, and it is why
`/api/profile/[id]` could create a row that RLS would otherwise have refused.

The project's Vercel environment variables could not be listed. The MCP connection in use returns
`403 forbidden` on `projectEnvVars`, which is least privilege working as intended and also a limit
on this note. What is set on the project, and on which environments, is unread.

## Implies for Dialecta

- Add `.vercelignore` to whatever repository becomes the API's source, covering at least `docs/`,
  `scripts/`, `.claude/`, `.mcp.json` and `CLAUDE.md`. Smaller artifact, and the PII stops
  travelling with the deploy.
- The backfill logs should not be in a repository or an artifact. They are operational output that
  happens to contain member names, which is the accidental shape most PII takes. Delete them from
  the tree when the deployed source is recovered under `2026-09-20-security-01`, rather than
  committing them forward into `dialecta-api`. Recovering the source and importing the PII in the
  same commit is the failure mode to avoid.
- A filename denylist is not the control and should not be relied on as one. Content scanning is,
  and `2026-gitleaks-secret-scanning.md` carries the wiring. The ignore block stays because it is
  cheap and it caught the repeat of a known mistake, but it is a second layer rather than the first.
- Bring `dialecta-api/.gitignore` up to the same block as `C:\Dialecta`, in the same change that
  recovers the source. It is three lines and the repository is about to receive roughly 29 files.
- **Corrected 2026-09-20, same day, before this reached a position.** This bullet first read that
  `read_only=false` on the Supabase MCP server meant an agent session in this repo could write to
  production. That was wrong, and wrong in the way this seat's own first practice exists to catch.
  The file was read out of the `dialecta-api` deployment artifact and then described as though it
  were this repository's live configuration. `C:\Dialecta/.mcp.json` carries no Supabase server.
  Neither does `mcpServers` at user scope or under the Dialecta project in `C:\Users\dan\.claude.json`.
  The only `read_only` string in the repository is in `docs/handoffs/dialecta-handoff-2026-04-27.md`,
  recording `read_only=true` at user scope. A second session's Supabase connection refused a DELETE
  this morning with `25006: cannot execute DELETE in a read-only transaction`, which is behavioural
  confirmation rather than another file read.
- What the artifact actually shows is a four month old development configuration of a different
  repository, shipped to Vercel because nothing excluded it. It is one more reason for the
  `.vercelignore` above and it is not a statement about anyone's current access.
- What stays open, narrowly. This session ran read only catalog queries against
  `mguulnibvzusfvyuowwh` through a Supabase connector and never attempted a write, so whether this
  session's connector would have permitted one is untested and will stay untested. Connectors are
  per session rather than per repository, so a session's own access is not knowable from anything
  in the tree. If that matters, the thing to record is that no file in the repository states which
  mode a given session holds.
- Re-run the Vercel environment variable listing when a connection with that permission exists. The
  unanswered part is what is set on Preview and Development, since a preview deployment of
  `apps/web` reading a production `SUPABASE_SERVICE_KEY` would put a bypassrls credential behind a
  URL with weaker protection than production.

*Filed 2026-09-20*
