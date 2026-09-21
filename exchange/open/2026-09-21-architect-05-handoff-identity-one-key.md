---
id: 2026-09-21-architect-05
type: handoff
from: architect
to: [decider, migrator, security, builder]
subject: A person is keyed three ways and an article two; one decision fixes sixteen tables
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Measured on live, read only (`team/architect/checks/identity-columns.sql`, `table-hygiene.sql`;
`team/architect/knowledge/2026-live-schema-hygiene-census.md`).

- **A person, three keys.** Ghost member id as `text` in 18 referencing columns on 16 tables, 4 of
  them under a foreign key. Profile uuid in 6 columns and auth user uuid in 2, all 8 under one.
  `follows` (`follower_id`, `followee_id`) and `sparring_partners` (`member_a`, `member_b`) also hold
  person keys as text with no foreign key; the name pattern missed them.
- **The key has three shapes.** Of 14 `profiles.ghost_member_id` values: 3 are 24-character hex, 8
  are uuid-shaped, 3 are neither.
- **A policy already compares the wrong one.** `opinion_map_positions.opinion_map_self_read` compares
  `reader_id` with the JWT `sub`. All 9 rows hold values that match `profiles.ghost_member_id`; none
  matches an `auth.users` id. Under Supabase Auth (ADR-002), no signed-in reader can read their own
  rows through it.
- **An article, two keys.** `articles.id` (uuid) and `articles.ghost_post_id` (text). `comments.article_id`
  (3 of 3), `axis_events.article_id` (20 of 27, 7 null) and `opinion_map_positions.article_id` (9 of
  9) all hold Ghost post ids as text, with no foreign key. `comments` also copies `article_slug` and
  `article_title`, which match `articles` on all 3 rows today. `articles` carries two author keys,
  `author_member_id` and `author_profile_id`; all 5 rows agree and nothing enforces it.

## Not done

The decision, which is `decider`'s with Dan, since ADR-001 and ADR-002 frame it: key a person on
`profiles.id` and an article on `articles.id` everywhere, keep the Ghost ids as attributes on
`profiles` and `articles`, add the foreign keys, and move policies to `auth.uid()` through
`profiles.user_id`. Then `migrator` plans the column changes while rows are counted in dozens, and
`security` rules on each rewritten policy.

## Governing spec

`docs/decisions/` ADR-001 (leave Ghost) and ADR-002 (Supabase Auth).

## Acceptance

`team/architect/checks/identity-columns.sql` shows every person and article reference as a uuid
under a foreign key.

## Traps

- `profiles.user_id` is null on all 14 profiles, so any `auth.uid()` policy matches nothing until
  members claim their profiles (`2026-09-21-convener-03`).
- A backfill join on the Ghost id has to know which of the three shapes each row holds.
- Two keys for one fact (`author_member_id`, `author_profile_id`) agree today by construction only.

## Do not touch

`supabase/` and `apps/web/src/lib/articles.ts` are held by the articles builder session tonight.
