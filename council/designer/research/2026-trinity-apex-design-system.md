# Dan Pennington, APEX Design Intent (v2.7, landed 2026-07-28), APEX Design System (rhythm standard 2026-07-22), and DESIGN-ROLLOUT.md, in dpenn1000/trinity-platform at Tools/APEX/docs/

**Source:** Dan Pennington, APEX Design Intent (v2.7, landed 2026-07-28), APEX Design System (rhythm standard 2026-07-22), and DESIGN-ROLLOUT.md, in dpenn1000/trinity-platform at Tools/APEX/docs/. Private repo, read 19 September 2026 via gh. https://github.com/dpenn1000/trinity-platform/tree/main/Tools/APEX/docs

## Summary

Dan's other platform carries a finished design system with a written intent document, and several problems this advisor raised on 2026-09-19 are already solved there in his own idiom.

The spacing standard, dated 2026-07-22, is four numbers and a direction rule: 12px inside a component, 18px `--gap` between siblings, 24px `--pad` for card padding, 48px `--sect` before a section head. "Snap every margin, gap, and padding to the nearest one; never invent a fifth value." Blocks space downward through `margin-bottom`, section heads own the space above through `margin-top`, "so gaps never double up. If a layout only works off-scale, the layout is wrong, not the scale."

The colour law is stated as intent rather than as a rule to enforce: "Color is spent on data, never on chrome", with hue carrying meaning per metric. And the separation this advisor needed a week of measurement to reach is already written down: fills ride per-theme FILL GRADES "decoupled from the AA text hues, so the light theme's bubbles and bars stay vivid while its text stays compliant", because "a text hue doing a fill's job is how a slider's center turns to mud".

Two prime directives name the aesthetic. Feng shui: "Space is a feature. Every element gets air; density must earn its place. When in doubt, remove one thing and widen what remains." Sparkle: "A touch of life on everything filled: gloss crowns, inner shine, and glow. Corporate does not mean flat." Also a containment rule (panels sit directly on the canvas, no card inside a card), a convexity rule, a paper grain built from an SVG noise layer multiplied at 0.06, and cards that float on a three layer shadow where "the lift does the separating, not heavy borders".

## Implies for Dialecta

- D-15 has an answer already written by the same author. The spacing scale Dialecta lacks exists at Trinity as four numbers plus a direction rule, and the direction rule is the part this advisor did not have. Propose the shape, let Dan pick Dialecta's own four numbers.
- D-12, the Heat badge at 1.96:1, is a violation of a law Dan already wrote. `--tier-heat-text` is an AA text hue being used as the icon fill through `currentColor`, which is the mud case named in the intent document.
- The boundary matters and should be stated every time. Root `CLAUDE.md` says the voice guides descend from Trinity and "the two are kept separate on purpose". The same applies here: take the laws and the method, never the palette, the glow or the cockpit look. Trinity is a corporate command centre; Dialecta is warm parchment and long-form reading.
- The grain technique is transferable and Dialecta already has a grain it is told not to iterate on. Worth reading the CSS before anyone reinvents it.
- "Cut before you shrink" and "at most 4 KPIs in the lead row" are the same instinct as the charter's five nav items. There is a house style here across both products and it is worth naming.

*Filed 2026-09-20*
