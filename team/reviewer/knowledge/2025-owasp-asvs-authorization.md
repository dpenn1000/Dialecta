# OWASP ASVS, the authorization chapter

**Source:** OWASP, Application Security Verification Standard 5.0.0 (May 2025), chapter "V8 Authorization", `5.0/en/0x17-V8-Authorization.md`, read in full 2026-09-19. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x17-V8-Authorization.md

## Summary

The lead called this "the access control chapter", which was its name in ASVS 4.0, where it was
`V4 Access Control` (`4.0/en/0x12-V4-Access-Control.md`). In 5.0.0, the current stable release,
the material was reorganized and renamed to `V8 Authorization`. The lead is good, the chapter
reference in it was stale, and the old path still resolves in the repo for the 4.0 tree.

Four sections, thirteen requirements. The chapter's own framing is least privilege, with two
obligations: document the rules, and enforce them so that consumers reach "only resources
permitted by their defined entitlements".

**V8.1 Authorization Documentation.** 8.1.1 (L1) requires documentation defining "rules for
restricting function-level and data-specific access based on consumer permissions and resource
attributes". 8.1.2 (L2) extends that to "field-level access restrictions (both read and
write)". 8.1.3 and 8.1.4 (L3) cover environmental and contextual attributes such as time of
day, location, IP and device.

**V8.2 General Authorization Design.** Three granularities, and the chapter keeps them
separate on purpose. 8.2.1 (L1) function level. 8.2.2 (L1) data level: "restricted to consumers
with explicit permissions to specific data items to mitigate insecure direct object reference
(IDOR) and broken object level authorization (BOLA)". 8.2.3 (L2) field level: "restricted to
consumers with explicit permissions to specific fields to mitigate broken object property level
authorization (BOPLA)". 8.2.4 (L3) adaptive controls.

**V8.3 Operation Level Authorization.** 8.3.1 (L1): "Verify that the application enforces
authorization rules at a trusted service layer and doesn't rely on controls that an untrusted
consumer could manipulate, such as client-side JavaScript." 8.3.2 (L3) requires authorization
changes to apply immediately or be alerted on. 8.3.3 (L3) is the one with the sharpest edge for
this architecture: "Verify that access to an object is based on the originating subject's (e.g.
consumer's) permissions, not on the permissions of any intermediary or service acting on their
behalf."

**V8.4 Other Authorization Considerations.** 8.4.1 (L2) cross-tenant controls. 8.4.2 (L3)
layered protection for administrative interfaces.

The structural point worth keeping: object level and field level are two different
requirements at two different levels. Passing 8.2.2 tells you nothing about 8.2.3.

## Implies for Dialecta

- BOPLA, requirement 8.2.3, is the name for the gap that produced two of the three blockers in
  the PR 3 review. Postgres RLS is object level by construction, per
  [2026-postgresql-create-policy](2026-postgresql-create-policy.md), so an owner-writes-own-row
  policy satisfies 8.2.2 and says nothing about 8.2.3. `comments.final_tier` and
  `articles.status` are exactly properties the owner may hold but must not set. The remedy is
  in [2026-postgresql-column-privileges](2026-postgresql-column-privileges.md).
- 8.3.1 reads directly onto the Supabase architecture. The anon key plus PostgREST means the
  database is the trusted service layer and the browser reaches it directly. Any rule enforced
  only in a client island, for example a composer that submits `status = 'pending_review'`, is
  a control an untrusted consumer manipulates. The grant and the policy are the enforcement;
  the island is not.
- 8.3.3 is a standing question about the pipeline, not a finding yet. Every classification
  write goes through the service role, which holds `bypassrls` and is by definition "an
  intermediary or service acting on their behalf". That is a normal pattern and it is the
  pattern the requirement is about. The test it implies: for each service-role write, is there
  a line that established the originating user's permission before the privilege was borrowed.
  Nothing in PR 3 exercises this because no pipeline route exists yet. It is the first thing to
  ask of the route that adds one.
- 8.1.1 and 8.1.2 are a documentation requirement and Dialecta does not meet either. No
  document states who may write which column of which table. The row policies are the only
  record, and they are the thing under review, so they cannot also be the specification. A
  field-level authorization table belongs next to `docs/Dialecta_Data_Architecture.md`, and
  writing it is not this agent's to do.
- 8.4.1, cross tenant, is not applicable today. Dialecta has one tenant. Recorded so the
  absence is deliberate rather than an oversight.

*Filed 2026-09-19. Revised the same day after reading the chapter in full; the first version
covered only 8.2.2 and 8.3.1.*
