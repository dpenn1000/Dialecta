/**
 * api/article/repolish.js
 *
 * Admin-only endpoint to re-run Polish on an existing article with a
 * different level or custom feature options. Used to:
 *   - Recover from a polish that the author or a reader didn't like
 *   - Bump an article from Light to Standard/Editorial if the author asks
 *   - Strip aggressive interventions back to Light when complaints surface
 *
 * Re-polish always runs against articles.original_html (the author's
 * submitted version) — NOT the currently-published HTML. This means
 * polish operations are non-destructive and idempotent: running Light then
 * Editorial then Light again always returns to the same Light state,
 * because the engine sees the original each time.
 *
 * Auth: requires profiles.is_admin = true on the requesting member.
 *
 * POST body:
 *   {
 *     ghost_post_id:    text,                                       // required, identifies the article
 *     polish_level:     'light' | 'standard' | 'editorial' | 'custom',
 *     polish_options?:  { feature toggles when level=custom },
 *     member_uuid:      text,                                       // requesting admin
 *   }
 *
 * Response:
 *   {
 *     ghost_post_id:    text,
 *     polish_level:     text,
 *     polish_change_log: string[],
 *     bytes_before:     number,
 *     bytes_after:      number,
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { ghostAdminFetch } from '../_ghost-admin.js';
import { createNotification } from '../_notifications.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VALID_LEVELS = new Set(['light', 'standard', 'editorial', 'custom']);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ghost_post_id, polish_level, polish_options, member_uuid } = req.body || {};

  if (!ghost_post_id || typeof ghost_post_id !== 'string') {
    return res.status(400).json({ error: 'ghost_post_id is required' });
  }
  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required' });
  }
  if (!polish_level || !VALID_LEVELS.has(polish_level)) {
    return res.status(400).json({
      error: 'polish_level is required and must be one of: light, standard, editorial, custom',
    });
  }

  try {
    // ── Auth: verify the requesting member is an admin ────────────────────
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('ghost_member_id', member_uuid)
      .maybeSingle();

    if (profileErr) throw profileErr;
    if (!profile) {
      return res.status(403).json({
        error: 'No Dialecta profile found for this member.',
      });
    }
    if (!profile.is_admin) {
      return res.status(403).json({
        error: 'Admin privileges required for re-polish operations.',
      });
    }

    // ── Fetch the article's saved original ────────────────────────────────
    const { data: article, error: articleErr } = await supabase
      .from('articles')
      .select('id, ghost_post_id, original_html, author_member_id')
      .eq('ghost_post_id', ghost_post_id)
      .maybeSingle();

    if (articleErr) throw articleErr;
    if (!article) {
      return res.status(404).json({
        error: 'Article not found in Supabase. Was it submitted via /api/article/submit?',
      });
    }

    let sourceHtml = article.original_html;
    if (!sourceHtml || sourceHtml.trim().length === 0) {
      // Pre-Polish-v2 articles don't have original_html stored. Fall back
      // to fetching the current Ghost HTML — non-ideal but still useful
      // (the article will be polished against the most-recent version
      // rather than its true original).
      const ghostFetch = await ghostAdminFetch('/posts/' + ghost_post_id + '/?formats=html');
      sourceHtml = ghostFetch?.posts?.[0]?.html;
      if (!sourceHtml) {
        return res.status(502).json({
          error: 'Could not retrieve article HTML from Supabase or Ghost.',
        });
      }
      // Back-fill the original_html so future re-polishes use the right source.
      await supabase
        .from('articles')
        .update({ original_html: sourceHtml })
        .eq('ghost_post_id', ghost_post_id);
    }

    const bytesBefore = sourceHtml.length;

    // ── Run Polish at the requested level ─────────────────────────────────
    const host  = req.headers['x-forwarded-host'] || req.headers.host || 'dialecta.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const polishUrl = proto + '://' + host + '/api/article/aesthetic-suggest';

    const polishResp = await fetch(polishUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        article_html:   sourceHtml,
        polish_level,
        polish_options: polish_options || null,
      }),
    });

    if (!polishResp.ok) {
      const text = await polishResp.text();
      return res.status(502).json({
        error: 'Polish engine failed',
        detail: polishResp.status + ': ' + text.slice(0, 500),
      });
    }

    const polish = await polishResp.json();
    const polishedHtml = polish.polished_html || sourceHtml;
    const changeLog    = Array.isArray(polish.change_log) ? polish.change_log : [];

    // ── Push the new polished HTML back to Ghost (PUT with optimistic lock) ─
    const ghostGet = await ghostAdminFetch('/posts/' + ghost_post_id + '/?formats=html');
    const updatedAt = ghostGet?.posts?.[0]?.updated_at;
    if (!updatedAt) {
      return res.status(502).json({
        error: 'Could not get updated_at from Ghost for optimistic locking.',
      });
    }

    await ghostAdminFetch('/posts/' + ghost_post_id + '/?source=html', {
      method: 'PUT',
      body:   JSON.stringify({
        posts: [{ html: polishedHtml, updated_at: updatedAt }],
      }),
    });

    // ── Update the Supabase row with the new polish settings ──────────────
    await supabase
      .from('articles')
      .update({
        polish_level,
        polish_options:    polish_options || null,
        polish_change_log: changeLog,
      })
      .eq('ghost_post_id', ghost_post_id);

    // ── Editorial notification to the author ──────────────────────────────
    // Fires after a successful re-polish so the author knows their published
    // text was edited by editorial. The createNotification self-actor guard
    // suppresses this when an author re-polishes their own article (the
    // admin == author case is unusual but harmless to skip). Wrapped so a
    // notification failure never reverses a successful re-polish.
    try {
      if (article.author_member_id) {
        const articleTitle = ghostGet?.posts?.[0]?.title || '';
        const articleUrl   = ghostGet?.posts?.[0]?.url || ('/p/' + ghost_post_id + '/');
        const message = articleTitle
          ? `Your article "${articleTitle}" was re-polished to ${polish_level} by editorial.`
          : `One of your articles was re-polished to ${polish_level} by editorial.`;
        await createNotification(supabase, {
          recipient_member_id: article.author_member_id,
          actor_member_id:     member_uuid,
          type:                'editorial',
          target_type:         'article',
          target_id:           ghost_post_id,
          target_url:          articleUrl,
          payload: {
            message,
            article_title: articleTitle,
            polish_level,
          },
        });
      }
    } catch (notifErr) {
      console.warn('editorial notification failed:', notifErr.message);
    }

    return res.status(200).json({
      ghost_post_id,
      polish_level,
      polish_change_log: changeLog,
      bytes_before:      bytesBefore,
      bytes_after:       polishedHtml.length,
    });
  } catch (error) {
    console.error('Repolish error:', error);
    return res.status(error.statusCode || 500).json({
      error: 'Repolish failed',
      detail: error.message,
    });
  }
}
