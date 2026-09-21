/**
 * Sign in returns you to where you were. The check is safeReturnPath in
 * @dialecta/core, tested there against hostile input; this file is only the
 * apps/web plumbing around it, and is safe to import from a client island.
 *
 * The path rides the round trip in a cookie, not on the callback URL. The
 * trip is /login?next=... (the link a page builds with loginHref), then a
 * server action that stores the checked path in RETURN_TO_COOKIE, then Google
 * or the magic link, then /auth/callback, which reads the cookie, checks it
 * again, clears it and redirects.
 *
 * Why a cookie. Supabase validates the redirect URL a sign-in names
 * (supabase/auth, internal/utilities/request.go, IsRedirectURLValid). A URL
 * on the Site URL's own host passes whatever its path or query. Any other
 * host is glob-matched against the dashboard's Redirect URLs list with its
 * query string included, only the #fragment cut off, and a miss falls back to
 * the Site URL, where no callback runs and the sign-in silently fails. A
 * `?next=` on the callback therefore works or breaks per host (localhost, a
 * Vercel preview, production) depending on allow-list patterns this repo
 * cannot see. The cookie leaves the callback URL byte for byte what it was,
 * so whichever entries work today keep working. It costs nothing the flow
 * does not already depend on: PKCE keeps its code verifier in a cookie too,
 * so a magic link opened in a different browser fails the exchange either way.
 */
import { safeReturnPath } from '@dialecta/core';

export const RETURN_TO_COOKIE = 'dialecta-return-to';

/** Sent only to the callback, the one route that reads it. */
export const RETURN_TO_COOKIE_PATH = '/auth';

/** One hour, Supabase's default magic-link lifetime: the path never outlives the link. */
export const RETURN_TO_MAX_AGE_SECONDS = 60 * 60;

/** The sign-in link for a page: /login, carrying the path to come back to. */
export function loginHref(returnTo: string): string {
  const next = safeReturnPath(returnTo);
  return next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`;
}
