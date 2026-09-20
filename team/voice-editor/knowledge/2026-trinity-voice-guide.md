# What v1.2 inherited from the Trinity guide and what it added

## Citation

`_meta/voice/Voice-Guide.md` in the Trinity Platform repo, resolved at
`C:\Users\dan\OneDrive - Trinity Solar\Apps\_meta\voice\Voice-Guide.md` (17,442 bytes), read
2026-09-19. Path 1 of the four the `voice` skill lists at
`C:\Users\dan\.claude\skills\voice\SKILL.md`. Compared against
`docs/Dialecta_Editorial_Voice.md` v1.2, including its changelog at line 373.

## Summary

The source exists and the descent claim holds. v1.2's changelog says it adopted the essence,
the character calibration, the per-sentence test, the killers, the hard rules, the speaker and
audience tables, and the last-pass checklist. All seven are present upstream.

| Trinity section | In v1.2 |
| --- | --- |
| The essence | Adopted, reworded for a contributor |
| The character | Adopted |
| Speaker and audience | Adopted, both tables rebuilt |
| How to write it | Adopted, header shortened |
| The test that decides every sentence | Adopted |
| The killers | Adopted, extended |
| Hard rules | Adopted, extended |
| By context | Not taken |
| The Hook | Corresponds to "The last pass" |
| Appendix: the full catalog | Not taken |
| Where this lives | Not taken |

### Three deltas worth holding

1. **Calibration gained a seventh pair.** Trinity line 11 ends at "human over polished." v1.2
   adds "observational over evaluative," then spends its longest section on that one pair. The
   addition is the whole Dialecta argument compressed into three words.
2. **"Name the mechanism" was promoted.** Upstream it sits inside the Personified artifacts
   killer, at line 70. v1.2 lifts it into Hard rules and attaches a reason Trinity has no need
   for: a reader who cannot see how a tier was reached cannot contest it.
3. **The "reads as" construction has no upstream parent.** Neither does the observational
   versus evaluative section, the Growth Frame Doctrine, the commenter message principles and
   their per-tier reference table, the Growth Layer coaching principles, the Philosophical Quote
   Principle, or the Seed Library. Those are Dialecta's, written for a platform that addresses
   a stranger about something they just wrote.

v1.2 also applied its own header rule to what it inherited. Trinity's "How to write it" carries
a parenthetical explainer upstream and lost it on the way in.

### The checkers diverged too

Both repos ship `scripts/voice_check.py`. The upstream one strips front matter, inline code,
URLs and npm flags before matching, skips any file carrying `voice-check: ignore-file`
(`_OPT_OUT`, line 105), and recognises a killer's quoted specimen. This repo's port has none of
that. The marker still appears at line 2 of `docs/Dialecta_Editorial_Voice.md`, copied across
and inert. See [[2026-dialecta-voice-check-gate]].

## Implies

- **Do not merge the two guides.** v1.2 line 368 says they are kept separate so they can drift,
  and they already have. A change upstream is not a change here.
- **When a rule here looks arbitrary, check upstream before rewriting it.** Most of the killers
  were written for memos and carried over intact. The reasons attached to them in v1.2 are the
  Dialecta-specific half.
- **The port is the place to look for gate defects**, since the upstream script solves problems
  this one still has. Porting `_OPT_OUT` and the strip helpers changes no rule.
- **Practice added:** an inherited rule and a Dialecta rule carry the same force, and only the
  Dialecta ones can be argued from the platform's thesis.

## Leads this raised

- Trinity's "Appendix: the full catalog" was not taken. Worth reading once to see whether
  anything in it belongs on a platform surface.
- The `voice` skill lists four fallback paths and says to tell the user the skill is unavailable
  if none resolve. Only path 1 resolves on this machine.
