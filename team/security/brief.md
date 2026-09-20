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

Trained 2026-09-20 in one session. Thirty-three notes, twelve practices and ten standing positions,
from four research sprints plus six measurements of this estate that no search could reproduce.
Sprint log at `council/log/sprints/2026-09-20-security.md`.

The seat is becoming a council seat rather than a working agent, on Dan's instruction during that
session. `practices.md` becomes `positions.md` and `knowledge/` becomes `research/`. The second
table in `practices.md` is already written as positions, with confidence and evidence, because a
council seat owes a recommendation and not only a measurement. Legal and safety is a separate seat
at `council/legal/`; the line is that this one holds whether a control works and that one holds
whether it is the control owed.

It was created after a day that produced three live findings and no agent who owned them. The
sprint found the reason that was structural rather than accidental: the production API serves from
a Vercel artifact whose commit does not exist on GitHub, holding roughly 29 endpoints that are in
no repository and on no disk. `reviewer` reads diffs and no diff has ever contained this code.

## Next three

1. **Recover the deployed source.** Record `2026-09-20-security-01`. It needs a Vercel token, so it
   needs Dan. A working script is in the 2026-09-20 session scratchpad. Until it runs, 30 of the 38
   routes in `live-surface-inventory.md` stay marked `unread`, and `2026-09-20-security-02` cannot
   be settled either way.
2. **Read the three highest blast radius handlers**, in this order: `api/comment.js` (untrusted text
   into a paid model, and the credential question), `api/admin/members.js` (the PII concentration),
   `api/webhooks/member-added.js` (inbound, signature verification unconfirmed). Redo the ranking
   once they can actually be read; it is currently by blast radius because reachability is unknown.
3. **Enumerate the two truncated subtrees**, `api/comment/[id]/` and `api/admin/feedback/`. Both
   hold at least one route that is in no inventory. An endpoint nobody has listed is the shape of
   the thing that went unnoticed from April to September.

## What this agent posts to the exchange

An `advice` record to whoever owns the fix, the moment a finding is reachable today. Severity
belongs in the record, not in a report nobody reads. Its findings frequently need Dan, because
they land in accounts and repositories agents cannot reach. Three are open from 2026-09-20.

Protocol in `exchange/README.md`. One record per finding.

## Done looks like

The deployed surface is inventoried. That is now true for routes and false for behaviour: the list
exists, and 30 of its rows say `unread`, which means the handler was not read rather than that it
was read and found safe. Hold the word to that meaning.

Every reviewer finding that rests on an unread assumption is either confirmed or corrected. Done
for the grants premise under B1 and B2, in record `2026-09-20-security-03`.

No finding in the tree lacks a reproduction. Held so far, including for the one finding that could
not be completed: `2026-dialecta-comment-credential-chain.md` states what it does not establish and
names the single read that would settle it.
