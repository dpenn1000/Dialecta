# Stripe: processing fees, and why the fixed 30 cents decides the billing period

**Source:** Stripe, "Pricing", fetched 2026-09-19. https://stripe.com/pricing

## Summary

Stripe's stated standard rates: **"2.9% + 30¢ per successful transaction for domestic cards."** International cards add 1.5 percent, currency conversion adds 1 percent, manually entered cards add 0.5 percent. Stripe Billing for recurring subscriptions is 0.7 percent of billing volume on pay-as-you-go, or a subscription starting at $620/month on a one-year contract. Stripe states it charges no setup, monthly, or hidden fees on standard pricing.

Substack's own FAQ quotes the Billing fee as 0.5 percent rather than 0.7 percent. Both are filed as read; the difference is a quarter of a percent and changes nothing below.

The fixed 30 cents is the finding. As a share of the charge it is invisible at large amounts and dominant at small ones:

| Charge | 2.9% | +$0.30 | +0.7% Billing | Total fee | Effective rate |
| --- | --- | --- | --- | --- | --- |
| $1/month | $0.029 | $0.30 | $0.007 | $0.336 | **33.6%** |
| $3/month | $0.087 | $0.30 | $0.021 | $0.408 | **13.6%** |
| $5/month | $0.145 | $0.30 | $0.035 | $0.480 | **9.6%** |
| $50/year | $1.45 | $0.30 | $0.35 | $2.10 | **4.2%** |
| $100/year | $2.90 | $0.30 | $0.70 | $3.90 | **3.9%** |

A $5 monthly membership billed twelve times costs $5.76 a year in fees on $60 of revenue, which is 9.6 percent. The same person on a $50 annual plan costs $2.10 on $50, which is 4.2 percent. Annual billing keeps about five and a half percentage points more of every membership and cuts the transaction count by twelve.

## Implies for Dialecta

- **Bill annually, not monthly.** This is the single most concrete thing the treasurer can say about monetization, it costs nothing to implement, and it is worth more than any plausible optimisation of the AI spend. It is the first row of the standing position.
- Never price a membership below about $5 a charge. Below $3 the processor takes more than a tenth, and at $1 it takes a third. A "pay what you want, minimum $1" tier would be a donation to Stripe.
- Twelve times fewer charges also means twelve times fewer expired cards, retries and dunning emails. That saves Resend volume and saves Dan's attention, which is the scarcer resource.
- If Dialecta ever offers monthly, offer it alongside an annual price that is visibly cheaper, and let the fee structure be the reason rather than a growth tactic. That framing is honest and the Editorial Voice can carry it.
- Verify against Stripe's UK or local pricing page before launch if Dan bills outside the US. The rates above are the US domestic card rates.

*Filed 2026-09-19*
