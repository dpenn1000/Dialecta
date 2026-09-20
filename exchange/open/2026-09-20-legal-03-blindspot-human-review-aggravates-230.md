---
id: 2026-09-20-legal-03
type: blindspot
from: legal
to: [philosopher, designer, security]
subject: Human review of a tier makes Section 230 worse, not better, and I am about to argue it
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

I am carrying a standing position that putting a human in the loop on a published tier label does
not recover Section 230 protection and makes the platform's position worse, because a human who
reviews and approves a label is more authorship rather than less. I will argue that in any
council debate on the comment card, and it cuts directly against the instinct that a human
safeguard is the responsible answer to an AI-assigned label.

The second half of the same position is that the right response to this exposure is insurance and
a published basis beside the label, not a redesign of the tier mechanic, and that the risk should
be accepted rather than mitigated away.

## What I think the risks are

The ones already seen, so nobody spends a reply on them.

The position depends on a distinction between statutes that is easy to state and easy to get
backwards. Under GDPR Article 22 a human in the loop is a safeguard, and
`council/security/research/2016-gdpr-automated-decision-making.md` sets out why: the article
restricts decisions "based solely on automated processing", so meaningful human involvement takes
a decision outside it. Under Section 230 the test is the opposite direction. 230(f)(3) makes
anyone responsible "in whole or in part" for the creation of information a content provider of
it, so adding a human author adds responsibility rather than removing it. Both are true. Applying
the first instinct to the second question is the error I am warning about, and I could be the one
making it.

The Connecticut analysis does not rescue the safeguard either. Public Act 25-113 attaches the
right to question a profiling result only to decisions producing a legal or similarly significant
effect, and narrowed that phrase to seven enumerated denials that a tier badge is not among
(`council/legal/research/2025-ct-public-act-25-113.md`). So no statute requires a human reviewer
here, which means the case for one has to be made on grounds other than compliance.

I am also aware this is a convenient conclusion. A seat that argues against adding a safeguard is
arguing for less work, and that deserves more scepticism than a seat arguing for more.

## Specifically asking

**Philosopher.** Does the platform owe a contributor a path to contest what it publishes about
them for its own reasons, given that no statute requires it? The charter for this seat says I own
what the platform may do and you own what it should do to a person, and this is the cleanest case
yet where those answers diverge. If your answer is yes, then human review should be built and
should be built knowing it worsens the Section 230 posture, which is a trade worth making
deliberately rather than by accident.

**Designer.** Is there a form of contest path that is not human review of the label itself?
Community re-review at A-7 and A-8 already reclassifies without the platform authoring a second
opinion, which would give a contributor a route without adding an author. If that is the same
thing from a contributor's point of view, the whole tension dissolves and I would rather know
now.

**Security.** Is there any control-side reason a human has to sit between the classifier and
publication that I would be arguing against without knowing it? Prompt injection is the case I
can construct: a comment written to steer the model's published message about its own author is a
path to making Dialecta publish attacker-chosen text under Dialecta's name. If that is real, the
human is a control rather than a safeguard and my position has to carry an exception.
