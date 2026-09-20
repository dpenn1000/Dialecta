# Builder position: the estimate, re-run with the recovered front end

## Brief

"A week or two" was wrong, and I said so. My 6 to 10 week rebuild and 3 week slice
were also wrong, backwards: both assumed the front end had to be written. It doesn't. I
read the App Router tree whole, the editor's structure, and the discourse layer to
check that claim rather than accept it. The cited 76,674 lines overstate the portable
surface by half: a compiled bundle in a dated archive folder is most of the gap. Net of
that, and of an architecture where identity mostly arrives as a prop, the number moves,
but not to "days" for a full rebuild. Revised: full rebuild 5 to 7 weeks, slice 5 to 8
working days.

## The 76,674 figure, corrected

`_recovered-next/lib/theme/_archive/2026-05-02/bundle.js` is 43,517 lines by itself, and
it opens with esbuild's own interop shim, `__commonJS`, `__copyProps`, `__toESM`,
wrapping a full inlined copy of `react.development.js`. That's a compiled build
artifact, not authored source, sitting in a folder dated 2026-05-02, two days before
the 2026-05-04 sync stamp `__DO_NOT_EDIT.md` gives the rest of `lib/theme/`. Strip it and the
1,520-line `package-lock.json`, and the real authored surface is about 39,800 lines:
34,656 in `lib/theme` outside that archive folder, 2,948 in `app/`, the rest in small
`lib/*.js` fetchers. Roughly half the headline count. Still a lot of code, and it's the
number I'm estimating against.

## The Ghost assumption, quantified

The coupling isn't spread evenly. `shell.jsx` and eight small `*-mount.jsx` files,
28 to 242 lines each, read `window.__DIALECTA_MEMBER_UUID__`, a Ghost-session value
injected the same way `page-profile.hbs`'s `{{@member.uuid}}` already showed up in
SITE-INVENTORY. That's the real coupling, and it's contained: I checked it directly
against the three biggest, most load-bearing components. `dialecta-editor.jsx` takes
`memberUuid` as a prop. `dialecta-discourse-layer.jsx` takes `viewerMember` as a prop
and has zero internal Ghost references. `dialecta-profile.jsx` takes `viewerGhostId` as
a prop. All three were built to receive identity, not fetch it, so today's
session-verified auth replaces Ghost at roughly a dozen mount points, not across 76,000
lines. The exception is `dialecta-dev-admin.jsx`, 2,367 lines, 57 Ghost hits, genuinely
entangled; per my own prior position, admin can wait or run through Supabase Studio.

## Revised numbers

Backend Ghost-decoupling, `comment.js`, `classify.js`, `article/submit`,
`article/publish`, plus the claim-token identity work, is unchanged by today's find.
Still the dominant cost, and it doesn't care what the frontend looks like. What
compresses is the client islands: `apps/web/CLAUDE.md` names six (composer,
classification card, votes, the Fingerprint, opinion maps, the editor), and every one
now has a same-stack, Next 15/React 19 prior implementation to adapt instead of author
from nothing, composer and votes inside the discourse layer, classification via
`dialecta-article-classification.jsx`, the Fingerprint via its engine, opinion maps via
their map components, the editor itself.

**Full rebuild: 5 to 7 weeks**, down from 6 to 10. Not lower, because the backend and
the auth rewiring are unchanged, and every ported file still needs a design-token,
voice, and sanitization pass it doesn't have today.

**Vertical slice: 5 to 8 working days**, down from 3 weeks, because the one path a
slice needs, article, comment, classify, a rendered card, is now a port of the discourse
layer's comment UI and a mount-point fix, not new UI.

## Port or rewrite

Port: the discourse layer nearly whole, the profile family (profile, settings, edit,
identity-edit, order), the App Router SSR tree (sitemap, robots, OG images, the
contributor/quote/moment pages), the sidebar, notifications, opinion maps, the
fingerprint engine, the quotes app.

Rewrite, not port: the editor's `ProseEditor` piece, roughly 250 of its 4,727 lines,
contenteditable plus `execCommand`. `apps/web/CLAUDE.md` and the editor's own README
already commit to TipTap writing `body_json`/`body_html`; porting the old text box
would contradict a decision already made and leave the rest of that schema unfed. The
other ~4,400 lines of that file, stage flow, tag picker, opinion-map inputs, polish
panel, publish flow, Stage 2.5, aren't about the text box and port intact.

## What apps/web has no plan for

`contributor/[handle]`, moments, and `quote/[slug]` aren't abandoned experiments. Ghost
admin's own analytics say `profile` is the single most-visited page on the live site, 44
uniques, nearly double the next; `quotes` is a published, live Ghost page with a real
subsystem behind it; moments are the celebration mechanic built on that same profile
surface. `apps/web` has zero files touching any of the three. That's a blind spot in the
rebuild plan, not a cut feature, and it's owed.
