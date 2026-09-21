# California's minor content removal law

**Source:** Cal. Bus. and Prof. Code Sections 22580 and 22581, primary, California Legislative
Information, read 2026-09-20.
https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=22581
and the same URL with `sectionNum=22580`. Section 22581 was added by Stats. 2013, Ch. 336 (SB 568),
effective January 1, 2014 and **operative January 1, 2015**. Section 22580 was last amended by
Stats. 2018, Ch. 347 (AB 3067), effective January 1, 2019. Subsection (a) of 22581 and the
definitions below are quoted from the statute; subsections (b) to (f) were read in the fetch tool's
summary and are paraphrased rather than quoted.

## Summary

**22581(a):** "An operator of an Internet Web site, online service, online application, or mobile
application directed to minors or an operator ... that has actual knowledge that a minor is using
its Internet Web site ... shall do all of the following: (1) Permit a minor who is a registered
user ... to remove or, if the operator prefers, to request and obtain removal of, content or
information posted on the operator's Internet Web site ... by the user." Paragraphs (2) and (3)
require notice of the right and "clear instructions"; paragraph (4) requires notice that removal
"does not ensure complete or comprehensive removal."

**Definitions, 22580.** A minor is "A natural person under 18 years of age who resides in this
state." An operator is "Any person or entity that owns an Internet Web site". No size or revenue
threshold appears in either. "Directed to minors" means created for an audience "predominately
comprised of minors, and is not intended for a more general audience comprised of adults."

**The rest of 22581, paraphrased.** Subsection (b) lists five circumstances in which removal is not
required: another law requires retention, a third party posted the content, the operator
anonymises it, the minor does not follow the instructions, or the minor was paid for it.
Subsection (d) treats an operator as compliant if it renders the content invisible to other users,
even if it stays on the operator's servers. Subsection (e) does not require an operator to collect
age information.

## Implies for Dialecta

- **The one US deletion right this tree has found that ignores platform size.** It turns on actual
  knowledge of a California minor, and revenue and member count play no part.
- **It reaches what the minor wrote and stops short of what the platform concluded.** "Content or information
  posted ... by the user" is the comment. The fingerprint is the platform's rendering of it. This
  seat reads the derived mark as outside the section, and the drafting leaves room to argue it.
- **It collides with hardening, and hiding satisfies it.** The recovered API refuses to delete a
  hardened comment (`_recovered/api/comment/[id].js` line 313). Subsection (d) lets Dialecta comply
  by hiding the comment from everyone else while keeping it, which is the record surviving and the
  display yielding.
- **The Pact states no age requirement.** Dialecta need not collect ages, but the day it learns a
  contributor is a California minor, the hardening rule stops applying to that person.
- Not legal advice. What would settle it: whether "actual knowledge" can arise from something a
  contributor writes about themselves in a comment, which is the realistic way Dialecta would learn
  it.

*Filed 2026-09-20*
