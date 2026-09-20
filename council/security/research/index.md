# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source,
named `YYYY-<author>-<slug>.md` with citation, summary, and what it implies for a
named Dialecta surface or a named practice.

Forty-one notes, filed 2026-09-20 across six sections, in two sprints run the same day. Six of
them measure this estate rather than citing an outside source; those are marked below and are the
ones another agent cannot reproduce from a search.

## This estate, measured

| File | Source | Implies for |
| --- | --- | --- |
| [2026-vercel-deployed-api-provenance.md](2026-vercel-deployed-api-provenance.md) | This agent, from the Vercel and GitHub APIs | The production API's commit does not exist on GitHub and about 29 of its endpoints exist in no repository. The deployment artifact is the only copy. Blocks P0-3 |
| [live-surface-inventory.md](live-surface-inventory.md) | This agent, from the deployment file tree | Thirty-eight routes, the repository named as their source holds 11 files. Thirty are marked `unread` and why. `_cors.js` in full, `_capabilities.js` in part |
| [2026-live-grant-and-policy-surface.md](2026-live-grant-and-policy-surface.md) | This agent, from `pg_class`, `pg_policies`, `has_table_privilege` | All 30 public tables grant full CRUD to `anon` and `authenticated`. Settles the reviewer's premise: B2 does not drop. Carries the `information_schema` trap |
| [2026-dialecta-comment-credential-chain.md](2026-dialecta-comment-credential-chain.md) | This agent, from the recovered source, corroborated by `reviewer` | **Confirmed, not "may be".** `/api/comment` authorizes on `member_uuid` and `profiles.ghost_member_id` is world readable, so a public SELECT plus a POST posts as any member, with no account on the attacker's side. Bounded only by the `pending_review` column default, which expires when the promotion pipeline ships |
| [2026-live-storage-surface.md](2026-live-storage-surface.md) | This agent, from `storage.buckets` and `storage.objects` | One bucket, `feedback-screenshots`, public read, empty. `article-media` does not exist live. Zero storage policies is doing the work a policy should |
| [2026-dialecta-secret-and-artifact-hygiene.md](2026-dialecta-secret-and-artifact-hygiene.md) | This agent, from both repositories and the artifact | Nothing credential shaped is in history. The deploy artifact carries contributor names and Ghost ids. No `.vercelignore` |

## Identity and access

| File | Source | Implies for |
| --- | --- | --- |
| [2026-supabase-auth-mfa.md](2026-supabase-auth-mfa.md) | Supabase, "Multi-Factor Authentication" | The `aal` claim only gates anything once a `restrictive` RLS policy reads it. Enrolling MFA alone changes nothing |
| [2026-supabase-google-oauth.md](2026-supabase-google-oauth.md) | Supabase, "Sign in with Google" and "Identity Linking" | P0-D2. Automatic linking by email is on by default. Whether an unverified Google email can trigger it is unconfirmed by Supabase's own docs |
| [2026-supabase-passkeys.md](2026-supabase-passkeys.md) | Supabase, "Passkey authentication" | Native support exists, beta dated 2026-05-28, opt-in flag. Corrects the assumption that Supabase has no passkeys. AAL level of a passkey sign-in unstated |
| [2026-supabase-session-cookies.md](2026-supabase-session-cookies.md) | Supabase advanced guide, Next.js guide, `@supabase/ssr` | `getClaims()` over `getSession()` server side. Single use refresh tokens explain random logouts. Cookies chunk past 3180 bytes |
| [2026-owasp-authentication-cheat-sheet.md](2026-owasp-authentication-cheat-sheet.md) | OWASP Cheat Sheet Series | 15 character password floor, 8 only with MFA, no composition rules, no forced rotation, account keyed lockout with backoff |
| [2026-owasp-asvs-v6-authentication.md](2026-owasp-asvs-v6-authentication.md) | OWASP ASVS 5.0.0, chapter V6 | Numbered requirement ids (6.2.1, 6.2.5, 6.2.9, 6.2.10, 6.3.3) to cite rather than restating rules in prose |
| [2026-nist-800-63b.md](2026-nist-800-63b.md) | NIST SP 800-63B-4 | The normative root under Supabase's `aal1` and `aal2` vocabulary and under everyone else's password guidance |

## The AI endpoints

| File | Source | Implies for |
| --- | --- | --- |
| [2025-owasp-llm01-prompt-injection.md](2025-owasp-llm01-prompt-injection.md) | OWASP, "LLM01:2025 Prompt Injection" | Output format validation is the one mitigation `api/classify.js` can implement directly. Prompt wording is not OWASP's answer |
| [2025-owasp-llm10-unbounded-consumption.md](2025-owasp-llm10-unbounded-consumption.md) | OWASP, "LLM10:2025 Unbounded Consumption" | Denial of Wallet under that exact name. Input length cap plus rate limiting are what one function can do |
| [2025-willison-prompt-injection-design-patterns.md](2025-willison-prompt-injection-design-patterns.md) | Simon Willison, on Beurer-Kellner et al. 2025 | Constrain the output space, do not trust wording. Treat every classification as an unverified signal |
| [2026-anthropic-structured-outputs.md](2026-anthropic-structured-outputs.md) | Anthropic, "Structured outputs" | `output_config.format` with an `enum` schema constrains `classify.js` to trusted tiers by decoding, not by post hoc validation |
| [2026-anthropic-rate-and-spend-limits.md](2026-anthropic-rate-and-spend-limits.md) | Anthropic, "Rate limits" | Isolate the Dialecta key in its own workspace with a spend limit. No per key budget exists |
| [2026-vercel-firewall-and-spend-management.md](2026-vercel-firewall-and-spend-management.md) | Vercel docs, four pages | Hobby gets DDoS mitigation, Attack Mode and one rate limit rule free, and no Spend Management at any price. Normal looking single requests are what DDoS mitigation does not catch |
| [2021-kelly-denial-of-wallet.md](2021-kelly-denial-of-wallet.md) | Kelly, Glavin and Barrett, arXiv:2104.08031 | `comment.js` calling `classify.js` matches the paper's precondition exactly. Uptime and error rate monitoring will not detect it |

## Data protection and liability

| File | Source | Implies for |
| --- | --- | --- |
| [2021-ct-breach-notification.md](2021-ct-breach-notification.md) | Conn. Gen. Stat. 36a-701b | 60 days from discovery. No mandatory written security program, but PA 21-119 gives a punitive damages safe harbor to a business that has one |
| [2023-ct-data-privacy-act.md](2023-ct-data-privacy-act.md) | Conn. Gen. Stat. 42-516, as amended by PA 25-113 | Threshold dropped to 35,000 consumers, plus two no floor triggers: any sensitive data processing, any sale. Carries a correction to several published law firm summaries |
| [2016-eu-gdpr-territorial-scope.md](2016-eu-gdpr-territorial-scope.md) | GDPR Art. 3(2), 28(3), 30 and EDPB Guidelines 3/2018 | The fingerprint fits Art. 3(2)(b) monitoring more closely than anything here fits offering. Supabase and Anthropic are processors needing Art. 28(3) terms |
| [2016-gdpr-automated-decision-making.md](2016-gdpr-automated-decision-making.md) | GDPR Art. 22 and Recital 71 | The fingerprint is profiling on its face. Art. 22 bites only if a tier drives a solely automated decision with significant effect |
| [2023-ct-data-minimization-retention.md](2023-ct-data-minimization-retention.md) | Conn. Gen. Stat. 42-520(a)(1) and GDPR Art. 5(1)(c) and (e) | Minimisation and retention limits are statutory duties in both regimes. Argues for a written retention number on fingerprint inputs |
| [2022-travelers-mfa-warranty-rescission.md](2022-travelers-mfa-warranty-rescission.md) | Travelers v. International Control Services, D. Ill. 2:22-cv-02145 | Misstating MFA scope on a cyber application voided the policy retroactively, not one claim. Read via docket index and industry reporting, not the primary filings |
| [2022-pcissc-saq-a-eligibility.md](2022-pcissc-saq-a-eligibility.md) | PCI SSC, SAQ A under PCI DSS v4.0 | Hosted checkout keeps Dialecta in SAQ A. Since April 2025 the merchant's own checkout page carries a script integrity duty even without touching card data |

## Tooling and standards

| File | Source | Implies for |
| --- | --- | --- |
| [2026-gitleaks-secret-scanning.md](2026-gitleaks-secret-scanning.md) | `gitleaks/gitleaks`, and `trufflesecurity/trufflehog` | The control the `vercel.tolken` incident actually wants. A `gitleaks-action` job in `ci.yml` is free on a public repo. No pre-commit tooling exists here yet |
| [2026-semgrep-static-analysis.md](2026-semgrep-static-analysis.md) | `semgrep/semgrep` and `github/codeql` | `ci.yml` runs no lint or static analysis of any kind. CodeQL default setup is a checkbox on a public repo |
| [2026-supabase-rls-testing.md](2026-supabase-rls-testing.md) | Supabase pgTAP docs, `usebasejump/supabase-test-helpers`, `supabase/splinter` | What can actually assert "anon cannot read this table" in CI. `supabase/tests/database/` does not exist yet |
| [2026-ossf-scorecard-supply-chain.md](2026-ossf-scorecard-supply-chain.md) | `ossf/scorecard`, `ossf/allstar`, `step-security/harden-runner` | Actions in `ci.yml` are tag pinned rather than SHA pinned. Allstar assessed and rejected as wrong for a two repo solo setup |
| [2026-github-dependabot.md](2026-github-dependabot.md) | GitHub Dependabot, `dependabot/dependabot-core` | `.github/dependabot.yml` does not exist. Four ecosystems to cover. Free, no CI minutes |
| [2026-nextjs-security-headers-csp.md](2026-nextjs-security-headers-csp.md) | Next.js CSP guide, `OWASP/www-project-secure-headers` | The `headers()` the reviewer's should-fix asks for in `apps/web/next.config.ts`. Nonce path unnecessary while there are no inline scripts |
| [2026-owasp-standards-for-dialecta.md](2026-owasp-standards-for-dialecta.md) | `OWASP/ASVS`, `OWASP/CheatSheetSeries`, the LLM Top 10 project | Which sheets match findings already on record. The LLM Top 10 repo named in the lead is now a legacy archive, superseded by `GenAI-Security-Project/GenAI-LLM-Top10` |

## The Next.js rebuild

Filed 2026-09-20 ahead of the rebuild. The position they support is
[positions/nextjs-rebuild.md](../positions/nextjs-rebuild.md).

| File | Source | Implies for |
| --- | --- | --- |
| [2026-nextjs-middleware-cve.md](2026-nextjs-middleware-cve.md) | Vercel postmortem, GHSA-f82v-jwr5-mffw, NVD CVE-2025-29927 | 15.5.25 is patched, so this is not live. The rule outlives the patch: middleware is never the sole gate. Carries the `proxy.ts` rename trap, which arrived in 16.0.0 and would make a copied sample inert here |
| [2026-nextjs-server-actions-authorization.md](2026-nextjs-server-actions-authorization.md) | Next.js "Data Security", "How to Think About Security in Next.js" | Every Server Action is a public endpoint and needs its own check in its own body. Importing it into a gated component protects nothing |
| [2026-react-taint-server-only.md](2026-react-taint-server-only.md) | react.dev taint reference, Next.js `taint` config, Data Security guide | Adopt `server-only` now. Taint is not recommended for production by Next.js itself, and would not have prevented the `profiles` leak, which is a grant rather than a value crossing a boundary |
| [2026-nextjs-csp-nonce-strict-dynamic.md](2026-nextjs-csp-nonce-strict-dynamic.md) | Next.js CSP guide, MDN `script-src` | `strict-dynamic` is what makes Next's chunked loading work under a nonce, and a nonce forces dynamic rendering. Start with the static header set instead, since nothing renders inline script yet |
| [2026-supabase-ssr-server-auth-methods.md](2026-supabase-ssr-server-auth-methods.md) | Supabase Next.js SSR guide, `getClaims` and `getUser` reference | `server.ts` is already correct. The gap is that no middleware refreshes the session. `getClaims` by default, `getUser` only for the live record. Installed versions resolved: ssr 0.12.7, supabase-js 2.116.0 |
| [2026-supabase-column-level-security.md](2026-supabase-column-level-security.md) | Supabase "Column Level Security" and "Row Level Security" (Views) | The mechanism behind the position's section 1. Column scoped grants for the write leak, a `security_invoker` view for the read projection, both landing with the policy change rather than after |

## Federated login (P0-D2)

Filed 2026-09-20 for the login-methods half of P0-D2 (the open-versus-invite-only half is
`legal`'s and `treasurer`'s ground, not researched here). Ranks the four providers the founder
named, plus three quick alternatives, on whether each returns a verified email and what it costs
to operate.

| File | Source | Implies for |
| --- | --- | --- |
| [2022-sudhodanan-prehijacked-accounts.md](2022-sudhodanan-prehijacked-accounts.md) | Sudhodanan and Paverd, USENIX Security 22 | Five pre-hijacking attack variants that apply directly once Dialecta offers password and federated signup on the same email. The academic grounding for the open question in `2026-supabase-google-oauth.md` |
| [2026-google-oauth-identity.md](2026-google-oauth-identity.md) | Google, OpenID Connect and ID token verification docs | `email_verified` is defined and mostly trustworthy; the real caveat is verified-at-creation versus verified-now for non-Google-hosted addresses. Cheapest provider to operate: no review for a basic sign-in scope |
| [2026-meta-facebook-login-identity.md](2026-meta-facebook-login-identity.md) | Meta, Business Verification and Graph API User reference | Meta never calls the email field verified, and it can be absent outright. Business Verification, not App Review, is the real gate, and Dialecta looks small enough to sit under it |
| [2026-x-oauth-identity.md](2026-x-oauth-identity.md) | X Developer Community and X API pricing docs | Email retrieval now works via OAuth 2.0 but carries no stated verification definition. Pay-per-use since February 2026 with no free tier; ranked last of the four on both verification clarity and operational stability |
| [2026-apple-sign-in-with-apple.md](2026-apple-sign-in-with-apple.md) | Apple, App Store Review Guidelines and Sign in with Apple docs | Guideline 4.8 does not reach a website, confirmed from the Guidelines' own preamble. Private relay is adding a third valid domain in 2026 |
| [2026-ietf-oauth-security-bcp.md](2026-ietf-oauth-security-bcp.md) | IETF, RFC 9700 (BCP 240) | Final, not draft, as of January 2025. PKCE mandatory for public clients, exact redirect URI matching, and the condition under which `state` is still required rather than optional |
| [2026-nist-800-63c-federation-privacy.md](2026-nist-800-63c-federation-privacy.md) | NIST SP 800-63-4, Federation and Assertions | Consent, minimization and non-correlation requirements for any relying party accepting a federated identity. `sub`, not email, is the key to store |
| [2026-github-linkedin-discord-identity.md](2026-github-linkedin-discord-identity.md) | GitHub, LinkedIn (Microsoft Learn) and Discord's own issue tracker | Three quick alternatives. GitHub is cleanest on verified email; LinkedIn explicitly disclaims identity verification; Discord's own docs disagree with themselves on the point |

*`live-surface-inventory.md` is written by this agent rather than filed from a source, as
`team/reviewer/knowledge/review-checklist.md` is in its own tree. It is listed here so the index is
the whole folder.*
