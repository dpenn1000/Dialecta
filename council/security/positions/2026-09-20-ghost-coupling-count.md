# Ghost coupling in lib/theme, re-derived by a different method

**Seat:** security. **Written:** 2026-09-20. **Status:** second pass on my own
2026-09-20 finding, done independently of `builder`'s concurrent re-run, per
`dialecta-research/SKILL.md`'s "Finish the research before the build" section.
Revised count: **37 of 51, not 38.** One file I carried at low confidence does
not survive a full read. Everything else confirms, and the method below finds
more, not less, once the count is broken into what each coupling actually is.

## Method

"References Ghost-derived identity by name" was one grep and one bucket. That
collapses three different couplings with three different security
consequences into one number. This pass separates them and re-derives the
count by reading each file's actual identity-handling code, not just the
presence of a matching token.

**Category 1, DOM or window reader.** The file's own source calls
`window.__DIALECTA_MEMBER_UUID__` / `window.__DIALECTA_MEMBER_EMAIL__`, or
reads a `data-*` attribute off an element (`.dataset.memberUuid`,
`.dataset.viewerUuid`, `getAttribute('data-member-uuid')`, and their
siblings). This is the injection point itself: whatever string sits in the
DOM or the global at load time becomes this file's entire notion of who is
asking. Confirmed by grep, then read at each hit to rule out
`window.__DIALECTA_API_URL__` (a config value, not identity) polluting the
count, which a same-shaped but broader grep would have done.

**Category 2, prop or argument receiver.** The file takes identity as a
component prop or a function parameter, supplied by a caller, and does not
itself touch `window` or the DOM for it. Confirmed by reading each file's
exported signatures (`export default function X({...})` and every named
`export function` / `export async function`), not by grepping variable
names, because naming is inconsistent enough that name-grepping misses real
cases (below).

**Category 3, trust decision versus passthrough versus presentation gate.**
This is the sub-split inside category 2 the brief asked for, since "receives
a prop" was the whole of `builder`'s argument and it is not one thing.
Applying the task's own test, gating a control is a trust decision, rendering
a name is not, I read each category-2 file for what it does with the value
and sorted into three buckets:

- **Passthrough.** The value is forwarded into an outbound fetch/log call, or
  one level further down to a child, with no local branch on it. Nothing in
  this file changes what renders or what is writable because of the value.
- **Presentation gate.** The file branches on the value, but the branch picks
  a default tab or hides a self-referential affordance (a Follow button on
  your own card). No privileged view and no mutation sits behind it.
- **Trust decision.** The file gates a mutation, gates a privileged view, or
  attributes a write, a submit, or a publish to the identity value with
  nothing else offered as proof. This is the bucket that matters for what
  happens when Ghost's session stops backing that value.

Grep commands, files, and line numbers for every claim below are reproducible
against `_recovered-next/lib/theme/` as it stands; nothing here was taken on
the strength of a docblock alone, consistent with the skill's "read the
source that implements it" rule.

## The corrected count: 37, not 38

`lib/theme/` holds 51 files at its top level, re-confirmed by listing
(`_archive/2026-05-02/` still excluded, same as the first pass).

`dialecta-sidebar.jsx` was carried at explicitly lower confidence on
2026-09-19: I had not confirmed whether it re-reads the member UUID directly
or resolves identity some other way. It now has a full read, on both ends.

- Its own source never touches `window` or `.dataset` for viewer identity.
  The only identity-shaped prop it takes is `authorMemberId`
  (`dialecta-sidebar.jsx:1447`), and that is the **article's author**, fed to
  `useArticleAuthor` to fetch a public byline card
  (`GET /api/profile/${authorMemberId}`, line 284). That is content
  metadata, already rendered as the byline elsewhere on the page. It is not
  the viewer.
- `shell.jsx:191-198` is the only place `<DialectaSidebar>` is instantiated,
  and it passes `articleId`, `articleSlug`, `authorMemberId`, `authorName`,
  `primaryTagSlug`, `primaryTagName`, `articleClaims`. No viewer identity of
  any kind crosses that boundary, confirmed by reading the call site, not
  inferred from the signature.
- The one place the file's own comments claim viewer-personalization, the
  "Your Comment" card at lines 11, 679-701, turns out to be dead in this
  snapshot. `YourCommentCard` renders from `pulse.your_malleable`
  (line 1474), `pulse` comes from `usePulse(articleId)` (line 1461), and
  inside `usePulse` the real fetch is commented out
  (`// Real version (when endpoint lands): fetch(...)`, lines 235-239) in
  favor of `generateMockPulse`, whose own seed data sets
  `your_malleable: null` unconditionally (line 216). No viewer id is even
  passed in the commented-out version. There is nothing here to rewire; it
  was never wired.

Nothing about this changes the totals for the other 37. It removes one file
I had flagged as unconfirmed and the confirmation goes the other way. I am
reporting that rather than quietly dropping the number, per the skill's
instruction to say when a second pass moves a finding rather than defend the
first one.

**Revised: 37 of 51 top-level files in `lib/theme/` reference Ghost-derived
member or viewer identity**, across the three categories below. The 14
files that don't (13 from the 2026-09-19 list plus `dialecta-sidebar.jsx`)
are unchanged: pure data transforms, geometry, color math, a tier lookup
table, a search dropdown, and the one page template (`fingerprint-page-mount.
jsx`) confirmed a second time this pass to have zero identity dependency
(its only `ghost_member_id` hit, line 73, keys a lookup over three hardcoded
seed rows, not a viewer read).

## Category 1: DOM/window readers (9 of the 37)

`shell.jsx`, `dialecta-handle-setup.jsx`, `community-page-mount.jsx`,
`dev-admin-mount.jsx`, `dialecta-quotes-mount.jsx`, `editor-page-mount.jsx`,
`home-page-mount.jsx`, `notifications-page-mount.jsx`, `post-page-mount.jsx`.

Two things the first pass's "nine mount files" framing slightly overstated
and understated at once, both worth naming precisely:

- **`dialecta-handle-setup.jsx` is not a `-mount.jsx` file and is not one of
  the eight.** It is rendered by `shell.jsx` (`shell.jsx:219`,
  `<HandleSetupGate />`, zero props) and independently re-reads
  `window.__DIALECTA_MEMBER_UUID__` itself (`dialecta-handle-setup.jsx:
  238`), two lines after `shell.jsx:119` already read the identical global
  for its own use. The value is read from the same global at two separate
  call sites for one page load, not read once and passed down. Every
  independent reader is its own migration site; fixing `shell.jsx` does not
  fix this one.
- **`fingerprint-page-mount.jsx` is not one of the nine**, re-confirmed
  above. Of the eight files actually named `*-mount.jsx`, seven read the
  injection and one does not.

Nine files, not eight, own a literal read of the injection point. That is
the number that has to go to zero, or be funneled through one verified
source, for the DOM-injection attack surface to close.

## Category 2/3: the 28 prop or argument receivers, sorted by what they do

**Passthrough, 4 of 28.** `dialecta-share.jsx` (`trackShare`, line 46, tags
a fire-and-forget analytics POST with `memberUuid || null`; the share button
itself is not gated on it anywhere in the file). `dialecta-profile-identity-
edit.jsx` (`ghostMemberId` addresses three editors' PATCH calls, no local
branch). `dialecta-article-classification.jsx`'s `ArticleDeclaration`
(`memberUuid` destructured at line 307, forwarded once at line 406, never
read in between). `dialecta-notifications-data.js` (four fetch wrappers,
`memberUuid` embedded in every URL/body, no branching in this file; the
branching lives in the three components that call it, counted separately
below).

**Presentation gate, 5 of 28.** `dialecta-community.jsx` (`viewerGhostId ?
'feed' : 'contributors'`, line 160, picks the default tab).
`dialecta-community-feed.jsx` (shows/hides a network badge, line 643, and
tags the feed request, line 547). `dialecta-community-contributors.jsx` and
`dialecta-community-author.jsx` (both hide a Follow-yourself affordance via
an `isOwn`-shaped check, e.g. contributors line 170, author lines 684-687;
verified neither file has any block/report/remove action behind the same
gate). `dialecta-signup-invite.jsx` (hides the signup nag for existing
members, lines 312 and 343). Worst case on all five: the wrong default tab
renders, or a UI affordance shows or hides incorrectly. No privileged data
and no write sits behind any of them.

**Trust decision, 19 of 28.** Gates a mutation, gates a privileged view, or
attributes a write to the value with nothing else offered as proof:

`dialecta-editor.jsx` (three separate `if (!memberUuid) return` gates:
photo upload line 863, publish line 2472, profile fetch line 4450; every
save/publish call sends `member_uuid: memberUuid` as the sole authorship
credential, e.g. lines 888, 2491, 4291, 4343), `dialecta-discourse-layer.jsx`
(line 1010, `if (!viewerMember?.uuid) throw new Error('Not signed in')`,
then sends `member_uuid: viewerMember.uuid` at lines 1018 and 1054 with
nothing else), `dialecta-profile.jsx` (gates the Follow mutation on
`viewerGhostId`, lines 1445-1453), `dialecta-private-draft.jsx` (already the
confirmed client half of the comment-forgery chain from the prior read),
`dialecta-notifications-settings.jsx` / `-page.jsx` / `-bell.jsx` (each
gates fetching or mutating notification state for one `memberUuid` with no
session check visible in any of the three), `dialecta-nomination-panel.jsx`
(line 596 gate, line 611 submit, same shape as discourse-layer),
`dialecta-admin-resetup-maps.jsx` and `dialecta-admin-repolish.jsx` (both:
`if (!isAdmin) return null`, where `isAdmin` comes from an unauthenticated
`GET /api/profile/${memberId}` read of `data?.profile?.is_admin`, no
`Authorization` header, no session, confirmed at
`dialecta-admin-repolish.jsx:87-99`, same shape independently in the sibling
file), `dialecta-profile-settings.jsx`'s `SignaturePanel` (gates and
attributes a signature PATCH to `memberUuid`, lines 407-412),
`dialecta-profile-edit.jsx`'s `EditProfilePanel` (attributes an avatar
upload and a profile PATCH to `ghostMemberId`, lines 393 and 422),
`dialecta-profile-order.jsx` (`classifyOrder` and `commitOrder` are
themselves the mutation, both take `memberUuid` as the acting identity and
nothing else, lines 127-148), `dialecta-opinion-map-placement.jsx` (gates
and attributes an opinion-map commit to `memberUuid`, line 76),
`dialecta-dev-admin.jsx` (full detail already filed; every tab and the
role-grant path itself), `dialecta-quotes-app.jsx` (`isAdmin` and
`canSeeNonLive` gate which submit modal opens and which write controls
render), `dialecta-profile-data.js` (`setFollow` attributes a follow/unfollow
to `viewerMemberId` with no proof, lines 83-97; `updateProfile` PATCHes
whatever id string it is given, lines 66-77), and `dialecta-quotes-data.js`
(detailed in its own section below).

That leaves the arithmetic: 4 passthrough + 5 presentation + 19 trust
decision = 28. Nineteen of the twenty-eight files that "just take a prop"
still decide, on their own, whether a mutation goes through or whose name a
write gets attributed to. Three of those nineteen are the exact three
`builder` named as evidence the coupling is shallow.

## The question builder cannot answer, extended

`dialecta-tier-capabilities.js` and `dialecta-quotes-app.jsx` were the two
already flagged. This pass found more, and found them precisely because
they don't hold a `member*`/`viewer*`-named variable, so a name-grep (mine on
2026-09-19, or any similar one) walks past them:

- **`dialecta-profile-data-pure.js`, `mergeProfileWithGhost`
  (lines 47-85).** Takes `isOwnProfile` (a boolean) and `ghost` (a session
  object), not a member id. Its own comment names a real, fixed bug: "On
  cross-profile views, ghost is either a synthesized stub or the viewer's
  session, neither of which describes the displayed user. Falling back
  there would print the viewer's name onto someone else's profile. The fix
  the other thread flagged." That is a trust decision (whose data the page
  is allowed to display) that already leaked identity across profiles once
  and was patched by adding the `isOwnProfile` gate, not by verifying
  anything server-side. This file was already inside my 38/37, correctly,
  but the first pass filed it as a plain data transform and never named this.
- **`dialecta-quotes-data.js`, `useAdminStatus`.** Its own comment states
  the method: "Cheapest probe: call the admins-list endpoint, which itself
  requires admin auth. 200 = admin, 403 = member but not admin, 404 = no
  profile yet" (lines 116-119). This is a second, independently-invented
  version of dev-admin's "read a client fetch and trust the result" pattern,
  implemented as an HTTP-status probe instead of a JSON field read, and it
  feeds a second, quotes-scoped role-grant path: `grantAdmin(memberId,
  targetGhostMemberId)` (line 197) POSTs to `/api/quotes/admins?member_id=
  <memberId>` with `{ ghost_member_id: targetGhostMemberId }` and nothing
  else. Same shape as `/api/admin/team`, different endpoint, independently
  arrived at. I have not read `/api/quotes/admins`'s server side; it is
  `unread`, same caveat as `/api/admin/team.js`.
- **`dialecta-admin-repolish.jsx` and `dialecta-admin-resetup-maps.jsx`**
  are a third and fourth instance of the identical shape: fetch a profile
  client-side, read a boolean off the JSON, gate a privileged button on it,
  send the mutation with the same unverified id and no session proof.

Counting `dialecta-tier-capabilities.js`, this is at least **six**
independent places in this tree that reinvent "ask the browser whether it's
allowed, then believe the answer": `dialecta-dev-admin.jsx`,
`dialecta-quotes-app.jsx` / `dialecta-quotes-data.js`, `dialecta-admin-
repolish.jsx`, `dialecta-admin-resetup-maps.jsx`, and `dialecta-tier-
capabilities.js` on the monetization side. None of these five share code.
Each was written separately and arrived at the same mistake, which matters
for the fix: patching one call site does not patch the pattern.

## What has to become true after Ghost goes, per category

**Category 1 (9 files).** The forgeable part is the injection point itself:
any string in `window.__DIALECTA_MEMBER_UUID__` or a `data-member-*`
attribute is trusted verbatim. Swapping Ghost for Supabase only closes this
if the replacement value is something the browser cannot mint on its own, a
verified session read server-side, not a client global set at render time.
Because there are nine independent read sites and at least two of them
(`shell.jsx`, `dialecta-handle-setup.jsx`) already read the *same* global
redundantly rather than sharing one verified read, the safe version is one
hook or one context that performs the verified read once, with all nine
sites consuming it, not nine separate migrations that can individually be
missed.

**Category 2/3, trust-decision bucket (19 files).** Fixing category 1 alone
does not fix these. A component that gates a mutation on `if (!memberUuid)
return` and then sends that same `memberUuid` as the mutation's only
credential is not relying on the DOM read for security, it is relying on the
*server* never checking whether the value it was handed matches who is
actually connected. That is already confirmed false for `api/comment.js`.
For these 19 files to be safe on Supabase sessions, the server routes they
call, at minimum `/api/admin/team`, `/api/quotes/admins`, `/api/profile/
[id]` (POST and PATCH), `/api/article/publish`, `/api/opinion-map/*`, and
the notifications endpoints, have to themselves verify a session credential
and stop accepting a bare id parameter as identity. Rewriting the client
prop source without that server change moves the forgery from "type into
the console" to "call the API directly," which is not a fix.

**Presentation-gate bucket (5 files).** Lowest priority. A wrong value here
produces a cosmetic error (wrong default tab, a Follow button that shouldn't
show), not a privileged action or a data leak. These can adopt whatever the
new identity source is on the team's normal schedule, not the security
schedule.

## Where this does, and doesn't, disagree with builder

**Not a factual disagreement.** I independently verified all three of
builder's named claims and they hold: `dialecta-editor.jsx` takes
`memberUuid` as a prop; `dialecta-discourse-layer.jsx` takes `viewerMember`
as a prop with no internal DOM read (the file's only `window.__DIALECTA_*`
reads, lines 167, 1011, 1047, are the API base URL, not identity);
`dialecta-profile.jsx` takes `viewerGhostId` as a prop. None of that is in
question.

**The disagreement is about what those facts license.** Builder's estimate
reasons from "takes identity as a prop" to "rewiring is concentrated in
shell.jsx plus eight mount files," and treats the other files as a source
swap. My read of the same three files, and of sixteen more like them, finds
that being a prop receiver and being a trust decider are independent
properties: a file can score "cheap" on builder's axis (no DOM read to
migrate) and "expensive" on mine (an internal gate, plus a server route that
has to change) at the same time. All three of builder's named files do
exactly that: each one both takes identity as a prop *and* uses it to gate
a save, a publish, or a follow with no other proof. The two counts are not
in tension because they are not measuring the same thing: builder's answers
"how many files' source has to change to swap where the identity value
comes from," mine answers "how many decisions elsewhere in this tree, and
on the server, have to change because of what that value is used for." A
low score on the first doesn't predict a low score on the second, and 19 of
28 prop receivers here are proof of that.

**What would settle it.** Read the server side of the routes the 19
trust-decision files call. If `/api/admin/team`, `/api/quotes/admins`,
`/api/profile/[id]`, `/api/article/publish`, `/api/opinion-map/*`, and the
notifications endpoints already verify a session independently of the id
parameter (defense in depth, client gate redundant), builder's framing is
closer to right and the rewire really is mostly a source swap. If they trust
the parameter the way `api/comment.js` is already confirmed to, each is a
separate required change and the estimate's floor should move. I have not
read those routes; they are `unread`, the same caveat as in the 2026-09-19
note. That is the next action this disagreement actually turns on, not
another pass over the client.

**Two small, checkable items, named rather than smoothed over.** Builder's
note describes "shell.jsx and eight small `*-mount.jsx` files" reading the
injection. Only seven of the eight files named `*-mount.jsx` do; the eighth,
`fingerprint-page-mount.jsx`, is confirmed clean twice now, across both
passes. The true ninth reader, `dialecta-handle-setup.jsx`, isn't
`-mount`-named at all, so it's not naturally counted by that phrasing even
though the total either way is nine. Separately, I could not reproduce
builder's "57 Ghost hits" in `dialecta-dev-admin.jsx` by any grep I tried:
case-insensitive `ghost` gives 24, case-insensitive `member` gives 151,
lines matching either give 115, and `ghost_member_id` / `ghostMemberId`
together give 10. None land on 57. This may be a different tool or a
different pattern than the ones I tried; I'm naming the gap rather than
guessing at builder's method or adjusting either number to close it.

## Answer to "do you still stand behind 38 of 51"

No. **37 of 51.** `dialecta-sidebar.jsx` does not belong in the count: a
full read of both its own source and its one call site shows no viewer
identity crosses into it, ever, in this snapshot. Everything else in the
original 38 is confirmed, and this pass adds a category the first one
didn't have: of the 28 files that receive identity as a prop rather than
reading it off the DOM, 19 use it to gate a mutation, gate a privileged
view, or attribute a write with no other proof offered. That number, not
the 37, is the one that should anchor how much server-side work rides on
top of whatever the client-side identity swap costs.
