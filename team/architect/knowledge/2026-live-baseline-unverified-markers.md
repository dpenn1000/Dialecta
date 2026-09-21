# The baseline's unverified markers, checked against live

**Source:** `supabase/migrations/20260920000000_baseline_live_schema.sql` (1,024 lines) against the
live Dialecta database (`mguulnibvzusfvyuowwh`), read-only through the Supabase MCP `execute_sql`,
2026-09-20.

**Status:** the migration is **confirmed unapplied**. `supabase_migrations.schema_migrations` has no
row for `20260920000000`; its newest entries are `20260921004527`, `20260921004459` and
`20260921004417`. So nothing below has reached the database, and all of it is still cheap.

## Counting the markers, with the method

`grep -c "LIVE UNVERIFIED"` returns **30** lines. Four of those (lines 24, 47, 123 and 935) are prose
describing the convention rather than markers on anything. **26 sit on a column, a constraint or a
policy.**

The brief and the mandate both say 27. I cannot reconcile the difference and I am not adopting
either number silently: my count is 26 by the rule "a marker is a line where the comment annotates a
definition". If the 27 came from a different rule, say counting the policy-predicate marker at line
822 plus something I classified as prose, both counts are right about different things. I did not
run git, so I could not check whether the file changed since the figure was written.

## Verified wrong: nine markers

Read from `pg_attribute`, `pg_attrdef`, `pg_constraint` and `pg_enum`.

| Line | The guess | Live | Severity |
| --- | --- | --- | --- |
| 479 | `opinion_map_positions.article_id uuid not null` | **text** | Breaks on contact with data |
| 504 | `comments.article_id uuid not null` | **text** | Breaks on contact with data |
| 429 | `articles.status` list `draft/declared/published/archived` | `draft/classified/published/reclassified` | Two of four values wrong |
| 438 | `articles.polish_level` default `'standard'` | `'light'` | Applies cleanly, silently wrong |
| 481 | `opinion_map_positions.map_type` list `cartesian/ternary` | adds **`binary`** | Missing value |
| 745 | `feed_events.event_type` "unconstrained live" | **has a 12-value CHECK** | See below |
| 914 | `feedback_items.type` default `'bug'` | `'idea'` | Silently wrong |
| 917 | `feedback_items.priority` default `'normal'` | `'medium'` | **`'normal'` is not in the live CHECK** |
| 918 | `feedback_items.status` default `'open'` | `'new'` | **`'open'` is not in the live CHECK** |

**The two `article_id` columns are the serious ones.** Live keys articles by Ghost id, which is
text. A `uuid` column cannot hold those values, so a database built from this baseline and then fed
live data fails on every insert. The file reasons carefully about `reader_id` on the very next line
and gets that one right (text, confirmed), which is what makes the `article_id` miss instructive:
the same paragraph of thought produced one correct inference and one wrong one, and nothing in the
file distinguishes them.

**Lines 917 and 918 are a different failure and a worse one in kind.** Both defaults are values the
live CHECK constraint forbids. The baseline declares no CHECK, so it would accept them, and the
divergence appears later as data that the real schema would have refused.

**Line 745 is a propagated error, not an original one.** The baseline says live leaves
`feed_events.event_type` as unconstrained text, and cites `migrator`'s `2026-live-schema-diff.md`,
which says "Live sidesteps the question by leaving event_type as unconstrained text". Live has
`feed_events_event_type_check` with all twelve spec values. `migrator` was reading `supabase/types.ts`
and said plainly in its own note that `types.ts` cannot show check constraints; the caveat was
correct and the conclusion drawn past it was not. The baseline then inherited the error by citing
the note rather than the database. **One seat's stated limitation became another seat's fact in one
hop.** That is the finding here, more than the constraint itself.

## Verified right: fourteen markers

Worth recording, because the file's caution was mostly justified and a note that only lists errors
misrepresents it.

`profiles.id` default `gen_random_uuid()` with no FK to `auth.users` (155). The four jsonb defaults
`'[]'::jsonb` (186, 187, 188, 627); the internal shapes remain unverified and need rows to settle.
`notifications.email_status` default `'pending'` (408). `opinion_map_positions.reader_id` text
(480). `stage` values `pre_read/post_read` (484). `classifications.specificity_score` CHECK 0 to 3
(544), which live has and the baseline omitted for want of confirmation. `archetypes.archetype_label`
default `'Pattern Still Forming'` (665), the upgraded guess, correct. `feed_events.visibility`
default `'public'` and values `public/followers` (750). `follows.follower_id` text (766).

Roughly one marker in three is wrong. That is the number worth carrying: the file's self-doubt was
well calibrated, and the markers are exactly where the errors are.

## A live bug the file suspected, now confirmed

Line 665 guesses that `initialise_contributor_axes()` writing `'forming'` into
`archetypes.archetype_id` "looks like a live bug". It is one, and the mechanism is definite.

`pg_get_functiondef` shows the body:

```sql
INSERT INTO public.archetypes (member_id, archetype_id, archetype_label)
VALUES (p_member_id, 'forming', 'Pattern Still Forming')
ON CONFLICT (member_id) DO NOTHING;
```

`archetype_id` is an enum whose members are `advocate|builder|contextualist|empiricist|illuminator|
reviser|skeptic|synthesizer`. **`forming` is not among them**; it belongs to the separate
`archetype_confidence` enum (`forming|emerging|established`). The insert therefore raises
`invalid input value for enum archetype_id`, and because the function is plpgsql with no exception
handler, the whole call aborts, rolling back the `axis_scores` insert above it as well.

**So `initialise_contributor_axes()` cannot complete.** Any onboarding path that calls it fails.

Corroboration, offered as corroboration rather than proof: live has 14 profiles, `axis_scores` rows
for **6** distinct members (36 rows, 6 axes each), and **3** `archetypes` rows. If the function had
always worked, those last two counts would match. The baseline's comment says the bug entered in
migration `20260502161725`'s rewrite, which would explain rows created before it succeeding. I did
not verify when it broke, only that it is broken now, by reading the definition against the enum.

## What this implies for Dialecta

- **Do not apply this migration.** Nine of its guesses are wrong and two are type errors that make
  the resulting database unable to hold live data.
- **The markers did their job and the fix is mechanical.** Every one of the 26 is now answerable
  from `pg_catalog` in four queries. Correcting the file is an afternoon, not a project, and it is
  cheapest while the migration is unapplied, which it still is.
- **`initialise_contributor_axes()` is broken in production and should be reported now**, separately
  from the baseline work, because it blocks onboarding and has nothing to do with whether the
  migration lands.
- **The citation chain is the process finding.** A note that states its own limitation can still
  have its conclusion quoted without the limitation. A claim about live schema gets re-read from
  `pg_catalog` even when a trusted note already asserts it.

## Implies for

Practice: "a schema claim is verified against `pg_catalog` at the point of use, even when a filed
note already asserts it." Practice: "never adopt another seat's count without re-deriving it or
naming the difference." Backlog P0-2. `migrator` owns the migration tree and should see the line-745
correction; `security` should see the broken function.

*Filed 2026-09-20*
