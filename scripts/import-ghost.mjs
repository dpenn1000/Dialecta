#!/usr/bin/env node
/**
 * One-time import of Ghost posts into the native Supabase articles table.
 *
 * Ghost is out (docs/decisions/ ADR-001, ADR-003). This script exists only to
 * carry the existing posts across. It is idempotent: rows are upserted on
 * articles.ghost_post_id, so it can be re-run until the Ghost site is shut off.
 *
 * Usage, from the repo root:
 *   GHOST_CONTENT_URL=https://dialecta.mymagic.page \
 *   GHOST_CONTENT_KEY=... \
 *   SUPABASE_URL=https://xyz.supabase.co \
 *   SUPABASE_SERVICE_KEY=... \
 *   node scripts/import-ghost.mjs [--dry-run] [--author-id <profiles.user_id>]
 *
 * Env: GHOST_CONTENT_URL, GHOST_CONTENT_KEY (Ghost Content API, read only),
 *      SUPABASE_URL, SUPABASE_SERVICE_KEY (service role, bypasses RLS).
 *      The root .env.example lists them. A .env.local in the repo root is read if present.
 *
 * What it writes per post: slug, title, excerpt, body_html, ghost_post_id,
 * published_at, status 'published', body_json '{}'.
 * TODO: convert body_html to TipTap JSON for body_json once the editor island
 * (backlog A-10) fixes the document schema. Until then articles imported here
 * render from body_html and open in the editor as empty documents.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env.local loader so the script needs no extra dependency.
const envFile = resolve(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const authorFlag = args.indexOf('--author-id');
const authorId = authorFlag >= 0 ? args[authorFlag + 1] : null;

const ghostUrl = process.env.GHOST_CONTENT_URL?.replace(/\/+$/, '');
const ghostKey = process.env.GHOST_CONTENT_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

const missing = [
  ['GHOST_CONTENT_URL', ghostUrl],
  ['GHOST_CONTENT_KEY', ghostKey],
  ['SUPABASE_URL', supabaseUrl],
  ['SUPABASE_SERVICE_KEY', serviceKey],
]
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Missing env: ${missing.join(', ')}`);
  process.exit(1);
}

async function fetchAllPosts() {
  const posts = [];
  let page = 1;
  for (;;) {
    const params = new URLSearchParams({
      key: ghostKey,
      include: 'authors,tags',
      formats: 'html',
      fields: 'id,slug,title,html,custom_excerpt,excerpt,published_at,updated_at',
      limit: '50',
      page: String(page),
      order: 'published_at asc',
    });
    const res = await fetch(`${ghostUrl}/ghost/api/content/posts/?${params}`, {
      headers: { 'Accept-Version': 'v5.0' },
    });
    if (!res.ok) throw new Error(`Ghost Content API ${res.status} on page ${page}`);
    const data = await res.json();
    posts.push(...data.posts);
    const next = data.meta?.pagination?.next;
    if (!next) break;
    page = next;
  }
  return posts;
}

function toRow(post) {
  return {
    ghost_post_id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.custom_excerpt ?? post.excerpt ?? null,
    topic: post.primary_tag?.name ?? post.tags?.[0]?.name ?? null,
    body_html: post.html ?? '',
    body_json: {}, // TODO: HTML to TipTap JSON, see header
    status: 'published',
    published_at: post.published_at,
    ...(authorId ? { author_id: authorId } : {}),
  };
}

const posts = await fetchAllPosts();
console.log(`Fetched ${posts.length} post(s) from Ghost`);

const rows = posts.map(toRow);
if (dryRun) {
  for (const r of rows) console.log(`  ${r.slug}  (${r.published_at})  ${r.body_html.length} chars`);
  console.log('Dry run, nothing written.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const { data, error } = await supabase
  .from('articles')
  .upsert(rows, { onConflict: 'ghost_post_id' })
  .select('id, slug');
if (error) {
  console.error('Upsert failed:', error.message);
  process.exit(1);
}
console.log(`Upserted ${data.length} article(s):`);
for (const r of data) console.log(`  ${r.slug}  ${r.id}`);
