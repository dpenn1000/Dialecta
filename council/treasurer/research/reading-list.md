# Reading list: treasurer

*Seed written by Claude, 2026-09-19. Verify before filing; prices and plans change, so every number carries a fetch date. Add leads as you read.*

*Sprint 1 worked this list on 2026-09-19 with `--max 14` rather than the default 6, because the monetization position needed both the cost stack and the revenue-model evidence. The `dialecta-local-research` MCP server failed to connect for that session (CONNECTION_CLOSED) although Ollama itself was up with `qwen2.5:14b`, so every source below was fetched with WebFetch and summarised by the Claude agent. Each note says so.*

| State | Lead | Why it matters here |
| --- | --- | --- |
| filed | Anthropic API pricing page, Claude Haiku input and output per million tokens (fetch date) | Cost per classified comment; the biggest variable cost. `2026-anthropic-api-pricing.md`. Haiku 4.5 at $1 in / $5 out. The seed said "Anthropic pricing page"; that URL now 301s to claude.com/pricing |
| filed | Supabase pricing (Free, Pro, compute add-ons, storage, egress) | The database bill at 100, 1,000, 10,000 contributors. `2026-supabase-pricing.md`. The binding fact is not a price: Free projects pause after a week of inactivity |
| filed | Vercel pricing (Hobby vs Pro, function invocations, bandwidth) | Hosting bill; whether Hobby is allowed for a site with sign-ups. `2026-vercel-pricing.md`. Answer: no. Hobby is "for personal, non-commercial use" |
| filed | Resend pricing (emails per month tiers) | Newsletter cost after Ghost is cancelled. `2026-resend-pricing.md`. The 100/day cap on Free binds long before the 3,000/month allowance does |
| filed | Magic Pages and Ghost(Pro) pricing | What cancelling Ghost saves. `2026-ghost-magicpages-hosting.md`. $15/month, and the saving goes negative once the mailing list passes 100 a day |
| filed | Substack's economics: 10% take, writer-funded model, its 2023 to 2025 pricing changes and the Notes pivot | The dominant paid-newsletter model and its limits for a multi-author platform. `2026-substack-platform-fee.md`. **Half filed:** the 10% and the fee stack are verified; the pricing history and the Notes pivot were not researched and stay open below |
| filed | Patreon and Ko-fi fee structures | Patronage as a model for a small editorial community. `2026-patreon-kofi-patronage-fees.md`. Patreon verified at 10%; **Ko-fi is unverified**, its own pages returned 403 |
| filed | Medium Partner Program history (2017 to present) | A cautionary case: paying writers from a pooled subscription. `2026-medium-partner-program.md`. **Structure verified through secondaries only**; help.medium.com returned 403 |
| filed | Institute for Nonprofit News, member revenue reports | How small editorial nonprofits actually fund themselves. `2025-inn-index-revenue-mix.md`. 49% foundations / 32% individual / 18% earned. **Primary 403; read through Media Nation** |
| todo | Knight Foundation and Omidyar funding for civic discourse and journalism tools | Grant landscape for a discourse platform; what they fund and what they ask for. Not reached in sprint 1 |
| filed | Wikimedia Foundation fundraising model and annual report | The largest reader-funded knowledge platform; the case for small recurring donors. `2026-wikimedia-fundraising.md`. Average gift $11; fundraising costs 11.4% of expenses |
| todo | Discourse.org hosting business (open source core, paid hosting) | Open core as a revenue model for community software. Not reached in sprint 1 |
| filed | Kelly (2008), "1,000 True Fans" | The arithmetic of a small paying community. `2008-kelly-1000-true-fans.md`. Run backwards, Dialecta's floor is six true fans |
| filed | Metafilter's finances (the 2014 revenue crisis and member funding after) | What happens when ads fail a discourse community. `2014-metafilter-ad-collapse.md`. **MetaTalk primary returned 403**; filed from Slate, with the unverified figures marked |
| todo | Fathom and Plausible (privacy-first analytics) pricing | Analytics without the ad model; the designer needs the metrics, someone has to pay for them. Partly checked in sprint 1: Plausible starts at $9/month for 10k pageviews, 30-day trial, no free tier. Not filed; fetch Fathom and file the pair |

## Leads added while reading, sprint 1

| State | Lead | Why it matters here |
| --- | --- | --- |
| todo | Anthropic prompt caching minimums and Batch API limits, platform.claude.com docs | Filed early as `2026-anthropic-caching-batch-limits.md` because it changes the unit cost. Re-read when Haiku ships a new version; the 4,096-token minimum is per model and it moves |
| todo | Stripe pricing for Dan's billing country, not the US page | Filed the US rates as `2026-stripe-processing-fees.md`. The 2.9% + 30c that drives the annual-billing position is US domestic. Confirm before launch |
| todo | Stripe Billing fee, 0.5% or 0.7% | Substack's FAQ says 0.5%, Stripe's own page says 0.7% pay-as-you-go. A quarter point either way, but the position quotes a number and should quote the right one |
| todo | Substack 2023 to 2025 pricing history and the Notes pivot | The unfinished half of the seeded Substack lead. Matters because a platform changing its terms under its writers is the dependency risk MetaFilter demonstrates |
| todo | Ko-fi fee structure from a primary page, and Buy Me a Coffee for comparison | Ko-fi's 0% on tips is the only rate seen that beats direct Stripe, and it is the one figure this sprint could not verify |
| todo | Open Collective and Every.org as fiscal hosts for a small project taking recurring donations | If patronage becomes a line, someone has to receive the money. Relevant to whether Dialecta ever needs a legal entity, which is a cost the floor model does not yet carry |
| todo | The cost of a legal entity and the accounting for taking recurring money: LLC or nonprofit, state fees, bookkeeping | The floor model in `../positions/monetization.md` counts vendors only. Taking money has its own fixed cost and the position is weaker until it is priced |
| todo | Comment spam economics: what an automated sign-up run costs an attacker, and what rate limiting is standard | The open sign-up position in `../positions/p0-d2-signup.md` rests on this and currently reasons from first principles rather than from a source |
