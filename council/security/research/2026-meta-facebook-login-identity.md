# Facebook Login: an unverified email field behind a real Business Verification gate

**Source:** Meta, "Business Verification," App Development with Meta, and the Graph API "User"
node reference, Meta for Developers, read 2026-09-20.
https://developers.facebook.com/docs/development/release/business-verification/

## Summary

The Graph API's own description of the `email` field on the User node: "The User's primary email
address listed on their profile. This field will not be returned if no valid email address is
available." Meta does not use the word verified anywhere in that description. The field is
silently omitted, not an error, when the person has no email on file or declined the permission,
so a missing email is a real code path for Dialecta to handle, not an edge case.

This session could not get a direct read of Meta's own Permissions Reference page
(`developers.facebook.com/docs/permissions/`), which returned a server error on every fetch
attempt. Multiple secondary developer sources describe `email`, alongside `public_profile`, as one
of a small set of default permissions usable without App Review, consistent with Meta's
documented advanced-access model, but that fact is not confirmed here against Meta's own current
text and should be re-checked before it is relied on.

Business Verification is the gate this session did confirm directly. Required since February 1,
2023, for an app requesting advanced-access permissions or letting other Businesses access their
own data through it. The stated consequence of not completing it: "app users from other Businesses
will be unable to grant these apps permissions and all features will be inactive." An app used
solely by people who already hold a role on that app is exempt. No annual or periodic
re-verification requirement appears on the page read.

Read together: a single-tenant integration serving only Dialecta's own membership, not brokering
access to other organizations' data, looks like it can stay under the Business Verification bar
on the facts confirmed this session, while still needing the Permissions Reference re-read before
that is treated as settled.

## Implies for Dialecta

- Code the missing-email path as first-class for a Facebook sign-in; Meta's own field description
  guarantees nothing.
- Meta never calls the email field verified. Treat a Facebook-sourced address as unverified for
  Dialecta's own purposes unless confirmed some other way, a more cautious posture than Google's
  explicit `email_verified` claim.
- Before shipping Facebook as a P0-D2 option, get a working read of the current Permissions
  Reference (blocked this session) to confirm `email` is still a no-review default permission.
- Business Verification, not App Review, is the heavier gate for Dialecta's shape: a single
  organization's own users. It appears avoidable at 14 members; revisit if Dialecta ever serves
  another organization's accounts through it.

*Filed 2026-09-20*
