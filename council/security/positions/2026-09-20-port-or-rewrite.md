# Port or rewrite: what the Ghost coupling costs

**Seat:** security. **Written:** 2026-09-20, for the port-or-rewrite debate. **Status:** advisory.
Nothing here is decided; Dan decides. Extends `2026-09-20-ghost-coupling-count.md` and
`2026-09-20-recovered-source-read.md` rather than restating them, and draws on two more positions
this seat already filed today, `2026-09-20-path-to-launch.md` and
`2026-09-20-permanent-capability-fix.md`, which did some of this exact schema work before this
debate opened.

## Brief

Builder's 55 call sites are not 55 units of cost. They are roughly a dozen missing authorization
surfaces wearing 55 variable names, most of them unbuilt: every table the 19 trust-decision files
write to carries zero insert or update policy today except comments, landed this morning. The
single strongest piece of evidence: `profiles.is_admin`, `is_quote_admin` and `subscription_tier`
are still granted SELECT to `anon` and `authenticated`, confirmed by reading
`20260920192954_close_ghost_member_id_as_public_credential.sql` directly, so a mechanical port of
`dialecta-dev-admin.jsx`'s `isAdmin` gate compiles, returns a true answer, and reproduces the exact
defect it is today.

## What apps/web already paid for

Read directly: `src/lib/supabase/server.ts`, `client.ts`, `middleware.ts`, `src/middleware.ts`,
`src/app/auth/callback/route.ts`, `src/app/api/comment/route.ts`, and the three landed migrations
behind it (`20260920000000_baseline_live_schema.sql`, `20260920192954_...`, `20260920200500_
comment_write_identity.sql`).

Three things are solved, not merely planned, and every one of the 19 trust-decision files
inherits them for free:

- **A verified session, once.** `lib/supabase/middleware.ts` calls `auth.getClaims()`, which checks
  the JWT signature against a cached JWKS, not `getSession()`, which reads the cookie's own claim
  unverified. Its own comment names why in the same words this seat used for `api/comment.js`: the
  unverified read is "the same class of trust-the-client mistake." Three clients, one job each,
  matching `team/builder/knowledge/2026-supabase-ssr-nextjs-auth.md`'s "three Supabase clients, not
  one": `server.ts` for Server Components and Route Handlers, `client.ts` for the browser under RLS,
  `middleware.ts` for the refresh that keeps both current.
- **A proven end-to-end template.** `api/comment/route.ts` plus `20260920200500_comment_write_
  identity.sql` is the one place this pattern has shipped: a `SECURITY DEFINER` function
  (`current_ghost_member_id()`, `get_own_profile_for_comment()`) resolves `auth.uid()` to the
  caller's own row inside the database, an RLS policy pins the insert to that resolved id
  (`with check (member_id = public.current_ghost_member_id())`), and the route handler never reads
  identity from the request body at all. This is not a plan: the code runs today, live, and it is
  the template every one of the 19 files' server side needs to copy.
- **A drafted, reviewed, unlanded second template.** `2026-09-20-permanent-capability-fix.md`
  (this seat, earlier today) is a complete migration for the admin family:
  `current_profile_id()`, `has_capability()`, `admin_list_team()`, `admin_grant_role()`,
  `admin_revoke_role()`, each `SECURITY DEFINER`, each resolving the actor from `auth.uid()` with no
  id parameter to forge, each writing `admin_audit_log` in the same transaction as the grant. It
  replaces `dialecta-dev-admin.jsx`'s `GrantRoleModal` exactly. It has not been applied; the file
  says so on its own first line.

Against that: the baseline migration's own header states, unprompted, that it "adds NO insert,
update, or delete policy anywhere, on purpose," and names the reason: pairing a write policy with
the still-open column grant on `profiles` would make self-tier-escalation live-exploitable. Reading
table by table confirms what that sentence costs the 19 files. `admin_roles`, `admin_capabilities`,
`admin_role_capabilities`, `admin_audit_log`, `profile_admin_roles`, `profile_admin_capability_
grants`, `notifications`, `notification_prefs` are all `using (false)` for every client-facing role,
confirmed by the explicit policies migration `20260502161725` adds and this file carries forward.
`opinion_map_positions` and `sparring_partners` are closed by default, unmeasured but stated as the
safe choice. `follows` and `quotes` are readable (`follows`: all rows; `quotes`: `status =
'published'` only) but carry no write policy of any kind. No quotes-admin table exists anywhere
in this schema, and `2026-09-20-permanent-capability-fix.md` already confirmed `api/quotes/` is not
present anywhere in the recovered API either. For that one family, the server side isn't unbuilt.
It doesn't exist to be read.

## The real unit of cost, settled against builder

Builder's method sorts by where a line of code lives: nine files read the DOM, fifty-five call
sites embed an id, both true and both mine to build from too. The gap is that "the call site's
identity argument gets re-sourced" treats the receiving end as a constant, and for most of the
trust-decision files the receiving end is either a table with no write policy, a table closed to
SELECT as well, or, for quotes, a table that flatly doesn't exist. Re-sourcing a variable that feeds
a wall is not a smaller job than building the door; it's a job that cannot finish without the door
existing first.

One correction to my own count while building this table: enumerating the 19 trust-decision files
named in `2026-09-20-ghost-coupling-count.md` by hand lists eighteen, not nineteen. Read as a gap in
that count rather than in this one; I have not re-read the original file-by-file citations closely
enough today to find the nineteenth, so the table below uses the eighteen I can name.

Count the doors instead of the call sites. Distinct authorization surfaces behind those eighteen
trust-decision files, by what already backs them:

| Surface | Files it backs | State today |
| --- | --- | --- |
| Comment write | `dialecta-discourse-layer.jsx`, `dialecta-private-draft.jsx` | **Shipped.** RLS + RPC + route handler, live |
| Article submit / publish / image upload | `dialecta-editor.jsx` | `articles` is public-read only, zero write policy, no RPC drafted |
| Admin capability grant/revoke/list | `dialecta-dev-admin.jsx`, `dialecta-admin-repolish.jsx`, `dialecta-admin-resetup-maps.jsx` | **Drafted, reviewed, not landed.** `2026-09-20-permanent-capability-fix.md` |
| Follow / unfollow | `dialecta-profile-data.js`, `dialecta-profile.jsx` | Table readable, zero write policy, no RPC drafted |
| Own-profile edit (avatar, signature, order) | `dialecta-profile-edit.jsx`, `dialecta-profile-settings.jsx`, `dialecta-profile-order.jsx` | Table readable (over-broadly, see below), zero write policy, no RPC drafted |
| Opinion-map placement | `dialecta-opinion-map-placement.jsx` | Table RLS state unmeasured, left closed, no write policy, no RPC drafted |
| Nomination / vote | `dialecta-nomination-panel.jsx` | Table closed to SELECT, zero write policy, no RPC drafted |
| Notifications read/write | `dialecta-notifications-bell.jsx`, `-page.jsx`, `-settings.jsx` | Both tables closed to SELECT, zero write policy, no RPC drafted |
| Quotes admin (status change, grant/revoke) | `dialecta-quotes-app.jsx`, `dialecta-quotes-data.js` | **No table.** No RLS. No RPC. Not present in the recovered API either |

Nine surfaces behind those eighteen files: one shipped, one drafted, seven with nothing written at
any layer. Two more files ride on doors already in this table without being trust-decision files
themselves: `dialecta-profile-identity-edit.jsx` (passthrough, filed in `2026-09-20-ghost-coupling-
count.md`) sends its own PATCH through the own-profile-edit door, and `dialecta-notifications-
data.js` (also passthrough) sends its five call sites through the notifications door. Neither adds
a tenth door; both confirm the count is doors, not files. `dialecta-tier-capabilities.js` is a
different kind of surface entirely, ruled on below, not in this table: not identity-coupled at all
(agnostic per both counts), and its defect is a spend control nobody calls, not a trust decision.

This is the cost, not fifty-five edits and not a count of files. A surface with ten call sites
behind it (`dialecta-quotes-data.js`) and a surface with one (`dialecta-opinion-map-placement.jsx`)
cost the same migration once you count doors instead of hinges. Builder's own note already
half-reaches this: "fixing the data file fixes every consumer" for `quotes-data.js` and
`notifications-data.js`. The extension is that fixing the data file requires a door that isn't
built, drafted for one surface out of nine, and that gates the port, it doesn't follow it.

**In exposure, not just work.** A mechanical port, re-source the same variable from a new prop or
hook, preserves every one of these as a live defect on the day it ships, because eight of the nine
surfaces still trust whatever id they're handed once that id stops being a DOM read. Only a port
that deletes the id parameter and lets `auth.uid()` (or, for admin, `has_capability()`) answer the
question closes it. That is the whole of what `2026-09-20-permanent-capability-fix.md` demonstrates
for one surface and what the other seven still need built.

## Category 1, the 9 DOM readers: real, and smaller than it looks

`shell.jsx`, `home-page-mount.jsx`, `post-page-mount.jsx`, `editor-page-mount.jsx`,
`notifications-page-mount.jsx`, `dev-admin-mount.jsx`, `community-page-mount.jsx`,
`dialecta-quotes-mount.jsx`, `dialecta-handle-setup.jsx`. What's paid: the hard part of "know who is
asking," verifying a JWT, refreshing an expiring session, keeping cookies and headers correct across
a CDN, is done, in `middleware.ts`. What's not paid: nothing in `apps/web` yet exposes that verified
identity to a component the way `window.__DIALECTA_MEMBER_UUID__` did, because `apps/web` has no
client islands built yet beyond the login form. One hook or one server-read-and-pass-down pattern,
written once, replaces all nine reads. That part of builder's estimate holds.

What complicates it is not the read, it's the architecture question underneath: `apps/web/CLAUDE.md`
authorizes exactly six client islands. Three of these nine mounts feed a file on that list (editor,
discourse layer via `shell.jsx`, opinion maps). The rest, `dev-admin-mount.jsx`,
`dialecta-quotes-mount.jsx`, `community-page-mount.jsx`, `notifications-page-mount.jsx`, feed files
that are not. See "Server components by default," below, for what that changes.

## The 19 trust-decision files: two verdicts, almost always

Every file in this bucket ports its JSX, its layout, its papergrain and wood, close to as-is. None
of them needs its authorization logic ported at all; that logic needs deleting, not adapting, because
what it decided client-side (am I allowed) is a question `auth.uid()` and a policy now answer instead.
Where a file's client-side check happened to be right today, it is right by accident: the value it
read was real, `profiles.is_admin` is a true column, but reading it from the browser and believing it
is the same shape whether the column lives on Ghost or on Supabase. That is why this bucket splits
into two verdicts on one file almost everywhere it appears, not a special case.

## The seven named files, ruled

**`_recovered-next/app/api/debug/profile/[handle]/route.js`. Dropped.** Not adapted as an admin
tool, not rewritten with auth bolted on. Its own docblock says "Delete this file once Path C is
fully stable" and it shipped anyway. It returns the live Supabase URL, the service key's length and
a 12-character prefix, an exact row count, and any profile's `ghost_member_id` by handle, to an
unauthenticated GET (lines 18-24, 40-64). Nothing in production legitimately needs this shape;
a debugging need is served by Supabase Studio or a local script against the service
role, never a public route. This is the one file on the list I'd call an easy veto rather than a
judgment call.

**`dialecta-dev-admin.jsx`. Two verdicts.** UI adapts: the tab shell, the member directory table,
the modal chrome, all 2,367 lines of layout and interaction survive close to as-is. The trust model
is rewritten and gated. Every read (`caps`, `canManage`, `canRepolish`) and the `GrantRoleModal`'s
role-grant flow currently trust an unauthenticated `GET /api/profile/<id>` and a bare `POST
/api/admin/team?member_id=<id>`. Against today's schema those calls do not even work,
`profile_admin_roles` and `admin_roles` are closed to every client-facing role, so a literal port
fails closed rather than open. That is not a fix; it's an accident of timing. The real fix is
landing `2026-09-20-permanent-capability-fix.md`'s migration and rewriting this file's fetches to
call `current_capabilities()`, `admin_list_team()`, `admin_grant_role()` directly, none of which
take an id for the caller because, per that migration's own comment on `current_capabilities()`,
"the caller is the argument." **This is a veto on the current gate as a control**: `if (!isAdmin)
return null` fed by a client fetch is exactly this charter's "a control that is only a convention,"
and it should stay in the ported file only as a UX nicety (hide the tab faster than a round trip),
never as the thing that decided anything.

**`dialecta-admin-repolish.jsx`. Same two verdicts.** UI (button, modal) adapts. The gate
(`data?.profile?.is_admin`, confirmed at lines 93-94 on a fresh read, and `if (!isAdmin) return
null`, line 100) and the repolish POST's `member_uuid: memberId` (line 172) are rewritten against
the same admin migration. One open item, marked `unread`: whether `admin_capabilities` has a row for
repolish specifically. The migration's function surface is generic; the seed data for this one
capability id is not something I checked.

**`dialecta-admin-resetup-maps.jsx`. Same two verdicts, plus a second surface.** The `isAdmin` gate
(lines 96-97, 103) is the identical shape and the identical fix. Its save POST also carries
`member_uuid: memberId` (line 292) to `/api/article/admin-resetup-maps`, and its analysis step calls
`/api/article/classify-stream` (line 208), the exact route `2026-09-20-permanent-capability-fix.md`
§6 already confirmed ignores tier caps sent from the client and never calls the server-side
`getTierCapabilities()` that exists to enforce them. Porting this file's classify-stream call without
that fix live means an admin surface becomes a second, unmetered path to the same uncapped Anthropic
spend `dialecta-tier-capabilities.js` was supposed to bound.

**`dialecta-quotes-data.js`. Three-way split, and the admin half is dropped, not rewritten.** The
plain data helpers, formatting a quote, listing published quotes, adapt once a real `GET
/api/quotes`-equivalent read exists (today `quotes` is SELECT-only, published rows only, no
handler in `apps/web` reads it at all). `useAdminStatus` (line 104, the HTTP-status probe
described at lines 117-120) and `grantAdmin`/`revokeAdmin` (lines 197-207) are not just unproven,
they have no server or schema to be proven against: no `quotes`-scoped admin table exists in the
baseline schema, and `2026-09-20-permanent-capability-fix.md` already confirmed no `api/quotes/`
handler exists anywhere in the recovered estate either. Nothing here adapts and nothing rewires;
the design itself hasn't happened yet. I'd drop the admin half of this file from the port
outright and treat quotes moderation as a fresh, small schema decision (most likely: fold it into
the same `admin_capabilities`/`has_capability()` system already drafted for articles, one new
capability id, not a parallel system) rather than resurrecting a second bespoke `member_id`-probing
mechanism nobody else in the tree uses.

**`dialecta-tier-capabilities.js`. Two verdicts.** The constant tables themselves (`FREE`/`PRO`,
lines 21-46, two candidate caps and two copy strings) port as-is; they're numbers and a sentence,
and Dan's "port as much as possible" costs nothing to honor here. What doesn't port is using this
file as the enforcement point. Per this seat's own later, more precise read
(`2026-09-20-permanent-capability-fix.md` §6), the defect isn't even that the client can be lied to;
it's that a correct server-side mirror, `getTierCapabilities()`, already exists in the recovered API
and is never called, `classify-stream.js` takes `max_candidates` straight off the request body.
`apps/web` has no equivalent route yet (`src/lib/classify.ts` only classifies comments), so there is
nothing to retrofit; whoever builds the opinion-map or polish generation route should compute the
cap from the caller's own `profiles.subscription_tier`, read server-side, and never accept it as a
parameter, using the same DB-backed rate-check shape `api/comment/route.ts` already proves out
(`RATE_LIMIT_WINDOW_MINUTES`/`RATE_LIMIT_MAX_COMMENTS`) rather than inventing a second pattern.

**`dialecta-profile-data.js`. Two verdicts.** `fetchProfile` (line ~47) adapts once profile reads
route through Supabase the way `articles.ts` already does; it inherits, unchanged, the standing gap
this seat named before today's debate opened, `is_admin`/`is_quote_admin`/`subscription_tier` are
still public columns, so an adapted `fetchProfile` will keep handing every caller those three fields
about every other member until that grant is narrowed. That narrowing is not new scope this debate
invents; it's already the top row of this seat's standing positions table. `updateProfile` (line 66)
and `setFollow` (line 83, `viewer_member_id: viewerGhostId` and nothing else) are rewritten: neither
`profiles` nor `follows` carries a write policy today, so both need one scoped to `auth.uid()`
before either function has anywhere to write to, mechanically identical to the comment migration's
shape but for a different table.

## Two files the record filed as safe that aren't quite

`dialecta-community-contributors.jsx` and `dialecta-community-author.jsx` were filed in
`2026-09-20-ghost-coupling-count.md` under "presentation gate," for the `isOwn` check that hides a
Follow-yourself affordance, which is correctly low-stakes. Re-reading both files whole for this
debate finds each also defines its own inline `FollowButton` (contributors, lines 109-136; author,
lines ~104-126) with its own `fetch` carrying `viewer_member_id: viewerGhostId` and nothing else,
independent of `dialecta-profile-data.js`'s `setFollow`, which does the identical thing for
`dialecta-profile.jsx`. That's three separate implementations of one unverified write, not one. The
`isOwn` branch in both files is presentation and adapts as filed. The `FollowButton` each file
defines is a trust decision the first pass didn't separately flag, and should be rewritten to call
whatever single follow path the fix above lands, not ported three times as three copies of the same
gap.

## Server components by default: which verdicts it changes

`apps/web/CLAUDE.md` names six client islands: the comment composer, the classification card, votes,
the Fingerprint, the opinion maps, the editor. Everything else is a server component unless a spec
says otherwise. That rule does more than add a design-review step. For any trust-decision file that
lands inside one of the six, a Server Component reading `createClient()` server-side, or a Server
Action attached to a plain button, needs no identity parameter at all: `auth.uid()` comes from the
cookie the request already carries, so the entire DOM-read-then-pass-as-prop chain this whole debate
is about disappears rather than getting rewired. `dialecta-discourse-layer.jsx` and
`dialecta-private-draft.jsx` (composer) already prove this; `api/comment/route.ts` never receives an
id. `dialecta-opinion-map-placement.jsx` (opinion maps) and `dialecta-nomination-panel.jsx`, if
"votes" means the tier-nomination surface, sit in the same authorized position and get the same
break.

For files outside the six, that break doesn't apply, and the port carries a decision the six-island
list doesn't answer: `dialecta-dev-admin.jsx`, `dialecta-admin-repolish.jsx`,
`dialecta-admin-resetup-maps.jsx`, `dialecta-quotes-app.jsx` plus `-quotes-data.js`,
`dialecta-notifications-bell.jsx`/`-page.jsx`/`-settings.jsx` plus `-notifications-data.js`,
`dialecta-profile-edit.jsx`/`-order.jsx`/`-settings.jsx`/`-identity-edit.jsx`. Each of these either
becomes a seventh-or-later client island, which is a real request to whoever owns that list, not a
file-level call this position can make alone, or gets restructured as a server component with its
mutations moved to Server Actions, which is a rewrite of the component boundary itself even where
every line of JSX inside it survives untouched. That second path is very likely cheaper in the end,
since it deletes the identity-plumbing problem rather than solving it, but "cheaper" and "a port"
are different claims, and I'd name it to `builder` and `decider` as its own line item rather than
folding it into either the DOM-read or the call-site count.

## What I did not read

`admin_capabilities`'s actual seed rows, whether a repolish or resetup-maps capability id already
exists there: `unread`. `dialecta-notifications-bell.jsx`, `-page.jsx`, `-settings.jsx`, and
`dialecta-nomination-panel.jsx` at the line level for this pass: not reread; citations above for
those four carry forward from `2026-09-20-ghost-coupling-count.md` rather than a fresh read today.
Whether `opinion_map_positions.reader_id` resolves to `profiles.id` or `profiles.ghost_member_id`:
unresolved in the schema itself (`LIVE UNVERIFIED`), and it decides what the opinion-map placement
policy's `auth.uid()` predicate joins against, so it is the next read ahead of writing that
one migration.

## Rebuttal

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

## Voice check

Run from `C:\Dialecta`: `python scripts/voice_check.py --strict council/security/positions/2026-09-20-port-or-rewrite.md`.
