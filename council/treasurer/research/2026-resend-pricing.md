# Resend: email pricing tiers and the daily cap

**Source:** Resend, "Pricing", fetched 2026-09-19. https://resend.com/pricing

## Summary

| Tier | Price | Emails/month | Daily limit | Domains |
| --- | --- | --- | --- | --- |
| Free | $0 | 3,000 | **100/day** | 3 |
| Pro | $20 | 50,000 | none | 10 |
| Pro | $35 | 100,000 | none | 10 |
| Scale | $90 | 100,000 | none | 1,000 |
| Scale | $350 | 500,000 | none | 1,000 |

Overage beyond the included volume runs from $0.90 down to $0.46 per 1,000 emails depending on plan. Paid plans include 10,000 automation runs a month, with extra runs at $0.0015 each.

The number that binds is the Free tier's **100 emails per day**, not its 3,000 per month. Those two limits are not the same constraint. A newsletter has a spike shape: 3,000/month suggests room for a monthly send to 3,000 people, but 100/day means the first announcement to 101 members fails. Transactional mail behaves differently, since sign-up confirmations and notification emails arrive spread out, and 100/day covers a lot of those.

## Implies for Dialecta

- Resend is $0 until Dialecta has more than 100 people to email at once. That is the bend in the email cost curve, and it arrives at about 100 members rather than at any traffic number.
- The first paid tier is $20. It buys 50,000 emails, which at 100 members is 500 sends a member per month. Dialecta will not use a tenth of it. Expect to sit at $20 for a long time once the line opens.
- This is the replacement for Ghost's newsletter after cutover (see `2026-ghost-magicpages-hosting.md`). Magic Pages bundles 10,000 emails a month at $15 total. Resend charges $20 for email alone. **Leaving Ghost makes email more expensive, not less**, until volume exceeds 10,000/month. The saving from cancelling Ghost is smaller than it looks and the treasurer should not claim it twice.
- The live Supabase schema already carries a `notifications` table. Notification email is the volume that will cross 100/day long before the newsletter does, because it scales with users multiplied by activity rather than with users alone. Whoever specs notifications should set a digest default rather than per-event sends, which keeps the line at $0 for longer and is the cheaper design on the designer's terms as well.

*Filed 2026-09-19*
