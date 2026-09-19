---
name: dialecta-tokens
description: Where Dialecta's design tokens come from and how to use them in apps/web. Use before writing any CSS, styled component, or SVG color.
---

`design/dialecta-design-spec.html` (v1.3) is the only source of visual truth. `apps/web/src/styles/tokens.css` is generated from it by `node scripts/extract-tokens.mjs` (root script `npm run tokens`; `--check` verifies it is current). Never edit `tokens.css` by hand and never type a hex value in a component.

Rules:
- Use `var(--token-name)`. If the token you need does not exist, stop and report it; do not approximate. Stale or invented tokens are a recurring cross-session problem on this project.
- Locked treatments live in the spec's Sections 08 and 08b: nav gradient, page background, paper-grain overlay. Copy them, do not iterate on them.
- Gold family in tokens.css: `--gold` `#d4a84a`, `--gold-bright`, `--gold-muted`, `--gold-pale`. The `#b8862e` amber from older memory notes is not in v1.3; do not reintroduce it. `--dark-card` `#292b2d` is for content that reads as written down and deliberate.
- Tier colors follow the brightness ladder: lightest for Forum down to near-black wine for Breach. Take them from the tokens, in that order.
- Typography stack and sizes come from the spec's typography section; headings Cormorant Garamond, body Source Serif, meta DM Mono, per the spec.
- Logo: `design/dialecta-logo-datauri.txt` or `design/logos/`. Never reconstruct from fragments. SVG logos with inline styles or gradients fail in `<img>`; use PNG or inline the SVG.

When the spec changes, regenerate tokens in the same PR and note it in `docs/Dialecta_Project_Index.md`.
