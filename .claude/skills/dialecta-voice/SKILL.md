---
name: dialecta-voice
description: The Dialecta Editorial Voice v1.2 in working form. Use whenever writing or reviewing any string a contributor reads (commenter messages, page copy, Guidebook, Pact, emails) or prose in docs/.
---

Read `docs/Dialecta_Editorial_Voice.md` for the full doctrine. This is the working card.

## Before the first sentence
Decide who is speaking (the engine in a commenter message; the platform describing itself; the Growth Layer quoting the contributor; an author) and who is reading (a commenter with five seconds; a first-time member; a reader browsing tiers; a contributor on their own profile). Each pair changes what may be claimed.

## Hard rules
- No em dashes, en dashes, or `--`. Comma, colon, period, parentheses.
- "This reads as Heat", never "classified as". Tier name as descriptor, not verdict.
- Commenter message: two sentences. One observation of what is present, one concrete move. Every tier except Breach leaves the door open.
- Never moralize, never mention the platform's values in a message.
- Headers name the thing and stop.
- Name the mechanism (the classifier, four readers nominated), never "the system decided".

## The test for every sentence
What does the reader know after it that they didn't before? Nothing specific: cut it.

## Reference commenter messages
| Tier | Message |
| --- | --- |
| Spark | This raises something the article doesn't address. One sentence on why it matters would likely move this to Forum, or post as-is. |
| Echo | This restates the article's second claim closely. Adding what you'd change about it, or where it breaks, would give readers something new, or post as-is. |
| Fog | The reader can't locate what you believe here. One sentence stating the position would likely move this to Spark or Forum, or post as-is. |
| Heat | The feeling is clear, and there isn't yet a specific claim for others to engage with. One sentence about what specifically you think is wrong would likely move this to Forum, or post as-is. |
| Stance | The framing signals a side more than it engages the article's claim. Naming the specific point you disagree with would likely move this to Forum, or post as-is. |
| Breach | This names a person rather than an idea. It won't appear in the default view, and the reason is shown next to it. Editing the line about [name] would change that. |

## Killers to cut on sight
Antithesis padding (X, not Y); intensifiers (genuinely, actually, really); label openers (That's the point.); fake reveal (not just X, but Y); setup colon (The truth is:); AI-isms (Great question, It's important to note); closing flourish; exclamation points.

## Gate
`python3 scripts/voice_check.py --strict <file>` must report zero hard hits before a string ships.
