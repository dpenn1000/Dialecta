# Tier Psychology v1.1: the naming rationale, and a locked/provisional mismatch on two names

**Source:** `docs/Dialecta_Tier_Psychology.md`, version 1.1, April 2026. Cross-checked against
root `CLAUDE.md` "Locked decisions." Read 2026-09-20.

## Summary

This is the spec the mandate's canonical tier-name list has always pointed at without ever citing
directly; `brief.md` flagged it as the single most likely subject of a question with no filed note
covering it. It answers why the seven tiers are named what they are, not how the engine classifies
(that is `Dialecta_Classification_Engine_Specification.md`, filed separately this sprint).

**The foundational insight** is the same source thesis as `Dialecta_Founding_Philosophy.md`:
environment shapes behavior more than stated values, so tier names are behavioral nudges, not
labels. **Three naming principles** govern every name: describe the comment, not the person;
observe, don't evaluate; carry its own definition without needing the guidebook.

Each of the seven tiers gets its classification criteria (restated from the Classification Engine
spec), what the name communicates, its psychological intent, why it was chosen, and the
alternatives that were considered and rejected, with the specific reason each alternative lost.
Examples: Stance beat Static (too abstract, "unchanging" is the dominant everyday reading) and
Noise (judges value, not behavior); Breach beat Off the Air (frames the platform as a broadcast
gatekeeper, contradicting the transparency principle) and The Gutter (class-coded). The seven
tiers group into three psychological zones: Aspiration (Forum, Spark), Description (Echo, Fog,
Heat), Boundary (Stance, Breach), and a metaphor-family table maps each zone to a register (civic,
sensory/atmospheric, structural/contractual).

**The Commenter Message Tone Standard the reading list asked about** is five rules: name what is
there, not what is missing; one concrete suggestion per message, never a list; use the tier name
as a descriptor ("reads as"), never a verdict ("has been classified as"); never moralize; always
leave the door open, except Breach, which is blocked pending review but still communicates that
the boundary protects the discourse rather than punishes the person. This is a fuller statement of
the single principle `Dialecta_Classification_Engine_Specification.md` gives ("observational, not
evaluative"); the two documents are companions on this exact point and do not disagree, Tier
Psychology is simply the deeper one.

Visual identity is also specified here, not in the design spec: a brightness ladder where
lightness equals honor (Forum lightest, Breach darkest) with a stated cooling-then-warming hue
curve, and seven custom SVG icons chosen over emoji for cross-platform consistency, with the
electric/thermal split between Spark's lightning and Heat's flame explained as deliberate
(ignition versus sustained burn).

**A finding beyond what the lead asked for.** The document's own status line reads: "v1.1, Tier
names, colors, and icons confirmed. The Stance and The Breach names are still provisional pending
user testing." Root `CLAUDE.md`'s "Locked decisions" section states the same seven names,
including Stance and Breach, with no caveat: "Tier names: Forum, Spark, Echo, Fog, Heat, Stance,
Breach. Older docs may say 'Static' or 'Off the Air'; superseded." Neither document is wrong on
its face, both are simply uncorrected against each other. If asked whether Stance and Breach are
settled, the honest answer is that the spec that owns tier-naming rationale still calls them
provisional and the locked-decisions list calls them settled, and nothing records which one
superseded the other or when.

## Implies for Dialecta

- Full citation for tier-naming psychology and the commenter-message tone standard now exists;
  previously the mandate's own name list was the only citation available for either.
- Added to `drift-map.md` as a new short section this sprint (I2): the Stance/Breach
  provisional-versus-locked mismatch, parallel in shape to F1's locked-decision-with-no-spec, but
  the reverse direction, a spec caveat that the lock does not carry forward.
- If Stance or Breach naming is ever revisited (the doc's own Open Questions call for real user
  testing on exactly these two), root `CLAUDE.md` line 65 needs the same edit as the spec, or the
  two will keep disagreeing silently.

*Filed 2026-09-20.*
