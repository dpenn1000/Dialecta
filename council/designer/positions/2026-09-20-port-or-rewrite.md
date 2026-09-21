# The design system, ported

*designer position, 2026-09-20, Phase 2. Answers the frame's question three: where layouts,
colour, paper grain and wood live in `_recovered-next/` and `_theme/`, and whether each
ports independent of the components that consume it. Extends the Phase 1 read at
`council/designer/positions/2026-09-20-recovered-source-read.md` and D-11 through D-26; does not
restate them.*

## Brief

Dan's four things split into two kinds. Colour and paper grain port independent of any component:
both live entirely inside style.css's single, 149-line `:root` block, the live Ghost export at
`_theme/assets/css/style.css`, not the design spec. The token generator's own regex already
matches that block's shape, so retargeting it costs a path change plus two named value decisions,
not a rewrite. Layout does not port independently: `shell.jsx`'s 226 lines are Ghost `.dataset`
plumbing and do not survive the move. Wood is real but thin: only a one-pixel border rim renders
anywhere; the plank gradient is defined and never painted, in 3,286 lines.

## Dan's four things, located

| Thing | Lives in | Ports independent of components? |
| --- | --- | --- |
| Colour | `_theme/assets/css/style.css`, `:root` block, lines 3 to 151 | Yes |
| Paper grain | Same block, `--paper-grain`, lines 86 to 91, plus an untokenized sepia variant at lines 393 and 1657 | Yes |
| Wood | Same block, `--wood-warm/mid/deep/edge/grain`, lines 77 to 84, plus `.dialecta-wood-frame`, lines 1609 to 1638 | Yes, and mostly unused today |
| Layouts | Split. `_recovered-next/app/layout.js` and `SiteNav.js` adapt. `shell.jsx` is Ghost-mount plumbing | No |

## Two theme copies, one live

One fact governs every verdict below and nothing filed so far has said it. `_recovered-next/lib/theme/`
carries its own `__DO_NOT_EDIT.md`: the directory is a build-time copy synced from
`C:/dialecta-local/versions/6.28.0/content/themes/dialecta/src`, a path outside this repo, last
synced 2026-05-04, wiped and rewritten on every `npm run sync-theme`. `docs/RECOVERED.md`
independently confirms it is five months stale. `_theme/`, in the same document's own words, is
live today: exported from Ghost admin on 2026-09-20, the same day as this debate. I diffed both
copies of style.css and they are byte-identical, but only one of them is the thing to point a
generator at going forward. Every verdict below that says a token or a class ports as-is means:
copy it out of `_theme/assets/css/style.css`, the live file, not out of
`_recovered-next/lib/theme/style.css`, the disposable mirror, and never edit either in place.
`_recovered-next/lib/theme/`'s own JSX, `dialecta-tier-badge.jsx` included, carries the same
notice; a fix to any of the 51 components lands in `apps/web`, not in the recovered copy.

## Colour

`_theme/assets/css/style.css`, 3,286 lines, one `:root` block running lines 3 to 151 with no
nested braces (gradient functions use parens, not braces, so `extract-tokens.mjs`'s existing
`:root\s*\{([^}]*)\}` regex already matches it cleanly). That block is the whole of colour, paper
grain and wood at once, which is why all three port as one move rather than three.

**style.css ports as-is.** It already is what ships (Phase 1: 48 of 49 referenced custom
properties resolve here, 10 in the spec). `docs/SITE-INVENTORY.md` independently confirms the same
file is live and defines zero `--tier-*` tokens, matching what I found by grep.

**`apps/web/src/styles/tokens.css` (58 lines) is adapted, not rewritten.** It stays a generated
file; the header comment and the `npm run tokens` mechanism survive. What changes is one line in
`scripts/extract-tokens.mjs`, the `specPath`. New source: `_theme/assets/css/style.css`, not
`design/dialecta-design-spec.html`, and not `_recovered-next/lib/theme/style.css` per the
housekeeping note above. I read all 58 lines of tokens.css: it carries `--bg-*`, `--text-*`,
`--gold/amber/terra`, the 28 `--tier-*` values, `--border-*`, `--shadow-*`, `--font-*`, `--radius-*`
and `--page-background`, nothing else. No `--paper`, `--paper-bright`, `--paper-grain` or
`--wood-*` token exists, because the spec never defined any of them. Flipping the source is what
makes paper grain and wood exist in apps/web for the first time; that is the whole mechanism, not
a side effect of it.

Two things block a silent flip. `--amber` is `#b8732a` in the spec, `#b8862e` in style.css
(labelled `/* = --brass-mid */` in the file's own comment). `--border-light` is a flat `#e8e0d0` in
the spec against a translucent `rgba(180,175,165,0.28)` in style.css. Both are live only inside
tokens.css's own definition today; I grepped `apps/web/src` for `var(--amber)` and
`var(--border-light)` in an applied rule and found none. The risk is latent, not visible yet, which
is exactly why it needs to be a named decision now rather than discovered later when a ported
component starts rendering the wrong amber. And the flip cannot be silent for a third reason:
style.css defines zero `--tier-*` values, so flipping the generator's source before the tier tokens
land in style.css itself would delete all 28 tier colours from tokens.css. Sequence: land
`--tier-*` in style.css first (D-19 and D-24 already worked out that contract), then flip the
generator.

**`design/dialecta-design-spec.html` is adapted, not dropped.** Its role changes from value source
to generated-from, already recommended in Phase 1, not re-argued here. One mechanical follow-on:
`apps/web/CLAUDE.md` line 8 names the spec as tokens.css's source. That line goes stale the moment
the generator's source changes and needs the same edit, in the same commit.

## Paper grain

**`--paper-grain` (style.css lines 86 to 91) ports as-is, at zero cost.** It is a CSS custom
property holding an inline SVG data URI, `feTurbulence type="fractalNoise" baseFrequency="0.85"
numOctaves="4" stitchTiles="stitch"`, at 0.045 opacity. No PNG, no build step, no JS.
`.dialecta-paper` (lines 1603 to 1606) is the reusable class built on the token and ports the same
way.

**Two known duplicates need folding in while porting, not after.** style.css's own comment at the
token (lines 86 to 90) admits `.post-card` and the article body inline the identical data URI
instead of referencing the token, and calls migrating them "a separate sweep, not part of this
addition." I found both: `.post-card` (opens line 1926) repeats the literal string at line 1928;
`.post-article` (opens line 2002, the selector's own name, not the comment's "post-content") repeats
it at line 2024. Verdict: adapted. When either card is ported, point it at `var(--paper-grain)` in
the same change; the source already told us this is owed.

**A second, different grain exists and nobody has named it as its own thing.** `body::before`
(background-image at line 1657) and `.nav-drawer::before` (line 393) both use a warmer recipe,
`feTurbulence baseFrequency=0.85 numOctaves=2 seed=4` plus a `feColorMatrix` tinting it toward
brown, not the achromatic `--paper-grain` recipe. The comment directly above the drawer's copy
(line 386) says it "matches body::before." It doesn't, quite: the drawer's alpha is 0.04, the
body's is 0.035, a small drift between two things documented as identical. Verdict: adapted. Port
the visual, it's cheap CSS either way, but give it its own token, something like `--page-grain`,
with one value, during the port, instead of carrying two literals that already disagree by 0.005
into the next codebase.

## Wood

**`--wood-warm` `#c48040`, `--wood-mid` `#9a5c28`, `--wood-deep` `#7a3e16`, `--wood-edge`
`rgba(154,92,40,0.22)`, and `--wood-grain` (style.css lines 77 to 84) port as-is.** `--wood-grain`
is two layered `repeating-linear-gradient` passes plus a `linear-gradient` colour ramp, not an
image or a filter. Nothing but CSS.

**Nearly none of it is currently live, which changes what "porting wood" delivers.** I
grepped every non-comment consumption site. `--wood-warm/mid/deep` are read exactly once,
circularly, inside `--wood-grain`'s own definition. `--wood-grain` itself, the finished plank
texture, is never applied to any element's `background` anywhere in 3,286 lines, only named in two
comments (lines 74, 1619). `--wood-edge` is applied exactly once, as `.dialecta-wood-frame`'s
border colour (line 1622). The class's own comment says why: "Light touch, the rim reads as wood
without becoming the dominant material," reserved for "the reflection bar's own family of
components." What ships today is an 18-line border and shadow treatment (lines 1621 to 1638), not a
wood surface.

Verdict: `.dialecta-wood-frame` and the five wood tokens port as-is, together, at near-zero cost,
since the whole system is thin CSS with no shipped consumer to break. I grepped `apps/web/src` for
"wood" and found nothing, so there's no conflict to adapt around either. One flag, not a fix: if
Dan's mental picture of "wood" is the fuller plank texture, that texture has never rendered on the
live site. Porting the token verbatim reproduces exactly what exists today, a rim, not a plank.
Painting `--wood-grain` onto a real surface for the first time is new design work, not a port.

## Layout

Three files, three different verdicts, because "layout" means three different things here.

**`_recovered-next/lib/theme/shell.jsx` (226 lines) is rewritten.** Every mount point is a Ghost
Handlebars contract, not a layout: `document.getElementById('dialecta-signup-invite-root')`,
`document.querySelectorAll('[data-dialecta-bell]')`, and `#dialecta-sidebar` read through
`.dataset.postId/.postSlug/.authorId/.authorName/.primaryTagSlug` plus a JSON blob parsed off
`.dataset.articleClaims` (lines 184 to 188). Two more host elements are synthesized and appended to
`document.body` at runtime so a drawer and a modal can mount without touching a template (lines 206
to 208, 216 to 219). None of that mechanism, `createRoot` per island keyed to attributes only
`default.hbs` emits, has anywhere to attach once articles come from Supabase and pages are server
components (`apps/web/CLAUDE.md`'s six named islands). What's worth keeping is behaviour, not code:
one synthesized global settings host so Settings can open from any page (lines 203 to 209), and the
visitor branch that lets an unauthenticated click fall through to a normal link (lines 126 to 127,
`if (!memberUuid) return`). Both re-implement as a root-level provider, not a copy-paste.

**`_recovered-next/app/layout.js` (86 lines) is adapted, and it is most of the way there already.**
It already targets `app/layout.js`, already imports `@/lib/theme/style.css` directly (line 5) ahead
of any tokens.css question, already binds next/font for the four canonical families to the exact
custom property names style.css expects (`--font-display`, `--font-reading`, `--font-mono`,
`--font-body`, lines 13 to 41), already loads the nine signature hand-fonts in one Google Fonts
`<link>` (lines 75 to 78). I read what's live at `apps/web/src/app/layout.tsx` today, 37
lines: `tokens.css` plus `globals.css`, Plausible analytics wired through `next/script` and
`getPlausibleConfig`, metadata sourced from `strings.ts` and `SITE_URL`, and
`twitter: { card: 'summary' }` set explicitly, which `apps/web/CLAUDE.md` binds as a rule, not a
preference. Neither file is a superset of the other. The verdict is a merge: keep layout.tsx's
analytics, strings and metadata wiring, since those are locked repo conventions, and fold in the
recovered file's font setup and its style.css import, which is the same decision the colour section
above already makes, arriving here as one line of code.

**`app/components/SiteNav.js` (93 lines) is adapted, and looks more finished than it is.** Its own
docstring says what it deliberately isn't: no bell, no Write CTA, no avatar, no member name,
because "this surface is for crawlers + external arrivals," with every link pointing back at a
`dialecta.org` apex the file assumes still runs the full Ghost nav. That assumption is itself a
Ghost-transition artifact. ADR-001 leaves Ghost, so there is no longer a separate, fuller apex nav
for this reduced one to defer to; whether the nav is ever member-aware becomes a real decision
again, not an inherited division of labor. Concretely: `LOGO_URL` (line 37) hotlinks a Ghost-served
image at `www.dialecta.org/content/images/...`, defended in the file's own comment only as better
than a text stub. `_recovered-next/public/branding/dialecta-logo.png` already exists on disk and
removes the tradeoff outright; point `<img src>` there in the same change that ports this file. The
seven-item `NAV_LINKS` array (lines 39 to 47) and the build-strip copy (lines 52 to 61) are content,
and content ports as-is inside the adapted file.

## The tier badge defect

**`dialecta-tier-badge.jsx` line 181 ports with the fix, not as-is and not rewritten.** I read the
render path directly. Line 181: `const iconColor = tier.key === 'forum' ? '#1c1814' : tier.text;`.
Line 208, inside the same element's `style` object: `color: tier.text`, the badge's actual text
colour, not just the icon. Both read off the same hardcoded `TIER_BY_KEY` object Phase 1 already
found duplicated across four other files. For Heat, `tier.text` is `#FCEAD8` over a fill that runs
`#E89868` to `#C46028`, the measured 1.96:1 D-12 raised against the spec, now confirmed in the
component that renders.

Fixing this one file is the cheapest way to reach the whole defect. The file's own docstring says
it's shared by Private Draft and Discourse Layer, comment cards, contrast strips, nomination
panels, one import. Fixing it once reaches all of them; leaving it means the same edit has to be
made correctly, separately, in four files that currently agree only by coincidence of copy-paste.

What the fix costs: two hex values, already computed, not new work. Heat's ink moves from
`#FCEAD8` to `#1D0A02`, holding Heat's own border hue, darkened: 8.32:1 against the top stop, 4.61:1
against the bottom. Stance's moves from `#F4D8D0` to `#F9EAE6`: 4.91:1 top, 7.97:1 bottom. Both are
D-24's numbers, verified against both gradient stops with `tier-palette-audit.py`'s own `ratio()`
function, not new arithmetic filed here.

Land the fix at the same time as the mechanical change this file needs anyway: once `--tier-*`
tokens exist in style.css, `TIER_BY_KEY`'s hardcoded literals should be deleted in favor of reading
`var(--tier-*-text)` the same way the badge's background already reads `tier.top`/`tier.bot`. That
single change fixes Heat, fixes Stance, and deletes the fifth copy of the 28 numbers in the same
commit. One more small thing, same commit: once Heat's ink is dark, line 181's ternary should stop
being a Forum-only special case and become each tier reading its own computed ink, or the shape of
the bug just moves to whichever tier gets added seventh.

## The fluid scale

D-15, D-16, D-20 and D-25 asked whether Dialecta needs a spacing and type scale. style.css already
has one for type: six `clamp()` steps, `--type-display` down to `--type-meta`, used 5 times. Phase 1
counted 55 separate hand-picked font-size literals elsewhere in the file, the same 60 total the
frame cites. The gap isn't existence, it's adoption.

Adopt it opportunistically, during the port. The frame's own table has 21 files that need nothing
for identity reasons; every other file among the 51 is already being opened for an identity or
business-logic edit builder and security are sizing under question two. A file already open for
that edit costs nothing extra to also swap a `font-size: 0.84rem` for the nearest `var(--type-*)`
step where the two already match or are close. Reopening dozens of declarations later, in files
nobody otherwise needed to touch, costs real calendar time a file already open does not. Inside the
21 that need nothing, leave the literals alone rather than opening a file solely for this. Same
logic, same reason, for the nine ad hoc breakpoint values against the five named `--bp-*` tokens.

This extends D-25, it doesn't reverse it. D-25's four-number scale was proposed for the design
spec's gap, which is real: the spec defines no spacing scale at all. style.css's gap is smaller, a
scale that exists and needs enforcing, not inventing, and the port is the cheapest moment to close
it because the files are open regardless.

## Verdicts, by file

| File or token group | Verdict | Reason |
| --- | --- | --- |
| `_theme/assets/css/style.css` (3,286 lines; `_recovered-next/lib/theme/style.css` is byte-identical but stale and do-not-edit) | As-is | Confirmed live by `docs/SITE-INVENTORY.md`; 48 of 49 referenced tokens resolve here; single 149-line `:root` block already matches `extract-tokens.mjs`'s regex |
| `apps/web/src/styles/tokens.css` (58 lines) | Adapted | Stays generated; source flips to style.css after `--tier-*` lands there; gains paper, wood, brass and fluid-scale tokens it has none of today |
| `scripts/extract-tokens.mjs` (79 lines) | Adapted | One `specPath` change, gated on two named decisions (`--amber`, `--border-light`) and the tier-token sequencing above |
| `design/dialecta-design-spec.html` | Adapted | Role changes from value source to generated-from; `apps/web/CLAUDE.md` line 8 needs the same edit |
| `--paper-grain` token, `.dialecta-paper` class (style.css lines 86 to 91, 1603 to 1606) | As-is | Pure CSS custom property and data URI, no JS, no asset |
| `.post-card`, `.post-article` grain duplicates (lines 1928, 2024) | Adapted | Fold onto `var(--paper-grain)` while porting; the source's own comment already calls this owed |
| `body::before`, `.nav-drawer::before` sepia grain (lines 1657, 393) | Adapted | Same texture, untokenized, alpha already drifted 0.035 vs 0.04 between two sites a comment says match |
| `--wood-warm/mid/deep/edge/grain`, `.dialecta-wood-frame` (style.css lines 77 to 84, 1609 to 1638) | As-is | Pure CSS; only the border rim is live anywhere; zero conflict in apps/web today |
| `_recovered-next/lib/theme/shell.jsx` (226 lines) | Rewritten | Every mount point is a Ghost `.dataset` contract; behaviour (global settings host, visitor fallthrough) survives as a provider, not the code |
| `_recovered-next/app/layout.js` (86 lines) | Adapted | Merges with the live `apps/web/src/app/layout.tsx` (37 lines); neither file is a superset |
| `_recovered-next/app/components/SiteNav.js` (93 lines) | Adapted | Content ports as-is; its Ghost-apex-nav premise doesn't; swap `LOGO_URL` for the local `dialecta-logo.png` in the same change |
| `_recovered-next/lib/theme/dialecta-tier-badge.jsx` (265 lines) | Port with the fix | Lines 181 and 208 carry the measured 1.96:1 Heat defect into shipped code; fix is two computed hex values, landing with the token migration |

## What I have not read

`dialecta-discourse-layer.jsx`, `dialecta-private-draft.jsx`, `dialecta-fingerprint-engine.jsx`,
`dialecta-editor.jsx` and `dialecta-profile.jsx` beyond the grep and partial reads filed in Phase 1.
Their own copies of `TIER_BY_KEY` need the same fix as the tier badge, mechanically, but I haven't
verified each copy is byte-identical to the badge's, only that Phase 1 found the same 28 values by
grep in each. Mark that adapted, provisionally, pending a direct read of each file before anyone
commits to it.

## Rebuttal

Wood, checked everywhere named. `_theme/assets/` has no wood imagery. `page-pact.hbs` has no
mention of wood at all. `page-stewards.hbs` does: a 3px gradient spine built from `--walnut
#4a2810`, `--cherry #6e3917`, `--burnt #8a4a18`, a second wood vocabulary, independently named,
matching none of style.css's `--wood-*` values. And `components/dialecta-dashboard.jsx`, the
project's own build audit, logs a `WoodFrameProgressBar.jsx` component Complete, artifact path
`Components/WoodFrameProgressBar.jsx`. Repo-wide search: zero hits. Built, marked done, and lost
before this recovery was made.

One correction to my own Phase 2 read: I called the wood-edge treatment nearly unused. That
measured style.css's internal references only, not the class it produces. Counted:
`dialecta-wood-frame` and bare `var(--wood-edge)` hairlines appear 30 times across
`dialecta-discourse-layer.jsx` and `dialecta-private-draft.jsx`, the two busiest surfaces in the
tree, nine of them the full card treatment. Wood is not neglected: used constantly, and
every use is the same rim.

Tier badge: philosopher's as-is doesn't dispute my contrast finding. Philosopher never saw it:
their own cross-check list names P-1 through P-11 and the charter, not my Phase 1 read. Not a
values disagreement. The frame itself defines as-is as import and token fixes only; a hardcoded
hex literal is neither. Shipping the file unfixed is a defect carried forward wearing a port's
name, by the frame's own rule, not my opinion. Mine to call, and nothing here is contested.

Settled: `_recovered-next/app/globals.css` drops. Its `:root` re-defines tokens a third time
(`--amber` matches the spec, not style.css); apps/web's own globals.css defines no tokens at all,
only consumes them, so there is nothing to merge. `dialecta-archetype-grid.jsx` is not redundant
with `archetypes.ts`: eight names against eight full fingerprint profiles feeding the engine's
real data shape. `_theme/scripts/build-archetype-svgs.jsx` imports it directly and rasterizes its
eight archetypes to the PNGs already sitting in `_theme/assets/`. Adapted, not dropped.
