/**
 * OG image for /article/<slug>.
 *
 * Editorial-publication style: just the photo. Following the
 * convention used by WaPo, NYT, and every major news/magazine
 * publisher — the OG image is the article's hero photo, full-bleed,
 * with no text overlays. Facebook (and X, LinkedIn, etc.) renders
 * the title and source line from og:title + og:url meta tags
 * BELOW the image, so duplicating that on the image itself only
 * crowds the share preview.
 *
 * Photo source priority:
 *   1. Ghost feature_image (the article's chosen hero photo)
 *   2. Curated fallback at /public/branding/article-fallback.jpg
 *      (Article_Background.png, processed to 1200x630)
 *   3. Cream-only brand card (last resort if both reads fail)
 *
 * No fonts loaded by default — the card is just an image. Fonts
 * only used by the brandCard fallback when we couldn't load any
 * usable photo.
 */

import { ImageResponse } from 'next/og';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getArticleBySlug } from '@/lib/get-article';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const T = {
  cream:      '#f7f2e8',
  brassDeep:  '#7a4a10',
  brassMid:   '#b8862e',
};

// ─── Helpers ─────────────────────────────────────────────────────────────

async function loadFont(filename) {
  return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
}

// Try to fetch the article's Ghost feature_image, fall through to the
// curated fallback, fall through to null. Returns a base64 data URL
// Satori can use as background.
async function loadPhoto(featureImageUrl) {
  // 1. Ghost feature_image
  if (featureImageUrl) {
    try {
      const res = await fetch(featureImageUrl, {
        headers: { 'User-Agent': 'dialecta-og-renderer/1.0' },
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const ct  = res.headers.get('content-type') || 'image/jpeg';
        return `data:${ct};base64,${buf.toString('base64')}`;
      }
      console.error('[og-article] feature_image returned', res.status, featureImageUrl);
    } catch (err) {
      console.error('[og-article] feature_image fetch failed:', err?.message);
    }
  }
  // 2. Curated fallback
  try {
    const buf = await readFile(join(process.cwd(), 'public', 'branding', 'article-fallback.jpg'));
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch (err) {
    console.error('[og-article] article-fallback.jpg load failed:', err?.message);
  }
  return null;
}

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

async function probeResponse() {
  const cwd = process.cwd();
  const probe = {
    route: '/article/[slug]/opengraph-image',
    cwd,
    nodeVersion: process.version,
    ghostUrl: process.env.GHOST_ADMIN_API_URL ? '<configured>' : null,
  };
  for (const [label, dir] of [
    ['fonts',    join(cwd, 'assets', 'fonts')],
    ['branding', join(cwd, 'public', 'branding')],
  ]) {
    try { probe[label] = await readdir(dir); }
    catch (e) { probe[label] = `[${e.code || e.message}]`; }
  }
  return Response.json(probe);
}

// Last-resort brand card. Only renders when both the Ghost
// feature_image and the curated fallback are unreachable.
async function brandCard() {
  let fonts = [];
  try {
    const [italic, mono] = await Promise.all([
      loadFont('CormorantGaramond-MediumItalic.ttf'),
      loadFont('DMMono-Medium.ttf'),
    ]);
    fonts = [
      { name: 'Cormorant Garamond', data: italic, style: 'italic', weight: 500 },
      { name: 'DM Mono',             data: mono,   style: 'normal', weight: 500 },
    ];
  } catch (_) {
    return await renderImage(
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: T.cream, color: T.brassDeep,
        fontSize: 96, letterSpacing: '0.4em',
      }}>DIALECTA</div>,
      size
    );
  }
  return await renderImage(
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: T.cream,
    }}>
      <div style={{ fontFamily: 'DM Mono', fontSize: 32, color: T.brassMid, letterSpacing: '0.5em', marginBottom: 16 }}>
        DIALECTA
      </div>
      <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 96, color: T.brassDeep }}>⁂</div>
    </div>,
    { ...size, fonts }
  );
}

// ─── Image render ────────────────────────────────────────────────────────

export default async function Image({ params }) {
  const { slug } = await params;

  if (slug === '_probe') return await probeResponse();

  // Fetch article (with article fallback to brand card on miss).
  let article = null;
  try {
    article = await getArticleBySlug(slug);
  } catch (err) {
    console.error('[og-article] getArticleBySlug failed:', err?.message);
  }
  if (!article) {
    try { return await brandCard(); }
    catch (err) {
      return new Response(`OG generation failed: ${err?.message}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } });
    }
  }

  // Load the photo (feature_image > article-fallback.jpg > null).
  const photoDataUrl = await loadPhoto(article.feature_image);
  if (!photoDataUrl) {
    try { return await brandCard(); }
    catch (err) {
      return new Response(`OG generation failed: ${err?.message}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } });
    }
  }

  // Editorial-publication style: pure photo, no overlays.
  // Title and source come from og:title / og:url meta tags rendered
  // by Facebook BELOW the image. We don't compete with that.
  try {
    return await renderImage(
      <div style={{
        width:           '100%',
        height:          '100%',
        display:         'flex',
        backgroundImage: `url('${photoDataUrl}')`,
        backgroundSize:  'cover',
        backgroundPosition: 'center',
      }} />,
      size
    );
  } catch (err) {
    console.error('[og-article] render failed:', err?.message);
    return new Response(`OG generation failed: ${err?.message}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
}
