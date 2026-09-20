# Out-group animosity drives engagement on social media

**Source:** Rathje, S., Van Bavel, J. J., and van der Linden, S. (2021). "Out-group animosity drives engagement on social media." Proceedings of the National Academy of Sciences, 118(26), e2024292118. DOI 10.1073/pnas.2024292118 https://doi.org/10.1073/pnas.2024292118

## Summary

An analysis of 2,730,215 posts from news media accounts and US congressional members on Facebook and Twitter. Posts about the political out-group were shared or retweeted about twice as often as posts about the in-group, and each individual out-group term raised the odds of a share by 67 percent. Out-group language was the strongest predictor of sharing among every predictor measured: about 4.8 times the effect of negative affect language, and about 6.7 times the effect of the moral-emotional language measured by Brady et al. (2017). Out-group language strongly predicted angry reactions and in-group language strongly predicted love reactions, which the authors read as in-group favoritism alongside out-group derogation. The effect was not moderated by political orientation or by platform, and it was stronger for political leaders than for news media accounts.

## Implies for Dialecta

- The charter names "in-group signaling" as a bias the classification card triggers. This study says the stronger and better measured driver is out-group animosity, by roughly 4.8 times over negative affect and 6.7 times over moral-emotional language. The charter's candidate is real, and it is the weaker half of the pair.
- A direct, testable change to a named surface. Question 4 of the prompt in the Classification Engine Specification asks "Are tribal, rhetorical, or identity-signaling patterns present?" That question aims at in-group signaling. The strongest measurable marker in the literature is reference to an out-group, and the prompt never asks for it by name. Adding an explicit out-group reference check to Stage A aligns the Stance tier with the best available evidence. The same prompt is inline in `api/classify.js`.
- The Stance and Heat boundary in that spec discriminates on whether a comment is "mainly expressing feeling" or "mainly signaling group membership." This study suggests a third question that discriminates better and is easier to detect: is the comment about the other side? Out-group reference is more legible to a classifier than group membership signaling, and it predicts the behavior better.
- The finding that the effect ran stronger for political leaders than for news accounts bears on any future decision about verified, featured, or high-profile contributors. The accounts with the largest audience produced the most out-group language.

*Filed 2026-09-19*
