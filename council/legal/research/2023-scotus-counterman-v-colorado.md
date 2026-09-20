# Counterman v. Colorado: the speaker's state of mind, and what Breach is not

**Source:** Counterman v. Colorado, 600 U.S. 66 (2023), decided 2023-06-27, Kagan, J., for a
six member majority, read 2026-09-20 via Cornell Legal Information Institute.
https://www.law.cornell.edu/supremecourt/text/22-138

## Summary

The question was what the First Amendment requires the State to prove about a speaker's mental
state before punishing a true threat. The Court held that recklessness suffices and that
something subjective is constitutionally required: "The State must prove in true-threats cases
that the defendant had some understanding of his statements' threatening character." Recklessness
in this setting means the speaker is aware that others could regard the statements as threatening
violence and delivers them anyway, consciously disregarding a substantial and unjustifiable risk
of harm.

The Court reaffirmed that true threats are serious expressions conveying that the speaker means
to commit an act of unlawful violence, and that whether a statement is a threat depends on what
the statement conveys to its recipients, not on the speaker's intent alone. The subjective
element is a floor added to protect speakers from being punished for speech a listener misread.

## Implies for Dialecta

- Breach is not a finding of a true threat and should never be described as one. The tier is
  defined at `docs/Dialecta_Classification_Engine_Specification.md` line 61 as content that
  "targets a person, not an idea", which is an observation about the object of a comment.
  Counterman's true threat is a constitutional category with a mental state element that no
  classifier can assess from text alone, because the speaker's awareness is not in the text.
- The published Breach notice at `docs/Dialecta_Discourse_Layer_UX.md` line 113 reads "Content
  suppressed. Targets a person, not an idea." That sentence is correctly scoped and should not
  drift toward threat language in any future copy revision. "Threatening", "abusive" and
  "harassment" are words with legal contours behind them; "targets a person, not an idea" is the
  platform's own observation and stays inside what the platform can actually know.
- The gap Counterman leaves is the interesting one for this seat. It governs when the State may
  punish. It says nothing about when a private platform may remove or label, and Dialecta is free
  to suppress speech that would never be prosecutable. The freedom to suppress is not a freedom
  to characterise, which is the whole of the tier label question.
- Where the case does bear directly: if Dialecta ever routes a Breach comment to law enforcement,
  Counterman is the standard the report is measured against, and the platform will have made a
  characterisation of a named person to police on the strength of a model's output. That is the
  routing decision the charter says must be made before the first one arrives.
- Not legal advice.

*Filed 2026-09-20*
