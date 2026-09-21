/**
 * Whether the request carries a signed-in session. Server only.
 *
 * Content pages use this for one thing: choosing between the visitor and the
 * member version of a block, the way the live templates branched on
 * {{#if @member}}. It decides what renders, never what anyone may do.
 * getClaims() verifies the JWT, the same call middleware.ts makes.
 */
import { isSupabaseConfigured } from '@/lib/articles';
import { createClient } from '@/lib/supabase/server';

export async function isSignedIn(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    return Boolean(data?.claims?.sub);
  } catch {
    return false;
  }
}
