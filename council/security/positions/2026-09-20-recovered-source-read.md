# Recovered front-end source, read against the security mandate

**Seat:** security. **Written:** 2026-09-20. **Status:** findings. This is a read, not a position;
nothing here is a recommendation and nothing is decided.

## Brief

Read `_recovered-next` end to end for the Ghost injection's reach, client-side trust, the debug
route, secrets, and whether five months of shipped code overturns anything already filed. It
confirms and multiplies instead. 38 of 51 `lib/theme/` components reference Ghost member identity by
name; the editor and dev-admin mounts refuse to render without it. `dialecta-dev-admin.jsx` extends
the comment-forgery shape to role grants: every admin mutation, including granting `publisher`,
carries a client-supplied `member_uuid` with no session proof, the pattern already confirmed for
comments. The debug route returns the live Supabase URL plus the service key's length and prefix to
an unauthenticated GET, alongside ten profile rows. Nothing overturns a filed finding;
`dialecta-private-draft.jsx` is the confirmed client half of the comment chain.

## 1. The Ghost injection, quantified

**Method.** `lib/theme/` holds 51 files at its top level (`find -maxdepth 1 -type f`, confirmed by
listing). A further 4 sit in `_archive/2026-05-02/`, an older snapshot, excluded from the 51 and
from everything below unless named. Three greps, read against source rather than trusted blind:
first for the literal injection points (`window.__DIALECTA_MEMBER_UUID__`,
`window.__DIALECTA_MEMBER_EMAIL__`, `dataset.memberUuid`, `dataset.isMember`), second for every
`.js`/`.jsx` file naming a member-identity variable (`memberUuid`, `ghostMemberId`, `viewerGhostId`,
`viewerMember`, `memberId`, `memberEmail`, `memberName`, `isMember`), unioned and deduplicated.

**38 of the 51 files reference Ghost-derived member or viewer identity by name in their own
source.** Full list: `shell.jsx`, `home-page-mount.jsx`, `post-page-mount.jsx`,
`editor-page-mount.jsx`, `notifications-page-mount.jsx`, `dev-admin-mount.jsx`,
`community-page-mount.jsx`, `dialecta-quotes-mount.jsx`, `dialecta-share.jsx`,
`dialecta-quotes-app.jsx`, `dialecta-profile.jsx`, `dialecta-profile-settings.jsx`,
`dialecta-profile-order.jsx`, `dialecta-profile-identity-edit.jsx`, `dialecta-profile-edit.jsx`,
`dialecta-profile-data.js`, `dialecta-profile-data-pure.js`, `dialecta-private-draft.jsx`,
`dialecta-opinion-map-placement.jsx`, `dialecta-notifications-settings.jsx`,
`dialecta-notifications-page.jsx`, `dialecta-notifications-data.js`, `dialecta-notifications-bell.jsx`,
`dialecta-nomination-panel.jsx`, `dialecta-handle-setup.jsx`, `dialecta-editor.jsx`,
`dialecta-discourse-layer.jsx`, `dialecta-dev-admin.jsx`, `dialecta-community.jsx`,
`dialecta-community-feed.jsx`, `dialecta-community-contributors.jsx`, `dialecta-community-author.jsx`,
`dialecta-article-classification.jsx`, `dialecta-admin-resetup-maps.jsx`,
`dialecta-admin-repolish.jsx`, `dialecta-quotes-data.js`, `dialecta-signup-invite.jsx`,
`dialecta-sidebar.jsx`.

That last one, `dialecta-sidebar.jsx`, I hold at lower confidence than the other 37: it references
"the viewer" in comments describing a "Your Comment" mobile panel (lines 11, 393, 679, 1221) but I
did not confirm whether it re-reads `window.__DIALECTA_MEMBER_UUID__` directly or resolves via a
comment-id echo from local state. Read, not assumed away; mechanism not fully pinned down.

**The architecture is nine per-template mount files, each reading the injection at the DOM
boundary and passing it inward.** `dialecta-quotes-mount.jsx`'s own docblock quotes the Handlebars
source verbatim: `data-member-id="{{@member.uuid}}"` on `page-quotes.hbs`, the same pattern
`SITE-INVENTORY.md` found on `page-profile.hbs`. It is not a one-page trick; it is how this theme is
mounted, full stop.

Of the nine mounts, three tiers:

| Mount | On Ghost's departure |
| --- | --- |
| `editor-page-mount.jsx` | **Total breakage.** Lines 17-34: an empty `memberUuid` renders a sign-in link and `DialectaEditor`, 4,727 lines, the largest file in the whole recovered tree, never mounts |
| `dev-admin-mount.jsx` | **Total breakage.** Lines 17-33: same hard gate. `DialectaDevAdmin`, 2,367 lines, never mounts without a non-empty `data-member-uuid` |
| `shell.jsx`, `home-page-mount.jsx`, `post-page-mount.jsx`, `notifications-page-mount.jsx`, `community-page-mount.jsx`, `dialecta-quotes-mount.jsx` | **Degrade to visitor mode.** Each renders something: a sign-in nudge, a read-only feed, a visitor-facing profile prompt. Six of nine mounts fail soft |
| `fingerprint-page-mount.jsx` | **Zero dependency.** Confirmed at lines 21, 63-81: the hero carousel is hardcoded to three seed ids, `seed:maya`, `seed:wen`, `seed:anselm`, fetched by id regardless of who is viewing. The only page template unaffected by Ghost's departure |

**The remaining 13 of 51** (`__DO_NOT_EDIT.md`, `style.css`, `topics.js`,
`dialecta-tier-capabilities.js`, `dialecta-tier-badge.jsx`, `dialecta-fingerprint-engine.jsx`,
`dialecta-archetype-grid.jsx`, `dialecta-mentions-picker.jsx`, `dialecta-opinion-map.jsx`,
`dialecta-opinion-map-picker.jsx`, `dialecta-reflection-bar.jsx`, `dialecta-classify-stream.js`,
`fingerprint-page-mount.jsx`) are identity-agnostic in their own logic, confirmed by reading their
exported functions: pure data transforms, geometry, color math, a tier-string lookup table, a search
dropdown. But except for the Fingerprint page's own standalone use, every one of these 12 is
imported today only from inside one of the 38 identity-gated files (`dialecta-profile.jsx` alone
imports the fingerprint engine, the order badge, and topics; the editor imports the opinion-map
primitives, the tier-capabilities table, and the reflection bar). Not needing Ghost is not the same
as being unaffected by its removal; a rewrite has to re-wire the caller, not the callee.

## 2. What the client trusts

Read `dialecta-dev-admin.jsx` in full, 2,367 lines, since the brief named it first.

**Every authorization decision in the file is made in the browser, off one unauthenticated-shaped
fetch.** Line 25: `const API_BASE = window.__DIALECTA_API_URL__ || ''`. Lines 51-75: on mount, the
component fetches `API_BASE + '/api/profile/' + memberUuid` with no headers object, no
`Authorization`, no `credentials: 'include'`, nothing but the bare URL, and reads
`p?.effective_capabilities` and `p?.admin_roles` straight off the JSON body. `memberUuid` itself is
`dev-admin-mount.jsx` line 20's `rootEl.getAttribute('data-member-uuid')`, the same Ghost injection
from section 1. Whatever string sits in that HTML attribute when the page loads is this file's
entire notion of who is asking. Six tab-visibility tests (`TABS`, lines 27-34), the `canManage` flag
gating Grant/Revoke (line 273), the `canRepolish` flag gating the re-polish button (line 1390), all
read the same client-held `caps` array. None of it is a server round trip beyond that first fetch.

**Every mutation in the file sends the same client-supplied id as a plain parameter, never a session
token.** Grep of the file for `Authorization`, `credentials`, `session`, `cookie`, `jwt` returns
nothing. Confirmed call sites: `POST /api/admin/team?member_id=<memberUuid>` to grant or revoke a
role (lines 291, 1932), `PATCH /api/admin/feedback/<id>?member_id=<memberUuid>` to acknowledge or
triage (lines 602, 816), `GET /api/admin/members?member_id=<memberUuid>` for the full member
directory (line 981), `GET /api/admin/articles?member_id=<memberUuid>` (line 1376),
`GET /api/admin/pulse?member_id=<memberUuid>` (line 1693), `POST /api/article/repolish` with
`member_uuid: memberUuid` in the body (line 1645). I have not read the server side of any of these;
all six remain `unread` in `live-surface-inventory.md`. What I have read is that the client offers
nothing beyond the id for any of them.

**`GrantRoleModal` (lines 1900-2038) is the highest-privilege path in the file, and it names a new
route.** On open it calls `GET /api/profile/_list` (line 1911), no parameters, no auth, and gets
back every contributor's `display_name` and `ghost_member_id` (lines 1913, 1977-1989) to populate a
searchable picker. That route is not in `live-surface-inventory.md`'s table of 38. It exists in this
recovered tree and needs adding to that inventory and reading. Submitting the form
(`handleSubmit`, line 1926) POSTs `{ action: 'grant', target_member_id, role_id, note }` to
`/api/admin/team?member_id=<memberUuid>`, where `memberUuid` is still the DOM-sourced value from the
top of the file. If the server side of that route trusts `member_id` the way `api/comment.js` is
already confirmed to trust `member_uuid`, this is not comment forgery; it is granting oneself
`publisher` with no session at all, off a `ghost_member_id` obtained from the same picker that just
handed it out. `availableRoles` (fed to the `<select>` at line 1999) is whatever the same unread
`/api/admin/team` route returns, so I cannot say from this file alone which roles are offerable.

**`MembersSection` (lines 971-1233) ships the whole member directory to the browser and filters
client side.** `data?.members || []` (line 991) is the full array; the search box (lines 1031-1037)
and sort/filter controls (lines 994-1005, 1038-1058) operate on it in memory, not against the
server. Rendered per member: `display_name`, `email` (line 1144), `location` (line 1186), role
badges, activity timestamps. This is the PII concentration `live-surface-inventory.md` already
names as the highest-blast-radius unread route, and this file is the confirmed consumer that
downloads it whole.

**The same client-decides shape recurs outside dev-admin, in at least two more surfaces.**

`dialecta-tier-capabilities.js`, read in full: a browser-side lookup table gating the editor's
opinion-map candidate cap (`max_candidates`: 2 for free, unlimited for pro) and its AI-polish run
cap (`polish_runs`: 2 for free, `Infinity` for pro), keyed on `profile?.subscription_tier` (lines
22-47). Its own docblock (lines 7-8) says the server-side mirror "lives wherever your tier-system
thread puts it (likely `api/_subscription-tier.js`)". "Likely" is the file's own word for its
author's uncertainty that a server enforcement copy exists at all. If `/api/article/classify-stream`
does not independently cap these, a free account's limit is exactly as binding as choosing to obey
it, and every run past the cap is a priced Anthropic call this file was supposed to have stopped.

`dialecta-quotes-app.jsx`: `isAdmin`, from `useAdminStatus(memberId)` (line 56, implementation
unread), gates `canSeeNonLive` (line 73, whether unpublished quotes render at all), which of two
submit modals opens ("Add Quote", immediate, versus "Suggest a Quote", presumably queued: lines 175,
203, 398-436), and whether Edit/Archive/Promote/Restore render on a given card (line 312). Same
architecture as dev-admin: one client-held boolean, sourced from a single fetch, gates both what is
visible and which write path a click takes.

I did not read `useAdminStatus`, `_subscription-tier.js`, or any of the six admin/quotes server
routes above; all remain `unread`. What this section establishes, read rather than inferred, is that
"authorize in the browser, trust the id you were handed" is not one file's mistake. It is the
recurring shape of this front end, confirmed independently in three unrelated surfaces: admin,
monetization, and content moderation.

## 3. The debug route

`app/api/debug/profile/[handle]/route.js`, read in full, 75 lines. Its own docblock: "Bypasses the
production code path and does raw Supabase queries with full error visibility... Delete this file
once Path C is fully stable." It was not deleted; it shipped in deployment
`dpl_3ZRBaGX4rKEUnuc87zAm7YHHB7VQ`, 2026-05-06. `next.config.mjs`'s own header comment (lines 4-8)
names this project's intended production host as `library.dialecta.org`, distinct from the Ghost
site at `dialecta.org`. I did not probe whether that host answers today; I am reporting what the
project's own config states as its target, not a live confirmation.

No authorization code of any kind runs before any of it. `GET` with a `handle` path param returns:

- `env_check` (lines 18-24): `has_supabase_url`, `has_supabase_key` as booleans, `supabase_url` as
  the **full live URL**, `key_length` as an integer, and `key_prefix` as **the first 12 characters
  of `SUPABASE_SERVICE_KEY`**, the `bypassrls` service-role key used by every server handler in this
  estate per `2026-dialecta-secret-and-artifact-hygiene.md`.
- `sanity_count` (lines 40-43): the exact row count of `profiles`.
- `sample_handles` (lines 45-50): the first 10 profiles ordered by `display_name`, each carrying
  `ghost_member_id`, `handle`, `display_name`.
- `exact_match` and `ilike_match` (lines 52-64): look up any single profile by handle, case-sensitive
  and case-insensitive, returning the same three fields.

The `sample_handles` and `*_match` blocks are a third way to obtain the exact credential
`2026-dialecta-comment-credential-chain.md` already confirmed is usable to forge a comment, alongside
the world-readable `profiles` table and `/api/profile/_list` from section 2. This one needs no SQL
and no table-privilege knowledge, only an HTTP GET and, optionally, a guessed handle. It is a
purpose-built enumeration endpoint for exactly the value that endpoint's trust model depends on,
whether or not that was anyone's intent.

The key material is partial, not the full secret: a length and a 12-character prefix. That is not
nothing. It is enough to confirm a guessed or partially-recovered key against the real one, and it
is disclosure a git-history scanner structurally cannot catch, because the value never touches a
commit, only a live HTTP response.

## 4. Secrets and keys

Independently checked rather than trusted from `RECOVERED.md`'s own claim.

**`lib/ghost-admin.js`, read in full: clean.** `GHOST_ADMIN_API_KEY` is read from `process.env`
only (line 26), never hardcoded, split into a 24-hex id and 64-hex secret, and used to sign a
short-lived (5-minute, line 33) HMAC-SHA256 JWT matching Ghost's own documented Admin API auth
scheme. No secret value appears in source.

**A broad sweep for high-entropy strings** (40+ base64-alphabet characters) across every `.js`,
`.jsx`, `.json` and `.mjs` file in the tree returned matches only in `package-lock.json` (npm
integrity hashes, expected) and in `dialecta-profile.jsx` at eleven lines, each confirmed by a
second grep to be `data:image/...` inline base64 images, not secrets.

**No `.env`, `.env.local`, or `.env.production` file exists anywhere in this recovered tree.**
Confirmed by direct listing.

**One `NEXT_PUBLIC_` variable exists**, `NEXT_PUBLIC_SITE_URL`, used as a URL fallback in
`sitemap.js`, `robots.js`, and two `page.js` files. A URL is the correct thing to expose publicly;
this is not a finding.

**The debug route in section 3 is the one real exposure in this tree**, and it is a different
category from what `RECOVERED.md` checked for. Nothing here disputes that no credential is
*committed*; the Postgres role name is still the only secret-scan hit, and I found no hardcoded key,
token, or literal secret anywhere in `_recovered-next`. What section 3 adds is a *runtime* exposure:
a live response handing out a URL and a key fingerprint to anyone who asks, which
`git log`, gitleaks, or any commit scanner would never see, because the secret never enters the
repository, only the HTTP response.

No other admin-bypass flag, hardcoded backdoor string, or literal project ref turned up. The
`*.supabase.co` entries in `next.config.mjs`'s `images.remotePatterns` (lines 36-43) are a wildcard
host allowlist for `next/image`, not a specific project reference.

## 5. Against what is already filed

**Confirms, and closes a loop, on the comment credential chain.**
`2026-dialecta-comment-credential-chain.md` read only the server half,
`_recovered/api/comment.js`. `dialecta-private-draft.jsx` (1,796 lines) is the client half, read
here for the first time: its own docblock (line 29) states the flow, `POST /api/comment` with
`member_uuid + body + self_declared`, and line 1436 confirms the call carries
`member_uuid: member.uuid` (line 1440), sourced from `post-page-mount.jsx`'s
`commentsRoot.dataset.memberUuid`, the raw DOM attribute, with nothing else added anywhere in the
compose flow. The client does not compensate for what the server fails to check. It completes the
identical trust chain from the writing end. No reversal; full confirmation, both ends now read.

**Extends it, materially.** Section 2 shows the same shape, a client-supplied id trusted as identity
with no session proof, recurring in `dev-admin`'s every admin mutation and reaching, if the server
side matches `api/comment.js`'s pattern, as far as self-granting `publisher`. That is a larger blast
radius than comment forgery, on the same unverified precondition. It also means
`api/admin/team.js`, still `unread`, is now a higher-priority read than its current position in the
sprint's "next three" reflects, and `api/profile/_list` and `api/profile/[id].js`'s full behavior
(the route dev-admin depends on for every capability check) belong next to it.

**Does not contradict `nextjs-rebuild.md`.** That position reviews `apps/web`, the current rebuild
on the new Supabase schema; `_recovered-next` is a separate, abandoned 2026-05-06 migration sitting
on the old Vercel API, a different codebase. What this read adds to that position: independent, dated
evidence that "authorize in application code, trust the id you were handed" was already the house
pattern one generation earlier, confirmed here across three more surfaces (admin, monetization,
quotes moderation) than had been read when that position was filed. It sharpens the argument for
moving trust-carrying writes off anything the anon key can reach; it changes nothing in it.

**Does not touch the social-login or P0-D2 positions.** This entire tree predates ADR-002 and
Supabase Auth. It is built end to end on Ghost member sessions and has no bearing on federated
identity, linking, or the claim-token question.

**Extends `live-surface-inventory.md`.** Adds `GET /api/profile/_list` as a route not currently in
its table of 38, called unauthenticated from `dialecta-dev-admin.jsx`'s `GrantRoleModal`, returning
every contributor's `display_name` and `ghost_member_id`.

## The single worst thing found

`dialecta-dev-admin.jsx`'s role-grant path. Every piece needed to self-grant an admin role is now
independently confirmed on the client side: the credential (`ghost_member_id`, handed out
unauthenticated three separate ways across sections 2 and 3), the picker that turns it into a
selectable name (`/api/profile/_list`), and the mutation that spends it
(`POST /api/admin/team?member_id=<any-value>`, carrying no session proof, same shape as the
already-confirmed comment endpoint). The one link not yet read is the server side of
`/api/admin/team.js` itself. Given this is the same API generation, the same author, and the same
month as the endpoint already confirmed to make exactly this mistake, closing that one read is the
highest-value next action this seat can name.
