# Google Sign-In: verified email and the cost of app verification

**Source:** Google, "OpenID Connect | Sign in with Google" and "Verify the Google ID token on
your server side," Google for Developers, read 2026-09-20.
https://developers.google.com/identity/openid-connect/openid-connect

## Summary

The `email_verified` claim in a Google ID token is defined plainly: "True if the user's email
address has been verified; otherwise false." Google's own token-verification guide goes further,
naming when Google itself is "authoritative" for an address: an `@gmail.com` address is always a
Gmail account; `email_verified` true with `hd` set is a Workspace account; anything else, no
Gmail suffix and no `hd`, means Google is not authoritative, and the guide recommends a password
or other challenge to verify that user. For that third case the guide adds the load-bearing
caveat: "email_verified can also be true as Google initially verified the user when the Google
account was created, however ownership of the third party email account may have since changed."
Verified-at-creation is not the same claim as verified-now for a non-Google-hosted address.

This session looked for a Google statement specifically about Workspace administrators minting
tokens for arbitrary or unverified addresses inside their own domain and did not find one in the
pages read. What Google does state, on its OAuth app-verification pages, is a different and
narrower point: a "Verified" status on a third-party app "does not override the Google Workspace
administrator's settings," meaning admin control over which apps a domain's users may authorize is
separate from the email-trust question above.

On identifiers, Google's guidance is explicit: use `sub`, never `email`, as the unique key,
because a Google Account "can have multiple email addresses at different points in time."

Operationally, Google is the cheapest of the four to stand up. Its own app-verification process
(`production-readiness` docs) triggers review for sensitive or restricted API scopes. A
testing-phase app is capped at 100 test users, and a published-but-unverified app is capped at 100
users total, but apps requesting only basic identity scopes, openid, email, profile, the exact set
a sign-in integration needs, bypass that cap. No annual re-verification requirement or paid
security-assessment step turned up for a bare sign-in scope; those costs attach to sensitive and
restricted scopes Dialecta has no reason to request.

## Implies for Dialecta

- Google is the low-cost, low-friction option among the four for P0-D2: no App Review, no
  business verification, no user cap for a sign-in-only scope request.
- Key any Dialecta identity table on the provider's `sub`, not on email, for every federated
  provider, following Google's own instruction.
- The verified-at-creation caveat mainly bears on a contributor who links a personal, non-Gmail
  address; treat an email match as a hint for account linking, never as sole proof of control, per
  `2022-sudhodanan-prehijacked-accounts.md`.
- This narrows but does not close the open question already on record in
  `2026-supabase-google-oauth.md`: what Google's own docs mean by `email_verified` is now settled;
  whether Supabase checks it before automatic linking is a separate, still-open test.

*Filed 2026-09-20*
