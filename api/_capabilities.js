import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Capability-based auth helpers for the Dialecta admin layer.
//
// Source of truth: migration 017_admin_rbac.sql.
//   - admin_roles                       named admin roles (publisher/editor/curator/reviewer)
//   - admin_capabilities                atomic permissions, dotted naming
//   - admin_role_capabilities           role -> capability mapping
//   - profile_admin_roles               profile -> role assignments (with expires_at)
//   - profile_admin_capability_grants   per-profile additive/revoke overrides
//   - profile_effective_capabilities    view: union of role caps + overrides, expiry-filtered
//
// All capability checks should call hasCapability() or verifyCapability(); never
// hardcode role names. New domains add a row to admin_capabilities and the
// appropriate admin_role_capabilities mapping; this layer needs no code change.
//
// Existing flag checks (profiles.is_admin, profiles.is_quote_admin) remain
// valid until Phase 2 refactors them onto these helpers.

/**
 * Fetch admin roles + effective capabilities for a Ghost member uuid.
 * Returns { roles: string[], capabilities: string[] }.
 * Empty arrays for non-admins, missing profiles, or any failure.
 *
 * Two queries (profile_admin_roles + profile_effective_capabilities),
 * issued in parallel after a single profile-id resolve.
 */
export async function getMemberAccess(ghostMemberId) {
  if (!ghostMemberId) return { roles: [], capabilities: [] };

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('ghost_member_id', ghostMemberId)
    .maybeSingle();
  if (profileErr || !profile) return { roles: [], capabilities: [] };

  const nowIso = new Date().toISOString();
  const [rolesResult, capsResult] = await Promise.all([
    supabase
      .from('profile_admin_roles')
      .select('role_id')
      .eq('profile_id', profile.id)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`),
    supabase
      .from('profile_effective_capabilities')
      .select('capability_id')
      .eq('profile_id', profile.id),
  ]);

  return {
    roles: (rolesResult.data || []).map((r) => r.role_id),
    capabilities: (capsResult.data || []).map((c) => c.capability_id),
  };
}

/**
 * True if the member holds the given capability id (e.g. 'feedback.triage').
 * Returns false for missing members, missing profiles, or any failure.
 */
export async function hasCapability(ghostMemberId, capabilityId) {
  const { capabilities } = await getMemberAccess(ghostMemberId);
  return capabilities.includes(capabilityId);
}

/**
 * Endpoint-level auth helper modeled on verifyQuoteAdmin (api/_quote-admin.js).
 * Reads member uuid from `?member_id=<uuid>` query or `x-member-id` header.
 * Trust model: same as the rest of the API — client supplies the uuid; this
 * is acceptable for v1 (admin surface area is small, every action is
 * audit-logged). Harden to Ghost session verification later if needed.
 *
 * Usage:
 *   const auth = await verifyCapability(req, 'feedback.triage');
 *   if (!auth.ok) return res.status(auth.statusCode).json({ error: auth.error });
 *   // proceed; auth.memberId is the verified caller, auth.capabilities is the full set.
 */
export async function verifyCapability(req, capabilityId) {
  const memberId = req.query?.member_id || req.headers?.['x-member-id'] || null;

  if (!memberId) {
    return {
      ok: false,
      memberId: null,
      roles: [],
      capabilities: [],
      error: 'No member_id provided. Pass as ?member_id=<uuid> or x-member-id header.',
      statusCode: 401,
    };
  }

  try {
    const { roles, capabilities } = await getMemberAccess(memberId);
    if (!capabilities.includes(capabilityId)) {
      return {
        ok: false,
        memberId,
        roles,
        capabilities,
        error: `Member lacks the '${capabilityId}' capability`,
        statusCode: 403,
      };
    }
    return { ok: true, memberId, roles, capabilities, error: null, statusCode: 200 };
  } catch (err) {
    console.error('verifyCapability error:', err);
    return {
      ok: false,
      memberId,
      roles: [],
      capabilities: [],
      error: 'Capability verification failed: ' + err.message,
      statusCode: 500,
    };
  }
}
