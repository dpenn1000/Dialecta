# Vercel Firewall and Spend Management

**Source:** Vercel, "DDoS Mitigation", Vercel Documentation, read 2026-09-20. https://vercel.com/docs/vercel-firewall/ddos-mitigation

## Summary

Three separate Vercel controls answer three separate parts of this question, and they sit on different plans.

DDoS mitigation is automatic and free on every plan: "Vercel provides automatic DDoS mitigation for all deployments, regardless of your plan," covering L3, L4, and L7 attacks, and "Vercel does not charge customers for traffic that gets blocked with DDoS mitigation." The mechanism is volumetric, built to fingerprint abnormal request-pattern signals. Vercel's own docs state its limit: usage is still billed "for requests that are not recognized as a DDoS event, which may include bot and crawler traffic," meaning a steady trickle of individually normal-looking requests, not a spike, is not what this control catches. Attack Mode is a separate, manually-toggled layer: "Attack Mode is available for free on all plans and requests blocked by Attack Mode do not count towards your usage limits." It challenges every visitor to a site; known bots and a project's own Function or Cron traffic pass through unchallenged.

WAF rate limiting rules are a metered, plan-gated feature, and Hobby is materially thinner than Pro. Per the WAF Rate Limiting docs, Hobby gets 1 rate-limiting rule per project (3 total custom firewall rules of any kind), fixed-window counting only, a 10-second to 10-minute window, and 1,000,000 included allowed requests. Pro gets 40 rate-limiting rules per project on the same fixed-window algorithm, usage-based beyond the included allowance. Token Bucket counting and up to 1,000 rules per project are Enterprise only.

Spend protection, the pause-on-limit behavior, does not exist on Hobby at any price. Per vercel.com/docs/spend-management, it is "available at no additional cost to Pro teams and to Enterprise teams on the Flexible Commitment plan," and pausing is opt-in even there: "Setting a spend amount does not stop usage on its own." Checks run every few minutes, not continuously, and pausing excludes AI Gateway and v0 usage.

## Implies for Dialecta

- Dialecta's actual threat, individual comments carrying injection text rather than a traffic spike, is exactly the case Vercel's own docs flag as unbilled-but-uncaught by DDoS mitigation and unchallenged by Attack Mode's bot allowlist. Neither control substitutes for a request-rate cap on `api/comment.js` and `api/classify.js`.
- If the Vercel project `dialecta` is on Hobby, WAF rate limiting is still usable (1 rule, 1,000,000 included requests, IP-keyed) but Spend Management is not available at any price; a runaway classify bill on Hobby cannot be auto-paused by Vercel itself.
- A single Hobby rate-limit rule keyed on IP address, capping requests per minute to both endpoints, is the direct, no-cost mitigation for OWASP's Denial of Wallet sub-risk (`2025-owasp-llm10-unbounded-consumption.md`).
- If Dialecta moves to Pro for the 40-rule allowance or Spend Management, both the On-Demand Budget and the separate Pause Production Deployments switch need to be turned on; the budget alone only notifies, it does not stop spend.

*Filed 2026-09-20*
