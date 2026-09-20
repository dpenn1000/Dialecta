/**
 * /api/feedback
 *
 * POST submit a new feedback item. No auth required (anonymous visitors can
 *      submit). If the request includes member identification (?member_id=
 *      query or x-member-id header), reporter_member_id is attached so the
 *      admin queue can attribute it.
 *
 *      Body:
 *        {
 *          type:                'bug' | 'idea' | 'content' | 'question' | 'nit'  (default: 'idea')
 *          title:               <optional, max 200>
 *          body:                <required, 1-5000>
 *          reporter_email:      <optional, used for anonymous submitters who
 *                                want a reply>
 *          captured_metadata:   <optional jsonb; client may pre-fill device,
 *                                browser, viewport, page_url, console_errors>
 *        }
 *
 *      Response: 201 { id, message }
 *      Validation errors: 400 { error }
 *
 * GET — not implemented here. Admin listing lives at /api/admin/feedback.
 *       This split keeps the public POST surface separate from the gated
 *       admin read surface.
 *
 * Status flow: every new submission lands as `status='new'`. The triage
 * decision (triaged / approved / declined / etc.) is recorded by the admin
 * via /api/admin/feedback PATCH (next round).
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VALID_TYPES = ['bug', 'idea', 'content', 'question', 'nit'];

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const type = (body.type || 'idea').toLowerCase();
  const title = (body.title || '').trim();
  const text = (body.body || '').trim();
  const reporterEmail = (body.reporter_email || '').trim();
  const clientMetadata = body.captured_metadata && typeof body.captured_metadata === 'object'
    ? body.captured_metadata
    : {};

  // ── Validation ───────────────────────────────────────────────────────────
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'type must be one of: ' + VALID_TYPES.join(', ') });
  }
  if (!text || text.length < 1) {
    return res.status(400).json({ error: 'body is required' });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: 'body too long (max 5000 chars)' });
  }
  if (title.length > 200) {
    return res.status(400).json({ error: 'title too long (max 200 chars)' });
  }
  if (reporterEmail && reporterEmail.length > 200) {
    return res.status(400).json({ error: 'reporter_email too long (max 200 chars)' });
  }

  // ── Reporter identity ────────────────────────────────────────────────────
  // Read from query or header; both are advisory at this trust level. If
  // the member exists in profiles, attach their display_name for the queue.
  const memberId = req.query?.member_id || req.headers?.['x-member-id'] || null;
  let reporter_member_id = null;
  let reporter_display_name = body.reporter_display_name || null;

  if (memberId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('ghost_member_id, display_name')
        .eq('ghost_member_id', memberId)
        .maybeSingle();
      if (profile) {
        reporter_member_id = profile.ghost_member_id;
        if (!reporter_display_name) reporter_display_name = profile.display_name;
      }
    } catch (e) {
      // Non-fatal: drop to anonymous if profile lookup fails.
      console.warn('feedback submit: profile lookup failed:', e.message);
    }
  }

  // ── Server-side metadata enrichment ──────────────────────────────────────
  // Whatever the client sent + a few server-attested fields. Client fields
  // are last so they can override the server-attested ones if the client
  // has better info (e.g., parsed device strings).
  const captured_metadata = {
    source: reporter_member_id ? 'submit_form_member' : 'submit_form_anonymous',
    submitted_at_iso: new Date().toISOString(),
    user_agent_server: req.headers?.['user-agent'] || null,
    referer_server:    req.headers?.['referer'] || null,
    ...clientMetadata,
  };

  if (reporterEmail) {
    captured_metadata.reporter_email_provided = true;
  }

  // ── Optional screenshot upload ───────────────────────────────────────────
  // Client encodes the file as a base64 data URL and sends it as
  // body.screenshot.data_url. Server validates mime + size (5MB cap) and
  // uploads to the feedback-screenshots Supabase Storage bucket. Filename
  // is timestamp + random so public URLs aren't guessable. Failure to upload
  // is non-fatal; the feedback item still lands without the screenshot.
  if (body.screenshot && typeof body.screenshot === 'object' && typeof body.screenshot.data_url === 'string') {
    const dataUrl = body.screenshot.data_url;
    const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|gif|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (match) {
      const mime    = match[1];
      const ext     = match[2] === 'jpeg' ? 'jpg' : match[2];
      const base64  = match[3];
      try {
        const buffer = Buffer.from(base64, 'base64');
        if (buffer.length > 5 * 1024 * 1024) {
          captured_metadata.screenshot_error = 'too_large';
        } else {
          const filename = `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from('feedback-screenshots')
            .upload(filename, buffer, {
              contentType: mime,
              cacheControl: '3600',
              upsert: false,
            });
          if (uploadErr) {
            console.warn('feedback screenshot upload failed:', uploadErr.message);
            captured_metadata.screenshot_error = 'upload_failed';
          } else {
            const { data: pub } = supabase.storage
              .from('feedback-screenshots')
              .getPublicUrl(filename);
            captured_metadata.screenshot_url      = pub.publicUrl;
            captured_metadata.screenshot_filename = filename;
            captured_metadata.screenshot_size     = buffer.length;
            captured_metadata.screenshot_mime     = mime;
          }
        }
      } catch (e) {
        console.warn('feedback screenshot decode failed:', e.message);
        captured_metadata.screenshot_error = 'decode_failed';
      }
    } else {
      captured_metadata.screenshot_error = 'invalid_format';
    }
  }

  // ── Insert ───────────────────────────────────────────────────────────────
  try {
    const { data, error } = await supabase
      .from('feedback_items')
      .insert({
        type,
        priority:              'medium', // default; admin triages
        status:                'new',
        title:                 title || null,
        body:                  text,
        reporter_member_id,
        reporter_display_name,
        reporter_email:        reporterEmail || null,
        captured_metadata,
      })
      .select('id')
      .single();

    if (error) throw error;

    return res.status(201).json({
      id:      data.id,
      message: 'Feedback received. We read every submission and aim to acknowledge within 48 hours.',
    });
  } catch (err) {
    console.error('feedback submit error:', err);
    return res.status(500).json({ error: 'Submission failed', detail: err.message });
  }
}
