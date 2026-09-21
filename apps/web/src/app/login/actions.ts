'use server';

/**
 * Server Actions for /login. Both land on /auth/callback, which exchanges
 * the code these calls trigger for a session (ADR-002: magic link plus
 * Google; council/security/research/2026-supabase-google-oauth.md confirms
 * exchangeCodeForSession(code) as the callback-side half of this same
 * PKCE flow signInWithOAuth's server-side shape uses).
 *
 * Both run through lib/supabase/server.ts's createClient, so a session this
 * call creates is written to cookies here, not only on the later callback
 * request; the callback route's job is turning the returned code into that
 * session, not the sign-in call itself.
 *
 * Both also carry the reader's way back. The form's hidden `next` field is
 * checked with safeReturnPath and stored in a short-lived httpOnly cookie the
 * callback reads (lib/return-path.ts says why a cookie and not a query
 * parameter on the callback URL). The callback URL itself is unchanged.
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { safeReturnPath } from '@dialecta/core';
import { RETURN_TO_COOKIE, RETURN_TO_COOKIE_PATH, RETURN_TO_MAX_AGE_SECONDS } from '@/lib/return-path';
import { createClient } from '@/lib/supabase/server';

// Type-only: erased at compile time, so it is exempt from the "a 'use
// server' file may only export async functions" rule this file is
// otherwise held to. The initial-state value itself lives in
// login-form.tsx instead, for exactly that reason.
export interface MagicLinkState {
  status: 'idle' | 'sent' | 'error';
  email?: string;
}

/**
 * The origin this request actually arrived on, for building a callback URL
 * Supabase can redirect back to. Mirrors the recovered app's own defensive
 * header order (_recovered/api/comment.js: x-forwarded-host over host)
 * rather than a hardcoded site URL, since apps/web has no
 * NEXT_PUBLIC_SITE_URL today.
 */
async function getOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  if (!host) {
    throw new Error('Could not determine the site origin from request headers');
  }
  const proto = requestHeaders.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

/**
 * Store the checked return path for the callback, or clear one an earlier
 * attempt left. Every attempt does one or the other, so a path from a sign-in
 * someone abandoned cannot steer the next one.
 */
async function storeReturnPath(next: string): Promise<void> {
  const jar = await cookies();
  if (next === '/') {
    jar.delete({ name: RETURN_TO_COOKIE, path: RETURN_TO_COOKIE_PATH });
    return;
  }
  jar.set(RETURN_TO_COOKIE, next, {
    httpOnly: true,
    // Lax, not Strict: the callback arrives as a top-level navigation from
    // Google or the email link, a cross-site GET that Lax still sends on,
    // exactly as the PKCE verifier cookie from @supabase/ssr is.
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: RETURN_TO_COOKIE_PATH,
    maxAge: RETURN_TO_MAX_AGE_SECONDS,
  });
}

/** /login?error=auth, still carrying the way back so a retry keeps it. */
function loginFailedPath(next: string): string {
  return next === '/' ? '/login?error=auth' : `/login?error=auth&next=${encodeURIComponent(next)}`;
}

export async function sendMagicLink(
  _previousState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) {
    return { status: 'error' };
  }
  const next = safeReturnPath(formData.get('next'));

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { status: 'error', email };
  }
  await storeReturnPath(next);
  return { status: 'sent', email };
}

/** Bound directly to a form's action prop; the form's hidden `next` field is the way back. */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeReturnPath(formData.get('next'));
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    redirect(loginFailedPath(next));
  }
  await storeReturnPath(next);
  redirect(data.url);
}
