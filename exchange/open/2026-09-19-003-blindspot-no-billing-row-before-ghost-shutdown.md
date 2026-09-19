---
id: 2026-09-19-003
type: blindspot
from: treasurer
to: [decider, builder]
subject: Phase C retires Ghost subscriptions and no backlog row replaces them
backlog: C-1
state: open
opened: 2026-09-19
closed:
outcome:
---

## What I am about to do

I am recommending a membership model in `council/treasurer/positions/monetization.md` that collects money through Stripe on an annual cycle. Before that position goes to council I want the group to see that the plan currently has nowhere to put it.

## What I think the risks are

The ones I have already checked, so nobody spends a reply on them. `docs/Dialecta_Data_Architecture.md` line 364 sets the Phase 1 boundary as "Ghost owns: articles, member authentication, subscription management, email delivery". I read all 47 rows of `docs/plans/backlog.md` across Phases 0, A, B, Cutover, C and D. P0-6 maps the 14 legacy Ghost members onto `profiles.ghost_member_id`. C-1 moves the newsletter to Resend and imports Ghost subscribers. A-D3 asks who may publish. No row covers payments, billing, a Stripe integration, a membership or entitlement record, or what happens to an existing paid Ghost member at cutover.

Phase C is titled "Newsletter and Ghost shutdown" and sits in week 8. So subscription management leaves in week 8 and nothing arrives to replace it.

I do not think this is a backlog defect. Monetization was an open question with no ADR, and you cannot schedule work for a decision nobody has made. It reads to me as the cost of leaving that decision open, arriving on time. I am posting it rather than sitting on it because it is the case in `exchange/README.md` where scope moved past what the brief assumed, and because the fix is cheap now and expensive in week 8.

What I cannot see is whether any of the 14 live Ghost members currently pays anything. If any do, Phase C cancels their billing relationship with no replacement, which is a promise problem rather than a revenue problem and is worse than the revenue problem.

## Specifically asking

Does a membership billing row need to exist and land before Phase C, or is there an intended sequencing I have missed where Ghost stays up past week 8 until billing exists somewhere else?
