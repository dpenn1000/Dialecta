/**
 * OG image for /contributor/<handle>/moment/<id>.
 *
 * The 5th OG card (OG-5). Renders a celebration moment as a 1200x630
 * editorial card. Per-event content is the FOCAL element (the actual
 * comment, the article title, the quote text, etc.) — the goal is an
 * exciting window into the soul of Dialecta, not a generic
 * congratulations.
 *
 * Layout (top to bottom):
 *   - Real Dialecta logo (PNG from Ghost, pre-baked into
 *     /public/branding/dialecta-logo.png)
 *   - Optional photo background with warm-ink curtain overlay
 *     (per BACKGROUND_MAP[event_type])
 *   - Focal content: large italic Cormorant Garamond quote/title
 *   - Signature line: contributor's display_name rendered in their
 *     own chosen signature font (one of 9 hand-script Google Fonts;
 *     bundled into /assets/fonts/signatures/)
 *   - Footer: kicker (FIRST COMMENT etc.) · @handle · date
 *
 * Built on the OG-card infrastructure proved in OG-1..OG-4. See
 * `project_og_card_infrastructure.md` in user memory for the full
 * postmortem on the embedded lessons.
 */

import { ImageResponse } from 'next/og';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getMomentByHandleAndId, describeMoment, signatureFontFile } from '@/lib/get-moment';
import { BACKGROUND_MAP } from '@/lib/og-background-config';

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
  brassWarm:  '#d4a84a',
  border:     '#e0dbd2',
};

// ─── Helpers ─────────────────────────────────────────────────────────────

// Truncate long bodies (e.g. 1700-char comments) at a word boundary so
// the focal area never overflows. The ~360 char ceiling keeps the
// card readable at OG card scale.
function clampPrimary(text, primaryStyle) {
  const trimmed = (text || '').replace(/\s+/g, ' ').trim();
  const cap = primaryStyle === 'quote' ? 360 : 140;
  if (trimmed.length <= cap) return trimmed;
  const slice = trimmed.slice(0, cap - 1);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice) + '…';
}

// Auto-size focal text by length and style.
function primaryFontSize(text, style) {
  const len = (text || '').length;
  if (style === 'count') return 140;
  if (style === 'title') {
    if (len < 28) return 86;
    if (len < 50) return 70;
    if (len < 80) return 56;
    return 44;
  }
  // 'quote' style
  if (len < 80)  return 56;
  if (len < 160) return 46;
  if (len < 260) return 38;
  return 32;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

async function loadFont(filename, subdir = '') {
  const parts = subdir
    ? ['assets', 'fonts', subdir, filename]
    : ['assets', 'fonts', filename];
  const path = join(process.cwd(), ...parts);
  return await readFile(path);
}

async function loadLogo() {
  try {
    const buf = await readFile(join(process.cwd(), 'public', 'branding', 'dialecta-logo.png'));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch (err) {
    console.error('[og-moment] logo load failed:', err?.message);
    return null;
  }
}

async function loadBackground(eventType) {
  const filename = BACKGROUND_MAP[eventType];
  if (!filename) return null;
  try {
    const path = join(process.cwd(), 'public', 'og-backgrounds', 'library', filename);
    const buffer = await readFile(path);
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error('[og-moment] background load failed for', eventType, ':', err?.message);
    return null;
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
  const probe = {
    route: '/contributor/[handle]/moment/[id]/opengraph-image',
    cwd,
    nodeVersion: process.version,
  };
  for (const [label, dir] of [
    ['fonts',     join(cwd, 'assets', 'fonts')],
    ['signatures',join(cwd, 'assets', 'fonts', 'signatures')],
    ['backgrounds', join(cwd, 'public', 'og-backgrounds', 'library')],
    ['branding',  join(cwd, 'public', 'branding')],
  ]) {
    try { probe[label] = await readdir(dir); }
    catch (e) { probe[label] = `[${e.code || e.message}]`; }
  }
  return Response.json(probe);
}

async function brandCard(coreFonts, fontsLoaded) {
  if (!fontsLoaded) {
    return await renderImage(
      (
        <div style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: T.cream, color: T.brassDeep,
          fontSize: 96, letterSpacing: '0.4em',
        }}>DIALECTA</div>
      ),
      size
    );
  }
  return await renderImage(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: T.cream,
      }}>
        <div style={{
          fontFamily: 'DM Mono', fontSize: 32,
          color: T.brassMid, letterSpacing: '0.5em', marginBottom: 16,
        }}>DIALECTA</div>
        <div style={{
          fontFamily: 'Cormorant Garamond', fontStyle: 'italic',
          fontSize: 96, color: T.brassDeep,
        }}>⁂</div>
      </div>
    ),
    { ...size, fonts: coreFonts }
  );
}

// ─── Image render ────────────────────────────────────────────────────────

export default async function Image({ params }) {
  const { handle, id } = await params;

  if (id === '_probe') return await probeResponse();

  // Core typeface fonts (Cormorant + DM Mono). Always loaded — the
  // signature font is loaded later, conditional on the contributor's
  // chosen font, and added to the same fonts array.
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
    console.error('[og-moment] core font load failed:', err?.message);
  }

  const ff = (family) => (fontsLoaded ? family : undefined);

  // Fetch the celebration data (with handle ownership check inside).
  let data = null;
  try {
    data = await getMomentByHandleAndId(handle, id);
  } catch (err) {
    console.error('[og-moment] fetch failed:', err?.message);
  }

  const safeBrand = async (renderErrMsg) => {
    try {
      return await brandCard(fonts, fontsLoaded);
    } catch (brandErr) {
      console.error('[og-moment] brandCard failed:', brandErr?.message);
      return new Response(
        `OG generation failed.\n\nrender: ${renderErrMsg || '(moment missing)'}\nbrand: ${brandErr?.message}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      );
    }
  };

  if (!data) return await safeBrand(null);

  try {
    const { moment, contributor } = data;
    const mc = describeMoment(moment.event_type, moment.context);
    const name = contributor.display_name || 'A contributor';
    const handleDisplay = contributor.handle ? '@' + contributor.handle : '';
    // Prefer the underlying event's timestamp (when the comment was
    // posted, the article published, the tier promoted) over the
    // celebration row insert time. Falls back to occurred_at for
    // older celebrations that didn't store event_at.
    const eventAt = moment.context?.event_at || moment.occurred_at;
    const dateStr = formatDate(eventAt);
    const primary = clampPrimary(mc.primary, mc.primaryStyle);
    const pSize = primaryFontSize(primary, mc.primaryStyle);

    // Lazy-load the contributor's signature font and register it as
    // the 'Signature' family. If it fails, the signature line falls
    // back to italic Cormorant.
    let signatureLoaded = false;
    try {
      const sigFile = signatureFontFile(contributor.signature_font);
      const sigData = await loadFont(sigFile, 'signatures');
      fonts = [...fonts, { name: 'Signature', data: sigData, style: 'normal', weight: 400 }];
      signatureLoaded = true;
    } catch (err) {
      console.error('[og-moment] signature font load failed:', err?.message);
    }

    // Brand assets.
    const logoDataUrl = await loadLogo();
    const bgDataUrl   = await loadBackground(moment.event_type);
    const onPhoto = !!bgDataUrl;

    // Color palette branches by render mode.
    const C = onPhoto
      ? {
          kicker:    '#f5dfa0',
          primary:   '#fffdf8',
          secondary: 'rgba(255, 253, 248, 0.88)',
          signature: '#f5dfa0',
          handle:    'rgba(255, 253, 248, 0.7)',
          footer:    'rgba(255, 253, 248, 0.78)',
          rule:      'rgba(245, 223, 160, 0.32)',
        }
      : {
          kicker:    T.brassMid,
          primary:   T.brassDeep,
          secondary: T.body,
          signature: T.brassMid,
          handle:    T.tertiary,
          footer:    T.soft,
          rule:      T.border,
        };

    // Tighter curtain: near-solid darkness on the left half, sharp
    // transition through the middle, photo emerging clean on the
    // right. Avoids the previous "soft mush" feeling where text
    // and photo blended into each other across the whole card.
    const containerStyle = onPhoto
      ? {
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          padding: '52px 64px',
          backgroundImage:
            `linear-gradient(105deg,` +
              ` rgba(20,16,12,0.96) 0%,` +
              ` rgba(20,16,12,0.93) 42%,` +
              ` rgba(20,16,12,0.62) 56%,` +
              ` rgba(20,16,12,0.18) 72%,` +
              ` rgba(20,16,12,0.0) 90%),` +
            ` url('${bgDataUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: T.cream,
          padding: '52px 64px',
        };

    // Subtle drop-shadow on light text overlaid on photo. Makes the
    // serif italic feel cut, not floated. No effect off-photo.
    const textShadow = onPhoto
      ? '0 1px 2px rgba(0,0,0,0.65), 0 0 24px rgba(0,0,0,0.35)'
      : 'none';
    // Heavy three-layer shadow for the kicker: it sits in the bright
    // photo area top-right where the curtain is thin. Tight inner
    // shadow for crisp edges, mid for cut, wide diffuse for atmosphere.
    const kickerShadow = onPhoto
      ? '0 0 2px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.85), 0 4px 24px rgba(0,0,0,0.55)'
      : 'none';

    return await renderImage(
      (
        <div style={containerStyle}>
          {/* Top bar: KICKER + DATE stacked (left, on dark) +
              LOGO (right, bigger, dark silhouette on bright photo).
              Date sits directly under the kicker as a chapter-style
              dateline — small DM Mono, letterspaced, brass-pale —
              so the moment's date reads immediately, not buried in
              the footer. */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 40,
          }}>
            {/* Left: kicker + date */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{
                display: 'flex',
                fontFamily: ff('Cormorant Garamond'),
                fontStyle: 'italic',
                fontSize: 68,
                color: onPhoto ? '#ecb438' : T.brassDeep,
                lineHeight: 1.0,
                // Clean elevation drop-shadow: tight 1px inner for
                // crisp edges, then a sharp directional drop (offset
                // down, not heavily blurred) so the kicker reads as
                // raised off the surface rather than glowing or
                // softened. Avoids the previous diffuse halo.
                textShadow: onPhoto
                  ? '0 1px 1px rgba(0,0,0,0.85), 0 6px 12px rgba(0,0,0,0.55), 0 10px 20px rgba(0,0,0,0.35)'
                  : 'none',
              }}>
                {mc.kicker}
              </div>
              <div style={{
                display: 'flex',
                fontFamily: ff('DM Mono'),
                fontSize: 16,
                color: onPhoto ? '#f5dfa0' : T.brassMid,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                marginTop: 2,
                textShadow: onPhoto
                  ? '0 1px 2px rgba(0,0,0,0.6)'
                  : 'none',
              }}>
                {dateStr}
              </div>
            </div>

            {/* Right: logo. Positive marginRight pulls the logo LEFT
                (more inset from the canvas right edge), placing the
                wordmark in the brightest sun area of the photo
                instead of over the dark window frame on the far
                right. White halo glow simulates sun catching the
                silhouette — saturated and visible against the warm
                photo, not lost in atmospheric drop-shadows. */}
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="Dialecta"
                width={302}
                height={70}
                style={{
                  width:  302,
                  height: 70,
                  marginRight: onPhoto ? 120 : 0,
                  filter: onPhoto
                    ? 'brightness(0) drop-shadow(0 0 14px rgba(255,255,255,1)) drop-shadow(0 0 32px rgba(255,220,160,0.85)) drop-shadow(0 0 64px rgba(255,180,80,0.55))'
                    : 'none',
                }}
              />
            ) : (
              <div style={{
                fontFamily: ff('Cormorant Garamond'), fontStyle: 'italic',
                fontSize: 56, color: onPhoto ? '#1c1814' : T.brassDeep,
                letterSpacing: '0.04em',
                marginRight: onPhoto ? 120 : 0,
                textShadow: onPhoto
                  ? '0 0 8px rgba(255,255,255,1), 0 0 24px rgba(255,220,160,0.85), 0 0 48px rgba(255,180,80,0.5)'
                  : 'none',
              }}>Dialecta</div>
            )}
          </div>

          {/* Focal content, vertically centered */}
          <div style={{
            display: 'flex', flex: 1, flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: onPhoto ? 100 : 0,
            maxWidth: onPhoto ? 820 : '100%',
          }}>
            {mc.primaryStyle === 'quote' && (
              <div style={{
                display: 'flex',
                fontFamily: ff('Cormorant Garamond'), fontStyle: 'italic',
                fontSize: 132, color: C.kicker,
                lineHeight: 0.6, height: 64, marginBottom: 18,
                textShadow,
              }} aria-hidden="true">“</div>
            )}
            <div style={{
              display: 'flex',
              fontFamily: ff('Cormorant Garamond'), fontStyle: 'italic',
              fontSize: pSize, color: C.primary,
              lineHeight: 1.16,
              marginBottom: mc.secondary ? 28 : 0,
              textShadow,
            }}>
              {primary}
            </div>
            {mc.secondary && (
              <div style={{
                display: 'flex',
                fontFamily: ff('Cormorant Garamond'), fontSize: 26,
                color: C.secondary, lineHeight: 1.4, fontStyle: 'italic',
                textShadow,
              }}>
                {mc.secondary}
              </div>
            )}

            {/* Signature: bigger, sharper, with shadow */}
            <div style={{
              display: 'flex',
              fontFamily: signatureLoaded ? 'Signature' : ff('Cormorant Garamond'),
              fontStyle: signatureLoaded ? 'normal' : 'italic',
              fontSize: signatureLoaded ? 80 : 52,
              color: C.signature,
              lineHeight: 1.0,
              marginTop: 48,
              paddingLeft: 4,
              textShadow,
            }}>
              {name}
            </div>
          </div>

          {/* Footer: handle (date moved up to sit under kicker). */}
          <div style={{
            display: 'flex', alignItems: 'center',
            paddingTop: 16, borderTop: `1px solid ${C.rule}`,
            fontFamily: ff('DM Mono'), fontSize: 16, color: C.footer,
            letterSpacing: '0.20em',
            textShadow,
          }}>
            <div style={{ display: 'flex' }}>
              {handleDisplay.toUpperCase()}
            </div>
          </div>
        </div>
      ),
      { ...size, fonts }
    );
  } catch (err) {
    console.error('[og-moment] render failed:', err?.message);
    return await safeBrand(err?.message);
  }
}
