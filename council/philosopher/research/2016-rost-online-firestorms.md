# Digital Social Norm Enforcement: Online Firestorms in Social Media

**Source:** Rost, K., Stahel, L., and Frey, B. S. (2016). "Digital Social Norm Enforcement: Online Firestorms in Social Media." PLOS ONE, 11(6), e0155923. DOI 10.1371/journal.pone.0155923 https://doi.org/10.1371/journal.pone.0155923

## Summary

Three years of data from a public affairs platform, 532,197 comments on 1,612 online petitions, analyzed to test the common assumption that anonymity is one of the principal drivers of online aggression. The study found the opposite. Non-anonymous individuals were more aggressive than anonymous ones, and the effect strengthened where selective incentives were present and where aggressors appeared intrinsically motivated. The authors read online firestorms through social norm theory rather than through disinhibition: aggression in this setting is norm enforcement performed in public, and a real name is what makes the performance pay off for the performer.

## Implies for Dialecta

- Bears directly on P0-D2, which asks about login methods and whether sign-up is open or invite-only at cutover. Any argument that identity verification will lift discourse quality has this study against it. In the one setting where it has been measured at this scale, names made aggression worse rather than better.
- The mechanism is the reason, and it is the same mechanism as Barasch and Berger (2014): visible identity plus an audience turns a comment into a performance. Dialecta already has public performance surfaces in the tier badge and the Contrast Strip, and plans a contributor profile carrying a Thinking Fingerprint. Pseudonymous accounts with a persistent history give the Fingerprint everything it needs without adding the real name multiplier this study measured.
- Here the platform's instinct and the evidence agree, which is worth recording precisely because it is the less common case. ADR-002 chose Supabase Auth, and the P0-D2 candidates of magic link and Google require no legal name. Nothing in the backlog proposes real names. This note exists so the question stays closed on evidence rather than on habit, and so a future growth argument for real name signup has to answer it.
- Limit worth naming: the setting is online petitions, where aggression is close to the point of the activity, and the aggressors were enforcing norms they believed in. The study does not show anonymity is harmless. It shows names are not the fix, which is a narrower claim and the one that bears on P0-D2.

*Filed 2026-09-19*
