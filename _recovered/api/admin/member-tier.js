/**
 * /api/admin/member-tier
 *
 * POST  Set a member's subscription tier and/or Charter Underwriter flag.
 *       Body:
 *         {
 *           target_member_id:  <ghost_member_uuid>,
 *           subscription_tier: 'free' | 'pro',     // optional, only updated if present
 *           is_charter:        boolean             // optional, only updated if present
 *         }
 *
 * Gated by `members.manage_roles` capability (same gate as team grants;
 * tier toggling is comparable in scope and follows the same admin path).
 *
 * Side effects:
 *   1. UPDATE on profiles. The subscription_tier_set_by column is set to
 *      the actor's ghost_member_id, surfacing who toggled the tier when
 *      the audit gets read later. The subscription_tier_updated_at column
 *      is touched automatically by the profiles_subscription_tier_touch
 *      trigger (migration 031) — only when subscription_tier actually
 *      changed; setting is_charter alone won't bump the timestamp.
 *
 *   2. No admin_audit_log entry today; team grants log there because the
 *      role system is multi-step. Tier toggles are simpler — the trigger-
 *      maintained timestamp + set_by audit on profiles is enough until
 *      payments add a second mutation path.
 *
 * Charter is intentionally orthogonal: a member can be is_charter=true
 * even if subscription_tier later lapses to 'free.' That's the canonical
 * "founding member, never revoked" semantic. See memory
 * project_underwriter_tier.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { verifyCapability } from '../_capabilities.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VALID_TIERS = new Set(['free', 'pro']);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyCapability(req, 'members.manage_roles');
  if (!auth.ok) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  const body = req.body || {};
  const targetMemberId = typeof body.target_member_id === 'string'
    ? body.target_member_id.trim()
    : '';
  if (!targetMemberId) {
    return res.status(400).json({ error: 'target_member_id is required' });
  }

  // Build the patch. Either field is optional; an empty patch is a 400.
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(body, 'subscription_tier')) {
    if (!VALID_TIERS.has(body.subscription_tier)) {
      return res.status(400).json({
        error: 'Invalid subscription_tier. Allowed: ' + [...VALID_TIERS].join(', '),
      });
    }
    patch.subscription_tier = body.subscription_tier;
    patch.subscription_tier_set_by = auth.memberId;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'is_charter')) {
    if (typeof body.is_charter !== 'boolean') {
      return res.status(400).json({ error: 'is_charter must be boolean' });
    }
    patch.is_charter = body.is_charter;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'is_gifted')) {
    if (typeof body.is_gifted !== 'boolean') {
      return res.status(400).json({ error: 'is_gifted must be boolean' });
    }
    patch.is_gifted = body.is_gifted;
    // When toggling gifted on, record the actor as the gifter (audit
    // trail). Caller can override by passing gifted_by_member_id
    // explicitly. When toggling gifted off, clear both the audit field
    // and the expiry timestamp.
    if (body.is_gifted === true) {
      patch.gifted_by_member_id = typeof body.gifted_by_member_id === 'string' && body.gifted_by_member_id.trim()
        ? body.gifted_by_member_id.trim()
        : auth.memberId;
    } else {
      patch.gifted_by_member_id = null;
      patch.gift_expires_at     = null;
    }
  }
  // Gift duration: 'lifetime' = NULL (never expires; Charter Writers and
  // any permanent admin grants), '1y' = now()+1 year (Founding Voices and
  // standard peer-gifts), or an explicit ISO timestamp string. Only
  // honored when is_gifted is true (or already true); ignored otherwise.
  if (Object.prototype.hasOwnProperty.call(body, 'gift_duration')) {
    const dur = body.gift_duration;
    if (dur === 'lifetime' || dur === null) {
      patch.gift_expires_at = null;
    } else if (dur === '1y') {
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      patch.gift_expires_at = oneYear.toISOString();
    } else if (typeof dur === 'string' && dur.trim()) {
      const parsed = new Date(dur);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'gift_duration must be "lifetime", "1y", or an ISO timestamp string' });
      }
      patch.gift_expires_at = parsed.toISOString();
    } else {
      return res.status(400).json({ error: 'gift_duration must be "lifetime", "1y", or an ISO timestamp string' });
    }
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({
      error: 'At least one of subscription_tier, is_charter, or is_gifted must be provided',
    });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('ghost_member_id', targetMemberId)
      .select('ghost_member_id, subscription_tier, is_charter, is_gifted, gifted_by_member_id, gift_expires_at, subscription_tier_updated_at, subscription_tier_set_by')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Profile not found for target_member_id' });
    }

    return res.status(200).json({
      ok: true,
      member: {
        ghost_member_id:              data.ghost_member_id,
        subscription_tier:            data.subscription_tier,
        is_charter:                   data.is_charter === true,
        is_gifted:                    data.is_gifted === true,
        gifted_by_member_id:          data.gifted_by_member_id,
        gift_expires_at:              data.gift_expires_at,
        subscription_tier_updated_at: data.subscription_tier_updated_at,
        subscription_tier_set_by:     data.subscription_tier_set_by,
      },
    });
  } catch (err) {
    console.error('admin/member-tier error:', err);
    return res.status(500).json({
      error: 'Tier update failed',
      detail: err.message,
    });
  }
}
