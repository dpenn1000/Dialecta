# Steering User Behavior with Badges

**Source:** Anderson, A., Huttenlocher, D., Kleinberg, J., and Leskovec, J. (2013). "Steering user behavior with badges." Proceedings of the 22nd International Conference on World Wide Web (WWW '13), 95-106. DOI 10.1145/2488388.2488398 https://www.cs.cornell.edu/home/kleinber/www13-badges.pdf

## Summary

A formal model of how badges steer user behavior, tested against several million users on Stack Overflow. The model predicts an "acceleration" effect: a user's distribution of actions is deflected toward a badge, and the deflection grows stronger as the user approaches the badge boundary. The empirical test used two badges with visible numeric thresholds, Electorate (600 question-votes) and Civic Duty (300 votes), on a site where a user can see exactly how many actions they have taken and how many remain. Three findings, in the authors' words. Activity on the targeted actions "increases substantially before users achieve the badge, and then almost immediately returns to near-baseline levels." Users "turn" toward badge boundaries, deviating further from their preferred actions the closer they get. And the Electorate answer-vote curve "drops in the days leading up to the badge boundary," which the authors read as "evidence that users are steering their behavior from A-votes to Q-votes," meaning the badge pulled effort off another contribution rather than only adding effort.

## Implies for Dialecta

- This is the measured version of the platform's own source thesis, on the exact instrument under discussion. Article 8 says whatever a system rewards, people adapt toward. A badge with a countable threshold is a system rewarding a count, and the adaptation is documented at scale: a spike before the line, a collapse after it, and effort pulled off neighbouring contributions.
- Bears directly on the proposal to condition the Charter badge on a minimum number of articles in the first year. Three predicted shapes, all of them things the platform says it does not want: articles clustered at the deadline rather than when the writer has something to say, the writing rate falling back to baseline the day the badge locks, and substitution away from commenting, which is where the classification engine and the whole Discourse Layer live.
- The substitution finding is the one a designer would not anticipate. A quota does not only fail to produce the intended behavior; it can reduce a behavior nobody was worried about, because effort is finite and the countable thing wins.
- The visibility of progress is load-bearing in the mechanism. Stack Overflow shows the user how many actions remain, and the authors name that as why progress steers. A Dialecta counter reading "2 of 3 articles" would install the same gradient. A condition that is never surfaced as a running count is a weaker version of the same thing.
- Supports the charter's veto on Goodhart pressure with a measurement rather than an intuition, and the veto's scope should widen: the risk is not confined to the Fingerprint. Any countable threshold attached to a visible mark carries it.
- Limit worth naming: Stack Overflow badges are free to earn and carry no price. The Dialecta case adds money, which is a different frame (see `2004-heyman-ariely-market-norms`), and the steering result does not speak to that half.

*Filed 2026-09-20*
