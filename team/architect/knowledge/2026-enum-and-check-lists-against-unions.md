# Ten enums, twenty CHECK lists, and five restated by hand

**Source:** live project `mguulnibvzusfvyuowwh`, read only, 2026-09-21: `pg_enum` for enum labels,
`pg_constraint` for CHECK definitions, `public.share_events` for one count. `supabase/types.ts:1404-1434`
and `:1558-1600` (generated from live). `packages/core/src/tiers.ts:24`,
`packages/core/src/archetypes.ts:6-22`, `packages/core/src/classification.ts:19,20,38`. `migrator`'s
`2026-postgresql-enum-evolution.md` for what `ALTER TYPE` can and cannot do.

**Lead state:** files leads 9 and 13. Lead 13 said "at least fourteen" CHECK lists; the catalog says
twenty, by the method below.

## What live holds

**Ten enums**, from `pg_enum`: `archetype_confidence` (3 labels), `archetype_id` (8), `article_engagement_level`
(2), `axis` (6), `comment_status` (3), `emotion_level` (3), `fp_snapshot_reason` (5), `opposing_view_level`
(3), `polish_level_enum` (4), `tier` (7).

**Twenty CHECK constraints carrying a value list, on eleven tables.** Method: `pg_constraint` rows with
`contype = 'c'` in `public` whose `pg_get_constraintdef` contains `ANY (ARRAY[` or ` IN (`. By table:
`articles` 2, `aspirations` 1, `celebration_events` 1, `feed_events` 2, `feedback_items` 3,
`notifications` 3, `opinion_map_positions` 2, `profiles` 1, `quotes` 1, `share_events` 2,
`tier_nominations` 2. Replayable as `team/architect/checks/check-value-lists.sql`.

## Which of them the code can derive

| Kind | Count | In generated types | Where the code can read it |
| --- | --- | --- | --- |
| Enum | 10 | Yes: a union under `Database['public']['Enums']` and a runtime array under `Constants.public.Enums` (`supabase/types.ts:1558`) | Import it, or test against it |
| CHECK list on a `text` column | 20 | No. The generated type is `string` | Only the catalog |

Second method for the enums: `Constants` compared with `pg_enum` label by label. All ten agree today,
so `types.ts` is current for enums. That makes it usable as a test fixture, and it still is not the
source a decision reads.

## Restated by hand in `packages/core`

| Definition | Live enum | Agrees today |
| --- | --- | --- |
| `TIER_IDS`, `tiers.ts:24` | `tier` | Yes, same labels and order |
| `ARCHETYPE_IDS`, `archetypes.ts:6-15` | `archetype_id` | Same eight labels, different order. `FORMING` beside it is not a label, see `2026-live-forming-three-against-one.md` |
| `Emotion`, `classification.ts:19` | `emotion_level` | Yes |
| `ArticleEngagement`, `classification.ts:20` | `article_engagement_level` | Yes |
| `OpposingViewEngagement`, `classification.ts:38` | `opposing_view_level` | Yes |

Five of the ten. Each agrees because someone copied it correctly, and nothing would notice a copy that
went wrong. The `'yes' : 'no'` fold fixed in commit `c94af0c` and the `forming` constant are two
instances of that class already.

## Defined twice inside the database

- **`tier_nominations.target_tier`** carries a CHECK listing the seven tier values as text, beside the
  `tier` enum that already defines them. A tier added to the enum would not reach the CHECK. The table
  has 0 rows, so retyping the column to `public.tier` and dropping the CHECK costs nothing today.
- **`share_events.channel`** accepts both `'x'` and `'twitter'`. Of 7 rows, none uses either (`email`
  1, `facebook` 4, `native` 2), so dropping one spelling is free today and a fold in every count by
  channel later.

## The rule this seat will hold

Built from the measured properties of each option rather than asserted as industry consensus, and
marked that way in `practices.md` until a source backs the general form:

| | Enum | CHECK on `text` | Lookup table with a foreign key |
| --- | --- | --- | --- |
| Add a value | `ADD VALUE`, cannot be used in the same transaction | Drop and recreate the constraint | Insert a row |
| Remove or rename | Rename yes, removal unsupported (`migrator`'s note) | Drop and recreate | Delete or update a row |
| Visible to generated types | Yes, with a runtime array | No | No, the values are data |

So: a value set the code branches on belongs in an enum, and the code either derives from `Constants`
or a test holds the two equal. A CHECK list is acceptable only where no TypeScript restates it, or where
a catalog check does. Adding an enum value is a one-way door and is costed as one.

## The check that holds them together

1. **A test in `packages/core`** that imports `Constants` from `supabase/types.ts` and asserts set
   equality with the five restated domains. Test-only, so the runtime package stays free of database
   types. It fails the first time `npm run types` regenerates with a new or renamed label. The three
   classification unions are type-only today; exporting them as `as const` arrays, the pattern
   `TIER_IDS` already uses, is what lets a test compare values. Caution for `builder`: if the core
   `tsconfig.json` scopes `rootDir` to `src`, the typecheck will object to an import from outside it.
2. **A catalog snapshot for the CHECK lists.** `checks/check-value-lists.sql` prints all twenty in a
   stable order; a committed copy of its output turns any later change into a diff.

**First move:** the equality test. One file, no migration, and it would have caught the `forming`
belief before a row depended on it.

## What I did not do

Write the test or either migration. `builder` owns `packages/core` and `migrator` owns the migration
tree. I did not check `apps/web` for restated CHECK lists beyond the grep in the forming note.

## Implies for

`builder`: the equality test. `migrator`: `tier_nominations.target_tier` to the enum and one channel
spelling dropped, both free at zero rows. Practice: a literal that names a stored value either comes
from `Constants` or sits under a test that compares it with the catalog.

*Filed 2026-09-21*
