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
 */
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
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

export async function sendMagicLink(
  _previousState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) {
    return { status: 'error' };
  }

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
  return { status: 'sent', email };
}

/** Bound directly to a form's action prop, so it receives a FormData it does not need. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the action prop type requires this parameter
export async function signInWithGoogle(_formData: FormData): Promise<void> {
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    redirect('/login?error=auth');
  }
  redirect(data.url);
}
