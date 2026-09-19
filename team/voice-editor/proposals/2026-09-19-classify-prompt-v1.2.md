# Proposal: bring the classification prompt to Editorial Voice v1.2

**Status:** proposed, not applied. Needs its own commit and Dan's call.
**Author:** voice-editor, 2026-09-19.
**Touches:** `api/classify.js`, `api/comment.js`. No file was edited to write this.

Two notation points. Where a sample has to show an em dash, this file writes `[EM]`, because
this repo's checker has no opt-out marker and a literal one would fail the gate. Sample outputs
below are modeled, not captured from the live endpoint: see "How to verify" at the end.

## What is wrong

`api/classify.js` line 20 holds the system prompt. It predates v1.2 and carries 16 hard hits
(14 em dashes, 2 en dashes). Four problems, in order of what a contributor would notice.

**1. Every sub-Forum message is missing the open door.** Root `CLAUDE.md` lists "every message
below Breach ends with the door open" among the locked non-negotiables. The prompt never asks
for it, and its own worked example at line 47 ends without one. This is the failure that
changes what the friction moment means: v1.2 calls the friction reflective and never a lock,
and a message with no door reads as a gate.

**2. The worked example teaches the banned pattern.** Line 47 shows the model a message whose
label separator is an em dash. v1.2 line 112 names that exact construction as the one to watch.
The prompt is not merely permitting em dashes in live output; it is demonstrating them as house
style.

**3. "1-2 sentences maximum" contradicts the two-sentence rule.** v1.2 requires two: one
observation, one move. A one-sentence message drops one of them.

**4. Dashes throughout the tier table and the specificity scale.** Lines 24 to 30 and 34 to 37
use an em dash as a label separator, line 41 uses one as a pause, lines 45 and 65 use en dashes.

### Two things the brief did not say

**The prompt has three copies, and `classify.js` is the quiet one.**

| Copy | Hard hits | Role |
| --- | --- | --- |
| `api/classify.js` line 20 | 16 | Standalone endpoint |
| `api/comment.js` line 44 | 19 | **The hot path.** Classifies, writes both rows, returns the message to the client |
| `packages/core/src/classification.ts` line 170 | 0 | Rewritten to v1.2, versioned, under test |

Patching `classify.js` alone fixes the endpoint the comment flow does not call. Line 42 of
`comment.js` says "Keep the two prompts in sync"; they are already out of sync in four places.

**The replacement is already written.** `packages/core/src/classification.ts` carries the v1.2
prompt, `CLASSIFIER_PROMPT_VERSION = '2026-09-19.1'`, a `buildSystemPrompt()` export, a
`parseClassification()` validator, and a test asserting the prompt holds no em or en dashes.
Backlog A-2 says the replacement classification job calls `buildSystemPrompt()`. This proposal
is therefore about adoption, not authorship.

## The proposed change

Replace the `SYSTEM_PROMPT` string in `api/classify.js` and the `CLASSIFY_SYSTEM_PROMPT` string
in `api/comment.js` with the text `buildSystemPrompt()` returns, verbatim, and add a one-line
header comment naming `packages/core/src/classification.ts` as the source.

`api/` cannot import `@dialecta/core` without a build step for the Vercel functions, so the text
is copied rather than imported. That is the real cost of this option and the reason to prefer
retiring these files over maintaining them.

The two sections that change in substance:

```
## COMMENTER MESSAGE TONE

Write observationally, never evaluatively. Describe what the comment does; do not judge the person.
Name what is present before what is missing. Start from what exists in the comment.
Exactly two sentences: the first is one observation, the second is one concrete move the commenter could make in thirty seconds.
Use the tier name as a descriptor: "This reads as Heat". Never "classified as" or "has been classified".
Never moralize. No appeals to the platform's values, no reminders of what Dialecta is for.
Every tier except breach ends with the door open. "Or post as-is" may be implied by the interface, so you may leave it off, but nothing in the message may close the door.
For forum, the second sentence names what the comment does well or where it could go further, and the door stays open.
No em dashes, no en dashes, and no exclamation points anywhere in the message.
```

and the JSON contract line, which becomes `"commenter_message": "Two sentence message shown to
the commenter."` The tier keys, the specificity domain, and every other field are unchanged,
so nothing downstream of `parseClassification` moves.

## Sample output, before and after

Article: `docs/articles/Social_Media__Human_Behavior__and_the_Rewiring_of_Society.md`.
Comments written to look like real ones. Before messages follow the current prompt's own worked
example and its "1-2 sentences maximum" instruction. After messages follow the v1.2 reference
table at lines 183 to 188, which `apps/web/src/strings.ts` already carries verbatim.

### 1. Heat

> This is exactly the kind of hand-wringing that makes me tune out. Every generation panics
> about new media and every generation turns out to be wrong. Grow up.

**Before:** "This reads as Heat `[EM]` the feeling is clear but there isn't a specific claim for
others to engage with. Adding one sentence about what specifically you think is wrong would
likely move this to Forum."

**After:** "The feeling is clear, and there isn't yet a specific claim for others to engage
with. One sentence about what specifically you think is wrong would likely move this to Forum,
or post as-is."

*Changed:* the em dash goes, the tier label stops opening the sentence, and the door appears.

### 2. Fog

> I mean, yes and no? There's something to this but also the opposite is true in some ways.
> Depends what you mean by rewiring I guess.

**Before:** "This reads as Fog `[EM]` the comment doesn't clearly identify what the commenter
believes. Consider stating your position more directly."

**After:** "The reader can't locate what you believe here. One sentence stating the position
would likely move this to Spark or Forum, or post as-is."

*Changed:* "Consider stating your position more directly" is directive prose and names what is
missing. The replacement names the effect on the reader and gives one bounded move.

### 3. Stance

> Classic tech-bro apologia. Of course a Silicon Valley guy says the problem is individual
> willpower and not the business model.

**Before:** "This reads as Stance `[EM]` the comment relies on tribal framing rather than
engaging with the article's argument. Try addressing the specific claim instead."

**After:** "The framing signals a side more than it engages the article's claim. Naming the
specific point you disagree with would likely move this to Forum, or post as-is."

*Changed:* "tribal" is the adjective standing in for its evidence, which v1.2 names directly in
its second writing move. The replacement says what the framing does.

### 4. Forum

> The attention-economics framing in paragraph four skips the ad-market data. ARPU rose through
> 2018 to 2021 while average session length fell, which cuts against the claim that engagement
> time is what gets optimized.

**Before:** "This reads as Forum `[EM]` a specific, well-supported claim that engages directly
with the article's argument. Strong work."

**After:** "This answers paragraph four with a figure the article doesn't address. Naming where
the ARPU numbers come from would let readers check them."

*Changed:* "Strong work" is a verdict on the contributor, which is the single distinction v1.2
spends its longest section on. The current prompt gives the model no Forum guidance at all, so
praise is the default it falls into. The core prompt's line on Forum is what closes this.

### 5. Breach

> Rosen has been peddling this nonsense for a decade. He's a fraud and everyone in the field
> knows it.

**Before:** "This reads as Breach `[EM]` the comment attacks the author personally rather than
engaging the idea. Please revise before posting."

**After:** "This names a person rather than an idea. It won't appear in the default view, and
the reason is shown next to it. Editing the line about Rosen would change that."

*Changed:* "Please revise before posting" both moralizes and closes the door without saying what
happens. Breach is the one tier that holds the post, so the message owes the contributor the
mechanism and the specific edit that reopens it. Three sentences here matches the v1.2
reference message, which is the documented exception to the two-sentence cap.

## Where the change lands

Root `CLAUDE.md` records that `dialecta.vercel.app` serves a 2026-05-08 build from a different
repo, `dpenn1000/dialecta-api` at commit `53364fa`, verified against the Vercel API on
2026-09-19. **So editing these two files changes nothing a contributor sees today.** The change
lands when backlog P0-3 repoints the Vercel project. The copy in `dialecta-api` carries the same
prompt and needs the same edit, or the same retirement.

That cuts both ways, and the sequencing is the decision:

| If | Then |
| --- | --- |
| P0-3 repoints production before A-2 lands | These two files become live and should already be fixed |
| A-2 lands first | `api/` is replaced by the core prompt and this patch was wasted work |

**Recommendation: apply it anyway.** The patch is a string replacement with no logic change,
and the asymmetry is plain. Being wrong one way costs ten minutes of work that gets deleted.
Being wrong the other way ships em dashes and door-less messages to real contributors at the
highest-stakes writing surface on the platform.

The longer-term answer is option C below, and backlog A-2 and A-3 already take that road.

## Options

| Option | What it does | Cost | Risk |
| --- | --- | --- | --- |
| **A (recommended)** | Copy `buildSystemPrompt()` text into both `api/` files verbatim | Ten minutes. Adds a fourth place the text lives until `api/` retires | Message wording changes; no contract change |
| B | Patch only the dashes in `classify.js` | Five minutes | Leaves the hot path, the missing door, and the sentence cap. Fixes the symptom the gate would catch and none of the ones it would not |
| C | Stop generating prose in `api/`; return tier and fields, render the message from `strings.ts` | A contract change and a client change | Removes the drift class permanently. `strings.ts` is gated by CI, a generated message never can be. This is where A-2 and A-3 already point |

Option B is the one to avoid. It would leave a green-looking file whose live output still
breaks a locked decision.

## How to verify

I could not call the endpoint from this session, so the samples above are modeled rather than
captured. Before shipping, run the five comments through the live endpoint with the old prompt
and again with the new one, and compare `commenter_message` on each. The check that matters:

1. No em dash, en dash, or exclamation point in any returned message.
2. Exactly two sentences for spark, echo, fog, heat and stance.
3. The door present in all five of those, absent in breach.
4. No sentence that renders a verdict on the contributor.
5. `ai_suggested_tier` unchanged across the five, which shows the rewrite moved the prose and
   not the classification.

Items 1 through 3 are mechanical and belong in a test beside
`packages/core/test/classification.test.ts`. Items 4 and 5 need a read.

Bump `CLASSIFIER_PROMPT_VERSION` if the copied text diverges from core at any point, so
`classifications.prompt_version` stays honest.

## What this proposal does not do

- It does not touch `docs/`. `guard-docs.mjs` blocks specs, and nothing here needs a spec change.
- It does not edit `api/`. The change is described, not applied.
- It does not resolve v1.2 line 364, which says the prompt "should defer to this document rather
  than restate it." All three copies restate it. Filed as a lead.
