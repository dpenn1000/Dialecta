/**
 * api/notifications/digest.js
 *
 * Email digest worker. Stage 5 of the notification system.
 *
 * Two execution modes:
 *
 *   CRON  Vercel hits this hourly (vercel.json crons), authenticated via
 *         the CRON_SECRET bearer token Vercel auto-injects. Iterates over
 *         every notification_prefs row, computes each member's local hour
 *         in their timezone, and sends a digest only to members whose
 *         current local hour matches their prefs.digest_hour.
 *
 *   TEST  Manual call with ?member_uuid=<uuid>. Bypasses the hour gate
 *         and sends a digest to that one member if they have any pending
 *         notifications. Used for end-to-end smoke tests and the future
 *         "send test digest now" button in the settings UI.
 *
 * Sending one digest:
 *   1. Resolve prefs (lazy-default-merged via resolvePrefs from the helper)
 *   2. Bail if email_enabled false or email_address missing
 *   3. Pull notifications WHERE recipient = member AND email_status = 'pending'
 *      (rows where the user disabled email for that type were already
 *      written with email_status='skipped' by createNotification)
 *   4. Render HTML, send via Resend
 *   5. Mark sent rows email_status='sent', email_sent_at=now()
 *   6. Update notification_prefs.last_digest_at
 *
 * Failure isolation: one member's send failure marks their rows 'failed'
 * but doesn't kill the cron run. The next hour's cron skips 'failed' rows
 * (they're not 'pending'); a future retry pass can re-queue them if needed.
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { resolvePrefs } from '../_notifications.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Lazy-initialize Resend so a missing/invalid RESEND_API_KEY returns a clean
// 500 with detail instead of crashing the function at module-load time.
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    const err = new Error('RESEND_API_KEY env var is not set in this deployment.');
    err.code = 'NO_RESEND_KEY';
    throw err;
  }
  _resend = new Resend(key);
  return _resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'Dialecta <noreply@dialecta.org>';
const SITE_URL   = 'https://www.dialecta.org';

// Section labels in the digest. Order = TYPE_ORDER below (highest-signal first).
const TYPE_LABELS = {
  reply_to_comment:   'Replies to your comments',
  mention:            'Mentions',
  comment_on_article: 'Comments on your articles',
  editorial:          'Editorial notes',
  follow_new_article: 'New articles from people you follow',
  new_follower:       'New followers',
};

const TYPE_ORDER = [
  'reply_to_comment',
  'mention',
  'comment_on_article',
  'editorial',
  'follow_new_article',
  'new_follower',
];

const DIGEST_LIMIT_PER_MEMBER = 50;

// Resend error names that mean "this email will never succeed in its current
// shape": bad From, bad recipient, malformed payload, etc. Anything in this
// set marks the notification rows as 'failed' so the digest worker stops
// retrying them. Anything NOT in this set is treated as transient (missing
// API key, rate limit, network blip, Resend infra) and the rows stay
// 'pending' so the next cron run picks them up automatically.
const PERMANENT_RESEND_ERRORS = new Set([
  'validation_error',
  'missing_required_field',
  'invalid_from_address',
  'invalid_to_address',
  'invalid_attachment',
  'invalid_parameter',
  'invalid_idempotency_key',
  'invalid_idempotent_request',
  'invalid_region',
  'security_error',
  'not_found',
]);

/**
 * Compute a member's current local hour (0-23) given their IANA timezone.
 * Returns null on unknown timezone (member is skipped this run).
 */
function localHourFor(timezone) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    // formatToParts is more reliable than parseInt(format()) on edge formats.
    const parts = fmt.formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === 'hour');
    if (!hourPart) return null;
    const h = parseInt(hourPart.value, 10);
    if (Number.isNaN(h)) return null;
    // Intl can return "24" for midnight in some locales; normalize.
    return h === 24 ? 0 : h;
  } catch {
    return null;
  }
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderItem(notif) {
  const p = notif.payload || {};
  const actorName = escapeHtml(p.actor_name || 'A contributor');
  const articleTitle = escapeHtml(p.article_title || '');
  const url = escapeHtml(notif.target_url || SITE_URL);

  let line;
  switch (notif.type) {
    case 'comment_on_article':
      line = articleTitle
        ? `${actorName} commented on your article "${articleTitle}"`
        : `${actorName} commented on your article`;
      break;
    case 'reply_to_comment':
      line = articleTitle
        ? `${actorName} replied to your comment on "${articleTitle}"`
        : `${actorName} replied to your comment`;
      break;
    case 'mention':
      line = `${actorName} mentioned you in a comment`;
      break;
    case 'new_follower':
      line = `${actorName} started following you`;
      break;
    case 'follow_new_article':
      line = articleTitle
        ? `${actorName} published "${articleTitle}"`
        : `${actorName} published a new article`;
      break;
    case 'editorial':
      line = escapeHtml(p.message || 'An editorial note on your work');
      break;
    default:
      line = `${actorName} interacted with you`;
  }

  const excerpt = p.comment_excerpt
    ? `<div style="margin-top:6px;color:#5a544c;font-style:italic;font-family:Georgia,serif;font-size:14px;line-height:1.5;">"${escapeHtml(p.comment_excerpt)}"</div>`
    : '';

  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid #e8e0d0;">
      <a href="${url}" style="color:#1a1a1a;text-decoration:none;font-family:Georgia,serif;font-size:15px;line-height:1.5;">${line}</a>
      ${excerpt}
    </td>
  </tr>`;
}

function renderDigest(displayName, notifications) {
  const byType = {};
  for (const t of TYPE_ORDER) byType[t] = [];
  for (const n of notifications) {
    if (byType[n.type]) byType[n.type].push(n);
  }

  const sections = TYPE_ORDER
    .filter((t) => byType[t].length > 0)
    .map((t) => `
      <h2 style="margin:28px 0 4px;color:#b8862e;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:400;font-size:22px;letter-spacing:0.02em;">
        ${escapeHtml(TYPE_LABELS[t])}
      </h2>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        ${byType[t].map(renderItem).join('')}
      </table>
    `)
    .join('');

  const greeting = escapeHtml(displayName || 'contributor');
  const count = notifications.length;
  const noun = count === 1 ? 'notification' : 'notifications';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Dialecta digest</title>
</head>
<body style="margin:0;padding:0;background:#a8a398;font-family:Georgia,serif;color:#1a1a1a;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#a8a398;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background:#f7f2e8;max-width:600px;width:100%;">
          <tr>
            <td style="padding:32px 36px 22px;border-bottom:2px solid #b8862e;">
              <div style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:34px;color:#b8862e;letter-spacing:0.04em;line-height:1;">
                Dialecta
              </div>
              <div style="margin-top:8px;font-family:Georgia,serif;font-size:11px;color:#5a544c;letter-spacing:0.12em;text-transform:uppercase;">
                Daily digest
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 36px;">
              <p style="margin:0 0 6px;font-size:15px;color:#5a544c;font-family:Georgia,serif;">Hello ${greeting},</p>
              <p style="margin:0 0 4px;font-size:15px;line-height:1.5;font-family:Georgia,serif;">
                ${count} new ${noun} since your last digest.
              </p>
              ${sections}
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:36px;">
                <tr>
                  <td style="padding:18px 0 0;text-align:center;border-top:1px solid #e8e0d0;">
                    <a href="${SITE_URL}/" style="display:inline-block;padding:11px 24px;background:#b8862e;color:#f7f2e8;text-decoration:none;font-family:Georgia,serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
                      Open Dialecta
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:11px;color:#5a544c;text-align:center;line-height:1.6;font-family:Georgia,serif;">
                You're receiving this because you opted into email notifications.<br>
                <a href="${SITE_URL}/profile/" style="color:#5a544c;">Manage notification preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Render + send a digest for one member. Returns a result object describing
 * the outcome. Never throws for normal "no email to send" cases; throws only
 * on infrastructure errors (DB read/write failure).
 */
async function processOneMember(memberId) {
  const { data: prefRow, error: prefErr } = await supabase
    .from('notification_prefs')
    .select('member_id, email_address, prefs, last_digest_at')
    .eq('member_id', memberId)
    .maybeSingle();
  if (prefErr) throw prefErr;
  if (!prefRow) return { sent: false, reason: 'no_prefs_row' };
  if (!prefRow.email_address) return { sent: false, reason: 'no_email_address' };

  const prefs = resolvePrefs(prefRow.prefs);
  if (!prefs.email_enabled) return { sent: false, reason: 'email_disabled' };

  const { data: notifications, error: notifErr } = await supabase
    .from('notifications')
    .select('id, type, target_url, payload, created_at')
    .eq('recipient_member_id', memberId)
    .eq('email_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(DIGEST_LIMIT_PER_MEMBER);
  if (notifErr) throw notifErr;
  if (!notifications || notifications.length === 0) {
    return { sent: false, reason: 'nothing_pending' };
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('ghost_member_id', memberId)
    .maybeSingle();
  if (profileErr) throw profileErr;

  const html = renderDigest(profile?.display_name || null, notifications);
  const subject = notifications.length === 1
    ? '1 new notification on Dialecta'
    : `${notifications.length} new notifications on Dialecta`;

  const ids = notifications.map((n) => n.id);
  const nowIso = new Date().toISOString();

  // Wrap the Resend call so SDK throws (no API key, network) and Resend API
  // error responses (validation, rate limit) both flow into a single failure
  // classifier below instead of duplicating mark-failed logic in two places.
  let sendResult;
  let sdkErr = null;
  try {
    const client = getResend();
    sendResult = await client.emails.send({
      from:    EMAIL_FROM,
      to:      prefRow.email_address,
      subject,
      html,
    });
  } catch (e) {
    sdkErr = e;
  }

  const sendErrorBody = sendResult?.error || null;

  // Failure path. Classify retryable vs permanent. Retryable failures (most
  // SDK throws and most Resend infra errors) leave the rows as 'pending' so
  // the next cron picks them up once the upstream cause is fixed (e.g. ops
  // adds the missing env var). Permanent failures (validation, bad
  // recipient) mark the rows 'failed' so they stop blocking future digests.
  if (sdkErr || sendErrorBody) {
    const errorName    = sendErrorBody?.name || '';
    const errorMessage = sdkErr?.message || sendErrorBody?.message || 'Unknown send failure';
    const isPermanent  = PERMANENT_RESEND_ERRORS.has(errorName);

    if (isPermanent) {
      const { error: failErr } = await supabase
        .from('notifications')
        .update({ email_status: 'failed' })
        .in('id', ids);
      if (failErr) console.error('Failed to mark notifications as failed:', failErr);
      console.error('Resend permanent failure:', errorName, errorMessage);
      return {
        sent: false,
        reason: 'send_failed_permanent',
        error: errorMessage,
        error_name: errorName,
      };
    }

    if (sdkErr)        console.warn('Resend SDK threw (will retry next cron):', sdkErr.message);
    if (sendErrorBody) console.warn('Resend API error (will retry next cron):', errorName, errorMessage);
    return {
      sent: false,
      reason: sdkErr ? 'send_threw_retry' : 'send_failed_retry',
      error: errorMessage,
      error_name: errorName,
      code: sdkErr?.code || null,
    };
  }

  const { error: markErr } = await supabase
    .from('notifications')
    .update({ email_status: 'sent', email_sent_at: nowIso })
    .in('id', ids);
  if (markErr) throw markErr;

  const { error: digestErr } = await supabase
    .from('notification_prefs')
    .update({ last_digest_at: nowIso, updated_at: nowIso })
    .eq('member_id', memberId);
  if (digestErr) throw digestErr;

  return {
    sent: true,
    count: notifications.length,
    message_id: sendResult.data?.id || null,
  };
}

export default async function handler(req, res) {
  // Auth: cron OR test-with-member-uuid
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  const memberQueryParam = typeof req.query.member_uuid === 'string'
    ? req.query.member_uuid.trim()
    : '';
  const isManualTest = !isCron && memberQueryParam.length > 0;

  if (!isCron && !isManualTest) {
    return res.status(401).json({
      error: 'Unauthorized',
      detail: 'Cron requires the CRON_SECRET bearer token; manual tests require ?member_uuid=<uuid>.',
    });
  }

  try {
    if (isManualTest) {
      const result = await processOneMember(memberQueryParam);
      return res.status(200).json({
        mode: 'test',
        member_uuid: memberQueryParam,
        ...result,
      });
    }

    // Cron mode
    const { data: prefRows, error: prefsErr } = await supabase
      .from('notification_prefs')
      .select('member_id, prefs');
    if (prefsErr) throw prefsErr;

    const dueMembers = [];
    for (const row of prefRows || []) {
      const resolved = resolvePrefs(row.prefs);
      if (!resolved.email_enabled) continue;
      const localHour = localHourFor(resolved.timezone);
      if (localHour === null) continue;
      if (localHour !== resolved.digest_hour) continue;
      dueMembers.push(row.member_id);
    }

    const results = [];
    for (const memberId of dueMembers) {
      try {
        const r = await processOneMember(memberId);
        results.push({ member_id: memberId, ...r });
      } catch (err) {
        console.error(`Digest send error for member ${memberId}:`, err);
        results.push({
          member_id: memberId,
          sent: false,
          reason: 'exception',
          error: err.message,
        });
      }
    }

    const sentCount = results.filter((r) => r.sent).length;
    return res.status(200).json({
      mode: 'cron',
      members_due: dueMembers.length,
      members_sent: sentCount,
      results,
    });
  } catch (error) {
    console.error('Digest run error:', error);
    return res.status(500).json({
      error: 'Digest run failed',
      detail: error.message,
    });
  }
}
