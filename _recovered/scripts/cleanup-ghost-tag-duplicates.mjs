/**
 * scripts/cleanup-ghost-tag-duplicates.mjs
 *
 * Finds Ghost tags with auto-disambiguation suffixes (e.g.,
 * `psychology_behavior-2`, `environment_energy-3`) where the canonical
 * unsuffixed slug also exists, re-tags any posts using the duplicate to
 * use the canonical, then deletes the duplicate.
 *
 * Why this exists: Ghost auto-suffixes a tag's slug when a tag with the
 * intended slug already exists (typically when a tag was created via the
 * admin UI vs. the API, or when names collide). After running
 * scripts/seed-ghost-tags.mjs to establish the canonical 12, any pre-
 * existing duplicates need to be merged so topic chip color-coding,
 * Ghost tag pages, and the Reach axis_events stay clean.
 *
 * Run from C:\dialecta-api\:
 *   node scripts/cleanup-ghost-tag-duplicates.mjs           # dry-run; reports what it WOULD do
 *   node scripts/cleanup-ghost-tag-duplicates.mjs --apply   # actually re-tags + deletes
 *
 * Reads .env.local for GHOST_ADMIN_API_URL + GHOST_ADMIN_API_KEY.
 *
 * Safety:
 *   - Only deletes a duplicate tag if (a) the canonical equivalent
 *     exists, AND (b) every post using the duplicate has been
 *     successfully re-tagged.
 *   - Dry-run is the default. Re-tagging + deletion only happens with
 *     --apply.
 *   - Each PUT/POST is logged so the operator can audit.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ───── env loader ─────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key   = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const GHOST_URL = process.env.GHOST_ADMIN_API_URL;
const ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY;
if (!GHOST_URL || !ADMIN_KEY) {
  console.error('Missing GHOST_ADMIN_API_URL or GHOST_ADMIN_API_KEY in .env.local');
  process.exit(1);
}
const [keyId, keySecret] = ADMIN_KEY.split(':');
if (!keyId || !keySecret) {
  console.error('GHOST_ADMIN_API_KEY must be <id>:<hex-secret>');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

// ───── JWT signing (HS256, dep-free) ──────────────────────────────────────

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function makeToken() {
  const header = { alg: 'HS256', typ: 'JWT', kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 5 * 60, aud: '/admin/' };
  const signingInput = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', Buffer.from(keySecret, 'hex'))
    .update(signingInput).digest();
  return signingInput + '.' + base64url(signature);
}

async function ghostFetch(pathSuffix, options = {}) {
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + pathSuffix;
  const headers = {
    Authorization: 'Ghost ' + makeToken(),
    'Content-Type': 'application/json',
    'Accept-Version': 'v5.0',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ghost API ${pathSuffix} → ${res.status}\n${text}`);
  }
  return text ? JSON.parse(text) : {};
}

// ───── Detect duplicates ──────────────────────────────────────────────────

// A duplicate is a tag whose slug matches `<canonical>-<digits>` where
// `<canonical>` is also an existing tag's slug. e.g. `economics-2` is a
// duplicate of `economics`.
const DUPLICATE_PATTERN = /^(.+)-(\d+)$/;

function detectDuplicates(allTags) {
  const bySlug = new Map(allTags.map(t => [t.slug, t]));
  const duplicates = [];
  for (const tag of allTags) {
    const m = tag.slug.match(DUPLICATE_PATTERN);
    if (!m) continue;
    const canonicalSlug = m[1];
    const canonical = bySlug.get(canonicalSlug);
    if (!canonical) continue; // -N suffix without a canonical is just a stand-alone tag
    duplicates.push({ duplicate: tag, canonical });
  }
  return duplicates;
}

// ───── Main ───────────────────────────────────────────────────────────────

(async () => {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'} (use --apply to actually mutate)`);
  console.log('Fetching all Ghost tags…');
  const tagsResp = await ghostFetch('/tags/?limit=all');
  const allTags = tagsResp.tags || [];
  console.log(`Found ${allTags.length} tag(s) total.`);

  const duplicates = detectDuplicates(allTags);
  if (duplicates.length === 0) {
    console.log('No duplicates with canonical equivalents found. Nothing to do.');
    return;
  }
  console.log(`Found ${duplicates.length} duplicate(s) to merge:`);
  for (const { duplicate, canonical } of duplicates) {
    console.log(`  • ${duplicate.slug.padEnd(28)} → ${canonical.slug}`);
  }

  let totalRetagged = 0;
  let totalDeleted  = 0;
  let totalFailed   = 0;

  for (const { duplicate, canonical } of duplicates) {
    console.log('');
    console.log(`── ${duplicate.slug} → ${canonical.slug} ──`);

    // Fetch posts that carry the duplicate tag.
    const postsResp = await ghostFetch(
      '/posts/?filter=' + encodeURIComponent(`tag:${duplicate.slug}`) +
      '&include=tags&limit=all'
    );
    const posts = postsResp.posts || [];
    console.log(`  ${posts.length} post(s) carry this tag.`);

    let retaggedThisTag = 0;
    let failedThisTag   = 0;

    for (const post of posts) {
      // Build the new tag list: replace the duplicate with the canonical
      // (via slug). Drop any duplicate-of-canonical that would arise.
      const seenSlugs = new Set();
      const newTags = [];
      for (const t of post.tags || []) {
        const slug = t.slug === duplicate.slug ? canonical.slug : t.slug;
        if (seenSlugs.has(slug)) continue;
        seenSlugs.add(slug);
        newTags.push({ slug });
      }

      console.log(`    ${post.slug.padEnd(46)} → tags: [${newTags.map(t => t.slug).join(', ')}]`);

      if (!APPLY) {
        retaggedThisTag++;
        continue;
      }

      try {
        await ghostFetch(`/posts/${post.id}/`, {
          method: 'PUT',
          body: JSON.stringify({
            posts: [{
              tags: newTags,
              updated_at: post.updated_at,
            }],
          }),
        });
        retaggedThisTag++;
      } catch (err) {
        console.error(`    × FAILED to re-tag ${post.slug}: ${err.message}`);
        failedThisTag++;
      }
    }

    totalRetagged += retaggedThisTag;
    totalFailed   += failedThisTag;

    if (failedThisTag > 0) {
      console.log(`  Skipping delete of ${duplicate.slug}: ${failedThisTag} post(s) failed to re-tag.`);
      continue;
    }

    // Delete the (now unreferenced) duplicate tag.
    if (!APPLY) {
      console.log(`  WOULD delete tag: ${duplicate.slug}`);
      continue;
    }
    try {
      await ghostFetch(`/tags/${duplicate.id}/`, { method: 'DELETE' });
      console.log(`  ✓ deleted tag ${duplicate.slug}`);
      totalDeleted++;
    } catch (err) {
      console.error(`  × FAILED to delete tag ${duplicate.slug}: ${err.message}`);
      totalFailed++;
    }
  }

  console.log('');
  console.log('───────────────────────────────────');
  console.log(`Mode    : ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Re-tagged posts : ${totalRetagged}`);
  console.log(`Deleted tags    : ${totalDeleted}`);
  console.log(`Failed          : ${totalFailed}`);
  console.log('───────────────────────────────────');
  if (!APPLY && (totalRetagged > 0)) {
    console.log('Re-run with --apply to actually mutate Ghost.');
  }
})();
