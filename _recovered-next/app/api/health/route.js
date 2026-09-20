/**
 * GET /api/health
 *
 * Lightweight liveness probe. Returns the project name and phase so the
 * Vercel Health Check (and our future /api/health/full-stack canary) can
 * confirm the right deployment is responding. No DB calls; pure metadata.
 */

export async function GET() {
  return Response.json({
    ok: true,
    service: 'dialecta-next',
    phase: 1,
    timestamp: new Date().toISOString(),
  });
}
