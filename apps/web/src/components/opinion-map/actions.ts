'use server';

/**
 * The one write path for a reader's own opinion-map placement: a thin
 * wrapper around public.place_opinion_map_position(), the SECURITY DEFINER
 * function shipped in
 * supabase/migrations/20260921152637_opinion_map_positions_identity_expand.sql
 * (step 5 of team/architect/architecture/2026-09-21-delta-mechanic-port.md,
 * "The write path"). Step 6: placement-client.tsx calls this directly as a
 * function from its Commit button, the same "call a Server Action straight
 * from a client event handler" shape login-form.tsx uses for sendMagicLink,
 * not a <form action> (there is no form here, just a tap and a button).
 *
 * On the session client (lib/supabase/server.ts's createClient, cookie-based),
 * never the service role: this is the caller's own row, the same reasoning
 * supabase/CLAUDE.md states for every other reader-owned write in this app
 * ("insert and update of own rows through auth.uid(). Pipeline writes use
 * the service role from server code only"), and claim/actions.ts's
 * claimProfile follows the identical pattern for the same reason.
 *
 * No reader identity crosses this boundary in either direction. The input
 * type below carries only the placement itself (article, map, stage, type,
 * coordinates); place_opinion_map_position() resolves the caller from
 * public.current_profile_id() inside the function, never from an argument,
 * for the same reason apps/web/src/app/api/comment/route.ts never reads a
 * member id from its own request body (that file's own header comment: the
 * defect it exists to close was exactly a body-supplied identity field). The
 * function's own validation (stage/map_type/coordinate shape and range) is
 * not repeated here: the plan is explicit that a client-supplied shape is
 * trusted once, inside the SQL function, not twice.
 *
 * Empty result. current_profile_id() returns null for both a signed-out
 * caller and a signed-in caller whose profile is not yet claimed (all 14
 * legacy profiles as of 2026-09-21); place_opinion_map_position() then
 * `return;`s with no row, the same shape public.get_own_profile_for_comment()
 * already uses for the identical case. This action does not try to tell the
 * two apart (the RPC gives it nothing to tell them apart WITH), and neither
 * does the caller: placement-client.tsx shows the one plain message live
 * shows for "no identity to place with" either way. In normal use this path
 * is a backstop, not the gate: canPlace, resolved server-side in
 * article-spine/spine.tsx via readShellMember() before this island ever
 * renders, is what actually keeps a signed-out or unclaimed reader from
 * seeing a Commit button at all. This still returns the same clean, row-less
 * result if it is ever called anyway, e.g. a session that expires between
 * page load and the tap, or a direct call bypassing the UI (which is exactly
 * what this builder's report verifies against the live row count).
 */
import { createClient } from '@/lib/supabase/server';

export type PlacementStage = 'pre_read' | 'post_read';
export type PlacementMapType = 'cartesian' | 'ternary' | 'binary';

export type PlacementCoordinates =
  | { x: number; y: number }
  | { a: number; b: number; c: number }
  | { x: number };

export interface PlaceOpinionMapPositionInput {
  articleId: string;
  mapIndex: number;
  stage: PlacementStage;
  mapType: PlacementMapType;
  coordinates: PlacementCoordinates;
}

export type PlaceOpinionMapPositionResult =
  | { ok: true; recordedAt: string }
  | { ok: false };

export async function placeOpinionMapPosition(
  input: PlaceOpinionMapPositionInput,
): Promise<PlaceOpinionMapPositionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('place_opinion_map_position', {
    p_article_id: input.articleId,
    p_map_index: input.mapIndex,
    p_stage: input.stage,
    p_map_type: input.mapType,
    p_coordinates: input.coordinates,
  });

  if (error) {
    console.error('opinion-map: place_opinion_map_position failed', error);
    return { ok: false };
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row || typeof row.recorded_at !== 'string') {
    return { ok: false };
  }

  return { ok: true, recordedAt: row.recorded_at };
}
