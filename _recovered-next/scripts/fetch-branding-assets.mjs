/**
 * Fetch the Dialecta brand assets that OG cards need at render time:
 *   - The real Dialecta logo PNG (from Ghost)
 *   - All 9 signature fonts as TTF (from Google Fonts via legacy CSS API
 *     with an Android UA, which serves real static-weight TTFs instead
 *     of the WOFF2 the modern API returns; @vercel/og's Satori bundle
 *     in Node runtime can read TTF but not WOFF2).
 *
 * Outputs:
 *   public/branding/dialecta-logo.png   — sharp-resized to height 80,
 *                                          PNG with alpha, optimized
 *   assets/fonts/signatures/<Name>.ttf  — 9 files
 *
 * Run after the upstream brand asset URL or signature font list changes.
 * Both the logo and the signatures are referenced by the moment OG card
 * and (for the logo) by the celebration modal at theme-side render time.
 *
 * The trace includes for the moment OG route already cover assets/fonts/**;
 * we extend them to public/branding/** in next.config.mjs so the logo
 * ships with the function bundle.
 */

import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const LOGO_SOURCE = 'https://www.dialecta.org/content/images/2026/04/Dialecta---Hero-Logo---PNG.png';
const LOGO_DST    = String.raw`C:\dialecta-next\public\branding\dialecta-logo.png`;

const SIGNATURE_FONTS = [
  'Mrs Saint Delafield',
  'Cherish',
  'Give You Glory',
  'Hurricane',
  'Love Light',
  'Nothing You Could Do',
  'Oooh Baby',
  'Qwigley',
  'WindSong',
];
const SIGNATURE_DIR = String.raw`C:\dialecta-next\assets\fonts\signatures`;

const ANDROID_UA = 'Mozilla/5.0 (Linux; U; Android 4.0.4; en-us; Nexus S Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';

// ─── Logo ────────────────────────────────────────────────────────────────

await mkdir(String.raw`C:\dialecta-next\public\branding`, { recursive: true });

console.log('Fetching Dialecta logo...');
const logoBuf = Buffer.from(await (await fetch(LOGO_SOURCE)).arrayBuffer());
console.log(`  source: ${(logoBuf.length / 1024).toFixed(0)} KB`);

// Resize to 80px height with proportional width, preserve alpha for
// overlay on photo backgrounds. PNG quality 90, palette mode for
// further compression on a flat-color logo like this one.
await sharp(logoBuf)
  .resize({ height: 80, withoutEnlargement: false })
  .png({ palette: true, quality: 90, compressionLevel: 9 })
  .toFile(LOGO_DST);

const logoOut = (await stat(LOGO_DST)).size;
console.log(`  -> ${LOGO_DST}`);
console.log(`     ${(logoOut / 1024).toFixed(1)} KB`);
console.log('');

// ─── Signature fonts ─────────────────────────────────────────────────────

await mkdir(SIGNATURE_DIR, { recursive: true });

function fontFamilyToFileBase(name) {
  // 'Mrs Saint Delafield' -> 'MrsSaintDelafield'
  return name.replace(/\s+/g, '');
}

function fontFamilyToCssParam(name) {
  // 'Mrs Saint Delafield' -> 'Mrs+Saint+Delafield'
  return name.replace(/\s+/g, '+');
}

console.log(`Fetching ${SIGNATURE_FONTS.length} signature fonts...`);
for (const family of SIGNATURE_FONTS) {
  const cssUrl = `https://fonts.googleapis.com/css?family=${fontFamilyToCssParam(family)}`;
  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': ANDROID_UA } });
  if (!cssRes.ok) {
    console.error(`  [SKIP] ${family}: CSS API returned ${cssRes.status}`);
    continue;
  }
  const css = await cssRes.text();
  // Match the first .ttf URL in the latin block. The CSS API returns
  // multiple @font-face blocks (one per subset); they all point at the
  // same TTF for these single-weight scripts.
  const ttfMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/);
  if (!ttfMatch) {
    console.error(`  [SKIP] ${family}: no TTF URL in CSS`);
    continue;
  }
  const ttfUrl = ttfMatch[1];
  const ttfRes = await fetch(ttfUrl);
  if (!ttfRes.ok) {
    console.error(`  [SKIP] ${family}: TTF fetch returned ${ttfRes.status}`);
    continue;
  }
  const ttfBuf = Buffer.from(await ttfRes.arrayBuffer());
  // Magic-byte sanity check (lesson from project_og_card_infrastructure.md):
  // valid TTF starts with 00 01 00 00 or 'true' or 'OTTO'.
  const m0 = ttfBuf[0], m1 = ttfBuf[1], m2 = ttfBuf[2], m3 = ttfBuf[3];
  const isTtf = (m0 === 0x00 && m1 === 0x01 && m2 === 0x00 && m3 === 0x00);
  const isOtto = (String.fromCharCode(m0, m1, m2, m3) === 'OTTO');
  const isTrue = (String.fromCharCode(m0, m1, m2, m3) === 'true');
  if (!isTtf && !isOtto && !isTrue) {
    console.error(
      `  [SKIP] ${family}: bad magic ${m0.toString(16)} ${m1.toString(16)} ${m2.toString(16)} ${m3.toString(16)}`
    );
    continue;
  }
  const out = join(SIGNATURE_DIR, fontFamilyToFileBase(family) + '.ttf');
  await writeFile(out, ttfBuf);
  console.log(`  ${family.padEnd(22)} ${(ttfBuf.length / 1024).toFixed(0)} KB  -> ${fontFamilyToFileBase(family)}.ttf`);
}
console.log('');
console.log('Done.');
