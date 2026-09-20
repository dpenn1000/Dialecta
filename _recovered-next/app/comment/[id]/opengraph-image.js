/**
 * OG image for /comment/<uuid>.
 *
 * Renders a 1200x630 PNG with the comment body, author, parent
 * article context, and (when available) the discourse tier badge.
 * Branded in cream + brass + Cormorant Garamond italic + DM Mono.
 *
 * Built on the OG-card infrastructure proved in OG-1 / OG-2 / OG-3.
 * See `project_og_card_infrastructure.md` in user memory for the full
 * postmortem on the lessons embedded here.
 *
 * Theme integration is deferred: comment-sharing UI doesn't exist
 * in the discourse layer yet. The route is ready for the day it does.
 */

import { ImageResponse } from 'next/og';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getCommentById } from '@/lib/get-comment';

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

// Comment tier labels. Different list from article tiers — these are
// the discourse-layer tiers documented in the comments schema.
const TIER_LABELS = {
  forum:   'Forum',
  spark:   'Spark',
  echo:    'Echo',
  fog:     'Fog',
  heat:    'Heat',
  stance:  'Stance',
  breach:  'Breach',
};

// ─── Helpers ─────────────────────────────────────────────────────────────

// Comments tend to be longer than quotes but shorter than article
// excerpts. Tune sizing for typical paragraph-length comment bodies.
function commentFontSize(text) {
  const len = (text || '').length;
  if (len < 100) return 64;
  if (len < 200) return 52;
  if (len < 320) return 42;
  if (len < 480) return 34;
  return 28;
}

// Truncate long comments at a word boundary so the card never
// overflows. Hard cap at ~520 chars before ellipsis.
function clampCommentBody(text) {
  const trimmed = (text || '').replace(/\s+/g, ' ').trim();
  if (trimmed.length <= 520) return trimmed;
  const slice = trimmed.slice(0, 500);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + '…';
}

function buildFooter(memberName, articleTitle, tierLabel) {
  const parts = [];
  if (memberName)   parts.push('by ' + memberName);
  if (articleTitle) parts.push('on ' + articleTitle);
  if (tierLabel)    parts.push(tierLabel);
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
    route: '/comment/[id]/opengraph-image',
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

// Probe via the literal slug "_probe" — same convention as OG-1..OG-3.
// UUID validation in get-comment.js will reject it as a real lookup,
// so we intercept before the fetch.
const PROBE_ID = '_probe';

export default async function Image({ params }) {
  const { id } = await params;

  if (id === PROBE_ID) return await probeResponse();

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
    console.error('[og-comment] font load failed; rendering with default font:', err?.message);
  }

  const ff = (family) => (fontsLoaded ? family : undefined);

  let comment = null;
  try {
    comment = await getCommentById(id);
  } catch (err) {
    console.error('[og-comment] getCommentById failed:', err?.message);
  }

  const safeBrand = async (renderErrMsg) => {
    try {
      return await brandCard(fonts, fontsLoaded);
    } catch (brandErr) {
      console.error('[og-comment] brandCard failed:', brandErr?.message);
      return new Response(
        `OG generation failed.\n\nrender: ${renderErrMsg || '(comment missing)'}\nbrand: ${brandErr?.message}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      );
    }
  };

  if (!comment) return await safeBrand(null);

  try {
    const body        = clampCommentBody(comment.body);
    const tierLabel   = TIER_LABELS[comment.final_tier] || null;
    const footer      = buildFooter(comment.member_name, comment.article_title, tierLabel);
    const bodySize    = commentFontSize(body);

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
          {/* Brand bar */}
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

          {/* Comment body, vertically centered */}
          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 32,
            paddingRight: 32,
            marginTop: 8,
          }}>
            {/* Smaller opening curly quote than the quote card —
                comments are commentary, not aphorism. */}
            <div style={{
              display: 'flex',
              fontFamily: ff('Cormorant Garamond'),
              fontStyle: 'italic',
              fontSize: 120,
              color: T.brassMid,
              lineHeight: 0.6,
              height: 60,
              marginBottom: 4,
            }}>“</div>

            <div style={{
              display: 'flex',
              fontFamily: ff('Cormorant Garamond'),
              fontStyle: 'italic',
              fontSize: bodySize,
              color: T.brassDeep,
              lineHeight: 1.22,
            }}>
              {body}
            </div>
          </div>

          {/* Footer: byline + article + tier */}
          {footer && (
            <div style={{
              display: 'flex',
              fontFamily: ff('DM Mono'),
              fontSize: 18,
              color: T.soft,
              letterSpacing: '0.16em',
              paddingTop: 14,
              borderTop: `1px solid ${T.border}`,
            }}>
              {footer.toUpperCase()}
            </div>
          )}
        </div>
      ),
      { ...size, fonts }
    );
  } catch (err) {
    console.error('[og-comment] render failed:', err?.message);
    return await safeBrand(err?.message);
  }
}
