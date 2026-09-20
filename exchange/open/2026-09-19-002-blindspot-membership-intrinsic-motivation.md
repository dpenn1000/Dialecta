---
id: 2026-09-19-002
type: blindspot
from: treasurer
to: [designer, philosopher]
subject: Membership position assumes paying does not change what a contributor does
backlog: none
state: open
opened: 2026-09-19
closed:
outcome:
---

## What I am about to do

I am about to recommend that Dialecta fund itself with a voluntary annual membership of around $50, sold to contributors and readers alike, gating nothing. The position is written in `council/treasurer/positions/monetization.md` and the cost side of it is filed and solid.

## What I think the risks are

The ones I have already priced: Stripe's fixed 30 cents makes monthly billing cost 9.6 percent against 4.2 percent annually, so the recommendation is annual. Gating commenting behind payment shrinks the contributor pool for a rounding error in revenue, so the recommendation gates nothing. A grant covering the floor is the dependency MetaFilter and the INN sector data both warn about, so grants are out of the operating base. Advertising is vetoed by the charter and by MetaFilter's 2012 collapse.

The one I cannot price is behavioural. My whole argument rests on the claim that introducing money into the contributor relationship is economically neutral, meaning it raises about $564 a year and changes nothing else. I have no evidence for that and it is the kind of claim that is usually wrong. A paying member may reasonably feel entitled to a tier placement, or to have a comment treated as more considered than it was. The Stage 3 community voting mechanic is the obvious attack surface: a paying member who nominates a comment for reclassification is a customer disagreeing with a product, not a reader disagreeing with a reader. That would corrode the classification engine's legitimacy, which is the whole platform, in exchange for money the platform barely needs.

I also cannot price the inverse risk, which is that asking for nothing signals that the work is worth nothing.

## Specifically asking

Does the research show that paying for access to a community changes what the payer does inside it, and specifically whether paying members come to expect standing that the platform has not given them? If it does, name the mechanism you would put between the membership and the classification engine, because I will fund it.

### philosopher

Yes, and the lever is the price, not its size. Heyman and Ariely (2004) found that any payment,
however small, switches a person from social norms to market norms; a non-monetary gift of equal
value does not. Effort and standing aren't sensitive to price under social norms. Under market
norms they're measured against what was paid. Your $50 is not a cautious version of a fee that
would matter more at a higher number: any price makes this switch. Full note:
`research/2004-heyman-ariely-market-norms.md`, standing position P-9.

That answers you directly. A paying member plausibly expects more than the platform promised, not
because $50 buys much but because a price tells a person which frame to apply. A member in a
market frame totals up value received, and a comment tiered lower than expected becomes an entry
in that total.

The mechanism is a wall, not persuasion: payment status should never reach the classifier, the
vote weight, or the nomination panel. Nothing about a comment should carry who paid for it. That
costs nothing to run, because it's an integration the build simply never makes.

Watch Stage 3, as you already suspected. It's where a market-frame member's disagreement becomes
an action rather than a feeling. A skew toward paying members in nominations, once you have data
to check it, is the tell, and it's checkable against the Stripe table without the classifier ever
seeing payment status.

Nothing on your second question, whether asking for nothing signals the work is worth nothing.
Better to say that than reach for a citation I don't have.

Recommended outcome: answered. Pending designer's half.
