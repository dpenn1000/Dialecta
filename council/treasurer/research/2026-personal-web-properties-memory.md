# The 2026-05-29 hard constraint on touching Dialecta

**Source:** `project_personal_web_properties.md` at commit `f7cc960` in `C:\Users\dan\claude-memory`, recovered 2026-09-20 on Dan's pointer. The file was deleted from that repo by an auto-sync commit `4f20cdf` on 2026-09-12; its `MEMORY.md` index line read "Personal web properties, PMG/Daddy Long Legs/Rylie/Dialecta". A history-wide search confirms this file and the `MEMORY.md` lines pointing at it are the only Dialecta content that has ever existed in that repo.

## The constraint

Quoted from the recovered file:

> **HARD CONSTRAINT (2026-05-29): Dialecta must NOT be migrated or touched in ANY way.** It has a complex ecosystem (its own auth base, blog system, etc.). Do not change its DNS, its GoDaddy W+M / M365 Email Essentials / Conversations Deluxe subscriptions, or anything else. Exclude it entirely from any hosting/cost-cutting migration calculus.

The context it sits in: Dan was replacing paid GoDaddy Websites and Marketing plans with free static hosting across his other properties, with Cloudflare Pages recommended as the destination because DNS, hosting, SSL and analytics land in one free dashboard he already runs for a Trinity tunnel. Static sites for Pennington Media Group and Daddy Long Legs were built at `Downloads/sites/{pmg,dll}/index.html`. The sequencing rule recorded alongside it: never turn off a Websites and Marketing auto-renew until the replacement site is live and DNS is cut over and verified, or the domain goes dark. The file references `[[subscription-dashboard]]` by name as "the broader cost-cutting context", which confirms what the dashboard was for.

## What it corrects in this advisor's work

- **The GoDaddy recommendation runs straight into it.** `2026-subscription-command-center.md` flagged Dialecta's $242 a year GoDaddy line and singled out the Domain Alert Pro or Auctions membership as worth confirming. The constraint names the GoDaddy Websites and Marketing, M365 Email Essentials and Conversations Deluxe subscriptions specifically and says do not change them. **That line is off limits until Dan reopens it**, and this advisor withdraws the suggestion rather than arguing with a decision already recorded.
- **Resend probably sits outside the constraint, and Dan should be the one to say so.** The constraint enumerates DNS and the GoDaddy stack, and its stated purpose is to keep Dialecta out of a hosting migration. Resend is billed separately on a different card, is not DNS, not GoDaddy, not the blog, and cancelling it migrates nothing. But the clause ends "or anything else", and this advisor is not going to read its own exception into Dan's own rule. **The $240 a year recommendation stands, flagged against the constraint, for Dan to clear.**
- The constraint's reasoning is about operational risk to a live, complex site, not about money. It was written to protect Dialecta during a migration of other properties. Whether it still binds four months later, with Dialecta dormant and its rebuild in progress, is Dan's call and not this advisor's.

## What it settles about Supabase

The file names **Pennington Media Group as the umbrella company** over Rylie, Daddy Long Legs and Dialecta. That explains the organisation name on Dialecta's Supabase project.

It also sharpens the open attribution question into something worse than uncertainty. Supabase bills per organisation. The subscription ledger's $32 a month Supabase line is annotated "Backend powering your Trinity tools", and this session's Supabase token is scoped to a **Trinity Solar** organisation. Dialecta's project `mguulnibvzusfvyuowwh` sits in **Pennington Media Group**, a different organisation with its own bill.

**So Dialecta's Supabase cost is most likely not in the 44-item ledger at all, and the floor is higher than $78 rather than lower.** There are only two readings and both need checking:

1. The Pennington Media Group organisation is on a paid plan, and that bill is missing from the ledger. The floor rises by whatever it is.
2. It is on the Free tier, in which case **the project has been paused**, because Supabase pauses Free projects after a week of inactivity and Dialecta has been dormant since early May.

Reading two is an operational problem rather than a treasurer one, and a serious one: backlog P0-2 through P0-7 and the whole rebuild assume a live database holding 32 tables and real rows.

## Implies for Dialecta

- Ask Dan to open Supabase billing for the **Pennington Media Group** organisation and report the plan and the monthly charge. It is the last number between this advisor and a final floor, and it may also reveal that the database is paused.
- Treat the 2026-05-29 constraint as binding on the GoDaddy and DNS lines until Dan says otherwise. Record it in `positions.md` so no future council run recommends cutting them without seeing it first.
- The constraint is a good argument for why this advisor should read `C:\Users\dan\claude-memory` at the start of a sprint. Decisions that bind Dialecta live outside the Dialecta repo, and sprint 1 did not know that.
- Dan reports a legacy memory export on his project page with about five days left on it. If any further Dialecta decisions were recorded and then auto-synced away, that export is where they are, and the window closes. **Worth pulling today regardless of whether it holds anything about the dashboard.**

*Filed 2026-09-20*
