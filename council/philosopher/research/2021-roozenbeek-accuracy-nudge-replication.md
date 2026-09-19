# How Accurate Are Accuracy-Nudge Interventions? A Preregistered Direct Replication of Pennycook et al. (2020)

**Source:** Roozenbeek, J., Freeman, A. L. J., and van der Linden, S. (2021). "How Accurate Are Accuracy-Nudge Interventions? A Preregistered Direct Replication of Pennycook et al. (2020)." Psychological Science, 32(7), 1169-1178. DOI 10.1177/09567976211024535 https://doi.org/10.1177/09567976211024535

## Summary

A two stage preregistered direct replication run under the SCORE program, testing Pennycook et al.'s (2020) finding that asking people to think about the accuracy of a single headline improves truth discernment in sharing intentions for COVID-19 headlines. The first stage, n = 701, was unsuccessful at p = .67. A second round brought the pooled sample to N = 1,583 and produced a small but significant interaction between condition and truth discernment at an uncorrected p = .017, with treatment d = 0.14 against control d = 0.10. As in the target study, perceived headline accuracy tracked treatment impact, so treated participants were less willing to share headlines they saw as less accurate. The authors also report an unreported change between the hypothesis preregistered in the original study and the one it published.

## Implies for Dialecta

- The Classification Engine Specification calls the commenter message "the primary behavior-change mechanism of the platform." The nearest tested analogue moves discernment from d = 0.10 to d = 0.14, on an uncorrected p value, after failing outright on the first sample. The spec's claim is asserted, not evidenced, and should read as a hypothesis the platform intends to test.
- Dialecta's card differs from the tested prompt in four ways that could plausibly make it stronger: it addresses the contributor's own writing rather than a stranger's headline, it is specific to that writing rather than generic, it repeats on every comment rather than once, and it carries a visible consequence in tier placement. None of those differences has been tested. They are reasons to run the experiment, not reasons to assume its result.
- Concrete and nearly free: the Stage A fields are already logged per the System Integration Notes in the Classification Engine Specification. Logging whether the contributor edited the comment after seeing the card, and how the tier moved when they did, turns that log into a direct measurement of the platform's central claim.
- This is the strongest case for holding the founding thesis as a wager rather than a finding. Article 10 of the Founding Philosophy already does exactly that, calling the answer "not assumed" but "the thing being tested." The founding essay is honest here. The engineering spec is the document that overstates.

*Filed 2026-09-19*
