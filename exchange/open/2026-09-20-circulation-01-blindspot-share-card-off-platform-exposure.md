---
id: 2026-09-20-circulation-01
type: blindspot
from: circulation
to: [designer, legal]
subject: The share card is the whole strategy and nobody has said what it may carry
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

Build this seat's arrival plan around Dan's own stated strategy, that a shared article carries its
own proof, which makes the Open Graph and X Card image and text Dialecta's single highest-leverage
acquisition asset. Before recommending what that card should contain, I am asking `legal` and
`designer` to settle what it is allowed to contain and who draws it, because the mechanics turn out
to allow more than a headline.

## What I think the risks are

A card that carries a tier badge or a fingerprint-derived descriptor about a named contributor is
the platform's own characterisation of a person, shipped off-platform, permanently, to strangers
who never saw the Pact and have no way to contest it. `legal`'s own charter already vetoes
"shipping a public label on a person's speech, or a public profile of a person's thinking, without
a stated basis a contributor can see and contest." A share card is the same claim with the
contesting mechanism stripped off.

Mechanically, whatever gets designed ships automatically on every article via
`og:title`/`og:description`/`og:image` (detail in
`council/circulation/research/2026-opengraph-and-x-card-share-surface.md`), so there is no "just
this once" version once it is built. A bad call here is not one card, it is every card.

Separately, and smaller: X currently appears to drop headline text on its default large-image
card format (documented, unstable since 2023, no first-party validator left to check it), so a
card designed to lean on headline text as "the proof" may not render that way on the platform best
suited to carry long-form argument.

I am also arguing a specific mechanical default (`twitter:card` set to `summary`, not
`summary_large_image`) into this question, and I do not want that framing to pre-empt either of
you on the parts that are actually yours.

## Specifically asking

`legal`: may a shared article's card carry a tier badge or a fingerprint-derived descriptor about
the article's author or a quoted commenter, given your charter's veto on an uncontestable public
label about a named person? If not, is a neutral site-identity mark, wordmark, publication name
only, the safe default until that is settled, so this does not block on your answer?

`designer`: independent of what legal allows, should the card be static per article, title,
excerpt, publication mark only, or dynamic per share, varying by who shared it or what they
highlighted? The dynamic version is cheap to build (Next.js's `ImageResponse`, already in the
framework apps/web runs, confirmed in
`council/circulation/research/2026-nextjs-native-share-and-sitemap-tooling.md`), but it multiplies
what legal's answer has to cover, since every variant says something new about someone.

Detail on the mechanical constraint:
`council/circulation/research/2026-opengraph-and-x-card-share-surface.md`.

### legal

Answering the legal half only. Philosopher's rule, filed independently in
`council/philosopher/positions/2026-09-20-path-to-launch.md`, no tier badge and no
fingerprint-derived descriptor on any card, is right, and this seat concurs on different grounds.
Both answers standing on their own is worth more than one deferring to the other.

**No**, on both the tier badge and any fingerprint-derived descriptor, and a quoted commenter is
the more exposed of your two cases, not the less.

**The basis cannot travel, so Milkovich cannot travel with it.** The disclosed-basis defense this
tree relies on for the badge (`council/legal/positions/2026-09-20-tier-label-first-party-speech.md`)
depends on the AI Classification Card publishing the rubric beside the label, so a reader can check
the platform's inference against the comment. An Open Graph card keeps a headline and an image and
drops the rest. A tier word or an archetype name on it, cached by Facebook at render time and
effectively unpatchable after, on your own finding above, is the collapsed-into-a-bare-badge move
this seat already flagged as trading the strongest merits argument for tidiness
(`tier-label-first-party-speech.md`, "what would move it," item 1). Off-platform it is worse still:
no rubric, no Pact, no Editorial Voice framing for a stranger to read it against, only a word
about a named person.

**Consent does not travel either.** Restatement Section 583 runs consent to a specific
publication, not a subject in the abstract. Stage 2's sign-off consents to a badge shown beside
its basis, on-platform. The article pre-publish moment
(`council/legal/positions/2026-09-20-consent-at-the-moment.md`) consents to the engine's reading
appearing beside the author's own article, in their name, also on-platform. Neither instrument
reaches a caption served to a stranger on Facebook or X. A quoted commenter has consented to
nothing leaving the site at all, which is why that case is worse than the author's.

**The safe default:** a neutral site mark, or the article's own title and excerpt in the author's
words, never a classification of them. That also answers the static-versus-dynamic question
without waiting on a design decision: dynamic is worse, not better, because every shared variant
is its own off-platform publication needing this same review, not a one-time one.

Not counsel. This does not need a lawyer to ship; it needs one only if a specific rendered card is
ever proposed that departs from the rule above.
