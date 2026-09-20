# Pre-hijacked accounts, the paper behind the attack class

**Source:** Avinash Sudhodanan and Andrew Paverd, "Pre-hijacked accounts: An Empirical Study of
Security Failures in User Account Creation on the Web," 31st USENIX Security Symposium (USENIX
Security 22), August 2022, read 2026-09-20.
https://www.usenix.org/conference/usenixsecurity22/presentation/sudhodanan (venue record; full
text read via the arXiv preprint, 2205.10174, since the USENIX PDF did not extract to readable
text in this session).

## Summary

Sudhodanan is an independent researcher; Paverd works at the Microsoft Security Response Center,
confirming the task's framing of this as MSRC-affiliated research. The paper's premise: an
attacker who knows only a victim's email address can act before the victim ever creates an
account, so that access is trivial the moment the victim signs up or later recovers the account.
Some variants leave no trace the victim could notice.

The paper names five attack types. The classic-federated merge attack: the attacker
password-signs-up with the victim's email first, the victim later signs up federated with the
same email, and a service that merges the two on email match hands the attacker the merged
account. The unexpired session attack: the attacker's pre-created session survives the victim's
later password reset, because the service does not invalidate other sessions on reset. The trojan
identifier attack: the attacker links their own federated identity to a pre-created account under
the victim's email, so a password reset alone does not remove the attacker's access. The
unexpired email change attack: the attacker starts, but does not finish, changing the account's
email to their own; if the victim later recovers the account, the attacker's pending change link
still works. The non-verifying IdP attack: the attacker registers at an identity provider that
does not itself verify email ownership, then uses that unverified identity to create or merge
into an account at the target service.

Across 75 popular services, at least 35 were vulnerable to one or more of these. The paper's own
stated root cause: failure to verify ownership of the claimed identifier. Its recommendations:
require verification to complete before any further account action; on password reset, sign out
every other session and invalidate every other token for that account, and cancel any pending
email-change action; before merging a password account and a federated identity, confirm the
person currently controls both, not merely that the email strings match.

## Implies for Dialecta

- P0-D2 is exactly the configuration this paper studies: password signup alongside federated
  signup on the same platform. If Dialecta merges a password account and an OAuth identity on a
  shared email, the classic-federated merge and trojan identifier attacks apply directly. Any
  merge logic needs proof of current control of both accounts as its gate.
- Any password reset flow Dialecta builds must invalidate other sessions and tokens and cancel
  pending email changes in the same transaction as the reset, per the paper's own defense list.
- The non-verifying IdP attack is the reason the per-provider verified-email research matters for
  P0-D2: see `2026-google-oauth-identity.md`, `2026-meta-facebook-login-identity.md`,
  `2026-x-oauth-identity.md`, and `2026-apple-sign-in-with-apple.md`. A provider that does not
  guarantee a verified email at signup shifts this exact risk onto Dialecta.
- This paper is the academic grounding for the open question already on record in
  `2026-supabase-google-oauth.md`: whether Supabase's automatic identity linking checks
  `email_verified` before merging. That is a Supabase-behavior question this note does not
  settle; it establishes why the answer matters.

*Filed 2026-09-20*
