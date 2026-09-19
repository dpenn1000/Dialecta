# OWASP ASVS, the authorization chapter

**Source:** OWASP, Application Security Verification Standard 5.0.0 (May 2025), chapter "V8 Authorization", `5.0/en/0x17-V8-Authorization.md`, read 2026-09-19. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x17-V8-Authorization.md

## Summary

The lead called this "the access control chapter", which was its name in ASVS 4.0, where it was `V4 Access Control` (`4.0/en/0x12-V4-Access-Control.md`). In 5.0.0, the current stable release, the material was reorganized and renamed to `V8 Authorization`. The lead is good, the chapter reference in it was stale, and the old path still resolves in the repo for the 4.0 tree.

The chapter separates authorization into three granularities: function level, data level, and field level. Two requirements carry most of the weight for this repo.

Data level, section V8.2 General Authorization Design, requirement 8.2.2: "Verify that the application ensures that data-specific access is restricted to consumers with explicit permissions to specific data items to mitigate insecure direct object reference (IDOR) and broken object level authorization (BOLA)."

Trusted layer, section V8.3 Operation Level Authorization, requirement 8.3.1: "Verify that the application enforces authorization rules at a trusted service layer and doesn't rely on controls that an untrusted consumer could manipulate, such as client-side JavaScript."

The field-level requirement is the one with no obvious equivalent in a row-level scheme. It names broken object property level authorization, BOPLA: the case where the caller is allowed to touch the object but not every property of it.

## Implies for Dialecta

- BOPLA is the name for the gap that produced two of the three blockers in the PR 3 review. Postgres RLS is object level by construction, per [2026-postgresql-create-policy](2026-postgresql-create-policy.md), so an owner-writes-own-row policy satisfies 8.2.2 and says nothing about 8.3.1 or the field level. `comments.final_tier` and `articles.status` are exactly properties the owner may hold but must not set.
- Check 2 of the mandate should carry a field-level question as well as a table-level one. A new table with RLS enabled and correct owner policies can still be fully open at the property level, and that is invisible in a migration diff unless the reviewer asks which columns the owner may write.
- 8.3.1 reads directly onto the Supabase architecture. The anon key plus PostgREST means the database is the trusted service layer and the browser reaches it directly. Any rule enforced only in a client island, for example a composer that submits `status = 'pending_review'`, is a control an untrusted consumer manipulates. The grant and the policy are the enforcement; the island is not.
- Remaining gap in this note: the chapter's full requirement list at levels 1 to 3 was not read, only the two requirements above. A later sprint should read V8 end to end and turn the level 1 requirements into rows on the review checklist in [review-checklist](review-checklist.md).

*Filed 2026-09-19*
