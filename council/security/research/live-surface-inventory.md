# Live surface inventory

**Source:** This agent, from the file tree of deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`
(`/v6/deployments/{id}/files`), read 2026-09-20. Not filed from an external source. The `out/`
branch of that tree lists compiled lambdas, which is the authoritative list of what answers a
request; the `src/` branch gives the handler each one was built from.

## Status of this inventory

Every route below is verified to exist as a deployed lambda. The auth column is only filled where
this agent has read the handler. The Vercel MCP file reader truncates every result at roughly two
thousand characters, so handlers larger than that have been listed but not read. `unread` means
exactly that, and it is not a statement that the route is safe or unsafe.

Two subtrees were truncated by the file listing at depth and are not yet enumerated:
`api/comment/[id]/` and `api/admin/feedback/`. Both contain at least one further route.

## Routes

| Route | Handler | Auth as read | Notes |
| --- | --- | --- | --- |
| `/api/comment` | `api/comment.js` | Ghost `member_uuid` in the POST body, resolved against `profiles.ghost_member_id` | Its own docblock states `member_id` and `member_name` come from the profile rather than the request, and that `member_email` is taken from the request body. Calls `/api/classify`. Handler body unread |
| `/api/comment/[id]` | `api/comment/[id].js` | unread | |
| `/api/comment/[id]/...` | not enumerated | unread | Subtree truncated in the listing |
| `/api/comments` | `api/comments.js` | unread | |
| `/api/classify` | `api/classify.js` | unread | Anthropic call. Root `CLAUDE.md` records the system prompt as inline here |
| `/api/profile/[id]` | `api/profile/[id].js` | none on GET | A GET inserts a `profiles` row with a caller controlled `display_name`. Found 2026-09-20, recorded in `practices.md` and in ledger record 2026-09-20-005 |
| `/api/profile/cover-search` | `api/profile/cover-search.js` | unread | |
| `/api/contributor` | `api/contributor.js` | unread | |
| `/api/article/[id]` | `api/article/[id].js` | unread | |
| `/api/article/submit` | `api/article/submit.js` | unread | |
| `/api/article/publish` | `api/article/publish.js` | unread | |
| `/api/article/classify` | `api/article/classify.js` | unread | Anthropic call |
| `/api/article/classify-stream` | `api/article/classify-stream.js` | unread | Anthropic call |
| `/api/article/classify-order` | `api/article/classify-order.js` | unread | Anthropic call |
| `/api/article/aesthetic-suggest` | `api/article/aesthetic-suggest.js` | unread | Anthropic call. Named in ledger record 2026-09-19-005 |
| `/api/article/suggest-topics` | `api/article/suggest-topics.js` | unread | Anthropic call |
| `/api/article/repolish` | `api/article/repolish.js` | unread | Anthropic call |
| `/api/article/upload-image` | `api/article/upload-image.js` | unread | Write path to storage |
| `/api/article/admin-resetup-maps` | `api/article/admin-resetup-maps.js` | unread | Name implies an admin action outside `api/admin/` |
| `/api/admin/members` | `api/admin/members.js` | unread | Member records are the PII concentration on this platform |
| `/api/admin/member-tier` | `api/admin/member-tier.js` | unread | Writes a paid tier |
| `/api/admin/team` | `api/admin/team.js` | unread | |
| `/api/admin/articles` | `api/admin/articles.js` | unread | |
| `/api/admin/pulse` | `api/admin/pulse.js` | unread | |
| `/api/admin/feedback` | `api/admin/feedback.js` | unread | |
| `/api/admin/feedback/...` | not enumerated | unread | Subtree truncated in the listing |
| `/api/notifications` | `api/notifications.js` | unread | |
| `/api/notifications/[id]` | `api/notifications/[id].js` | unread | |
| `/api/notifications/digest` | `api/notifications/digest.js` | unread | |
| `/api/notifications/prefs` | `api/notifications/prefs.js` | unread | |
| `/api/opinion-map/place` | `api/opinion-map/place.js` | unread | |
| `/api/share/track` | `api/share/track.js` | unread | |
| `/api/webhooks/member-added` | `api/webhooks/member-added.js` | unread | Inbound webhook. Signature verification unconfirmed |
| `/api/feedback` | `api/feedback.js` | unread | |
| `/api/quotes` | `api/quotes.js` | unread | |
| `/api/library` | `api/library.js` | unread | |
| `/api/sitemap` | `api/sitemap.js` | unread | |
| `/api/robots` | `api/robots.js` | unread | |

## Shared modules

`_cors.js`, `_capabilities.js`, `_ghost-admin.js`, `_notifications.js`, `_axis-mapping.js`,
`_byline-excerpt.js`, `_fp-snapshot.js`, `_profile-validation.js`, `_quote-admin.js`,
`_signature-fonts.js`, `_subscription-tier.js`, `_topics.js`, `_skills/opinion-mapper.js`.

`_axis-mapping.js` is present here and absent from `C:\Dialecta`. Root `CLAUDE.md` notes handoffs
referencing it and says to check the deployed project before assuming the repo is the whole API.
It is.

## `_cors.js`, read in full

```js
const ALLOWED_ORIGINS = ['https://dialecta.mymagic.page', 'https://dialecta.org', 'https://www.dialecta.org'];

export function applyCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
```

The allowlist is correct in shape: it echoes the request origin only on a match, sets `Vary: Origin`,
and does not use a wildcard. What it is not is an access control. CORS is enforced by browsers on
cross origin reads. A request from `curl`, a script, or any non browser client never consults it,
and a request with no `Origin` header is unaffected by it. Any route whose only barrier is this
function is open to anyone who can form an HTTP request.

## `_capabilities.js`, partial read

The header documents a capability model backed by migration `017_admin_rbac.sql`: `admin_roles`,
`admin_capabilities`, `admin_role_capabilities`, `profile_admin_roles`,
`profile_admin_capability_grants`, and a `profile_effective_capabilities` view. It instructs
callers to use `hasCapability()` or `verifyCapability()` and never to hardcode role names. It also
records that `profiles.is_admin` and `profiles.is_quote_admin` flag checks remain in use until a
Phase 2 refactor moves them onto these helpers.

The client is constructed with `SUPABASE_SERVICE_KEY`, which carries `bypassrls`. Every capability
decision in this API is therefore made in application code, not by the database. RLS is not a
second layer behind these routes.

## What this inventory changes

- The brief's third task asked for this list because no such list existed, which is how
  `/api/profile/[id]` went unnoticed from April to September. The list now exists and names 38
  routes plus two unenumerated subtrees. The repository named as the API's source contains 11
  files.
- The three routes worth reading first are `/api/admin/members` (member PII), `/api/webhooks/member-added`
  (inbound, unauthenticated by default unless it verifies a signature), and `/api/comment`
  (untrusted text into a paid model). That ordering is by blast radius, not by reachability, and it
  should be revisited once the handlers are readable.
- Seven routes call Anthropic. The treasurer prices one classification at roughly $0.002. Cost
  exposure is a function of how many of those seven can be reached without credentials, which is
  currently unknown for all seven.

*Filed 2026-09-20*
