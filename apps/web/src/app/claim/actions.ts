'use server';

/**
 * Server Action for the /claim form (page.tsx's signed-in branch). Calls
 * claim_profile under the caller's own session, through the same
 * lib/supabase/server.ts client every other server-side write in this app
 * uses, never the service role (supabase/CLAUDE.md: "insert and update of
 * own rows through auth.uid(). Pipeline writes use the service role from
 * server code only." Linking a login to a profile is the caller's own row,
 * not a pipeline write).
 *
 * claim_profile is SECURITY DEFINER and checks auth.uid() itself
 * (supabase/migrations/20260921004417_profile_claim_tokens.sql), so this
 * action does not re-check sign in before calling it: an unauthenticated
 * caller who POSTs here directly, bypassing page.tsx's own gate, still gets
 * the RPC's own "requires a signed-in Supabase Auth session" failure, which
 * lands in the same generic branch as every other failure below.
 *
 * Redeems on the POST only. The GET that renders the page (page.tsx) never
 * calls claim_profile, so a mail client or corporate scanner that prefetches
 * the mailed /claim?token=... link to check it cannot burn the one-time
 * token before the member clicks it themselves.
 *
 * Every failure, whatever the reason (bad token, expired, already used,
 * this profile already claimed, this session already claimed a different
 * profile, no session), redirects to the same /claim?error=1 with no token
 * on the URL. One plain message either way: claim_profile's own exception
 * already collapses "invalid, expired, or already used" into one string on
 * purpose (security's path-to-launch position argues against a message that
 * lets a caller distinguish them), and the "already claimed" branch embeds
 * an internal profile id that has no business reaching the browser. Dropping
 * the token from the redirect also means a failed attempt does not put the
 * secret back in the address bar page.tsx already worked to clear.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const FAILURE_PATH = '/claim?error=1';

export async function claimProfile(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '').trim();
  if (!token) {
    redirect(FAILURE_PATH);
  }

  const supabase = await createClient();
  const { data: profileId, error } = await supabase.rpc('claim_profile', { token });

  if (error || typeof profileId !== 'string' || !profileId) {
    redirect(FAILURE_PATH);
  }

  redirect(`/profile/${profileId}`);
}
