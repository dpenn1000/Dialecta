# Visual Contrast of Text Subgroup Whitepaper

**Source:** Andrew Somers (Myndex Research), "Visual Contrast of Text Subgroup Whitepaper", W3C WAI Silver Task Force wiki. Status stated on the page: "an early work in progress, and is not an official recommendation of the W3C". Read 19 September 2026. https://www.w3.org/WAI/GL/task-forces/silver/wiki/Visual_Contrast_of_Text_Subgroup/Whitepaper

## Summary

The case that the WCAG 2.x contrast ratio is not a perceptual measure, written by the author of the candidate replacement for WCAG 3. Three claims matter here.

The formula "fails to predict contrast appropriately if the background is darker than about #aaa", which the whitepaper calls "clearly a problem for use with any 'Dark Mode'" and states that "WCAG 2.x contrast math is incapable of correctly indicating contrasts with dark color pairs". It holds that 4.5:1 "is insufficient contrast for columns of small thin body text", where other standards recommend closer to 10:1. And it holds that the ratio is not perceptual, so equal ratios do not mean equal readability across the range.

APCA replaces the ratio with a number from 0 to 150 that accounts for font size, weight and spatial frequency.

On confidence: this is an advocacy document by the author of the competing method, hosted on a W3C wiki but explicitly not a W3C recommendation. Treat the direction as sound and the specific thresholds as contested. WCAG 2.x remains the normative standard and the thing Dialecta will be measured against.

## Implies for Dialecta

- Reframes the tier palette audit. The two tiers that pass most comfortably on paper, Stance at bottom stop and Breach, are the two with the darkest backgrounds, which is exactly where the whitepaper says the WCAG 2 number is least trustworthy. Those passes should be read as unverified rather than safe.
- Badge text is 0.7rem DM Mono at weight 500, and the small badge is 0.6rem. That is small and light, which is the case the whitepaper says 4.5:1 under-serves. A tier badge clearing 4.5:1 exactly is not comfortable, it is barely legal.
- Dialecta has no dark mode and the page background is a light parchment, so the worst of the WCAG 2 dark-background problem is confined to the Stance and Breach surfaces and the `--bg-dark` editorial card.
- Do not rebuild the palette around APCA. It is not normative, and the locked visual language is Dan's. Use it to decide which passing numbers deserve a second look.

*Filed 2026-09-19*
