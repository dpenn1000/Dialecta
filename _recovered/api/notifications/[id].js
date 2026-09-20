/**
 * api/notifications/[id].js
 *
 * Single-notification operations. Currently just mark-read; if a future
 * delete or snooze affordance lands, it can layer in here.
 *
 * POST /api/notifications/<id>
 *   Body: { member_uuid: <uuid>, _action: 'mark_read' }
 *   Returns { id, is_read: true, read_at: <iso> }.
 *
 * Auth: enforces recipient_member_id === member_uuid. A member can only
 * mutate their own rows; mismatches return 404 (not 403) so we don't leak
 * the existence of someone else's notification id.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Notification id is required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { member_uuid, _action } = req.body || {};
  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required' });
  }
  if (_action !== 'mark_read') {
    return res.status(400).json({
      error: "Unknown _action. Supported: 'mark_read'.",
    });
  }

  try {
    const read_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at })
      .eq('id', id)
      .eq('recipient_member_id', member_uuid)
      .select('id, is_read, read_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // Either the notification doesn't exist or it belongs to someone else.
      // Return 404 in both cases to avoid leaking ownership.
      return res.status(404).json({ error: 'Notification not found' });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error('Mark-read error:', error);
    return res.status(500).json({
      error: 'Mark-read failed',
      detail: error.message,
    });
  }
}
