/**
 * /api/admin/feedback
 *
 * GET   list feedback items, optionally filtered by status/priority/type.
 *       Gated by `feedback.triage` capability. Returns items ordered by
 *       submitted_at DESC by default (oldest unacknowledged surfaces with
 *       a status filter).
 *
 *       Query params:
 *         status      = 'new' | 'triaged' | 'approved' | 'in_progress' |
 *                       'shipped' | 'declined' | 'duplicate' (optional)
 *         priority    = 'critical' | 'high' | 'medium' | 'low' (optional)
 *         type        = 'bug' | 'idea' | 'content' | 'question' | 'nit' (optional)
 *         limit       = max items to return (default 100, max 500)
 *
 * POST and PATCH (triage updates, status changes, assignment) ship in the
 * next round. v1 surface is read-only.
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyCapability(req, 'feedback.triage');
  if (!auth.ok) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const { status, priority, type } = req.query;

    let query = supabase
      .from('feedback_items')
      .select('id, type, priority, status, title, body, reporter_member_id, reporter_display_name, reporter_email, captured_metadata, triage_note, owner_profile_id, acknowledged_at, status_changed_at, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (status)   query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (type)     query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;

    // Lookup display names for reporters who are members (denormalized for UI).
    const memberIds = [...new Set((data || [])
      .map((i) => i.reporter_member_id)
      .filter(Boolean))];

    let memberMap = new Map();
    if (memberIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('ghost_member_id, display_name')
        .in('ghost_member_id', memberIds);
      memberMap = new Map((profiles || []).map((p) => [p.ghost_member_id, p.display_name]));
    }

    // Counts by status (always returned; useful for the Feedback tab to
    // show queue depth at a glance even when filtered).
    const { data: counts } = await supabase
      .from('feedback_items')
      .select('status');
    const status_counts = {};
    for (const row of counts || []) {
      status_counts[row.status] = (status_counts[row.status] || 0) + 1;
    }

    const items = (data || []).map((i) => ({
      ...i,
      reporter_display_name:
        i.reporter_member_id && memberMap.has(i.reporter_member_id)
          ? memberMap.get(i.reporter_member_id)
          : i.reporter_display_name,
    }));

    return res.status(200).json({ items, status_counts });
  } catch (err) {
    console.error('admin/feedback list error:', err);
    return res.status(500).json({ error: 'Failed to list feedback', detail: err.message });
  }
}
