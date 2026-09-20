# The comment endpoint's credential is published by the database

**Source:** This agent, 2026-09-20, joining three readings: the docblock of `api/comment.js` in
deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`, the live RLS policy on `public.profiles`, and a
shape census of `profiles.ghost_member_id`. Nothing was posted to the endpoint.

## The three readings

**What the endpoint says it does.** The deployed `api/comment.js` opens with a docblock stating
its own auth model. Quoting it: "The endpoint receives member_uuid (Ghost's session-derived UUID)
and looks up the corresponding profiles row by ghost_member_id." It continues: "member_id and
member_name on the comment are taken from the profile, not the request, so a caller cannot spoof
identity." The POST body it documents is `member_uuid`, `member_email`, `article_id`,
`article_slug`, `article_title`, `body`, and two optional fields.

**What the database publishes.** Policy `profiles_select` is `FOR SELECT TO public USING (true)`.
There are no column privileges narrowing it, and `anon` holds SELECT on the table. Every column of
every row in `profiles` is readable with the publishable key, and `ghost_member_id` is one of the
41 columns.

**Whether the two values are the same value.** `profiles` holds 14 rows. All 14 carry a
`ghost_member_id`. Eight of those match the UUID v4 shape that Ghost's `{{@member.uuid}}` emits.
Three match Ghost's 24 character ObjectId shape, and three are seed values of the form `seed:name`.

## What that composes to

The value the endpoint accepts as proof of identity is a value the database hands to anyone who
asks. For the eight profiles whose `ghost_member_id` is UUID shaped, a caller can read the
credential and then present it.

The docblock's stated defense does not reach this. Taking `member_id` and `member_name` from the
profile rather than the request prevents a caller from claiming a different identity than the one
the `member_uuid` resolves to. It assumes the `member_uuid` was proof. If the `member_uuid` is
public, the resolution is faithful and the attribution is still wrong.

`_cors.js` does not close it either. Its allowlist governs browser cross origin reads. A request
made with `curl`, from a server, or with no `Origin` header at all never consults it.

## What is not established

The handler body is unread. The Vercel MCP file reader truncates every result at roughly two
thousand characters and `api/comment.js` is around 23 KB, so what is quoted above is the docblock
and not the code under it. A check the docblock does not mention could exist: a Ghost session
cookie verified through `_ghost-admin.js`, a shared secret header, or a signature.

Two things argue against that. The docblock is detailed enough to enumerate the POST body field by
field and to explain why `member_email` is accepted from the request, which is not the shape of a
document that omits an authentication step. And the same file in the repository at `9238a9c` takes
`author_id` directly from `req.body` with no verification at all, behind nothing but `applyCors`
and a method check, so the endpoint's history is of auth being added rather than present.

Reading the handler settles it. That needs the deployment source pulled with a Vercel token, which
needs Dan's account.

## Blast radius if it holds

Posting a comment attributed to any of the eight members. Each post also runs a classification
through `/api/classify`, which the treasurer prices at roughly $0.002, so the same call is a spend
path as well as an attribution path.

Two things bound it. Comments insert with `status = 'pending_review'` per the docblock, and the
read policy on `comments` is `USING (status = 'published')`, so an injected comment is not publicly
visible until something promotes it. The corpus is affected before the public page is. That is the
difference between this and a defacement, and it is why this ranks high rather than critical.

The platform sells its judgment on that corpus. A row anyone can create is a row anyone can use to
move a contributor's axis scores, which is the failure the mandate names as data integrity being a
security property.

## Implies for Dialecta

- This is the reading the brief asked for first, and the answer is that the endpoint's credential
  model cannot be evaluated without the handler. Pulling the deployed source is now a prerequisite
  for two separate items, this one and the provenance finding in
  `2026-vercel-deployed-api-provenance.md`. It is one action that unblocks both.
- Do not test this against production. A POST would create a `comments` row and spend a
  classification, which is the exact shape of the 2026-09-20 probe that created a `profiles` row.
  If Dan wants it settled empirically rather than by reading, the honest version is a POST with a
  `member_uuid` belonging to a profile Dan controls, to an article Dan controls, with the row
  deleted afterward, and he should agree to it first.
- `ghost_member_id` belongs in the column grant fix already owed on `profiles`. It was being
  treated as one more leaked column alongside `is_admin` and `subscription_tier`. It is not the
  same kind of column as those: they disclose, this one may authorize. Fix it first within that
  work.
- The eight UUID shaped rows are the exposed set. The three ObjectId shaped rows hold a different
  Ghost identifier and would not satisfy a `member_uuid` lookup, and the three seed rows are not
  real members. Scope any remediation check to the eight.
- Whatever the handler turns out to do, a session derived UUID stored in a world readable table is
  the wrong place for it. ADR-002 moves identity to Supabase Auth, which replaces this model
  rather than patching it. Until that lands, the column grant is the control.

*Filed 2026-09-20*
