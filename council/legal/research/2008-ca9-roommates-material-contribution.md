# Roommates.com: material contribution to unlawfulness, and why Stage 2 survives it

**Source:** Fair Housing Council of San Fernando Valley v. Roommates.com, LLC, 521 F.3d 1157
(9th Cir. 2008) (en banc), Kozinski, C.J., read 2026-09-20 from the Ninth Circuit's own slip
opinion. https://cdn.ca9.uscourts.gov/datastore/opinions/2008/04/02/0456916.pdf

Binding in Arizona. The first sprint cited this case only through two Congressional Research
Service summaries, which is not good enough for the authority that governs the platform's own
forum on the question this seat exists to answer.

## Summary

Roommate.com required every user to answer dropdown questions about sex, sexual orientation and
family status, and to state preferences on the same characteristics, as a condition of using the
service. The en banc court held Section 230 did not protect it as to those answers.

The test is narrower than it is usually quoted. Development means "not merely to augmenting the
content generally, but to materially contributing to its alleged unlawfulness". A website loses
immunity "if it contributes materially to the alleged illegality of the conduct". By requiring
discriminatory answers as a condition of service, Roommate "becomes much more than a passive
transmitter".

The limit is equally important. "[P]roviding neutral tools to carry out what may be unlawful or
illicit searches does not amount to 'development'". A generic search engine keeps its immunity
because it contributes nothing to the illegality.

The opinion also splits the site in two. The mandatory dropdown answers were developed by
Roommate. The voluntary "Additional Comments" free-text field was treated differently, and the
plaintiffs' claims rested on the mandatory portions.

## Implies for Dialecta

- **Stage 2 self-declaration is structurally the Roommates questionnaire, and it survives anyway.**
  `docs/Dialecta_Discourse_Layer_UX.md` specifies that the self-declaration panel presents all
  seven tiers and that the "Post comment" button "is disabled until a tier is selected". That is a
  mandatory choice from a closed menu the platform wrote, as a condition of service, which is the
  exact shape the court condemned. What saves it is the word the test actually turns on. Roommate
  contributed materially to *unlawfulness*, because stating a housing preference on a protected
  characteristic is itself the Fair Housing Act violation. Selecting "Forum" is not unlawful in
  any respect. There is no illegality for the menu to contribute to.
- **That is a real protection and it is also a warning about what would break it.** The day a
  required field's answer could itself be the wrong done, the analysis changes. The closest thing
  on the horizon is opinion mapping: a required position on a contested question, chosen from a
  platform-authored set, stored against a named person. That is worth flagging before it is built
  rather than after.
- **The neutral tools sentence protects most of the platform.** Sorting by tier, filtering in the
  topology bar, the search path and the feed are tools carrying out what a reader chose. None
  contributes to any illegality.
- **The mandatory and voluntary split maps onto Dialecta cleanly.** The comment body is the
  voluntary free-text field and is the contributor's. The tier selection is the mandatory
  dropdown. The commenter message is neither, because the platform writes it, which is why it
  remains the most exposed string on the page under
  `council/legal/research/2024-crs-section-230-overview.md` rather than under this case.
- **It answers the AI-suggestion question, and the answer is favourable.** The
  `aesthetic-suggest` endpoint is recorded in `exchange/open/2026-09-19-005` as "explicitly
  forbidden from touching content", returning formatting and structure suggestions only. A tool
  that cannot alter words cannot materially contribute to their unlawfulness. If a future editor
  gains a suggestion that proposes wording, that protection ends and the record of who applied it
  becomes the artifact that matters.
- Not legal advice. What would need counsel: whether a required tier selection could be
  characterised as the platform developing a contributor's self-assessment for a claim that does
  not depend on illegality at all, such as a false light theory. The Roommates test is about
  unlawfulness, and not every tort frames itself that way.

*Filed 2026-09-20*
