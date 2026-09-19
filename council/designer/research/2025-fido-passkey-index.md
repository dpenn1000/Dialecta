# Passkey Index

**Source:** FIDO Alliance with Liminal, "Passkey Index", October 2025. Read 19 September 2026. https://fidoalliance.org/wp-content/uploads/2025/10/FIDO-Passkey-Index-October-2025.pdf

## Summary

A confidential survey of nine FIDO Alliance member organisations that have run passkeys for one to three years: Amazon, Google, LY Corporation, Mercari, Microsoft, NTT DOCOMO, PayPal, Target and TikTok. Reported results: an average 93% of accounts are eligible for passkeys, 36% of accounts have one enrolled, 26% of sign-ins use one, a 93% sign-in success rate for passkeys against 63% for other methods, and 8.5 seconds per passkey sign-in against 31.2 seconds for traditional MFA. Participants also report up to an 81% reduction in sign-in related help desk incidents.

Three caveats sit in the document itself. The report's own footnote defines "other authentication methods" as including social login such as Sign in with Google, alongside MFA and one-time passwords, so the 93 against 63 comparison does not isolate any single alternative. The survey is confidential and self-reported by members of the body that promotes the standard. And every participant is a consumer platform operating at a scale Dialecta will not reach, most of them with native mobile apps carrying the enrolment.

## Implies for Dialecta

- P0-D2: after one to three years at Amazon and Google scale, passkeys carry 26% of sign-ins and sit on 36% of accounts. A platform with 14 members should not make passkeys the primary method at cutover. ADR-002's ordering, passkeys later, is supported.
- The headline cannot be read as passkeys beating Sign in with Google, because the report bundles social login into the 63%. Anyone citing 93 against 63 in the council debate is citing something that does not answer the question asked.
- What does transfer is the direction: a method that completes inside the browser beats one that sends the person somewhere else and asks them to come back. That is the whole argument against a magic link as the default path.
- P0-4: sign-in success rate is the metric this report is built on and Dialecta has no equivalent. Login completion, split by method, should ship with /login rather than after it. This is the return-rate half of this advisor's standing instrumentation ask.

*Filed 2026-09-19*
