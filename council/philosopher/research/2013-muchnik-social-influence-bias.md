# Social influence bias

**Source:** Muchnik, L., Aral, S., and Taylor, S. J. (2013). "Social Influence Bias: A Randomized Experiment." Science, 341(6146), 647-651. DOI 10.1126/science.1240466 https://doi.org/10.1126/science.1240466 (abstract read through OpenAlex; figures confirmed against the authors' summary)

## Summary

On a social news site, about 100,000 new comments were randomly given one up-vote, one down-vote, or nothing. A single prior up-vote raised the probability that the next viewer up-voted by 32 percent and produced accumulating herding that left final ratings 25 percent higher. Negative manipulation was largely corrected by later users. Effects varied by topic and by whether the rater was a friend of the commenter.

## Limits

Up- and down-votes on other people's comments, not a reader placing their own position on a map. The asymmetry matters: a mark that reads as endorsement herded, a mark that read as disapproval provoked correction, so a reference mark may pull some readers and push others.

## Implies for Dialecta

- **The author's mark at post-read placement.** The Declare overlay shows the author's brass marker on the same figure the reader is placing on (`apps/web/src/components/article-declaration/declaration.tsx:164`). One visible prior mark measurably moved the next judgment in a randomized field test. Whether it pulls or pushes, the reader's placement becomes partly a reaction to the author.
- **The delta, when built.** A post-read move toward the marker cannot be told from anchoring, so the Reviser would record conformity as revision. The build already hides the marker pre-read for this reason (`declaration.tsx:198-202`).

*Filed 2026-09-21*
