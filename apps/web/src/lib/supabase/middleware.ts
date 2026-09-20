/**
 * Session refresh for every request. Deliberately independent of
 * lib/supabase/server.ts rather than sharing its client helper: this file
 * runs in middleware, ahead of the Node-only next/headers request context
 * server.ts depends on, so the two stay separate clients with separate
 * cookie plumbing (the shape team/builder/knowledge/2026-supabase-ssr-nextjs-auth.md
 * calls for: "three Supabase clients, not one").
 *
 * Server Components cannot write cookies or response headers at all
 * (server.ts's setAll no-ops there on purpose). This is the one place
 * @supabase/ssr's own division of labor guarantees runs on every request
 * with both a request and a response in hand, so it is what actually
 * refreshes an expiring session and writes the result to both: the request,
 * so a Server Component rendered later in this same pass sees the fresh
 * session, and the response, so the browser does.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Same posture as lib/articles.ts's isSupabaseConfigured guard: render
    // rather than crash when the app has not been configured yet.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Write the request jar first and rebuild `response` from the
        // updated request, so a Server Component further down this same
        // pass reads the refreshed cookies rather than the stale ones this
        // request arrived with.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // The headers half of the contract server.ts's helper cannot apply.
        // This is where it actually lands: see this file's own header
        // comment and node_modules/@supabase/ssr/src/types.ts.
        for (const [key, headerValue] of Object.entries(headers)) {
          response.headers.set(key, headerValue);
        }
      },
    },
  });

  // getClaims, never getSession or getUser's cheaper cousin: getSession
  // reads the session out of the cookie without verifying it, the same
  // class of trust-the-client mistake as api/comment.js trusting a
  // body-supplied member_uuid (team/security's finding). getClaims verifies
  // the JWT locally against a cached JWKS on every call. The result itself
  // is unused here on purpose: calling it is what makes @supabase/ssr
  // refresh an expiring session and invoke setAll above. A future protected
  // route reads the claims this call already verified rather than
  // re-deriving them with a second call.
  await supabase.auth.getClaims();

  return response;
}
