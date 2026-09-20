# NIST 800-63C: what a relying party owes a federated identity

**Source:** NIST, "Digital Identity Guidelines: Federation and Assertions," SP 800-63-4, read
2026-09-20. https://pages.nist.gov/800-63-4/sp800-63c/Federation

## Summary

The version this note cites matters. SP 800-63-3's Volume C (2017) is the document most existing
write-ups still point to, but its own page now states plainly: "This revision of NIST SP 800-63
has been superseded by NIST SP 800-63-4 as of August 1, 2025." The current text lives at
`pages.nist.gov/800-63-4`, and that is what this note reads.

On consent: a subscriber "SHALL be prompted prior to the release of attributes using a runtime
decision at the IdP" (Section 4.6.1.3), and the identity provider "SHALL NOT make consent for the
additional processing a condition of the identity service" (Section 3.10.1). A person can decline
extra data sharing without losing the ability to sign in at all; consent cannot be bundled with
authentication itself.

On minimization: the IdP and relying party "SHALL exchange only the minimum data necessary to
achieve the function of the system" (Section 3.10), and where a derived fact is enough, the
relying party "SHOULD request derived attribute values rather than full attribute values"
(Section 3.12.2), the standard's own example being an age-over-18 boolean requested in place of a
full birth date.

On tracking: to stop a subscriber being correlated across unrelated relying parties, "the IdP
SHALL generate a different federated identifier for each RP" (Section 3.4.1), a Pairwise
Pseudonymous Identifier, so two relying parties reading the same identity provider cannot collude
on a shared subject identifier.

This is a guideline written for US federal systems, not a law, and it does not bind Dialecta. It
is read here as the technical community's normative reference for what a well-behaved relying
party requests and stores from a federated sign-in, a question distinct from what GDPR or a state
privacy act requires, which is the legal seat's ground.

## Implies for Dialecta

- Scope minimization for P0-D2: request only `openid email profile`, or each provider's equivalent
  minimal scope, from whichever of Google, Meta, X, or Apple is chosen, never a broader scope kept
  in reserve.
- Consent belongs as an explicit step in Dialecta's own sign-up screen. A provider's consent
  screen on its own side does not stand in for whatever Dialecta itself later does with the data
  it receives, particularly if profile data ever feeds something beyond authentication.
- Key federated identity on the provider's `sub`, never on the email address; this matches both
  NIST's model here and Google's own explicit instruction in `2026-google-oauth-identity.md`.
- Non-correlation is a property of the identity provider's own design, not a Dialecta control. It
  is carried here as the reason a provider-issued `sub` is stable and safe to store as a key, not
  as an action item.

*Filed 2026-09-20*
