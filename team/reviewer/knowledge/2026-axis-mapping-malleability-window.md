# The malleability window: where it is specified, and a recovered implementation of it

**Source:** `docs/Dialecta_Axis_Mapping_v1.md`, universal rule 6, line 35. `docs/Dialecta_Tuning_Engine_Spec_v1.md`, "Wait Windows" panel, line 89. `_recovered/api/_axis-mapping.js` (quarantined, recovered from a Vercel deployment artifact), function `deletePriorAxisEventsForClassification`. Read 2026-09-20.

## Summary

The rule itself, in full, is specified in exactly one place. `Dialecta_Axis_Mapping_v1.md` universal rule 6: "Re-classification on edit (the malleability window): when a comment is edited within its 60-min window and re-classified, prior axis_events for that classification are superseded. The new classification's axis_events become canonical. Implementation: delete prior axis_events with the same `classification_id` before appending the new ones." The Tuning Engine spec's "Wait Windows" panel names the same 60 minute window as one of three timers to expose on an analytics dashboard ("median time-to-edit / time-to-delete within the malleability window") but adds no rule of its own; it assumes rule 6 already exists and only wants to chart how contributors use it. So the lead's premise, that the window might be specified in more than one place with drift between them, is false: there is one spec and one supplementary analytics mention, not two competing specs.

The quarantined recovered file contains a working implementation of rule 6, named for exactly what it does:

```js
export async function deletePriorAxisEventsForClassification(supabase, classificationId) {
  const { error } = await supabase
    .from('axis_events')
    .delete()
    .eq('classification_id', classificationId);
  if (error) throw error;
}
```

Its own comment identifies the caller: "Used by the comment edit / re-classify path (PATCH /api/comment/:id)." The `supabase` client it takes is documented elsewhere in the same file as "Supabase service-role client", the same role that carries `bypassrls` per `2026-supabase-row-level-security.md`.

## Implies for Dialecta

- This is evidence, not a decision. `exchange/open/2026-09-19-002-handoff-pr-3-review.md`'s second correction already reasoned that the append-only mandate and rule 6 "reconcile only through the service role... Append-only is then a property of clients rather than of the table, which is a weaker claim than either document makes," without being able to point at anything built. This file shows that exact reconciliation was previously implemented and shipped this way, not merely theorized. It sharpens the fourteenth finding's spec tension; it does not settle it, because `_recovered/` is quarantine by the terms of this sprint; nothing here may be promoted into `packages/core` or `supabase/` on this file's authority alone.
- `packages/core/src/axis-mapping.ts` has no equivalent function. Grepped for `classification_id`, `deletePriorAxisEventsForClassification`, and `malleability` across `packages/core/src`: no match outside `axis-mapping.ts` and `classification.ts`, and neither implements a delete-and-reinsert path. If B-1 (axis ledger write) ships before this gap is addressed, the current repo has no code path for rule 6 at all, not even a wrong one.
- `comments.hardened_at`, named in the fourteenth finding as read by nothing, is exactly the column a real implementation of rule 6 would need to check before allowing the delete-and-reinsert (is the 60 minute window still open). The recovered file does not reference `hardened_at` by that name, so it does not resolve where that check was meant to live; that remains open.

*Filed 2026-09-20*
