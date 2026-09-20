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

### reviewer

Read both copies. `C:\Dialecta\api\profile\[id].js`, the file in this repository's own `dialecta-api`
checkout, does not have this bug. Its GET handler is a plain `.maybeSingle()` read; the only `upsert`
in the file is in PATCH. The lazy-create-on-GET you tripped lives in the deployed artifact only, now
readable at `_recovered/api/profile/[id].js`: its `if (!profile)` branch starts at line 1093 and
upserts at line 1149, `{ ghost_member_id: id, display_name, avatar_url }` with `onConflict:
'ghost_member_id', ignoreDuplicates: true`, no auth check anywhere above it.

That answers "does comment.js do the same": no. `comment.js` is method-gated to POST, 405 otherwise,
and calls `requireCompleteProfile`, which 403s when no profile row exists rather than creating one. It
does not lazy-create. It has a different hole instead, which is what `2026-09-20-security-02` asked me
to confirm, and I now have: it trusts a client-supplied `member_uuid` against `profiles`, a table
`security-03` measured as publicly readable with no column narrowing, with no session or signature
check anywhere in the file. See my answer on that record rather than a second copy of it here.

Your "fix now or fix in the replacement" question is not really a choice between two live options.
`security-01` (escalated to Dan, `P0-3`) establishes that the deployed artifact traces to a commit
that exists in no repository, that `git.deploymentEnabled` is currently `false`, and that all five
2026-09-20 production builds are `state: ERROR`, which is the only thing keeping the vulnerable May
deployment serving instead of nothing. Editing `api/profile/[id].js` in this repo right now changes no
bytes in production: that file already lacks the bug, and even a correct edit to it cannot ship until
P0-3's ordering question resolves, at which point a build from today's stale `main` would also drop
roughly 29 endpoints the live artifact serves and this repo does not have. The GET-must-not-mutate fix
belongs in whatever tree becomes the next deployment base, decided together with P0-3, not decided
separately here.

Recommended outcome: answered. The code questions are settled on evidence. The "when" question is not
mine or yours to close; it rides on the same fork `security-01` already put in front of Dan.

### builder

Second question first, since I can answer it directly: comment.js does not create profiles rows on
unauthenticated input the same way, but it has a related problem. I read the full recovered
`_recovered/api/comment.js`, 563 lines, not just the docblock. It requires POST, and it requires an
existing profile: if `profiles` has no row for the supplied `member_uuid`, `requireCompleteProfile`
returns 403 rather than creating one. So it does not fabricate identities from nothing the way
`GET /api/profile/[id]` does. But it takes `member_uuid` straight from the request body, looks up
the profile by that value alone, and never verifies the caller is the member it names: no Ghost
session check, no signature, no shared secret, nothing beyond the string match. That is the same
shape `security` is asking about in `2026-09-20-security-02`, addressed to me too; see my answer
there for the full read.

On your actual question: I read the GET handler in full
(`_recovered/api/profile/[id].js`, lines 1032 to about 1170). The lazy-create upsert is deliberate
and documented, not an oversight: it exists so a legitimate Ghost member's first visit to their own
profile creates the row, using `?name=`/`?avatar=`/`?email=` hints the theme passes from
`data-member-*` attributes. That is also why "change it to read-only now" is not a clean fix:
read-only would break real first-time onboarding for whichever of your ten still need a row.

More important than the shape of the fix: this is live. Per `security`'s `2026-09-20-security-01`,
the artifact this file was recovered from is the one actually serving `dialecta.vercel.app` right
now, and your own GET created a real row in the real production table. "Legacy API frozen enough to
wait for the replacement" does not hold when the replacement (`B-3` in the backlog) is phases away
and the exposure is live today. But there is no clean way to patch just this file either: per
security-01, any successful build from `dpenn1000/Dialecta` takes over the alias entirely, so a
targeted hotfix to the legacy artifact is not an isolated action, it is the same P0-3 fork
security-01 already opened (recover then decide, versus flip and lose the artifact). That question
is already asked, to decider, and I would rather point at it than reopen it here.

What only Dan can do: an infra-level mitigation that does not require a code deploy at all, for
example a Vercel firewall or rate-limit rule on that route, while P0-3 gets settled. The eventual
code fix, gating the lazy-create on a verified Ghost session rather than trusting the URL id, is
real work for whoever picks up B-3 or an earlier hotfix branch, not something to build in this
mission.

Recommend: answered, with one piece that is escalate to Dan: an infra-level mitigation on the live
route, independent of any code deploy, while P0-3 is decided.
