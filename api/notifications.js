/**
 * api/notifications.js
 *
 * Notifications collection endpoint. Mirrors the Path C-lite auth pattern:
 * member_uuid identifies the caller; only that member's rows are returned
 * (or mutated). v1 trust model: client supplies member_uuid; we don't
 * verify the Ghost session (consistent with the rest of the API). Personal
 * data, low-risk for Phase 1.
 *
 * GET  /api/notifications?member_uuid=<uuid>&limit=30&before=<iso>
 *   Returns { notifications: [...], unread_count: int, has_more: boolean }.
 *   Default limit 30, max 100. before is a created_at cursor for pagination.
 *
 * POST /api/notifications
 *   Body: { member_uuid: <uuid>, _action: 'mark_all_read' }
 *   Returns { marked: int }.
 *
 * Single-notification mark-read lives at /api/notifications/[id].
 * Preferences live at /api/notifications/prefs.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET') {
    const member_uuid = typeof req.query.member_uuid === 'string' ? req.query.member_uuid.trim() : '';
    if (!member_uuid) {
      return res.status(400).json({ error: 'member_uuid query param is required' });
    }

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const before = typeof req.query.before === 'string' ? req.query.before : null;

    try {
      let listQuery = supabase
        .from('notifications')
        .select('id, recipient_member_id, actor_member_id, type, target_type, target_id, target_url, payload, is_read, read_at, created_at')
        .eq('recipient_member_id', member_uuid)
        .order('created_at', { ascending: false })
        .limit(limit + 1);  // peek ahead for has_more

      if (before) listQuery = listQuery.lt('created_at', before);

      const [listResult, countResult] = await Promise.all([
        listQuery,
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_member_id', member_uuid)
          .eq('is_read', false),
      ]);

      if (listResult.error) throw listResult.error;
      if (countResult.error) throw countResult.error;

      const rows = listResult.data || [];
      const has_more = rows.length > limit;
      const notifications = has_more ? rows.slice(0, limit) : rows;

      return res.status(200).json({
        notifications,
        unread_count: countResult.count ?? 0,
        has_more,
      });
    } catch (error) {
      console.error('Notifications list error:', error);
      return res.status(500).json({
        error: 'Notifications fetch failed',
        detail: error.message,
      });
    }
  }

  if (req.method === 'POST') {
    const { member_uuid, _action } = req.body || {};
    if (!member_uuid || typeof member_uuid !== 'string') {
      return res.status(400).json({ error: 'member_uuid is required' });
    }
    if (_action !== 'mark_all_read') {
      return res.status(400).json({
        error: "Unknown _action. Supported: 'mark_all_read'.",
      });
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_member_id', member_uuid)
        .eq('is_read', false)
        .select('id');
      if (error) throw error;

      return res.status(200).json({ marked: (data || []).length });
    } catch (error) {
      console.error('Mark-all-read error:', error);
      return res.status(500).json({
        error: 'Mark-all-read failed',
        detail: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
