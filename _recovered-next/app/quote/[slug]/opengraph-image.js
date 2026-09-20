/**
 * OG image for /quote/<slug>.
 *
 * Renders a 1200x630 PNG with the quote text and attribution, branded
 * in cream + brass + Cormorant Garamond italic + DM Mono.
 *
 * Built on the OG-card infrastructure proved in OG-1 (contributor):
 *   - Static-weight TTFs at /assets/fonts/ (NOT inside this dynamic
 *     route), bundled via `outputFileTracingIncludes` in
 *     next.config.mjs.
 *   - Buffers passed straight to Satori (no ArrayBuffer slice).
 *   - `renderImage` awaits .arrayBuffer() on the streaming
 *     ImageResponse so render errors surface inside our try/catch
 *     instead of escaping as FUNCTION_INVOCATION_FAILED.
 *   - `_probe` slug returns runtime-state JSON for diagnostics.
 *
 * See `project_og_card_infrastructure.md` in user memory for the full
 * postmortem on the lessons embedded here.
 */

import { ImageResponse } from 'next/og';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getQuoteBySlug } from '@/lib/get-quote';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const T = {
  cream:      '#f7f2e8',
  paper:      '#fefcf5',
  ink:        '#2c2620',
  body:       '#3a342c',
  soft:       '#5a5248',
  tertiary:   '#8c8780',
  brassDeep:  '#7a4a10',
  brassMid:   '#b8862e',
  brassPale:  '#f5dfa0',
  border:     '#e0dbd2',
};

// ─── Helpers ─────────────────────────────────────────────────────────────

// Pick a quote-text font size that won't overflow the available
// vertical space at 1200x630. Empirically tuned against italic
// Cormorant Garamond at line-height 1.18 in a ~1040px-wide column.
function quoteFontSize(text) {
  const len = (text || '').length;
  if (len < 80)  return 76;
  if (len < 160) return 60;
  if (len < 260) return 48;
  if (len < 380) return 40;
  return 34;
}

// Build the attribution caption shown under the quote. Falls back
// gracefully when fields are absent — anonymous quotes still get a
// dignified line.
function buildAttribution(author, source, year) {
  const parts = [];
  if (author) parts.push(author);
  if (source) parts.push(source);
  if (year) parts.push(String(year));
  if (parts.length === 0) return 'Dialecta Library';
  return parts.join(' · ');
}

async function loadFont(filename) {
  const path = join(process.cwd(), 'assets', 'fonts', filename);
  try {
    return await readFile(path);
  } catch (err) {
    const cwd = process.cwd();
    let dirContents;
    try {
      dirContents = await readdir(join(cwd, 'assets', 'fonts'));
    } catch (e) {
      dirContents = `[readdir failed: ${e.code || e.message}]`;
    }
    throw new Error(
      `loadFont(${filename}) at ${path} failed: ${err.code || err.message} | cwd=${cwd} | dir=${JSON.stringify(dirContents)}`
    );
  }
}

// Convert a streaming ImageResponse to a buffered PNG response. The
// load-bearing trick that makes render errors catchable.
async function renderImage(jsx, options) {
  const streaming = new ImageResponse(jsx, options);
  const buffer = await streaming.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
    },
  });
}

// Diagnostic probe — hit /quote/_probe/opengraph-image to inspect
// runtime state instead of rendering an image.
async function probeResponse() {
  const cwd = process.cwd();
  const fontsDir = join(cwd, 'assets', 'fonts');
  let dirContents = null;
  let dirErr = null;
  try {
    dirContents = await readdir(fontsDir);
  } catch (e) {
    dirErr = e.code || e.message;
  }
  let fontReadStatus = null;
  try {
    const buf = await readFile(join(fontsDir, 'CormorantGaramond-MediumItalic.ttf'));
    const hex = Array.from(buf.subarray(0, 4)).map((b) => b.toString(16).padStart(2, '0')).join(' ');
    fontReadStatus = `ok: ${buf.byteLength} bytes, magic=${hex}`;
  } catch (e) {
    fontReadStatus = `fail: ${e.code || e.message}`;
  }
  return Response.json({
    route: '/quote/[slug]/opengraph-image',
    cwd,
    fontsDir,
    dirContents,
    dirErr,
    fontReadStatus,
    nodeVersion: process.version,
    arch: process.arch,
    platform: process.platform,
  });
}

// Brand-only fallback. Two variants: italic glyph when fonts loaded,
// plain non-italic text when they didn't (Satori's default font
// has no italic face and crashes synchronously on italic JSX without
// a loaded italic font).
async function brandCard(fonts, fontsLoaded) {
  if (!fontsLoaded) {
    return await renderImage(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: T.cream,
            color: T.brassDeep,
            fontSize: 96,
            letterSpacing: '0.4em',
          }}>
          DIALECTA
        </div>
      ),
      size
    );
  }
  return await renderImage(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: T.cream,
        }}>
        <div style={{
          fontFamily: 'DM Mono',
          fontSize: 32,
          color: T.brassMid,
          letterSpacing: '0.5em',
          marginBottom: 16,
        }}>
          DIALECTA
        </div>
        <div style={{
          fontFamily: 'Cormorant Garamond',
          fontStyle: 'italic',
          fontSize: 96,
          color: T.brassDeep,
        }}>
          ⁂
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

// ─── Image render ────────────────────────────────────────────────────────

export default async function Image({ params }) {
  const { slug } = await params;

  // Diagnostic probe.
  if (slug === '_probe') return await probeResponse();

  // Load fonts (in parallel, with fallback to no-fonts on any failure).
  let fonts = [];
  let fontsLoaded = false;
  try {
    const [italic, roman, mono] = await Promise.all([
      loadFont('CormorantGaramond-MediumItalic.ttf'),
      loadFont('CormorantGaramond-Medium.ttf'),
      loadFont('DMMono-Medium.ttf'),
    ]);
    fonts = [
      { name: 'Cormorant Garamond', data: italic, style: 'italic', weight: 500 },
      { name: 'Cormorant Garamond', data: roman,  style: 'normal', weight: 500 },
      { name: 'DM Mono',             data: mono,   style: 'normal', weight: 500 },
    ];
    fontsLoaded = true;
  } catch (err) {
    console.error('[og-quote] font load failed; rendering with default font:', err?.message);
  }

  const ff = (family) => (fontsLoaded ? family : undefined);

  // Fetch the quote (with fallback to brand card on error or 404).
  let quote = null;
  try {
    quote = await getQuoteBySlug(slug);
  } catch (err) {
    console.error('[og-quote] getQuoteBySlug failed:', err?.message);
  }

  const safeBrand = async (renderErrMsg) => {
    try {
      return await brandCard(fonts, fontsLoaded);
    } catch (brandErr) {
      console.error('[og-quote] brandCard failed:', brandErr?.message);
      return new Response(
        `OG generation failed.\n\nrender: ${renderErrMsg || '(quote missing)'}\nbrand: ${brandErr?.message}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      );
    }
  };

  if (!quote) return await safeBrand(null);

  try {
    const text         = quote.text || '';
    const attribution  = buildAttribution(quote.author, quote.source, quote.year);
    const textSize     = quoteFontSize(text);

    return await renderImage(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: T.cream,
            padding: 64,
          }}>
          {/* Brand bar — matches OG-1 contributor card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: T.brassDeep,
          }}>
            <div style={{
              fontFamily: ff('DM Mono'),
              fontSize: 22,
              color: T.brassMid,
              letterSpacing: '0.4em',
              marginRight: 12,
            }}>⁂</div>
            <div style={{
              fontFamily: ff('Cormorant Garamond'),
              fontStyle: 'italic',
              fontSize: 30,
            }}>Dialecta</div>
          </div>

          {/* Quote body — opening glyph + text, vertically centered */}
          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 32,
            paddingRight: 32,
            marginTop: 8,
          }}>
            {/* Oversized opening curly quote, brass-mid, sits above the text */}
            <div style={{
              display: 'flex',
              fontFamily: ff('Cormorant Garamond'),
              fontStyle: 'italic',
              fontSize: 180,
              color: T.brassMid,
              lineHeight: 0.6,
              height: 90,
              marginBottom: 4,
            }}>“</div>

            {/* The quote itself */}
            <div style={{
              display: 'flex',
              fontFamily: ff('Cormorant Garamond'),
              fontStyle: 'italic',
              fontSize: textSize,
              color: T.brassDeep,
              lineHeight: 1.18,
            }}>
              {text}
            </div>
          </div>

          {/* Attribution — top-rule + uppercase mono caption */}
          <div style={{
            display: 'flex',
            fontFamily: ff('DM Mono'),
            fontSize: 18,
            color: T.soft,
            letterSpacing: '0.16em',
            paddingTop: 14,
            borderTop: `1px solid ${T.border}`,
          }}>
            {attribution.toUpperCase()}
          </div>
        </div>
      ),
      { ...size, fonts }
    );
  } catch (err) {
    console.error('[og-quote] render failed:', err?.message);
    return await safeBrand(err?.message);
  }
}
