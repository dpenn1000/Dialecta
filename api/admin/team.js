/**
 * /api/admin/team
 *
 * GET   list current admins (anyone with at least one active role grant) +
 *       the catalog of available roles for the grant UI. Gated by
 *       `members.view` capability.
 *
 * POST  grant or revoke a role on a target member. Body:
 *         {
 *           action:           'grant' | 'revoke',
 *           target_member_id: <ghost_member_uuid>,
 *           role_id:          <admin_roles.id>,
 *           note:             <optional text>
 *         }
 *       Gated by `members.manage_roles` capability.
 *
 * Side effects on grant/revoke:
 *   1. Insert/delete in profile_admin_roles.
 *   2. Sync legacy boolean flags (profiles.is_admin, profiles.is_quote_admin)
 *      so existing endpoints that read those columns keep working until the
 *      Phase 2 refactor migrates them to hasCapability().
 *   3. Append an entry to admin_audit_log with actor + target + role + note.
 *
 * The admin_audit_log entry is the canonical record. Both flag-sync and
 * profile_admin_roles writes are best-effort within the same handler; if
 * one fails the others may still happen, leaving the system in an
 * inconsistent state. v1 acceptable trade-off for invited-launch volume;
 * harden into a transactional RPC (Postgres function) before public scale.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { verifyCapability } from '../_capabilities.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  // Both methods need at least members.view to read the team.
  const auth = await verifyCapability(req, 'members.view');
  if (!auth.ok) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  if (req.method === 'GET') {
    return handleList(req, res);
  }

  if (req.method === 'POST') {
    if (!auth.capabilities.includes('members.manage_roles')) {
      return res.status(403).json({ error: 'members.manage_roles capability required' });
    }
    return handleGrantRevoke(req, res, auth);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleList(req, res) {
  try {
    const nowIso = new Date().toISOString();

    const [grantsResult, rolesResult] = await Promise.all([
      supabase
        .from('profile_admin_roles')
        .select('profile_id, role_id, granted_at, granted_by, expires_at, note')
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('granted_at', { ascending: false }),
      supabase
        .from('admin_roles')
        .select('id, display_name, description, is_system')
        .order('id'),
    ]);

    if (grantsResult.error) throw grantsResult.error;
    if (rolesResult.error)  throw rolesResult.error;

    const profileIds = [...new Set(grantsResult.data.map((g) => g.profile_id))];
    const grantorIds = [...new Set(grantsResult.data.map((g) => g.granted_by).filter(Boolean))];
    const allIds     = [...new Set([...profileIds, ...grantorIds])];

    let profileMap = new Map();
    if (allIds.length > 0) {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, ghost_member_id, display_name, avatar_url')
        .in('id', allIds);
      if (pErr) throw pErr;
      profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    }

    // Group grants by profile_id, preserving the grants array order.
    const adminMap = new Map();
    for (const g of grantsResult.data) {
      const p = profileMap.get(g.profile_id);
      if (!p) continue;
      if (!adminMap.has(g.profile_id)) {
        adminMap.set(g.profile_id, {
          profile_id:      g.profile_id,
          ghost_member_id: p.ghost_member_id,
          display_name:    p.display_name,
          avatar_url:      p.avatar_url,
          roles:           [],
        });
      }
      const grantor = g.granted_by ? profileMap.get(g.granted_by) : null;
      adminMap.get(g.profile_id).roles.push({
        role_id:         g.role_id,
        granted_at:      g.granted_at,
        granted_by_name: grantor?.display_name || (g.granted_by ? '(unknown)' : '(system)'),
        expires_at:      g.expires_at,
        note:            g.note,
      });
    }

    return res.status(200).json({
      admins:          Array.from(adminMap.values()),
      available_roles: rolesResult.data,
    });
  } catch (err) {
    console.error('admin/team list error:', err);
    return res.status(500).json({ error: 'Failed to list team', detail: err.message });
  }
}

async function handleGrantRevoke(req, res, auth) {
  const body = req.body || {};
  const { action, target_member_id, role_id, note } = body;

  if (!['grant', 'revoke'].includes(action)) {
    return res.status(400).json({ error: 'action must be "grant" or "revoke"' });
  }
  if (!target_member_id || !role_id) {
    return res.status(400).json({ error: 'target_member_id and role_id are required' });
  }

  try {
    const { data: targetProfile, error: tpErr } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('ghost_member_id', target_member_id)
      .maybeSingle();
    if (tpErr) throw tpErr;
    if (!targetProfile) {
      return res.status(404).json({
        error: 'Target member profile not found. Have they signed in to /profile/ yet?',
      });
    }

    const { data: actorProfile, error: apErr } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('ghost_member_id', auth.memberId)
      .maybeSingle();
    if (apErr) throw apErr;
    if (!actorProfile) {
      return res.status(500).json({ error: 'Actor profile lookup failed' });
    }

    // Refuse self-revoke of Publisher (only safety check in v1).
    if (action === 'revoke' && role_id === 'publisher' && targetProfile.id === actorProfile.id) {
      return res.status(400).json({
        error: 'Cannot revoke your own Publisher role. Have another Publisher do it.',
      });
    }

    if (action === 'grant') {
      const { error: insertErr } = await supabase
        .from('profile_admin_roles')
        .upsert({
          profile_id: targetProfile.id,
          role_id,
          granted_by: actorProfile.id,
          note:       note || null,
        }, { onConflict: 'profile_id,role_id', ignoreDuplicates: false });
      if (insertErr) throw insertErr;

      await syncLegacyFlags(targetProfile.id);

      await supabase.from('admin_audit_log').insert({
        actor_id:  actorProfile.id,
        target_id: targetProfile.id,
        action:    'role_granted',
        details:   {
          role_id,
          target_display_name: targetProfile.display_name,
          actor_display_name:  actorProfile.display_name,
          note:                note || null,
          via:                 '/dev-admin/team',
        },
      });

      return res.status(200).json({ success: true, action: 'grant', role_id });
    }

    if (action === 'revoke') {
      const { error: deleteErr } = await supabase
        .from('profile_admin_roles')
        .delete()
        .eq('profile_id', targetProfile.id)
        .eq('role_id', role_id);
      if (deleteErr) throw deleteErr;

      await syncLegacyFlags(targetProfile.id);

      await supabase.from('admin_audit_log').insert({
        actor_id:  actorProfile.id,
        target_id: targetProfile.id,
        action:    'role_revoked',
        details:   {
          role_id,
          target_display_name: targetProfile.display_name,
          actor_display_name:  actorProfile.display_name,
          via:                 '/dev-admin/team',
        },
      });

      return res.status(200).json({ success: true, action: 'revoke', role_id });
    }
  } catch (err) {
    console.error('admin/team grant/revoke error:', err);
    return res.status(500).json({ error: 'Operation failed', detail: err.message });
  }
}

/**
 * Maintain profiles.is_admin and profiles.is_quote_admin from current
 * effective capabilities. These flags drive existing API endpoints
 * (/api/article/repolish gates on is_admin; quote admin paths gate on
 * is_quote_admin). Phase 2 refactors those endpoints to call hasCapability()
 * directly, after which the flags can be retired.
 *
 * Mapping:
 *   is_admin       = has articles.repolish capability
 *                    (mirrors what the legacy /repolish gate semantically
 *                    intended: "platform-level article admin." Granting
 *                    Reviewer alone does NOT grant is_admin, which is the
 *                    correct behavior.)
 *   is_quote_admin = has quotes.curate capability
 *
 * is_author is intentionally not touched here; it's a contributor capability
 * gated separately via the /pact/ flow.
 */
async function syncLegacyFlags(profileId) {
  const { data: caps } = await supabase
    .from('profile_effective_capabilities')
    .select('capability_id')
    .eq('profile_id', profileId);

  const capSet = new Set((caps || []).map((c) => c.capability_id));

  await supabase
    .from('profiles')
    .update({
      is_admin:       capSet.has('articles.repolish'),
      is_quote_admin: capSet.has('quotes.curate'),
    })
    .eq('id', profileId);
}
