/**
 * next@15.5.25, not 16.0.0: this file must be middleware.ts, not proxy.ts.
 * Next.js only started recognizing proxy.ts at 16.0.0; a proxy.ts here
 * would be inert, never invoked, and would fail open silently
 * (council/security/research/2026-nextjs-middleware-cve.md, read directly
 * against the current docs during this build to confirm the placement
 * rule too: same level as app/, inside src/ since this app uses src/app).
 *
 * Scope today is session refresh only (lib/supabase/middleware.ts), not
 * route protection. No page in this app requires a session yet. When one
 * does, per the same research note (citing Vercel's own postmortem on
 * CVE-2025-29927): do not let this file be the only place that route is
 * gated. Re-check authorization in the Server Action or Route Handler
 * itself as well.
 */
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets and image optimization output, so a
    // refresh does not run against every CSS/JS/image request.
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
