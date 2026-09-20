-- axis_scores: one row per member per axis, enforced.
--
-- Decision: exchange/open/2026-09-19-002-advice-migration-spec-deviations.md, item 6,
-- Dan's decision per the migrator session brief for 2026-09-20: adopt live's `id`
-- primary key as-is (do not change it to a composite key, which was the archived
-- September migration's own approach) and add this constraint beside it. This was
-- the fourth option on the table and the one taken.
--
-- What this does: makes a second row for the same member and axis impossible,
-- which is the same guarantee a composite primary key would give, without touching
-- live's existing `id` column or the rows already keyed by it. A single additive
-- statement, not a rebuild; see the constraint's own reasoning in the exchange
-- record's 2026-09-20 appendix.
--
-- Column name is `member_id`, matching the baseline this lands on
-- (20260920000000_baseline_live_schema.sql), not the archived repo's
-- `contributor_id`: the baseline adopts live's naming, and this migration lands on
-- top of it.
--
-- archetypes is NOT given the equivalent unique (member_id) here. The exchange
-- record flagged it as needing one line of confirmation first: whether the
-- archetype monitor should write history (backlog B-2 says it should), in which case
-- more than one archetype row per member over time is intended and this constraint
-- would be wrong for that table. No answer to that is on record as of 2026-09-20.

alter table public.axis_scores
  add constraint axis_scores_one_member_per_axis unique (member_id, axis);
