# California's automatic renewal law after AB 2863: consent to renewal is its own step

**Source:** Cal. Bus. & Prof. Code Sections 17600 to 17606 as amended by AB 2863 (2024), read
2026-09-20 through a Kilpatrick Townsend client alert, a named firm, rather than the code text.
The bill itself is at leginfo. The no-private-right-of-action holding is Mayron v. Google LLC, 54
Cal. App. 5th 566 (2020), read through Seyfarth Shaw and Wilson Sonsini summaries.
https://ktslaw.com/en/insights/alert/2024/10/california-latest-automatic-renewal-law-amendments-take-effect-in-july-2025
https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2863
https://caselaw.findlaw.com/court/ca-court-of-appeal/2084851.html

## Summary

**In force 2025-07-01**, for contracts entered into on or after that date and for any contract
amended or extended on or after it. The amendment date matters: a change to an existing member's
terms pulls that contract into the new regime.

What AB 2863 added, as the alert states it:

- **Express affirmative consent to the automatic renewal term itself**, rather than consent to the
  agreement as a whole. The alert reads this as requiring stand-alone consent to the renewal
  provision, so it cannot be bundled into general acceptance of terms of service.
- **Consent verification records kept for three years, or one year after termination, whichever is
  longer.** The format is unspecified.
- **An annual renewal reminder**, in the medium that produced the sign-up or one the member is
  accustomed to, naming the service, the amount, the frequency and how to cancel.
- **Notice of a fee change no less than seven and no more than thirty days before it takes
  effect**, with cancellation instructions, in a form the consumer can retain.
- **A click-to-cancel control**, prominently displayed, for anything enrolled online.

Free trials are now in scope, and misrepresentations and omissions about the transaction are
actionable.

**Enforcement.** Mayron v. Google holds there is no private right of action under the ARL itself.
Consumers reach it through the Unfair Competition Law, Section 17200, where standing requires a
causal link between the violation and the payment rather than the bare fact of a violation. The
unconditional-gift provision creates a right to keep what was received; the California Court of
Appeal has rejected the theory that it alone confers standing.

## Implies for Dialecta

- **The Pact cannot carry the renewal consent, and this is the sharpest version of that finding.**
  California asks for a separate, express act consenting to automatic renewal. The Pact is an act
  of a different kind, about a different subject. Bundling them weakens both.
- **The three-year consent record is the same artifact this seat already proposed for a different
  reason.** `positions/2026-09-20-consent-at-the-moment.md` asks for an append-only table storing
  who consented, to what, and which version of the text they saw. California requires
  substantially that for the renewal term. One table serves both.
- **The fee-change notice window is seven to thirty days and New York's reminder window is fifteen
  to forty-five days before the deadline.** A single notice sent at thirty days before a renewal
  that carries a price change satisfies both, which is why the practical answer is one scheduled
  email rather than a compliance matrix.
- **Severity is low and real at the same time.** No private right of action, but the UCL is the
  most used consumer statute in the country and the plaintiff bar runs ARL demand letters as a
  volume practice. A hundred members at $50 is not a target. The reason to comply is that the
  compliant build is not harder than the non-compliant one if it is done before launch.
- Not legal advice. The code text was not read; this rests on a named firm's reading of it, and
  the stand-alone-consent point is that firm's inference from the statutory language rather than
  an express statutory sentence.

*Filed 2026-09-20*

## Addendum, 2026-09-21: the code text, read

Cal. Bus. and Prof. Code Section 17602, as amended by Stats. 2024, ch. 515 (AB 2863), read at
California Legislative Information through the fetch tool's extraction.
https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17602

The firm's reading holds, and the stand-alone point is now statutory rather than inferred:
subsection (a)(4) requires "express affirmative consent to the automatic renewal or continuous
service offer terms", separately from (a)(2)'s consent "to the agreement containing" them. The
terms must be presented "in visual proximity" to the request for consent (a)(1). The
acknowledgment must carry the renewal terms, "cancellation policy, and information regarding how
to cancel" (a)(3). Verification of consent is kept "for at least three years, or one year after the
contract is terminated" (a)(6). A fee change needs notice "no less than 7 days and no more than 30
days before the fee change takes effect" (g)(2). Online cancellation needs a "prominently located
direct link or button" (d)(1), and an annual reminder is owed (h).

**What it changes in the drafts:** nothing in the position, and three build details in
`drafts/membership-terms.md`. The checkbox is its own act, beside the terms it consents to; the
receipt email carries the three items (a)(3) names; and a single notice at the renewal reminder
window can carry a price change only if it lands inside 7 to 30 days of the change, which is why
the reminder and the price-change notice are one email sent no more than 30 days out.
