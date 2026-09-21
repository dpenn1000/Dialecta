---
id: 2026-09-21-legal-01
type: handoff
from: legal
to: [convener]
subject: Seven Pact lines the drafted terms would contradict, and the fix proposed for each
backlog: C0-2
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Drafted the terms that sit beside the Pact, at Dan's request: `council/legal/drafts/terms-of-service.md`,
`privacy-notice.md`, `membership-terms.md`, and the cover note `README.md`. The terms reference
the Pact and never restate it, and they govern where the two overlap.

Read the Pact in all three places its text lives, and found seven lines that a signer would read
as saying something the terms, or the build, do not. The Pact is not this seat's to change, so
each goes to the convener here. Line numbers are as of 2026-09-21 and `strings.ts` is moving under
other sessions, so search by text.

| # | Where | The Pact says | Why it cannot stand beside the terms | Proposed fix |
| --- | --- | --- | --- | --- |
| 1 | § I lede and page description: `apps/web/src/strings.ts` 1243 and 1249; `_theme/page-pact.hbs` 1180; `components/dialecta-pact.html` 1006 | "Not terms and conditions. Not rules imposed from above." | Signing the Pact accepts the Terms of Service, so the first sentence becomes false the day the terms exist, and a signer told it isn't a contract has the best argument that it isn't one | Drop both negatives. For example: "A mutual agreement between you and a place that intends to take your thinking seriously. The Terms of Service sit beside it, and signing accepts both." |
| 2 | § VIII commitment: `strings.ts` 1447 to 1455; `page-pact.hbs` 1476 to 1513 | A signature line and a button reading "I Understand · Enter", with no mention of terms | Berman v. Freedom Financial (9th Cir. 2022): a click is assent "only if the user is explicitly advised that the act of clicking will constitute assent", and a link must be set apart by more than an underline | One sentence directly above the signature line: "Signing accepts the Terms of Service. The Privacy Notice explains what Dialecta collects." Style both links in `--brass-deep` or small capitals: the house rule of ink with a brass underline (`apps/web/CLAUDE.md`, designer D-27) is the style Berman found insufficient |
| 3 | § IV body and stage III: `strings.ts` 1321 and 1341; `page-pact.hbs` 1353; `dialecta-pact.html` 1153 | "Every stage is transparent. Every decision is contestable." and "Readers can nominate your post for reclassification ... The system is always contestable." | No nomination route exists (`apps/web/src/components/discourse/feed.tsx` lines 36 and 37), and the fingerprint has no contest path. `philosopher` already ruled the first sentence false as written, and `strings.ts` 1318 records that the change was left to Dan | "Every tier can be questioned." Keep the nomination sentence out until A-7 ships. The terms name the route that exists today: an email to a monitored address, answered within a stated time |
| 4 | § III lede: `strings.ts` 1268; `page-pact.hbs` 1256; `dialecta-pact.html` 1084. Also the Guidebook, `strings.ts` 1495 | "Comments are never hidden." | The terms remove content on narrow grounds a law or someone's safety requires: a valid copyright notice, another person's private information, sexual content involving a minor, a statement that someone will be harmed, an account belonging to a minor. Breach suppression is a kind of hiding too | Narrow it to what is true: "No comment is hidden for what it argues." `voice-editor` owns the words |
| 5 | § III Breach tier: `strings.ts` 1310; `page-pact.hbs` 1315; `dialecta-pact.html` 1143. Also the Guidebook, `strings.ts` 1484 and 1550, and the spec, `docs/Dialecta_Project_Brief.md` line 57 | "Name-calling, slander, targeted personal attacks." | "Slander" is a legal conclusion. A Breach reading beside a named account would then state that the person defamed someone, which is a factual assertion about them and a finding no classifier can make. The terms hold Breach to "targets a person, not an idea" (`council/legal/research/2023-scotus-counterman-v-colorado.md`) | "Name-calling and personal attacks: comments that target a person, not an idea." The spec line is Dan's, so the Pact and the spec move together or not at all |
| 6 | § V wait architecture: `strings.ts` 1351, 1363, 1367; `page-pact.hbs` 1367 to 1375; `dialecta-pact.html` 1195 to 1203 | "You can append to it at any time", a 30 minute comment reflection window, and a 24 hour article reflection window | In `apps/web` a comment is permanent at submission (the comment consent copy in `strings.ts` says it "can't be edited or deleted after this point"), the live database default is 60 minutes (`hardened_at`), no append path exists, and an article can be revised at any time and the revision overwrites (`apps/web/src/app/api/article/route.ts` line 288). A signer is agreeing to a rule, so the Pact has to state the one the code runs | State the rule on the effective date. The timers are backlog A-D2 and Dan's; the terms carry a bracket that drops in whichever he picks |
| 7 | § VI closing: `strings.ts` 1406; `page-pact.hbs` 1404; `dialecta-pact.html` 1231 | "Your private profile tracks which patterns have appeared in your writing over time, not as a score, not as a judgment" | The fingerprint and the Breach residual render on every public profile, and no visibility setting exists yet. Under FTC Act Section 5, which A.R.S. 44-1522(C) imports, a reader's reasonable understanding of "private" is the promise made (`council/legal/research/2026-ftc-privacy-security-guidance.md`) | `philosopher`'s linked disclosure that the fingerprint and the Breach residual exist, placed beside the ADR-004 visibility choice in § VIII |

## Not done

- No Pact text was edited. `voice-editor` owns the wording and Dan owns every promise in it.
- Item 5 touches a spec and waits on Dan.
- The Guidebook's rules list (`strings.ts` 1484 to 1489) presents tier descriptions as rules. The
  terms say writing below the Forum doesn't break them, so the list reads better as the norms the
  tiers respond to. Lower priority than the seven above, and left as a note rather than a row.

## Governing spec

`docs/Dialecta_Project_Brief.md`, section "First Login: The Pact Page": "A single beautifully
designed page, not a wall of terms." The proposals keep it that way: the terms live in their own
document, and the Pact gains one sentence.

## Acceptance

1. No copy of the Pact says it isn't terms and conditions.
2. The sentence in item 2 sits beside the signing act, and its links pass Berman's set-apart test
   on paper and on the dark card.
3. Every present-tense claim in §§ III to VI is true of the build on the day the terms take effect.
4. `python scripts/voice_check.py --strict apps/web/src/strings.ts` passes.

## Traps

- **Do not shorten the teaching to make room.** The seven tiers and the three practice
  classifications are what make the Pact informed consent rather than a formality
  (`council/legal/positions/2026-09-20-consent-waiver-and-the-pact.md`). The terms are drafted on
  the assumption that they stay.
- **The live template is the newer text.** `strings.ts` ports `_theme/page-pact.hbs`, and
  `components/dialecta-pact.html` is older than both. Fix the port and the template; the
  prototype matters only if someone ports from it again.
- **Item 3 is flagged in the code already, deliberately left for Dan.** Changing it is his call on a
  promise, not a copy fix.
- **A link that looks like the house's ordinary link fails Berman.** That is a design question with
  a legal floor, and `designer` should see it before `voice-editor` finishes the sentence.

## Do not touch

- `council/legal/drafts/`: held by `legal` until Dan's decisions drop in.
- `docs/Dialecta_Project_Brief.md`: a spec, Dan's.
