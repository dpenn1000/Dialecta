# Arizona breach notification: A.R.S. Section 18-552, and the AG's own summary of it

**Source:** Arizona Revised Statutes Section 18-552 ("Notification of security system breaches;
requirements; enforcement; confidentiality; civil penalty; preemption; exceptions"), primary
enrolled text, Arizona State Legislature, read 2026-09-20.
https://www.azleg.gov/ars/18/00552.htm. Cross-checked against the Arizona Attorney General's own
"Data Breach FAQ", read the same day. https://www.azag.gov/consumer/data-breach/faq. The statute
was renumbered from Section 18-545 in 2018; both citations appear in secondary sources and refer
to the same current text.

## Summary

A person that conducts business in Arizona and that owns, maintains, or licenses unencrypted and
unredacted computerized personal information must, on determining a breach occurred, notify
affected individuals. The deadline is exact: within forty-five days after the determination,
by written notice, by email if an email address is on file, or by telephone if telephonic contact
is made. "Personal information" is defined at the cross-referenced Section 18-551(7) as a name
combined with a Social Security number, driver's license or state ID number, financial account or
card number with an access code, or specified categories of medical, health-insurance, or
biometric data; encrypted or redacted data is excluded from the definition entirely, which is a
safe harbor Connecticut's statute does not carry in the same form.

Above one thousand affected individuals, three further notices are required at the same time as
the individual notices: the three largest nationwide consumer reporting agencies, the Arizona
Attorney General, and the director of the Arizona Department of Homeland Security. Below that
count, none of the three is required. This is a materially different shape from Connecticut's
Section 36a-701b, which requires Attorney General notice "at the same time" as resident notice
with no count threshold at all
(`council/security/research/2021-ct-breach-notification.md`).

Enforcement is exclusive to the Attorney General, proceeding under Title 44, Chapter 10, Article 7
(the Arizona Consumer Fraud Act's enforcement machinery). There is no private right of action.
Civil penalties run to the lesser of ten thousand dollars per affected individual or the affected
individuals' actual economic loss, capped at five hundred thousand dollars per breach or series of
related breaches. That cap is a hard ceiling with no equivalent in Connecticut's per-violation
CUTPA structure, which has no stated aggregate maximum
(`council/legal/research/2026-ctag-ctdpa-enforcement.md`).

Two further provisions matter for a small operator. Subsection (I) deems a covered entity
compliant if it is already subject to and follows a federal breach-notification scheme (HIPAA is
the example both states use). Subsection (J) removes the notification duty entirely where the
entity reasonably determines the breach will not result in substantial economic loss to affected
individuals, a judgment call the statute does not require anyone else to bless in advance.

## Implies for Dialecta

- Dialecta's establishment moving to Arizona means Dialecta is now squarely "a person that
  conducts business in Arizona" for this statute's own purposes, independent of anything this
  tree has said about Connecticut. That is establishment-test reach, the plainest kind: it follows
  Dan, and it now attaches here directly rather than by inheritance from a research note about a
  different state.
- At fourteen members, Dialecta sits far under the thousand-affected threshold that triggers AG
  and credit-bureau notice. A breach today would mean notifying the fourteen and nobody else,
  where a comparable Connecticut-only reading would still require AG notice regardless of count.
  That is a real, concrete difference the relocation makes, not a wash.
- The forty-five day clock is fifteen days shorter than Connecticut's sixty. If Dialecta is ever
  read as owing notice under both states' statutes for the same incident, because it has affected
  individuals resident in each, the shorter deadline governs the response as a practical matter,
  consistent with the general rule that the strictest applicable deadline controls.
- The encrypted-data carve-out is the cheapest control on this file. Storing password hashes and
  encrypting anything that would otherwise qualify as personal information is not merely good
  practice here; it is the difference between owing a forty-five day notice duty and owing nothing
  under this statute at all.
- Not legal advice. What would settle it: whether Supabase's own encryption at rest is the kind of
  encryption Section 18-551(7) contemplates for the safe harbor, which is a question about a
  vendor's specific implementation rather than about the statute.

*Filed 2026-09-20, as part of the jurisdiction correction following record `2026-09-20-security-04`.
Companion note: `council/security/research/2021-ct-breach-notification.md`, corrected the same day,
which now covers the residency-of-the-affected-individual half and points here for the
establishment half.*
