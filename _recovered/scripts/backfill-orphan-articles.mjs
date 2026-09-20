/**
 * scripts/backfill-orphan-articles.mjs
 *
 * One-shot backfill: find Ghost posts that exist on Ghost but have no
 * matching row in the Supabase `articles` table (typically posts created
 * by `seed-articles.mjs` before the Dialecta /write/ flow existed), use
 * Claude to infer the 5-question author declaration from the post text,
 * run that through the article classifier, and INSERT a complete row so
 * the post is visible to the steward-order classifier, fingerprint,
 * profile stats, and feed surfaces.
 *
 * SAFETY: dry-run by default. Pass --apply to actually write.
 *
 * Usage:
 *   node scripts/backfill-orphan-articles.mjs                  # dry-run all orphans
 *   node scripts/backfill-orphan-articles.mjs --apply          # WRITE all orphans
 *   node scripts/backfill-orphan-articles.mjs --slug=foo       # dry-run one
 *   node scripts/backfill-orphan-articles.mjs --slug=foo --apply
 *   node scripts/backfill-orphan-articles.mjs --post=<24-hex>  # by Ghost post id
 *
 * Env (read from .env.local):
 *   GHOST_ADMIN_API_URL    https://www.dialecta.org
 *   GHOST_ADMIN_API_KEY    <id>:<secret>
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *   ANTHROPIC_API_KEY
 *   DIALECTA_API_BASE      defaults to https://dialecta.vercel.app
 *
 * Writes a JSON log next to the script for review.
 */

import crypto from 'node:crypto';
import fs     from 'node:fs';
import path   from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
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
const APPLY  = !!args.apply;
const SLUG   = args.slug || null;
const POSTID = args.post || null;
const LIMIT  = args.limit ? parseInt(args.limit, 10) : null;
const DRY    = !APPLY;

const GHOST_URL = process.env.GHOST_ADMIN_API_URL;
const ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY;
const API_BASE  = process.env.DIALECTA_API_BASE || 'https://dialecta.vercel.app';

for (const [k, v] of [
  ['GHOST_ADMIN_API_URL',  GHOST_URL],
  ['GHOST_ADMIN_API_KEY',  ADMIN_KEY],
  ['SUPABASE_URL',         process.env.SUPABASE_URL],
  ['SUPABASE_SERVICE_KEY', process.env.SUPABASE_SERVICE_KEY],
  ['ANTHROPIC_API_KEY',    process.env.ANTHROPIC_API_KEY],
]) {
  if (!v) {
    console.error('Missing ' + k + ' in .env.local');
    process.exit(1);
  }
}

const [keyId, keySecret] = ADMIN_KEY.split(':');

// ── Ghost admin JWT (HS256, dep-free) ─────────────────────────────────────
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

// ── Clients ──────────────────────────────────────────────────────────────
const supabase  = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Helpers ──────────────────────────────────────────────────────────────
function htmlToPlaintext(html) {
  return (html || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Steps ────────────────────────────────────────────────────────────────

async function listPublishedPosts() {
  const all = [];
  let page = 1;
  for (;;) {
    const resp = await ghostFetch(
      '/posts/?filter=status:published&limit=50&page=' + page +
      '&include=authors&formats=html,plaintext&fields=id,slug,title,html,plaintext,custom_excerpt,published_at'
    );
    all.push(...resp.posts);
    const next = resp.meta?.pagination?.next;
    if (!next) break;
    page = next;
  }
  return all;
}

async function existingGhostPostIds() {
  const ids = new Set();
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('articles')
      .select('ghost_post_id')
      .range(from, from + 999);
    if (error) throw error;
    for (const r of data || []) ids.add(r.ghost_post_id);
    if (!data || data.length < 1000) break;
    from += 1000;
  }
  return ids;
}

async function profilesByDisplayName() {
  const { data, error } = await supabase
    .from('profiles')
    .select('ghost_member_id, display_name, is_author');
  if (error) throw error;
  const map = new Map();
  for (const p of data || []) {
    if (p.display_name) map.set(p.display_name.trim().toLowerCase(), p);
  }
  return map;
}

async function inferDeclaration(articleText, title) {
  // Three required fields. opinion_axes is optional in submit.js and
  // omitted here — it requires authorial intent we can't reliably infer.
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            core_claim:          { type: 'string' },
            scope_boundary:      { type: 'string' },
            strongest_objection: { type: 'string' },
          },
          required: ['core_claim', 'scope_boundary', 'strongest_objection'],
          additionalProperties: false,
        },
      },
    },
    messages: [{
      role: 'user',
      content:
`Read this Dialecta article and write the author's 3-question declaration on their behalf — these are the questions Dialecta asks every author to answer before publishing:

1. Core Claim: In one sentence, what is this piece arguing? (Specific, not vague.)
2. Scope Boundary: What is this NOT about? What is the author deliberately NOT covering?
3. Strongest Objection: What is the strongest reasonable disagreement with this piece? Steel-man it; a thoughtful reader's best counter-argument.

Be concrete and specific to the actual content of the article. Do NOT use em dashes (—) anywhere in your output. Use commas, periods, parens.

TITLE: ${title}

ARTICLE:
"""
${articleText.slice(0, 18000)}
"""

Return JSON only.`,
    }],
  });
  const block = message.content.find(b => b.type === 'text');
  if (!block?.text) throw new Error('Declaration inference returned no text');
  return JSON.parse(block.text);
}

async function classifyArticle({ article_text, declaration, declared_tier }) {
  const res = await fetch(API_BASE.replace(/\/$/, '') + '/api/article/classify', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ article_text, declaration, declared_tier }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('classify ' + res.status + ': ' + txt.slice(0, 400));
  }
  return res.json();
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('Mode: ' + (DRY ? 'DRY-RUN' : 'APPLY'));
  console.log('API base: ' + API_BASE);

  const [posts, existingIds, displayNameMap] = await Promise.all([
    listPublishedPosts(),
    existingGhostPostIds(),
    profilesByDisplayName(),
  ]);
  console.log('Ghost posts (published): ' + posts.length);
  console.log('Existing articles rows:  ' + existingIds.size);

  let orphans = posts.filter(p => !existingIds.has(p.id));
  if (SLUG)   orphans = orphans.filter(p => p.slug === SLUG);
  if (POSTID) orphans = orphans.filter(p => p.id === POSTID);
  if (LIMIT)  orphans = orphans.slice(0, LIMIT);

  console.log('Orphans to backfill:     ' + orphans.length);
  if (orphans.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  const log = [];

  for (const post of orphans) {
    const author = post.authors?.[0];
    const authorName = author?.name || '(unknown)';
    const profile = displayNameMap.get(authorName.trim().toLowerCase());
    const ghost_member_id = profile?.ghost_member_id || null;

    const text = post.plaintext || htmlToPlaintext(post.html || '');
    const wc = text.split(/\s+/).filter(Boolean).length;

    console.log('');
    console.log('▸ ' + post.title);
    console.log('  ghost_post_id: ' + post.id);
    console.log('  author:        ' + authorName + ' → ' + (ghost_member_id || 'NO PROFILE MATCH'));
    console.log('  word count:    ' + wc);

    const entry = {
      ghost_post_id:   post.id,
      slug:            post.slug,
      title:           post.title,
      author_name:     authorName,
      author_member_id: ghost_member_id,
      word_count:      wc,
      status:          'pending',
    };

    if (!ghost_member_id) {
      entry.status = 'skipped';
      entry.reason = 'No Supabase profile matches author display_name';
      console.log('  → SKIP (no profile for "' + authorName + '")');
      log.push(entry);
      continue;
    }

    if (text.length < 200) {
      entry.status = 'skipped';
      entry.reason = 'Article text too short (< 200 chars)';
      console.log('  → SKIP (too short)');
      log.push(entry);
      continue;
    }

    try {
      console.log('  inferring declaration...');
      const declaration = await inferDeclaration(text, post.title);
      entry.declaration = declaration;
      console.log('    core_claim: ' + declaration.core_claim.slice(0, 100));

      console.log('  classifying article...');
      const ai_analysis = await classifyArticle({
        article_text:  text,
        declaration,
        declared_tier: 'forum',
      });
      entry.ai_analysis = ai_analysis;
      const tier = ai_analysis.ai_suggested_tier;
      console.log('    suggested tier: ' + tier);

      if (DRY) {
        entry.status = 'dry_run_ok';
        console.log('  → DRY (would insert)');
      } else {
        const insertRow = {
          ghost_post_id:     post.id,
          author_member_id:  ghost_member_id,
          status:            'published',
          declared_tier:     'forum',
          ai_suggested_tier: tier,
          final_tier:        tier,
          declaration,
          ai_analysis,
        };
        const { error: insertErr } = await supabase
          .from('articles')
          .insert(insertRow);
        if (insertErr) throw insertErr;
        entry.status = 'inserted';
        console.log('  → INSERTED');
      }
    } catch (err) {
      entry.status = 'error';
      entry.error  = err.message;
      console.log('  → ERROR: ' + err.message);
    }

    log.push(entry);
  }

  // Summary
  const byStatus = log.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});
  console.log('');
  console.log('Summary:', byStatus);

  // Persist log
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.resolve(__dirname, 'backfill-orphan-articles-' + ts + '.log.json');
  fs.writeFileSync(logPath, JSON.stringify({
    mode: DRY ? 'dry-run' : 'apply',
    apiBase: API_BASE,
    summary: byStatus,
    entries: log,
  }, null, 2));
  console.log('Log: ' + logPath);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
