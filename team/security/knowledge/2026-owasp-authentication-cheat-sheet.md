# OWASP Authentication Cheat Sheet

**Source:** OWASP, "Authentication Cheat Sheet", OWASP Cheat Sheet Series, read 2026-09-20. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

## Summary

The cheat sheet sets password length thresholds by whether MFA is present: "passwords shorter than 8 characters are considered to be weak" when MFA is enabled, and "passwords shorter than 15 characters are considered to be weak" when it is not, with a permitted maximum of "at least 64 characters to allow passphrases." On composition, it rejects mandated character classes: "There should be no requirement for upper or lower case or numbers or special characters," and says to allow all characters including unicode and whitespace, and never to silently truncate a password that exceeds the maximum. On rotation, it points to the same NIST position covered elsewhere this sprint: "Avoid requiring periodic password changes; instead, encourage users to pick strong passwords and enable Multifactor Authentication," reserving forced rotation for the moment "a password leak occurs, at the time of compromise identification."

MFA gets its own justification, citing a Microsoft analysis that it "would have stopped 99.9% of account compromises," recommended "wherever possible."

On sessions and credentials, passwords should be transmitted "exclusively...over TLS or other strong transport," and re-authentication should be required both to change "sensitive account information such as the user's password or email address" and after "high-risk activity such as account recovery, password resets, or suspicious behavior patterns."

For account lockout, the sheet lists four design elements: a failure threshold, an observation window, a lockout duration, and a cap on the number of lockouts before a permanent one. It recommends exponential backoff on the duration, "starts as a very short period (e.g., one second), but doubles after each failed login attempt," and it specifically says to key the failure counter to the account, not the IP address, so an attacker cannot mass-lock other users by spraying one account's password from many addresses. CAPTCHA is recommended as a defense-in-depth layer "after a small number of failed login attempts." Error messages should stay generic regardless of the actual failure reason, with "Login failed; Invalid user ID or password" given as the example, to block enumeration and timing attacks.

## Implies for Dialecta

- There is no login yet, so this is a pre-build checklist. Whatever P0-D2 ships with a password option should default to a 15-character minimum, drop to 8 only where MFA is also required on that account, cap at 64, and carry no composition rule.
- Any endpoint that accepts a login or password-reset attempt needs an account-keyed failure counter with exponential backoff and a single generic failure message before it ships. None of the endpoints read so far (`profile/[id].js`, `classify.js`, `comment.js`) are that endpoint yet, but whichever one becomes it inherits this requirement.
- The 99.9% Microsoft figure cited here is the reference to reach for if this agent argues MFA belongs in the P0-D2 decision itself rather than as a later add-on.
- Re-authentication before an email or password change, and after account recovery, is a requirement to carry into whatever endpoint eventually lets a contributor edit their own `profiles` row.

*Filed 2026-09-20*
