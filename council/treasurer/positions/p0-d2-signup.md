# Standing position: P0-D2, open sign-up against invite-only

*Written 2026-09-19, sprint 1. Backlog P0-D2 asks Dan to settle login methods and whether sign-up is open or invite-only at cutover. This note answers only the cost half. Login method choice is a designer and security question and this advisor has nothing to add to it.*

**Confidence: high on where the cost curve bends, medium on the abuse arithmetic.** The infrastructure quotas below are vendor pages fetched 2026-09-19 and filed. The spam reasoning is from first principles and has no source behind it yet; the lead is open in `../research/reading-list.md`.

---

## The position

**Open sign-up, on the condition that three cheap gates ship with it.** Invite-only is not the cheaper option, it is the option that hides the cost. If the gates cannot ship at cutover, invite-only until they can.

The gates: email verification before a comment can be submitted, a per-account rate limit on comment submission, and the 12-character composer gate already specified in backlog A-1. All three are client and server work with no recurring vendor cost.

## Cost per user, and where it does not bend

The honest finding first. **Almost nothing in the stack bends with user count.**

| Line | Included | Where it runs out | Cost after |
| --- | --- | --- | --- |
| Supabase monthly active users | 100,000 on Pro | 100,000 MAU | $0.00325/MAU |
| Supabase database | 8 GB on Pro | roughly 4 million comment rows | $0.125/GB |
| Supabase egress | 250 GB on Pro | roughly 500,000 page loads a month | $0.09/GB |
| Vercel function invocations | 1M on Pro | 1M a month | $0.60 per 1M |
| Vercel data transfer | 1 TB on Pro | 1 TB a month | $0.15/GB |

Against 14 live Ghost members, the MAU allowance alone is five orders of magnitude of headroom. **Anybody arguing that open sign-up costs money has to point at something other than the database, the auth system or the hosting.** This advisor went looking for a cost argument against open sign-up in the infrastructure and did not find one.

Two places it does bend, and only one of them is about users:

**1. Email, at about 100 members.** Resend's free tier allows 3,000 emails a month but only 100 a day. Those are different constraints and the daily one binds first. The first announcement to 101 members fails, and the line goes to $20 a month. Notification email crosses it sooner than the newsletter does, because notifications scale with users multiplied by activity rather than with users alone. `../research/2026-resend-pricing.md`.

**2. Comments, not users.** The Stage 1 classification call is the only variable cost in the platform, at about $0.002 a comment. It is indexed to comments submitted, not to accounts created. Ten thousand accounts that never comment cost nothing. `../research/2026-anthropic-api-pricing.md`.

## The actual argument, which is about abuse rather than scale

The second bend is where open sign-up becomes a treasurer question, and it is not a gradual curve. **Every comment submitted is a paid API call, so an automated sign-up and posting run converts somebody else's botnet into a line on Dan's Anthropic bill.** Ten thousand junk comments costs about $20 and arrives in an afternoon. A hundred thousand costs about $200. There is no natural ceiling on that number, which is the property that matters: an unbounded downside on a solo founder's card.

The second cost is worse than the first and does not show up on any bill. Junk comments enter `comments` and `classifications`, and the Project Brief's Tier 3 names that classified corpus as the platform's eventual moat. **Spam does not just cost money, it contaminates the asset.** Cleaning a poisoned training corpus later costs far more than gating it now.

Invite-only reduces both to near zero. That is a genuine advantage and this advisor will not pretend otherwise.

But invite-only also costs something the balance sheet does not show. The platform's unit economics improve with contributors, because the fixed floor is $47 a month whether five people use the site or five thousand, and the marginal contributor costs two tenths of a cent per comment. A site with thirty contributors pays the same $564 a year as a site with three thousand. **Invite-only spreads a fixed cost across the smallest possible number of people, which is the worst version of this platform's cost structure.** It also caps the corpus that Tier 3 depends on.

So the comparison is not "cheap against expensive". It is a bounded, certain cost against an unbounded, unlikely one, and the standard answer to an unbounded downside is to bound it rather than to avoid the activity.

The three gates bound it. Email verification defeats scripted mass sign-up at almost no cost. A per-account rate limit converts the unbounded spend into a known maximum: at ten comments an account a day, a thousand malicious accounts is $20 a day rather than unlimited. The A-1 composer gate is already specified and already funded.

## What this does not settle

- Whether open sign-up is right on the designer's terms, meaning whether an invite creates the commitment that a Pact page is supposed to create. That is a real argument and it is not this advisor's.
- Whether open sign-up is right on the philosopher's terms, meaning what the composition of the first hundred contributors does to a platform whose thesis is about environments shaping behaviour. A community's founding cohort is not a cost variable.
- The login methods half of P0-D2.

This advisor's claim is narrow and firm: **on cost alone, invite-only cannot be justified, and open sign-up cannot be justified without the rate limit.**

## What would move this position

- A source on comment spam economics, meaning what an automated sign-up run costs an attacker in 2026 and what rate limits are standard. The position reasons from first principles and is weaker for it. Lead is open in `../research/reading-list.md`.
- A decision on A-2 that moves classification off the submit path. If classification becomes asynchronous, it can be batched at a 50 percent discount and it can be deferred for unverified accounts, which changes the abuse arithmetic considerably. `../research/2026-anthropic-caching-batch-limits.md`.
- Dan's reader count. The case for open sign-up rests on contributors spreading a fixed cost, and that argument is only as good as the number of people who might sign up.
