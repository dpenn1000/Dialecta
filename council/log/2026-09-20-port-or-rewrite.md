# Port the recovered front end, or rewrite it

*Framed by the convener 2026-09-20 for the full advisory bench plus `builder`, `migrator` and
`spec-reader`. Protocol: `.claude/skills/dialecta-council/SKILL.md`, amended today for six seats.
Chaired by `decider`. This is Phase 2 of `docs/plans/ROADMAP.md` and it needed Phase 1 first,
which is now filed.*

## Question

**Which parts of `_recovered-next/` come into `apps/web` close to as-is, which come over adapted,
which are rewritten, and which are dropped?**

Not port or rewrite as a yes or no. The recovery is 51 components and a started App Router tree,
and the answer is per file. A seat that answers "port it" or "rewrite it" without naming files has
not answered.

## Dan's position, entered as his

Verbatim, at his request:

> "I want to port as much as possible. Many months of effort went into the layouts, colors,
> papergrain, wood, etc.... Starting over will be a nightmare. Port everything over possible, and
> we can make changes from there. That is my opinion."

He built those surfaces and he knows what they cost. Weight it accordingly. Nothing in it gags a
seat: one that thinks a specific part should not be ported says so plainly and says why, with the
file or the measurement behind it. Do not flatter the position and do not perform opposition
to it either. The one thing no seat may do is answer it with a category ("the admin surfaces are
risky") instead of a file.

His standing scoping rule applies and is not reopened here:

> "Just focus on the final destination. There is little to no traffic. Let's not build half
> measures."

The deployed Ghost site is legacy being replaced, not a system to maintain. Nothing transitional
gets built for it.

## Measured, not estimated

All on 2026-09-20, on disk, reproducible.

| | |
| --- | --- |
| `apps/web/src`, TypeScript and TSX | **28 files, 1,439 lines** (`find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \)`) |
| `apps/web/src`, plus CSS | 30 files, 1,549 lines. `globals.css` 52, `tokens.css` 58 |
| `_recovered-next/lib/theme/`, top level | **51 files, 34,656 lines**, of which `style.css` is 3,286 and `__DO_NOT_EDIT.md` is 16 |
| `_recovered-next/app/`, the App Router tree | **17 files, 2,948 lines** |
| `_recovered-next/lib/*.js`, the server-side fetchers | 7 files, 725 lines |
| Portable hand-written total | about **38,300 lines**, excluding the 43,517-line compiled `bundle.js` in `_archive/2026-05-02/` |
| Ghost identity, DOM read | **9 files**, about 1,171 lines, agreed by `builder` and `security` independently |
| Ghost identity, referenced anywhere in a file's own source | **37 of 51**, agreed by both seats after each corrected itself from 38 |
| Ghost identity, on the wire | **55 call sites in 21 files**, counted by `builder` |
| Needs nothing for identity reasons | **21 files**: 9 prop-receive-only (6,280 lines) plus 12 agnostic (5,310 lines) |
| Custom properties the 51 components reference | **49 distinct, over 1,000 references.** 48 resolve in `_theme/assets/css/style.css`, 10 in `design/dialecta-design-spec.html` |

### The recovered front end, by file

`_recovered-next/lib/theme/`, largest first. Every seat may name any row.

| File | Lines | File | Lines |
| --- | ---: | --- | ---: |
| `dialecta-editor.jsx` | 4,727 | `dialecta-admin-repolish.jsx` | 485 |
| `style.css` | 3,286 | `dialecta-opinion-map-picker.jsx` | 474 |
| `dialecta-profile.jsx` | 2,865 | `dialecta-notifications-bell.jsx` | 395 |
| `dialecta-dev-admin.jsx` | 2,367 | `dialecta-share.jsx` | 359 |
| `dialecta-private-draft.jsx` | 1,796 | `dialecta-notifications-settings.jsx` | 352 |
| `dialecta-sidebar.jsx` | 1,595 | `dialecta-signup-invite.jsx` | 346 |
| `dialecta-discourse-layer.jsx` | 1,251 | `dialecta-reflection-bar.jsx` | 306 |
| `dialecta-profile-identity-edit.jsx` | 1,075 | `dialecta-handle-setup.jsx` | 302 |
| `dialecta-opinion-map.jsx` | 958 | `dialecta-notifications-page.jsx` | 268 |
| `dialecta-quotes-app.jsx` | 932 | `dialecta-tier-badge.jsx` | 265 |
| `dialecta-fingerprint-engine.jsx` | 910 | `home-page-mount.jsx` | 242 |
| `dialecta-community-feed.jsx` | 759 | `post-page-mount.jsx` | 239 |
| `dialecta-community-author.jsx` | 713 | `dialecta-community.jsx` | 232 |
| `dialecta-profile-order.jsx` | 698 | `dialecta-quotes-data.js` | 229 |
| `dialecta-community-contributors.jsx` | 687 | `shell.jsx` | 226 |
| `dialecta-article-classification.jsx` | 686 | `dialecta-profile-data-pure.js` | 204 |
| `dialecta-opinion-map-placement.jsx` | 670 | `fingerprint-page-mount.jsx` | 199 |
| `dialecta-nomination-panel.jsx` | 658 | `dialecta-mentions-picker.jsx` | 178 |
| `dialecta-admin-resetup-maps.jsx` | 656 | `dialecta-archetype-grid.jsx` | 176 |
| `dialecta-profile-edit.jsx` | 621 | `dialecta-notifications-data.js` | 151 |
| `dialecta-profile-settings.jsx` | 558 | `dialecta-classify-stream.js` | 143 |
| | | `dialecta-profile-data.js` | 133 |
| | | `dialecta-tier-capabilities.js` | 62 |
| | | `topics.js` | 44 |
| | | `editor-page-mount.jsx` | 41 |
| | | `dev-admin-mount.jsx` | 33 |
| | | `dialecta-quotes-mount.jsx` | 32 |
| | | `notifications-page-mount.jsx` | 28 |
| | | `community-page-mount.jsx` | 28 |

`_recovered-next/app/`, the started migration:

| File | Lines |
| --- | ---: |
| `contributor/[handle]/moment/[id]/opengraph-image.js` | 491 |
| `contributor/[handle]/opengraph-image.js` | 442 |
| `comment/[id]/opengraph-image.js` | 346 |
| `quote/[slug]/opengraph-image.js` | 337 |
| `contributor/[handle]/moment/[id]/page.js` | 251 |
| `article/[slug]/opengraph-image.js` | 195 |
| `quote/[slug]/page.js` | 192 |
| `components/SiteNav.js` | 93 |
| `contributor/[handle]/page.js` | 91 |
| `globals.css` | 89 |
| `layout.js` | 86 |
| `contributor/[handle]/moment/[id]/MomentShareButtons.js` | 80 |
| `sitemap.js` | 76 |
| `api/debug/profile/[handle]/route.js` | 74 |
| `page.js` | 61 |
| `robots.js` | 28 |
| `api/health/route.js` | 16 |

`_recovered-next/lib/`: `get-moment.js` 197, `get-article.js` 161, `get-comment.js` 123,
`get-profile.js` 73, `ghost-admin.js` 65, `get-quote.js` 60, `og-background-config.js` 46.

## Constraints already decided, which you argue inside rather than against

- **ADR-001.** Nothing new is built on Ghost. Ghost is left.
- **ADR-002.** Identity is Supabase Auth. `auth.uid()` and RLS, not a client-supplied id.
- **ADR-003.** Dialecta owns its editor, TipTap, writing `body_json` and `body_html` together.
- **`apps/web/CLAUDE.md`:** server components by default, six named client islands, tokens from
  `src/styles/tokens.css`, reader-facing strings in `src/strings.ts`, shared logic in
  `@dialecta/core`, articles from Supabase and never Ghost, route params are promises.
- **No tier badge and no fingerprint-derived descriptor on any share card, ever.** `legal` and
  `philosopher` ruled independently and agreed. This binds `comment/[id]/opengraph-image.js` and
  `contributor/[handle]/opengraph-image.js` whatever else is decided about them.
- **Dan's scoping rule**, above.

## What the seats should not re-derive

Read these rather than re-measuring them. Correct one only if you have read the file it is about
and it is wrong.

- `team/builder/positions-2026-09-20-estimate-revised.md`: full rebuild 5 to 7 weeks, vertical
  slice 5 to 8 working days, re-run by re-reading rather than re-guessing.
- `team/builder/positions-2026-09-20-ghost-coupling-count.md`: the three categories, the 55 call
  sites, the reconciliation check.
- `council/security/positions/2026-09-20-ghost-coupling-count.md`: 37 of 51, and the split of the
  28 prop receivers into 4 passthrough, 5 presentation gate, 19 trust decision.
- `council/security/positions/2026-09-20-recovered-source-read.md`: the debug route, the
  role-grant path, the three surfaces that each reinvent client-side authorization.
- `council/designer/positions/2026-09-20-recovered-source-read.md`: style.css against the spec,
  the tier palette surviving as copy-pasted literals in five files, the fluid scale nobody adopted.
- `council/circulation/positions/2026-09-20-recovered-source-read.md`: what each of the four OG
  routes renders, what a moment is, what the quote surface is.
- `docs/RECOVERED.md`, `docs/SITE-INVENTORY.md`, `docs/plans/ROADMAP.md` Phase 2.

## The four questions inside the question

**One. The porting plan.** Name files or directories, not categories. For each: as-is, adapted,
rewritten, or dropped, and the reason. "As-is" means the file moves and compiles with import and
token fixes only. "Adapted" means its logic survives and something specific about it changes.
"Rewritten" means the surface is kept and the code is not. "Dropped" means the surface does not
come back, and a seat that says drop owes the argument for losing it.

**Two. What porting the Ghost coupling costs, per component class.** `builder` and
`security` agree on the counts and disagree on what the counts license. `builder`: identity
arrives as a prop, so the rewire is nine DOM reads plus 55 mechanical call sites inside files
already being opened. `security`: 19 of the 28 prop receivers gate a mutation or a privileged view
on a value with no proof behind it, and rewriting the client without changing the server moves the
forgery from the console to curl. Both are measured. Settle what a port of each class costs, in
work and in exposure, rather than restating either count.

**Three. The design system.** `designer` found `_theme/assets/css/style.css` authoritative over
`design/dialecta-design-spec.html`, 48 of 49 referenced tokens against 10. Dan names layouts,
colours, paper grain and wood as the things worth preserving. Say where each of those lives, and
whether it ports independently of the components that consume it. `apps/web/src/styles/tokens.css`
is generated from the spec today, and `apps/web/CLAUDE.md` says never edit it by hand, so a verdict
for style.css is a verdict about a generator as well as a stylesheet.

**Four. The first increment.** Given the answer above, what is the first vertical slice, and what
files are in it. `builder` has it at 5 to 8 working days. Say whether the porting plan changes
that, and what the slice contains file by file.

## Positions

*Nine briefs, verbatim and unedited, in seat order. Each was written by its own author, never by
the chair, which is what the amended protocol requires. Full positions are at the paths given;
read one only if you intend to engage it.*

### builder

`team/builder/positions-2026-09-20-port-or-rewrite.md`

Claim: of the 75 files, a clear majority (46, 61%) port adapted, not rewritten; only 16 are
dropped and 10 rewritten, and every drop is forced by an already-decided rule (ADR-001's no-Ghost
mandate, or the binding no-tier-badge rule), not a fresh judgment call against Dan's port-most
instruction. Strongest evidence: `apps/web/src/app/articles/[slug]/opengraph-image.tsx` already
ships a working, rule-compliant replacement for the single largest drop candidate,
`_recovered-next/app/article/[slug]/opengraph-image.js` (195 lines, Ghost-feature-image-primary).
The drop costs nothing: the destination already has it, built better.

---

### circulation

`council/circulation/positions/2026-09-20-port-or-rewrite.md`

The four-surface split from Phase 1 holds, but a new finding cuts under all of it: three of the
four data fetchers behind these cards fail on a wiring violation before their card design is even
worth judging. `get-article.js` imports `ghostAdminFetch`, a live Ghost Admin API call ADR-001
already forbids. `get-profile.js` is an admitted "spike" that hits a separate, unported legacy
Vercel deployment (`dialecta.vercel.app`) for the contributor bundle. Only `get-quote.js` and
`get-moment.js` are Supabase-native with zero external coupling. Distribution value and data-layer
legality are different questions, and for this tree, the second one decides most of the first.

---

### designer

`council/designer/positions/2026-09-20-port-or-rewrite.md`

Dan's four things split into two kinds. Colour and paper grain port independent of any component:
both live entirely inside style.css's single, 149-line `:root` block, the live Ghost export at
`_theme/assets/css/style.css`, not the design spec. The token generator's own regex already
matches that block's shape, so retargeting it costs a path change plus two named value decisions,
not a rewrite. Layout does not port independently: `shell.jsx`'s 226 lines are Ghost `.dataset`
plumbing and do not survive the move. Wood is real but thin: only a one-pixel border rim renders
anywhere; the plank gradient is defined and never painted, in 3,286 lines.

---

### legal

`council/legal/positions/2026-09-20-port-or-rewrite.md`

A port moves liability with the code. `comment/[id]/opengraph-image.js` renders a
bare Breach label beside a named commenter's full text, exactly what `apps/web/CLAUDE.md` already
forbids, and line 106 sets `Cache-Control: public, immutable, max-age=31536000`, one year. One
fetch bakes an uncontestable public label into Facebook's cache for a year that no later fix
reaches. "Built but unserved" is not a mitigant; it is why nobody would know until it already
happened. One file, the debug route, must not exist anywhere under `apps/web`: unauthenticated GET,
live Supabase URL, service-key fingerprint, ten real profiles. Everything else named here ports,
with a specific line cut or a named precondition, not a refusal.

---

### migrator

`team/migrator/positions-2026-09-20-port-or-rewrite.md`

Every port is gated by the live table under it, checked file by file, not by category. `articles`
has zero content columns live (no slug, title, body_json, body_html), confirmed in
`supabase/migrations/20260920000000_baseline_live_schema.sql`'s own inline comment, so the entire
article-content family (editor, article server, the public article page) is blocked on a migration
that has not been written, regardless of any front-end work. Every recovered write surface except
comments is additionally blocked at the RLS layer: all 30 public tables grant full CRUD to `anon`
and `authenticated` (measured, `exchange/open/2026-09-20-security-03`), but only `comments` has a
matching row policy, landed this session.

---

### philosopher

`council/philosopher/positions/2026-09-20-port-or-rewrite.md`

The files I was asked to rule on assume a contributor who is legible to strangers: rankable,
browsable, shareable by tier. The Council spent today narrowing exactly that. Strongest proof:
`get-moment.js` lines 162 to 171 build a `tier_promoted` share card with a tier arrow (`Spark to
Forum`) for X and Facebook, the identical thing `legal` and I ruled out today for the other two OG
routes, just not yet applied to this third file. A port that stops at Ghost imports re-ships a
ruling the Council made hours earlier without noticing it applies here too.

---

### security

`council/security/positions/2026-09-20-port-or-rewrite.md`

Builder's 55 call sites are not 55 units of cost. They are roughly a dozen missing authorization
surfaces wearing 55 variable names, most of them unbuilt: every table the 19 trust-decision files
write to carries zero insert or update policy today except comments, landed this morning. The
single strongest piece of evidence: `profiles.is_admin`, `is_quote_admin` and `subscription_tier`
are still granted SELECT to `anon` and `authenticated`, confirmed by reading
`20260920192954_close_ghost_member_id_as_public_credential.sql` directly, so a mechanical port of
`dialecta-dev-admin.jsx`'s `isAdmin` gate compiles, returns a true answer, and reproduces the exact
defect it is today.

---

### spec-reader

`team/spec-reader/positions-2026-09-20-port-or-rewrite.md`

Fifty-one recovered files carry a five-month-old implementation of specs that were still being
written. Spec fidelity, not line count or Ghost coupling, is what should sort which ones port:
`dialecta-private-draft.jsx` builds a full comment-side Stage 2.5, a twelve-second lock then
Accept, Amend, or Respond-for-Record, with wait-time constants `Dialecta_Tuning_Engine_Spec_v1.md`
names as real and tracked. `Dialecta_Discourse_Layer_UX.md`, the document whose own purpose line
claims to specify this exact file, describes a three-stage flow with no Stage 2.5 at all. Four
other documents already assumed a comment-side Stage 2.5 existed and never defined one; this file
built it, and nobody wrote down why.

---

### treasurer

`council/treasurer/positions/2026-09-20-port-or-rewrite.md`

Port most of it: on forward cost alone, writing what already exists runs 5 to 7 weeks against a 5 to 8 day first slice, and weeks are the real currency here, not dollars, since Dan has no other budget. But the same cost test the port relies on also finds two things the plan hasn't priced. `_recovered/api/article/classify-stream.js` runs `claude-opus-4-7` with adaptive thinking and an 8,192 token ceiling, and `dialecta-admin-resetup-maps.jsx` fires it for what its own docblock calls smoke-testing, behind an admin gate `security` has already shown is forgeable. `dialecta-dev-admin.jsx`, 2,367 lines, is a worse trade than Supabase Studio, which is already paid for and already safe.

## Rebuttals

*One round, in seat order. Each seat read the nine briefs, read in full any position it
intended to engage, and wrote under 300 words. Concessions are recorded as each seat made
them.*

### builder

Migrator is right, and the error is mine, not a judgment call. My Question Four slice cited "RLS
already open per supabase/migrations/20260920193044_publish_the_three_existing_comments.sql" as
grounds to read comments straight from a server component. That migration flips three rows to
status='published'; it never touches policy. The only comments policies live, per migrator's read
of 20260920200500_comment_write_identity.sql, are both owner-scoped: insert and select gated on
member_id = current_ghost_member_id(), with no status branch. So the three published rows are
visible only to the member who wrote each one. My slice's proof, a contributor writes a comment and
it renders on the page, still works for that one contributor viewing their own row, but it proves a
private echo, not the shared discourse thread the increment claims, and not what ROADMAP.md's own
"visible discourse" line asserts.

Concession: the "already open" citation was wrong. Step 4, dialecta-discourse-layer.jsx's read
path, needs the public-read policy migrator names, status in published or suppressed, or member_id
matches the viewer, which is not written yet.

Cost to the plan: not the 46 of 75 tally, and not the 5 to 8 day band, migrator's own read calls
this days, not weeks, and I agree. The cost is sequencing. This migration and the articles-content
gap migrator also names belong in the slice's own file list, landing with
dialecta-discourse-layer.jsx, not assumed already done.

---

### circulation

Philosopher's strongest hit lands on my own verdict, not just my reasoning. I gated `tier_promoted` and shipped the other seven event types, including `follower_milestone`, because my test only checked for tier content. Philosopher's second test asks something broader: does the surface turn a relationship into a broadcastable count, rank, or badge. A follower count passes that test on construction alone; no rubric is needed to make it a status object. I was checking for the wrong failure mode.

I concede the verdict, and circulation's own lane reaches the same place independently. This platform has six real people on it, per my own contributor-card finding. A public card reading "3 followers" does not read as a milestone, it reads as evidence of smallness, on the one format built for a stranger's first impression. That is a distribution argument, not philosopher's ethical one, and it ends at the identical drop. Six of eight event types ship clean, not seven.

Dropping the bot/human redirect does not change migrator's RLS point. The exposure class migrator names, a single service-role row-read by id, meant to be public on share, is a property of the fetch, not of what happens after it renders. Removing the redirect makes every visitor hit that same read uniformly instead of two paths converging on it, which simplifies the surface rather than creating a new one.

A page a human never saw was still distribution: its job was the link preview, and the redirect only decided where the click landed after. Dropping the redirect does not remove that job, it lets the same content also serve the click.

---

### designer

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

---

### legal

**Philosopher's third file.** Confirmed: `get-moment.js` lines 162-171 build `tier_promoted`. Its OG route carries the same year-long cache header I flagged on the comment card. My first question, does it publish a named person's platform characterization without basis, draws no exception for self-chosen sharing. The test would have caught it. What missed was scope: I ruled only the files my brief named. A rule written "ever" cannot depend on a brief naming every instance. Amend the process: run the five questions against every share card.

**Migrator's read of `comments`.** Confirmed: SELECT is owner-scoped only, no update policy exists, so no non-author can read any comment today. That closes the exposure I named, so the card can't be tested against real rows yet. My precondition belongs on the policy, not `get-comment.js` alone. It must bind whatever public read policy gets written next, failing closed on `status` and `final_tier` together, or a plain `status = 'published'` predicate reopens the same gap for every caller.

**The debug route as evidence.** Reread in full: `env_check` and the profile lookups are queries, not data. Both leaked once, live, in deployment `dpl_3ZRBaGX4rKEUnuc87zAm7YHHB7VQ`. Committing the source doesn't repeat that; the text holds no secret. But it sits at a valid App Router path. Any build that globs that tree with real credentials reactivates it unchanged. Evidence status excuses the commit. It doesn't excuse a live route left in place; strip the handler or rename it out of routing first.

**Treasurer's fifty dollars.** The number doesn't move my ruling; the documents do: acceptable use, a content licence, a liability limit, governing law, and a privacy notice, through the Pact's signature, and only charging waits on them. Treasurer's Vercel point binds earlier, on infrastructure terms, not member terms; neither substitutes for the other.

---

### migrator

Builder and security both now concede the comments read policy: builder's rebuttal retracts "RLS
already open," and security's calls the landed policy "owner-scoped only... I undersold the gap."
That closes the order dispute my brief raised; both migrations now belong in the slice's own file
list, which builder states directly. Nothing left there for the chair to resolve.

The still-open disagreement is quotes. Circulation and treasurer both rule the quote surfaces
portable; circulation goes further, calling `quote/[slug]` "the one card in the whole set with no
precondition riding on it" and recommending it join the first slice for exactly that reason. My
reading found a precondition nobody has cleared. `_recovered/supabase/migrations/007_quotes_table.sql`
declares `status` as `live`/`draft`/`archived`, default `'live'`, select policy `using (status =
'live')`. The baseline schema guesses the predicate as `status = 'published'`, marked `LIVE
UNVERIFIED`. Those aren't close variants; no row satisfies both. If live still runs the original
three values, a policy filtering on `'published'` returns nothing, and the measured "70 of 72
visible to anon" came from some mechanism other than the one the baseline assumes.

I can't say the read is broken. I can say nobody has confirmed it isn't, and "no precondition"
assumes a confirmation that hasn't happened. Circulation's ruling is porting onto a predicate, not
a table; if the predicate is wrong, it is porting onto a guess still carrying its own `LIVE
UNVERIFIED` tag.

One command settles it, against the live database, not either migration: `select policyname, qual
from pg_policies where tablename = 'quotes'`.

---

### philosopher

Builder is more right than I was, and the evidence is stronger than builder's own brief. I
read `fingerprint-geometry.ts` and `fingerprint-texture.ts` in full. Builder cited one
deliberate change, the hard clamp's removal. `fingerprint-texture.ts` documents three more,
found the same day: a spiral from a linear ring seed, a seam at theta zero, a turbulence
frequency that stepped instead of blended. My "this file owes one geometry fix" undercounted
by three, and had the direction backward: the fix is not owed, it is already paid, in a
different file, in TypeScript. Porting the 910 lines whole would reintroduce four named, dated
bugs, not carry forward clean math. I concede that plainly.

I hold short of "rewritten" for the file as a whole. Both `packages/core` files describe
themselves as ported and amended, returning the same shape the render code needs, a fraction
of ring radius, a pixel offset, not a new one. The petal paths, the notch handling, color from
purity, the parts I read in full for my own position, are separable from the compute they
consume. Swap the functions, keep the paint. That is adapted, a heavier cut than I credited it
with, deleting this file's own compute rather than patching it, but adapted.

Circulation and I do not conflict. Seven of eight scores clean against the
tier-badge rule alone. My drop of `follower_milestone` rests on a second test, a raw count
that primes comparison, which that rule never asked about. Both rulings hold.

Treasurer's fifty dollars is accepted, and it answers the question asked: a price sitting in a
config file nobody outside engineering reads has not switched any norm yet. That needs the
exposure Phase 4 withholds, which is what my constraint was always about.

---

### security

Builder now concedes the admin family: dev-admin, admin-resetup-maps, and admin-repolish moved
from adapted to dropped, citing the identical no-session-proof reasoning I gave. The call is right;
he stops there, though. The same reasoning still covers a dozen files he still marks adapted with
a one-line "session re-source": profile-edit, profile-order, profile-settings, profile-data,
opinion-map-placement, nomination-panel, notifications-data, quotes-data, both community follow
buttons. Migrator's independent table-by-table read confirms none of those tables carries a write
policy either, zero exceptions but comments. Re-sourcing the variable describes a fix with nowhere
to write to. If the admin rule earns a drop, the same rule earns a rewrite verdict on the rest of
the trust-decision bucket, not an adapted one.

Migrator also corrects me. I filed comment write as Shipped, full stop. Migrator's precise read
shows the landed policy is owner-scoped SELECT only, so the three comments published this session
are invisible to anyone but their own author. I undersold the gap on the one surface I called done.
The doors I counted were, if anything, undercounted, not overcounted.
`opinion_map_positions.reader_id`'s unresolved type is the same blocker in both our positions,
reached independently.

Treasurer's dollar figure is the right shape and belongs beside forgery in my veto list: an
uncapped Opus call behind a forgeable gate is exploitable for cost as readily as for privilege,
same root cause, same fix.

Legal's removal ruling is correct. `docs/RECOVERED.md` calls the recovered trees evidence, not this
repository's code; a file whose own docblock ordered its deletion has no argument left for staying,
quarantined or not.

---

### spec-reader

Builder puts `dialecta-private-draft.jsx` in day one of the slice and calls it adapted.
Migrator calls its comment-post path the one surface unblocked today. Neither ruling touches
Stage 2.5. Builder's adaptation notes cover dropping `member_uuid` and renaming POST fields,
nothing else. Migrator's unblock is RLS and column existence. Two seats priced two different
layers of this file and neither looked at the layer I checked. That confirms the gap my brief
names rather than arguing with it.

Given migrator's finding, holding the whole file is the wrong call: stalling the slice's only
fully-unblocked surface over one sub-flow inside 1,796 lines is disproportionate, and most of
the file has nothing to do with that sub-flow.

Ship the compose ritual with Stage 2.5 disabled: comment posts go straight from AI reflection
to Posted, the three-stage flow `Dialecta_Discourse_Layer_UX.md` already describes, with zero
mentions of Stage 2.5, confirmed by grep in my own brief. Cost: close to nothing, since the
flag-off path is already the documented one, and it still delivers what builder and migrator
both priced: a real, session-verified write path rendered with a tier badge.

Shipping Stage 2.5 live and writing the spec after is the worse order. It puts a twelve-second
lock and an Accept, Amend, or Respond choice in front of real commenters in week one, on a
mechanic nobody outside this file decided, and a later no becomes a behavior change on shipped
product instead of a design review. That is what my own rule is for: write the decision down
at the port, don't inherit it because the file compiled.

---

### treasurer

Migrator and security both land on my own number, and not the same way, so I take them separately.

Migrator's two migrations are real and I hadn't priced them: the article-content DDL and a public read policy on comments. But migrator's own word for both is small, days not weeks, additive only, against five rows and one policy. Add them honestly and 5 to 8 days becomes roughly 7 to 10. The compression against a 25 to 35 day rewrite softens from 3 to 7 times to nearer 2.5 to 5 times. Still real, still the load-bearing fact. I priced the front end and skipped the two migrations gating it. That was the gap, not the multiple.

Security's dozen missing doors is a different claim than it first reads. The table names nine surfaces behind eighteen files, and exactly one, comment write, ships live today. That one door carries the whole first slice: the compose path and the discourse layer's mutations. The other eight, article submit, follow, own-profile edit, opinion-map placement, nomination, notifications, quotes admin, admin grant, gate the rest of the port, the 4,477 lines of editor and everything behind it, not the slice. My 5 to 8 day figure was never a claim that the full port clears security's authorization gap. It was a claim about reaching one working demo fastest. That claim survives migrator's correction and doesn't touch security's finding, because the slice and the full port were never the same number, and my brief should have said so.

What I owe next: price the eight unbuilt doors into the full-port estimate before anyone reads 5 to 7 weeks as covering them. It probably doesn't.


## Chair roll-call

**builder** argued that the file-by-file test vindicates Dan's port-most instruction on its own terms: of 75 files across `lib/theme/` and `app/`, 46 adapt, only 16 drop and 10 rewrite, and every drop traces to an already-decided rule, not a fresh judgment call. Filed complete verdict tables for all 75 files plus the 7 `lib/*.js` fetchers, and named the first-increment file list with a day estimate. Disposition: **carried, with one conceded correction**. The headline tally and the increment's file order both hold through the debate. Builder conceded directly to migrator that a specific citation behind the Question Four answer, "RLS already open," was wrong: the migration in question only changed row status and never touched policy, so the increment as first filed would have rendered a private echo, visible only to the comment's own author, rather than the shared discourse thread it claimed to prove. Builder's own words: "the error is mine, not a judgment call." The day estimate survived (migrator calls the fix "days, not weeks"), but the increment gained a migration it hadn't named as its own file. Separately, security's rebuttal pressed builder on roughly a dozen files marked "adapted" with a one-line "session re-source" note, arguing the same no-session-proof reasoning that made builder drop the three admin files should make these rewritten too. Builder's rebuttal ran earlier in the round and does not answer this. I resolve it below rather than leave it standing.

**circulation** argued that data-layer legality gates card design: three of the four OG-image fetchers fail on a wiring violation, Ghost or an abandoned legacy API, before their layout is worth judging at all, and only the quote and moment surfaces are Supabase-native throughout. Ruled the article card effectively replaced by apps/web's own better-defended existing card, the contributor card kept only with archetype and pillars stripped, the comment card dropped outright (it renders exactly what legal and philosopher ruled out, and no page consumes it), the quote surface clean and fit for the first slice, and moments adapted with the cross-domain redirect dropped for a same-domain design. Proposed a platform-wide card-type correction, `summary` instead of `summary_large_image`, after finding X's own card documentation no longer exists publicly to verify against. Disposition: **mostly carried, one clean concession**. Circulation conceded fully to philosopher: its own moment-card test only checked for tier content, which caught `tier_promoted` but missed `follower_milestone` on a broader test, whether the surface turns a relationship into a broadcastable count. Circulation revised its own verdict from seven of eight event types shipping to six of eight, calling this "the wrong failure mode," and found its own distribution-side reasoning (a platform with six real people cannot afford a card that reads as evidence of smallness) lands on the identical drop by an independent route. Circulation's recommendation to fast-track the quote surface into the first slice is contested by a fact circulation did not check; see migrator, and my ruling below.

**designer** argued that Dan's four things split into two kinds: colour and papergrain live entirely inside one 149-line `:root` block in the live `_theme/assets/css/style.css` and port independent of any component; layout does not port independently and needs three separate verdicts across three files; wood is real but thin, a border rim rather than the plank texture the tokens themselves define. Filed the single most consequential housekeeping finding in the whole debate: two copies of the theme exist, one live (exported from Ghost the same day as this debate) and one a five-month-stale, do-not-edit mirror inside `_recovered-next/` that happens to be byte-identical today but must never be the file anyone points a generator at going forward. Named two forked token values, `--amber` and `--border-light`, with no recorded decision behind either fork, and found the specific, measured contrast defect in `dialecta-tier-badge.jsx` (Heat's icon and text colour, 1.96:1) along with the exact two-value fix. Disposition: **carried in full, plus a self-correction that deepens rather than reverses the position**. Designer corrected its own earlier read in rebuttal: the wood-edge rim is not nearly unused as first measured. It appears 30 times across the tree's two busiest files, always as the same one-pixel treatment, "used constantly, and every use is the same rim." Designer also surfaced, unprompted, that a component named `WoodFrameProgressBar.jsx` was logged Complete in the project's own build audit and no longer exists anywhere in the repository, and that a second, independently named wood vocabulary (`--walnut`/`--cherry`/`--burnt`) sits in `page-stewards.hbs`, matching none of style.css's values. Nobody rebutted the tier-badge contrast finding; philosopher's own "as-is" call on that file predates seeing it, which designer's rebuttal notes plainly rather than treats as a live disagreement.

**legal** argued that a port moves liability with the code, and built a five-question test (characterization without basis, an unproven identity gate, data minimization, payment before terms, dormant versus live special file) and applied it to the six areas named in its angle. Ruled the debug route an unqualified drop with no adapt path, the comment and contributor OG cards adaptable once the tier and archetype renders are cut, `dialecta-dev-admin.jsx` a rewrite of its trust and data-transport layers with the shell kept, and `dialecta-tier-capabilities.js` portable as-is with a payment-timing precondition attached rather than a code objection. Flagged the comment card's one-year `Cache-Control` header as an aggravator, not a detail: a single fetch of an unlinked route bakes a rendered image into caches the platform can no longer reach, ever. Disposition: **carried, with one scope concession**. Legal conceded directly to philosopher that its own five-question test, though written to apply "ever," was in practice only run against the files legal's brief named, and missed `get-moment.js`'s `tier_promoted` card until philosopher surfaced it: "a rule written 'ever' cannot depend on a brief naming every instance." Legal also narrowed its own `get-comment.js` finding after migrator's read showed the comments table's SELECT policy is owner-scoped only today, meaning the exposure legal named cannot yet be tested against real rows; legal moved the precondition from the fetcher itself onto whatever public read policy gets written next. Legal held its ground against treasurer's $50 Underwriter price: the number does not move the ruling, the missing documents do.

**migrator** argued that every port is gated by the live table underneath it, checked file by file rather than by category, and produced the single most load-bearing correction in the debate: the `comments` table's only policies, landed the same day, are both owner-scoped, so the three comments already flipped to published are today visible to no one but their own author, contradicting the roadmap's own "visible discourse" claim. Found `articles` carries zero content columns live, blocking the entire editor and public-article family until a migration lands. Ran a table-by-table pass across every named surface (discourse, profile, quotes, notifications, moments, opinion maps, dev-admin), sorting what is blocked on a missing policy from what is blocked on a missing column, and flagged that all six admin tables are closed to every client-facing role regardless of any client-side fix. Found a live, unresolved predicate mismatch on `quotes.status` (the original source migration declares `live`/`draft`/`archived` with predicate `status = 'live'`; the baseline schema guesses `'published'` and marks itself `LIVE UNVERIFIED`), and supplied the exact query that settles it. Disposition: **carried, and its central finding forced concessions from two other seats**. Both builder and security revised their own positions on the strength of migrator's reading of the applied policy SQL; migrator's rebuttal notes both concessions and considers that dispute closed. Migrator's quotes-predicate finding stands unresolved against circulation's recommendation to fast-track the quote surface. I rule on it directly below.

**philosopher** argued that the files under review assume a contributor legible to strangers by rank, and that rulings the Council had already made earlier the same day apply to files nobody had yet re-checked against them, proven by `get-moment.js`'s `tier_promoted` card repeating exactly what legal and philosopher had ruled out hours earlier for a different file. Ruled the two OG cards adapted with their classification content cut, the nomination panel adapted with its raw public total no longer shown as a live scoreboard, the fingerprint engine's geometry adapted, the tier badge and tier-capabilities files as-is (the latter framed as "the wall P-9 asked for," recommending a standing CI guard), the community surfaces adapted with two specific status-ladder features cut (a planned follower-count sort, an archetype-sort default) and self-congratulatory internal vocabulary ("viral unit," "dopamine-for-good engine," confirmed at `dialecta-community-feed.jsx` lines 4 and 14) stripped from code comments, and the moment surface adapted with two of eight event types dropped. Supplied the two-question test, characterization without basis or contestability, and relationship turned into a broadcastable count, rank, or badge, that the synthesis below uses directly. Disposition: **carried on every substantive ruling, with one significant self-correction**. Philosopher's rebuttal read `fingerprint-geometry.ts` and `fingerprint-texture.ts` in full and found builder's claim of one deliberate fix undercounted three more, conceding "I had the direction backward: the fix is not owed, it is already paid, in a different file, in TypeScript." Porting the 910 lines whole would have reintroduced four named, dated bugs. Philosopher held its overall verdict on that file (adapted, not rewritten, because the render and paint logic is separable from the superseded compute) and accepted treasurer's $50 figure as not touching philosopher's own norm-switching constraint, since nothing about the price is live or exposed yet.

**security** argued that builder's 55 call sites overstate the unit of cost: they resolve to roughly nine real authorization surfaces behind eighteen trust-decision files, of which exactly one, comment write, ships today, one more is drafted but unlanded, and seven have nothing built at any layer, one of them (quotes admin) missing even its table. Ruled the debug route a clean drop, the three admin files (`dev-admin`, `admin-resetup-maps`, `admin-repolish`) split between a kept UI shell and a rewritten trust layer, `dialecta-quotes-data.js` a three-way split with its admin half dropped outright for lacking any schema to rewrite against, and flagged that `dialecta-admin-resetup-maps.jsx` fires an uncapped Opus-tier model call behind the same forgeable gate already confirmed elsewhere. Reread two files circulation and builder had filed as low-stakes "presentation gates" and found each hides its own unverified `FollowButton` implementation, a third instance of a write the debate had already been counting twice. Disposition: **carried on its central reframing, with two conceded corrections**. Security conceded directly to migrator that its own "comment write: Shipped, full stop" line undersold the gap, matching migrator's precise read of the owner-scoped policy. Security also accepted legal's debug-route ruling and folded treasurer's dollar figure into its own veto list as the same root cause, a forgeable gate, wearing a cost face rather than a privilege face. Security's rebuttal pressed builder to extend the "rewrite" verdict from the three admin files to roughly a dozen more trust-decision files still marked "adapted." Builder's rebuttal, filed earlier in the round, does not answer this. I resolve it below.

**spec-reader** argued that spec fidelity, not Ghost coupling or line count, is the right sort for what a port carries forward silently: files that faithfully implement a written spec are the strongest port candidates, files that contradict a decided, dated spec (an ADR) should lose to the ADR, and files that implement something no spec describes at all are the ones a silent port ships as a settled product decision nobody reviewed. Found the sharpest case in the whole tree: `dialecta-private-draft.jsx` builds a full, carefully tuned comment-side Stage 2.5 (a twelve-second lock, three named choices) in language lifted near-verbatim from the article-side spec, while the one document whose own purpose line claims to specify this exact file describes a three-stage flow with zero mention of it: a real decision, five documents now touching it, never written down as comment-side behavior. Separately flagged `dialecta-profile-order.jsx`'s 40-Order taxonomy as a feature with no governing spec of any kind, not merely an undocumented one, and recommended holding it. Confirmed `dialecta-sidebar.jsx`'s `DeltaCard` renders a fabricated statistic from a function whose own comment calls it a mock, directly contradicting the Delta Mechanic spec's stated principle that the mechanic reflects and does not evaluate. Disposition: **carried, and its rebuttal supplies the working answer this synthesis adopts for Stage 2.5**. Spec-reader's rebuttal noted that builder and migrator each priced a different layer of `dialecta-private-draft.jsx` (session identity, RLS) and neither touched Stage 2.5 itself, then proposed shipping the file with Stage 2.5 feature-flagged off, falling through to the plain three-stage flow the current spec already describes, rather than holding thousands of unrelated lines hostage to one undecided sub-flow, or shipping an undecided mechanic live and turning a later no into a behavior change on real product.

**treasurer** argued that forward cost, not sunk cost, is the only test that carries weight, and that the real currency is Dan's own weeks, which cannot be financed away the way a dollar figure can. Priced the full rebuild at 5 to 7 weeks against a first slice at 5 to 8 days, named the Underwriter price at $50 a year with the fee-efficiency and floor-coverage math behind it and an explicit admission that it is a supply-side number with zero demand validation, and found the two things the port's cost case had not priced: an uncapped Opus-tier call reachable through a forgeable admin gate (concretely, $300 to $1,500 for ten thousand scripted calls against a route with no cap today), and `dialecta-dev-admin.jsx` costing more to carry forward than Supabase Studio, which is already paid for and already authenticated correctly. Disposition: **carried, with one direct concession that changes the headline number**. Treasurer conceded to migrator that its own estimate had skipped the two migrations gating the front-end work, and revised 5-to-8 days to 7-to-10, softening the compression claim from "3 to 7 times" to "2.5 to 5 times" against the full rewrite: "I priced the front end and skipped the two migrations gating it. That was the gap, not the multiple." Treasurer also precisely re-scoped security's nine-surface finding: only one door, comment write, gates the first slice; the other eight gate the full port, not the slice, so the day estimate and security's finding do not conflict, they were answering different questions. Treasurer closed by naming its own unfinished work: pricing the eight unbuilt doors into the 5-to-7-week full-port figure, which it says "probably" does not already cover them.

All nine seats filed a brief, a full position, and a rebuttal. None was silent.

## Chair synthesis

### The porting plan

One table, every file or directory the debate ruled on, grouped as `lib/theme/`, then `app/`, then `lib/`, then the design-token pipeline that sits outside `_recovered-next` but that Dan's own question (colour, papergrain, wood) turns on. Where seats agreed, the verdict is theirs. Where they disagreed, I ruled, and the paragraphs after each table say why. "Adapted (auth rewritten)" marks a file whose JSX and UX survive close to as-is but whose identity or mutation logic must be rebuilt against a real session and a real RLS policy rather than merely re-sourced, a distinction argued out in the next section and applied here rather than re-argued file by file.

**Housekeeping first, because it governs the whole first group.** `_recovered-next/lib/theme/style.css` and `_theme/assets/css/style.css` are byte-identical today. Only the second is live; the first is a five-month-stale, do-not-edit mirror synced from a path outside this repo (designer). Every "as-is" verdict on style.css below means: copy from `_theme/assets/css/style.css`, never from the recovered copy, and never edit either in place.

#### `_recovered-next/lib/theme/` (51 files)

| File | Lines | Verdict | Decided by |
|---|---:|---|---|
| `dialecta-editor.jsx` | 4,727 | Adapted | builder, spec-reader. Stage flow, tag picker, opinion-map inputs, polish panel, publish flow port (~4,477 lines). `ProseEditor`'s contenteditable core (~250 lines) is Rewritten against ADR-003/TipTap. Ghost-coupled submit and publish calls are Rewritten against ADR-001/002. Blocked on the articles-content migration (migrator) before any publish path is real |
| `style.css` | 3,286 | As-is | designer, confirmed by builder. From the live file, not the recovered mirror |
| `dialecta-profile.jsx` | 2,865 | As-is | builder, migrator. Zero own fetch calls, confirmed twice |
| `dialecta-dev-admin.jsx` | 2,367 | Dropped, as a port target | Chair call over legal/security's Rewrite. See "dev-admin" below |
| `dialecta-private-draft.jsx` | 1,796 | Adapted | builder, migrator, spec-reader. Compose ritual ships; identity layer rewritten to session-sourced auth; Stage 2.5 sub-flow feature-flagged off pending Dan (spec-reader's proposal, adopted) |
| `dialecta-sidebar.jsx` | 1,595 | Adapted | builder, security. Identity-agnostic. `generateMockPulse` deleted or replaced with a real endpoint, not shipped as fabricated data (spec-reader and builder converge independently) |
| `dialecta-discourse-layer.jsx` | 1,251 | Adapted (auth rewritten) | builder, security, migrator. Read and render UI ports; edit/delete mutations rewritten to session-sourced auth; public read blocked on an unwritten policy (migrator) |
| `dialecta-profile-identity-edit.jsx` | 1,075 | Adapted (auth rewritten) | builder (passthrough UI), migrator (zero update policy exists on `profiles`) |
| `dialecta-opinion-map.jsx` | 958 | As-is | builder, security, migrator. Pure render primitives, zero identity coupling |
| `dialecta-quotes-app.jsx` | 932 | Adapted, admin controls Dropped, predicate Unresolved | security (admin half has no schema to rewrite against), migrator (`status` predicate unconfirmed, see quotes note below) |
| `dialecta-fingerprint-engine.jsx` | 910 | Adapted | builder and philosopher, converged after rebuttal. Compute math superseded by `packages/core/src/fingerprint-geometry.ts` and `fingerprint-texture.ts` (four named bug fixes already landed there); render and paint logic salvaged and rewired to the new functions' output |
| `dialecta-community-feed.jsx` | 759 | Adapted | builder, spec-reader (faithful to `Dialecta_Social_UX_Architecture.md`), philosopher (strip "viral unit"/"dopamine-for-good engine" from code comments, keep the ranking mechanism) |
| `dialecta-community-author.jsx` | 713 | Adapted (auth rewritten) | builder (presentation gate), security (its own inline `FollowButton` needs the same rewrite as `profile-data.js`'s `setFollow`), philosopher (no follower count ever added) |
| `dialecta-profile-order.jsx` | 698 | Unresolved, hold | spec-reader. No governing spec exists anywhere for the 40-Order taxonomy; 698 lines and two live endpoints of unreviewed product surface. When unblocked, mutation layer rewritten (security) |
| `dialecta-community-contributors.jsx` | 687 | Adapted (auth rewritten) | builder, security (own inline `FollowButton`), philosopher (drop the planned follower-count sort and the archetype-sort default, keep the archetype filter chips) |
| `dialecta-article-classification.jsx` | 686 | Adapted | builder (passthrough), spec-reader (near-verbatim match to the Editorial Template's disclosure rule). Blocked on the articles-content migration (migrator) |
| `dialecta-opinion-map-placement.jsx` | 670 | Adapted (auth rewritten) | spec-reader (correctly implements Delta Mechanic Stage A/C), security (mutation rewritten), migrator (already assumes `stage` over `delta_of`, matching live and spec; blocked on `reader_id` type, text or uuid, Unresolved) |
| `dialecta-nomination-panel.jsx` | 658 | Adapted (auth rewritten) | spec-reader (self-cites the UX spec it implements), philosopher (raw public total must not read as a live scoreboard), security (mutation rewritten), migrator (blocked on an insert policy not yet written) |
| `dialecta-admin-resetup-maps.jsx` | 656 | Dropped, as a port target | treasurer (fires an uncapped Opus-4-7 call behind a forgeable gate), security, migrator (schema-closed regardless of client fix) |
| `dialecta-profile-edit.jsx` | 621 | Adapted (auth rewritten) | builder, security, migrator (no update policy exists on `profiles` at all) |
| `dialecta-profile-settings.jsx` | 558 | Adapted (auth rewritten) | Same basis as profile-edit |
| `dialecta-admin-repolish.jsx` | 485 | Adapted, gated | treasurer, security. Ship only with a spend cap and a real server-side admin check, not the current client gate |
| `dialecta-opinion-map-picker.jsx` | 474 | As-is | security, migrator. Identity-agnostic, pure render |
| `dialecta-notifications-bell.jsx` | 395 | Adapted (auth rewritten) | builder (prop-receive only), migrator (both notification tables fully closed, no owner-read policy exists at all) |
| `dialecta-share.jsx` | 359 | Adapted | builder. Passthrough, low stakes |
| `dialecta-notifications-settings.jsx` | 352 | Adapted (auth rewritten) | Same basis as notifications-bell |
| `dialecta-signup-invite.jsx` | 346 | Adapted | builder, security. Presentation gate, cosmetic re-source |
| `dialecta-reflection-bar.jsx` | 306 | As-is | security. Identity-agnostic, shared timing primitive |
| `dialecta-handle-setup.jsx` | 302 | Adapted (auth rewritten) | builder, security. A second, independent DOM-read site; gate logic and handle-status GET survive, identity read rewritten |
| `dialecta-notifications-page.jsx` | 268 | Adapted (auth rewritten) | Same basis as notifications-bell |
| `dialecta-tier-badge.jsx` | 265 | Port with the fix | designer. Measured 1.96:1 contrast defect, exact hex fix given; land with the `--tier-*` token migration |
| `dialecta-community.jsx` | 232 | Adapted | builder, security. Presentation gate only |
| `dialecta-quotes-data.js` | 229 | Adapted (helpers) / Dropped (admin functions), predicate Unresolved | security (no quotes-admin schema exists to rewrite against; fold into `admin_capabilities` instead), migrator (status predicate) |
| `shell.jsx` | 226 | Rewritten | builder, designer. Ghost `.dataset` mount architecture has no App Router equivalent; global settings host and visitor fallthrough survive as a provider |
| `dialecta-profile-data-pure.js` | 204 | Adapted | builder, security |
| `fingerprint-page-mount.jsx` | 199 | Adapted | builder. Zero identity dependency; must call the new geometry/texture function signatures |
| `dialecta-mentions-picker.jsx` | 178 | As-is | builder. Identity-agnostic, confirmed read |
| `dialecta-archetype-grid.jsx` | 176 | Adapted | designer's confirmed direct read (feeds a real build-time SVG generator) over builder's self-flagged provisional drop |
| `dialecta-notifications-data.js` | 151 | Adapted (auth rewritten) | security (5 call sites, all embed identity with no proof), migrator (both tables fully closed, harder block than comments) |
| `dialecta-classify-stream.js` | 143 | Adapted, provisional | builder, not fully read |
| `dialecta-profile-data.js` | 133 | Adapted (fetchProfile) / Rewritten (updateProfile, setFollow) | security, migrator. No write policy exists on `profiles` or `follows` |
| `dialecta-tier-capabilities.js` | 62 | As-is | security, legal, philosopher, treasurer converge, over builder's Drop. See "tier-capabilities" below |
| `topics.js` | 44 | As-is, provisional | builder |
| `editor-page-mount.jsx` | 41 | Rewritten | builder, security. Total-breakage DOM-read mount |
| `dev-admin-mount.jsx` | 33 | Dropped | Mount for a dropped surface; nothing to mount |
| `dialecta-quotes-mount.jsx` | 32 | Rewritten | builder, security |
| `notifications-page-mount.jsx` | 28 | Rewritten | builder, security |
| `community-page-mount.jsx` | 28 | Rewritten | builder, security |
| `home-page-mount.jsx` | 242 | Rewritten | builder. apps/web's `page.tsx` already exists as a real server component |
| `post-page-mount.jsx` | 239 | Rewritten | builder. apps/web's `articles/[slug]/page.tsx` already exists |
| `__DO_NOT_EDIT.md` | 16 | Dropped | builder. A sync marker, not code |

**dev-admin.** Builder and treasurer say drop; legal and security say rewrite the trust and data layer, keep the shell; migrator independently confirms the underlying tables are closed to every client-facing role regardless of what the client does. I side with drop, as a port target, because migrator's finding changes what "rewrite" would buy: even a perfectly honest rewrite still needs a new server-side capability-lookup system that does not exist today, and once that exists, most of what the 2,367-line shell provides (browse the member directory, grant a role) is exactly what Supabase Studio already does, today, for zero marginal cost, under Dan's own authenticated session. Treasurer priced this precisely; legal and security's caution is correct about *what a rewrite requires if attempted*, not about whether attempting it is the best use of the port. The two small pieces Studio does not cover (the repolish trigger, the pulse analytics view) are cheap to build fresh, small, and server-auth-from-day-one, which is treasurer's own fallback and the one I adopt.

**tier-capabilities.js.** Builder drops it, reasoning the Underwriter has no price and a gate for an unpriced tier is scaffolding. Four seats who read the file directly, security, legal, philosopher, and treasurer, independently rule it ports as-is: the file is a harmless lookup table, not a decision, and this debate's own treasurer position answers builder's stated objection by naming $50 a year. I side with the four. Precondition, named by legal and security together: it may not be wired as a real, binding restriction until a server-side mirror exists (drafted nowhere today) and Phase 4's missing documents exist. Philosopher's CI-guard recommendation, that `subscription_tier` never reach classification or vote weight, attaches to it going forward.

#### `_recovered-next/app/` (17 files)

| File | Lines | Verdict | Decided by |
|---|---:|---|---|
| `article/[slug]/opengraph-image.js` | 195 | Dropped | builder, circulation converge. apps/web's own `opengraph-image.tsx` already ships, already rule-compliant |
| `comment/[id]/opengraph-image.js` | 346 | Adapted | Four-seat convergence: legal, philosopher, builder, circulation. Cut `TIER_LABELS` and the tier segment of the footer; keep the font pipeline and defensive fallback. Legal: fix at port time regardless of whether a page serves it yet, the year-long cache header makes "unserved" irrelevant the moment it is fetched once |
| `contributor/[handle]/opengraph-image.js` | 442 | Adapted | Same four-seat convergence. Cut `PILLAR_LABELS` and the archetype/pillar caption. Prioritize over the comment card, this one is live-wired via `generateMetadata` (circulation) |
| `quote/[slug]/opengraph-image.js` | 337 | Adapted | builder, circulation. Switch card type to `summary` at launch (circulation's revised rule); predicate Unresolved, see quotes note |
| `contributor/[handle]/moment/[id]/page.js` | 251 | Adapted | circulation (drop the cross-domain redirect, single-domain apps/web is now the destination), migrator (server-only single-row read needs no new RLS policy) |
| `quote/[slug]/page.js` | 192 | Adapted, held from the first slice | builder and circulation rule it clean; migrator's predicate finding holds it back until the one query below runs |
| `components/SiteNav.js` | 93 | Adapted | circulation, designer converge. Nav vocabulary and content port; Ghost-apex hrefs, Ghost Portal auth links, and the hotlinked logo rewritten (designer: point at the local `dialecta-logo.png` already on disk) |
| `contributor/[handle]/page.js` | 91 | Adapted | builder. Fills a real gap; handle-versus-id keying needs a deliberate resolution, not a silent one |
| `globals.css` | 89 | Dropped | designer, settled in rebuttal. A third, drifting copy of tokens apps/web's own globals.css does not need |
| `layout.js` | 86 | Adapted | designer (merge, neither file is a superset), circulation (drop `metadataBase`'s wrong domain, scope signature fonts to the moment route, drop the "in active development" banner) |
| `contributor/[handle]/moment/[id]/MomentShareButtons.js` | 80 | As-is | builder. Token swap only. Flagged as a 7th client island the current mandate does not name |
| `sitemap.js` | 76 | Adapted, deferred | builder, circulation. Real, currently-missing contributor and quote coverage, owed the week those routes ship, not before |
| `api/debug/profile/[handle]/route.js` | 74 | Dropped, unanimous | legal, security, builder. The one verdict with no adapt path in the whole debate. Legal recommends removing the source file from the repository entirely, not merely excluding it from the port |
| `page.js` | 61 | Dropped | builder. Its own comment calls it a placeholder |
| `robots.js` | 28 | Dropped | builder, circulation. Redundant; probe-route entries trace to the dropped debug route |
| `api/health/route.js` | 16 | Dropped | builder, circulation. apps/web's own does more |
| `contributor/[handle]/moment/[id]/opengraph-image.js` | 491 | Adapted | circulation and philosopher, converged after rebuttal: 6 of 8 event types ship. `tier_promoted` moved to the on-platform Identity Event feed; `follower_milestone` dropped outright |

**Quotes predicate.** Circulation calls the quote surface the one card in the tree with no precondition and recommends it for the first slice. Migrator found the original source migration declares `quotes.status` as `live`/`draft`/`archived` with predicate `status = 'live'`, while the baseline schema guesses `'published'` and marks itself `LIVE UNVERIFIED`. No row satisfies both. This is not a values disagreement, it is an unconfirmed fact, and I will not launder it into a decision either way. Unresolved. It settles with one query, given by migrator: `select policyname, qual from pg_policies where tablename = 'quotes'`. Until that runs, `quote/[slug]` and its OG image are real, well-built, adapted candidates, and held out of the confirmed first slice, not out of the port.

#### `_recovered-next/lib/` (7 fetchers)

| File | Lines | Verdict | Decided by |
|---|---:|---|---|
| `get-article.js` | 161 | Dropped | builder, circulation. Ghost-primary, ADR-001 violation |
| `get-comment.js` | 123 | Adapted, provisional | legal, circulation converge on the same unread dependency: `status` and `final_tier` can drift apart, so the visibility gate can serve a Breach-classified comment as if it were clean. Must not be wired to any live comment card until that is closed, by the pipeline owner, not by this file alone |
| `get-profile.js` | 73 | Rewritten | builder, circulation. Step 1 already a direct Supabase query; Step 2's legacy Vercel call is new code against a known target shape |
| `get-quote.js` | 60 | Adapted, predicate Unresolved | builder, circulation on shape; migrator on the open predicate question above |
| `get-moment.js` | 197 | Adapted | builder, migrator on schema fit; philosopher and circulation on cutting `tier_promoted` and `follower_milestone` from the eight event types |
| `ghost-admin.js` | 65 | Dropped | builder. Only caller is dropped; ADR-001 forbids it outright |
| `og-background-config.js` | 46 | As-is, once moments ship | builder, designer, circulation. Pure static data, zero coupling |

#### Design-token pipeline (outside `_recovered-next`)

| File | Verdict | Decided by |
|---|---|---|
| `apps/web/src/styles/tokens.css` | Adapted | designer. Stays generated; source flips from the design spec to the live style.css, sequenced after `--tier-*` tokens land there and after `--amber`/`--border-light` are resolved (Dan's, see below) |
| `scripts/extract-tokens.mjs` | Adapted | designer. One `specPath` line, same sequencing |
| `design/dialecta-design-spec.html` | Adapted | designer. Role changes from value source to generated-from; `apps/web/CLAUDE.md` line 8 needs the matching edit in the same commit |

### The Ghost coupling question

Builder and security measured the same tree and disagree on what the measurement licenses. Four component classes, and the honest cost differs by class, not by a single multiplier applied to all 55 call sites.

**The 21 files needing nothing for identity reasons.** No disagreement. Cost is zero. Their content-level verdicts above stand on their own.

**The 9 DOM-read files** (`shell.jsx` and the eight `*-mount.jsx` files). Builder and security agree these need full rewrite, not adaptation: there is no App Router equivalent to a Ghost `.dataset` or `window` global read. The cost is real but bounded, because `apps/web`'s middleware already does the hard part, a verified JWT via `getClaims()`, so one pattern replaces all nine reads. What is not yet answered is architectural, not mechanical: `apps/web/CLAUDE.md` authorizes six client islands, and several of these nine mounts feed surfaces outside that list (dev-admin, quotes, community, notifications). Whether each becomes a seventh-or-later island or gets restructured as a server component with Server Actions is a real decision this debate surfaced but did not settle, and it changes the cost of everything downstream of it. I am naming it as open rather than picking for whoever owns that list.

**The trust-decision layer, roughly eighteen files.** This is the real disagreement, and migrator's independent table-by-table read settles the factual question underneath it: with the sole exception of `comments`, and even that only owner-scoped, none of these files' target tables carry a write policy of any kind today. Given that fact, "adapted" undersells what a dozen of these files need and "rewritten" overstates what all of them need, because the two layers of a single file can and do take different verdicts, which is exactly the shape legal already used on `dialecta-dev-admin.jsx`: split the file, keep the surface, rebuild the logic under it. I generalize that split as the standing rule for the whole bucket. The JSX, the form, the layout, the interaction, stays "adapted," matching the frame's own definition, logic survives, something specific changes. The identity and mutation logic underneath is "rewritten," also matching the frame's own definition, the surface is kept and the code under it is not, because re-sourcing a variable from a DOM read to a session hook is a prop rename when a policy exists to write through, and a different, larger job, designing and landing that policy or a `SECURITY DEFINER` function, when it does not. `api/comment/route.ts` already proves the pattern for one surface. It does not yet exist for the other eight security named. Where the table above marks "Adapted (auth rewritten)," this is what that means, stated once here rather than argued file by file.

**The admin family specifically.** Worse than the general trust-decision bucket, per migrator: all six admin tables are closed to both `anon` and `authenticated`, not merely missing a policy, so even a flawless session-verified client rewrite still reads nothing until a new server-side capability function is built. That is why dev-admin and its two siblings are ruled Dropped above rather than merely Rewritten: the return on carrying forward a UI shell is much lower once the entire data-access shape has to change, not just its trust source.

### The design system

Colour and papergrain port independent of any component, from the live `style.css`'s single `:root` block, at close to zero cost (designer). Two forked values, `--amber` (`#b8732a` in the design spec, `#b8862e` in the live site) and `--border-light` (a flat colour in the spec, a translucent one live), currently apply nowhere in `apps/web` today, so nothing breaks by resolving them, but nothing resolves them either without Dan naming which is real, or whether both should exist as distinct tokens. That is on the Dan list below.

Wood needs a plainer statement than "it ports," because what ports and what Dan may be picturing are not the same thing. The tokens and the one-pixel `--wood-edge` rim port as-is, at zero cost, used constantly across the tree's two busiest files. The fuller plank texture the tokens also define, `--wood-grain`, has never been painted onto any surface, anywhere, in 3,286 lines. Porting the tokens verbatim reproduces exactly what exists today, a rim, not a plank. Painting the fuller texture for the first time is new design work, not a port. Designer's rebuttal adds two facts nobody had connected before this debate: a second, independently named wood vocabulary (`--walnut`/`--cherry`/`--burnt`) sits in `page-stewards.hbs`, matching none of the live site's values, and a component called `WoodFrameProgressBar.jsx`, marked Complete in the project's own build audit, no longer exists anywhere in this repository. Both are named for Dan below.

Layout does not port as one thing. `shell.jsx` is Rewritten, its Ghost mount architecture has no equivalent; `layout.js` is Adapted as a merge with the live `apps/web/src/app/layout.tsx`, neither file being a superset of the other; `SiteNav.js` is Adapted, its content and nav vocabulary survive, its Ghost-apex premise does not.

`tokens.css` stays a generated file and its source flips from the design spec to the live `style.css`, sequenced after the `--tier-*` tokens land there and after the two forked values are named. That sequencing, not the flip itself, is the schedule risk: flipping early, before tier tokens exist in style.css, would silently delete all 28 tier colours from `tokens.css` (designer).

### The first increment

Builder's slice holds in substance, five files plus one already-built route, but the file list was incomplete until migrator's schema read filled it in, and both gaps change the number.

0. **Two migrations land first**, not alongside the UI work (migrator's own recommendation, adopted directly). One: the article-content columns (`slug`, `title`, `body_json`, `body_html`), additive, on 5 live rows, confirmed absent from the live `articles` table today by migrator's direct read of the baseline migration's own inline comment. Without it, `apps/web`'s existing article page is not "already built" as builder's Question Four framed it, it queries columns that do not exist. Two: a public read policy on `comments` (status in published or suppressed, or an author match), which does not exist today even after this session's own work landed the insert and owner-read policies. Without it, the demo below proves a private echo, not a shared thread, exactly the gap builder conceded.
1. `--tier-*` tokens, the narrow slice of style.css's promotion the badge needs, not the full reconciliation.
2. `dialecta-tier-badge.jsx`, adapted, with designer's Heat and Stance contrast fix landed in the same commit, not carried forward as a known defect.
3. `dialecta-private-draft.jsx`, adapted, Stage 2.5 feature-flagged off at launch.
4. `dialecta-discourse-layer.jsx`, adapted, read path now real once migration 0 lands, edit and delete rewritten to session-sourced auth.
5. `apps/web/src/app/articles/[slug]/page.tsx`, extended to mount the composer and the feed, now possible once migration 0 lands.
6. `apps/web/src/app/api/comment/route.ts`, already built, unchanged.

The quote surface does not join this slice. Circulation's case for it was strong, but it rests on a predicate migrator shows is unconfirmed; adding it now risks a card that silently renders nothing. It is the strongest second-slice candidate once the one query above runs.

**The number: 7 to 10 working days**, treasurer's revised figure after pricing in both migrations, not the original 5 to 8. Compression against the 25-to-35-day full rewrite softens from 3-to-7 times to 2.5-to-5 times. Still the load-bearing fact for the recommendation below. Treasurer's own open item stands unresolved: the 5-to-7-week full-port estimate has not yet priced the eight authorization surfaces security found with nothing built at any layer, and treasurer says plainly it probably does not already cover them. Whoever picks up the full port next should treat that number as a floor, not a ceiling.

### Recommendation

Port it, file by file, exactly as the table above lays out, and treat that table as the answer to Dan's request rather than a hedge against it. Builder's headline number, 46 of 75 adapted against 16 dropped and 10 rewritten, holds up under eight more seats' worth of adversarial reading, and every seat's corrections refined which *layer* of a file needs the harder word, not the overall proportion of the tree that survives. Nothing in eight independent, hostile reads found a design or UX surface, colour, papergrain, the wood rim as it actually ships, the discourse layer, the editor's stage flow, the community and opinion-map surfaces, that should be thrown away and rebuilt from nothing. What does not survive is narrow and each time traces to one of three things Dan is not being asked to relitigate: an ADR already decided (001, 002, 003), the no-tier-badge and no-fingerprint-descriptor rule legal and philosopher locked before this debate opened, or a schema reality no amount of intent changes, tables with no policy, in one case no table at all. That is the honest shape of "port as much as possible" once it is run through a file grain instead of a category, and it is not a smaller instruction than the one Dan gave, it is the same instruction with the two migrations, the Stage 2.5 flag, and the trust-layer rewrites now named instead of assumed.

### What is Dan's to decide

1. **`stage` against `delta_of`.** Evidence leans `stage`: it is already live, matches the written spec, and a recovered file already assumes it. Whether the Delta Mechanic should ever grow to support more than one revision is a product question about what the mechanic is for, not a schema question, and it is his.
2. **Whether comment-side Stage 2.5 is a mechanic he wants at all.** It ships flagged off at launch either way. This decides whether it is ever turned on, and it needs a written spec the day it is, not after.
3. **The Underwriter price, $50 a year.** Free to set now, deciding costs nothing, per legal's own point that only charging waits on the missing documents. It is a real business call with zero demand data behind it anywhere in this repository, and only Dan can weigh it against $100 with nothing yet to test either against.
4. **The two forked token values, `--amber` and `--border-light`.** Two real hex values quietly disagree between the design spec and the live site with no record of which was intended, or whether both should exist as distinct tokens for distinct use. Neither is live in `apps/web` today, so nothing breaks by naming the answer, and nothing resolves without it.
5. **Whether the lost `WoodFrameProgressBar.jsx` is worth recovering, and whether the fuller wood-plank texture, never live anywhere, is even wanted.** It shipped once, was marked Complete in the project's own build audit, and no longer exists anywhere in this repository.
6. **`dialecta-profile-order.jsx`'s 40-Order taxonomy.** Not a port question, a design question: no document anywhere describes what the 40 Orders are or should be. Spec-reader recommends holding the port until that is written down, by Dan or whoever he delegates it to, since he is the one who built everything else this platform's identity system rests on.

## Outcome

**Open. Dan decides.** Protocol step 5: Dan rules, in session or in Cowork, `decider` writes the
ADR from the `/dialecta-decide` template, links this log, and marks the backlog row Decided. Step
6: each seat updates its `positions.md`, including "lost this one, because."

Six items are his and are listed above under "What is Dan's to decide." Two things are free to
decide now and block other work by not existing: the Underwriter price and the two forked token
values.

One thing the chair could not decide and nobody should launder into one: the `quotes.status`
predicate. `_recovered/supabase/migrations/007_quotes_table.sql` declares `live` / `draft` /
`archived` with a `status = 'live'` policy; `supabase/migrations/20260920000000_baseline_live_schema.sql`
guesses `'published'` and marks itself `LIVE UNVERIFIED`. No row satisfies both. One query against
the live database settles it and it is the cheapest open item in the debate:

```sql
select policyname, qual from pg_policies where tablename = 'quotes';
```
