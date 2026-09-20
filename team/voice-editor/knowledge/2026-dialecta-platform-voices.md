# The four platform voices and the surface each one speaks on

## Citation

`docs/Dialecta_Editorial_Voice.md` v1.2, sections "Speaker and audience" (lines 34 to 57) and
"Commenter Message Design Principles" (lines 157 to 188), read 2026-09-19 at commit `060dede`.
Surfaces cross-checked against the repo the same day.

## Summary

Four speakers, five readers. The mandate says settle both before editing a sentence, so the
table belongs here rather than in a lookup each time.

| Speaker | May say | May not say |
| --- | --- | --- |
| The engine, in a commenter message | What is present in this comment, and one move that would change its read | Anything about the contributor as a person; anything about the platform's values |
| The platform describing itself | The mechanics, how a tier is assigned, what a reader can contest | Promises about outcomes |
| The Growth Layer, in a coaching prompt | The contributor's own past words, quoted verbatim, and one bounded exercise | New aspirations the contributor never stated |
| An author, in an article | Their claims, in their own voice | Nothing is restricted; the Editorial Template protects the author's voice |

Readers, and what each can carry: a commenter at the friction moment (one observation, one
suggestion, the open door); a first-time member on the Pact page (mechanics in plain words, one
example per tier); a reader browsing tiers (the tier name as descriptor, the plain reason);
a contributor viewing their own profile (what their comments have done over time, described);
a contributor in the Growth Layer (their own aspiration, one exercise completable now).

### Which speaker owns which file

| Speaker | Surfaces in this repo |
| --- | --- |
| The engine | `packages/core/src/classification.ts` (the prompt), `api/classify.js`, `api/comment.js`, `apps/web/src/strings.ts` `commenterMessages` |
| The platform | `components/dialecta-pact.html`, `components/dialecta-guidebook.html`, `apps/web` `/pact` and `/guidebook`, `strings.ts` `site` and `notices` |
| The Growth Layer | `components/dialecta-growth-scroll*`, governed by `docs/Dialecta_Growth_Layer_Principles.md`. No live code surface yet |
| An author | `docs/articles/`, the `articles` table, the editor at backlog A-10 |

The engine speaks through four files and only one of them is gated. See
[[2026-dialecta-voice-check-gate]].

### The distinction that does the work

The engine may not say anything about the platform's values. The platform may not promise
outcomes. Both restrictions point the same way: the contributor is told what is in front of
them and left to decide. A message that reaches for either forbidden register reads as a
verdict, which is the failure v1.2 spends its longest section on.

Tier below Forum carries a fixed shape: two sentences, one observation then one move, and the
door open in every tier except Breach. Breach is the single case where the door closes, and
even there the message names the edit that would reopen it.

## Implies

- **Before editing any string, name the speaker from the table above and the file it lives in.**
  A commenter message and a Pact paragraph fail in opposite directions, so the same edit cannot
  serve both.
- **`strings.ts` `commenterMessages` is the yardstick.** Its header says the six messages are
  copied verbatim from v1.2 and act as the fallback when the classifier's own message fails
  validation. Any engine rewrite is measured against those six.
- **The Growth Layer has no code surface yet**, so its coaching rules are unexercised. The first
  Growth Layer string written in this repo is the moment to check them, not before.
- **Practice confirmed:** decide the speaker and the reader before editing a sentence.

## Leads this raised

- `strings.ts` calls the six messages a fallback "when the classifier's own message fails
  validation". `parseClassification` in `packages/core/src/classification.ts` checks that
  `commenter_message` is a non-empty string and nothing else. No voice validation exists. Either
  the comment overstates the code or the validator is unwritten.
- The Breach message in v1.2 and in `strings.ts` carries a `[name]` placeholder with no
  substitution code anywhere. Worth tracing before the classification card ships (backlog A-3).
