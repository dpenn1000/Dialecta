# Supabase MFA and Assurance Levels

**Source:** Supabase, "Multi-Factor Authentication", Supabase Docs (Auth guides), read 2026-09-20. https://supabase.com/docs/guides/auth/auth-mfa

## Summary

Supabase Auth supports two enrollment factor types: an app authenticator (TOTP) and phone messaging. Three API groups cover the feature: an Enrollment API to add or remove factors, a Challenge and Verify API pair to confirm a factor during sign-in, and a List Factors API for building the sign-in UI. Enrollment and authentication are separate flows. A user enrolls a factor once, then a later sign-in with a conventional method (password, magic link, OTP, phone, or social) can be followed by a challenge against that factor.

Once a session has passed a factor challenge, Supabase Auth records the result as an Authenticator Assurance Level (AAL) claim on the access token JWT. AAL1 means "user's identity was verified using a conventional sign-in method such as email+password, magic link, one-time password, phone auth or social sign-in." AAL2 means "user's identity was additionally verified using at least one second factor, such as a TOTP code or One-Time Password code." The claim reads as `aal` inside `auth.jwt()`.

The documentation states the trap directly: "Adding MFA to your app's UI does not in-and-of-itself offer a higher level of security to your users. You also need to enforce the MFA rules in your application's database, APIs, and server-side rendering." Enrollment changes what a user can do at sign-in. It changes nothing about what any existing table or policy permits until something reads the `aal` claim and acts on it.

The enforcement mechanism shown is a restrictive RLS policy, for example `using ((select auth.jwt()->>'aal') = 'aal2')`, with `as restrictive` called out as load-bearing: a restrictive policy narrows access under any other policy on the same table, where a permissive policy would not. Two further patterns cover partial rollouts: gating by `created_at` so only accounts created after a cutover date must present AAL2, and gating by whether the user has a `status = 'verified'` row in `auth.mfa_factors`, so only users who opted into MFA are held to AAL2.

## Implies for Dialecta

- Turning on MFA enrollment in the `mguulnibvzusfvyuowwh` project's Auth settings does nothing to `profiles` or any other table by itself. A policy that requires a second factor has to be written and added separately, as a `restrictive` policy.
- The `profiles` table's current exposure (readable in full by the anon key, including `is_admin` and `subscription_tier`) is a grants and policy gap, not an AAL gap. Fixing it does not require MFA, and adding MFA later does not fix it. They are two separate backlog items.
- If P0-D2 adds an admin-capable action, the pattern that checks `auth.mfa_factors` for a verified factor fits a launch where MFA isn't mandatory for every contributor. An unconditional `aal2` policy would lock out everyone who never enrolled.
- The `aal` claim is the mechanism for any future rule like "an account with `is_admin = true` must be at AAL2 to write." Name it as the mechanism in any advice record on this, rather than describing MFA enforcement in the abstract.

*Filed 2026-09-20*
