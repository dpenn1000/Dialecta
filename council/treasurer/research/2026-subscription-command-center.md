# The Subscription Command Center: found, and it is the expense side

**Source:** `C:\Users\dan\Downloads\subscription-dashboard`, a five-commit git repo deployed to the Vercel project `subscription-command-center` (`prj_m6c8UoyT0N3677DAnh07D2YljAVy`), created and last deployed around 28 to 29 May 2026. Read 2026-09-20. Six files: `index.html`, `api/state.js`, `middleware.js`, `package.json`, `.gitignore`, `.claude/launch.json`. Commits: dashboard, Basic Auth edge middleware, cross-device state sync via Vercel Blob, then two passes filling in GoDaddy detail.

Amounts and account last-4s below are Dan's own financial data. Card last-4s, PayPal agreement numbers and personal non-Dialecta line items are deliberately not reproduced here.

## What it is, and what it is not

It is a compiled ledger of **44 recurring subscriptions Dan pays**, built from statement data across PayPal, Capital One, Wells Fargo and a Webster debit card, with a keep, consider, cancel or investigate recommendation on each, normalisation to monthly and annual, category breakdown, cancel and manage deep links, and saved state synced across devices.

Total tracked: **$12,906 a year, about $1,075 a month.**

| Recommendation | Items | Annual |
| --- | --- | --- |
| keep | 16 | $7,488 |
| consider | 21 | $4,455 |
| cancel | 3 | $539 |
| investigate | 4 | $423 |

**It is not a Dialecta subscription revenue model.** There are no membership tiers, no prices Dialecta would charge, no reader-facing plans and no revenue projections anywhere in it. It tracks subscriptions Dan buys, not subscriptions Dialecta sells. Dan searched the Ghost console on 2026-09-20 and confirmed no tiers are configured there either.

That resolves the open question in `2026-search-for-the-subscription-plan.md` in a way worth stating plainly: **the substantial subscription work that was done is real, and it is about the cost side.** Dialecta's monetization model has still never been designed.

## What it gives the treasurer: actual spend, at last

The charter has asked twice for current monthly spend. This is the answer, from Dan's own statements rather than vendor list prices.

| Line | Actual | Annual | Dashboard's own note |
| --- | --- | --- | --- |
| Magicpages | $15.65/mo | $187.80 | Ghost blog hosting. "Keep only if the blog is live and updated" |
| GoDaddy (Webster debit) | $242/yr | $242.00 | Explicitly "**the Dialecta stack**": dialecta.org domain to 9/14/2027, Microsoft 365 Email Essentials for editor@dialecta.org, Conversations Deluxe, plus a GoDaddy Auctions membership and Domain Alert Pro Monitoring, which it flags to confirm |
| Vercel | $20.20/mo | $242.40 | Hosting. Shared across three Vercel projects |
| Resend | $20.00/mo | $240.00 | "Keep only if a live app is sending mail through it" |
| **Dialecta subtotal** | | **$912.20** | |
| Supabase | $32.00/mo | $384.00 | "Backend powering your **Trinity tools**". Attribution unclear |
| Claude (Anthropic) | $200/mo | $2,400 | Dan's personal Claude plan, **not** Dialecta's metered API spend. The dashboard notes it climbed from $21 to about $213 and asks whether that is a Max plan or API usage |

## Implies for Dialecta

- **Two lines in the modelled floor were wrong, and the domain was wrong by 16 times.** `../positions/monetization.md` carried "domain, about $15/yr, not verified". The real Dialecta GoDaddy line is **$242/yr**, because it is not just a domain: it is M365 email for editor@dialecta.org, Conversations Deluxe, and a Domain Alert Pro or Auctions membership. Corrected there.
- **Resend is already being paid at $20 a month and Dialecta has sent two emails through it, each to one recipient.** That is **$240 a year for a service delivering nothing**, confirmed against the Ghost analytics in `2026-ghost-native-analytics-all-time.md`. Magic Pages already bundles 10,000 emails a month into its $15.65. Resend is redundant until after Ghost cutover, and cancelling it now saves $240 a year, which is a quarter of the whole Dialecta floor and about five of the members the floor requires. **This is the cheapest money on the board and this advisor recommends cancelling it today.**
- Vercel at $20.20 and Magic Pages at $15.65 confirm the modelled figures almost exactly. The list-price method was sound; the two lines it got wrong were the two it had not verified.
- **The real Dialecta floor is about $912 a year excluding Supabase, or about $1,296 including it**, against the $924 this advisor modelled. Break-even moves from 16 annual memberships to **19, or 27 if Supabase is Dialecta's.**
- Supabase attribution has to be settled before the floor is final. The dashboard says the $32 powers Trinity tools, and this session's Supabase MCP token is scoped to a Trinity Solar organisation while Dialecta's project sits in Pennington Media Group. Those may be separate accounts with separate bills, in which case Dialecta's Supabase cost is not in this ledger at all and the floor is higher again.
- GoDaddy bills across two cards, $433.74 a year on PayPal for other properties and $242 on the Webster debit for Dialecta. The dashboard already flags consolidating them. Not a Dialecta decision, but it is the kind of thing that makes a floor hard to state.
- The dashboard is a genuinely useful instrument and it is pointed at the wrong half of the problem for Dialecta's purposes. **A version of it pointed at Dialecta's own costs and revenue is roughly what the treasurer asked for as a `dialecta-unit-economics` skill.** The pattern already exists and works.

*Filed 2026-09-20*
