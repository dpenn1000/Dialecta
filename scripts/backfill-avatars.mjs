#!/usr/bin/env node
/**
 * backfill-avatars.mjs
 *
 * One-time pass: re-process every Ghost-hosted profile avatar through the
 * same sharp pipeline that runs on new uploads (1024 px long edge, WebP at
 * q80, EXIF stripped, EXIF rotation honored). Writes the new URL back to
 * profiles.avatar_url. Idempotent on re-run: avatar URLs already ending
 * in .webp are skipped.
 *
 * External avatars (Gravatar etc.) are NOT processed — we only touch
 * URLs hosted on this Ghost instance, since processing externals would
 * import them onto our CDN and lose freshness if the user updates them.
 *
 * Why this is needed: avatars uploaded before the upload-image transform
 * shipped landed on disk at their full original size (often multi-MB
 * PNGs from phone cameras). Article hero images are handled differently
 * — the theme uses Ghost's URL transform helper {{img_url}} so they're
 * already served at appropriate widths from existing originals. Avatars
 * are inlined as plain <img src> in many surfaces, so the underlying
 * file weight matters.
 *
 * Usage (from the API repo root, Node 20+):
 *   node --env-file=.env.local scripts/backfill-avatars.mjs --dry-run   # report only
 *   node --env-file=.env.local scripts/backfill-avatars.mjs             # apply
 *   node --env-file=.env.local scripts/backfill-avatars.mjs --force     # re-process even .webp avatars
 *
 * Env required: SUPABASE_URL, SUPABASE_SERVICE_KEY, GHOST_ADMIN_API_URL,
 * GHOST_ADMIN_API_KEY. Node's --env-file flag loads .env.local without
 * needing dotenv.
 */

import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { ghostAdminFetch } from '../api/_ghost-admin.js';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE   = process.argv.includes('--force');

const TRANSFORM = { maxWidth: 1024, quality: 80 };

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

function ghostHost() {
  return (process.env.GHOST_ADMIN_API_URL || '').replace(/\/$/, '');
}

function isGhostHosted(url) {
  if (!url || typeof url !== 'string') return false;
  const host = ghostHost();
  if (!host) return false;
  // Match exactly the configured Ghost URL OR any www. variant — Magic
  // Pages serves both apex and www and Ghost can return either depending
  // on the configured site URL.
  const hostname = new URL(host).hostname.replace(/^www\./, '');
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') === hostname && u.pathname.startsWith('/content/images/');
  } catch {
    return false;
  }
}

function alreadyWebp(url) {
  return /\.webp(\?|$)/i.test(url || '');
}

async function downloadImage(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('GET ' + url + ' returned ' + r.status);
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

async function transformAndUpload(buffer, originalUrl) {
  const out = await sharp(buffer, { animated: false })
    .rotate()
    .resize({
      width:  TRANSFORM.maxWidth,
      height: TRANSFORM.maxWidth,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: TRANSFORM.quality, effort: 4 })
    .toBuffer();

  // Reuse the original filename stem so the upload feels traceable in
  // Ghost's image library, with the .webp extension.
  let stem = 'avatar';
  try {
    const u = new URL(originalUrl);
    const last = u.pathname.split('/').pop() || '';
    stem = last.replace(/\.[^.]+$/, '') || 'avatar';
  } catch { /* keep default */ }
  const filename = stem + '.webp';

  const formData = new FormData();
  formData.append('file', new Blob([out], { type: 'image/webp' }), filename);
  formData.append('purpose', 'image');

  const ghostResp = await ghostAdminFetch('/images/upload/', {
    method: 'POST',
    body: formData,
  });
  const newUrl = ghostResp?.images?.[0]?.url;
  if (!newUrl) {
    throw new Error('Ghost returned no image URL: ' + JSON.stringify(ghostResp).slice(0, 300));
  }
  return { url: newUrl, bytes: out.length };
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in env. Check .env.local in the API repo root.');
    process.exit(1);
  }
  if (!process.env.GHOST_ADMIN_API_URL || !process.env.GHOST_ADMIN_API_KEY) {
    console.error('Missing GHOST_ADMIN_API_URL or GHOST_ADMIN_API_KEY in env. Check .env.local in the API repo root.');
    process.exit(1);
  }

  console.log(DRY_RUN ? '── DRY RUN ── (no writes)' : '── APPLYING ──');
  console.log('Querying profiles where avatar_url is set ...');

  const { data: rows, error: queryErr } = await supabase
    .from('profiles')
    .select('id, ghost_member_id, display_name, avatar_url')
    .not('avatar_url', 'is', null);

  if (queryErr) {
    console.error('Supabase query failed:', queryErr.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No avatars on file. Done.');
    return;
  }

  // Partition before processing so the run plan is visible up front.
  const eligible = [];
  let skipExternal = 0;
  let skipWebp = 0;
  for (const p of rows) {
    if (!isGhostHosted(p.avatar_url)) { skipExternal++; continue; }
    if (!FORCE && alreadyWebp(p.avatar_url)) { skipWebp++; continue; }
    eligible.push(p);
  }

  console.log(`Total avatars: ${rows.length}`);
  console.log(`  External (Gravatar etc.) — skipped: ${skipExternal}`);
  console.log(`  Already WebP — skipped (use --force to override): ${skipWebp}`);
  console.log(`  Will process: ${eligible.length}`);

  if (eligible.length === 0) return;

  let processed = 0;
  let failed = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const p of eligible) {
    const tag = p.display_name || p.ghost_member_id;
    let beforeBytes = 0;
    try {
      const buffer = await downloadImage(p.avatar_url);
      beforeBytes = buffer.length;
      totalBefore += beforeBytes;

      if (DRY_RUN) {
        // Dry-run still does the transform locally so we can report the
        // savings, but doesn't upload to Ghost or update Supabase.
        const out = await sharp(buffer, { animated: false })
          .rotate()
          .resize({ width: TRANSFORM.maxWidth, height: TRANSFORM.maxWidth, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: TRANSFORM.quality, effort: 4 })
          .toBuffer();
        totalAfter += out.length;
        console.log(`  · ${tag}  ${(beforeBytes/1024).toFixed(0)} KB → ${(out.length/1024).toFixed(0)} KB  (${Math.round((1 - out.length/beforeBytes) * 100)}% smaller)`);
        processed++;
        continue;
      }

      const { url: newUrl, bytes: afterBytes } = await transformAndUpload(buffer, p.avatar_url);
      totalAfter += afterBytes;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: newUrl })
        .eq('id', p.id);

      if (updateErr) {
        console.log(`  X ${tag}  update failed: ${updateErr.message}`);
        failed++;
      } else {
        console.log(`  + ${tag}  ${(beforeBytes/1024).toFixed(0)} KB → ${(afterBytes/1024).toFixed(0)} KB  ${newUrl}`);
        processed++;
      }
    } catch (err) {
      console.log(`  X ${tag}  ${err.message}`);
      failed++;
    }
  }

  const beforeKB = (totalBefore / 1024).toFixed(0);
  const afterKB  = (totalAfter / 1024).toFixed(0);
  const pct      = totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;
  console.log(`\nSummary: ${processed} ${DRY_RUN ? 'would-process' : 'processed'}, ${failed} failed.`);
  console.log(`Bytes: ${beforeKB} KB → ${afterKB} KB  (${pct}% reduction)`);
  if (DRY_RUN) console.log('Dry run complete. Re-run without --dry-run to apply.');
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
