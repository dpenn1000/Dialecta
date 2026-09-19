/**
 * /api/admin/feedback/[id]
 *
 * PATCH update a feedback item: acknowledge, change status/priority,
 *       set/change triage note, assign or unassign an owner. Gated by
 *       `feedback.triage` capability.
 *
 *       Body fields (all optional, mix as needed):
 *         acknowledge:      true            sets acknowledged_at + acknowledged_by
 *                                            (also implicit on any other change to a
 *                                            never-acked item)
 *         status:           <status enum>   moves the item along the workflow
 *         priority:         <priority enum> reprioritizes
 *         triage_note:      <text>          required when status -> 'declined'
 *         owner_member_id:  <ghost_uuid>    assign to that member (must have an
 *                                            admin role); pass null to unassign
 *
 * Response: 200 { item } updated row.
 *
 * Side effects:
 *   1. status_changed_at + status_changed_by maintained when status moves.
 *   2. If item was never acknowledged and any field is touched, acknowledge
 *      is implicit (admin saw it; SLA stops counting against them).
 *   3. admin_audit_log row appended for each change set, with the diff.
 *
 * Validation:
 *   - status / priority must match table CHECK constraints
 *   - declined transition requires non-empty triage_note (≥ 5 chars)
 *   - owner_member_id must resolve to a profile that holds at least one
 *     active admin role (otherwise the admin queue would surface assignments
 *     to non-admins, which would be confusing)
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../../_cors.js';
import { verifyCapability } from '../../_capabilities.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VALID_STATUSES   = ['new','triaged','approved','in_progress','shipped','declined','duplicate'];
const VALID_PRIORITIES = ['critical','high','medium','low'];

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Item id is required' });

  const auth = await verifyCapability(req, 'feedback.triage');
  if (!auth.ok) return res.status(auth.statusCode).json({ error: auth.error });

  // Resolve the actor's profile.id for audit + status_changed_by.
  const { data: actorProfile, error: actorErr } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('ghost_member_id', auth.memberId)
    .maybeSingle();
  if (actorErr || !actorProfile) {
    return res.status(500).json({ error: 'Actor profile lookup failed' });
  }

  // Load the current item.
  const { data: existing, error: loadErr } = await supabase
    .from('feedback_items')
    .select('id, status, priority, acknowledged_at, acknowledged_by, triage_note, owner_profile_id, status_changed_at')
    .eq('id', id)
    .maybeSingle();
  if (loadErr) return res.status(500).json({ error: 'Failed to load item', detail: loadErr.message });
  if (!existing) return res.status(404).json({ error: 'Feedback item not found' });

  const body = req.body || {};
  const wantsAck       = body.acknowledge === true;
  const newStatus      = body.status;
  const newPriority    = body.priority;
  const newNote        = typeof body.triage_note === 'string' ? body.triage_note.trim() : undefined;
  const ownerMemberId  = body.owner_member_id; // string | null | undefined

  // ── Validation ───────────────────────────────────────────────────────────
  if (newStatus !== undefined && !VALID_STATUSES.includes(newStatus)) {
    return res.status(400).json({ error: 'status must be one of: ' + VALID_STATUSES.join(', ') });
  }
  if (newPriority !== undefined && !VALID_PRIORITIES.includes(newPriority)) {
    return res.status(400).json({ error: 'priority must be one of: ' + VALID_PRIORITIES.join(', ') });
  }
  if (newStatus === 'declined') {
    const noteToCheck = newNote !== undefined ? newNote : (existing.triage_note || '');
    if (noteToCheck.length < 5) {
      return res.status(400).json({
        error: 'triage_note required (>= 5 chars) when declining an item. The "no input dismissed without review" promise needs a paper trail.',
      });
    }
  }

  // Resolve owner if assignment is happening.
  let resolvedOwnerProfileId; // undefined = no change; null = unassign; string = assign
  let resolvedOwnerDisplayName = null;
  if (ownerMemberId !== undefined) {
    if (ownerMemberId === null) {
      resolvedOwnerProfileId = null;
    } else {
      const { data: ownerProfile, error: ownerErr } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('ghost_member_id', ownerMemberId)
        .maybeSingle();
      if (ownerErr) return res.status(500).json({ error: 'Owner lookup failed', detail: ownerErr.message });
      if (!ownerProfile) return res.status(404).json({ error: 'Owner profile not found' });

      // Confirm the owner holds at least one active admin role.
      const nowIso = new Date().toISOString();
      const { data: ownerRoles } = await supabase
        .from('profile_admin_roles')
        .select('role_id')
        .eq('profile_id', ownerProfile.id)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .limit(1);
      if (!ownerRoles || ownerRoles.length === 0) {
        return res.status(400).json({ error: 'Cannot assign to a member with no active admin role' });
      }

      resolvedOwnerProfileId = ownerProfile.id;
      resolvedOwnerDisplayName = ownerProfile.display_name;
    }
  }

  // ── Build the update ─────────────────────────────────────────────────────
  const update = {};
  const now = new Date().toISOString();

  // Implicit acknowledge: any first-touch on a never-acked item ack's it.
  const anyTouch = wantsAck || newStatus !== undefined || newPriority !== undefined ||
                   newNote !== undefined || resolvedOwnerProfileId !== undefined;
  if ((wantsAck || (anyTouch && !existing.acknowledged_at)) && !existing.acknowledged_at) {
    update.acknowledged_at = now;
    update.acknowledged_by = actorProfile.id;
  }

  if (newStatus !== undefined && newStatus !== existing.status) {
    update.status = newStatus;
    update.status_changed_at = now;
    update.status_changed_by = actorProfile.id;
  }
  if (newPriority !== undefined && newPriority !== existing.priority) {
    update.priority = newPriority;
  }
  if (newNote !== undefined) {
    update.triage_note = newNote || null;
  }
  if (resolvedOwnerProfileId !== undefined) {
    update.owner_profile_id = resolvedOwnerProfileId;
  }

  if (Object.keys(update).length === 0) {
    return res.status(200).json({ item: existing, no_change: true });
  }

  const { data: updated, error: updateErr } = await supabase
    .from('feedback_items')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (updateErr) return res.status(500).json({ error: 'Update failed', detail: updateErr.message });

  // ── Audit log ────────────────────────────────────────────────────────────
  // One entry per PATCH, capturing what changed. The actor is the admin who
  // performed the action; the target_id is the actor as well (audit log
  // target_id references profiles, not feedback_items; we put the diff in
  // details for queryability). Future: dedicated feedback_item_history table
  // if we want richer per-item audit views; for now this is sufficient.
  await supabase.from('admin_audit_log').insert({
    actor_id:  actorProfile.id,
    target_id: actorProfile.id,
    action:    'feedback_triage',
    details:   {
      feedback_item_id: id,
      diff:             update,
      previous: {
        status:           existing.status,
        priority:         existing.priority,
        owner_profile_id: existing.owner_profile_id,
        acknowledged_at:  existing.acknowledged_at,
      },
      assigned_to_display_name: resolvedOwnerDisplayName,
    },
  });

  return res.status(200).json({ item: updated });
}
