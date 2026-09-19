# Substack: the 10 percent take and what it does and does not cover

**Source:** Substack, "How do paid subscriptions on Substack work?", faq.substack.com, fetched 2026-09-19. https://faq.substack.com/p/how-do-paid-subscriptions-on-substack

## Summary

Substack states: "Substack's platform fee is 10%." Free publishing carries no fee at all: "Publishing is free on Substack if your content is free, no matter how many subscribers you have." On top of the 10 percent, Stripe charges "a credit card fee of 2.9% + $0.30 per transaction" and a recurring-subscription billing fee of 0.5 percent.

So a writer charging $50 a year keeps roughly $43: $5 to Substack, $1.45 plus $0.30 to Stripe, $0.25 in billing fee.

The support article at support.substack.com returned HTTP 403 to an automated fetch. The figures above come from Substack's own FAQ publication, which is primary enough to file; both say the same 10 percent.

The lead in `reading-list.md` also asked about the 2023 to 2025 pricing changes and the Notes pivot. **Neither was verified in this sprint.** The 10 percent take and the fee stack are confirmed; the history and the product pivot are not, and no claim should be made about them until they are. That part of the lead stays open.

## Implies for Dialecta

- 10 percent plus processing is the market rate for a hosted publishing platform that handles payments, and Patreon charges the same 10 percent. Anything Dialecta builds itself has to beat that rate net of what self-hosting costs, and at low revenue it does not. See `../positions/monetization.md` for the crossover arithmetic.
- The free-if-free rule is the part worth copying. Substack charges nothing until money moves. A Dialecta membership that costs nothing to offer and takes nothing from people who never pay has the same property, and it keeps the contributor pool from being gated by price.
- Substack is a single-author economic model wearing a multi-author interface. The 10 percent is charged per publication, not pooled. Whatever Dialecta does about contributor revenue, this is the model that does **not** create the pooled-payout incentive problem that Medium's does. See `2026-medium-partner-program.md`.
- Substack cannot host Dialecta's product. It has no tier engine, no classification stage, no fingerprint. Citing its economics as a reason to move there would be citing the price of a different thing.

*Filed 2026-09-19*
