# 47 U.S.C. Section 230: the operative text, and the clause a tier badge lands on

**Source:** 47 U.S.C. Section 230, "Protection for private blocking and screening of offensive
material", Cornell Legal Information Institute, read 2026-09-20.
https://www.law.cornell.edu/uscode/text/47/230

## Summary

Section 230(c)(1) reads in full: "No provider or user of an interactive computer service shall be
treated as the publisher or speaker of any information provided by another information content
provider." Every word of the shield is in that sentence, and the last six words are the limit.
The protection runs to information provided by *another* information content provider, not to
information the service provides itself.

Section 230(f)(2) defines an interactive computer service as "any information service, system, or
access software provider that provides or enables computer access by multiple users to a computer
server, including specifically a service or system that provides access to the Internet and such
systems operated or services offered by libraries or educational institutions." Dialecta is one;
so is a personal blog with a comment form. Nothing in the definition turns on size.

Section 230(f)(3) defines an information content provider as "any person or entity that is
responsible, in whole or in part, for the creation or development of information provided through
the Internet or any other interactive computer service." The phrase "in whole or in part" is the
clause that decides Dialecta's central question, because it means a service can be a protected
host of one string and the author of another string on the same page.

Section 230(c)(2)(A) separately protects "any action voluntarily taken in good faith to restrict
access to or availability of material that the provider or user considers to be obscene, lewd,
lascivious, filthy, excessively violent, harassing, or otherwise objectionable." That is the
moderation shield, and it protects the *act* of restricting access, not any statement the
provider publishes about why. Section 230(e) preserves federal criminal law, intellectual
property law, communications privacy law, consistent state law, and the sex trafficking statutes.

## Implies for Dialecta

- A contributor's comment text is information provided by another information content provider.
  Section 230(c)(1) covers it on its face, and that covers the ordinary defamation risk of
  hosting a comment thread. This is the part of the platform that is legally unremarkable.
- The tier badge, the commenter message written by `api/classify.js`, and the Breach suppression
  notice specified at `docs/Dialecta_Discourse_Layer_UX.md` line 113 are strings Dialecta
  generates. Under 230(f)(3) Dialecta is responsible "in whole or in part" for their creation.
  The statute does not have to reach a novel question to get there; that is the plain text.
- Suppressing a Breach comment is protected by 230(c)(2)(A) as an action taken against material
  the provider considers objectionable. Publishing a notice saying the comment "targets a person"
  is not that action. The spec currently does both in the same surface, which is why the two need
  to be reasoned about separately.
- Nothing in 230(f)(2) gives a small operator less protection or more. The size of Dialecta is
  irrelevant to whether the shield applies, and relevant only to whether anyone bothers to sue.
- Not legal advice. Filed as the text the rest of this tree is read against.

*Filed 2026-09-20*
