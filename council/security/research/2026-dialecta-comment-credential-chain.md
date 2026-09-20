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

## Confirmed 2026-09-20, against the recovered source

The deployed source was pulled under record `2026-09-20-security-01` and sits at
`_recovered/api/comment.js`, 563 lines. `reviewer` read it end to end and answered record
`2026-09-20-security-02`. I read it again independently rather than take that on trust, and it
holds.

The resolution is a lookup, not a verification. Lines 185 to 189:

```js
const { data: profile, error: profileErr } = await supabase
  .from('profiles')
  .select('ghost_member_id, display_name, handle')
  .eq('ghost_member_id', member_uuid)
  .maybeSingle();
```

Its own comment reads "Step 1: verify the member has a Dialecta profile", which is what it does.
Nothing between that query and the insert establishes that the caller supplying `member_uuid` is
the session it claims to be. `requireCompleteProfile` in `_profile-validation.js` checks that the
row exists and that `display_name` is non-empty.

A grep of all 563 lines for `authorization`, `x-ghost`, `ghostAdmin`, `signature`, `verifyMember`,
`session`, `jwt` and `hmac` returns four hits and none of them is a check: the docblock's own claim
of a session on line 11, an error string on line 125, and the signature *font* for the celebration
modal on lines 519 and 527, which is a typeface. `_cors.js` permits an `Authorization` header in
`Access-Control-Allow-Headers` and nothing ever reads one.

The docblock describes the defense its author believed they had built. It is not the one in the
file.

**The precondition is lower than this note first assumed.** It does not need a signed up user. The
publishable key is public by design, `profiles_select` is `USING (true)`, so the whole sequence is a
public SELECT followed by a POST, by anyone, with no account on the attacker's side at all.

## Blast radius, and the one thing bounding it

Posting a comment attributed to any of the eight members. Each post also runs a classification
through `/api/classify`, which the treasurer prices at roughly $0.002, so the same call is a spend
path as well as an attribution path.

One thing bounds it, and it is a table default rather than a control. Comments insert with
`status = 'pending_review'`, confirmed in the recovered source where the insert sets no status and
takes the column default, and the read policy on `comments` is `USING (status = 'published')`. An
injected comment is therefore not publicly visible until something promotes it. The corpus is
affected before the public page is, which is the difference between this and a defacement.

That is the whole of the containment, and it is worth being precise about what it is. It is not a
check anyone wrote for this purpose. It is the default value of a column, holding because the
promotion pipeline does not exist yet. The docblock says promotion belongs to the Wait Window and
Stage 2.5 pipeline in Phase 2 of the Discourse Layer, "not this endpoint". **The day that pipeline
ships, this finding stops being bounded**, and nothing in the pipeline's own design would flag that,
because from its side it is promoting comments exactly as intended.

Rank it high rather than critical on the containment, and treat the containment as expiring on a
known date rather than as a property of the system.

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
