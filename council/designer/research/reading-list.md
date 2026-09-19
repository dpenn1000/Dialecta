# Reading list: designer

*Seed written by Claude, 2026-09-19. Verify before filing; mark `dead` what does not hold up. Add leads as you read.*

*Sprint 1, 2026-09-19: nine sources filed, six of them from the seed. Corrections to seed rows are recorded in the Note column.*

| State | Lead | Why it matters here | Note |
| --- | --- | --- | --- |
| filed | Discourse (Jeff Atwood), trust levels, blog.discourse.org | The closest living precedent for earned trust and reading-before-posting gates; bears on Stewards and the composer | `2018-atwood-discourse-trust-levels.md`. Seed correction: "Civilized Discourse Construction Kit" is a February 2013 Coding Horror post and the company name, not a design series on blog.discourse.org. Split out as its own lead below |
| filed | Stack Overflow reputation and privilege design | Reputation that unlocks tools rather than status; what went wrong at scale; bears on the fingerprint as scoreboard risk | `2026-stackoverflow-privileges.md`. Filed from the live help centre privilege pages. The Meta Stack Exchange design history named in the seed was not read; split out below |
| todo | Slashdot moderation and meta-moderation | Community classification of comments with a second layer judging the judges; direct precedent for reclassification | Seed attributes this to Rob Malda's CmdrTaco writeups. Not verified. Check the Slashdot FAQ and the 1999 moderation documentation before crediting a person |
| todo | Hacker News moderation and ranking notes (dang's public comments, the HN guidelines) | Flat design, flag-based suppression, "assume good faith" copy; bears on the Breach tier UX | |
| todo | Kialo, product design of pro/con argument trees | Structured disagreement UI; what people abandon; bears on the Advocate mechanic | |
| todo | Polis (pol.is) participant interface | Voting on statements and seeing your cluster; the only shipped opinion-map UX; bears on D-1 and D-2 | Raised in priority by `2006-nielsen-participation-inequality.md`: a one-tap position is the only contribution most readers will ever make |
| filed | Community Notes contributor UX (X), the rating flow and the "helpfulness" copy | How a note-rating flow is made legible; bears on the nomination panel | `2026-x-community-notes-writing-ability.md`. Filed from the twitter/communitynotes repository, which is the primary documentation |
| todo | Krug (2014), Don't Make Me Think, Revisited | The one-read test for every page; bears on the site review's structure changes | |
| todo | Norman (2013), The Design of Everyday Things | Affordances and feedback; bears on the classification card's "reads as" moment | |
| todo | Nielsen Norman Group, onboarding and first-run experience research | Completion of one-sitting onboarding; bears on the Pact page cut | Still open. Sprint 1 filed a different NN/g article, listed below |
| todo | Kohavi, Tang, Xu (2020), Trustworthy Online Controlled Experiments | How to know a change worked; bears on instrumenting Pact completion and seven day return | Blocked in practice: no metric exists to experiment on. Read after first-comment completion is instrumented |
| todo | Substack Notes and Medium responses: product writeups on comment surfaces attached to long-form | Comment surfaces on editorial platforms; what they got wrong; bears on the thread design | |
| todo | Letterboxd and Goodreads review UX | Identity built from a body of work rather than a score; bears on the profile page | |
| filed | Fogg (2009), "A behavior model for persuasive design" | Motivation, ability, trigger; used to name what the composer must make easy, not to manipulate | `2009-fogg-behavior-model.md`. Citation verified against Crossref. ACM full text is paywalled and was not read; model content came from the Stanford Behavior Design Lab page |
| filed | Metafilter, the $5 signup and its effect on community quality | Friction as filter; bears on P0-D2 open vs invite-only | `2014-pileggi-metafilter-barriers.md`. Seed understated it: there is also a mandatory one week wait before a new member may post. Abstract only; full text lead below |

## Added in sprint 1

| State | Lead | Why it matters here | Note |
| --- | --- | --- | --- |
| filed | Nielsen (2006), "The 90-9-1 Rule for Participation Inequality" | Sizes the prize for the composer: nine readers in ten never post, and 27% of contributions are a person's only one | `2006-nielsen-participation-inequality.md` |
| filed | Roselli (2024), "Don't Disable Form Controls" | The mechanism A-1 uses for the 12 character gate is a disabled button; this is the case against that mechanism | `2024-roselli-disabled-form-controls.md`. Corroborated by the NHS digital service manual button guidance |
| filed | FIDO Alliance with Liminal (2025), "Passkey Index" | The only published cross-platform numbers on sign-in completion by method; bears on P0-D2 | `2025-fido-passkey-index.md`. Self-reported by nine member organisations; read the caveats before citing the headline |
| filed | Supabase Auth documentation: rate limits, passwordless email, custom SMTP | The email constraints that decide whether a magic link can work at cutover at all | `2026-supabase-auth-email-limits.md` |
| todo | Whittaker, Terveen, Hill and Cherny (1998), "The dynamics of mass interaction", CSCW | The Usenet study behind Nielsen's 27% single-post figure. Read the primary rather than the summary | Found while filing `2006-nielsen-participation-inequality.md` |
| todo | Pileggi, Morrison and Bruckman (2014), GT-IC-14-01, full text | The abstract says why the barriers were imposed and why users surmounted them. The second half is the part that would change a position | Promoted from the MetaFilter row. Not retrievable from the UNO or Georgia Tech repositories on 2026-09-19 |
| todo | Nunes and Dreze (2006), the endowed progress effect, Journal of Consumer Research | Progress shown toward a goal a person has already started; the alternative to a gate in the composer | Found while working A-1. Check it survives replication before citing |
| todo | Community Notes, "diversity of perspectives" and the bridging algorithm | Status reached by agreement across contributors who usually disagree, rather than by majority | Bears on A-D1: whether community voting alone may outweigh the AI under 40/35/15/10 |
| todo | Discourse `newuser` rate limit settings, meta.discourse.org | The per-account caps that do the spam work a character minimum is being asked to do | Found while filing `2018-atwood-discourse-trust-levels.md` |
| todo | Atwood (2013), "Civilized Discourse Construction Kit", Coding Horror, February 2013 | The founding argument for the whole Discourse design, including reading as the unit of trust | Split out of the seed row after the domain in the seed turned out wrong |
| todo | Custom SMTP providers for Supabase Auth: deliverability, domain warmup, monthly cost | P0-4 cannot ship magic links without one. The choice has a price and belongs in front of the treasurer | Found while filing `2026-supabase-auth-email-limits.md` |
