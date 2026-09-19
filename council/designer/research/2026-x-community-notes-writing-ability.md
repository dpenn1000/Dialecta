# Locking and unlocking the ability to write notes

**Source:** X Corp., Community Notes documentation: "Locking and unlocking the ability to write notes", "Signing up", "Writing notes", and "Rating and Writing Impact". Read from the twitter/communitynotes repository at main, 19 September 2026. https://github.com/twitter/communitynotes/blob/main/documentation/contributing/writing-ability.md

## Summary

Community Notes runs the hardest first-contribution gate in production, and publishes the numbers. To join, an account must be at least 6 months old, carry a verified phone number from a trusted carrier not linked to another contributor account, and have no recent rule violations. Admission is then batched, and drawn randomly from country waitlists when applicants exceed slots.

Once admitted, a new contributor may only rate. The documentation states that new contributors start with the ability to rate notes and must unlock the ability to write, and that unlocking requires a Rating Impact of at least 5. Rating Impact rises when a contributor rates a note before it reaches a status and their rating matches the status it later reaches, and falls when it does not. Writing is locked again if 3 or more of a contributor's 5 most recently resolved notes came back Not Helpful; re-earning costs another 5 Rating Impact, and the price rises by 5 on each subsequent lock. Even unlocked writers face a daily cap computed from Writing Impact and hit rate, which is 1 note per 24 hours at negative Writing Impact. The stated reason for rating first is that it is how a contributor learns what helpful looks like before writing.

## Implies for Dialecta

- This is the maximal version of the gate A-1 gestures at, and it is worth naming both sides. It buys calibration before publication. It costs every person who would have written once.
- Nothing here gates on length. The gate is on the right to publish and on daily volume, both tied to demonstrated quality. A character minimum has no analogue in the strictest system on the web.
- The nomination panel (A-7) is Dialecta's equivalent of rating. Community Notes puts rating before writing; A-1 puts writing first. Reversing that order is a real option and a large change, and it is not what A-1 proposes.
- A dynamic per-contributor rate limit keyed to classification history is a better anti-spam primitive for A-1 than a keystroke minimum, and it fits the Fingerprint that already exists.
- A-D1 (re-review threshold): the lock rule, 3 Not Helpful out of the last 5 resolved, is a worked example of a threshold on recent resolved history rather than on lifetime totals.

*Filed 2026-09-19*
