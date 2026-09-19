# Vercel: Hobby and Pro pricing, and the commercial-use restriction

**Source:** Vercel, "Pricing", fetched 2026-09-19. https://vercel.com/pricing

## Summary

| | Hobby | Pro |
| --- | --- | --- |
| Price | $0/month | $20/month per developer seat |
| Function invocations | 1M/month | 1M/month, then $0.60 per 1M |
| Fast data transfer | 100 GB/month | 1 TB/month, then $0.15/GB |
| Edge requests | 1M/month | 10M/month, then $2 per 1M |
| Active CPU | 4 hours/month | from $0.128/hour beyond included |

Pro includes unlimited viewer seats and one billing seat at no extra cost.

The finding that matters is not a number. The page states: **"Our Hobby plan is for personal, non-commercial use."**

Dialecta is planning memberships (Project Brief open question on monetization) and already runs member sign-ups through Ghost. The moment any money changes hands, Hobby is outside its own terms. This is a licence constraint, not a capacity one: the 1M invocations and 100 GB on Hobby would carry Dialecta comfortably for years on volume alone.

## Implies for Dialecta

- Vercel Pro at $20/month is a fixed cost that arrives with the monetization decision, not with traffic. Any monetization model that involves charging anyone converts a $0 line into a $20 line. Put it in the floor from day one rather than discovering it later.
- This is the cheapest thing on the list to get wrong, and the most annoying: a terms violation can take the site down rather than send a bill. Move to Pro before the first paid membership, not after.
- Backlog P0-3 owns the Vercel project configuration fix (root directory still set for the old `api/` layout, preview builds failing on a missing `public` directory). The plan decision and the billing decision should be made in the same sitting, since both are Dan's to make in the dashboard.
- On P0-D2, Vercel gives no reason to prefer invite-only. 1M function invocations covers open sign-up at any volume Dialecta will see before the egress question arrives.

*Filed 2026-09-19*
