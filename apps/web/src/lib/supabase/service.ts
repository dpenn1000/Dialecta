/**
 * Supabase client for the one class of write this app makes on the service
 * role: a pipeline write, where the row is the system's own computed
 * output rather than a user's own content. supabase/CLAUDE.md: "insert and
 * update of own rows through auth.uid(). Pipeline writes use the service
 * role from server code only."
 *
 * A comment is the commenter's own row and goes through the session-scoped
 * client in src/lib/supabase/server.ts, under the RLS policies added by
 * supabase/migrations/20260920200500_comment_write_identity.sql. A
 * classification is Dialecta's own judgment about that comment, produced
 * by a server-side call this file's caller makes, not authored by the
 * commenter, so it is written here instead: `classifications` carries no
 * authenticated policy of any kind (baseline migration,
 * "classifications_service_only"), by design, the same closed-by-default
 * posture as the axis_events ledger this same service role will eventually
 * write.
 *
 * Import this only from server-only route handlers. Never from a client
 * component, never from anything that could bundle into the browser: the
 * key it reads bypasses RLS entirely (`bypassrls`, per
 * council/security/research/2026-dialecta-secret-and-artifact-hygiene.md's
 * reading of the same credential in the recovered API). There is
 * deliberately no browser-safe counterpart to this file.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase service role is not configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
