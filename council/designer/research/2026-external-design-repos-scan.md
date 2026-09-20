# Own scan of GitHub, 19 September 2026, via the gh CLI

**Source:** Own scan of GitHub, 19 September 2026, via the gh CLI. Stars, licences and last-push dates read from the GitHub API at the time of scanning. Generic keyword searches for grain, texture and colour-blind-safe palettes returned nothing above noise and are recorded as a dead end.

## Summary

Verified and worth keeping, in rough order of usefulness to this advisor.

`radix-ui/colors`, MIT, 1,672 stars. The scale-as-roles model with a built-in contrast guarantee. Filed separately as `2026-radix-colors-scale-roles`.

`style-dictionary/style-dictionary`, Apache-2.0, 4,819 stars, pushed 2026-09-18. A build system that turns one token source into platform outputs. Dialecta already has `scripts/extract-tokens.mjs` doing a narrower version of this job, so the value is the shape of a mature token pipeline rather than a dependency to add. Note the org moved: `amzn/style-dictionary` redirects.

`design-tokens/community-group`, 2,126 stars, pushed 2026-09-08. The W3C Design Tokens Community Group specification. Relevant because Dialecta is about to add spacing and type tokens and there is a standard shape for them.

`Evercoder/culori`, MIT, 1,232 stars. Comprehensive colour library with perceptual spaces and difference metrics. Would replace the hand-rolled CIEDE2000 in `tier-palette-audit.py` if the audit ever moves into CI.

`gka/chroma.js`, 10,581 stars. The older and more widely known equivalent. Either would do.

`Myndex/SAPC-APCA`, 585 stars, pushed 2026-07-25. Reference implementation of the algorithm in `2021-somers-apca-contrast-whitepaper`. Licence reads NOASSERTION, so check terms before shipping any of it.

`dequelabs/axe-core`, MPL-2.0, 7,533 stars, and `pa11y/pa11y`, LGPL-3.0, 4,533 stars. Automated accessibility engines. Either one satisfies D-18 for rendered pages, though neither checks a token file, which is what the palette audit does.

`system-fonts/modern-font-stacks`, CC0-1.0, 3,517 stars. System font stacks organised by typeface classification. Bears on how Dialecta's four webfonts fall back before they load.

`evilmartians/oklch-picker`, 1,996 stars. Perceptual colour picker, useful for reasoning about the tier ladder in a uniform space.

## Implies for Dialecta

- D-18 (a contrast check in CI) now has two candidate shapes: a token-level check, which the existing audit script already is, or a rendered-page check through axe-core or pa11y. The token-level one is cheaper and catches the Heat badge; the rendered one catches what tokens cannot see, such as opacity on dimmed filter buttons.
- Before adding any dependency, note that `tier-palette-audit.py` has no dependencies at all and runs from the repo. That is worth something on a project with one maintainer.
- The W3C token specification is worth reading before the spacing and type scales are proposed, so they are not invented in a private shape.
- The generic searches failing is itself a result. There is no credible off-the-shelf repo for the organic paper aesthetic Dialecta and Trinity both use. That part is Dan's own, and the only reference implementation is the one in `2026-trinity-apex-design-system`.

*Filed 2026-09-20*
