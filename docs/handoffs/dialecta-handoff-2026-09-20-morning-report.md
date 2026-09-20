# Morning report, 2026-09-20

*Written overnight after nine agent sessions landed. Everything below is measured or cited.
Where a number is a model rather than a measurement, it says so.*

## Where Dialecta actually is

| Measure | Value | Source |
| --- | --- | --- |
| Unique visitors, all time | 269 | Ghost native analytics |
| Page views, all time | 1,876 | Ghost native analytics |
| Member records | 10 | Ghost export, 2026-09-20 |
| Real people among them | 6 | One is Dan, three are his own plus-addressed aliases |
| Arm's-length members | 3 | Not sharing Dan's surname |
| Paying members, ever | 0 | No Stripe customer has ever existed |
| Published articles | 5 | Live Supabase |
| Comments, ever | 3 | Live Supabase |
| Baseline traffic now | about 5 visitors a week | Ghost native analytics |

The platform is more built than it is used. 32 live database tables, a classification engine,
a fingerprint, opinion maps, an admin roles system. Three comments.

## Timeline to profitability

**Break-even is 19 annual memberships at $50.** That covers a measured fixed floor of about
$78 a month now, $62 after Ghost cutover. If Dialecta's Supabase bill is its own, which is
likely, the floor is $110 and break-even is 28.

**The funnel cannot currently deliver that.** At the measured 2.2 percent visitor-to-member
rate and a generous 5 percent free-to-paid, 19 paying members needs roughly 17,000 visitors.
All-time traffic is 269. At 5 visitors a week Dialecta gains about one member every two years.

So the timeline is not gated on the platform. It is gated on traffic and on a billing row that
does not exist anywhere in the 47-row backlog.

| Phase | What | Weeks | Ends at |
| --- | --- | --- | --- |
| 0. Stop the bleeding | Cancel Resend, $240 a year for two delivered emails. Email the 6 person list, which has never been emailed once. Read the analytics that are already paid for | 1 | Floor about $58 a month, first real funnel measurement |
| 1. Make revenue possible | A billing row: Stripe, annual, $50, no gating. Nothing in the backlog builds this, and Phase C retires Ghost's subscription management in week 8 | 2 to 6 | Dialecta can accept money |
| 2. Publish and distribute | Writing cadence plus the one channel that has ever worked. Facebook sent 54 visitors, a fifth of all traffic. Search sent 9 across five months | 6 to 30 | Traffic measured against a denominator |
| 3. Break-even | 19 arm's-length annual members | 30 to 50 | About $950 a year against a $936 floor |

**Honest range: 9 to 18 months**, and every month of it is contingent on publishing, not on
features. The nine agents found real defects today and none of them is why Dialecta has three
comments.

The cheapest thing on this list is Phase 0. It costs about two hours, takes $20 a month off
the floor, and produces the first measurement the project has ever had.

## The committee API

Built and verified overnight: `tools/committee-api/server.mjs`. A job submitted over HTTP ran
`spec-reader` against the live CLI and returned exit 0.

```
POST /ask      {"question": "...", "agents": "council"}   -> {id, poll}
GET  /jobs/:id                                            -> state and each agent's answer
GET  /health                                              -> no token needed
```

`agents` takes an agent name, an array of names, or `council`, `team` or `all`.

**Before first use**, put a token in `.env`:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

as `COMMITTEE_API_TOKEN`, then `node tools/committee-api/server.mjs`.

**What it does not do yet**, in the order worth doing:

1. **Run as a service.** It is a foreground process. NSSM, the same way the Trinity launcher
   runs, makes it survive a reboot.
2. **Reach a phone.** It binds 127.0.0.1 deliberately. Cloudflare Tunnel is the path already
   proven on this machine. Do not bind 0.0.0.0 and forward a port: this endpoint runs a coding
   agent with edit permission.
3. **Run agents in parallel.** Sequential today, because parallel agents contend for one
   worktree. Giving each agent its own worktree fixes it and turns a nine agent council from
   nine sequential runs into one.
4. **Return the record, not the transcript.** Today it returns stdout. It should return the
   exchange record the agent filed, which is the artifact that matters.

## The committee itself

Nine agents was an accident of how the day went, not a design. `decider` framed the roster
question in `council/log/2026-09-19-council-composition.md` and it is waiting on Dan. Its
finding, which is the useful part: the problem is not too many seats, it is four missing ones.

| Not represented | What goes unargued |
| --- | --- |
| The reader who never comments | Most of a publication's audience |
| Legal and safety | Defamation, harassment, liability when the classifier is wrong |
| Dan's hours | `treasurer` counts dollars. A feature can be cheap in money and expensive in evenings |
| Accessibility | Two tier colours already fail WCAG contrast against their own badges |

Its recommendation: no cap on the roster, every seat runs on every question, and the dial for
spending less is council or no council rather than a partial council.

## Dialecta next steps, in order

1. **Answer the Supabase question.** `migrator` settled it with five checkable findings: the
   two September migrations were written without knowledge of the live database. That makes it
   option 1, adopt the live schema, and it invalidates P0-2 through P0-7 as written. Until this
   lands, the backlog describes work that is already done.
2. **Close the three blockers from the PR 3 review.** Stored XSS through `body_html` with no
   sanitizer; comment owners able to set their own `final_tier` and publish; axis mapping wrong
   on all six axes against its own spec, writing into an append-only ledger.
3. **Close the unauthenticated profile endpoint.** `GET /api/profile/:id` creates a production
   row for any string, with caller-controlled display name. It lives in `dialecta-api`, a
   different repo, and needs a production redeploy.
4. **Build the billing row.** Nothing in the backlog does, and Phase C removes the only billing
   that exists today.

## Need to know

- **`dialecta.vercel.app` does not serve this repo.** Production comes from `dpenn1000/dialecta-api`
  at commit `53364fa`, last deployed around 2026-05-08. Root `CLAUDE.md` said otherwise until
  yesterday.
- **A junk row is in the live `profiles` table**, `ping-test-not-a-real-id`, created by an agent
  probing whether the database was paused. It is the most recently updated row. Waiting on Dan
  to delete.
- **The domain line is $242 a year, not $15.** It carries M365 email, Conversations Deluxe and a
  Domain Alert membership. That one correction moved break-even from 16 members to 19.
- **A constraint recorded 2026-05-29 says Dialecta must not be migrated or touched.** The
  treasurer flagged the Resend cancellation against it rather than reading its own exception
  into Dan's rule. Dan clears it or it stays.
- **Five exchange records share the id `2026-09-19-002`.** Nine worktrees each read the ledger
  and each saw 002 was free. Fixed forward: ids carry the agent name from today.
- **`components/dialecta-s02-ux-opinion-maps.jsx` is an untracked 370KB duplicate** of a file in
  `_to_delete/`. Nobody claims it. Safe to delete.
