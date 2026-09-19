# Rate limits

**Source:** Supabase, Auth documentation: "Rate limits", "Passwordless email logins", and "Send emails with custom SMTP". Read 19 September 2026. https://supabase.com/docs/guides/auth/auth-smtp

## Summary

Three constraints in Supabase's own documentation bear directly on P0-4 and P0-D2, and they are facts rather than preferences.

First, the built-in email provider is capped at "2 emails per hour", and the docs say that limit is configurable only by moving to custom SMTP or the Send Email hook. Second, the bundled SMTP server "imposes a few important restrictions and is not meant for production use". Third, and most decisive: "Unless you configure a custom SMTP server for your project, Supabase Auth will refuse to deliver messages to addresses that are not part of the project's team."

On the method itself: a magic link is one-time use and works only with an email address. Email one-time passwords share an implementation with magic links and differ only in the template, so moving between the two is a template change rather than a rebuild.

## Implies for Dialecta

- P0-4 is blocked in a way the backlog does not record. Magic link sign-up cannot work at cutover on the default provider, because it will only deliver to organisation team members, at 2 emails per hour. Custom SMTP is a prerequisite, not a later improvement.
- P0-D2: the login method choice quietly buys an email vendor, a sending domain and its reputation, and a recurring cost. That belongs in front of the treasurer before it is decided, not after.
- Google OAuth carries none of this. It completes in the browser with no inbox round trip and no deliverability surface, which for the 14 legacy members being mapped in P0-6 is the path with the fewest ways to fail.
- Email OTP is the cheap hedge and the docs make it nearly free to add: same implementation, six digits a person can carry from a phone to a laptop, and no dead session when the link opens in the wrong browser.
- A magic link being one-time use is also the reason link prefetching by corporate mail scanners breaks it. Any member on a work address is exposed to that.

*Filed 2026-09-19*
