# Hotfix 2026-09-21: `/api/comments` and `/api/article/upload-image`

Prepared by `security` for Dan. Nothing here is deployed; every production step is yours.
Files: `comments.js` and `upload-image.js` (the replacements), their `*.test.mjs`,
`verify-tree.mjs`, `deployed-uids.json`.

## Finding

Both handlers are the production ones: the recovered copies hash to the uids Vercel lists for
them in `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`, the deployment behind `dialecta.vercel.app`. Read
from source, not probed.

**`GET /api/comments`** gives any caller, with no credential, every comment on an article in any
status, each with its whole classifier row and its author's member id. Sized with read-only counts,
copying no member text:

| | Today |
| --- | --- |
| Comments served | 3, all `published`, on 2 articles |
| Private `commenter_message` | 3 |
| `claim_text` | 2 |
| Other classifier internals: emotion, tribal markers, borderline flags, strength | every row |
| Member ids, the legacy write credential | 2 |
| Breach, pending and suppressed rows; nominations | 0 each. Their text leaks from the first row |

The feed ignores `status`, so it also put every `pending_review` comment on the live page. The
containment in `research/2026-dialecta-comment-credential-chain.md`, that a comment posted under
someone else's id stays hidden until promoted, never held on the live site.

**`POST /api/article/upload-image`** hosts an image on Ghost's CDN for anyone who names a profile's
`member_uuid`; an author's id also opens article photos. Article pages write the author's id into
the byline links (all 5 `articles` rows carry one), and `anon` reads `comments.member_id` and
`articles.author_member_id` (`convener-05`).
Reachable today. `legal` ties the route to the 18 U.S.C. 2258A reporting duty.

## The two files

| File | Deployed SHA-1 | This folder's SHA-1 |
| --- | --- | --- |
| `api/comments.js` | `b5db0ff357e8fd179aee2aec44e06f14b174f974` | `f8702db7a601ad36fe06f17dd16a7708e36190ec` |
| `api/article/upload-image.js` | `ab585594fdcd658c84bdf6b0ad789ef23c63632d` | `8426e74168d9ff90ae069a3a7e3142739f65008d` |

`comments.js` against production (full diff:
`diff -u _recovered/api/comments.js council/security/hotfix-2026-09-21-api-comments/comments.js`):

- `status = 'published'`, in the query and again in code.
- No `member_id` anywhere: not on `author`, not inside `mentions`.
- `classification` is four fields: `ai_suggested_tier`, `self_declared_tier`, `final_tier`,
  `specificity_score`. The other eleven are no longer fetched.
- Breach: `body` null, `mentions` empty, `specificity_score` null, `final_tier` `'breach'`. Breach
  is the tier the card shows, or an engine Breach read that a self-declaration overrode:
  `comment.js` writes `final_tier = self || ai`, and `packages/core` never lets a self-declaration
  alone outweigh the engine.
- `nominations.viewer_nomination` is always null; `total` and `tallies` stay.
- A reply is sent only if its parent is listed, so `parent_id` cannot give away a hidden comment's id.
- Errors no longer carry the database message. `published_at` is dropped.
- Unchanged: route, parameters, envelope, `is_own`, the Underwriter fields, CORS, 400 and 405.

`upload-image.js` answers the CORS preflight and returns 503 with "Image uploads are paused for
now. Images already on the site stay as they are." to every POST. It imports only `../_cors.js`
and never reads the body.

## Field map

The one consumer of `GET /api/comments` on the live site is the discourse layer bundled into
`_theme/assets/js/post.js`, loaded by `post.hbs`, one fetch. Mapped by parsing the bundle rather
than by eye. The other eight bundles, the templates, `dialecta-next` and `apps/web` never call it.

| Field | What reads it on dialecta.org | Now | Visible change |
| --- | --- | --- | --- |
| `id`, `created_at`, `parent_id` | keys, time, sort, threading, the edit, delete and nominate URLs | kept | none |
| `body` | the card, the edit box | kept; null on Breach | none: a Breach card shows its notice |
| `hardened_at`, `malleable` | countdown, progress bar | kept | none |
| `mentions[].handle`, `.display_name` | the @ token | kept | none |
| `mentions[].member_id` | the @ link to `/profile/?id=` | dropped | @mentions show as plain text. 0 comments have any |
| `author.name`, `.subscription_tier`, `.is_charter`, `.is_gifted` | name, initials, Underwriter badge | kept | none |
| `author.member_id` | nothing | dropped | none |
| `is_own` | "You", Edit and Delete, progress bar; hides the nomination panel on your own comment | kept | none |
| the three tiers | badges, contrast strip, tier bar, filter, sort, Breach variant | kept | an engine Breach with a self-declared override shows the notice. 0 rows |
| `specificity_score` | specificity dots | kept; null on Breach | none |
| `commenter_message`, `claim_text`, `strength`, `emotion`, `article_engagement`, `borderline_flag`, `borderline_other_tier` | nothing in the feed; the compose screen shows them from its own POST response | dropped | none |
| `opposing_view_engaged`, `tribal_markers`, `tribal_example`, `comment_id`, `published_at` | nothing in the theme | dropped | none |
| `nominations.total`, `.tallies` | the "N nominations" chip | kept | none |
| `nominations.viewer_nomination` | the receipt: your tier, reason and note | always null | a member who nominated sees an empty form; resubmitting replaces the old one. 0 nominations |

`viewer` is unverified, and it unlocked two things. `viewer_nomination` returned the named member's
private note to anyone holding their id: gone. `is_own` stays a boolean. It tells a caller only
whether the id they sent wrote a comment whose author's name is already on the card, `anon` reads
`comments.member_id` anyway, and it authorizes nothing: `PATCH` and `DELETE /api/comment/:id` check
ownership themselves, against the same unverifiable id. That is the credential chain, which this
hotfix leaves alone. Dropping `is_own` would take "You", Edit and Delete from real members and put
the nomination panel on their own comments, where `nominate.js` answers 403.

## What visibly changes

**Under A.** The 3 existing comments look the same. A comment posted afterwards shows to its author
until they reload, and to nobody else until its `status` is `published`. Nothing sets that: the
deployed API has no status write for comments (read), and there is no trigger on `comments` and no
cron schema (measured), so it is done by hand with the SQL under Steps. The same wait keeps a comment posted under someone else's id
off the page. The upload paths, avatar (`shell.js` on every page, `home.js` on the profile), field
note and book cover (profile) and article photo (`/write/`, `editor.js`), show the paused message;
the editor shows it as `503: {...}`. Existing images stay: 3 of 11 real profiles reference one.
Edge case: editing your own published comment inside its first hour, after a reload, drops its
mentions, because `PATCH` discards a mention without a `member_id`.

**Under B.** Every article page shows "Could not load comments: Failed to fetch" (wording varies by
browser) over "The conversation hasn't started yet", and the 3 comments disappear. Posting still
stores and classifies a comment nobody sees. The upload paths fail with the browser's network error.

## What this does not close

- **Member ids stay public.** `anon` reads `comments.member_id`, `comments.mentions` (each entry
  carries one) and `articles.author_member_id`, and `/api/article/[id]` prints each author's id into
  the byline link. `convener-05` holds the revoke, and `comments.mentions` is missing from its list.
- **Breach bodies stay public in the database.** `anon` holds column SELECT on `comments.body` under
  "Published comments are publicly readable", and `comment_tiers(uuid[])`, SECURITY DEFINER and
  executable by `anon`, returns every comment's tier. A published Breach body is one REST read away,
  whatever this route sends. That fix is a policy, and belongs with the tier-read work. 0 Breach rows today.
- **`dialecta-next` renders any comment that is not `suppressed`**, pending and Breach included, as
  an OG image at `/comment/<id>/opengraph-image` (`_recovered-next/lib/get-comment.js`; read, not
  probed). The narrowed feed stops handing out hidden comments' ids, and still hands out published
  Breach ids.
- **At least 43 production builds of this API are still READY**, the serving one included, from
  2026-05-01 to 2026-05-08 UTC, each at its own `*.vercel.app` URL with its own copy of both
  handlers (`list_deployments`; the listing runs past its first 50 entries). Promoting a deployment
  moves only the aliases. Whether a stranger can reach them is set in
  Settings, Deployment Protection, which this seat cannot read. Standard Protection closes all of
  them and leaves `dialecta.vercel.app` public, and no API function calls itself through a generated
  URL, so it breaks nothing.
- **The credential chain.** `/api/comment` and `/api/comment/[id]` still accept any `member_uuid`.

## The recovered tree reproduces production

Every file under `_recovered/` hashed against the uid `list_deployment_files` reports for
`dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`: **161 of 161 match, 0 mismatch, 0 missing.** Two local files,
`api/admin/feedback/[id].js` and `api/comment/[id]/nominate.js`, sit below the listing's depth
limit and are unverified by this method. A deploy from a copy with the two files swapped in changes
those two source files and nothing else. `verify-tree.mjs` re-runs the check against
`deployed-uids.json`.

Same source is not the same build. A rebuild bundles all 38 functions again with today's Production
environment values (the May deployment keeps its own), whatever Node major `"engines": ">=18.x"`
resolves to now (24.x by Vercel's table; the May build log is unread here), and the pinned lockfile.
On Hobby, Vercel refuses it outright: 38 functions against Hobby's limit of 12, and the hourly digest
cron against Hobby's once a day. The May deployment needed Pro; `get_team` returns 403 to this seat,
so the plan is yours to read.

## Options

| | What | Costs | Undo |
| --- | --- | --- | --- |
| **A** | Deploy both files from a copy of the recovered tree | Pro only. A hand deploy. Rebuilds 38 functions on today's environment. New comments wait for a manual publish | `vercel promote dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`, instant |
| **B** | Two firewall rules denying the two paths | The comments section reads as broken on every article, and uploads fail. Whether a percent-encoded path slips past a path rule is untested. Any plan, no build, live within a second | disable both rules |
| **C** | Wait for the cutover | The 3 messages, 2 claims and classifier rows stay public; each new comment adds to them; the first Breach, pending or suppressed row publishes its text; and the upload route stays an open image host on Ghost's CDN under Dialecta's name | nothing to undo |

## Recommendation

**B now, for both routes, plus a look at Deployment Protection.** It closes both routes on either
plan, builds nothing, and one command undoes it. **Then A, if the team is on Pro and you want the
comments back before the cutover.** After A, disable the comments rule and keep the upload rule
until the cutover.

On A and my standing position (`positions/nextjs-rebuild.md` §8, deploy from git, always): the
position exists because a `cli` deployment records whatever the local checkout claimed, so nobody
can reproduce it. A is still a `cli` deployment. It meets the reason, though not the letter, only if
all four hold: both files are pushed first; the deploy folder is a copy of that clean, pushed tree;
`verify-tree.mjs` passes on the folder before the deploy; and afterwards the new deployment's file
list matches the folder. The legacy API has no git path to deploy from, and every build it has had
was made by hand; this would be the first whose source is in a repository. Skip any of the four and
A becomes what the position forbids, and I recommend against it.

## Steps

**B.** First, in the dashboard: project `dialecta`, Settings, Deployment Protection. If it is off,
or reads Pre-Production Deployments, set Standard Protection with Vercel Authentication (free on
Hobby). Then:

```
# MACHINE: STUDIO-PC (Dan's desktop), any folder   SHELL: Git Bash   PUSHED: n/a, no repository code involved
export VERCEL_ORG_ID=team_mflrdhbcpv10z1RtMO6QZSaU
export VERCEL_PROJECT_ID=prj_ngCEgluQjeA7SK0DMuy92WDVv1cG
npx vercel@latest login
npx vercel@latest firewall rules list
npx vercel@latest firewall rules add hotfix-2026-09-21-comments-feed --condition '{"type":"path","op":"pre","value":"/api/comments"}' --action deny --description "council/security/hotfix-2026-09-21-api-comments" --yes
npx vercel@latest firewall rules add hotfix-2026-09-21-upload-image --condition '{"type":"path","op":"pre","value":"/api/article/upload-image"}' --action deny --description "council/security/hotfix-2026-09-21-api-comments" --yes
npx vercel@latest firewall diff
npx vercel@latest firewall publish --yes
```

Git Bash because Windows PowerShell 5.1 strips the double quotes out of the JSON conditions. `pre`
matches the path's start, so `/api/comments.js` and a trailing slash are caught; `/api/comment`,
which posts comments, is not. Hobby allows 3 custom rules; if `rules list` leaves one slot, make one
rule with `--or` between the two conditions. Check: open an article; its byline still shows the
author, which proves the rest of the API answers, and the comments section shows the error line.

Undo B:

```
# MACHINE: STUDIO-PC   SHELL: Git Bash   PUSHED: n/a
export VERCEL_ORG_ID=team_mflrdhbcpv10z1RtMO6QZSaU
export VERCEL_PROJECT_ID=prj_ngCEgluQjeA7SK0DMuy92WDVv1cG
npx vercel@latest firewall rules disable hotfix-2026-09-21-comments-feed --yes
npx vercel@latest firewall rules disable hotfix-2026-09-21-upload-image --yes
npx vercel@latest firewall publish --yes
```

**A.** Three checks first. Team Settings, Billing, must say Pro; on Hobby, stop. Project Settings,
Environment Variables, Production: nothing the API reads (at least `SUPABASE_URL`,
`SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, the Ghost Admin key) changed after 2026-05-08, or you
know what it now points at. And `npx vercel@latest inspect dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7 --logs`
names the May Node version, to compare with the new build's log.

```
# MACHINE: STUDIO-PC, C:\Dialecta   SHELL: Git Bash   PUSHED: checked here; stop unless status and diff print nothing and log prints the hotfix commit
cd /c/Dialecta
git fetch origin
git status --porcelain _recovered council/security/hotfix-2026-09-21-api-comments
git diff --stat origin/main _recovered council/security/hotfix-2026-09-21-api-comments
git log --oneline -1 origin/main council/security/hotfix-2026-09-21-api-comments
H=council/security/hotfix-2026-09-21-api-comments
STAGE=/tmp/dialecta-api-hotfix
rm -rf "$STAGE"
cp -r _recovered "$STAGE"
cp "$H/comments.js" "$STAGE/api/comments.js"
cp "$H/upload-image.js" "$STAGE/api/article/upload-image.js"
node "$H/verify-tree.mjs" --dir "$STAGE" --manifest "$H/deployed-uids.json" --expect "api/comments.js=$H/comments.js" --expect "api/article/upload-image.js=$H/upload-image.js"
```

It must end `"result": "PASS"` with 159 matched and both expected changes true. Then, in the same
session:

```
# MACHINE: STUDIO-PC, /tmp/dialecta-api-hotfix   SHELL: Git Bash, same session   PUSHED: verified in the block above
export VERCEL_ORG_ID=team_mflrdhbcpv10z1RtMO6QZSaU
export VERCEL_PROJECT_ID=prj_ngCEgluQjeA7SK0DMuy92WDVv1cG
SHA=$(git -C /c/Dialecta rev-parse origin/main)
cd "$STAGE"
URL=$(npx vercel@latest deploy --prod --skip-domain --logs --meta hotfixCommit="$SHA")
echo "$URL"
```

`--skip-domain` builds with Production settings and leaves the aliases on the May deployment. In a
browser signed in to Vercel, open `$URL/api/comments?article_id=<data-post-id of an article with
comments>`: the comments appear, and a find for `member_id`, `commenter_message` or `claim_text`
finds nothing. Then:

```
# MACHINE: STUDIO-PC   SHELL: Git Bash, same session   PUSHED: verified above
npx vercel@latest promote "$URL"
npx vercel@latest firewall rules disable hotfix-2026-09-21-comments-feed --yes
npx vercel@latest firewall publish --yes
```

Send the new deployment id to `security`, which lists its files and runs `verify-tree.mjs` against
the stage folder. To publish a comment by hand once you have read it:

```
/* MACHINE: STUDIO-PC, browser, Supabase SQL editor, project mguulnibvzusfvyuowwh   SHELL: SQL   PUSHED: n/a */
update public.comments set status = 'published', published_at = now() where id = '<comment id>';
```

Undo A:

```
# MACHINE: STUDIO-PC   SHELL: Git Bash   PUSHED: n/a
export VERCEL_ORG_ID=team_mflrdhbcpv10z1RtMO6QZSaU
export VERCEL_PROJECT_ID=prj_ngCEgluQjeA7SK0DMuy92WDVv1cG
npx vercel@latest promote dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7
npx vercel@latest firewall rules enable hotfix-2026-09-21-comments-feed --yes
npx vercel@latest firewall publish --yes
```

Re-promoting `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7` restores today's deployment exactly: its build, its
environment snapshot, its crons. The last two lines put B's closure back; leave them out to return
to today, leak included.

**Tests.**

```
# MACHINE: STUDIO-PC, C:\Dialecta   SHELL: Git Bash   PUSHED: n/a, local only
node --test council/security/hotfix-2026-09-21-api-comments/comments.test.mjs council/security/hotfix-2026-09-21-api-comments/upload-image.test.mjs
```

20 of 20 pass. Pointed at the deployed originals, the same tests fail 17 of 20; the 3 that pass
cover behaviour kept on purpose.

## The read-only role (`legal-02`)

Not by revoking columns. `supabase_read_only_user` is a member of `pg_read_all_data` and has
BYPASSRLS (measured 2026-09-21). Postgres grants that role SELECT on every table "as if" it held the
right, so a column REVOKE changes nothing, and BYPASSRLS means no policy applies either. Denying
`auth.users` and `comments.member_email` takes a different role: BYPASSRLS so counts stay honest, no
`pg_read_all_data`, SELECT on the non-personal columns only, no USAGE on schema `auth`. Every sweep
that reads catalogues, grants, policies and row counts keeps working (`count(*)` needs SELECT on any
one column), and the ones that read personal values stop, which is the purpose. Two limits. The
membership on `supabase_read_only_user` is granted by the platform, and whether the project's
`postgres` role can revoke it is untested and may be undone by Supabase. And the hosted connector's
read-only mode runs as that role, so AI sessions narrow only if they move to a connection string for
the new role.
