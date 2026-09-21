# opposing_view_engaged: confirmed, and the loss is on the write path

**Source:** the live Dialecta database (`mguulnibvzusfvyuowwh`) through the Supabase MCP
`execute_sql`, read-only, and `packages/core/src/classification.ts`,
`packages/core/src/axis-mapping.ts`, `apps/web/src/app/api/comment/route.ts`,
`docs/Dialecta_Data_Architecture.md` entity 2. All read 2026-09-20.

**Status:** `builder`'s flag of 2026-09-20 is **confirmed**, and it understates the problem.

## What live actually has

Method: `pg_attribute` joined to `pg_enum`, not `information_schema` and not `supabase/types.ts`,
for the reason in `2026-information-schema-vs-pg-catalog.md`.

```
classifications.opposing_view_engaged | opposing_view_level | nullable | yes|partially|no
```

The column is a real three-valued enum and it is nullable, so it can also record "not asked".
The spec agrees: entity 2 reads `opposing_view_engaged | enum | yes / partially / no`.

## Where the fold happens, and where the loss happens

These are two different places and only the second one destroys anything.

**The fold**, `packages/core/src/classification.ts:33` and `:137-148`. The parsed type declares
`opposing_view_engaged: boolean`, and the parser maps `yes` and `partially` to `true`, `no` to
`false`. In isolation this is a narrowing of an in-memory type. Nothing is lost yet because the
original string is still in the raw response.

**The loss**, `apps/web/src/app/api/comment/route.ts:260`:

```ts
opposing_view_engaged: classification.opposing_view_engaged ? 'yes' : 'no',
```

The boolean is widened back to the enum, and it can only ever produce two of the three values.
**A model answer of `partially` is written to the database as `yes`.** The route's own comment
says so and calls it "flagged, not fixed".

So the live column can hold `partially`, the model emits `partially`, the spec asks for
`partially`, and the one code path that writes the column cannot produce it.

## What is actually lost

**No computation is wrong today.** `packages/core/src/axis-mapping.ts:128` reads
`c.opposing_view_engaged ? 1 : 0`, and `docs/Dialecta_Axis_Mapping_v1.md` gives Magnanimity +1 for
`yes` or `partially` alike. Boolean is a faithful encoding of the rule as it stands. Anyone
expecting a wrong score today will not find one, and saying otherwise would be the easy overclaim.

**What is lost is the option, permanently, per row.** Three specific things:

1. **The tuning lever the spec names is destroyed.** `Dialecta_Axis_Mapping_v1.md` carries
   "**TUNING:** weight differential between yes and partially" against the Magnanimity row. That
   tuning can never be applied retroactively to a row written through this path, because the stored
   value no longer says which one it was.
2. **The bias is directional, not random.** Every `partially` inflates to `yes`, so any future count
   of full engagement is biased upward and never downward. A silent, one-sided error is worse than a
   noisy one because it survives a sanity check.
3. **It is not recoverable by replay.** Recovering the original answer means re-running Claude
   classification against the original comment text, which is non-deterministic and costs money, and
   the re-run would be a new judgment rather than the original one.

## Now against later, with the numbers

Live `classifications` holds **3 rows**: two `no`, one **`partially`**.

That single `partially` row is the whole argument. It was not written by this route, which cannot
emit the value. It proves the model really does produce `partially` in ordinary use, so this is a
live data-loss path rather than a theoretical one, and it proves the column works.

**Cost now:** three rows, no backfill, no data migration, no enum change. The live column already
has the right type. The fix is entirely in code.

**Cost later:** one irreversibly flattened row per classified comment, forever, plus the same code
change still to make. The code cost is flat; the data cost is the part that only grows.

## The fix

Three files, and the type change drives the rest.

1. `packages/core/src/classification.ts:33`, change the field to
   `opposing_view_engaged: 'yes' | 'partially' | 'no'` and have the parser keep the parsed value
   instead of collapsing it. Lines 137 to 148 already branch on all three strings, so the branch
   exists and only its assignments change. Keep accepting a literal boolean on input for
   compatibility with the model's occasional boolean answer, mapping `true` to `'yes'`.
2. `packages/core/src/axis-mapping.ts:128`, `c.opposing_view_engaged !== 'no' ? 1 : 0`. Behaviour
   identical, and the partial-credit branch the comment at line 122 says is unnecessary becomes
   writable when the tuning lands.
3. `apps/web/src/app/api/comment/route.ts:260`, pass the value straight through and delete the
   ternary and the 11-line apology above it at lines 237 to 248.

Tests that move: `packages/core/test/classification.test.ts` lines 17, 30, 46 to 51, and
`packages/core/test/axis-mapping.test.ts` lines 22, 52, 72, 92, 133, 207 to 215. They assert the fold
explicitly ("normalizes tier case and folds opposing_view_engaged to a boolean"), so they are
rewritten rather than broken by accident. The suite is 95 tests and runs in 295ms, verified by
`npx vitest run`.

No migration. The live column is already correct.

## Implies for

Practice: "a type that narrows a domain is checked at the point it is written back, not only where
it is read." Backlog A-2. `builder` implements. Related:
`migrator`'s `2026-live-schema-diff.md` section 4, which found the same divergence from
`types.ts` and called it "the clearest case in the diff of the repo losing information the spec asks
for"; this note adds the write path, the row count and the fix.

*Filed 2026-09-20*
