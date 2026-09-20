# Connecticut breach notification: deadline, scope, and the WISP safe harbor

**Source:** Connecticut General Assembly, "Connecticut General Statutes Section 36a-701b: Breach of security re computerized data containing personal information", Conn. Gen. Stat. Section 36a-701b, as amended by Public Act 21-59 (effective October 1, 2021) and Public Act 23-16 (effective October 1, 2023), read 2026-09-20. https://codes.findlaw.com/ct/title-36a-the-banking-law-of-connecticut/ct-gen-st-sect-36a-701b/

## Correction, 2026-09-20, same day

Written against an unstated assumption that Dialecta's establishment is Connecticut. Dan lives in
Arizona, since roughly July 2026. See `2023-ct-data-privacy-act.md` for the full correction.

This note survives the correction better than the other two, and the reason is worth keeping. US
state breach notification statutes key on the residency of the affected individual rather than on
where the business sits, so Connecticut's deadline and its definition of personal information still
reach Dialecta for any affected person who lives in Connecticut. What was wrong was the framing,
which treated this as the home state's law and therefore as the whole picture.

The whole picture is every state where an affected person lives, which for a publication with a
public reading list is not knowable in advance. Arizona's own statute now also applies and is unread
by this seat. The practical consequence is that the shortest deadline among the affected states
governs the response, and this note establishes only one of them.

The WISP safe harbor under PA 21-119 is a Connecticut incentive and was being read as available.
Whether an Arizona domiciled entity can rely on it is a question for `legal`, not an assumption to
carry. Record `2026-09-20-security-04`.

## Summary

Conn. Gen. Stat. Section 36a-701b requires any person who conducts business in Connecticut and who owns, licenses, or maintains computerized data that includes personal information to notify affected Connecticut residents after a breach of security. "Personal information" is a first name or initial plus last name combined with one or more of: Social Security number, driver's license or state ID number, a financial account or credit card number combined with any required access code, medical information, health insurance ID number, biometric data, or, since an October 2023 amendment, precise geolocation data. It separately covers a username or email address combined with a password or a security question and its answer.

The notice deadline is exact: "without unreasonable delay but not later than sixty days after the discovery of such breach, unless a shorter time is required under federal law." That sixty-day figure replaced a ninety-day figure when Public Act 21-59 took effect October 1, 2021. The same amendment added a duty to notify the Connecticut Attorney General "not later than the time when notice is provided to the resident," and a duty to offer identity theft prevention and mitigation services "at no cost to such resident for a period of not less than two years." A person already subject to and in compliance with HIPAA and HITECH is deemed compliant with the state notice requirement, provided the Attorney General is still notified. A violation is enforceable as an unfair trade practice under Connecticut law.

Section 36a-701b does not itself require a written information security program. A separate 2021 law, Public Act 21-119, "An Act Incentivizing the Adoption of Cybersecurity Standards for Businesses," gives a safe harbor against punitive damages in a Connecticut tort action over a breach, to a business that created, maintained, and complied with a written cybersecurity program conforming to a recognized framework, such as the NIST Cybersecurity Framework, before the incident. That is an incentive, not a mandate. Massachusetts draws the line differently: 201 CMR 17.00 requires every business holding a Massachusetts resident's personal information to maintain a written information security program, with no size or revenue floor.

## Implies for Dialecta

- Dialecta's Supabase tables holding contributor emails, and any field pairing a name with a password reset flow or security question, fall inside Section 36a-701b's "personal information" definition once a Connecticut resident's data is involved. The statute states no size or revenue floor, so a roughly 14-member platform is not exempt by scale alone.
- An incident response plan needs a documented "discovery" timestamp, because the 60-day clock in subsection (b) runs from discovery, not from the underlying intrusion, and "without unreasonable delay" is a tighter constraint layered on top of the 60 days.
- The Public Act 21-119 safe harbor only protects a company that already had a conforming written program in place before a breach happened. Adopting one now, while the incident count is zero, is the only way it is available later.
- Not legal advice. What would settle it: a Connecticut-licensed attorney confirming which of Dialecta's actual data fields (member email, handle, comment text, AI-generated archetype tag) combine into "personal information" under subsection (a), and whether the 24-month identity-theft-service duty attaches to every breach or only to ones involving Social Security or financial account numbers.

*Filed 2026-09-20*
