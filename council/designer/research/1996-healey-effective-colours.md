# Choosing effective colours for data visualization

**Source:** Christopher G. Healey, "Choosing effective colours for data visualization", Proceedings of Seventh Annual IEEE Visualization '96, pages 263 to 270. DOI 10.1109/visual.1996.568118. Citation verified against Crossref 19 September 2026. Paper summary read from the author's perception page at csc2.ncsu.edu; the IEEE full text was not retrieved. https://doi.org/10.1109/visual.1996.568118

## Summary

A method for selecting a set of colours that a viewer can tell apart quickly and accurately, rather than a set that merely looks different to the person who picked it. The author's position, restated on his perception page, is that "color distance, linear separation, and color category must all be controlled to select discrete collections of equally distinguishable colors".

The three controls are separate problems. Colour distance is perceptual separation, which is why a perceptually uniform space and a distance metric such as CIEDE2000 beat eyeballing hex values. Linear separation is whether a colour can be cut off from the others by a line in colour space, which predicts how fast it pops out of a field of the rest. Colour category is whether two colours fall into the same named region, because two blues read as one thing even when the numbers say they are far apart.

On confidence: the citation is verified, the finding is reported from the author's own summary page rather than the paper. Do not quote a specific maximum count from this note. The page states the method, not a number.

## Implies for Dialecta

- The seven tier palette was not selected this way. It was designed as a brightness ladder from cream to near black, which controls lightness and leaves hue, linear separation and category uncontrolled. The measured result is in `2026-dialecta-tier-palette-audit`: Stance and Breach sit 9.22 CIEDE2000 apart and fall in the same category, dark red.
- Topology bar (A-6) is the surface that needs all three controls, because it asks a person to identify seven segments at a glance with no text on them. This is the classic categorical coding task the paper is about.
- Badges need less. A badge carries its tier name, so colour is confirmation rather than the channel, and category collision costs much less.
- The brightness ladder is a real asset and worth keeping. The design spec calls it the thing that "communicates quality intuitively before any text is read", which is a lightness ordering and a legitimate ordinal encoding. The failure is asking one channel to do ordinal and categorical work at the same time.

*Filed 2026-09-19*
