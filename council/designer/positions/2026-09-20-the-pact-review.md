# The Pact, reviewed

## Brief

Reviewed `components/dialecta-pact.html` (1,411 lines, 1,204 live words) against the charter and
Dan's ruling that the Pact does three jobs only, buy-in, legal concerns, self-selection, and links
to mechanism rather than teaching it. The 3-of-14 signature rate is not a conversion problem; it is
evidence the signing pipe does not exist in the shipped app. A section-by-section keep, link, or
cut call follows, with the tier-reading exercise argued explicitly as instructed. Computed defects:
a mobile padding bug that survives the only breakpoint, and a tier palette forked from the design
spec under new variable names rather than drawn from it. Closes with what the visibility control
must be, and the links a shorter Pact now needs.

## Three of fourteen

Not a completion problem. `apps/web/src/app/pact/page.tsx` is an eight-line placeholder: no form,
no commit handler. The prototype's own `commit()` only toggles a div; it calls no endpoint.
Migration `010_pact_agreement.sql` describes a `/pact/` that posts `become_author` to
`/api/profile/[id]`; that route was never built. No path in this repository can set `pact_version`
today. The eleven nulls are not eleven declines; the document that would ask them is not live. Call
it plumbing only if a pipe once carried water. A shorter Pact will not move this number until
`/pact/` ships for real.

## Section by section

II through VIII sit in one unbroken parchment card ("§ II–VIII," per the footer). Cutting content
is the chance to give what survives real breaks, not a rule and a label.

| § | Content | Call | Why |
|---|---|---|---|
| I | Hero | Keep | Framing; no link replaces this |
| II | Why this exists (unmarked) | Keep, trim, link | Buy-in; compress, link the founding essay |
| III | 7 tiers | Cut inline, link | Reference material; one line, then link the glossary |
| IV | 4 stages | Trim, link | Keep the AI-discloses-and-contests line, legal; link the rest |
| V | 5 timers | Cut inline, link | Pure mechanism; keep why waits exist, link the numbers |
| VI | 4 patterns | Trim, link | First paragraph discloses the Archetype; link the taxonomy |
| VII | Tier-reading exercise | Cut from Pact, link | See below |
| VIII | The Commitment | Keep, expand | Gains the visibility choice |

**VII, argued.** Three graded questions with feedback is training, Dan's own word for what does not
belong. The code agrees: the button is gated only by `selectPath()`, never the quiz, so its own line,
"before you commit, try classifying," describes a sequence nothing enforces. Give it its own linked
page and let it be honestly optional.

## What a shorter Pact needs live

The tier glossary (`/guidebook`, already named for this in its own placeholder and in
`docs/Dialecta_Tier_Psychology.md`), the process walkthrough, the wait-time reference, and the
pattern taxonomy. `/guidebook` is itself an eight-line stub today. One build, not four.

## Computed

Most first arrivals are on a phone. Measure is fine, 60ch prose in an 884px column. One defect is
not: the hero's `.parchment-inner` carries an inline `padding-top:96px; padding-bottom:88px` the
only media query, at 768px, cannot touch, so a 380px screen keeps desktop-scaled padding around a
handful of lines. The Pact also forks the spec: every hex in its `:root` matches
`dialecta-design-spec.html` under a renamed variable (`--cream` for `--bg-primary`), and none of
the spec's 28 `--tier-*` tokens reach its own tier icons. Palette-audit fixes will never reach a
page that never asked the spec for a value.

## The visibility control

§ VIII already has the right shape: `pathA`/`pathB` load with neither marked `.selected`, and the
button stays disabled until one is clicked. Reuse that for visibility, a third card pair, not a checkbox, no
default, with its own reversal promise (`path-note` already lets the reflection choice change per
post; give visibility the same line). Anchor it at § VI, where the Archetype is first described,
not appended after the Path cards as an unrelated third item. Gate the button on it separately, so
one click cannot stand for three consents at once.
