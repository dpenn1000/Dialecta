# The recovered source, read

*designer position, 2026-09-20. Reads `docs/RECOVERED.md`, `docs/SITE-INVENTORY.md`, the charter
rewritten today, ADR-004, both design systems, the real fingerprint engine, the tier badge
primitive, five of the 51 recovered components, and the live Pact page. Extends D-11 through D-26
and answers ADR-004's items left open for this seat.*

## Brief

Two verdicts. First: `_theme/assets/css/style.css` is what production runs on, not
`design/dialecta-design-spec.html`. Of the 49 distinct custom properties the 51 recovered
components actually reference, 48 resolve in style.css and only 10 resolve in the spec, two of
those ten at a different value. The spec's one undiluted win is the seven-tier palette, which
survives as copy-pasted literals, not a live binding. Second: ADR-004's residual is cheap where the
engine already has the mechanism (turbulence, ratio-based dilution) and open where it has nothing
at all (no breach signal reaches the data shape, and a Breach has no axis to be local to). Detail
below; nothing here is a proposal, only what I found and what it implies.

## Which design system is authoritative

**`_theme/assets/css/style.css`, and it is not close.**

I pulled every `var(--...)` reference out of the 51 files under `_recovered-next/lib/theme/`, the
front-end source closest to what actually mounts into the live Ghost pages. 49 distinct custom
property names, over 1,000 total references. `--font-mono` alone appears 129 times, `--brass-mid`
95, `--ink` 93, `--wood-edge` 76. I checked each of the 49 against both artifacts' `:root` blocks.
**48 resolve in style.css. Ten resolve in the spec.** The ten that resolve in the spec are almost
entirely the four font-family tokens plus `amber`, `bg-white`, `border-light`, `gold`, `terra`,
`text-lede`, which is the small, genuine overlap between the two systems. Everything else, the
five-step brass ramp, the five-value wood-trim system, `ink`/`body`/`secondary`/`tertiary`,
`paper`/`paper-bright`, `nav-height`, the fluid spacing primitives (`page-pad`, `gutter`,
`reading-max`, `rail-w`, `post-pad-x/top/bottom`), the fluid type scale (`type-display` through
`type-meta`), exists only in style.css. The spec has never heard of any of it. Reproduce with:
`grep -rohE "var\(--[a-zA-Z0-9-]+" _recovered-next/lib/theme/ | sort -u`, then check each name
against both `:root` blocks.

**Even the overlap disagrees.** `--amber` is `#b8732a` in the spec and in the one place I found
that still forks its own `:root` (`page-pact.hbs`, more below). In style.css it is `#b8862e`,
labelled in the file's own comment as `/* = --brass-mid */`. Same name, two different colors, no
record anywhere of which one is the decision. `--border-light` is worse: the spec defines it as a
flat `#e8e0d0`; style.css defines it as `rgba(180,175,165,0.28)`, a translucent value that renders
differently depending on what sits under it. A foundational token that is supposed to mean one
thing means two different mechanisms depending on which file you're standing in.

**style.css has real design thinking in it that the spec doesn't.** The wood-trim system
(`--wood-warm/mid/deep/edge/grain`) ships with a comment that scopes its own use: "reserved for the
reflection bar's own family of components... We are not using mahogany or walnut here." That's a
team writing down a restraint the spec never once exercises anywhere in its 636 lines. The type
scale is fluid (`clamp()`-based, six steps, `26px → 72px` for display down to `12px → 14.4px` for
meta) and the spacing primitives are fluid too. Five named breakpoints exist as reference values
(`--bp-sm` through `--bp-xxl`), and I found at least one of them, `1100px`, hand-copied correctly
into a JS `matchMedia` hook in `fingerprint-page-mount.jsx`. None of this is in the spec. It was
built after the spec, or beside it, by people who had moved on from it.

**The tier ladder is the one place the spec's content survived, and it survived by copy-paste, not
by reference.** style.css defines zero `--tier-*` tokens, zero `.forum`/`.spark`/etc. classes, and
none of the 28 tier hex values appear anywhere in its 3,286 lines. I checked all 28 individually.
But `_recovered-next/lib/theme/dialecta-tier-badge.jsx`, the shared primitive imported by both
`dialecta-discourse-layer.jsx` (live comment cards, the topology bar, the Contrast Strip) and
`dialecta-private-draft.jsx` (the compose flow), carries the identical 28 values as hardcoded JS
literals: `top: '#FEFBF0', bot: '#F8F0D8', border: '#E8D080', text: '#6A5410'` for Forum, and so on
through Breach. So does `dialecta-fingerprint-engine.jsx`'s `TIERS` object, and `dialecta-editor.jsx`
and `dialecta-profile.jsx` by grep. The spec's numbers reached production. The spec's mechanism
(a token, referenced) did not. Five independent files each own a private copy of the same 28
numbers, which is a value that will drift the moment any one of them is edited alone, and nothing
would catch it.

**Recommendation.** style.css becomes the system of record, because it already is one in every
place except the tier ladder: five months of real component work ran on it, not on the spec, and
its ideas (the fluid scale, the wood system's own restraint) are better than what I was proposing
to bolt onto the spec in D-20 and D-25. Concretely, that means: reconcile `amber` and
`border-light` as an explicit decision, not a silent one, add `--tier-*` tokens to style.css itself
(the D-19/D-24 ink contract already computes what they should be), migrate `dialecta-tier-badge.jsx`
onto them since it is the one file that feeds both comment cards and the composer, and flip
`scripts/extract-tokens.mjs` so the spec is generated *from* style.css rather than style.css
drifting silently away from a spec nobody's build consumes. The spec's other role, teaching a new
reader what the palette means, is worth keeping. It is not worth hand-maintaining as a second
source of values that disagrees with the first one twice already.

**What happens to `apps/web`'s tokens.** `apps/web/src/styles/tokens.css`, which the D-11 through
D-19 contrast audit was actually measured against (its own header says so:
"generated from design/dialecta-design-spec.html v1.3"), inherits the spec's values, including the
wrong `amber` if style.css's is the one Dan picks. Worth flagging before anyone treats that audit
as a statement about what a user sees today: it was correct about `apps/web` and silent about
`style.css`, which is the gap this read closes.

## ADR-004: the residual in the real engine

Read `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx` in full, 910 lines, and its mount
file, `fingerprint-page-mount.jsx`. **Cheap in the render half. Open, genuinely, in the data half,
and that part is not mine to close alone.**

**What already exists and can be reused directly.** The engine derives `purity`, `turbulence`, and
`clarity` per axis from a `tierMix` (a count of comments at each tier on that axis), and turbulence
already produces exactly the visual signature ADR-004 asks for: `turbulenceWave()` layers a
multi-frequency wave onto the ring radius, amplitude and frequency both scaling with how turbulent
the history is. That is "spiked variation in the line," built, tested, and running today for
Heat/Stance-heavy regions. Dilution is native to the file's own idiom, not something to invent: the
halo's inner color is already tinted by `fogRatio`, `heatRatio`, and `stanceRatio`, each a count
divided by a total that grows as the contributor writes more, so the tint's share shrinks on its
own as the denominator grows. ADR-004 asks for exactly this shape ("shrinks by dilution... a
property of the shape rather than a timer anyone has to tune") without having read this file, which
is a good sign the ask fits the engine rather than fighting it. Extending the same blend chain with
a fourth `breachRatio` term is a few lines, not a rewrite.

**What is genuinely missing, and it's upstream of this file.** `packages/core/src/axis-mapping.ts`
enforces Universal Rule 1 with `SUPPRESSED_TIERS = new Set(['breach'])`: a breach comment returns
all six axis deltas as zero, confirmed in that file's own tests ("still returns all six axes for a
breach comment, all zero, rather than a shorter array"). That means a Breach produces **no
representation anywhere** in the `data` object this engine receives. Not a small count, not a flag,
nothing. `fingerprint-page-mount.jsx`'s own data builder confirms the shape: six axis keys, each
`{ graduations, tierMix, topicPhases }`, nothing else. A breach residual needs a new field carried
in from wherever a contributor's full data gets assembled for their own profile render, which I
have not read (most likely `dialecta-profile.jsx`, 2,865 lines, out of scope for this pass) and
can't size. Say plainly: this is real work, it's outside this file, and I can't tell you if it's an
hour or a week without reading the piece that currently has zero opinion on breach counts at all.

**The geometric question ADR-004 leaves to this seat has a real answer, and it's a real choice, not
just an implementation detail.** Heat and Stance turbulence is axis-local by construction: a Heat
comment earns weight on whichever axis it landed on, so its wave rides that axis's angular slice of
the ring. A Breach comment never lands on any axis, so it has no angular home to ride. The cheap
path the engine's own architecture points to is a global perimeter modulation, added once to the
`radius +=` line independent of the axis interpolation, rather than threaded through the
per-axis-blend machinery that turbulence uses today. My recommendation: do it that way, at a
frequency and amplitude band distinct from the Heat/Stance wave, so a fingerprint with breach
history doesn't just read as "more turbulent" but as a third, separate texture the eye can tell
apart, and scale it by a `breachRatio` computed the same way `heatRatio` already is. For color: the
ADR's own worry, that reusing `#6A1818`/`#380808` on a petal will read as "this is a breach" rather
than "this history contains one," is worth taking seriously and is cheap to avoid: pick a distinct
oxblood. `page-pact.hbs` already has an unused candidate in the same family, `--ox: #5a2410`, today
scoped to the signature field's ink color and used nowhere else. I'd treat that as a lead to
evaluate against the fill it needs to sit on, not a ready answer.

**One more gap the seed-state branch has.** When every axis is at zero graduations, the engine
returns early with seed dots and nothing else (`maxGrad === 0`, lines 313 to 329). That branch has
no awareness of breach data today and would need its own logic for a contributor whose only history
is breach comments: under the ADR's own philosophy ("we are all entitled to a bad day"), that
person should render *something*, not the same blank seed as someone who has never posted.

**Secondary, smaller finding.** The 780-line `components/dialecta-fingerprint-engine.jsx` I was
told to treat as a dated snapshot supports a `theme` prop and a `resolveTheme()` function, light
and dark palettes for the guide stroke, center glow, center dot, and label color. The 910-line
recovered engine has none of this: colors are read straight off a single hardcoded `T` object, no
theme prop at all. Dark-mode support for the fingerprint specifically was dropped somewhere between
these two generations, or never carried forward. Small, but worth a line in case dark mode comes
back into scope before this component does.

## The rest of the visual language: what the 51 components actually run on

The token tabulation above already answers "what's shared" quantitatively. In prose: five files
worth naming for what they are, since nobody has read them until today.

**`dialecta-tier-badge.jsx` (265 lines) is the load-bearing shared primitive**, not a one-off. Its
own docstring says so: "Shared by the Private Draft engine... and the Discourse Layer engine (live
comment cards, contrast strips, nomination panels)." Confirmed by import: `dialecta-discourse-layer.jsx`
and `dialecta-private-draft.jsx` both pull `TierBadge` from it. That makes it the single highest-
leverage fix in the whole tree: correcting the Heat and Stance ink values here, once, reaches every
comment card, the composer's self-declaration grid, and the nomination panel at the same time,
rather than needing the same edit made four separate times across four files that happen to agree
today by coincidence of copy-paste.

**The same file reproduces the exact contrast mistake I predicted from the spec, in running code.**
Line 181: `const iconColor = tier.key === 'forum' ? '#1c1814' : tier.text;`, with a comment
explaining that Forum's icon needed a special case because "the Forum chip is near-white cream,
tier text color would have insufficient contrast there." That's correct: Forum measures 6.39 to
7.02:1, comfortable, no fix needed. But the component special-cases the one tier that was already
fine and leaves every other tier, Heat included, rendering `tier.text` directly as both the badge's
text color and (via the icon's `currentColor`) its icon color. Heat's `text` is `#FCEAD8`, a light
cream, over a fill that runs `#E89868` to `#C46028`. That is the literal 1.96:1 defect D-12 raised
against the spec, now confirmed sitting in the component that ships. This is no longer a finding
about what a design document implies; it's a finding about what line 205 to 213 of a real file
renders.

**`dialecta-discourse-layer.jsx` (1,251 lines, the feed itself) and `dialecta-private-draft.jsx`
(1,796 lines, the compose ritual) are both built almost entirely in inline styles, not CSS
classes.** 59 `style={{...}}` blocks against 2 `className=` uses in the discourse layer file alone.
style.css has no `.comment-card`, no `.contrast-strip`, no `.discourse-layer` class of any kind,
only a `.post-discourse-chip`, which is the teaser link under an article that points *into* this
mount, not the mount's own content. This matters for D-22, my standing position that the Contrast
Strip is under-weighted: that argument was built against the spec's `.ai-card` CSS component, which
this file does not use and was never going to use. D-22's conclusion may still be right, but its
evidence was aimed at the wrong artifact. Re-deriving it against the actual inline styles in
`dialecta-discourse-layer.jsx` is unfinished work, not something I'm asserting today.

**`dialecta-sidebar.jsx` (1,595 lines)** mounts on every post page and stacks nine single-purpose
cards (Pulse, Your Comment, New in the Conversation, the Delta, table of contents, the Writer, a
rotating quote, the Argument placeholder, related articles). It is the single largest concentration
of "many small surfaces, one shared rhythm" in the tree, and the component most likely to expose a
spacing inconsistency once instrumented, since nine cards sharing one sticky column is exactly the
Gestalt-proximity case D-15 was written about, just not the one (the comment card) D-15 used as its
example.

**`dialecta-opinion-map.jsx` (958 lines)** is explicitly a rebuild: "Lifted from the OneDrive
prototype `dialecta-opinion-maps.jsx` and pared down to canonical, read-only-capable components."
Cartesian and other placement visualizations, parameterized by axis pairs. Not yet cross-checked
against style.css's token list in detail; flagging it as read but not fully audited.

**`dialecta-archetype-grid.jsx` is not live code and its own docstring says so**: "NOT imported by
the runtime bundle. Reserved for the build-time SVG generator." It's the data source for a Node
script that pre-renders eight archetype fingerprints to static SVG, specifically because mounting
eight live `Fingerprint` instances tanked page performance in an earlier attempt. Worth knowing
before treating it as a component to style: it's a data table with a pipeline note attached, not a
surface.

## Standards, redone against what ships

My own D-11 through D-19 numbers were computed against `apps/web/src/styles/tokens.css`
(mechanically generated from the spec, per that audit's own header) and D-15/D-16 against the spec
directly. Neither is what a visitor to the live Ghost site sees. Redone here against style.css.

**Type scale: worse in practice than the spec, despite better infrastructure.** style.css defines a
genuinely good fluid scale, six `clamp()` steps from `--type-meta` to `--type-display`. It is used
five times in 3,286 lines. Everywhere else, literal `font-size` declarations are hand-picked: **55
distinct values**, against the spec's 29. This is a different failure than D-15 described. The spec
never built a scale. style.css built one and didn't adopt it. The fix is smaller than D-15 proposed
for the spec (enforce an existing scale, not invent one) but the discipline gap is larger.

**Breakpoints: nine ad hoc pixel values in `@media` queries, not the five named tokens.** 539, 600,
700, 720, 767, 1099/1100, 1199, 1600, 1900. CSS custom properties can't be used inside a `@media`
condition, so `--bp-sm` through `--bp-xxl` are reference values only, hand-copied into both CSS and
JS (I confirmed one clean copy: `--bp-lg: 1100px` matches a `matchMedia('(min-width: 1100px)')`
call in `fingerprint-page-mount.jsx`). 600, 700, and 720 don't map to any named token; three
near-identical "medium" cutoffs that look like drift within style.css's own better system, not just
against the spec's single 768px.

**The 380px floor in my charter is close but not the number the codebase itself designs to.**
style.css's own comments target 375px explicitly ("Mobile-first DESIGN: sketch the 375px experience
first," and later, exact padding numbers "phone (≈375px)"). 375 is narrower than 380, so nothing
that clears my floor should fail theirs, but citing their number precisely is more useful than
citing mine when the two don't quite match.

**A referenced custom property that resolves to nothing.** `--text-prose` is used five times across
the recovered components (`dialecta-article-classification.jsx`, `dialecta-opinion-map-placement.jsx`,
and inside style.css itself) and is not defined anywhere in style.css's `:root`. The one use inside
style.css itself guards it with a fallback, `var(--text-prose, #3a342c)`, but that fallback is
`--body`'s ink-dark color, not the lighter slate-grey `#5e6066` the spec assigns to reading prose.
I did not check whether the other two call sites guard it the same way or leave it bare; flagging
rather than asserting either way.

**Contrast: unchanged in the numbers, upgraded in what they mean.** The D-24 computation (Heat's ink
needs to move to a dark `#1D0A02`, holding its own border hue; Stance's needs to move lighter, to
`#F9EAE6`) still holds; nothing about reading the real files changed the arithmetic. What changed is
where the fix has to land: not one spec token, but the hardcoded literal inside
`dialecta-tier-badge.jsx` (and its siblings in the engine, editor, and profile files), since that is
what a browser actually renders.

## What this confirms, what it overturns

| Position | Verdict | Why |
|---|---|---|
| D-13 (Stance/Breach one color under CVD) | Confirmed, unchanged | Tier values are identical across spec, engine, and tier-badge; the finding travels with the numbers wherever they render |
| D-19 / D-24 (tier ink contract, computed Heat/Stance fix) | Confirmed, raised in stakes | Found the exact defect in `dialecta-tier-badge.jsx` line 181, not only implied by the spec. Landing zone changes: the component's hardcoded literal, not (only) a spec token |
| D-15 / D-16 / D-20 / D-25 (Dialecta needs a spacing and type scale) | Partly overturned | style.css already has a fluid scale for both. The real gap is adoption (5 of 60 font-size declarations use it), not existence. Whether Dialecta's answer should be Trinity's static snap-grid (what D-25 proposed) or enforcement of the fluid system already live is now an open question, not a clean extension of D-25 |
| D-22 (Contrast Strip under-weighted) | Evidence undermined, conclusion untested | Argued against the spec's `.ai-card` CSS class; the real component is 59 inline styles and 2 classNames, touching no CSS class at all. Needs re-deriving from the actual file, not re-asserted from this read |
| Pact review, mobile padding bug | Overturned for what ships | True of `components/dialecta-pact.html` (the prototype). `page-pact.hbs`, the live page, already has three breakpoints (768, 720, 480) correctly scaling `.parchment-inner` padding down to phone width |
| Pact review, "forks the spec under renamed variables" | Confirmed and sharpened | `page-pact.hbs` forks a third time: neutrals match style.css's names and values, `amber`/`gold-bright` match the spec's values instead, and the tier-row Breach color (`#5a1818`) matches neither of the other four places Breach is defined |

Not filed as new D-numbers; this is a read, and the table above is for `decider` and whoever picks
up the tier-token migration to use as a starting map, not a ruling.
