# Own measurement, 19 September 2026

**Source:** Own measurement, 19 September 2026. Counted from design/dialecta-design-spec.html v1.3, apps/web/src/styles/tokens.css and apps/web/src/app/globals.css. Reproduce with grep over the declared values; commands recorded in the summary.

## Summary

The token set locks colour and type family and says nothing at all about space or scale. What the components use instead was counted directly.

Tokens that exist: 9 background and surface colours, 9 text colours, 6 gold family, 28 tier values, 4 borders, 3 shadows, 4 font families, 3 radii. Tokens that do not exist: any spacing value, any type size, any line height, any measure, any grid.

What the spec uses in place of them: 29 distinct font sizes in rem, of which 14 sit between 0.52rem and 0.95rem. Neighbouring steps include 0.82, 0.85, 0.88, 0.9, 0.92 and 0.95, which is six sizes inside a range of 0.13rem, roughly two pixels end to end. 17 distinct padding values: 3, 5, 6, 7, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 72 and 96px. Eleven of those sit on a 4px grid and six do not. 9 distinct gap values and 14 distinct line heights.

In the app, `main { max-width: 44rem; padding: 3rem 1rem; }` is the entire layout system, and neither number descends from a token.

This is a count, not a judgement. A design spec is allowed more values than a token set. The finding is that nothing distinguishes a deliberate value from an accidental one, because there is no scale to be off.

## Implies for Dialecta

- The Responsive Foundations debt in the charter is partly this. A layout cannot be made responsive in a principled way when the spacing it is built from has no steps, because every breakpoint becomes a fresh set of hand-picked numbers.
- Every island built from A-1 onward will hard-code space. Each one is a new set of values, and the drift compounds per component with nothing to check it against. `npm run tokens -- --check` guards colour drift and cannot see this.
- Comment card (A-5) is where it bites first, because it carries four groups whose relationship is carried entirely by spacing. See `2012-wagemans-gestalt-grouping`.
- The fix is additive and does not touch anything locked. A spacing scale and a type scale add tokens where none exist rather than changing a value Dan has fixed. `scripts/extract-tokens.mjs` already generates the CSS from the spec, so the pipeline to carry them exists.
- Type sizes six deep inside two pixels are a hierarchy nobody can perceive. A person reads three or four levels of size, not fourteen. Collapsing the 0.52 to 0.95 band to four steps would lose nothing a reader can see.

*Filed 2026-09-19*

## Addendum, 2026-09-20

This belongs in M3 (`docs/plans/backlog.md` calls M3 "Platform, pages and presentation review,"
designer-owned, and already names this file as required reading). The numbers do not need to wait
for M3's entry gate. Proposed: 8 / 16 / 24 / 48px, holding Trinity's direction rule, space blocks
downward through `margin-bottom`, a section head owns the space above it. Full reasoning and the
comment card's four ungrouped rows in `positions.md`, D-25 and the addendum below it.
