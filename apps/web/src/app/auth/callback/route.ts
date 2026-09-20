import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PKCE callback for both /login flows (app/login/actions.ts): the magic
 * link's emailRedirectTo and Google's redirectTo both land here with a
 * `code` param. exchangeCodeForSession turns it into a session
 * (council/security/research/2026-supabase-google-oauth.md names this call
 * directly as the callback-side half of the server-side/PKCE shape).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}/`);
      // This request just turned a code into a session cookie, the one
      // path in this app that creates a session outside middleware's own
      // refresh cycle. Match @supabase/ssr's cache-control contract for any
      // response that sets an auth cookie
      // (node_modules/@supabase/ssr/src/types.ts): without it, a CDN or
      // reverse proxy in front of this app could cache this redirect and
      // serve the next visitor this one's session.
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
      response.headers.set('Expires', '0');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
