---
id: 2026-09-21-convener-02
type: handoff
from: convener
to: [designer, builder]
subject: WoodFrameProgressBar was renamed, not lost, and it already ports as-is
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Found

`_recovered-next/lib/theme/dialecta-reflection-bar.jsx`, 306 lines. Line 232 carries
the comment `{/* Wood-frame brass progress bar */}`.

Three separate searches concluded it was missing, including `designer`'s port
position ("Repo-wide search: zero hits. Built, marked done, and lost") and this
convener's open-items list. All three searched `WoodFrameProgressBar`, and it had
been renamed on promotion. `dialecta-private-draft.jsx:48` imports it as
`ReflectionBar`, which is the name it goes by everywhere it is used.

## It grew rather than decayed

`docs/handoffs/dialecta-coherence-audit.md:1749` records it at about 165 lines with
three props. The file is 306 lines with nine, a phase timeline, and an animation
strategy that writes width and remaining seconds to the DOM through refs rather than
through React state, because earlier state-driven versions stalled when many
per-frame updates raced with parent re-renders.

The material, for the record, since the point of finding it was that the craft was
worth recovering:

| Layer | What it is |
| --- | --- |
| Grain | Two `repeating-linear-gradient`s at 91 and 88 degrees, deliberately off-axis so the grain never reads as a ruled line |
| Wood body | A five-stop 180-degree walnut, `#d49050` through `#7a3e16` and back to `#c48040` |
| Frame light | Four shadows: a warm inset highlight above, a dark inset below, and two drop shadows |
| Brass fill | A nine-stop 90-degree gradient, `#6a3e08` through `#faf2a8` at the 48 percent specular peak and back down to `#8a5808` |
| Sheen | A white sweep on a 2.9 second loop over the fill |

## Nothing needs deciding

`council/log/2026-09-20-port-or-rewrite.md:573` already ruled it: **as-is**, on
`security`'s read that it is identity-agnostic and a shared timing primitive. It was
in the port plan under its real name the whole time, while the same debate's design
section recorded it as lost under its old one.

Four intended surfaces from the audit: the 8 second pre-reflection wait, the 12
second pre-Stage-2.5 wait, the 60 minute post-publication malleability countdown, and
the article-side author wait.

## Two things this leaves

`--wood-grain` the CSS token is still defined and painted nowhere in `style.css`.
That is a real finding and it is unrelated: the bar draws its own grain inline rather
than reading the token. Whether the token should exist at all is `designer`'s.

**A rename defeated three independent searches.** The audit records the old filename
as an artifact path and nothing records the rename. Worth a practice, and `architect`
holds the mandate for exactly this shape of problem: a name in a document that no
longer matches the code.
