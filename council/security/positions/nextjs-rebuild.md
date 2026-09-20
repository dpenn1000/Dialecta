# Position: the Next.js rebuild

**Seat:** security. **Written:** 2026-09-20, ahead of the rebuild rather than during it.
**Status:** advisory. Nothing here is decided; Dan decides.

## The one thing this document is about

A rebuild is the only moment when the authorization model gets chosen instead of inherited. After
it, every change argues against a shape that already exists. Most of what follows costs hours now
and weeks later, and two items cannot be done later at all.

The rebuild starts from `supabase/migrations/20260919000000_foundation.sql` and
`20260919000100_articles_native.sql`, 13 tables and 30 policies. Those two files contain zero
`GRANT` and zero `REVOKE` statements. That is the finding this position is built on.

## 1. Where authorization lives

Two models have been tried here and both failed in a recorded way.

The legacy API put the service key in every handler and authorized in application code. Every
request ran with `bypassrls`, so a missing check was a total bypass, which is how a GET to
`/api/profile/[id]` created rows with no credentials.

The foundation migration does the opposite and makes RLS the control. Its write policies are pure
row ownership:

```sql
create policy "users update their own comments"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);
```

RLS is row level. It cannot say "this row, but not that column." So the policy above lets a
contributor run `update comments set final_tier = 'forum', status = 'published' where id = <their own>`
and it is permitted, because the row is theirs. The reviewer found this as blocker B2. The identical
shape sits on `articles` and on `aspirations.expires_at`, where an author extends their own 90 day
window.

**Recommendation: split by trust, and make the split a grant rather than a policy.**

| Class | Mechanism | Example |
| --- | --- | --- |
| Public read | anon key direct, RLS policy | published articles, public profile fields |
| User writes their own content | anon key, RLS policy **plus column grant** | `comments.body`, `profiles.bio` |
| Writes that carry trust | never reachable by the anon key at all. Server side, explicit check | `comments.final_tier`, `articles.status`, any admin flag |

The middle row is the one that does not exist today and is the highest leverage change in the
rebuild. Postgres can express what RLS cannot:

```sql
revoke all on public.comments from anon, authenticated;
grant select on public.comments to anon, authenticated;
grant insert (article_id, parent_id, body) on public.comments to authenticated;
grant update (body) on public.comments to authenticated;
```

`status`, `final_tier`, `published_at` and `hardened_at` are then unreachable by any policy,
because the grant never arrives. B2 stops being a policy bug and becomes impossible. The policy
text does not change.

Column privileges are additive and a column level revoke against a table level grant is a silent
no op, so the `revoke all` has to come first. That trap is already filed in
`team/reviewer/knowledge/2026-postgresql-column-privileges.md`.

**The columns to withhold, per table, from the current migration text:**

| Table | User may write | Never |
| --- | --- | --- |
| `profiles` | `display_name`, `bio`, `avatar_url`, `location` | `user_id`, `ghost_member_id`, `updated_at` |
| `comments` | `body`, and `article_id` and `parent_id` at insert | `status`, `final_tier`, `published_at`, `hardened_at`, `author_id` |
| `articles` | `title`, `key_claims` | `status`, `published_at`, `amend_until`, `author_id`, `slug`, `ghost_post_id`, and `body_html`, for the reason in section 5 |
| `aspirations` | `statement`, `reason`, `target_archetype`, `axis_commitments`, `visibility`, `research_consent` | `expires_at`, `status`, `declaration_snapshot_id`, `contributor_id`, `research_consent_at` |
| `opinion_positions` | `position`, `map_type` | `user_id`, `placed_at`, `delta_of` |

`research_consent` is deliberately in the left column and `research_consent_at` in the right. The
contributor owns the answer; the platform owns the record of when it was given.

## 2. Revoke the defaults in the first migration, not later

Measured on the live project 2026-09-20: all 30 tables in `public` grant SELECT, INSERT, UPDATE and
DELETE to both `anon` and `authenticated`, with no column narrowing anywhere. New tables inherit
this.

Supabase changelog 45329 states the default as "tables created in `public` receive `SELECT`,
`INSERT`, `UPDATE`, and `DELETE` privileges for `anon`, `authenticated`, and `service_role` by
default", and records that it is being withdrawn: a checkbox at project creation from 2026-04-28,
and unchecked as the default for new projects from 2026-05-30. `mguulnibvzusfvyuowwh` predates
both. It is an existing project carrying the old behaviour, so nothing about that schedule helps it
and a new table created in it still arrives open.

So the rebuild's first migration ends with a default privilege change, or every table added after it
arrives open again:

```sql
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
```

`for role postgres` is not optional and is the part that gets dropped. Without it the statement
applies only to the role that runs it, so a migration executed as anything other than the role that
will later create the tables silently does nothing. Supabase's own checkbox issues it with the role
named, which is the form to copy.

Ordering matters and is not negotiable. The revoke has to land before or with the migration that
adds write policies. Doing it afterwards leaves a window where the policies are live and the grants
are open, and that window is the whole of B2 reachable in production.

## 3. `profiles` does not survive in its current shape

The rebuilt `profiles` is already much better than the live one: 8 columns keyed on
`auth.users(id)`, against 41 columns keyed on a Ghost id. Most of what leaks today is simply gone.

Two things carry over and should not.

**`ghost_member_id` is still there and still world readable.** The policy is
`profiles are public to read ... using (true)`. That column is the same value
`api/comment.js` treats as proof of identity, which is the open finding in
`2026-dialecta-comment-credential-chain.md` and record `2026-09-20-security-02`. Keeping it in the
rebuild carries the finding forward into code that has no reason to need it.

It exists for the member import. Recommendation: keep it for the import, never grant SELECT on it,
and drop the column in the migration that closes P0-6. After ADR-002 the identity is `auth.uid()`
and the Ghost UUID is dead weight. Dropping it deletes the finding rather than mitigating it.

**`using (true)` on a whole table is a habit worth breaking here.** Even at 8 columns, a public read
policy on the base table means every column added later is public by default, and someone will add
one. A `public_profiles` view carrying the four public columns, with SELECT granted on the view and
revoked on the table, inverts that: a new column is private until someone publishes it. Supabase
supports this and the view should be `security_invoker`, which the live project already does
correctly for `profile_effective_capabilities`.

## 4. Data minimisation is a schema decision and this is when it is made

The live `profiles` carries `order_negotiation_log`, `pact_signed_name`, `field_notes`,
`mind_changes`, `wrestling_with` and `influences`. The rebuilt one carries none of them, which is
the right instinct. The recommendation is to keep that instinct deliberate as columns get added
back, because they will be.

Minimisation and retention limits are statutory duties rather than good practice, under both
Conn. Gen. Stat. 42-520(a)(1) and GDPR Art. 5(1)(c) and (e). Two specifics:

- **Write a retention number for fingerprint inputs before launch.** `axis_events` is append only by
  mandate, so it grows forever by design. "Forever" is a retention decision whether or not anyone
  makes it deliberately. The data set is 14 profiles today, which is the cheapest it will ever be
  to decide.
- **`aspirations.research_consent` is a consent record and should be treated as one.** Consent that
  cannot be withdrawn is not consent. Whatever the rebuild does with it needs a withdrawal path,
  and the `null = not yet asked` encoding in the current column is good because it distinguishes
  three states rather than two.

One question is not mine and goes to `legal`: whether a Thinking Fingerprint is "sensitive data"
under the amended CTDPA. It matters more than it looks. The 2026 amendment added triggers with no
consumer floor at all, one of which is any processing of sensitive data, so the answer decides
whether the act reaches Dialecta at 14 members rather than at 35,000.

## 5. Blocker B1 must not survive the rebuild

`apps/web/src/app/articles/[slug]/page.tsx:41` today is:

```tsx
<article dangerouslySetInnerHTML={{ __html: article.body_html }} />
```

There is no sanitizer anywhere in the repository, and the articles write policy lets any signed up
user set `body_html` and `status`. That is one user away from script running in every reader's
browser.

**The sanitizer cannot live in the editor.** `apps/web/CLAUDE.md` lists the Tiptap editor as a
client island and says it "writes `body_json` and `body_html` together". A client island writes with
the publishable key. Anything it does to the HTML on the way out is a formatting convenience, not a
control, because the same key can address PostgREST directly and skip the editor entirely. A
sanitizer in the island is a sanitizer an attacker chooses not to call.

That is why `body_html` sits in the "never" column of section 1's grant table. The write goes
through a Server Action that sanitizes and writes server side. The editor island keeps its
`body_json`, the server derives `body_html`, and the anon key never has UPDATE on that column.

Three further layers, each failing differently:

1. **Sanitize at write**, in that Server Action. Tiptap produces its own HTML from a known node set,
   so the allowlist can be narrow.
2. **Sanitize at read**, before render. Write time sanitisation protects rows written after it ships
   and says nothing about rows already there, including any written during the rebuild.
3. **Content Security Policy.** With a policy that blocks inline script, the same injection is a
   broken image rather than a stolen session.

The column grant is the cheapest of the four, because `status` never being writable means an
injected article cannot publish itself even if every other layer is missed.

**The `article-media` bucket is the same failure class through a different door.** The migration
creates it as:

```sql
insert into storage.buckets (id, name, public)
values ('article-media', 'article-media', true)
```

No `file_size_limit` and no `allowed_mime_types`. The live `feedback-screenshots` bucket sets both,
5,242,880 bytes and five image types, so the rebuild is starting less restricted than what already
exists. The migration's own comment says signed upload URLs issued by a Server Action come later,
which is the right design and also the moment the gap becomes reachable.

An SVG is an image by MIME type and a script container by specification. Uploaded to a public
bucket it is served from the Supabase origin with that content type, and it executes. Set both
limits at bucket creation, allow the same five types `feedback-screenshots` allows, and do not add
`image/svg+xml`. The bucket is empty today, which makes this a one line change now and a migration
plus a re-scan of existing objects later.

One question this raises that is builder's rather than mine. If comments can be inserted directly
through PostgREST with the publishable key, what triggers classification? A comment that reaches
the table without passing the classifier is a comment that skipped the platform's core mechanism,
and the answer determines whether `comments.body` belongs in the left column of that table or the
right.

## 6. The AI endpoints move too, and they should not move as they are

Seven deployed routes call Anthropic. When they become Route Handlers, four things travel with them:

- **Constrain the output, do not harden the prompt.** `output_config.format` with an `enum` schema
  means a manipulated comment cannot select an untrusted tier, by construction rather than by
  validation. A comment is untrusted text whose classification sets a visible label, so grade
  manipulation is the realistic attack here rather than data exfiltration.
- **Cap input length.** It is the cheapest cost control and there is no ceiling today.
- **Rate limit the unauthenticated routes.** Vercel Hobby includes one free rate limit rule, which
  is enough for the classification path.
- **Isolate the Anthropic key in its own workspace with a spend limit.** There is no per key budget,
  and Vercel has no Spend Management at any price on Hobby, so the ceiling has to come from the
  Anthropic side.

## 7. Gates, so this holds after the rebuild ships

The measurement in section 2 took four catalog queries. A test can assert the same thing on every
commit, and negatives are what to assert:

In pgTAP, under `supabase/tests/database/`:

```sql
select throws_ok($$ select ghost_member_id from public.profiles $$);
select is_empty($$ update public.comments set final_tier = 'forum' $$);
```

`supabase/tests/database/` does not exist yet. Creating it during the rebuild is the difference
between today's findings being fixed and being fixed permanently. Alongside it: gitleaks in CI,
Dependabot (`.github/dependabot.yml` does not exist), and CodeQL, which is a checkbox on a public
repository. `ci.yml` currently runs no lint and no static analysis of any kind.

## 8. Deploy from git, always

The production API today exists only inside a Vercel artifact, because someone deployed it from a
workstation and the recorded commit was never pushed. Four and a half months of changes are in no
repository as a result.

The rebuild must never be deployed by hand, not once, not to fix something urgently at night. A
deployment whose source is `cli` records whatever the local checkout claimed and is not reproducible
by anyone. This is the one recommendation here that is purely process, and it is also the one whose
absence cost the most.

Related and immediate: recovering the current API's source is a prerequisite for P0-3 rather than a
follow up, because a successful build from `Dialecta` takes the alias and the old deployment stops
serving. Record `2026-09-20-security-01`.

## 9. Smaller items, each cheap at design time

None of these is a blocker. All of them are a paragraph now and a migration later.

- **`profiles.avatar_url` is a URL the contributor controls.** Rendered in an `img` tag that is
  mostly harmless. Fetched server side, for resizing or for an OG image, it is a request to an
  address an attacker chose, which reaches the platform's own network position. The legacy API has
  `api/profile/cover-search.js`, so remote image fetching is already a pattern here. Decide now
  whether avatars are uploaded or linked. Uploaded removes the question.
- **Allowlist the OAuth redirect target.** Supabase honours `redirect_to` on the auth callback, and
  an unrestricted one is an open redirect that makes a phishing link start on the real domain. The
  allowlist is configured in the Supabase dashboard, not in this repository, so it is invisible to
  code review and needs to be on a checklist instead.
- **Rate limit the auth routes, not only the AI ones.** Sign in, sign up and password reset are the
  three endpoints an attacker finds first. Supabase applies its own limits, so the question is
  whether they are the ones wanted rather than whether any exist.
- **Decide what a failed sign in says.** Distinguishing "no such account" from "wrong password"
  turns the login form into a membership oracle, and Dialecta's membership is small enough that
  confirming one name is worth something. The same applies to password reset, which should answer
  identically whether or not the address exists.
- **Keep contributor data out of logs.** Vercel captures function logs and a thrown Supabase error
  can carry row contents in its message. `apps/web/src/lib/articles.ts` currently does
  `throw new Error(\`articles query failed: ${error.message}\`)`, which is fine for a query error and
  worth a second look once the same pattern wraps a write that includes user input.

## 10. Framework specifics, in verification

Held back rather than written from memory, because this seat's first practice is to cite what was
read. Six items are being checked against primary sources and will be filed as notes in
`council/security/research/` before they appear here as recommendations:

- Whether middleware can be relied on as an authorization boundary in Next.js 15.5.25, and the
  version range of the middleware bypass advisory I believe exists. If it holds, the conclusion is
  that auth checks belong in the data access layer and middleware refreshes sessions only.
- Server Actions as public HTTP endpoints, and what Next.js's own guidance says about each one
  needing its own check regardless of which component imports it.
- The `server-only` package and the React taint API. `apps/web/src/lib/articles.ts` says
  "Server-only" in a comment today, which is documentation rather than a build error.
- The current official CSP recipe with a nonce, and its cost: a nonce forces dynamic rendering,
  which is a real tradeoff against a mostly static publication.
- `getClaims()` against `getSession()` against `getUser()` in `@supabase/ssr` server side, and which
  of them actually verifies the JWT rather than trusting a cookie.
- Whether a `security_invoker` view is Supabase's own recommended shape for the public profile
  projection in section 3, and the traps in it.

## 11. What I need decided

| Question | Why it blocks | Who |
| --- | --- | --- |
| P0-D2, the login methods | Everything in section 1's right hand column depends on there being an identity to check | Dan, with the council |
| Whether `ghost_member_id` can be dropped after P0-6 | Decides whether section 3 is a fix or a mitigation | builder, migrator |
| Retention number for `axis_events` and fingerprint inputs | Cheapest to set before the table grows | Dan |
| Whether the fingerprint is sensitive data under the CTDPA | Decides whether the act applies at 14 members | `legal` |

*Framework specific recommendations continue in section 10, filed separately once verified.*
