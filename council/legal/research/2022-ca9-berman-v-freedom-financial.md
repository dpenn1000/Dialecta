# Berman v. Freedom Financial: a click binds only when the user is told it does

**Source:** Berman v. Freedom Financial Network, LLC, 30 F.4th 849 (9th Cir. 2022), No. 20-16900,
decided April 5, 2022, slip opinion read 2026-09-21 from the Ninth Circuit's own site, text
extracted from the PDF. Quotations are from the majority opinion (Watford, J.).
https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/05/20-16900.pdf

## Summary

Unless the operator can show actual knowledge, an online agreement binds on inquiry notice only
if "(1) the website provides reasonably conspicuous notice of the terms to which the consumer will
be bound; and (2) the consumer takes some action, such as clicking a button or checking a box,
that unambiguously manifests his or her assent to those terms."

On notice: the hyperlinks failed because "the fact that a hyperlink was present was not readily
apparent." The court: "A web designer must do more than simply underscore the hyperlinked text in
order to ensure that it is sufficiently 'set apart' from the surrounding text. Customary design
elements denoting the existence of a hyperlink include the use of a contrasting font color
(typically blue) and the use of all capital letters". Consumers cannot be made to "ferret out
hyperlinks."

On assent: "merely clicking on a button on a webpage, viewed in the abstract, does not signify a
user's agreement to anything. A user's click of a button can be construed as an unambiguous
manifestation of assent only if the user is explicitly advised that the act of clicking will
constitute assent to the terms and conditions of an agreement."

## Implies for Dialecta

- **Binding in Arizona's circuit, and it sharpens Nguyen into two build rules.** The act that
  accepts the terms must say that it does, and the link to the terms must look like a link.
- **The Pact's button fails the second prong as written.** "I Understand · Enter"
  (`apps/web/src/strings.ts` line 1455) advises the signer of nothing about terms. One sentence
  beside it, "Signing accepts the Terms of Service", supplies the explicit advisal; the signature
  line and the click are then the act.
- **The house link style fails the first prong on its own.** `apps/web/CLAUDE.md` rules that on
  paper, text "takes ink with a brass underline" (designer D-27). Berman holds an underline alone
  is not enough. The terms link at the Pact and at checkout needs a contrasting colour, such as
  `--brass-deep`, which the same rule allows for text, or small capitals.
- **The checkout copy follows the same rule.** "Continuing accepts the Membership Terms" sits
  directly above "Agree and continue to payment", so the button says what clicking it does.
- Not legal advice.

*Filed 2026-09-21*
