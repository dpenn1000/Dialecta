# Arizona has no comprehensive consumer privacy law, and that changes the privacy posture entirely

**Source:** Max Rieper, "20 State Privacy Laws in Effect in 2026: Key Dates and Changes",
MultiState, 2026-02-04, read 2026-09-20, cross-checked against a search of the Arizona
legislature's 2026 session. https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026

Filed 2026-09-20 in correction. Every privacy note filed earlier the same day assumed a
Connecticut operator. Dan told this session "We live in Arizona". Nothing in the repository ever
said Connecticut; the premise came from `.claude/agents/legal.md` line 30 and from
`council/legal/research/reading-list.md`, and `security` built two notes on the same premise.

## Summary

Twenty states had comprehensive privacy laws in effect in 2026. The article names those taking
effect during the year: Indiana, Kentucky and Rhode Island on January 1, with amendments in
Oregon, California, Nebraska and Texas; Connecticut, Arkansas and Utah on July 1; California's
data broker registration on August 1. **Arizona appears nowhere in it.**

A separate search of the 2026 Arizona session found two comprehensive privacy bills, S.B. 1815
and S.B. 1790, introduced and not enacted. Arizona has never passed an omnibus consumer privacy
statute. What Arizona has instead is a breach notification statute, A.R.S. Section 18-552, filed
separately, and the ordinary reach of the FTC Act.

## Implies for Dialecta

- **The Connecticut analysis does not apply to Dialecta, and the "live item at fourteen users"
  framing was wrong.** The CTDPA reaches persons who conduct business in Connecticut or target
  products or services to Connecticut residents, and "consumer" means a Connecticut resident. An
  Arizona operator running a website that anyone may read is not targeting Connecticut. Passive
  availability of a site has never been treated as targeting a state.
- **There is no home-state privacy statute to comply with.** No controller duties, no privacy
  notice mandated by state law, no access or deletion rights, no opt out signal to honour, no
  profiling provisions, no sensitive data trigger. The nearest thing to an obligation is that a
  privacy policy, once published, becomes enforceable under FTC Act Section 5.
- **The work already done on the pillars was not wasted and should be kept.** Connecticut's
  sensitive data list is the common template: most of the twenty states use substantially the
  same closed categories. The finding that the six pillars and the archetype are on none of them
  travels to every state that copies the list, which is the population Dialecta's readers
  actually live in. The finding that travels least is the applicability analysis, which was
  Connecticut-specific.
- **The exposure now comes from where readers live, not from where Dan lives.** Twenty states
  have laws, and the ones with the lowest thresholds are the ones that could reach Dialecta
  first. That is a different research question from the one this tree has been answering, and it
  is the one the next sprint should take.
- **The Connecticut sources stay filed rather than being marked dead.** They are accurate about
  Connecticut and they are the most detailed statutory reading in this tree. They are now
  comparative rather than controlling, and each has a correction line saying so.
- Not legal advice. What would need counsel: whether a publicly readable site with members in a
  given state is "targeting" that state's residents for applicability purposes. That question now
  replaces the Connecticut one as the live privacy question, and it has to be asked twenty times
  rather than once.

*Filed 2026-09-20*
