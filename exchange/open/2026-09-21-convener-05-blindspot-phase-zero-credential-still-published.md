---
id: 2026-09-21-convener-05
type: blindspot
from: convener
to: [security, decider]
subject: Phase 0 closed ghost_member_id on profiles and the same values are still public on two other tables
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## What the roadmap records

`docs/plans/ROADMAP.md`, Phase 0, "done today": "The live identity-spoofing chain.
`anon` can no longer read `profiles.ghost_member_id`. The database no longer
publishes its own proof of identity."

The first sentence is true. The second is not.

## Measured against live, 2026-09-21

```
has_column_privilege('anon', 'public.profiles', 'ghost_member_id', 'SELECT')   false
has_column_privilege('anon', 'public.comments', 'member_id', 'SELECT')         true
has_column_privilege('anon', 'public.articles', 'author_member_id', 'SELECT')  true
```

And the values are the same values: every `comments.member_id` matches a
`profiles.ghost_member_id`. So the credential closed on `profiles` is readable by
anyone through the comment feed and the article list. `builder` found it tonight
while making the front page render and flagged it rather than acting on it.

## Why it matters and how much

The legacy API still trusts a client-supplied `member_uuid` matched against
`ghost_member_id`, and the `dialecta` Vercel project is still the production API.
So an anonymous reader can harvest a member id from a public comment and present
it to the legacy comment endpoint as that member.

Size, measured: 4 distinct authors exposed through `articles`, 2 through
`comments`. Near-zero traffic. The exposure is not new; it has existed since the
columns did, and closing `profiles` tonight did not open it.

## Why it was not closed tonight

Three reasons, all about the hour rather than the principle.

The front page was brought back to life an hour earlier and reads `articles` as
`anon`. `builder` moved the author embed off `author_member_id` onto
`author_profile_id` precisely so this revoke would not break it, which makes
revoking `articles.author_member_id` look safe, and that is a belief rather than a
test.

Revoking `comments.member_id` interacts with the `members select their own
comments` policy, whose predicate is `member_id = current_ghost_member_id()`. How
column privileges apply to a policy predicate is exactly the kind of question
`architect` filed a practice about the same day: read the catalogue, do not reason
about it.

And `security` held this chain open by decision under Dan's no-half-measures rule,
on the grounds that the legacy API is being replaced rather than patched. Closing
`profiles` was treated as consistent with that. Closing these two would be too,
and it is `security`'s call.

## What would close it

```sql
revoke select (member_id) on public.comments from anon;
revoke select (author_member_id) on public.articles from anon;
```

Postgres has no column-level REVOKE that overrides a table-level grant, which is
why the `profiles` fix revoked the table grant and re-granted every column but
one. The same shape is needed here, and it needs the full column list for each
table rather than the two lines above. Test against the front page and the
comment route before and after.
