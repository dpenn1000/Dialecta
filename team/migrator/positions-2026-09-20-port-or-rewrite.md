# migrator position: which recovered surfaces have a live table under them

## Brief

Every port is gated by the live table under it, checked file by file, not by category. `articles`
has zero content columns live (no slug, title, body_json, body_html), confirmed in
`supabase/migrations/20260920000000_baseline_live_schema.sql`'s own inline comment, so the entire
article-content family (editor, article server, the public article page) is blocked on a migration
that has not been written, regardless of any front-end work. Every recovered write surface except
comments is additionally blocked at the RLS layer: all 30 public tables grant full CRUD to `anon`
and `authenticated` (measured, `exchange/open/2026-09-20-security-03`), but only `comments` has a
matching row policy, landed this session.

## Method

Two independent gates, and a file can clear one and fail the other. **The column gate**: does the
table the file reads or writes have the column, at all, live. **The policy gate**: given the table
grants full CRUD to `anon`/`authenticated` at the table level (confirmed live, all 30 tables, no
exceptions, `exchange/open/2026-09-20-security-03-handoff-grants-measured-b2-holds.md`), does a row
policy exist that actually lets the operation through. RLS defaults to deny per command per role
with zero matching policy; the open grant does nothing on its own. I read
`supabase/migrations/20260920000000_baseline_live_schema.sql` (the hand-authored adoption of live,
cross-checked against real applied SQL in `team/migrator/knowledge/2026-migration-fetch-verification.md`)
and the four migrations that landed after it today, table by table, then matched each of the 51
recovered components and the App Router tree against what they read or write, using `builder`'s and
`security`'s already-filed call-site inventories rather than re-deriving them. Where I hadn't read a
route or a file myself, I say `unread`.

**One evidentiary distinction to hold onto throughout.** The baseline and the 22 migrations under it
are confirmed against real applied SQL, queried directly from `supabase_migrations.schema_migrations`
(`2026-migration-fetch-verification.md`). The four migrations that landed after the baseline today
rest on the files' own committed headers, not a query I ran myself this session: two
(`20260920192954`, `20260920193044`) say plainly they were applied live by the convener first and
recovered into a file afterward; the other two (`20260920200500`, `20260920214500`) carry no such
claim but `20260920200500` narrates an inline "CORRECTED ON APPLY" fix, which only makes sense against
a real Postgres round-trip. I'm treating all four as live, consistent with how they read and with
`docs/plans/ROADMAP.md`'s own Phase 0 "done today" list, but I did not independently re-run
`migration list --linked` or query the history table to confirm the last two the way the first 22 are
confirmed. That would be the next thing to run before anyone treats this document's RLS claims as
equal-confidence across all four.

## The article content question

**Blocks the whole family. Confirmed, not inferred.** `supabase/migrations/20260920000000_baseline_live_schema.sql`
lines 424 to 446 create `articles` with `ghost_post_id text not null unique, author_member_id,
original_html, status, ai_analysis, ai_suggested_tier, declared_tier, final_tier, declaration,
stage_2_5_choice, author_note, wait_until, polish_level, polish_options, polish_change_log,
created_at, updated_at`, and the file's own trailing comment states it plainly: "No slug, title,
body_json, body_html, published_at, key_claims, or map_config." `apps/web/src/lib/articles.ts`
selects `id, slug, title, excerpt, topic, published_at, author:profiles!articles_author_id_fkey(display_name)`
plus `body_html, declared_claims` on the article route. None of `slug`, `title`, `excerpt`, `topic`,
`published_at`, `body_html`, `declared_claims` exist on the live table, and no
`articles_author_id_fkey` is declared (live has no foreign key from `articles` to `profiles` at
all). Every one of those columns is ADR-003's shape, not live's. This is `docs/SITE-INVENTORY.md`'s
finding ("`apps/web`'s `lib/articles.ts` queries columns that do not exist") confirmed a second way,
against the actual migration DDL rather than the inventory's own prose.

**Where content lives after Ghost is answered by ADR-001 and ADR-003 in principle and by nothing in
practice yet.** ADR-001 leaves Ghost; ADR-003 commits to TipTap writing `body_json` and a rendered
`body_html` cache. Both are real decisions. Neither has a migration. Backlog P0-5 ("Native
articles: migration 0002... front page and `/articles/[slug]` render from `articles`") is the item
that was supposed to carry this and it is still `Todo` in `docs/plans/backlog.md`, and nothing in
`supabase/migrations/` past the baseline touches `articles` at all (confirmed: the four migrations
that landed after the baseline touch `profiles`, `comments`, and three new functions, none of them
`articles`). `original_html` on the live table is the closest thing to content today, and it holds
Ghost's own HTML copy for the classification pipeline to read, not a slug-addressable, TipTap-authored
document.

**What this blocks, named.** `dialecta-editor.jsx` (4,727 lines): its publish and autosave paths
target `article/submit` and a profile-scoped fetch, and per ADR-003 the destination columns
(`body_json`, `body_html`, `declared_claims`, `suggested_axes`, `amend_until`) do not exist on the
live table it would need to write to. `dialecta-article-classification.jsx` (686 lines): threads
`memberUuid` into placement, but the article it classifies has no `slug` to route on if the public
page can't resolve one. `apps/web/src/lib/articles.ts` and both routes that call it,
`/articles/[slug]` and its `opengraph-image` (per `apps/web/CLAUDE.md`'s own route table): dead code
against live right now, not a port question at all until P0-5-equivalent DDL lands. `home-page-mount.jsx`'s
live-feed fetch and `dialecta-sidebar.jsx`'s related-articles card: degrade, they don't hard-fail,
but render nothing real without addressable article content.

**What this does not block.** Nothing about the identity or discourse tables depends on `articles`
having content columns. `comments` carries its own `article_id` (unconstrained, baseline line 504)
plus its own denormalized `article_slug` and `article_title` text copies (lines 505 to 506), not a
join through `articles`, so the discourse layer's read and write paths are independent of this gap. The four `opengraph-image.js` OG routes for
contributor, quote, and moment (per `circulation`'s read) carry no dependency on `articles` content
either. Porting those does not wait on this migration; porting the editor and the public article
page does.

**Cost, stated once.** One migration, additive only (new nullable columns plus a `slug` uniqueness
constraint), on a table with 5 live rows. Cheap relative to almost everything else in this document,
and the one gap where zero recovered or live code currently satisfies the destination shape, which
is why the task frames it as the thing to settle first: no partial credit to claim here the way
there is on `comments` or `opinion_map_positions`.

## `stage` against `delta_of`

Not re-deriving the product question, which I already routed to this council in the schema-squash
session (`2026-09-19-002`'s third appendix, "whether the mechanic should grow to support more than
one revision is a product question about what the Delta mechanic is for"). Adding one thing that
appendix didn't have: a recovered file that already assumes the answer.

**The schema cost of each option, stated plainly.** `stage` costs nothing further. Live's
`opinion_map_positions` already carries it: `supabase/migrations/20260920000000_baseline_live_schema.sql`
line 484, `stage text not null` with the baseline's own note that this "IS a true value on live...
matching the spec and NOT the archived September migration's `delta_of` substitute." Only the exact
check-constraint text (`pre_read`/`post_read`, per the spec) is unconfirmed; the column itself is
not in question. `delta_of` costs a new column, a migration, and a decision about what a chain of
more-than-two placements means for the "minimum of 20 completed pairs" aggregate
(`docs/Dialecta_Delta_Mechanic_Spec.md` line 108), which counts pairs, not a revision history.

**A recovered file already picked a side, and it picked live's.** `_recovered-next/lib/theme/dialecta-opinion-map-placement.jsx`'s
`usePlacement({ postId, memberUuid, mapIndex, stage, mapType })` (line 38) threads `stage` straight
into the `/api/opinion-map/place` POST body (fetch at line 71, `stage,` at line 78).
`ArticlePreReadMap` (line 508) and its
post-read counterpart both call it with a literal `stage` value. Nothing in this file, or anywhere
else I found in `lib/theme/`, references `delta_of`, a revision chain, or a "before/after" self-join.
The May 2026 front end and the live database agree with each other and both disagree with the
archived, superseded September repo migration, which is the only place `delta_of` ever existed. That
makes backlog D-3's own wording ("Delta mechanic: before/after placement, `delta_of`",
`docs/plans/backlog.md`) a description of the abandoned model, still carrying no `-D` marker to flag
it as open, exactly as I found in the schema-squash session.

**What follows for the port.** If Dan confirms the spec's one-pair model as written, `dialecta-opinion-map-placement.jsx`'s
data shape needs no schema change at all, only the RLS and reader-identity work below. If Dan wants
revision chains, that is new product scope with no recovered implementation to port against it;
whatever ships there is written new, not adapted from this file. Either way this is Dan's call, not
mine, stated here only so it's made with the recovered code's own facts in hand rather than in the
abstract.

## Per-surface schema dependencies

Read as: table exists live (yes/no), read policy that would actually serve the recovered UI's
traffic (yes/no/partial), write policy for what the recovered UI submits (yes/no), verdict.

### Discourse layer and private draft

`dialecta-discourse-layer.jsx` (1,251 lines), `dialecta-private-draft.jsx` (1,796 lines).

`comments` exists live with the shape the repo's archived migration was missing (`article_slug`,
`article_title`, `member_email`, `member_name` all required, per `2026-live-schema-diff.md`, now
carried in the baseline). Today's `20260920200500_comment_write_identity.sql` adds exactly two
policies: `"members insert their own comments"` (INSERT, `to authenticated`, `member_id =
current_ghost_member_id() and status = 'pending_review'`) and `"members select their own comments"`
(SELECT, `to authenticated`, `member_id = current_ghost_member_id()`). **Both are owner-scoped. Read
this precisely: there is still no policy anywhere that lets a visitor, or an authenticated member who
isn't the author, read anyone else's comment.** `20260920193044_publish_the_three_existing_comments.sql`
flipped three rows to `status = 'published'` this session; under the current policy set those three
rows remain invisible to every caller except their own author, because no policy checks `status`
at all, only `member_id = current_ghost_member_id()`. `ROADMAP.md`'s Phase 0 line, "The three
comments are published. Dialecta has visible discourse for the first time," is true of the data and
not yet true of what the database will hand back to a reader. `dialecta-discourse-layer.jsx`'s
primary read path (the public thread under an article) is blocked on a policy that does not exist
yet: something in the shape of `using (status in ('published','suppressed') or member_id =
current_ghost_member_id())`, which is what the repo's own archived foundation migration intended and
what backlog A-5 names as the gap. **Its comment-post path is unblocked today**, pending only the
fetch target moving off `/api/comment` (security's confirmed-forgeable endpoint) onto whatever
session-verified route `apps/web` builds against these two new policies.

`classifications` stays closed to anon and authenticated, service-role only, matching its role as a
pipeline write (`supabase/CLAUDE.md`: "Pipeline writes use the service role from server code only").
That's correct as designed, not a gap; nothing in the discourse layer should read it directly.

`dialecta-nomination-panel.jsx` (658 lines) POSTs to `/api/comment/${comment.id}/nominate` with
`member_uuid` (line 607-611). Its target, `tier_nominations`, exists live with a fully confirmed
shape (`target_tier`, `reason_key`'s exact seven values, the `unique (comment_id, member_id)`
constraint, all read from real applied SQL in `2026-migration-fetch-verification.md`, not guessed).
Closed: `tier_nominations_service_only ... for select using (false)`, no insert policy at all. This
needs its own `current_ghost_member_id()`-shaped insert policy, structurally simple since the
shape is exactly known, but it does not exist today and nothing in the four post-baseline migrations
touches this table.

**Verdict.** `dialecta-discourse-layer.jsx`, `dialecta-private-draft.jsx`: adapted, not as-is (the
fetch target changes regardless), and the read half is blocked on a migration that isn't written.
`dialecta-nomination-panel.jsx`: adapted, blocked on a migration that isn't written. None of the
three are a rewrite on schema grounds; the shape their JSX already assumes matches what live has or
will need almost exactly.

### Profile family

`dialecta-profile.jsx` (2,865), `dialecta-profile-edit.jsx` (621), `dialecta-profile-identity-edit.jsx`
(1,075), `dialecta-profile-order.jsx` (698), `dialecta-profile-settings.jsx` (558),
`dialecta-profile-data.js` (133), `dialecta-profile-data-pure.js` (204), `dialecta-community-contributors.jsx`
(687), `dialecta-community-author.jsx` (713).

`profiles` is open to read (`using (true)`), narrowed today by `20260920192954_close_ghost_member_id_as_public_credential.sql`
to a 39-column grant-back list that excludes only `ghost_member_id` and `gifted_by_member_id`. Read
the grant-back list precisely: `is_admin`, `subscription_tier`, `pact_signed_name`,
`order_negotiation_log` and roughly 35 others are still in it, still world-readable. That migration
closed the one column confirmed to double as a write-path credential (per
`exchange/open/2026-09-20-security-02`); it did not close the broader disclosure `2026-live-rls-surface.md`
first flagged. Not my angle to re-litigate severity, only to flag that the column gate on `profiles`
is partially, not fully, closed.

**No update policy exists on `profiles` at all.** `claim_profile()` (in `20260920000200_profile_claim_tokens.sql`)
writes `user_id` through a SECURITY DEFINER function, which bypasses RLS by design and is scoped
narrowly (single-use token, one column), not a general profile-write path. `dialecta-profile-edit.jsx`
(display name, bio, avatar), `dialecta-profile-identity-edit.jsx` (three editors, image upload),
`dialecta-profile-order.jsx` (`classifyOrder`, `commitOrder`), `dialecta-profile-settings.jsx`'s
`SignaturePanel` (signature font) all PATCH or POST a mutation attributed to a client-supplied id
today (per `security`'s read) into columns that have no RLS write path of any kind live, forged
credential or not. Each of these needs its own scoped update policy, most plausibly one
`current_ghost_member_id()`-shaped policy on `profiles` restricted to the specific self-service
columns (`display_name`, `bio`, `avatar_url`, `signature_font`, `handle`-adjacent fields go through
the reserved-handle flow instead), not yet written anywhere.

`follows` exists live, open to read, 14 rows. `dialecta-profile-data.js`'s `setFollow` (lines 83-97,
per `security`'s read) and the two community files' follow toggles have no insert or delete policy
to write through. `handle_history` is correctly closed to direct writes (`"handle history has no
direct writes" ... using (false) with check (false)`, matching that it's meant to be system-maintained
by whatever process changes a handle, not user-writable) and correctly open to authenticated read,
which is already enough for anything reading it (the `/contributor/<handle>` redirect fallback its
own comment names).

`self_descriptions` (feeds the Self-Snapshot / Growth Scroll family, backlog D-4) is fully closed,
`for all using (false) with check (false)`, service-role only, no exception. Nothing in the recovered
`lib/theme/` tree writes to it directly that I found, so this is a forward-looking gap rather than a
blocked port today, but any port of the Self-Snapshot engine inherits it.

**Verdict.** `dialecta-profile.jsx` itself: as-is on schema grounds, it makes zero network calls of
its own (confirmed by `builder`) and just renders what it's handed. The five edit/settings/order
files: adapted, and every one of them is blocked on an update policy that doesn't exist. The two
community follow files: adapted, blocked on a `follows` write policy that doesn't exist.

### Quotes

`dialecta-quotes-app.jsx` (932), `dialecta-quotes-data.js` (229).

`quotes` exists live, 72 rows, read filtered (70 of 72 visible to anon, per `2026-live-rls-surface.md`).
The baseline guesses the predicate as `status = 'published'` (line 828, reasoned at line 823) with
its own `LIVE UNVERIFIED` marker. **That guess is very likely wrong, and I can show a concrete reason rather than
just flag the marker.** `_recovered/supabase/migrations/007_quotes_table.sql`, the original source
migration for this table, declares `status text not null default 'live' check (status in ('live',
'draft', 'archived'))` (lines 45-46) and its own select policy at line 79: `for select using (status
= 'live')`. Not `'published'` anywhere. Either live still runs on `'live'`/`'draft'`/`'archived'`
today and the baseline's policy is filtering on a value the column never holds (which would mean the
70-of-72 result the RLS surface measured came from a different mechanism than the baseline assumes),
or a later, untracked change renamed the value, which the recorded 22-row history does not show
happening. This needs `migration fetch`-grade confirmation before anyone trusts the baseline's quotes
policy; I'm flagging it, not fixing it, since resolving it is exactly the runbook's Part 1 Step 9
work and this is a Council debate, not a migration session.

Write access for quotes (member suggests a draft, admin adds/edits/archives) has no policy of any
kind live. `dialecta-quotes-app.jsx`'s `isAdmin`/`canSeeNonLive` gates (per `security`'s read) decide
client-side which submit modal opens and which controls render, sourced from `useAdminStatus`, an
HTTP-status probe against an endpoint that itself requires server-side admin auth (per `security`:
"call the admins-list endpoint, which itself requires admin auth"), a materially different and
sounder pattern than dev-admin's raw boolean read, but still a probe against the old Vercel API, not
against anything `apps/web` has. `profiles.is_quote_admin` sits in the same publicly-readable column
list as `is_admin`, so a client-side read of it carries the identical soft-gate caveat.

**Verdict.** Adapted, not as-is: the read predicate needs confirming before the component can be
trusted to show the right 70 rows, and every write path (suggest, add, edit, archive, grant/revoke
quote-admin) needs a policy that does not exist. Nothing here argues for rewrite; the shape (a
status-filtered table plus an admin-gated write) is exactly what live has, once the predicate is
confirmed.

### Notifications

`dialecta-notifications-bell.jsx` (395), `dialecta-notifications-page.jsx` (268),
`dialecta-notifications-settings.jsx` (352), `dialecta-notifications-data.js` (151).

Both tables exist live and both are fully closed, service-role only
(`notifications_service_only`, `20260502161725`; same pattern on `notification_prefs`). No owner-read
policy exists, unlike `comments`, which got one today. That means this whole family is blocked at a
more basic level than discourse: not "reads everyone's, should read the owner's," but "reads
nothing at all" for any caller short of service role. `dialecta-notifications-data.js`'s four
fetch wrappers (`fetchNotifications`, `markRead`, `markAllRead`, `fetchPrefs`, `savePrefs`, all keyed
on `member_uuid` per `builder`'s count) need the exact same shape of fix `comments` just got: a
`recipient_member_id = current_ghost_member_id()` read policy plus an update policy scoped to
`is_read`/`read_at`, and the equivalent on `notification_prefs` keyed by `member_id`. Nothing in the
four post-baseline migrations touches either table.

**Verdict.** Adapted, blocked. The three UI files (`bell`, `page`, `settings`) take `memberUuid` as a
prop with no fetch of their own (`dialecta-notifications-settings.jsx`,
`dialecta-notifications-page.jsx`, `dialecta-notifications-bell.jsx` are all in `builder`'s
prop-receive-only bucket), so once `dialecta-notifications-data.js` has somewhere real to call, the
three consumers need no logic change, only the token and auth-context work every port needs.

### Moments

`_recovered-next/app/contributor/[handle]/moment/[id]/page.js` (251),
`.../moment/[id]/opengraph-image.js` (491), `.../moment/[id]/MomentShareButtons.js` (80). No
`lib/theme/` component; this surface lives entirely in the App Router tree, per `circulation`'s read.

`celebration_events` exists live (the eight event types `circulation` found, seven named plus a
default, match the baseline's `celebration_events_event_type_check` exactly). Closed: `for all to
service_role using (true) with check (true)` and nothing granted to anon or authenticated, which
leaves both with no matching policy on any command.

**This is the one surface in this document where closed-by-default may not need a new policy at
all, and I want to be precise about why, because it's a different argument than everywhere else
above.** Per `circulation`'s read, the page's own access model is "anyone with the link" gated by a
bot/human split (crawlers see the OG-serving page, humans get redirected to the real article), not a
per-viewer permission check. A Next.js server component reading one `celebration_events` row by id
with the service role, server-side, to render a card meant to be public the moment it's shared, is
not the same exposure class as a client fetch: the key never reaches the browser, and the row was
always meant to be visible to whoever holds the link. That can be ported today, through a server-only
route, with no RLS policy change, **provided the route takes an id and renders one row, and never
grows into "list a member's celebration events" without its own owner-scoped policy**, which would be
a different feature needing the same fix as `notifications`.

**Verdict.** Adapted, and the rare case where I can't call it blocked: the three files need their
data access rewritten from the old Vercel API to a server-side Supabase read (service role, scoped to
one row by id), not from a missing policy. `circulation`'s own open item, whether `tier_promoted`
belongs on a card at all given the no-tier-badge-off-platform ruling, is real and is not mine to
answer; nothing about the schema forces either outcome.

### Opinion maps

`dialecta-opinion-map.jsx` (958, render primitives, agnostic per `security` and `builder`),
`dialecta-opinion-map-picker.jsx` (474, agnostic), `dialecta-opinion-map-placement.jsx` (670, the
write layer), `dialecta-admin-resetup-maps.jsx` (656).

`opinion_map_positions` exists live with `stage` (see above) and one real open question of its own:
`reader_id` is `text not null` in the baseline with an explicit `LIVE UNVERIFIED` on both its type
and whether it references anything, "could be uuid against profiles.id instead, per the spec's
naming." A `current_ghost_member_id()`-shaped policy can't be written with confidence until this
resolves, because the comparison (`reader_id = current_ghost_member_id()` if text, something else
entirely if uuid) depends on it. RLS is unset, "closed by default... individual placements are
private by design per the spec," which is the right posture to keep, not a gap to close by opening
it. The spec is explicit that aggregate reads (the "minimum of 20 completed pairs" heat cloud,
backlog D-1) must never expose an individual's coordinates
(`docs/Dialecta_Delta_Mechanic_Spec.md` line 108). **That means the D-1 aggregate view cannot be a
plain select policy on this table at any predicate; it needs a SECURITY DEFINER aggregate function
or a view that returns counts, never rows**, which does not exist yet in any form.

`opinion_map_overrides` is closed, service-role only, matching its role as an editorial-approval
table (`ai_recommendation`, `final_approved`, an editor note); nothing in the recovered tree writes
to it from the client, so no gap to name.

**Verdict.** `dialecta-opinion-map.jsx`, `dialecta-opinion-map-picker.jsx`: as-is, pure rendering, no
data dependency of their own. `dialecta-opinion-map-placement.jsx`: adapted, blocked on the
`reader_id` type question and a write policy, both unwritten. `dialecta-admin-resetup-maps.jsx`:
adapted at best, and its `isAdmin` gate has the identical shape and the identical fix required as
dev-admin below, on a smaller table.

### Dev-admin

`dialecta-dev-admin.jsx` (2,367), `dialecta-admin-repolish.jsx` (485).

All six tables are closed to both anon and authenticated, service-role only, confirmed by name for
every one of them via `20260502161725_028_pre_launch_security_hardening`
(`admin_capabilities_service_only`, `admin_roles_service_only`, `admin_role_capabilities_service_only`,
`admin_audit_log_service_only`, `profile_admin_capability_grants_service_only`,
`profile_admin_roles_service_only`, all `for select using (false)`, per
`2026-migration-fetch-verification.md`'s confirmed reading of the real applied SQL, not a guess).

This is a harder block than everywhere else in this document, and it compounds rather than sits
beside what `security` already found. `security`'s read establishes that `dialecta-dev-admin.jsx`
trusts a client-held `caps` array read off an unauthenticated `GET /api/profile/${memberUuid}`, with
every one of its six tabs (`team`, `feedback`, `articles`, `quotes`, `members`, `tuning`, confirmed
at lines 27-33) gated on that array, and `GrantRoleModal` able to self-grant a role with no session
proof. My angle adds the piece underneath that: even a perfectly honest, session-verified rewrite of
that gate still cannot read `admin_capabilities`, `admin_roles`, or either grant table through
`anon`/`authenticated`, because RLS returns zero rows to both roles on every one of them regardless
of who is asking. No version of "fix the client check" works against this schema. The data layer
has to move server-side entirely, reading with the service role behind a real verified
session (the same shape `current_ghost_member_id()` and `claim_profile()` already establish for
`comments` and `profiles.user_id`, extended to a capability lookup), not gated by a new RLS policy
opened to `authenticated`, because opening admin role data to every signed-in user is its own defect.
Nothing like that capability-lookup function exists yet.

**Verdict.** Rewrite, not port, on schema grounds alone, independent of `security`'s identity
findings and consistent with `builder`'s own framing that "admin can wait or run through Supabase
Studio." Whatever JSX survives from `dialecta-dev-admin.jsx` is presentation wrapped around a data
layer that has to be built new. `dialecta-admin-repolish.jsx`: same verdict, smaller surface
(one capability, `articles.repolish`, gated the identical way).

## What the port owes RLS, ranked

**Needs a policy written before the port does anything real** (the UI can be moved into `apps/web`
today, but every submit or private read 403s or empty-selects until the policy lands, which is safe,
not exploitable, so this is a sequencing note, not a security gate): the discourse layer's public
read, `tier_nominations` insert, `opinion_map_positions` insert plus its aggregate function,
`follows` insert/delete, `notifications` and `notification_prefs` owner read/update, `self_descriptions`
(forward-looking), `quotes` insert/update, `profiles` update (self-service columns).

**Needs the data layer rebuilt server-side, not merely a new policy, because opening the table to
`authenticated` would itself be the defect**: every dev-admin table, six of them, all closed to both
roles for a reason.

**Can be ported now with zero schema work**: the twelve agnostic files `security` and `builder` both
confirm (`topics.js`, `dialecta-tier-capabilities.js`, `dialecta-tier-badge.jsx`,
`dialecta-fingerprint-engine.jsx`, `dialecta-archetype-grid.jsx`, `dialecta-mentions-picker.jsx`,
`dialecta-opinion-map.jsx`, `dialecta-opinion-map-picker.jsx`, `dialecta-reflection-bar.jsx`,
`dialecta-classify-stream.js`, `fingerprint-page-mount.jsx`, `dialecta-sidebar.jsx`), plus
`dialecta-profile.jsx` itself (zero fetches of its own). One caveat on `dialecta-tier-capabilities.js`:
its numbers (`max_candidates`, `polish_runs` per subscription tier) are meaningless as a control
until a server-side mirror exists, which is an enforcement gap `security` already named, not a
schema gate; I'm not re-ranking it, only noting it doesn't belong in the "safe as-is" bucket without
that caveat attached.

**Already ready today, the one clean case**: `comments` INSERT and own-row SELECT, landed this
session in `20260920200500_comment_write_identity.sql`. Nothing else in the 51 components has this
status.

**Blocked on a missing column, not a missing policy, which no policy can fix**: everything that
reads or writes article content (see above). This is a different kind of blocked than the RLS list
above it: no amount of RLS work makes `apps/web/src/lib/articles.ts` correct while `articles` has no
`slug`.

## The 44 recovered migrations, not 46

`docs/RECOVERED.md` states 46. I counted directly: `ls _recovered/supabase/migrations/ | wc -l` and
`find _recovered/supabase -iname "*.sql" | wc -l` both return 44, and `find "_recovered/" -iname
"*.sql" | grep -v "supabase/migrations"` returns nothing, so there is no second location holding the
other two. Naming the discrepancy because precision is the whole job here, not because it changes
the ruling below.

**Ruling: none should ever be applied, and none is net new.** Every one of the 44 I checked, whether
by exact filename-to-slug match against the real applied history or by its effect being visible in
the live schema the baseline already carried over, describes a table or column that is already live.
The clearest evidence: `2026-migration-fetch-verification.md` independently confirmed 20 (now 22)
migrations against real applied SQL by name, and every one of those names matches a file in this
directory by slug once the local numeric prefix is stripped (`014_axis_events.sql` to the applied
`axis_events`, `025_tier_nominations.sql` to `tier_nominations`, `029_profiles_handle.sql` to
`profiles_handle`, and so on through all 20). The other 24 files (`000` through `013`, plus
`017`-`024`) predate or fall outside the recorded 22-row history table, the same gap
`2026-live-migration-history.md` and the baseline's own `LIVE UNVERIFIED` markers already document,
but their effects are independently confirmed live: `follows`, `sparring_partners`, `feed_events`
(`001_v1_1_schema.sql`), `quotes` with 72 rows (`007_quotes_table.sql`, `008_seed_quotes.sql`),
`admin_capabilities`/`admin_roles`/the grant tables (`017_admin_rbac.sql`), `notifications`/`notification_prefs`
(`019_notifications_schema.sql`), `comments.parent_id`/`.mentions` (`020_comments_parent_id.sql`,
`023_comments_mentions.sql`), `opinion_map_overrides`/`opinion_map_positions.map_index`
(`022_opinion_map_overrides.sql`, `024_opinion_map_positions_multi.sql`), `feedback_items`
(`018_feedback_items.sql`). Applying any of them again fails outright on the first `create table`,
identical to the original September collision `docs/RECOVERED.md` warns against, pointed the other
way. `2026-schema-squash-runbook.md`'s baseline already supersedes all 44 as the one hand-authored
source of truth; nothing here argues for un-superseding any of them.

**What they are still good for, concretely, which nobody had connected before this pass.** The
baseline carries roughly 24 remaining `LIVE UNVERIFIED` markers because the tracked 22-row history
doesn't reach that table or column. Most of those tables are created by one of the 22 untracked
files in this directory, which is the original author's real source for exactly that DDL. I checked
three to test this rather than assert it blind:

- `notifications.email_status` default: the baseline guessed `'pending'`.
  `019_notifications_schema.sql` line 74 confirms `DEFAULT 'pending'`. Matches; upgrade this marker
  to confirmed.
- `articles.status` candidate list: the baseline guessed `draft/declared/published/archived`,
  sourced from the archived September migration. `005_articles_table.sql` line 40 gives
  `draft/classified/published/reclassified`, a different pair of values. The recovered file is the
  real source; the baseline's guess should be corrected to match it, pending the same
  migration-fetch-grade confirmation every other marker needs before it ships in a policy.
- `quotes.status`: the baseline guessed default `'draft'` and predicate `status = 'published'`.
  `007_quotes_table.sql` gives default `'live'` and predicate `status = 'live'` (lines 45-46, 79).
  Already flagged above under Quotes; repeating here only to show the method that found it.

One of three confirmed the guess, two corrected it. That is a real hit rate, cheap to run (one grep
per remaining marker against this directory), and it is the concrete next action I'd hand to
whoever next touches the baseline, ahead of a fresh `migration fetch` pass for anything these files
don't reach either.

## What this changes about the first increment

Not re-running `builder`'s 5-to-8-working-day slice estimate; I have nothing to add to the line
count. What I can add: the slice's own named path, article, comment, classify, a rendered card, runs
straight into the two blockers with the least schema work behind them and the most floor-setting
effect. The article half needs the P0-5-shaped migration in "The article content question" landed
first, additive, cheap, on 5 rows, before there is anything real to render. The comment half needs
one more short migration beyond what shipped today: a public read policy on `comments` (status
`published`/`suppressed`, or `member_id = current_ghost_member_id()`), which does not exist as of
this document. Both are small, both are migrations I could write in the time it takes to review this
debate's outcome, and neither is optional scaffolding: without them the ported UI has nothing live
to read no matter how well the port itself goes. I'd put these two ahead of the UI work in the
slice's own sequencing, not because the UI work is wrong, but because five to eight days of porting
`dialecta-discourse-layer.jsx` and the article page produces a working demo only if these land
first, and they're days of work, not weeks.

## Rebuttal

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
