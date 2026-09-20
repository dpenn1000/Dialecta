/**
 * scripts/build-archetype-svgs.jsx
 *
 * Build-time renderer for the eight canonical archetype fingerprints.
 * Pipeline:
 *
 *   1. React renders the Fingerprint engine at size=400 via
 *      renderToStaticMarkup, producing an SVG string.
 *   2. We inject the xmlns namespace (renderToStaticMarkup omits it; SVGs
 *      loaded via <img> require it).
 *   3. Sharp rasterises that SVG to a 400x400 PNG.
 *   4. PNG is written to assets/png/fp-arch-<slug>.png.
 *
 * Why PNG: an earlier attempt shipped the raw engine-output SVGs and the
 * Living Fingerprint page slowed to a crawl. Each SVG carries ~2,400
 * <line> elements (96 perimeter samples × ~25 rings) for the engine's
 * per-segment color/width variation. Even loaded via <img>, parsing and
 * rasterising eight of those tanked scroll perf. Rasterising once at
 * build time gives us:
 *
 *   - ~50 KB PNG per archetype (vs ~600 KB SVG)
 *   - No runtime SVG parse cost
 *   - Engine-accurate visuals (the rasterised result is what the engine
 *     would have rendered live, frozen)
 *
 * Re-run `npm run build:archetypes` whenever:
 *   - The Fingerprint engine refines its render (trade-off rules, ring
 *     geometry, texture synthesis).
 *   - The archetype data sets in src/dialecta-archetype-grid.jsx are
 *     tuned.
 *   - A new canonical archetype is added.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { Fingerprint } from '../src/dialecta-fingerprint-engine.jsx';
import { ARCHETYPES, buildArchetypeData } from '../src/dialecta-archetype-grid.jsx';
import fs from 'node:fs';
import path from 'node:path';

const root   = path.join(__dirname, '..');
const outDir = path.join(root, 'assets', 'png');
fs.mkdirSync(outDir, { recursive: true });

// Source SVG renders at 400x400 so the rasterised PNG has good fidelity
// at the displayed 200x200 size on retina screens (effective 2x).
const RENDER_SIZE = 400;

function withSvgNamespace(markup) {
  return markup.replace(
    /^<svg /,
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
  );
}

async function buildOne(archetype) {
  const data = buildArchetypeData(archetype);
  const raw = renderToStaticMarkup(
    <Fingerprint
      data={data}
      size={RENDER_SIZE}
      showLabels={false}
      resonance={archetype.resonance ?? 0.75}
    />
  );
  const svgString = withSvgNamespace(raw);
  const pngBuffer = await sharp(Buffer.from(svgString))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  const filename = `fp-arch-${archetype.slug}.png`;
  const outPath  = path.join(outDir, filename);
  fs.writeFileSync(outPath, pngBuffer);
  return { filename, bytes: pngBuffer.length, svgBytes: svgString.length };
}

(async () => {
  let totalPng = 0;
  let totalSvg = 0;
  for (const archetype of ARCHETYPES) {
    const r = await buildOne(archetype);
    totalPng += r.bytes;
    totalSvg += r.svgBytes;
    console.log(
      `  ${archetype.slug.padEnd(14)} -> assets/png/${r.filename}` +
      `  (${(r.bytes / 1024).toFixed(0)} KB png, ${(r.svgBytes / 1024).toFixed(0)} KB svg src)`
    );
  }
  console.log(
    `\nGenerated ${ARCHETYPES.length} archetype PNGs.` +
    `  Total PNG: ${(totalPng / 1024).toFixed(0)} KB.` +
    `  (Source SVG would have been ${(totalSvg / 1024).toFixed(0)} KB.)`
  );
})();
