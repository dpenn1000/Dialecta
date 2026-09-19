# W3C, Web Content Accessibility Guidelines 2.2, Understanding SC 1.4.1 Use of Color and Understanding SC 1.4.11 Non-text Contrast

**Source:** W3C, Web Content Accessibility Guidelines 2.2, Understanding SC 1.4.1 Use of Color and Understanding SC 1.4.11 Non-text Contrast. W3C Recommendation. Read 19 September 2026. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html

## Summary

Two criteria govern the seven tier system, and both are normative rather than advisory.

SC 1.4.1 Use of Color: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." The intent section is explicit that the barrier is not only total colour blindness: people with partial sight often have limited colour vision, many older users see colour poorly, and monochrome displays lose the channel entirely.

SC 1.4.11 Non-text Contrast: "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s): User Interface Components, Graphical Objects", where graphical objects means "Parts of graphics required to understand the content". A tier badge border, a topology bar segment and a tier icon are all graphical objects required to understand the content, so 3:1 is the floor for each of them against what sits next to them.

Text in a badge is governed separately by SC 1.4.3, which is 4.5:1 for body text and 3:1 only at 18.66px bold or 24px regular. Badge text is 0.7rem, and the small badge is 0.6rem, so 4.5:1 applies.

## Implies for Dialecta

- Topology bar (A-6): segments are distinguished from each other by colour alone. A text legend sitting below the strip does not satisfy 1.4.1 for the segments themselves, because matching legend to segment is the colour task a person with CVD cannot do. The tier icons already exist in the design spec; carrying one into each segment fixes this without touching a token.
- Tier badges: the badge already pairs colour with the tier name and an icon, so 1.4.1 is satisfied there. The problem on badges is 1.4.3 contrast, measured in `2026-dialecta-tier-palette-audit`.
- Specificity dots, vote triangles and the Contrast Strip are all graphical objects under 1.4.11 and none has been checked.
- Filter buttons in the control bar dim inactive tiers to 50% opacity. Opacity multiplies against the background and can drop a passing colour below 3:1. Worth measuring before A-6 ships.

*Filed 2026-09-19*
