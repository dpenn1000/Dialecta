# Own measurement, 19 September 2026

**Source:** Own measurement, 19 September 2026. Token values read from apps/web/src/styles/tokens.css, generated from design/dialecta-design-spec.html v1.3. Reproduce with `python council/designer/research/tier-palette-audit.py`. Methods: WCAG 2.x relative luminance contrast, CIEDE2000 colour difference, and the Machado, Oliveira and Fernandes (2009) severity 1.0 CVD matrices.

## Summary

Six findings, all reproducible from the script filed alongside this note.

1. Badge text fails WCAG 1.4.3 on two tiers. Badge text is 0.7rem DM Mono on a 180deg gradient, so contrast varies down the chip. Heat text #FCEAD8 measures 1.96:1 against its top stop #E89868 and 3.54:1 against its bottom stop. Stance measures 4.26:1 against its top stop. Body text needs 4.5:1. The other five tiers range from 5.94:1 to 11.44:1.

2. The same failure hits the icon. The badge icon is drawn in `currentColor`, so the Heat icon sits at the same 1.96:1 and fails the 3:1 floor in SC 1.4.11.

3. The one contrast fix already in the spec was applied to the wrong tier. The Discourse Layer UX spec renders the Forum icon in `--text-primary` because "the tier text color has insufficient contrast" against the near-white chip. Measured, Forum is 7.02:1 at the top stop and 6.39:1 at the bottom, which is comfortable. Heat, which fails by a factor of two, was left alone.

4. Stance and Breach are the same colour to the eye. Their border colours sit 9.22 CIEDE2000 apart, against a median of 38.91 across all 21 pairs. Under simulated CVD the gap closes further: 6.25 protanopia, 8.77 deuteranopia, 9.21 tritanopia. A difference under 10 reads as one colour slightly varied.

5. Other CVD collisions: Spark and Echo at 10.54 under protanopia, Forum and Spark at 12.40 under deuteranopia, Echo and Fog at 7.75 under tritanopia.

6. Two tier borders cannot be seen on the card surface. Forum measures 1.50:1 against `--bg-white` and Spark 2.52:1, against the 3:1 floor in SC 1.4.11. Forum is the tier the Quality sort exists to surface, and its badge outline and topology segment are the least visible of the seven.

## Implies for Dialecta

- Topology bar (A-6): the surface where findings 4, 5 and 6 all land at once, because segments carry no text. Stance and Breach will not be separable, and a Forum segment will barely register against the page. The fix that changes no token is to carry the existing tier icon into each segment and give the strip a visible divider.
- Comment card (A-5) and composer (A-1): the Heat badge is the single worst element measured, and Heat is a common classification. This is a spec defect rather than a taste question, and it needs Dan, because the tier tokens are locked. Raised as exchange record 2026-09-19-004.
- Nomination panel (A-7): 44x44 icon chips carry the full gradient, so finding 2 repeats there at larger size for Heat.
- Article cards (A-9) show Forum-tier counts. If the Forum badge is the least visible of the seven, the locked decision to surface Forum counts is undercut by the palette.
- The brightness ladder is worth keeping. Every finding here is about asking one channel, hue and lightness, to carry both an ordinal ranking and a seven way categorical identity. Adding a second channel costs nothing the spec does not already own.

*Filed 2026-09-19*
