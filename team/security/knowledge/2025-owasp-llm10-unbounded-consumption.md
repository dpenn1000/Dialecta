# LLM10: Unbounded Consumption

**Source:** OWASP, "LLM10:2025 Unbounded Consumption", OWASP Top 10 for LLM Applications 2025 (GenAI Security Project), read 2026-09-20. https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/

## Summary

OWASP's definition: "Unbounded Consumption occurs when a Large Language Model (LLM) application allows users to conduct excessive and uncontrolled inferences, leading to risks such as denial of service (DoS), economic losses, model theft, and service degradation." This entry broadens and supersedes LLM04:2023 Model Denial of Service. The 2023 entry was about availability, whether an attacker can take the service down. The 2025 entry adds economic harm and IP theft as first-class outcomes of the same root cause: uncontrolled inference volume.

OWASP names seven sub-risks under this entry, and Denial of Wallet (DoW) is one of them, by that exact name, alongside Variable-Length Input Flood, Continuous Input Overflow, Resource-Intensive Queries, Model Extraction via API, Functional Model Replication, and Side-Channel Attacks. Putting DoW inside the official OWASP LLM taxonomy, not only in the separate serverless-security literature (see `2021-kelly-denial-of-wallet.md`), means an unauthenticated endpoint calling a billed model is a named OWASP risk category on its own, independent of whether any injection attempt succeeds.

The mitigation list maps directly to server code: "Implement strict input validation to ensure that inputs do not exceed reasonable size limits" and "Apply rate limiting and user quotas to restrict the number of requests a single source entity can make in a given time period." OWASP also calls for dynamic monitoring of per-user resource consumption, timeouts and throttling on resource-intensive operations, logging and anomaly detection, role-based access control for model repositories, and graceful degradation under load rather than hard failure. Of these, input size limits and rate limiting are the two a single Vercel function can implement without new infrastructure; the rest assume a system with user accounts or a self-hosted model layer that a public comment endpoint does not have.

## Implies for Dialecta

- `api/comment.js` and `api/classify.js` currently have no request size cap and no rate limit, which is the literal precondition OWASP names for Variable-Length Input Flood and Denial of Wallet.
- Add a maximum comment length check before the text reaches `api/classify.js`. This is the direct implementation of "strict input validation... do not exceed reasonable size limits" and it bounds the token cost of every classification call.
- Rate limiting belongs at the Vercel project level (see `2026-vercel-firewall-and-spend-management.md`), since OWASP's mitigation is about requests per source entity per time window, not about the classification prompt itself.
- Because there is no login, "per source entity" has to mean IP address or a comparable anonymous key, not a user account, when a rate limit rule is configured.

*Filed 2026-09-20*
