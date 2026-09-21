/**
 * Who is signed in, for the header and the drawer. Server only: it reads the
 * session through lib/supabase/server.ts and nowhere else.
 *
 * Identity is auth.uid(), never a value the request carries. getClaims()
 * verifies the session's JWT (the same call middleware.ts makes on every
 * request), and get_own_profile_for_comment() is SECURITY DEFINER, scoped
 * inside the function to auth.uid(), so it can only ever return the caller's
 * own row (supabase/migrations/20260920200500_comment_write_identity.sql). The
 * client drawer receives the finished result as a prop: a display name,
 * initials and a profile href built from profiles.id, which the profiles table
 * already serves to anyone. No token, email, auth id or Ghost member id
 * crosses to the browser.
 *
 * This replaces the live theme's {{@member}} block in default.hbs, which read
 * the name, avatar and uuid Ghost rendered into data- attributes.
 */
import { createClient } from '@/lib/supabase/server';

export interface ShellMember {
  /** profiles.display_name, or null for a sign in with no claimed profile yet. */
  name: string | null;
  /** Two letters from the name, or '' when there is no name. */
  initials: string;
  /** /profile/<profiles.id>, or null when the sign in has no profile. */
  href: string | null;
}

function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** default.hbs computeInitials(): first and last initial, or the first two letters of one name. */
export function initialsFor(name: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && first && last) return (first.charAt(0) + last.charAt(0)).toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return '';
}

/**
 * The signed-in member, or null for a visitor. Never throws: a Supabase outage
 * or a missing env renders the signed-out header rather than taking every page
 * down with it.
 */
export async function readShellMember(): Promise<ShellMember | null> {
  if (!isConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    if (!claimsData?.claims?.sub) return null;

    const { data: rows } = await supabase.rpc('get_own_profile_for_comment');
    const profile: Record<string, unknown> | undefined = Array.isArray(rows) ? rows[0] : undefined;

    const rawName = profile?.member_name;
    const name = typeof rawName === 'string' && rawName.trim() ? rawName.trim() : null;
    const profileId = typeof profile?.profile_id === 'string' ? profile.profile_id : null;

    return {
      name,
      initials: initialsFor(name),
      href: profileId ? `/profile/${profileId}` : null,
    };
  } catch {
    return null;
  }
}
