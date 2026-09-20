# Sign in with Apple: private relay, and a guideline that stops at the App Store door

**Source:** Apple, "App Store Review Guidelines" (guideline 4.8) and "New domain for Sign in with
Apple and iCloud+ Hide My Email," Apple Developer, read 2026-09-20.
https://developer.apple.com/app-store/review/guidelines/

## Summary

Guideline 4.8 requires apps that use a third-party or social login, "such as Facebook Login,
Google Sign-In, Log in with X, Sign In with LinkedIn, Login with Amazon, or WeChat Login," to set
up a primary account, to also offer an equivalent login that limits data to name and email, allows
a private email, and does not track app activity for advertising without consent. Sign in with
Apple satisfies that bar; the guideline itself does not name it as the only option.

The scope question the task asks is answered by the Guidelines' own preamble, not by inference:
"For everything else there is always the open Internet... we provide Safari for a great web
experience too." The App Store Review Guidelines, 4.8 included, govern apps submitted to App
Store Connect. A website is not such a submission, so 4.8 does not reach a browser-based sign-up
flow; the requirement to offer Sign in with Apple binds an App Store app, not a website.

Private relay mechanics, from Apple's own news post: Apple is consolidating the forwarding domain
used by both Sign in with Apple and iCloud+ Hide My Email onto one shared domain,
`private.icloud.com`, rolling out later in 2026 per an update dated August 24, 2026 and read this
session. Addresses already issued on the legacy domains, `privaterelay.appleid.com` for Sign in
with Apple and `icloud.com` for Hide My Email, keep forwarding without interruption. Apple's own
instruction to developers is to accept all three domains in validation logic and allowlists.

On the identity token itself, multiple independent developer reports describe `email_verified`
and `is_private_email` returned as JSON strings ("true"/"false") in earlier token formats, with
more recent samples showing a true boolean. Apple's DocC-based developer pages returned only a
page title to this session's fetch tool, so the current, authoritative behavior is not confirmed
here; parse both forms defensively until it is. Apple Developer Program enrollment costs $99 per
year with standard identity verification; this session found no evidence of an App-Review-style
content or business gate specific to turning on Sign in with Apple for a website, unlike Google's
app verification or Meta's Business Verification.

## Implies for Dialecta

- Dialecta is a website. Guideline 4.8 does not force Sign in with Apple onto P0-D2 even if
  Google, Facebook, or X sign-in is offered; any case for including it rests on reach or trust,
  not on a review requirement.
- If added, parse `email_verified` defensively (string or boolean) and store the relay domain
  rather than hardcoding `icloud.com`, since Apple is actively adding a third valid domain this
  year.
- Private relay forwards mail rather than exposing a real address; any Dialecta flow that emails a
  contributor outside the platform needs to keep working through a relay address, a constraint the
  other three providers do not impose.
- Re-verify the `email_verified` data type against Apple's own claims reference before writing a
  parser for it; this session's finding on that point is secondary-sourced only.

*Filed 2026-09-20*
