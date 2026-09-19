/**
 * scripts/polish-articles.mjs
 *
 * Migration / re-polish script. Updated for Polish v2: defaults to the
 * 'light' level (hygiene + structure recognition only — no rhythm tools),
 * which is the new platform default. Pass --level to override.
 *
 * Each article gets its current Ghost HTML captured to articles.original_html
 * before re-polishing (if not already saved). This makes future re-polish
 * non-destructive — the engine always operates on the author's submitted
 * version, not the previously-polished output.
 *
 * SAFETY: dry-run by default. Pass --apply to actually write.
 *
 * Usage:
 *   node scripts/polish-articles.mjs                                      # dry-run all at light
 *   node scripts/polish-articles.mjs --slug=foo                           # dry-run one
 *   node scripts/polish-articles.mjs --slug=foo --apply                   # WRITE one at light
 *   node scripts/polish-articles.mjs --slug=foo --level=editorial --apply # WRITE one at editorial
 *   node scripts/polish-articles.mjs --apply                              # WRITE all at light
 *
 * Env (read from .env.local):
 *   GHOST_ADMIN_API_URL    https://www.dialecta.org
 *   GHOST_ADMIN_API_KEY    <id>:<secret>
 *   SUPABASE_URL           Supabase project URL
 *   SUPABASE_SERVICE_KEY   service-role key (bypasses RLS)
 *   DIALECTA_API_BASE      defaults to https://dialecta.vercel.app
 *
 * Each run writes a JSON log next to the script with per-article results.
 */

import crypto from 'node:crypto';
import fs     from 'node:fs';
import path   from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local (no dep on dotenv) ────────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── Args ──────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const eq = a.indexOf('=');
    return eq === -1
      ? [a.replace(/^--/, ''), true]
      : [a.slice(2, eq), a.slice(eq + 1)];
  })
);
const APPLY    = !!args.apply;
const SLUG     = args.slug || null;
const LIMIT    = args.limit ? parseInt(args.limit, 10) : null;
const THROTTLE = args.throttle ? parseInt(args.throttle, 10) : 1500;
const LEVEL    = ['light', 'standard', 'editorial'].includes(args.level) ? args.level : 'light';
const DRY      = !APPLY;

const GHOST_URL  = process.env.GHOST_ADMIN_API_URL;
const ADMIN_KEY  = process.env.GHOST_ADMIN_API_KEY;
const SUPA_URL   = process.env.SUPABASE_URL;
const SUPA_KEY   = process.env.SUPABASE_SERVICE_KEY;
const API_BASE   = process.env.DIALECTA_API_BASE || 'https://dialecta.vercel.app';

if (!GHOST_URL || !ADMIN_KEY) {
  console.error('Missing GHOST_ADMIN_API_URL or GHOST_ADMIN_API_KEY in .env.local');
  process.exit(1);
}
if (!SUPA_URL || !SUPA_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_KEY);

const [keyId, keySecret] = ADMIN_KEY.split(':');

// ── Ghost JWT auth ────────────────────────────────────────────────────────
function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function makeToken() {
  const header  = { alg: 'HS256', typ: 'JWT', kid: keyId };
  const now     = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 5 * 60, aud: '/admin/' };
  const input   = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const sig     = crypto.createHmac('sha256', Buffer.from(keySecret, 'hex')).update(input).digest();
  return input + '.' + base64url(sig);
}

async function ghostFetch(suffix, options = {}) {
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + suffix;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization:    'Ghost ' + makeToken(),
      'Content-Type':   'application/json',
      'Accept-Version': 'v5.0',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error('Ghost ' + suffix + ' → ' + res.status + ': ' + text.slice(0, 400));
  }
  return JSON.parse(text);
}

// ── Workers ──────────────────────────────────────────────────────────────
async function listPublishedPosts() {
  const all = [];
  let page = 1;
  for (;;) {
    const resp = await ghostFetch(
      '/posts/?filter=status:published&limit=50&page=' + page +
      '&formats=html&fields=id,slug,title,html,updated_at,feature_image'
    );
    all.push(...resp.posts);
    const next = resp.meta?.pagination?.next;
    if (!next) break;
    page = next;
  }
  return all;
}

async function callPolish(article_html, polish_level) {
  const res = await fetch(API_BASE + '/api/article/aesthetic-suggest', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      article_html,
      polish_level: polish_level || 'light',
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error('Polish → ' + res.status + ': ' + text.slice(0, 400));
  }
  return JSON.parse(text);
}

// Capture the current Ghost HTML as articles.original_html so future
// re-polishes can operate on the author's submitted version. Idempotent —
// only writes if original_html is currently NULL.
async function captureOriginalIfMissing(ghostPostId, currentHtml) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, original_html')
    .eq('ghost_post_id', ghostPostId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { captured: false, reason: 'no-supabase-row' };
  if (data.original_html && data.original_html.length > 0) {
    return { captured: false, reason: 'already-captured' };
  }
  const { error: updErr } = await supabase
    .from('articles')
    .update({ original_html: currentHtml })
    .eq('id', data.id);
  if (updErr) throw updErr;
  return { captured: true, articleId: data.id };
}

async function recordPolishMeta(ghostPostId, level, changeLog) {
  const { error } = await supabase
    .from('articles')
    .update({
      polish_level:      level,
      polish_change_log: changeLog,
    })
    .eq('ghost_post_id', ghostPostId);
  if (error) throw error;
}

async function applyPolish(postId, polished_html) {
  // Re-fetch updated_at right before PUT (Ghost optimistic locking).
  const fresh     = await ghostFetch('/posts/' + postId + '/?formats=html');
  const updatedAt = fresh.posts[0].updated_at;
  await ghostFetch('/posts/' + postId + '/?source=html', {
    method: 'PUT',
    body:   JSON.stringify({
      posts: [{ html: polished_html, updated_at: updatedAt }],
    }),
  });
}

const ALLOWED = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote']);
function strippedTags(html) {
  const set = new Set();
  const re  = /<(\/?[a-z][a-z0-9-]*)\b/gi;
  let m;
  while ((m = re.exec(html))) set.add(m[1].replace(/^\//, '').toLowerCase());
  return [...set].filter(t => !ALLOWED.has(t));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('==========================================================');
  console.log(' DIALECTA POLISH MIGRATION');
  console.log('==========================================================');
  console.log(' Mode:        ' + (DRY ? 'DRY RUN (no writes)' : 'APPLY (writing to Ghost + Supabase)'));
  console.log(' Polish level:' + LEVEL);
  console.log(' API base:    ' + API_BASE);
  console.log(' Ghost URL:   ' + GHOST_URL);
  if (SLUG)  console.log(' Slug filter: ' + SLUG);
  if (LIMIT) console.log(' Limit:       ' + LIMIT);
  console.log(' Throttle:    ' + THROTTLE + ' ms between calls');
  console.log('');

  console.log('Fetching published posts from Ghost...');
  let posts = await listPublishedPosts();
  console.log('Found ' + posts.length + ' published post(s) total.');

  if (SLUG)  posts = posts.filter(p => p.slug === SLUG);
  if (LIMIT) posts = posts.slice(0, LIMIT);

  console.log('Will process ' + posts.length + ' post(s).\n');

  const results = [];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    console.log('[' + (i + 1) + '/' + posts.length + '] ' + p.slug);
    console.log('    Title:    ' + p.title);
    console.log('    Original: ' + (p.html?.length || 0) + ' bytes');

    if (!p.html || p.html.length < 200) {
      console.log('    SKIP: HTML too short for Polish (< 200 chars)');
      results.push({ slug: p.slug, status: 'skipped', reason: 'too-short' });
      console.log('');
      continue;
    }

    const stripped = strippedTags(p.html);
    if (stripped.length > 0) {
      console.log('    NOTE: original contains tags Polish will not preserve: ' + stripped.join(', '));
      console.log('          (Common: figure/img from Koenig cards. Inline images would be lost.)');
    }

    // Capture current Ghost HTML as articles.original_html before any
    // polish writes — only happens once (idempotent).
    let captureNote = '';
    if (!DRY) {
      try {
        const cap = await captureOriginalIfMissing(p.id, p.html);
        if (cap.captured) captureNote = ' [original_html captured]';
        else if (cap.reason === 'already-captured') captureNote = ' [original already saved]';
        else if (cap.reason === 'no-supabase-row') captureNote = ' [no Supabase row — this article predates the articles table]';
      } catch (err) {
        console.log('    SUPABASE WRITE FAILED: ' + err.message);
      }
      if (captureNote) console.log('    Capture:    ' + captureNote.trim());
    }

    let polish;
    try {
      polish = await callPolish(p.html, LEVEL);
    } catch (err) {
      console.log('    POLISH FAILED: ' + err.message);
      results.push({ slug: p.slug, status: 'polish-failed', error: err.message });
      await sleep(THROTTLE);
      console.log('');
      continue;
    }

    const changeLog   = polish.change_log || [];
    const polishedLen = (polish.polished_html || '').length;
    console.log('    Changes:     ' + changeLog.length);
    if (changeLog.length > 0) {
      changeLog.forEach(c => console.log('       · ' + c));
    }
    console.log('    Polished:    ' + polishedLen + ' bytes');

    if (!polish.polished_html || polish.polished_html === p.html) {
      console.log('    SKIP: polished output identical to original');
      results.push({ slug: p.slug, status: 'skipped', reason: 'no-changes' });
      await sleep(THROTTLE);
      console.log('');
      continue;
    }

    if (DRY) {
      console.log('    [dry-run] would write ' + polishedLen + ' bytes back to Ghost');
      results.push({
        slug: p.slug, id: p.id, status: 'would-apply',
        changeLog, originalLen: p.html.length, polishedLen,
        stripped,
      });
    } else {
      try {
        await applyPolish(p.id, polish.polished_html);
        await recordPolishMeta(p.id, LEVEL, changeLog);
        console.log('    APPLIED ✓');
        results.push({
          slug: p.slug, id: p.id, status: 'applied',
          level: LEVEL, changeLog,
          originalLen: p.html.length, polishedLen,
        });
      } catch (err) {
        console.log('    APPLY FAILED: ' + err.message);
        results.push({ slug: p.slug, status: 'apply-failed', error: err.message });
      }
    }

    console.log('');
    await sleep(THROTTLE);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('==========================================================');
  console.log(' SUMMARY');
  console.log('==========================================================');
  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  for (const [s, n] of Object.entries(counts)) console.log('  ' + s + ': ' + n);
  console.log('');

  // Log file alongside the script
  const stamp   = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.resolve(__dirname, 'polish-articles-' + stamp + '.log.json');
  fs.writeFileSync(logPath, JSON.stringify({
    mode:    DRY ? 'dry-run' : 'apply',
    apiBase: API_BASE,
    when:    new Date().toISOString(),
    results,
  }, null, 2));
  console.log('Log: ' + logPath);

  if (DRY && results.some(r => r.status === 'would-apply')) {
    console.log('\nReview the log, then re-run with --apply to write changes.');
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
