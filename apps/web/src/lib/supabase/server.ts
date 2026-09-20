/**
 * Supabase client for server components, route handlers and server actions.
 * Follows the @supabase/ssr cookie pattern. Never import this from a client component.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }
  return { url, anonKey };
}

export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // @supabase/ssr's setAll takes the cookie array AND a headers object
      // (Cache-Control, Expires, Pragma) that must land on the response
      // whenever a cookie write happens, or a CDN/reverse proxy in front of
      // this app can serve one visitor's session to another (confirmed
      // directly against the installed package: node_modules/@supabase/ssr/src/types.ts,
      // team/builder/knowledge/2026-supabase-ssr-setall-signature.md). This
      // helper only ever gets the cookie half applied. A Server Component
      // cannot write cookies or headers at all (the catch below). A Route
      // Handler or Server Action can write cookies through this same
      // cookieStore, but Next gives no equivalent mutable jar for arbitrary
      // response headers the way it does for cookies, only whatever the
      // handler's own returned Response carries, so `headers` is accepted
      // (an honest signature, not a silently dropped one) and left unused
      // here. middleware.ts is what runs on every request with both a
      // request and a response in hand, and it is what actually attaches
      // these headers (lib/supabase/middleware.ts). The one route that
      // creates a session outside that refresh cycle, auth/callback,
      // attaches them itself on its redirect for the same reason.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept to match the real, two-argument setAll signature; see the comment above
      setAll(cookiesToSet, _headers) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read only. Safe to
          // ignore when middleware refreshes sessions.
        }
      },
    },
  });
}
