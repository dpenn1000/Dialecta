---
id: 2026-09-21-architect-07
type: handoff
from: architect
to: [migrator, builder]
subject: Classification rows carry no prompt version, and one free hygiene migration
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

- **Classifier provenance.** `packages/core/CLAUDE.md:10` says to store `CLASSIFIER_PROMPT_VERSION`
  with each classification row, and `packages/core/src/classification.ts:11-16` names the column,
  `classifications.prompt_version`. Live `classifications` has no such column and no model column,
  `apps/web/src/app/api/comment/route.ts` writes neither, and the baseline migration (line 559)
  records both as "required by backlog". The legacy production API and `apps/web` will both classify
  during the port, and nothing will tell their rows apart. 3 rows exist today.
- **A free hygiene set**, every item on a table of 17 rows or fewer, measured with
  `team/architect/checks/table-hygiene.sql` and `check-value-lists.sql`:
  - 12 foreign keys with no leading index (list in `team/architect/knowledge/2026-live-schema-hygiene-census.md`).
  - `tier_nominations.target_tier` is text under a CHECK that restates the `tier` enum. 0 rows.
  - `share_events.channel` accepts both `'x'` and `'twitter'`. 0 of 7 rows use either.
  - No `COMMENT ON TABLE` on `archetypes`, `articles`, `axis_scores`, `classifications`,
    `comments`, `profiles`.
  - 9 redundant indexes (`team/architect/checks/redundant-indexes.sql`). Three duplicate a unique
    index exactly: `archetypes.idx_archetypes_member`, `articles.idx_articles_ghost_post_id`,
    `quotes.idx_quotes_quote_id`. Six are the leading prefix of a composite: `idx_articles_status`,
    `idx_axis_scores_member`, `idx_follows_follower`, `idx_opinion_map_reader`, `idx_sparring_a`,
    `idx_tier_nominations_comment_id`. The advisors reported none of them.

## Not done

The migrations (`migrator`): `classifications.prompt_version text` and `model text`, both nullable
so legacy rows read as legacy; the 12 indexes; `target_tier` retyped to `public.tier` with its CHECK
dropped; one channel spelling dropped; the six table comments, taken from the spec entities. The
write (`builder`): `route.ts` stores `CLASSIFIER_PROMPT_VERSION` and its model constant on every
classification.

## Governing spec

`packages/core/CLAUDE.md`, the prompt-version rule.

## Acceptance

`classifications` has both columns and new rows carry values; `checks/table-hygiene.sql` shows 0
foreign keys without a leading index and 6 new table comments; `checks/check-value-lists.sql` no
longer lists `tier_nominations_target_tier_check`.

## Traps

- Leave legacy rows null. A backfilled guess is worse than an honest null.
- `apps/web/src/lib/classify.ts:17` hardcodes the model id; store the one actually used.

## Do not touch

`supabase/` is held tonight. Coordinate through the convener.
