#!/usr/bin/env node
/**
 * One-time migration of the five article feature images from Ghost/Magic Pages
 * into Supabase Storage, and the row rewrite that points articles.feature_image
 * at each one.
 *
 * Written 2026-09-21 by the migrator seat, phase B of the Ghost image migration.
 * NOT RUN by that session: writing the database or Storage was outside its
 * mandate. Source data (paths, hashes, article ids): team/migrator/knowledge/
 * 2026-ghost-article-images-manifest.md. Read that file and the sibling plan
 * (2026-ghost-article-images-migration-plan.md) before running this.
 *
 * Prerequisites this script does NOT do for you:
 *   - The `article-media` bucket must already exist (a supabase/migrations/
 *     file, not written by this script; see the plan, "Repointing the rows"
 *     step 1). Uploads fail cleanly if it does not.
 *   - articles.feature_image must already exist as a nullable text column
 *     (same migration). The SQL this script prints assumes it does; it does
 *     not create it.
 *
 * What this script does, in two separate modes:
 *
 *   1. Upload mode (--upload): reads the five local files, verifies each
 *      against its manifest sha256 BEFORE sending anything, uploads to
 *      `article-media` at the same content/images/YYYY/MM/<name> path the
 *      manifest records, then downloads each object back and re-hashes it.
 *      Refuses to touch a path that already exists in the bucket (upsert:
 *      false) rather than silently overwrite something. Never runs any SQL;
 *      this script holds no Postgres connection at all, only the Supabase
 *      project URL and the Storage REST surface via @supabase/supabase-js.
 *
 *   2. SQL mode (always, after upload succeeds, or on its own via
 *      --print-sql-only): prints, to stdout, the single-transaction row
 *      rewrite from the plan. It is printed for a human or another agent to
 *      read and run through their own migration path, never executed by this
 *      script.
 *
 * Usage, from the repo root:
 *   SUPABASE_URL=https://mguulnibvzusfvyuowwh.supabase.co \
 *   SUPABASE_SERVICE_KEY=... \
 *   node scripts/migrate-article-images.mjs --upload
 *
 *   node scripts/migrate-article-images.mjs --print-sql-only   # no env needed
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY (service role; Storage writes need
 *      it, the anon key cannot create objects in a bucket with no insert
 *      policy, which is the state the plan leaves article-media in for
 *      reading, not writing). Read from the environment only. A .env.local in
 *      the repo root is read if present, the same minimal loader
 *      scripts/import-ghost.mjs uses. The key is never logged, printed, or
 *      included in any error message this script constructs.
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env.local loader, same shape as scripts/import-ghost.mjs. This
// script never reads a dotenv file directly by path outside this loader, and
// never prints a value it loads.
const envFile = resolve(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const args = process.argv.slice(2);
const doUpload = args.includes('--upload');
const sqlOnly = args.includes('--print-sql-only');

const BUCKET = 'article-media';

// Transcribed from team/migrator/knowledge/2026-ghost-article-images-manifest.md,
// 2026-09-21. Local paths are relative to _migration/ghost-images/ (gitignored;
// see the manifest for provenance, sha256, dimensions and per-row notes on the
// two files whose `_o` original was unstable across checks).
const ENTRIES = [
  {
    ghostPostId: '69eff72be5eec200010d5310',
    slug: 'on-the-far-shore-of-fear',
    localPath: 'content/images/2026/04/v855sq14xoazk8EBm4D6o9WUjoc3qMMtQLZ2u6nBw-iLLwOVbYT_X5UiefLJW7RP-hQOojPn8GpLXnjayqxFCRzY9Bx9U2xaPDMBEcUkvpdD57Qdk6c_M6vMCxG2-wQ_5zN5Ti7_gQjZ9G-oecaVdr5udjGNixitmnrtwAfutTcoPAFoF_LRau7EDzfDtT0O_o.jpg',
    storagePath: 'content/images/2026/04/v855sq14xoazk8EBm4D6o9WUjoc3qMMtQLZ2u6nBw-iLLwOVbYT_X5UiefLJW7RP-hQOojPn8GpLXnjayqxFCRzY9Bx9U2xaPDMBEcUkvpdD57Qdk6c_M6vMCxG2-wQ_5zN5Ti7_gQjZ9G-oecaVdr5udjGNixitmnrtwAfutTcoPAFoF_LRau7EDzfDtT0O_o.jpg',
    sha256: '32c2e2a429f2671b05d1b1b05dabfae79325bd03336eeede1e3f977cb09c6f29',
    contentType: 'image/jpeg',
    bytes: 150650,
  },
  {
    ghostPostId: '69efc475e5eec200010d5299',
    slug: 'on-doubt-and-devotion-when-faith-pauses',
    localPath: 'content/images/2026/04/ChatGPT-Image-Apr-27--2026--04_20_31-PM_o.png',
    storagePath: 'content/images/2026/04/ChatGPT-Image-Apr-27--2026--04_20_31-PM_o.png',
    sha256: 'bac009c7e4126132d03b3b1744b9de0645bc3c0cccdf6b561941fa528987dd72',
    contentType: 'image/png',
    bytes: 1896067,
  },
  {
    ghostPostId: '69d5c5c083cd72000193f0cd',
    slug: 'the-conversation-communities-keep-having-about-solar-and-what-the-evidence-actually-says',
    localPath: 'content/images/2026/04/9315c5f3-932a-4ee2-b802-5e5eacdf31f1_o.png',
    storagePath: 'content/images/2026/04/9315c5f3-932a-4ee2-b802-5e5eacdf31f1_o.png',
    sha256: 'ed467bb4e4dd98db09a988a60d419703c2de6262579fb061986d647a1c13d139',
    contentType: 'image/png',
    bytes: 2216055,
  },
  {
    ghostPostId: '69f2937b4e51770001fb5218',
    slug: 'the-moment-you-stop-waiting-for-your-life-to-start',
    localPath: 'content/images/2026/04/3f252122-0cf9-45cf-82e4-f3a34b454df4_o.png',
    storagePath: 'content/images/2026/04/3f252122-0cf9-45cf-82e4-f3a34b454df4_o.png',
    sha256: 'e8ab6e02c3368e412457f98546906a520ec97f4d7ccf3bda9ffdada070b15e78',
    contentType: 'image/png',
    bytes: 2083150,
  },
  {
    ghostPostId: '69f2594b4e51770001fb51d7',
    slug: 'knowledge-without-borders-why-education-must-be-free',
    localPath: 'content/images/2026/04/RyRy_o.png',
    storagePath: 'content/images/2026/04/RyRy_o.png',
    sha256: '03f6c6da66d67f785d79dc5edc9efeff84048bdaa7f9d817c435eee50766dc15',
    contentType: 'image/png',
    bytes: 2038175,
  },
];

const MIGRATION_DIR = resolve(root, '_migration', 'ghost-images');

function sha256Of(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function publicUrlFor(entry) {
  // Shape Supabase Storage serves a public-bucket object at. The plan
  // (2026-ghost-article-images-migration-plan.md) recommends article-media be
  // created public, matching feedback-screenshots, the one bucket this
  // project already has.
  return `\${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${entry.storagePath}`;
}

function printRewriteSql() {
  const lines = [];
  lines.push('-- Row rewrite for articles.feature_image, five rows, one transaction.');
  lines.push('-- Printed by scripts/migrate-article-images.mjs. Not executed by this script.');
  lines.push('-- Requires: articles.feature_image already added (nullable text) by a');
  lines.push('-- supabase/migrations/ file per the plan; this script writes no migration.');
  lines.push('-- SUPABASE_URL below is literal in the printed SQL as a placeholder: substitute');
  lines.push('-- the real project URL, or generate signed/public URLs from the upload step\'s');
  lines.push('-- own return value instead of trusting this template.');
  lines.push('');
  lines.push('begin;');
  lines.push('');
  for (const entry of ENTRIES) {
    const url = publicUrlFor(entry);
    lines.push(
      `update public.articles set feature_image = ${sqlString(url)} where ghost_post_id = ${sqlString(entry.ghostPostId)};`,
    );
  }
  lines.push('');
  lines.push('do $check$');
  lines.push('declare n int;');
  lines.push('begin');
  lines.push('  select count(*) into n from public.articles');
  lines.push(
    `    where ghost_post_id in (${ENTRIES.map((e) => sqlString(e.ghostPostId)).join(', ')})`,
  );
  lines.push('      and feature_image is not null;');
  lines.push(`  if n <> ${ENTRIES.length} then`);
  lines.push(
    `    raise exception 'feature_image backfill: expected ${ENTRIES.length} rows set, got %', n;`,
  );
  lines.push('  end if;');
  lines.push('end');
  lines.push('$check$;');
  lines.push('');
  lines.push('commit;');
  lines.push('');
  lines.push('-- Rollback (nondestructive; uploaded Storage objects are untouched by this):');
  lines.push(
    `-- update public.articles set feature_image = null where ghost_post_id in (${ENTRIES.map((e) => sqlString(e.ghostPostId)).join(', ')});`,
  );
  console.log(lines.join('\n'));
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function upload() {
  // The project URL is public (it ships in every page); only the key is secret.
  const supabaseUrl = process.env.SUPABASE_URL ?? 'https://mguulnibvzusfvyuowwh.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const missing = [
    ['SUPABASE_URL', supabaseUrl],
    ['SUPABASE_SERVICE_KEY', serviceKey],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    // Report which names are missing, never their values.
    console.error(`Missing env: ${missing.join(', ')}`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let anyFailed = false;
  for (const entry of ENTRIES) {
    const localFile = resolve(MIGRATION_DIR, entry.localPath);
    if (!existsSync(localFile)) {
      console.error(`[${entry.slug}] local file missing: ${localFile}`);
      anyFailed = true;
      continue;
    }
    const buffer = readFileSync(localFile);
    const localHash = sha256Of(buffer);
    if (localHash !== entry.sha256) {
      console.error(
        `[${entry.slug}] local file does not match the manifest. expected ${entry.sha256}, got ${localHash}. Not uploading.`,
      );
      anyFailed = true;
      continue;
    }
    if (buffer.length !== entry.bytes) {
      console.error(
        `[${entry.slug}] local file size does not match the manifest. expected ${entry.bytes}, got ${buffer.length}. Not uploading.`,
      );
      anyFailed = true;
      continue;
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(entry.storagePath, buffer, { contentType: entry.contentType, upsert: false });
    if (uploadError) {
      console.error(`[${entry.slug}] upload failed: ${uploadError.message}`);
      anyFailed = true;
      continue;
    }

    // Verify by hash, not by trusting the upload response: download the
    // object back and re-hash it, per the plan's "verify each object by
    // hash" step.
    const { data: downloaded, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(entry.storagePath);
    if (downloadError) {
      console.error(`[${entry.slug}] uploaded, but the verify download failed: ${downloadError.message}`);
      anyFailed = true;
      continue;
    }
    const remoteBuffer = Buffer.from(await downloaded.arrayBuffer());
    const remoteHash = sha256Of(remoteBuffer);
    if (remoteHash !== entry.sha256) {
      console.error(
        `[${entry.slug}] uploaded, but the round-trip hash does not match. expected ${entry.sha256}, got ${remoteHash}. Do not trust this object; investigate before rewriting any row.`,
      );
      anyFailed = true;
      continue;
    }

    console.log(`[${entry.slug}] uploaded and verified: ${entry.storagePath} (${entry.bytes} bytes, sha256 matches)`);
  }

  if (anyFailed) {
    console.error('\nOne or more uploads failed or could not be verified. Not printing the row-rewrite SQL.');
    process.exit(1);
  }

  console.log('\nAll five objects uploaded and hash-verified. Row-rewrite SQL follows.\n');
  printRewriteSql();
}

if (sqlOnly) {
  printRewriteSql();
} else if (doUpload) {
  await upload();
} else {
  console.log('Nothing to do. Pass --upload to upload and verify, or --print-sql-only to print the row rewrite without uploading.');
  console.log('See team/migrator/knowledge/2026-ghost-article-images-migration-plan.md for the full order.');
}
