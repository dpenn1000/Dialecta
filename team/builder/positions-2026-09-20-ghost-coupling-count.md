# Builder position: Ghost coupling, counted by method

## Brief

Both prior figures are right, and about different things. Nine files read the Ghost
injection off the DOM. Thirty-seven files (not security's 38: `dialecta-sidebar.jsx`
moves to agnostic on a full read, below) reference member identity somewhere in their
own source. Neither number is the port cost. The cost is the fifty-five call sites,
in twenty-one of those thirty-seven files, that put a viewer-identity value on the
wire. Everything else, nine identity-referencing files that only ever receive the
value as a prop plus twelve fully agnostic ones, twenty-one files in all, needs no
change for identity reasons at all.

Net of that count: **the estimate holds. Full rebuild 5 to 7 weeks, slice 5 to 8
working days, unchanged.** Not because the coupling turned out smaller than security
found, it didn't, but because the added precision lands inside work the estimate
already carried ("every ported file still needs a design-token, voice, and
sanitization pass it doesn't have today"), not on top of it. Detail below.

## Method

Three categories, checked in this order for every file that names identity:

1. **DOM-read.** The file itself reads `window.__DIALECTA_MEMBER_UUID__`,
   `element.dataset.member*` / `.dataset.viewer*` / `.dataset.isMember`, or
   `getAttribute('data-member-*')`. This is the injection point. It has to be
   rewritten outright, there is no Ghost DOM to read from once Ghost is gone.
2. **Prop-receive.** The file takes identity as a function parameter or a
   destructured prop (`memberUuid`, `viewerGhostId`, `viewerMember`, a `member`
   object), read or branched on inside the file, but the file makes no network
   call that embeds it. Its own code needs nothing. The value it receives changes
   source at whichever Category-1 or Category-3 point produces it; this file is
   never touched.
3. **API-embed.** The file's own `fetch()` (or a shared helper it calls, like
   `jsonFetch`) puts a member/viewer identity value into a URL, query string, or
   JSON body headed to the server. Whether that value arrived via DOM-read or via
   prop is irrelevant here: the call site itself needs its identity argument, and
   likely its auth mechanism, re-sourced.

A fourth bucket sits outside all three and matters as much as any of them:
**content-addressing.** Some fields that match a naive grep for `memberId` or
`ghost_member_id` are not the viewer's own identity at all, they're a data
reference: which article's author, which other contributor's row, which seed
profile a hero carousel shows. Those need no change of any kind; the id comes from
content either way, regardless of which auth system is running. Two of security's
grep hits and one of mine turned out to be exactly this, caught only by reading
the surrounding function, not by the match itself. Detail in "Corrections" below.

A file can be DOM-read and API-embed at once (two files are), or prop-receive and
API-embed at once (nineteen files are). "Prop-receive only, zero own network code
touching identity" is the one shape that is genuinely free, and it is real, it
just isn't the whole 37.

## Count

**51 top-level files in `_recovered-next/lib/theme/`** (`find -maxdepth 1 -type f`,
matches security's count), 4 more in `_archive/2026-05-02/`, excluded as before
(compiled bundle, dated ahead of the sync stamp). Of the 51: 2 are not code
(`__DO_NOT_EDIT.md`, `style.css`), 49 are `.js`/`.jsx`.

### Category 1: DOM-read (9 files, confirmed by direct read, not grep alone)

| File | Lines | What it reads |
|---|---|---|
| `shell.jsx` | 226 | `window.__DIALECTA_MEMBER_UUID__`, `_EMAIL__`; `dataset.isMember`, `dataset.memberUuid` |
| `home-page-mount.jsx` | 242 | `dataset.memberId/.memberName/.memberEmail/.memberAvatar/.memberCreated` |
| `post-page-mount.jsx` | 239 | `dataset.memberUuid/.memberName/.memberEmail` (x2 more roots), `dataset.memberId` (x2 more roots) |
| `editor-page-mount.jsx` | 41 | `dataset.memberUuid/.memberEmail/.memberName` |
| `notifications-page-mount.jsx` | 28 | `dataset.memberUuid` |
| `dev-admin-mount.jsx` | 33 | `getAttribute('data-member-uuid'/'data-member-name')` |
| `community-page-mount.jsx` | 28 | `dataset.viewerUuid` |
| `dialecta-quotes-mount.jsx` | 32 | `dataset.memberId/.memberName` |
| `dialecta-handle-setup.jsx` | 302 | `window.__DIALECTA_MEMBER_UUID__`, read directly inside `HandleSetupGate`, not passed as a prop |

A comprehensive re-sweep of all 49 code files for `window.__DIALECTA_MEMBER`,
`.dataset.(member|viewer|isMember)`, and `getAttribute('data-(member|viewer|is-member)')`
returns exactly these 9 and no others. This is the injection surface, full stop.

**Correction to my own prior position:** I wrote "shell.jsx plus eight small mount
files." Close, but the ninth file isn't a `*-mount.jsx` file. It's
`dialecta-handle-setup.jsx`: `HandleSetupGate` is mounted bare from `shell.jsx`
(`<HandleSetupGate />`, no props) and reads the window global itself at line 237.
`fingerprint-page-mount.jsx`, which I'd have guessed belonged in a list of nine
mount files, reads no identity at all (confirmed below). The count of nine holds;
which nine does not match what "eight mount files" implies.

### Category 3: API-embed (21 files, 55 call sites, verified per site)

Every `fetch(` in the tree was located (63 total, `grep -rn "fetch(" | grep -v
_archive`), then read in context, not just pattern-matched. Two raw grep hits I
initially flagged turned out to be content-addressing, not viewer identity, and I
excluded them:

- `fingerprint-page-mount.jsx:73`: `row.ghost_member_id` is keying the response
  for three hardcoded seed ids (`seed:maya`, `seed:wen`, `seed:anselm`, confirmed
  at lines 21 and 63-81). No viewer identity involved anywhere in the file.
- `dialecta-sidebar.jsx:284`: `useArticleAuthor(authorMemberId)` fetches the
  **article's author's** public card. `authorMemberId` comes from
  `sidebarRoot.dataset.authorId` in `shell.jsx`, content the article carries, not
  the viewer's session. I read the file's full export signature (line 1444,
  `articleId, articleSlug, authorMemberId, authorName, primaryTagSlug,
  primaryTagName, articleClaims`, no viewer field anywhere) and its `usePulse`
  hook (real fetch commented out, `generateMockPulse` used instead, no member
  param even in the commented "real version"). Security held this file at lower
  confidence and flagged the mechanism as unpinned; on a full read it resolves
  clean. **`dialecta-sidebar.jsx` is agnostic**, not one of the 38.

One file (`dialecta-community-contributors.jsx`) has two fetches in the same
component, one content-only (`/api/profile/_list`, the public directory, no
identity) and one viewer-identity (`/api/profile/${viewerGhostId}`, the viewer's
own follow graph), both flagged by a naive grep on the enclosing function; only
the second counts.

| File | Lines | Call sites | What's embedded |
|---|---|---|---|
| `dialecta-dev-admin.jsx` | 2,367 | 11 of 12 `fetch()` | `member_id`/`member_uuid` on every admin mutation; only `/api/profile/_list` (picker) carries none |
| `dialecta-quotes-data.js` | 229 | 10 `jsonFetch()` | `member_id` on 9 unconditionally, 1 (`useQuoteList`) only for non-live status |
| `dialecta-notifications-data.js` | 151 | 5 | `member_uuid` in `fetchNotifications`, `markRead`, `markAllRead`, `fetchPrefs`, `savePrefs` |
| `dialecta-editor.jsx` | 4,727 | 3 of 8 `fetch()` | `member_uuid` on `upload-image`, `article/submit`, own-profile fetch; `publish`, `classify`, `suggest-topics`, `aesthetic-suggest` (x2) carry none |
| `dialecta-discourse-layer.jsx` | 1,251 | 3 | `viewer` query param on the comment list GET; `member_uuid` on comment edit PATCH and delete |
| `dialecta-profile-data.js` | 133 | 3 | `memberId` in the URL for `fetchProfile`/`updateProfile`; `viewerMemberId` in the body for `setFollow` |
| `dialecta-private-draft.jsx` | 1,796 | 2 | own-profile GET at line 1361; `member_uuid`/`member_email` on the comment POST at 1440 |
| `dialecta-admin-repolish.jsx` | 485 | 2 | capability-check GET; `member_uuid` on the repolish POST |
| `dialecta-admin-resetup-maps.jsx` | 656 | 2 | capability-check GET; `member_uuid` on the save POST |
| `dialecta-community-contributors.jsx` | 687 | 2 | `viewer_member_id` on follow toggle; `viewerGhostId` in the follow-graph GET |
| `dialecta-profile-order.jsx` | 698 | 2 | `member_uuid` on `classifyOrder`; path segment on `commitOrder` |
| `home-page-mount.jsx` | 242 | 1 | `viewer` query param on the live-feed fetch |
| `dialecta-handle-setup.jsx` | 302 | 1 | own uuid in the handle-status GET |
| `dialecta-share.jsx` | 359 | 1 | `member_uuid` (optional) on the share-track POST |
| `dialecta-community-author.jsx` | 713 | 1 | `viewer_member_id` on follow toggle |
| `dialecta-community-feed.jsx` | 759 | 1 | `viewer` query param on the feed GET |
| `dialecta-profile-edit.jsx` | 621 | 1 | `member_uuid` on avatar upload |
| `dialecta-profile-identity-edit.jsx` | 1,075 | 1 | `member_uuid` on image upload |
| `dialecta-profile-settings.jsx` | 558 | 1 | path segment on the signature-font PATCH |
| `dialecta-opinion-map-placement.jsx` | 670 | 1 | `member_uuid` on the placement POST |
| `dialecta-nomination-panel.jsx` | 658 | 1 | `member_uuid` on the nominate POST |

**Total: 55 call sites across 21 files.** Two of those 21 (`home-page-mount.jsx`,
`dialecta-handle-setup.jsx`) are also Category 1.

### Category 2: prop-receive only, zero own network code (9 files)

`dialecta-quotes-app.jsx` (932), `dialecta-profile.jsx` (2,865, confirmed zero
`fetch()` calls in the file, `setFollow` is called with `viewerGhostId` but lives
in and executes from `dialecta-profile-data.js`), `dialecta-profile-data-pure.js`
(204, pure `mergeProfileWithGhost`, takes a plain object), `dialecta-notifications-settings.jsx` (352), `dialecta-notifications-page.jsx` (268),
`dialecta-notifications-bell.jsx` (395), `dialecta-community.jsx` (232, the tab
router), `dialecta-article-classification.jsx` (686, threads `memberUuid` to
`InteractiveMap` in `dialecta-opinion-map-placement.jsx`, which is already counted
in Category 3), `dialecta-signup-invite.jsx` (346).

These 9 files, 6,280 lines, need no edit of their own for identity reasons. The
value they receive changes source upstream; that's the whole cost.

### Agnostic (12 code files, 5,310 lines, plus 2 non-code)

Security's 13 minus `fingerprint-page-mount.jsx`'s reclassification is unchanged;
`dialecta-sidebar.jsx` joins this bucket per the correction above, making it 12 code
files against the corrected 37: `topics.js`, `dialecta-tier-capabilities.js`,
`dialecta-tier-badge.jsx`, `dialecta-fingerprint-engine.jsx`,
`dialecta-archetype-grid.jsx`, `dialecta-mentions-picker.jsx` (its `ghost_member_id`
hits are `@mention` candidates' own ids, not the viewer's, confirmed at lines 16
and 100), `dialecta-opinion-map.jsx` (zero references to `memberUuid` anywhere,
confirmed directly, despite feeding `InteractiveMap`'s sibling file),
`dialecta-opinion-map-picker.jsx`, `dialecta-reflection-bar.jsx`,
`dialecta-classify-stream.js`, `fingerprint-page-mount.jsx`, `dialecta-sidebar.jsx`.

**Reconciliation check:** 627 (Category 1 only, 7 files) + 544 (Category 1+3, 2
files) + 18,593 (Category 3 total including the 2 dual-tagged, 19 more files) +
6,280 (Category 2 only, 9 files) + 5,310 (agnostic, 12 files) = 31,354 lines,
exactly the tree total from the prior pass. No file counted twice, none dropped.

## What each category costs to port

**Category 1, DOM-read (9 files, ~1,171 lines combined): rewrite, not port.**
This is the one place "port" is the wrong word. `apps/web` is Next.js App
Router on Supabase Auth (`apps/web/src/app/auth/callback/route.ts` exists, a
PKCE-style callback, which is not how Ghost's theme ever established identity,
Ghost templated a value into server-rendered HTML and the client read it off the
DOM once at mount). Nine small files, each 28 to 302 lines, need their read
replaced with whatever session hook or server-component pattern the new stack
already uses for `/auth/callback`. Small individually. This is the one place
where the shape of the work, not just the line count, changes.

**Category 3, API-embed (21 files, 55 call sites): the call site's identity
argument gets re-sourced, not the surrounding component rewritten.** A
`fetch()` that currently reads `member_uuid: memberUuid` changes what feeds
`memberUuid`; the file around it, the stage flow, the tag picker, the follow
button's hover state, is untouched. This is mechanical per site. It is not zero,
which is the gap in my prior position: I said the coupling was "concentrated in
shell.jsx plus eight small mount files" and stopped there, which is true of
Category 1 and silent on Category 3. Fifty-five sites is a real sweep, not a
side effect of fixing nine files.

One thing this count adds for whoever writes these 55 call sites, not for the
estimate: `security`'s read of `dialecta-dev-admin.jsx` and (independently,
this pass) `dialecta-quotes-data.js` found every one of these sites sends the
identity value with no session proof behind it, an unauthenticated fetch trusts
whatever string sits in `member_uuid`. That is a defect in the old Vercel API
behind `_recovered-next`, not in `apps/web`, and `security`'s own read says so
("a different codebase"; does not touch what `apps/web` verifies today). It
means the 55 sites should be rewritten to rely on a verified session rather than
a re-sourced but still client-asserted id, which is a slightly different edit
than a pure string swap, not a slower one, and worth naming so the port doesn't
carry the old trust shape forward by habit.

**Category 2, prop-receive only (9 files, 6,280 lines): needs nothing.** This
is the part of my prior claim that holds exactly as stated. `dialecta-profile.jsx`
is 2,865 lines and makes zero network calls of its own; `viewerGhostId` is read,
compared, and forwarded, never sent anywhere by this file. Same shape in the other
8.

**Content-addressing ids (across many files, not separately tallied): needs
nothing, ever.** `authorMemberId`, the `_list`/`_author` target lookups, the
fingerprint hero's three seed ids. These reference content, and content comes
from the same place (eventually Supabase, already true for `apps/web`)
regardless of who's asking or which system verified them.

## Does the estimate hold

**Yes. Full rebuild 5 to 7 weeks, vertical slice 5 to 8 working days, both
unchanged from the prior pass.**

The reason isn't that the coupling shrank. Fifty-five call sites in 21 files is
more surface than "shell.jsx plus eight mount files" said. The reason is where
that surface falls. Every file carrying more than one or two Category-3 sites was
already named in the prior estimate for other, larger reasons:

- `dialecta-dev-admin.jsx` (11 sites) was already carved out: "admin can wait or
  run through Supabase Studio."
- `dialecta-editor.jsx` (3 of 8 fetches) was already the file getting a 250-line
  `ProseEditor` rewrite for TipTap; three call-site edits inside a file already
  being substantially rebuilt don't move that file's estimate.
- `dialecta-quotes-data.js` (10 sites) and `dialecta-notifications-data.js` (5
  sites) are each a single shared data file behind 3 UI files apiece. Fixing the
  data file fixes every consumer; the UI files (`quotes-app.jsx`,
  `notifications-bell/page/settings.jsx`) don't change at all, confirmed above.
- `dialecta-discourse-layer.jsx` and `dialecta-private-draft.jsx` (5 sites
  combined) are exactly the slice's own critical path (comment write, comment
  read). The slice estimate already assumed opening and adapting these two
  files; five identity call sites inside them is not new scope, it's the
  content of the scope that was already named.
- The profile and community families (12 sites: 8 across `profile-data.js`,
  `profile-edit`, `profile-identity-edit`, `profile-order`, `profile-settings`,
  roughly 6,150 lines; 4 across `community-contributors`, `community-author`,
  `community-feed`, roughly 2,400 lines; `dialecta-profile.jsx` and
  `dialecta-community.jsx` themselves carry none) were already described as
  porting "nearly whole." That phrase means the JSX and business logic
  transfer; it never meant zero lines change. One or two call-site edits per
  file, inside files you're already opening to move them into the new tree, is
  what "nearly whole" was always going to cost. `dialecta-quotes-app.jsx`
  belongs in the same "nearly whole, zero sites of its own" bucket; its cost is
  entirely the `quotes-data.js` line above.

Fifty-five small, well-understood edits, concentrated in files already flagged
for other work or already inside the slice's named path, is a sharpening of "every
ported file still needs a design-token, voice, and sanitization pass it doesn't
have today," not an addition on top of it. If that line in the prior estimate had
said "and no file needs its own logic touched," this count would move the
estimate. It didn't say that.

## Where this leaves the two positions

**Not a disagreement, once measured.** My "concentrated in shell.jsx plus eight
mount files" and security's "38 of 51 files reference identity" were never
competing claims. Mine described where the DOM injection is read (9 files,
confirmed). Security's described every file that names identity in its own
source by their stated grep-then-read method (37 files, corrected from 38 by one
file). Both hold at once because they counted different things, exactly the shape
the research skill predicted before either of us re-checked.

**Corrections, not disagreements, in both directions:**
- I owe mine: "eight small mount files" implied the DOM-reading set was the
  entire cost. It's about a quarter of the identity-referencing surface by file
  count (9 of 37) and well under a twentieth by line count (1,171 of 26,044);
  the other 55 call sites in 21 files are real and I hadn't enumerated them.
- Security's flagged uncertainty on `dialecta-sidebar.jsx` resolves clean:
  agnostic, confirmed by reading the full export signature and the (mocked,
  unimplemented) pulse hook. That was the right call to flag rather than guess,
  and it checks out as agnostic.

**One open item, not mine to close:** security's finding that every Category-3
call site trusts a client-supplied id with no session proof is a statement about
the old Vercel API's behavior, correctly scoped in their own doc to
`_recovered-next`, not to `apps/web`. I have not read any `apps/web` API route to
confirm it enforces session checks on the equivalent endpoints going forward;
that's a security-seat read, not a frontend line count, and it doesn't change
this count either way. It does mean whoever writes the 55 replacement call sites
should not reach for the old shape (id in the body, no header, no credentials) out
of habit. Worth a line in whatever brief hands this count to the build.

**No numeric disagreement remains between the two positions.** 9 (DOM-read) + 37
(identity-referencing, corrected) + 55 (call sites, newly counted) are not three
competing estimates of the same thing; they answer three different questions,
stated plainly enough now that `security` can check each one against the same
files.
