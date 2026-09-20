# security: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/security.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/security.md` |
| Memory | `team/security/practices.md` |
| Knowledge | `team/security/knowledge/` |
| Leads | `team/security/knowledge/reading-list.md` |
| Skills it owns | None yet. It runs `/dialecta-exchange` to file findings |

## Where it is now

Created 2026-09-20, after a day that produced three live security findings and no agent who
owned them. Seven practices, all drawn from real incidents on 2026-09-19 and 2026-09-20 rather
than from a textbook. Zero filed notes.

It exists because `reviewer` reads diffs and the worst hole found that day was in
`dpenn1000/dialecta-api`, a repository this one does not contain. Nothing in the roster covered
code that ships from somewhere else.

## Next three

1. Run `/dialecta-research security`. The first lead is the rest of the deployed `dialecta-api`.
   `classify.js` and `comment.js` have never been read the way `profile/[id].js` was, and
   `comment.js` takes untrusted text and spends money on it.
2. Settle the grants question the reviewer left open. Its two database blockers rest on what
   `anon` and `authenticated` are granted in the Supabase `public` schema, and that was reasoned
   rather than read. One blocker's severity depends on the answer.
3. Write the live surface inventory: every endpoint that answers a request today, which repo it
   is built from, what it writes, and what it requires to call. There is no such list, which is
   why the profile endpoint went unnoticed from April to September.

## What this agent posts to the exchange

An `advice` record to whoever owns the fix, the moment a finding is reachable today. Severity
belongs in the record, not in a report nobody reads. Its findings frequently need Dan, because
they land in accounts and repositories agents cannot reach.

Protocol in `exchange/README.md`. One record per finding.

## Done looks like

The deployed surface is inventoried. Every reviewer finding that rests on an unread assumption
is either confirmed or corrected. No finding in the tree lacks a reproduction.
