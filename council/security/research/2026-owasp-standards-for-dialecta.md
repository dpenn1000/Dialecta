# OWASP ASVS, Cheat Sheet Series, and the LLM Top 10

**Source:** OWASP, "OWASP/ASVS", Application Security Verification Standard, version 5.0.0, read 2026-09-20. https://github.com/OWASP/ASVS

## Summary

Three separate OWASP repositories, each confirmed live and each at a different point in its own lifecycle.

ASVS (3.6k stars) is a checklist of testable security requirements organized by chapter (authentication, session management, access control, and so on), each requirement tagged to a verification level, L1 through L3. Version 5.0.0 shipped May 2025 at Global AppSec EU Barcelona; `master` is the working "bleeding edge" toward a 5.0.1 patch. `reviewer`'s own note, `team/reviewer/knowledge/2025-owasp-asvs-authorization.md`, already covers the V8 Authorization chapter (renamed from V4 in the 4.0 line) in depth and should stay the reference for that chapter rather than being re-derived here.

CheatSheetSeries (33.2k stars) is the practitioner's companion to ASVS: short, topic-specific pages rather than a checklist. Directly relevant ones exist and were confirmed inside the repo's `cheatsheets/` folder: `REST_Security_Cheat_Sheet.md`, `Authorization_Cheat_Sheet.md`, `Access_Control_Cheat_Sheet.md`, `Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.md`, `Mass_Assignment_Cheat_Sheet.md`, and `Nodejs_Security_Cheat_Sheet.md`.

The LLM Top 10 is the one with a live succession worth naming precisely. `OWASP/www-project-top-10-for-large-language-model-applications` now describes itself as a legacy entry point and historical archive. The current list, OWASP GenAI LLM Top 10 2026, published August 4, 2026, lives at `GenAI-Security-Project/GenAI-LLM-Top10` (114 stars, 46 forks, still an OWASP Flagship project under the newer GenAI Security Project umbrella). Citing the old repo path would point at an archive, not the current list.

None of these are tooling. They are reading: no CI job runs against them, and none apply to Dialecta's own code the way a linter would.

## Implies for Dialecta

- `Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.md` and `Mass_Assignment_Cheat_Sheet.md` name exactly two shapes already found live: an ID-keyed endpoint with no ownership check (the `/api/profile/<id>` finding recorded in `team/security/practices.md`), and a write endpoint that accepts caller-supplied fields it should not (`display_name` landing in an insert nobody asked for).
- The LLM Top 10's current entries, including prompt injection, insecure output handling, and excessive agency, bear on `api/classify.js` and `api/comment.js`, both of which take untrusted user text into a Claude call and then act on the result: a tier assignment that changes what other people see. This is the standard to read before, not after, that pipeline gets its first real audit, since `security`'s own brief already flags `comment.js` as spending money on unvetted input.
- ASVS 8.1.1 and 8.1.2, documented in the reviewer note above, ask for a written statement of who may write which field of which table. Dialecta has no such document; the closest thing is the RLS policies themselves, which is what ASVS 8.1 explicitly says a policy alone cannot satisfy.
- File any future OWASP-sourced note under one of these three repos rather than starting a fourth, unless the topic is a clearly different project. The GenAI Security Project's own site, `genai.owasp.org`, is a separate thing from the LLM Top 10 repo and would deserve its own citation if read directly.

*Filed 2026-09-20*
