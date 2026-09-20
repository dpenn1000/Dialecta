# Anthropic API spend and rate limits

**Source:** Anthropic, "Rate limits", Claude Platform Docs, read 2026-09-20. https://platform.claude.com/docs/en/api/rate-limits

## Summary

Anthropic separates two controls. Spend limits cap monthly dollar cost per organization; rate limits cap requests and tokens per minute. Both are enforced at the organization level by default, with the option to set tighter limits per workspace.

The monthly spend cap is set by usage tier: Start is $500 USD, Build is $1,000 USD, Scale is $200,000 USD, and Custom-tier organizations have no cap and negotiate limits with their account team. Organizations are placed on a tier automatically based on usage history and account standing; new organizations with limited history may start below even the Start tier, in an Evaluation tier, as a fraud and abuse control. An organization can also set its own spend limit below its tier's cap, from the Billing page in the Claude Console.

Hitting the tier's spend cap pauses all API usage until 00:00 UTC on the first day of the next month, unless a higher limit is requested sooner. Requests return HTTP 429 with error code `enforced_spend_limit_reached` and no `retry-after` header, so automatic SDK retries keep failing until the month rolls over or the tier changes. Hitting a self-set, lower spend limit instead returns HTTP 400, `invalid_request_error`, with a message that names whether the organization's or a specific workspace's limit was the one reached.

Rate limits are measured in requests per minute, input tokens per minute, and output tokens per minute, per model, using a token bucket algorithm with continuous replenishment rather than a fixed-interval reset. Cached input tokens do not count toward the input-token limit for most models, which is why heavy prompt caching raises effective throughput without raising the configured number.

Anthropic's documentation describes budget and rate configuration only at the workspace level, applied to every key issued inside that workspace: "If unset, your spend limit defaults to the organization's limit," and a workspace limit cannot exceed the organization's own limit. Neither the rate-limits page nor the workspace-management docs mention any budget mechanism scoped to an individual API key below the workspace.

## Implies for Dialecta

- The treasurer agent's $0.002-per-classification estimate means an organization on the Start tier's $500 monthly cap absorbs roughly 250,000 unbounded classification calls before Anthropic cuts off the whole organization, not just this endpoint. That is the outer backstop, not a per-endpoint control.
- Put the Dialecta Anthropic key in its own workspace with its own, lower spend limit, set below the org's tier cap, so a runaway `api/classify.js` trips a workspace-level HTTP 400 instead of taking down every other Anthropic-backed surface on the same organization.
- A workspace spend limit is a monthly dollar cap, not a per-request or per-minute cap. Pair it with Vercel-side rate limiting (`2026-vercel-firewall-and-spend-management.md`) to stop a spike before it accumulates toward that monthly number.
- No key-level budget exists to fall back on if workspace separation is skipped. If `api/classify.js` and any other Dialecta function share a key today, they share one budget with no isolation between them.

*Filed 2026-09-20*
