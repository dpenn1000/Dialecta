# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

## The seven seeded leads, after the 2026-09-20 sprint

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | The deployed `dpenn1000/dialecta-api`: every endpoint, its method branches, and what each one writes | Half done and blocked on access rather than on effort. The route list exists in `live-surface-inventory.md`, 38 routes against the 11 files the named repository holds, and the provenance is in `2026-vercel-deployed-api-provenance.md`. Method branches and writes are unread for 30 of them, because the Vercel file reader truncates at roughly two thousand characters and these handlers run to tens of kilobytes. Needs the source pulled with a Vercel token. Tracked as record 2026-09-20-security-01 |
| filed | Postgres default grants to `anon` and `authenticated` in the Supabase `public` schema | Answered by measurement, not by doc. All 30 tables grant full CRUD to both roles, so blocker B2 holds rather than dropping. Filed as `2026-live-grant-and-policy-surface.md`, which also carries the `information_schema` trap that made the first reading exactly inverted |
| filed | `SECURITY DEFINER` functions and `FORCE ROW LEVEL SECURITY` | Enumerated in the same note. `FORCE` is off on all 30 tables, and there is exactly one definer function, `check_handle_not_reserved`, owned by `postgres`, search path pinned, executable by neither public role. A clean result rather than a finding, and a pair to re-measure on every migration |
| todo | Stored XSS and HTML sanitisation at write time against read time | Untouched this sprint. `team/reviewer/knowledge/2026-cure53-dompurify.md` covers the remedy from the reviewer's side, so read that before duplicating it. What is still wanted is the read time half reasoned out in a filed note rather than in a commit message |
| filed | Rate limiting on unauthenticated endpoints, and what Vercel gives for free | Filed across four notes: `2026-vercel-firewall-and-spend-management.md`, `2026-anthropic-rate-and-spend-limits.md`, `2025-owasp-llm10-unbounded-consumption.md` and `2021-kelly-denial-of-wallet.md`. The load bearing fact is that Hobby has no Spend Management at any price |
| filed | Secret handling across this estate | Filed as `2026-dialecta-secret-and-artifact-hygiene.md`. Nothing credential shaped is in either repository's history. The ignore block now covers the typo and the correct spelling both, and still misses `secrets.json`, `service-key.txt` and `creds.yaml`, which is why the control is content scanning rather than a filename list |
| filed | Supabase Storage bucket policies, for `article-media` | Lead was wrong about the live project and the correction is the result. `article-media` does not exist; it is created by a migration that has never been applied. The live bucket is `feedback-screenshots`, public read, currently empty. Filed as `2026-live-storage-surface.md` |

## Opened by the sprint

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | Ghost's own treatment of `{{@member.uuid}}`: is it a secret by Ghost's design, is it rotatable, and what else exposes it | This settles `2026-09-20-security-02` from the other end. If Ghost treats the member uuid as a capability rather than an identifier, then publishing it in `profiles` is the whole finding and the handler barely matters |
| todo | The two deployed subtrees the file listing truncated at depth, `api/comment/[id]/` and `api/admin/feedback/` | Both contain at least one route that is not in the inventory. An unenumerated endpoint is the exact shape of the thing that went unnoticed from April to September |
| todo | Vercel project environment variables on Preview and Development, not only Production | The MCP connection in use returns 403 on `projectEnvVars`, so this is unread. A preview deployment reading a production `SUPABASE_SERVICE_KEY` would put a bypassrls credential behind a URL with weaker protection than production |
| todo | NIST SP 800-63Bsup1, "Incorporating Syncable Authenticators into NIST SP 800-63B" | Confirmed to exist by search, not read. `2026-supabase-passkeys.md` has a real gap, the AAL level of a passkey sign in, and this document may close it. Worth a pull before any passkey decision |
| todo | Whether Supabase Auth checks Google's `email_verified` claim before automatic identity linking | Neither Supabase doc states it, which is why `2026-supabase-google-oauth.md` records it as open. This is a test rather than a lookup: a Workspace alias with an unverified email against a non production project. Do not run it against `mguulnibvzusfvyuowwh` |
| filed | The pinned `@supabase/supabase-js` version in `apps/web` | Resolved 2026-09-20 from `npm ls` and `package-lock.json`: `@supabase/ssr` 0.12.7 and `@supabase/supabase-js` 2.116.0, one deduped copy. The `^2.0.0` floor in the manifest understates it by a hundred minor versions, so the manifest is not the place to read this. 2.116.0 clears the 2.105.0 passkey minimum, which makes passkeys a live P0-D2 option. Recorded in `2026-supabase-ssr-server-auth-methods.md`. The getClaims minimum is still unstated by any source read so far and is carried as a new lead below |
| todo | The minimum `@supabase/supabase-js` version for getClaims's local verification path | The installed version is known and the required version is not. Recency is not evidence of sufficiency. Either find the release note that states the minimum, or call getClaims and observe whether it verifies locally or round trips to the Auth server |
| todo | Conn. Gen. Stat. 42-515, the current sensitive data definition, in primary text | `2023-ct-data-privacy-act.md` reads the applicability section directly but takes the category list from commentary. Under the amended statute any sensitive data processing triggers the CTDPA with no consumer floor, so whether a Thinking Fingerprint is sensitive data decides whether the act applies to Dialecta at 14 members |
| todo | GDPR Article 9, special category data, full text | A fingerprint that encodes political or philosophical opinion may sit under Article 9 rather than only Article 22, which is a stricter regime. `2016-gdpr-automated-decision-making.md` stops short of this |
| todo | The chosen payment processor's own SAQ eligibility documentation, for the specific integration mode | `2022-pcissc-saq-a-eligibility.md` establishes that hosted checkout keeps Dialecta in SAQ A. Which is moot until a processor is picked, and decisive the day one is |
| todo | NIST AI 100-2e2025, the exact taxonomy text for direct against indirect prompt injection | Metadata confirmed, PDF would not extract through two fetch attempts. Willison's post covers the same ground and is filed, so this is only worth a second pass if NIST's own wording is needed as a second citation |
| todo | Vercel's "Mitigating Denial of Wallet risks with Vercel" post, surfaced under the DDoS mitigation doc, URL not captured | Vercel naming the attack by the same term OWASP and the Kelly paper use suggests a fourth corroborating source, and it may describe a Vercel specific mitigation the filed note does not carry |
| todo | Betterleaks, the gitleaks successor by the same author | Too new to recommend over gitleaks today. Worth a follow up in a few months if it stabilises, since `2026-gitleaks-secret-scanning.md` records gitleaks itself as feature complete and receiving patches only |

## Corrections made while reading

| Seeded or assumed | Correction |
| --- | --- |
| `article-media` is the bucket to reason about | It does not exist on the live project. `feedback-screenshots` does, and it is public read |
| Supabase has no native passkey support | It does, as a beta dated 2026-05-28 behind an opt-in flag. The assumption predates it |
| The OWASP LLM Top 10 lives at `OWASP/www-project-top-10-for-large-language-model-applications` | That repository is now a legacy archive. The current list is `GenAI-Security-Project/GenAI-LLM-Top10`, 2026 edition |
| The CTDPA keeps its 25,000 consumer test alongside the new triggers, per several published law firm summaries | The amended statutory text deletes that test and replaces it. Flagged inline in `2023-ct-data-privacy-act.md`, which reads the primary text |
| `information_schema.role_table_grants` reports a role's grants | Only for a role the session holds. It reported no grants on any table, which was exactly backwards |
