# Denial of wallet

**Source:** Kelly, Glavin, and Barrett, "Denial of Wallet: Defining a Looming Threat to Serverless Computing", Journal of Information Security and Applications, vol. 60 (2021) / arXiv:2104.08031, read 2026-09-20. https://arxiv.org/abs/2104.08031

## Summary

This is the paper that names the attack and gives it a formal definition. Kelly, Glavin, and Barrett define a Denial of Wallet (DoW) attack as the intentional, mass, and continual invocation of serverless functions, resulting in the financial exhaustion of the victim in the form of inflated usage bills. The definition is built against the Function-as-a-Service billing model specifically: a serverless platform is designed to autoscale to meet demand and bill per invocation, duration, or compute unit, so the property that makes serverless attractive, scaling to any load without an operator provisioning capacity ahead of time, is the same property that removes the usual ceiling on cost.

The paper's central distinction from denial of service is about the target, not the mechanism. A DoS attack aims at availability: the service degrades or goes down. A DoW attack can succeed while the service stays fully available and fully correct, because the attacker's goal was never disruption. Their framing is that the finances are the target, not the infrastructure, which is why a system can pass every uptime and correctness check while still being under an active DoW attack, and why monitoring built only for availability and error rate will not surface one.

The paper predates the current generation of LLM APIs and does not address AI inference cost specifically, but its core claim generalizes cleanly to any pay-per-call backend: a paid, metered, per-request charge with autoscaling and no caller-side cost ceiling is the precondition, whether the metered resource is a serverless function invocation or a model API call. A 2025 review of DoW attacks in serverless architectures (arXiv:2508.19284) confirms the class remains active research territory and treats AI-inference endpoints as one of the current attack surfaces alongside traditional FaaS.

## Implies for Dialecta

- `api/comment.js` calling `api/classify.js` on every public submission matches this paper's own definition of the DoW precondition: an unauthenticated, autoscaling, metered call with no caller-side ceiling. The Anthropic charge is the "inflated usage bill" the paper describes, not a hypothetical.
- Uptime monitoring will not catch this. Per the paper's own distinction, the endpoints can be up, fast, and correct while the bill climbs, so the metric to watch is Anthropic spend and Vercel function invocation count, not error rate or latency.
- The mitigation surface is the same as for classic FaaS DoW: caller-side rate limiting and a hard spend ceiling. See `2026-vercel-firewall-and-spend-management.md` for what Vercel provides and `2026-anthropic-rate-and-spend-limits.md` for what Anthropic provides; neither alone closes this, since Vercel's ceiling covers dollars spent on Vercel-metered resources and Anthropic's covers dollars spent on the Anthropic key.
- Treat this as a named, citable class distinct from prompt injection: even a classifier that is fully immune to grade manipulation is still exposed to DoW from unauthenticated call volume alone.

*Filed 2026-09-20*
