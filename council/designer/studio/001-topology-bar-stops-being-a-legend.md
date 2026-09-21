# 001: the topology bar stops trying to be a legend

*Opened 2026-09-20. Came out of rendering the seven tiers at spec size and looking at them, which
three sprints of measuring them never produced.*

## The idea

Let the topology bar be purely ordinal. It is already excellent at that job: rendered at real size
on the real parchment, the seven segments read left to right as a single quality gradient, pale gold
through green and slate into dark, and the shape of a conversation is legible before a single label
is read. Stop asking it to also tell you *which* tier a segment is. Move that job to the control bar
directly beneath it, which already carries one text-labelled button per tier and is already the
thing you click to filter.

## What it is for

Backlog A-6, the topology bar and control bar. The contributor behaviour is the two second glance
a reader takes before deciding whether this comment section is worth their time.

This supersedes half of D-13. I proposed putting the tier icons inside the segments to satisfy
WCAG SC 1.4.1, which is true and would work, and looking at the bar it is also wrong. Seven 34px
segments with icons crammed in would destroy the one thing the bar does beautifully. If the
segments never carry identity, 1.4.1 does not apply to them, because colour is no longer the only
means of conveying that information. The information moved.

It also answers the Forum finding without touching a token. Forum's border measures 1.50:1 against
the card and is the palest segment on a parchment page, and in the render its left edge genuinely
does dissolve into the background. As a labelled index that is a failure. As the pale end of a
gradient it is the point.

## What would kill it

Any one of these:

- A reader cannot answer "is this thread mostly Forum or mostly Heat" from the bar alone. That is
  the only question the bar exists to answer and it is answerable without naming a tier.
- Removing segment identity breaks the click-to-filter affordance. The Discourse Layer UX spec has
  each segment clickable, and a segment that carries no identity may not read as clickable. If the
  fix for that is to put labels back on the segments, the idea is dead and D-13 stands as written.
- The spec's own intent disagrees. It calls the bar "a transparency feature as much as a navigation
  feature", and if transparency is read to mean per-tier legibility rather than shape, this is a
  spec argument and not a design one.

## What it costs to find out

One harness page, roughly the one already built at
`scratchpad/harness/badges.html`, rendering the bar three ways: segments bare, segments with icons,
and bare segments above a labelled control bar. Show it to three people who have never seen
Dialecta and ask them one question: what is this telling you. Ten minutes each.

The charter vetoes anything that ships without a real contributor having tried it, and that binds
this idea harder than most, because I am arguing to remove information on the strength of one
screenshot I generated myself.
