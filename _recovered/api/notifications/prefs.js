/**
 * api/notifications/prefs.js
 *
 * Per-member notification preferences.
 *
 * GET  /api/notifications/prefs?member_uuid=<uuid>&email_hint=<addr>
 *   Returns { prefs: <resolved>, email_address }.
 *   Lazy-creates the row on first hit. email_hint is the {{@member.email}}
 *   value passed by the theme; we cache it here so the digest worker
 *   (Stage 5) does not have to round-trip Ghost Admin.
 *
 * PATCH /api/notifications/prefs
 *   Body: { member_uuid, prefs: <partial>, email_address? }
 *   Deep-merges the patch over existing prefs. Returns the resolved
 *   post-merge prefs.
 *
 * Validation:
 *   - email_enabled must be boolean if present
 *   - digest_hour must be 0-23 integer if present
 *   - timezone must be a non-empty string if present (no IANA validation
 *     server-side; the client sends Intl.DateTimeFormat().resolvedOptions()
 *     .timeZone, which is always a valid IANA name)
 *   - channels[type].inapp / .email must be boolean if present
 *   - unknown channel types are dropped silently, so clients running stale
 *     bundles after a new type ships don't get a 400
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { NOTIFICATION_TYPES, resolvePrefs } from '../_notifications.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function deepMergePrefs(stored, patch) {
  const out = { ...stored };
  if (typeof patch.email_enabled === 'boolean') out.email_enabled = patch.email_enabled;
  if (Number.isInteger(patch.digest_hour) && patch.digest_hour >= 0 && patch.digest_hour <= 23) {
    out.digest_hour = patch.digest_hour;
  }
  if (typeof patch.timezone === 'string' && patch.timezone.trim().length > 0) {
    out.timezone = patch.timezone.trim();
  }
  if (patch.channels && typeof patch.channels === 'object') {
    out.channels = { ...(stored.channels || {}) };
    for (const [type, chanPatch] of Object.entries(patch.channels)) {
      if (!NOTIFICATION_TYPES.includes(type)) continue;
      const existing = out.channels[type] || { inapp: true, email: false };
      out.channels[type] = {
        inapp: typeof chanPatch.inapp === 'boolean' ? chanPatch.inapp : existing.inapp,
        email: typeof chanPatch.email === 'boolean' ? chanPatch.email : existing.email,
      };
    }
  }
  return out;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET') {
    const member_uuid = typeof req.query.member_uuid === 'string' ? req.query.member_uuid.trim() : '';
    if (!member_uuid) {
      return res.status(400).json({ error: 'member_uuid query param is required' });
    }
    const email_hint = typeof req.query.email_hint === 'string' ? req.query.email_hint.trim() : null;

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('notification_prefs')
        .select('member_id, email_address, prefs, last_digest_at')
        .eq('member_id', member_uuid)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      if (existing) {
        // If the row exists but email_address is empty and the theme passed
        // a hint, backfill it now. Cheap, idempotent, keeps the digest
        // worker unblocked once that lands.
        let email_address = existing.email_address;
        if (!email_address && email_hint) {
          const { error: backfillErr } = await supabase
            .from('notification_prefs')
            .update({ email_address: email_hint, updated_at: new Date().toISOString() })
            .eq('member_id', member_uuid);
          if (backfillErr) throw backfillErr;
          email_address = email_hint;
        }
        return res.status(200).json({
          prefs:         resolvePrefs(existing.prefs),
          email_address,
        });
      }

      const { error: insertErr } = await supabase
        .from('notification_prefs')
        .upsert(
          { member_id: member_uuid, email_address: email_hint, prefs: {} },
          { onConflict: 'member_id', ignoreDuplicates: true }
        );
      if (insertErr) throw insertErr;

      return res.status(200).json({
        prefs:         resolvePrefs({}),
        email_address: email_hint,
      });
    } catch (error) {
      console.error('Prefs GET error:', error);
      return res.status(500).json({
        error: 'Prefs fetch failed',
        detail: error.message,
      });
    }
  }

  if (req.method === 'PATCH') {
    const { member_uuid, prefs: patch, email_address } = req.body || {};
    if (!member_uuid || typeof member_uuid !== 'string') {
      return res.status(400).json({ error: 'member_uuid is required' });
    }
    if (!patch || typeof patch !== 'object') {
      return res.status(400).json({ error: 'prefs object is required' });
    }

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('notification_prefs')
        .select('prefs, email_address')
        .eq('member_id', member_uuid)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      const baseStored = existing?.prefs || {};
      const merged = deepMergePrefs(resolvePrefs(baseStored), patch);

      const update = {
        prefs:      merged,
        updated_at: new Date().toISOString(),
      };
      if (typeof email_address === 'string' && email_address.trim().length > 0) {
        update.email_address = email_address.trim();
      }

      const { error: upsertErr } = await supabase
        .from('notification_prefs')
        .upsert(
          { member_id: member_uuid, ...update },
          { onConflict: 'member_id' }
        );
      if (upsertErr) throw upsertErr;

      return res.status(200).json({
        prefs:         merged,
        email_address: update.email_address ?? existing?.email_address ?? null,
      });
    } catch (error) {
      console.error('Prefs PATCH error:', error);
      return res.status(500).json({
        error: 'Prefs update failed',
        detail: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
