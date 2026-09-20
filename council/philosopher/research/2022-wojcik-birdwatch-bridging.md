# Birdwatch: Crowd Wisdom and Bridging Algorithms can Inform Understanding and Reduce the Spread of Misinformation

**Source:** Wojcik, S., Hilgard, S., Judd, N., Mocanu, D., Ragain, S., Hunzaker, M. B. F., Coleman, K., and Baxter, J. (2022). "Birdwatch: Crowd Wisdom and Bridging Algorithms can Inform Understanding and Reduce the Spread of Misinformation." arXiv:2210.15723, 27 October 2022. https://arxiv.org/abs/2210.15723

## Summary

Describes the ranking system behind Twitter's Birdwatch, later renamed Community Notes. Contributors annotate posts and rate each other's annotations at the same time. A matrix factorization model infers a latent viewpoint position for raters and for notes, and surfaces only the notes rated helpful by people whose inferred viewpoints differ, an approach the authors call bridging-based ranking. A survey experiment found that notes selected this way improved key indicators over both an overall average baseline and a crowd-generated baseline. Deployed on Twitter, people who saw the selected annotations were significantly less likely to reshare the annotated post. The reading list entry for this source carried a shortened title; the full title is recorded above.

## Implies for Dialecta

- This is the answer to the hole that Brady et al. (2017) opens in community voting. Bridging-based ranking is built for the exact failure where one faction can carry a vote internally, because it counts agreement across raters who disagree rather than counting votes.
- Concrete proposal for backlog A-D1, which asks about the community re-review threshold and whether community judgment alone may outweigh the AI. The threshold is the wrong knob while the aggregation is a raw count, because a larger count of same-side voters is still same-side. Settle what is being aggregated first, and how much of it is needed second.
- Dialecta already holds the raw material. The opinion maps place contributors in a low dimensional opinion space, and the live Supabase project has an `opinion_map_positions` table. A bridging weight on a reclassification nomination could read a contributor's existing map position instead of inferring a fresh one.
- Honest limit: bridging works where disagreement is factional and legible. Dialecta's disagreements are about whether a comment is specific, which need not split along the axes politics splits on. The approach transfers; the assumption that the factions are visible does not transfer for free.
- Cost note for the treasurer: a matrix factorization over nominations is cheap at Dialecta's size and stays cheap as it grows. It is also far more expensive to retrofit than to design in, which makes it a decision worth taking before A-D1 closes rather than after.

*Filed 2026-09-19*
