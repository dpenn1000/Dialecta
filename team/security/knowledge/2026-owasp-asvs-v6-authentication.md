# OWASP ASVS V6 Authentication

**Source:** OWASP, "V6 Authentication", Application Security Verification Standard (ASVS) 5.0.0, read 2026-09-20. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md

## Summary

ASVS 5.0.0 is the current stable release, published May 2025, with the project's own tracking showing the next planned release as a 5.0.1 patch rather than a new major. The V6 chapter states its lineage up front: "many of the requirements in this chapter are based on the second section of the standard (known as NIST SP 800-63B, Digital Identity Guidelines, Authentication and Lifecycle Management)," scoped to common threats rather than full coverage of that document.

Requirements are numbered and leveled, L1 through L3, rising in rigor. On password length, 6.2.1 (L1) requires "user set passwords are at least 8 characters in length although a minimum of 15 characters is strongly recommended," and 6.2.9 (L2) requires "passwords of at least 64 characters are permitted." On composition, 6.2.5 (L1) requires "passwords of any composition can be used, without rules limiting the type of characters permitted," with "no requirement for a minimum number of upper or lower case characters, numbers, or special characters." On rotation, 6.2.10 (L2) requires "a user's password stays valid until it is discovered to be compromised or the user rotates it," and "the application must not require periodic credential rotation." On multi-factor, 6.3.3 (L2) requires "either a multi-factor authentication mechanism or a combination of single-factor authentication mechanisms"; the L3 version of the same requirement raises the bar to a hardware-based factor giving "compromise and impersonation resistance against phishing attacks," run inside "an attested and trusted execution environment (TEE)."

These requirement numbers land on the same substance as the NIST SHALL/SHALL NOT language and the OWASP cheat sheet read elsewhere this sprint. ASVS adds the level structure and the requirement IDs on top, which is what makes it usable as a checklist.

## Implies for Dialecta

- Requirement IDs 6.2.1, 6.2.5, 6.2.9, 6.2.10, and 6.3.3 are the citation to use in an advice record about login design, in place of re-explaining the same rules in prose each time.
- L1 (6.2.1, 6.2.5) is the floor for any surface holding contributor email and writing, which Dialecta already is. Treat it as non-negotiable for whatever P0-D2 ships.
- L2 (6.2.9, 6.2.10, 6.3.3) costs nothing extra at build time: a 64-character cap, no rotation job, MFA offered rather than mandatory. It matches what the cheat sheet note already recommends, so build to L2 from the start rather than L1.
- L3's hardware-backed, TEE-attested factor requirement is out of scope. Nothing in Dialecta's current or planned surface calls for it; note that explicitly so a future review doesn't over-spec toward it.

*Filed 2026-09-20*
