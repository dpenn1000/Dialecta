/**
 * Who may open /analytics.
 *
 * Production: a session whose JWT verifies through getClaims(), and whose
 * `sub` (the same value auth.uid() returns) is listed in
 * ANALYTICS_ADMIN_UIDS, comma separated. No session goes to /login. A session
 * that is not listed gets a 404, so the route does not announce itself. An
 * unset or empty list admits nobody.
 *
 * What it protects, stated exactly: the assembled page. Not the data. Every
 * figure here is read through the anon client, so anyone holding the public
 * anon key can already read the same rows to exactly the extent row-level
 * security allows. That is also why this gate can be this simple today, and it
 * is the reason the page must never switch to the service role while the gate
 * is this simple.
 *
 * Why not profiles.is_admin: profiles grants SELECT to neither anon nor
 * authenticated, and profiles.user_id is null on all 14 rows, so no session
 * can be matched to a profile. auth.users holds 0 rows on 2026-09-21, which
 * means that in production nobody, Dan included, can open this page until an
 * account exists and its uid is listed. That is the correct failure.
 *
 * Development: `next dev` is the only way NODE_ENV is 'development' (next
 * build and next start both force 'production', and so does every Vercel
 * deployment), so the gate is open there and the page says so on every
 * render. Middleware is not the gate either: per
 * council/security/research/2026-nextjs-middleware-cve.md, authorization is
 * checked where the resource is served.
 */
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Access = { mode: 'development' } | { mode: 'admin'; uid: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function adminUids(raw: string | undefined): ReadonlySet<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => UUID.test(s)),
  );
}

export async function requireAnalyticsAccess(): Promise<Access> {
  if (process.env.NODE_ENV === 'development') return { mode: 'development' };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims.sub;
  if (!uid) redirect('/login');
  if (!adminUids(process.env.ANALYTICS_ADMIN_UIDS).has(uid.toLowerCase())) notFound();
  return { mode: 'admin', uid };
}
