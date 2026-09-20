# Ghost(Pro) and Magic Pages: what leaving Ghost saves

**Source:** Ghost, "Pricing", https://ghost.org/pricing/ and Magic Pages, home and pricing, https://www.magicpages.co/ . Both fetched 2026-09-19.

## Summary

**Magic Pages**, which is where Dialecta runs today (`dialecta.mymagic.page`): $15/month, $150/year, or $450 once for a lifetime plan. One plan, no tier gating. Includes 10,000 emails a month, Cloudflare CDN, daily backups, SSL, Ghost updates, unlimited members and staff, and a 99.9 percent uptime SLA on the monthly and yearly plans. Extra email is billed at $5 per 10,000. A Custom plan starts at $50/month.

**Ghost(Pro)**, the first-party alternative, billed yearly: Starter $18/month for 1,000 members and 1 staff user; Publisher $29/month for 1,000 members and 3 staff; Business $199/month for 10,000 members and 15 staff.

Magic Pages is cheaper than Ghost(Pro) Starter and removes the member and staff caps. On price alone there is no case for moving between them.

The reading-list lead asked what cancelling Ghost saves. The honest answer is **$15/month, or $180/year, and not all of that is a saving**. Magic Pages bundles 10,000 emails a month into its $15. Replacing it means Supabase and Vercel absorb the content and member roles, which they can, and Resend absorbs the newsletter at $20/month once volume passes 100 emails a day. Netted out, cutover saves $15/month only while the mailing list stays under 100 people, and costs $5/month more after that.

The search result that led here quoted a price of 13 euros a month. The primary page on the fetch date says $15 USD. The seeded lead's implied figure is superseded by what the vendor's own page now says.

## Implies for Dialecta

- ADR-001 (leave Ghost) is right for reasons that are not financial. The cash saving is $180/year at best and turns negative once the newsletter outgrows 100 sends a day. Nobody should defend the cutover on cost, and this advisor will not.
- The real cost of staying on Ghost is not $15/month. It is that the tier engine, the fingerprint and the opinion maps cannot live there, which is the whole product. That is an argument the philosopher and the designer make better than the treasurer does, and the treasurer should stop claiming a saving it cannot show.
- The $450 lifetime plan is a trap for a platform that has already decided to leave. Do not buy it.
- Until cutover, Magic Pages at $15 sits in the floor alongside Supabase Pro and Vercel Pro. That is three vendors billing for one site, which is the transitional cost of ADR-001 and should be named as temporary in any budget shown to Dan.

*Filed 2026-09-19*
