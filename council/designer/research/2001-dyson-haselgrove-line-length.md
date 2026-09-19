# The influence of reading speed and line length on the effectiveness of reading from screen

**Source:** Mary C. Dyson and Mark Haselgrove, "The influence of reading speed and line length on the effectiveness of reading from screen", International Journal of Human-Computer Studies, volume 54, pages 585 to 612, 2001. DOI 10.1006/ijhc.2001.0458. Citation verified against Crossref 19 September 2026; the Elsevier full text is paywalled and was not read. https://doi.org/10.1006/ijhc.2001.0458

## Summary

An experiment on reading from screen crossing two reading speeds, normal and fast, with line lengths measured in characters per line. The reported finding is that a medium line length of 55 characters per line produced better comprehension than the longest condition of 100 characters per line, and that the medium length supported effective reading at both normal and fast speeds. Comprehension fell when reading fast, and the drop was not compensated by rate, so there was no speed and accuracy trade-off hiding the effect.

The measured quantity is comprehension, not preference and not speed alone, which is what makes it useful for a platform whose whole argument is that people should engage with what they read.

On confidence: medium to high. Peer reviewed and well cited, but a 2001 screen study on CRT-era displays, and the finding was read from secondary summaries rather than the paywalled paper. The 55 figure should be treated as evidence for a middle range rather than as a target.

## Implies for Dialecta

- `apps/web/src/app/globals.css` sets `main { max-width: 44rem; padding: 3rem 1rem; }`. At the inherited 16px that leaves about 672px of text, which is roughly 80 to 90 characters per line. That is much closer to the 100 character condition that measured worse than to the 55 that measured better.
- The unit is also wrong for the job. `44rem` is fixed against the root font size, so the measure changes whenever type size changes. The `ch` unit tracks the actual character width, and the design spec already uses `max-width:64ch`, `52ch` and `50ch` in places. The app did not inherit that.
- Article body prose in `apps/web` currently renders in `--font-body` (DM Sans), because `main` sets no family and `body` sets the sans. The token set defines `--font-reading` (Source Serif 4) and the app never applies it to reading. That is drift between the spec and the code, and it is also why the measure is worse than it looks: a sans at the same size runs wider.
- P0-5 (native articles rendering from `articles`) is the item that should fix both, because it is the first time long-form prose is rendered by this repo rather than by Ghost.

*Filed 2026-09-19*
