import { NextResponse, type NextRequest } from 'next/server';
import { safeReturnPath } from '@dialecta/core';
import { RETURN_TO_COOKIE, RETURN_TO_COOKIE_PATH } from '@/lib/return-path';
import { createClient } from '@/lib/supabase/server';

/**
 * PKCE callback for both /login flows (app/login/actions.ts): the magic
 * link's emailRedirectTo and Google's redirectTo both land here with a
 * `code` param. exchangeCodeForSession turns it into a session
 * (council/security/research/2026-supabase-google-oauth.md names this call
 * directly as the callback-side half of the server-side/PKCE shape).
 *
 * Then back to where the reader was. The login action left the page in
 * RETURN_TO_COOKIE (lib/return-path.ts). It is checked a third time here,
 * against this request's own origin, because a cookie is whatever the
 * browser sends, and the redirect is built as an absolute URL on that origin.
 * The cookie is single use: cleared on success and on failure alike. A
 * failure sends the reader back to /login still carrying the path, so trying
 * again keeps it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeReturnPath(request.cookies.get(RETURN_TO_COOKIE)?.value, origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(new URL(next, origin));
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
      response.cookies.delete({ name: RETURN_TO_COOKIE, path: RETURN_TO_COOKIE_PATH });
      return response;
    }
  }

  const failed = new URL('/login', origin);
  failed.searchParams.set('error', 'auth');
  if (next !== '/') failed.searchParams.set('next', next);
  const response = NextResponse.redirect(failed);
  response.cookies.delete({ name: RETURN_TO_COOKIE, path: RETURN_TO_COOKIE_PATH });
  return response;
}
