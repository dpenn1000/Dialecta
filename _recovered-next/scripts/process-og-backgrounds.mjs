/**
 * Process raw OneDrive PNG backgrounds into 1200x630 optimized JPGs
 * for OG card rendering.
 *
 * Source:  C:\Users\dan\OneDrive\Websites\Dialecta\Marketing\Social Media\Backgrounds
 * Output:  C:\dialecta-next\public\og-backgrounds\library\photo-NN.jpg
 *
 * Each output is:
 *   - 1200x630 (matches OG canvas exactly)
 *   - JPEG quality 80, mozjpeg encoder (best size/quality ratio)
 *   - 'cover' fit with center anchor (loses some edge detail in
 *     non-1.91:1 originals, gains uniform sizing)
 *
 * Run once after dropping new source PNGs into the OneDrive folder:
 *   node scripts/process-og-backgrounds.mjs
 *
 * Push 3 (admin OG-library upload UI) replaces this script with a
 * runtime upload pipeline backed by Supabase Storage. For now,
 * filesystem with a manual run is the path.
 */

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const SRC = String.raw`C:\Users\dan\OneDrive\Websites\Dialecta\Marketing\Social Media\Backgrounds`;
const DST = String.raw`C:\dialecta-next\public\og-backgrounds\library`;

const TARGET_W = 1200;
const TARGET_H = 630;

await mkdir(DST, { recursive: true });

const entries = await readdir(SRC);
const sources = entries
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

console.log(`Found ${sources.length} source images.`);
console.log(`Writing to: ${DST}`);
console.log('');

let i = 0;
for (const file of sources) {
  i++;
  const num = String(i).padStart(2, '0');
  const inputPath  = join(SRC, file);
  const outputPath = join(DST, `photo-${num}.jpg`);

  await sharp(inputPath)
    .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outputPath);

  const inputSize  = (await stat(inputPath)).size;
  const outputSize = (await stat(outputPath)).size;
  const reduction  = Math.round((1 - outputSize / inputSize) * 100);
  console.log(
    `[${num}] ${file}\n` +
    `     -> photo-${num}.jpg  ` +
    `${(inputSize / 1024).toFixed(0)} KB -> ${(outputSize / 1024).toFixed(0)} KB  (-${reduction}%)`
  );
}

console.log('');
console.log(`Done. ${sources.length} photos processed.`);
