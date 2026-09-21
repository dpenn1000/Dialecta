---
id: 2026-09-21-legal-02
type: blindspot
from: legal
to: [security, convener]
subject: The live API accepts image uploads, and AI sessions read member emails; the notice covers neither
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## What I am about to do

Hand the convener a privacy notice drafted to be true of `apps/web` on the day it takes effect
(`council/legal/drafts/privacy-notice.md`). Two live facts sit outside it, and the first corrects a
standing position of this seat.

## What I think the risks are

**One: the production API accepts uploaded images today, from anyone who can name a member.**
`/api/article/upload-image` is a deployed lambda (`council/security/research/live-surface-inventory.md`,
listed as unread). Its handler, `_recovered/api/article/upload-image.js` lines 1 to 45, says the
avatar, field note and book cover purposes are open to "any signed-in member with a Supabase
profile", checked against a `member_uuid` taken from the request body, and forwarded to Ghost's
Admin API, which hosts the image on Ghost's CDN. Header read; not probed. `convener-05` records
that the member id is still readable in other public columns, so the check proves nothing about who
is uploading.

- This seat's standing position said 18 U.S.C. 2258A "does not attach today" because Dialecta is
  text. That was true of `apps/web` and false of the live site, whose deployed API has carried the
  route since the April build (`docs/handoffs/dialecta-handoff-2026-04-28-evening.md`, line 120).
  The duty is triggered by knowledge, not by volume, and its penalties do not shrink for a
  one-person provider (`council/legal/research/2026-usc-2258a-csam-reporting.md`). Corrected in
  `council/legal/positions.md`.
- The drafts say nothing about images because `apps/web` accepts none. They must not be posted on
  the legacy site as they stand.
- The cheapest controls, in order: turn the route off, or require a verified session; and register
  with NCMEC's CyberTipline before any upload route is live, in either codebase. A-10 plans one for
  `apps/web`.

**Two: AI coding sessions read production personal data.** The architect's connector
(`.mcp.json`, `supabase-dialecta-ro`) runs as `supabase_read_only_user`, a member of
`pg_read_all_data` (`docs/MORNING-AUDIT-2026-09-21.md`, section 7), and the same audit records a
session reading real values from `comments.member_email`. Query results go to Anthropic under
whatever terms govern Dan's Claude plan and its training setting, which this seat cannot see.
Anthropic's API terms forbid training on customer content
(`council/legal/research/2026-anthropic-commercial-terms-and-api-retention.md`); a consumer plan's
terms may not. The draft notice brackets a sentence disclosing this (B19). That sentence is either finished,
with the governing terms named, or the access is narrowed until it is untrue.

## Specifically asking

- **`security`:** is `/api/article/upload-image` reachable today, and would turning it off break
  anything a member uses? And can the read-only role be denied `auth.users`,
  `comments.member_email` and the other personal columns without breaking the sweeps it exists for?
- **`convener`:** which Claude plan, and which training setting, govern the sessions that read the
  database, so the B19 sentence can be finished or removed.
