# Live vs localhost: a direct comparison

*Designer, 2026-09-21. Requested by Dan: compare `https://www.dialecta.org/` against
`http://localhost:3050/`, pair by pair, and say for each difference whether the port kept what he
built.*

## Method, and where it fell short

Both sites were loaded signed in, in Dan's own Chrome, via Claude in Chrome. Live is
`Daniel Pennington`; local is a session not yet linked to a profile (item 2.1, already tracked,
not a design finding on its own).

**The 390x844 width could not be set as requested.** `resize_window` reported success on every
call but never changed the real window: `window.outerWidth` stayed pinned to the screen's own
width (measured 2048px, later 2258px, both far past any width this task asked for) across three
separate attempts at three different target sizes. The window is maximized on Dan's desktop and
nothing in this tool set can un-maximize it. Consequences:

- **Desktop passes were real, at the browser's actual width, not literally 1440px.** Both sides
  were always compared at the same real width in the same round of tests, so every relative
  finding below (present on one side, absent on the other) holds regardless of the exact number.
  Where a live breakpoint matters (the site-rail hides under 1100px), I say so explicitly.
- **Mobile passes used a same-origin iframe overlay** (390x844, injected into the already
  signed-in top-level tab, same origin so cookies and session carry over) rather than a resized
  window. This is reliable for static layout and was used to confirm the header, nav and site-rail
  behave as expected at mobile width on `/`. It is not reliable for deep-scroll testing: one
  attempt at depth on the article page timed out the screenshot call entirely. Mobile scroll depth
  on long pages is therefore **not confirmed** past the first viewport, on either side, for most
  pairs. Where I have a real mobile measurement I say so; where I do not, I say that too.

One local tab (`http://localhost:3050/articles/on-the-far-shore-of-fear`) could not be closed at
the end of the session: closing its sibling tab dissolved the tracked tab group before I could
close it, and it fell out of reach of `tabs_close_mcp`. It is an ordinary local dev tab, nothing
was submitted or changed, and it can be closed by hand. Screenshots taken during this session are
attached to the conversation; the extension's `save_to_disk` did not produce a file path I could
locate anywhere on disk (checked `Downloads`, `Pictures\Screenshots`, the Claude temp scratch
directories and `C:\Dialecta` itself), so this report cites them by description and by the
measurements taken alongside them rather than by a file path.

Nothing was submitted, signed, posted, followed or saved on either site. The one place this needed
care, live's own "Declare" opinion-map modal opened once during scroll testing; it was dismissed
with Escape, not by clicking into the map.

---

## Regressions worth fixing, ranked

Six, not ten. Every difference this audit turned up is catalogued below, classed and given a
severity; most are intended, already tracked, or improvements. Six are real code-level regressions
with a clear fix, and that is the honest count rather than a padded one.

### 1. Long sections go blank past the first screenful. Critical.

**Page:** `/articles/on-the-far-shore-of-fear` and `/pact`, both at the real desktop width tested
(~2048 to 2275px). Not confirmed or ruled out at 390px; the document is taller there (15,444px
against 12,004px desktop on the article page), which if anything makes the same failure more
likely, not less.

**What live does:** renders correctly at every scroll depth tested, including well past the point
where local fails on the same content. Confirmed by scrolling the live article to a comparable
depth and by dismissing the "Declare" modal (which live opens automatically once you scroll past
the article) and finding the page fully painted underneath.

**What local does:** on the article page, text renders correctly for roughly the first 250 to 330
screen pixels of the viewport at every scroll position tested (six consecutive positions, each
showing different, correctly-advanced paragraph text at the top), and the remainder of the
viewport, roughly 450 to 500px, paints solid white. On `/pact`, the section carrying "I understand
and want to participate." paints the same way: fully blank where a real, correctly-styled,
non-transparent `<h2>` (`color: rgb(28, 24, 20)`, opacity 1, visibility visible) sits inside a
`<section class="pact-module__parchment">` with a real gradient background. Confirmed not to be a
background-tab artifact: reproduced after an explicit real click on the tab, and reproduced fresh
after a full page reload.

**Root cause, with the team's own prior art.** `apps/web/src/components/content/pact/pact.module.css:56` to
`92` already documents this exact Chromium hazard, and a first fix for it:

> "The live 0.18 opacity lives inside the tile (the rect's opacity), not on this pseudo-element:
> CSS opacity on a box the sheet's full height forces an offscreen surface that tall, and at a
> 2.25 pixel ratio that stalled Chrome's renderer. Same pixels, painted as a plain tiled
> background."

That fix covers `.parchment::before` (the grain layer) only. The same hazard is still live on the
`.parchment` container itself: `overflow: hidden`, `border-radius: 6px` and a four-layer
`box-shadow` (two of them inset) on a section whose height is unbounded content
(`pact.module.css:56` to `71`). And it is live, independently, on `.dialecta-sheet`
(`apps/web/src/styles/dialecta-surfaces.css:269` to `284`): `background-image: var(--paper-grain)`,
an SVG `feTurbulence` filter, plus a four-layer `box-shadow`, on an element whose height is the
entire article body, 9254px on this piece alone.

**Fix:** apply the same principle the team already used for `.parchment::before` to the containers
themselves. Do not combine a full-height offscreen-surface trigger (an SVG-filter background,
`box-shadow`, or `overflow: hidden` plus `border-radius`) with an element whose height is
unbounded content. Either move the grain, rounded corners and shadow onto a bounded decorative
layer (fixed height, tiled or repeated), or drop the clipping and shadow from the outer element and
carry them on a wrapper sized to a screenful rather than to the whole card.

**Why it is first on this list:** it does not cost a widget or a nicety, it costs the article
itself and the Pact's own commitment step, for any reader who scrolls a normal amount.

### 2. The persistent site-rail is missing everywhere. High.

**Pages:** confirmed absent on `/`, `/articles`, `/articles/on-the-far-shore-of-fear`, `/pact`,
`/guidebook`, `/community`, `/stewards`, `/about`, `/fingerprint` and `/profile/dpenn1000`, at
desktop width. Correctly absent from `/write` on both sides (see "What the port got right").
**Desktop only**, confirmed by live's own stylesheet: the rail hides under 1100px, so this is not a
390px finding.

**What live does:** a persistent right-hand rail, quote, "On Dialecta" counts, "Live Now,"
"Recently Published," "Stewards Today", that live's own stylesheet says explicitly is shell-level:
`_theme/assets/css/style.css:1773` to `1787`, "the DialectaSidebar moved out of post.hbs and into
the default shell so it persists across every page." Two-column grid, `1fr 320px`, sticky, hides
under 1100px (`:1820` to `1823`), exempted only on `/write` (`:1825` to `1830`).

**What local does:** no `.site-rail`, `.site-sidebar` or any `aside`, `[class*=rail]` or
`[class*=sidebar]` element exists anywhere in the rendered DOM of any page checked (confirmed by
query, zero matches). `apps/web/src/app/layout.tsx` ports the header, a plain content div and the
footer, and its own comment calls this "the frame every page renders inside... ported from
`_theme/default.hbs`, which is the specification for the site as it looks today." The rail is
half of that specification and is not there.

**Fix:** add the two-column shell to `apps/web/src/app/layout.tsx` (or a component it renders,
e.g. `apps/web/src/components/shell/site-sidebar.tsx`), matching live's grid, sticky behaviour and
1100px breakpoint, seeded at minimum with the static rotating quote and "Recently Published" (both
derivable from data the app already queries), with the presence-based widgets ("Live Now," the "On
Dialecta" counts, "Stewards Today") stubbed the same way live itself currently ships them, live's
own "Live Now" is labelled "MOCKED, live signal coming."

### 3. The reading-stage bar and the Declare mechanic are unported. High, and it is a feature, not a style fix.

**Page:** `/articles/on-the-far-shore-of-fear`, desktop confirmed absent; not checked at 390px.

**What live does:** a five-tab reading-stage bar above every article, Reflect (pre-read), Read
(reading), Declare (after reading), Discourse (N voices), Bio (author), plus Share. Scrolling past
the end of the article opens a "Declare" modal: an opinion-mapping exercise ("Where does meaning
come from? Fixed Tradition, Open Inquiry", a draggable position on a spectrum, "Where the author
lands," "How the engine read this"). This is the front end of a named, specified mechanic:
`docs/Dialecta_Delta_Mechanic_Spec.md`, "Article-level position tracking and the Reviser pathway,"
v1.0, April 2026, the infrastructure the Reviser archetype is built on.

**What local does:** nothing. No match anywhere in `apps/web/src` for the stage labels, a stage-bar
class, or the article-to-conversation transition class live uses (`dd-transition`) as a landing
point for one. The nearest existing code is
`apps/web/src/components/discourse/discourse-root.tsx`, which starts at the comment feed with
nothing above it.

**Fix:** this is a scoped feature build (pre-read capture, the stage nav itself, the Declare modal,
wiring to whatever stores the delta), not a one-line patch. Flagging it for the backlog rather than
naming a single file and fix.

### 4. The article's featured image is dropped. Medium-high.

**Page:** `/articles/on-the-far-shore-of-fear`, desktop confirmed; not checked at 390px.

**What live does:** a real photograph above the title
(`/content/images/size/w1000/2026/04/v855sq14xoazk8EBm4D6o`).

**What local does:** nothing above the title. Not a rendering bug: `ArticleSummary`/`Article`
(`apps/web/src/lib/articles.ts:7` to `20`) never name a `feature_image` field, so the query never
asks for one and the page has nothing to render even if it wanted to.

**Fix:** add `feature_image: string | null` to the type, select it in the query, render it above
the title on `apps/web/src/app/articles/[slug]/page.tsx`, matching live's placement.

### 5. The profile page has three small rough edges. Medium.

**Page:** `/profile/dpenn1000`, desktop confirmed; not checked at 390px.

- **Fourth tab, wrong name.** Live: Engagement / About / Influences / **Growth**. Local: Engagement
  / About / Influences / **Articles**.
- **Missing join date.** Live: "Joined, Pheonix, AZ" under the handle. Local: "Pheonix, AZ" only.
- **Wrong person.** Live, Dan viewing his own profile: "SEE MY WRITING". Local, same person, same
  page: "SEE THEIR WRITING". This one is a direct symptom of item 2.1 (the signed-in session is not
  yet linked to this profile, so the app has no way to know Dan is looking at himself), not an
  independent bug, but it is the kind of wrongness a signed-in reader notices immediately.

**File:** `apps/web/src/app/profile/_components/ProfileView.tsx` and `panes.tsx` (tab labels, the
my/their branch, the joined-date line).

**Fix:** rename the fourth tab, add the join date to the query and the line, and confirm the
my/their branch is already keyed on the right condition so it self-corrects once 2.1 lands (worth
a quick check even though the underlying wiring is someone else's).

### 6. Comment timestamps switched from relative to absolute. Low.

**Page:** `/articles/on-the-far-shore-of-fear`, desktop confirmed.

**What live does:** both comments read "20w ago."

**What local does:** the same two comments read "Apr 30, 2026" and "Apr 29, 2026."

**File:** `apps/web/src/components/discourse/feed.tsx`.

Small, and possibly nobody's considered choice either way, flagging it because it is measured and
because a consistent convention (relative everywhere, or absolute everywhere) reads as more
finished than a page that does both.

---

## Every difference, page by page

Live on the left, local on the right, per the task's pairing. Width is the real desktop width
tested (~2048 to 2275px) unless marked mobile (390px, via the iframe technique described above).
Class: (a) intended, (b) port regression, (c) live bug the port fixed, (d) data gap rather than
design.

### `/` (home)

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | Signed-in homepage renders a full personal dashboard: fingerprint teaser, engagement stats, Connections, Classified Comments, "What's Alive" activity feed, sidebar (see below) | Renders the plain article feed, same as a signed-out visitor minus the join card | d | High visually, but already deferred in `apps/web/src/app/page.tsx:10-19`'s own comment: blocked on `profiles.user_id`, "wiring the member branch is one redirect once identity lands" |
| 2 | Persistent site-rail present (desktop) | Absent | b | High, see Regression 2 |
| 3 (mobile, 390px) | Nav collapses to hamburger + avatar; dashboard content stacks single-column | Nav collapses the same way; article cards stack single-column | a (no rail below 1100px on either side) | n/a |

### `/articles`

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | Hero italic word "Article" is a five-stop brass gradient text, `linear-gradient(95deg, #D4A84A 0%, #ECB438 22%, #F5DFA0 50%, #ECB438 78%, #D4A84A 100%)`, clipped to text | Flat ink, `color: rgb(74, 40, 16)` (`--walnut`, `#4A2810`) | a, D-27 applied correctly | n/a, see "What the port got right" |
| 2 | Persistent site-rail present | Absent | b | High, see Regression 2 |
| Otherwise | "THE LIBRARY / Every Article" hero, subtitle, rule, then five article cards, then footer | Matches structurally card for card | a | n/a |

### `/on-the-far-shore-of-fear` (live) vs `/articles/on-the-far-shore-of-fear` (local, real comments)

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | Renders correctly at every scroll depth | Blank past ~300px of viewport once scrolled deep | b | Critical, see Regression 1 |
| 2 | Reading-stage bar + Declare modal (the Delta mechanic) | Absent entirely | b | High, see Regression 3 |
| 3 | Featured image above title | None | b | Medium-high, see Regression 4 |
| 4 | Article-level tier badges: "AUTHOR DECLARED The Spark, ENGINE READ The Forum, FINAL The Forum" | Not checked (deprioritised once the blank-render bug and the missing stage bar, which houses this UI on live, were found) | not verified | n/a |
| 5 | Two real comments, Kathryn Pennington (Forum) and Daniel Pennington (Echo), content and order match | Same two comments, same content, same order (Quality sort ranks Forum above Echo regardless of date) | a | n/a |
| 6 | Timestamps read "20w ago" for both | Timestamps read "Apr 30, 2026" / "Apr 29, 2026" | b | Low, see Regression 6 |
| 7 | Persistent site-rail (this page's version: "The Pulse" widget, "New in the Conversation") | Absent | b | High, see Regression 2 |
| 8 | REPLY and NOMINATE FOR RECLASSIFICATION controls under each comment | Not confirmed either way, page-text extraction truncated before reaching them and I did not screenshot that exact region cleanly | not verified | n/a |
| 9 | Composer shows "8 more words to reflect" progress copy | Same composer present; not compared in detail once the blank-render bug took priority | not verified | n/a |

### `/pact`

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | "BEFORE YOU ENTER / This is the pact." and "WHY THIS EXISTS / Most platforms reward the wrong thing." cards render correctly at every depth checked | Same two opening cards render correctly | a | n/a |
| 2 | Signature section: "SIGN YOUR NAME BELOW," nine handwriting-style font choices, "I Understand, Enter" gold button, three sun ornaments, page mark "I-VIII" | Same signature section present and stylistically close; button gradient looked slightly flatter than live's on a quick visual pass, not measured precisely | not fully measured | n/a |
| 3 | (further down) fully painted | The section containing "I understand and want to participate." (real, correctly-styled text, confirmed by query) paints blank | b | Critical, see Regression 1, same bug as the article page |
| 4 | Persistent site-rail present | Absent | b | High, see Regression 2 |
| 5 | Signing is disabled with an explanatory note (per the task's already-recorded list) | Same | a | n/a |

### `/guidebook`

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | "The Living Guidebook", italic word in brass gradient | Flat ink italic | a, D-27 | n/a |
| 2 | "01, MISSION / Philosophy & Core Rules" card and body copy | Matches closely, word for word in the portion compared | a | n/a |
| 3 | Persistent site-rail present | Absent | b | High, see Regression 2 |

### `/community`

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | "Where the discourse lives", italic word in brass gradient; feed with FEED/CONTRIBUTORS tabs, type and topic filter chips, Hot/Newest sort, article cards each carrying a tier chip | Same structure, same filter chips, same tier chips (Forum teal, Spark amber, Forum purple context tag for Theology and Spirituality) | a | n/a |
| 2 | (per the task's already-recorded list) archetypes and feed names present | Absent, per the same list | d, already known | n/a |
| 3 | Persistent site-rail present | Absent | b | High, see Regression 2 |

### `/stewards`

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | "Trusted by their readers, chosen by their work", italic tagline in brass gradient | Flat ink italic | a, D-27 | n/a |
| 2 | "THE MODIFIER / Cadence: the rhythm of contribution" card, then the six-cadence row (Daily, Serial, Periodical, Quarterly, Occasional, Magnum Opus) | Matches, cadence row present with the same six labels and descriptions | a | n/a |
| 3 | Persistent site-rail present | Absent | b | High, see Regression 2 |

### `/about`

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | "Where ideas are the protagonist.", brass gradient italic | Flat ink italic (the page D-27 was written about) | a, D-27, confirms the ruling is applied here too | n/a |
| 2 | "01 THE PROBLEM / The platforms got the incentives wrong.", same gradient-to-ink pattern on the accent word | Same pattern applied | a, D-27 | n/a |
| 3 | "The result, a civilization measurably angrier" body copy, pull-quote card | Matches in the portion compared | a | n/a |
| 4 | Persistent site-rail present | Absent | b | High, see Regression 2 |

### `/fingerprint`

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | "The Thinking Fingerprint", brass gradient italic, `background-image` present, `-webkit-text-fill-color: transparent` | Flat ink, `color(srgb 0.294 0.192 0.0706)` roughly `#4B3112`, `background-image: none` | a, D-27 | n/a |
| 2 | "THREE CONTRIBUTORS / The same six axes. Three completely different lives." intro, contributor list still loading at capture time ("LOADING CONTRIBUTORS") | Same intro; contributor list (Maya Reiss, Wen Zhao, Father Anselm Okafor) already loaded with role subtitles | timing difference, not a finding | n/a |
| 3 | Ring/halo/spiral treatment | Per the task's already-recorded list: rings run concentric where live spirals, halo scales with figure size | a, already recorded | n/a |
| 4 | Persistent site-rail present | Absent | b | High, see Regression 2 |

### `/profile/` (live) vs `/profile/dpenn1000` (local)

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | Full fingerprint render (colour, halo, glow) | "The fingerprint could not be read just now," with the app's own dev-note explaining why (`axis_scores` keyed on `ghost_member_id`, `SUPABASE_SERVICE_ROLE_KEY` unset locally) | d, already tracked as item 2.4 | n/a |
| 2 | Fourth tab: "Growth" | Fourth tab: "Articles" | b | Medium, see Regression 5 |
| 3 | "Joined, Pheonix, AZ" | "Pheonix, AZ" | b | Medium, see Regression 5 |
| 4 | "SEE MY WRITING" (own profile, first person) | "SEE THEIR WRITING" (same profile, third person) | b, symptom of item 2.1 | Medium, see Regression 5 |
| 5 | Persistent site-rail present | Absent | b | High, see Regression 2 |

### `/write` (local only, looked at, not deeply compared per the brief)

Nine-stage editor per the task's already-recorded cuts. Stage 1, "Compose," renders cleanly: draft
title, dek and body fields, an H2/H3/B/I/quote/paragraph toolbar, a stage-progress strip (Draft,
Declare, Reflection, Stage 2.5, Posted), and a notice that this sign-in is not linked to a
contributor profile yet. Header scrolls with the page here too, and correctly carries no site-rail
(matches live's own exemption for this one page). Nothing more compared, per the brief.

### A made-up path (404)

| # | What live does | What local does | Class | Severity |
|---|---|---|---|---|
| 1 | Bare, unstyled page: system font, no header, no nav, no footer, no card, grey "404 / Page not found / Go to the front page" | Fully on-brand: full header and nav, a proper paper-sheet card ("Page not found / Nothing is published at this address. / Read the articles"), full site footer with tagline and nav links | c | n/a, an improvement, see "What the port got right" |

---

## What the port got right

**Surfaces, colour and type.** Body background gradient, page font (DM Sans, same weight), body
text colour (`rgb(58, 52, 44)`, `--body-ink`), paper and grain treatment, and the display serif
headings match live closely everywhere I measured them. The team's own `dialecta-surfaces.css`
documents copying these values from the live stylesheet by hand rather than trusting the generated
tokens, and it shows.

**D-27, applied consistently.** I checked the brass-to-ink substitution on six different pages
(Articles, Guidebook, Stewards, About twice, Fingerprint) and it held every time: live's bright
brass gradient text becomes a flat, dark, D-27-compliant ink on the port, with no exceptions found.
That is a real ruling being carried through a whole site rebuild without drift, which is exactly
what a design system is for.

**The comment feed.** Content, tiers, and the Quality-sort ordering (Forum outranks Echo regardless
of which comment is newer) all match live's real data. The classification UI (specificity dots,
tier chip colours, the shape-of-the-conversation bar) is present and reads correctly.

**The 404 page.** Genuinely better than live's, which has none of the site's design language at
all. Worth keeping exactly as built.

**The reading experience, where it is not broken by Regression 1.** In the first screenful of every
long-form page, measure, leading and rhythm read as close to live as any of these pages get. The
bug in Regression 1 is a rendering defect, not a sign the reading design itself was ported poorly;
what little of each page does paint looks right.

**Header-scroll, footer consolidation, Community's missing identity data, the fingerprint's
concentric rings and scaling halo.** All per the task's own already-recorded list, and all
confirmed present as described. Nothing here contradicts what the team already told Dan.

---

## What I could not compare

- **390x844 as a true resized viewport, anywhere.** `resize_window` did not work in this
  environment; see Method above.
- **Deep scroll at mobile width**, on any page, due to the iframe technique timing out once during
  a deep-scroll test on the article page. Given the mobile document is taller than the desktop one,
  it would not be surprising if Regression 1 also affects mobile, but it was not confirmed.
- **The Pact's remaining sections.** The first two cards and the final signature section of "all
  eight sections" the task describes were checked; the six in between were not individually
  reviewed.
- **The Pact's tier-reading exercise**, described in the nav and in the task's brief as working
  without script, was not interacted with.
- **REPLY and NOMINATE FOR RECLASSIFICATION** controls on local's comment cards, present on live,
  not confirmed present or absent on local.
- **Article-level tier badges** (author declared / engine read / final) on the article page, live
  only; not checked on local.
- **The membership/subscription surfaces**, not part of the requested pairs and not visited.
