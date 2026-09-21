# Opinion maps, spec section: notes

*Designer, 2026-09-21. Companion to `2026-09-21-opinion-maps-spec-section.html`, a proposal for Dan.
Nothing in `design/`, `apps/`, `packages/`, `docs/` or `supabase/` was edited.*

## Where it goes

**Section 13, `id="maps"`, sub-nav label Opinion Maps, after Section 12 and before the footer.**
Appending renumbers nothing. The council record cites Section 10 (the reflection prompt) and Section 11
(the Advocate Card) by number, and v1.3 added Section 12 the same way. I rejected a lettered slot on the
08b precedent (09b beside Article Header, 10b beside the AI card): it keeps neighbours together, but the
section cites Sections 03, 10, 11 and 12, so it reads better after them.

The section is a version bump, v1.3 to v1.4. The token generator reads the version from `<title>`.

## Edits to existing sections

Line numbers are v1.3, the file as it stands.

| Where | Edit | Why |
| --- | --- | --- |
| L6 title, L254 label, L630 footer | v1.3 to v1.4; footer date to September 2026 | The generator prints the version into `tokens.css` |
| L259 header paragraph | Append: "Version 1.4 adds Section 13, Opinion Maps: two reader-facing shapes, their marks and palette, and the Declare overlay." | The paragraph lists what each version added |
| `:root`, after L42 | The 14 `--map-*` lines from Part 1 | The generator copies every `:root` block, so they reach `tokens.css` |
| L246 sub-nav, and the sub-nav rule | Add the link. Add `flex: 1; min-width: 0; overflow-x: auto; scrollbar-width: none;` to `.spec-sub-nav .nav-links` | 13 links measure 987px; the 14th is 74.4px, 1,062 in all, against 1,008 at the 1,060px container cap and 702 at 769px. Tested with the rule: the last link reaches the edge |
| Section 01, L267 | Append: "Four pole hues, inside an opinion map figure only, are the one exception (Section 13)." | The section says gold is the only chromatic accent. The map adds blue, red and green |
| Section 03, L351 | Append: "The Declare overlay's summary row uses the standard badge (Section 13). No tier element takes a `--map-*` token." | The badge appears on a new surface. The standard size, because the small badge renders at 9.6px. It inherits D-24 for Heat and Stance |
| Section 10, L544 | Append: "The engine's reading in the Declare overlay is this card with a summary row as its control (Section 13)." | The reading reuses the card, so the engine's text looks the same everywhere |
| Section 11, L600 (Advocate Card) | Append: "The Strongest Objection on a published article is the author's own field. It sits on the paper sheet, not on this card (Section 13)." | The council log records a citation of this card that overreached. This closes it. The surfaces line stays as it is |
| Section 12, L609 | Append: "The opinion map figure, key row and summary row are specified in Section 13." | An index line, no duplicate specimen |

Found in passing, not changed. Section 10's `.ai-card-label`, `.ai-card-body em` and `.ai-card-action` set
`--amber` text on `--gold-pale` at 3.14:1, under the 4.5:1 floor; `--terra` measures 5.53:1 on the same surface
and is canonical. The Canonical Values panels set their label in `--amber` on white at 3.74:1. Both are token
changes to locked components, so Dan's. The new section uses `--map-label` for its own panel.

## Landing

1. Merge the fragment's three parts into a copy of `design/dialecta-design-spec.html`: the `:root` lines
   after L42, the rest of the style block before `</style>`, the nav link after Components, and Part 3
   before the footer `<div>` at L628. Then the table above.
2. `npm run tokens`, then `npm run tokens -- --check`. None of the 14 names exists in `apps/web/src`,
   `_theme` or `design/` (grepped), so nothing collides with `dialecta-surfaces.css`.
3. Checked on a scratch copy built exactly this way: one `:root` block, 14 map tokens, version read as 1.4;
   no page-level horizontal overflow at 380px; no text under 11px inside the overlay specimens; four of twelve
   tables scroll inside their wrapper on a phone. `scripts/voice_check.py --strict` on the fragment: 0 hard hits.
4. Every ratio the fragment cites was recomputed independently, 34 checks, none missing.

## What was measured

Ratios are WCAG 2.x against `#fffdf8`. Dots are drawn at 0.9 (ternary), 0.85 (cartesian) and 0.95 (binary), and
sit on a wash at 0.24 (ternary) or 0.38 (cartesian).

| Item | Today | In the section |
| --- | --- | --- |
| Gold pole marker | 2.12:1, 1.97 as drawn | Pole 1 ink 4.80 |
| Green axis end, cartesian top | 2.24:1, 2.08 as drawn. No seat had it | Pole 4 ink 5.30 |
| Blue and red pole markers | 4.51 and 4.17, 3.87 and 3.76 as drawn | 7.99 and 7.63 |
| Any bright dot on its own wash | 1.68 to 2.89 ternary, 1.49 to 2.30 cartesian. All four fail | 3.62 to 5.77 |
| Frame | 1.75 ternary (stroked twice), 1.35 cartesian | 3.15 |
| Reader's ring | Under 3:1 at 25.0% of ternary and 42.5% of cartesian positions. Within 10 of the author's brass at 11.2% of ternary positions | Ink, 17.36 |
| Overlay kicker | `--brass-warm` 2.17:1 at 9.5px | `--map-label` 7.34 at 11px |
| Close button | `--brass-mid` 3.18:1 at 10px | 7.34 at 11px |
| Pole labels rendered | 9.4px at 380 | 12.4px at 344 |
| Text under 11px on the open overlay | 26 of 53 elements at 380 | 0 |
| Signed-out figure | 305px in a 566px column: `margin: 0 auto` in a flex column shrinks the SVG to its 300px default. The build fixed it at 11:34 with `width: 100%`, cap 520 | Cap 400 |
| Column at 380 | 306px | 344px, no nested card |
| Read before a click | 311 words, 78 s (685 stored) | 195 to 215 words, 49 to 54 s |
| Signed-out Reflect segment | Pointer cursor, `href` to an id that does not exist, click does nothing | Opens with a sign-in line |
| Placement without a pointer | None: `role="img"` with click and touch handlers only (WCAG 2.1.1) | Arrow keys, Tab to Commit |

The chair's "about 150 words, 40 seconds" counted the three fields (98 to 105) and the summary row (29). The
maps' own text adds 45 to 54 words and the shell 9. Both counts are right; this one includes everything visible.
Words are whitespace tokens with a letter or digit, which is how the editor's `wordCount` counts.

## The palette decision

The map keeps its live-layer names and records the mapping. It does not point at the spec's brass. Three reasons.

1. The app already runs both layers at scale: `--ink` 109 references in 21 files beside `--text-primary` 48 in
   7, and `--brass-deep` 140 in 25 files with no spec twin. A map on spec names would be the one surface on the
   other palette inside an overlay whose chrome uses the live names.
2. The port-or-rewrite ruling made `_theme/assets/css/style.css` authoritative (48 of 49 referenced tokens
   against 10) and recommended flipping the generator's source to it, once Dan names the `--amber` and
   `--border-light` forks (his items 4 and 5). The live names are the likelier survivors.
3. Only the marks are new colours. Of the map's ten surface names, five are exact spec twins, four are forks
   (3.7 to 10.9 apart) and one has none. The section records all ten.

Components reference 14 `--map-*` role tokens, so each value lives in one place. If Dan rules `--amber` the real brass, one value
changes (#b8862e to #b8732a, 3.18 to 3.74:1) and every ratio still clears. The generator flip changes no
component. `--map-you` and `--map-frame` alias spec tokens, so they resolve in the spec page. The brass roles
are literals, because the spec's `:root` has no `--brass-*` and a `var()` to a missing name would render blank in
the spec's own specimens. A CI test asserting `--map-author` equals `--brass-mid` and `--map-author-rim` equals
`--brass-deep` would catch the `--gold` and `--brass-warm` kind of drift this section exists to name (D-18's shape).

I did not change any hue. The pole inks are the builder's muted twins, already in `engine.tsx` as
`POLE_MARKER_COLORS`. The trade is stated in the section: colour-blind separation falls (closest pair 4.8 under
protanopia, against 6.9 for the bright set), and the red twin sits 8.4 from Heat's border, the nearest tier
colour to any pole. So the section says hue never carries identity on a map, and that no map element takes a
tier token.

An option for Dan, not adopted: pole 3 as `#9b0a78`. Same lightness and contrast (7.63:1), 25.3 from the nearest
tier colour instead of 8.4, deuteranopia separation 12.9 instead of 9.2, but its protanopia separation from the
other poles falls from 14.5 to 7.2. It changes a hue Dan has seen live to soften a risk of association, not a
failure of a standard.

## Where the build differs

Read at 11:49; the builder is still editing `engine.tsx`, `declaration.tsx`, `strings.ts` and the CSS. The build
already has the reorder, the summary row carrying the sentence, a caption per map keyed to
`author_position_source`, the question on every figure, muted marker fills, the reader's diamond and tag, and
the width fix.

- Figure cap 520, section 400: at 15-unit labels a 520px figure renders them at 18.8px.
- Pole labels 13 units with no wrap, 9.4px at 300px. A 20-character label overflows the sheet at 344px.
- Reader tag 40 × 18 at 12 units, 8.8px rendered. Section: 52 × 22 at 15 units.
- The author target keeps its dashed ring in both states, which now reads as "estimate" for an author-set mark.
- Marks and dots drawn at 0.85 to 0.95 opacity; frame in `--wood-edge`; cartesian viewBox 380 with wash 0.38.
- Summary row: title and cue at 10px and 9.5px, the tier as icon and word at 10px, border `--wood-edge`. Section:
  11px, the standard badge, Section 10 chrome, the whole row a target at least 56px tall.
- Privacy line beside each Commit. Section: once, above the first figure.
- `.ad-section` nested card and a 760px Declare sheet. Section: neither, 640px for both overlays.
- Not built: the author's map step. The editor's Declare stage prints "Opinion maps are not in this build"
  (`stages-draft.tsx`); the two AI hint buttons and `OpinionMapsInput` were left out of the port. Counters and
  the over-budget line, keyboard placement, and the signed-out Reflect fix are also new work.

These are exchange-record candidates. I wrote none, per the brief.

## Where I chose between two readings

1. **Privacy line.** Once, above the first figure (the section), or beside each Commit (the build). Once saves
   9 words on a two-map article and keeps the promise ahead of the first tap, which is when a reader on a religion axis
   hesitates. Either satisfies Legal's row.
2. **Signed-out Reflect.** Open with a sign-in line, or hide the segment. Hiding breaks the spine's six stages.
3. **Cap 400 or 520.** The labels decide it, as above.
4. **Nested card.** Removing it gives a 344px column at 380 and makes the paper the author's voice and the gold
   card the engine's, which supports the locked sentence.

## Pending

Items 6, 11 and 12 are marked in the section. Item 6: the Note to the Author is listed in the folded reading
and flagged. Item 11: the specimens use Forum, so neither reading of Far Shore is implied. Item 12: current
strings are in the specimens, alternatives beside them, and the caption table carries both wordings. The spacing
scale (D-25), the brass fork, step 7 and Stages D to F are marked as well.

## Method and limits

- Measured in the built-in browser at `localhost:3050` and `dialecta.org`, at 769px and 380px. The pane was
  hidden partway, so renders of my own scratch pages used headless Chrome. No signed-in session was available
  here, so the member states of Reflect and Declare come from reading the source and from specimens, not from a
  render of the build.
- Contrast is relative luminance. Colour difference is CIEDE2000; the colour-blind simulation is Machado 2009,
  the same code as `tier-palette-audit.py`.
- The reader-ring shares are over a uniform grid of positions, not weighted by where readers tap. Nine
  placements exist, too few to weight it.
- One command outside the brief: a read-only `git log --oneline -8` early on. It changed nothing.
- I did not run `scripts/land.mjs` or the token generator; both write inside the repo.
