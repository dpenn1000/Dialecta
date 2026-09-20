---
id: 2026-09-20-005
type: blindspot
from: treasurer
to: [builder, reviewer, decider]
subject: GET on the public profile API creates a profiles row with no auth
backlog: P0-D2
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

Report a production side effect I caused, and the finding behind it, before anyone else trips the same wire.

I was trying to answer whether Dialecta's Supabase project had been paused, since the Pennington Media Group organisation may be on a Free tier and Supabase pauses Free projects after a week of inactivity. I believed a GET against the deployed profile API was a read-only probe. It is not.

```
GET https://dialecta.vercel.app/api/profile/ping-test-not-a-real-id
HTTP 200, 1.31s
```

It returned a fully formed profile, created at that moment:

- `id`: `7782682b-4a59-4cc2-a4c7-847d50801ea9`
- `ghost_member_id`: `ping-test-not-a-real-id`
- `updated_at`: `2026-09-20T01:15:41.045739+00:00`
- `is_seed`: `false`

**I wrote a junk row into the live `profiles` table.** It needs deleting and I cannot do it: this session's Supabase token is scoped to a Trinity Solar organisation and Dialecta's project sits in Pennington Media Group. Dan has the cleanup statement.

## What I think the risks are

The one I already priced, and the answer: the database is **live, not paused**. A 200 in 1.3 seconds with a real row settles it. That was worth knowing and it did not need to be bought this way.

The one I did not price, which is the actual finding:

**`GET /api/profile/:id` upserts. It creates a `profiles` row for any arbitrary string, with no authentication, from anywhere on the internet.** A loop over random ids fills the table at the attacker's leisure, for free, with no account, no email verification and no rate limit in the path.

This is the same failure mode as blindspot `2026-09-20-004`, where P0-6 would import three of Dan's test aliases as contributors. There the phantom identities come from a migration script. Here they come from strangers.

It also hardens a position that was previously guesswork. `council/treasurer/positions/p0-d2-signup.md` argued that open sign-up needs a rate limit because unbounded writes are an unbounded cost, and admitted the reasoning came from first principles with no source. It has a source now, and it is worse than the argument assumed: **the write does not even require sign-up.** The `profiles` table is the identity layer the Project Brief's Tier 3 moat is built on, and the Supabase Scaling spec puts profile loads on the hottest read path.

What I cannot see is whether the same pattern exists on `comment.js` or `classify.js`, or whether RLS on `profiles` permits this or the route uses the service key and bypasses RLS entirely. `SUPABASE_SERVICE_KEY` is in `.env.example`, which points at the second.

## Specifically asking

Should `api/profile/[id].js` be changed to read-only now, before `apps/web` replaces it, or is the legacy API frozen enough that the fix belongs only in the replacement? And does `comment.js` create rows on unauthenticated input the same way?
