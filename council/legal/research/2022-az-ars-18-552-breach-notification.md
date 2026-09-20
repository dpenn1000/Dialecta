# A.R.S. Section 18-552: Arizona breach notification, and the economic loss trigger

**Source:** Ariz. Rev. Stat. Section 18-552, "Notification of security system breaches;
requirements; enforcement; confidentiality; civil penalty; preemption; exceptions", Arizona State
Legislature, read 2026-09-20, with the 2022 Department of Homeland Security amendment from the
Arizona Attorney General's data breach guidance.
https://www.azleg.gov/ars/18/00552.htm and https://www.azag.gov/consumer/data-breach

Filed in correction. `council/security/research/2021-ct-breach-notification.md` files
Connecticut's Section 36a-701b as the applicable breach statute. Dialecta is operated from
Arizona, so this is the one that applies, and the two differ in ways that matter.

## Summary

On determining that a breach occurred, an entity must notify affected individuals "within
forty-five days after the determination", and the clock runs from determination rather than from
the breach.

Subsection J carries the trigger that distinguishes Arizona from most states: notification is not
required where a breach "has not resulted in or is not reasonably likely to result in substantial
economic loss to affected individuals". That is a materiality threshold on the front of the duty
rather than a risk-of-harm exception on the back of it.

Where more than one thousand individuals must be notified, subsection B(2) requires notice to the
Attorney General and to the three largest nationwide consumer reporting agencies, and since
July 22, 2022 to the Arizona Department of Homeland Security.

Subsection G brings login credentials inside the statute: a breach of email account information
together with a password is notifiable.

Subsection L caps enforcement. The Attorney General may seek "a civil penalty for a violation of
this article not to exceed the lesser of $10,000 per affected individual or the total amount of
economic loss sustained by affected individuals", with a maximum of $500,000 for a breach or
series of related breaches.

## Implies for Dialecta

- **Forty-five days from determination, not sixty.** Connecticut's clock is sixty days from
  discovery. Anyone working from `council/security/research/2021-ct-breach-notification.md` is
  planning to the wrong deadline for a shorter one.
- **The Attorney General threshold is a thousand individuals, so at fourteen members a breach is
  notifiable to the people affected and to nobody else.** That is a materially smaller obligation
  than the Connecticut note describes, and it stays that way until Dialecta has a thousand
  members.
- **The substantial economic loss trigger probably takes Dialecta's own data outside the statute,
  and the credentials provision probably brings part of it back.** A leak of comments, tier
  labels and pillar scores is unlikely to cause substantial economic loss to anyone. A leak that
  exposed email addresses together with anything usable as a password would be notifiable under
  subsection G whatever the economic loss analysis said. That distinction is worth putting in
  front of `security`, because it means the breach exposure sits in the authentication surface
  rather than in the content tables.
- **The penalty ceiling is a real number and it is not large.** $500,000 is the maximum for a
  breach or series of related breaches, and the per-individual figure is capped by actual economic
  loss, which for this data is close to zero.
- **This is `security`'s field and the note is filed here only because the wrong state was
  filed.** Posted to the exchange rather than left in this tree.
- Not legal advice. What would need counsel: whether publicly readable profile data, which the
  live `profiles` table currently exposes to the anonymous key per root `CLAUDE.md`, can be
  "breached" at all within the statute's meaning when it was already public. That is an odd and
  genuinely unresolved question created by the existing RLS gap.

*Filed 2026-09-20*
