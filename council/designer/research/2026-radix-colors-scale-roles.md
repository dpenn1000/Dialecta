# Understanding the scale

**Source:** Radix Colors, "Understanding the scale", radix-ui.com/colors docs, with the repository radix-ui/colors (MIT, 1,672 stars, last pushed 2025-12-17). Read 19 September 2026. https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale

## Summary

A colour system built as twelve named roles rather than twelve pretty values. Each step has one job: 1 app background, 2 subtle background, 3 UI element background, 4 hovered, 5 active or selected, 6 subtle borders and separators, 7 element border and focus ring, 8 hovered border, 9 solid background, 10 hovered solid background, 11 low-contrast text, 12 high-contrast text.

The part worth stealing is not the roles, it is the contract underneath them. Steps 11 and 12 are "guaranteed to Lc 60 and Lc 90 APCA contrast ratio on top of a step 2 background from the same scale". The text steps are defined in terms of the background steps of their own scale, so a designer cannot pair them wrongly. Accessibility is a property of how the scale is built, not a thing checked afterwards.

On confidence: the roles and the guarantee are read from the vendor's own documentation, which is primary for their system and is also marketing for it. The guarantee is stated in APCA rather than WCAG 2.x, which matters given `2021-somers-apca-contrast-whitepaper`.

## Implies for Dialecta

- Names what is missing from Dialecta's tier tokens. Each tier carries `top`, `bot`, `border` and `text`, which is three chrome values and one ink value with nothing binding the ink to the chrome. That absence is exactly why Heat sits at 1.96:1 against its own chip: no rule was broken, because no rule existed.
- The fix is a contract rather than a repaint. Require that each tier's ink clears 4.5:1 against the lightest point of its own fill, and that each tier's border clears 3:1 against `--bg-white`. Five of seven tiers already satisfy both. The brightness ladder, the gold and the grain are untouched.
- Pairs exactly with the Trinity law in `2026-trinity-apex-design-system`, which separates fill grades from AA text hues for the same reason and in Dan's own words. Two independent systems reached the same conclusion.
- D-18 becomes enforceable rather than advisory. A contract is a thing CI can check; "pick nice colours" is not.
- Do not adopt Radix's palette or its twelve steps. Dialecta has seven tiers with a meaning each, and a parchment surface Radix has no equivalent for. Take the idea that a scale is a set of promises.

*Filed 2026-09-20*
