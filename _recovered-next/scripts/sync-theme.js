/**
 * sync-theme.js
 *
 * Mirrors the canonical theme source (dialecta-local/.../themes/dialecta)
 * into this project's lib/theme/ directory. Run before each deploy so
 * the SSR pages render the same components as the live theme.
 *
 * Source-of-truth rule: edit theme files in dialecta-local. The
 * lib/theme/ contents in this project are wiped and rewritten by every
 * sync. Direct edits there will be lost.
 *
 * Layout assumption: dialecta-next and dialecta-local are siblings on
 * disk. If your layout differs, change THEME_ROOT below.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const THEME_ROOT = path.resolve(
  PROJECT_ROOT,
  '..',
  'dialecta-local',
  'versions',
  '6.28.0',
  'content',
  'themes',
  'dialecta'
);

const THEME_SRC = path.join(THEME_ROOT, 'src');
const THEME_CSS = path.join(THEME_ROOT, 'assets', 'css', 'style.css');
const TARGET    = path.join(PROJECT_ROOT, 'lib', 'theme');

const HEADER_FILE = path.join(TARGET, '__DO_NOT_EDIT.md');

const HEADER_CONTENT = `# DO NOT EDIT FILES IN THIS DIRECTORY

This directory is a build-time copy of the canonical theme source at:

\`${THEME_SRC.replace(/\\/g, '/')}\`

Files here are wiped and rewritten by \`scripts/sync-theme.js\` on every
sync. Edit theme files in the dialecta-local repo, then run:

\`\`\`
npm run sync-theme
\`\`\`

…or use \`npm run deploy\` which syncs and then runs \`vercel --prod\`.

Last sync: ${new Date().toISOString()}
`;

async function main() {
  console.log('[sync-theme] source: ' + THEME_SRC);
  console.log('[sync-theme] target: ' + TARGET);

  // Verify source exists
  try {
    await fs.access(THEME_SRC);
  } catch {
    console.error('[sync-theme] ERROR: theme src not found at ' + THEME_SRC);
    console.error('[sync-theme] This script expects dialecta-next and dialecta-local to be sibling directories.');
    console.error('[sync-theme] If your layout differs, edit THEME_ROOT in scripts/sync-theme.js.');
    process.exit(1);
  }

  // Wipe + recreate target
  await fs.rm(TARGET, { recursive: true, force: true });
  await fs.mkdir(TARGET, { recursive: true });

  // Copy theme source
  await fs.cp(THEME_SRC, TARGET, { recursive: true });

  // Copy style.css (lives outside src/ in the theme repo)
  await fs.copyFile(THEME_CSS, path.join(TARGET, 'style.css'));

  // Drop the marker so anyone landing in lib/theme/ knows the rule
  await fs.writeFile(HEADER_FILE, HEADER_CONTENT, 'utf8');

  // Count what we synced for the log
  const entries = await fs.readdir(TARGET);
  console.log(`[sync-theme] OK — ${entries.length} top-level entries copied.`);
}

main().catch((err) => {
  console.error('[sync-theme] failed:', err);
  process.exit(1);
});
