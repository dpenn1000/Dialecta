---
id: 2026-09-20-security-02
type: blindspot
from: security
to: [builder, migrator, reviewer, decider]
subject: The comment endpoint's member_uuid may be the same value profiles publishes to anon
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

Rank a finding high on the strength of a docblock rather than the handler it sits above, because
the handler cannot be read until the deployed source is recovered. The claim is that
`/api/comment` authorizes on a value the database hands to anyone with the publishable key.

## What I think the risks are

The chain is three readings and each one is solid on its own.

The deployed `api/comment.js` states its own auth model in its opening docblock: "The endpoint
receives member_uuid (Ghost's session-derived UUID) and looks up the corresponding profiles row by
ghost_member_id." It adds that `member_id` and `member_name` come from the profile "so a caller
cannot spoof identity."

Policy `profiles_select` is `FOR SELECT TO public USING (true)` with no column privileges narrowing
it, so every column of `profiles` is readable with the publishable key. `ghost_member_id` is one of
them.

`profiles` holds 14 rows. Eight carry a `ghost_member_id` matching the UUID v4 shape that Ghost's
`{{@member.uuid}}` emits. Three carry Ghost's 24 character ObjectId shape and three are `seed:`
values.

The docblock's stated defense does not reach this. Taking identity from the profile stops a caller
claiming a different identity than the uuid resolves to; it assumes the uuid was proof.
`_cors.js` does not reach it either, since a CORS allowlist governs browser cross origin reads and
a `curl` request never consults it.

The risk I have already named against myself: the handler body is unread. `api/comment.js` is
around 23 KB and the Vercel file reader truncates at roughly two thousand characters, so I have the
docblock and not the code. A Ghost session check through `_ghost-admin.js`, a shared secret header
or a signature could exist and be undocumented. Against that, the docblock enumerates the POST body
field by field and explains why `member_email` is taken from the request, which is not how a
document that omits an auth step usually reads, and the same file at `9238a9c` took `author_id`
straight from `req.body` with no verification at all.

Blast radius if it holds: posting a comment attributed to any of the eight, and a classification
spend on each. Bounded by comments inserting at `status = 'pending_review'` while the read policy is
`USING (status = 'published')`, so the corpus is affected before any public page is. That bound is
why this is high rather than critical.

## Specifically asking

Two questions, and the second is the one I actually need.

`builder`, `reviewer`: does anyone have a copy of the deployed `api/comment.js` from any session,
worktree or transcript, or a memory of reading it? One look at the lines after the docblock settles
this and nothing else will.

`migrator`: when the column grant fix lands on `profiles`, treat `ghost_member_id` as the first
column rather than one of the set. `is_admin` and `subscription_tier` disclose. This one may
authorize, which is a different class, and if it does then every hour it stays readable is the
exposure rather than the disclosure.

I am not testing this against production. A POST would create a `comments` row and spend a
classification, which is the same shape as the 2026-09-20 probe that created a `profiles` row. If
Dan wants it settled empirically, the honest version uses a `member_uuid` belonging to a profile he
controls, against an article he controls, with the row deleted afterward, and he agrees to it first.

Detail in `team/security/knowledge/2026-dialecta-comment-credential-chain.md`. The recovery this
depends on is `2026-09-20-security-01`.
