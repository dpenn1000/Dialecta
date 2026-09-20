# Visibility control: exposure, consent, and the Breach residual

*`legal` position, 2026-09-20, in answer to ADR-004's visibility decision. Not counsel. Nothing
here is legal advice. Every claim names its state or circuit.*

## Brief

Dan's setting helps one defense, is irrelevant to a second, and can't reach a third. It
strengthens Restatement 583 consent on audience scope, if shown at the moment of choice
(Arizona's own adoption of 583 is unconfirmed). It doesn't touch the Roommates.com
material-contribution test (9th Cir.): a volume knob on platform-authored content doesn't change
who authored it. It can't cure Milkovich's disclosed-basis defense for the Breach residual (Ariz.,
via Turner v. Devlin): a smaller audience still isn't shown the suppressed comment. None of this
ships today. The RLS it depends on grants anonymous read on every archetype row regardless of the
stored value, and a public default for an uncontestable artifact is the weakest fact here.

## 1. Exposure, in two directions

Two bodies of law, two answers. Against Roommates.com (9th Cir.): no change. The co-developer test
asks who built the categories and ran the classifier, not who controls distribution afterward.
Against ordinary publication exposure (Ariz.): narrowing a subject's own audience helps, a cleaner
fit with Section 583's "particular people" limit. But against the gate this seat and `philosopher`
proposed, a public default is worse: it puts the Archetype before strangers with no contest path
built, the fact Milkovich reads worst.

## 2. What the setting cures

Partially. Section 583 runs consent to a publication, audience included, judged by its
circumstances. An affirmative choice of "public" or "connections only," shown against the actual
rendered card, is consent to that audience in a way sign-up consent never reached. It doesn't
reach a separate problem: consent to an audience isn't consent to accuracy. Agreeing who may see a
characterization isn't agreeing it's right, and the Archetype still has no contest path. The
setting fixes who. It can't fix whether the label is true.

## 3. The Breach residual

Harder, and the analysis changes. A tier badge sits beside its own disclosed basis, Milkovich's
survival condition. The residual aggregates Breach classifications, published with the text
withheld, into a permanent mark closer to the checkable statement Turner v. Devlin's "average
reader" test (Ariz.) reads hardest against: not "reads oddly," but "attacked people." It changes
headcount, not disclosure, and Milkovich's danger is what a viewer can check. The disclosure shown
at the moment of choice must name the residual, not let it ride under "archetype." Whether it's
provable as false under Turner belongs with the Arizona opinion-privilege read already flagged as
worth an hour, as the artifact to examine first.

## 4. Before this ships

| Needed | Why |
|---|---|
| A real predicate policy, not a preference | `archetypes` carries `USING (true)`, full anon SELECT, no column narrowing (`security`, 2026-09-20). Unenforced is worse than none. |
| A moment-of-choice disclosure naming the residual | "Your archetype" isn't notice that a conduct record ships inside it. |
| A record of what was shown, and when | Otherwise nobody can prove a year later what the person agreed to. |
| A narrow factory default | Public-as-shipped repeats the exposure the gate was meant to avoid; self-visible-until-chosen doesn't. |

A public default isn't defensible as the resting state of an artifact nobody can contest. It's
defensible as a choice a person makes after seeing what it means.

## 5. Recommendation

Build the settings as decided. An audience control belonging to the person described, not a
platform gate, is the right instinct. Change two things first: ship every level but self-visible
disabled until the predicate policy exists, so no setting lies about what it does, and ship the
factory default at self-visible, not public, so a public archetype is always chosen after seeing
the rendered card, residual included, rather than inherited by inertia. That keeps Dan's design
and removes the one fact that would still read badly in front of a jury: publishing about a person
before giving them a way to answer back.
