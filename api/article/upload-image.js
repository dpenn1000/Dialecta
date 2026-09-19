/**
 * api/article/upload-image.js
 *
 * Image upload endpoint for article feature photos AND profile identity
 * surfaces (avatars, field notes, book covers). Accepts a base64-encoded
 * image in any common raster format, normalizes it through sharp (resize +
 * EXIF rotate + WebP encode + EXIF strip), and forwards the optimized
 * binary to Ghost's Admin API /images/upload endpoint. Returns the hosted
 * Ghost CDN URL for the caller to attach to whatever it was uploading for.
 *
 * Why base64 in JSON instead of multipart? Vercel's body parser handles
 * JSON cleanly with no extra config; multipart would need bodyParser:false
 * and a parser library. The ~33% base64 inflation stays under Vercel's
 * 4.5 MB body limit at our 10 MB raw input cap (handled below by sharp).
 *
 * Auth model (purpose-discriminated):
 *   purpose='article' (or unset): is_author=true required.
 *   purpose='avatar' | 'field_note' | 'book_cover': any signed-in member
 *     with a Supabase profile. Personal identity, not author-gated.
 *
 * Transform: every accepted upload is converted to WebP with per-purpose
 * size caps (avatars/identity: 1024 px / q80; articles: 2400 px / q82).
 * The original is never persisted — we only store the optimized output.
 * EXIF is stripped (privacy + size). Orientation is honored before strip.
 *
 * POST body:
 *   {
 *     filename:    string,                         // original filename (we rewrite ext to .webp)
 *     mime_type:   string,                         // any image/* the allowlist below permits
 *     data:        string,                         // base64-encoded file contents
 *     member_uuid: string,                         // for auth check
 *     purpose:     'article' | 'avatar' |          // optional, defaults to 'article'
 *                  'field_note' | 'book_cover',
 *   }
 *
 * Response:
 *   { url: string, bytes: number, width: number, height: number }
 *
 * Note: this endpoint lives at /api/article/ for backward-compat with the
 * editor's existing call site. Despite the path it's now a generalized
 * image-upload service. We keep the path stable to avoid editor.jsx
 * touching unrelated code and to stay under the Vercel 12-function cap.
 */

import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { ghostAdminFetch } from '../_ghost-admin.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Wide allowlist on input — sharp handles all of these natively. SVG is
// intentionally excluded: SVGs are usually already small and rasterizing
// them loses scalability, so we let SVGs pass through other paths if/when
// needed. iOS Safari can report HEIC as image/heic OR image/heif, so we
// accept both spellings.
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/tiff',
  'image/bmp',
]);

// Generous input cap — sharp brings the output back down dramatically.
// A 10 MB phone photo typically transforms to 200-500 KB at 2400 px / q82.
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

// Per-purpose transform configs.
// Identity surfaces (avatar / field_note / book_cover): cap at 1024 px on
// the long edge — covers retina display at every current surface.
// Article hero: 2400 px source so Ghost can generate sharp responsive
// variants down through the srcset (the theme requests 600/1000/1600/
// 2400 widths via {{img_url ... size=...}}).
const TRANSFORM_CONFIGS = {
  avatar:     { maxWidth: 1024, quality: 80 },
  field_note: { maxWidth: 1024, quality: 80 },
  book_cover: { maxWidth: 1024, quality: 82 },
  article:    { maxWidth: 2400, quality: 82 },
};

export const config = {
  api: {
    bodyParser: { sizeLimit: '14mb' }, // 10 MB raw + base64 inflation headroom
  },
};

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { filename, mime_type, data, member_uuid, purpose } = req.body || {};
  // Identity purposes are open to any signed-in member with a profile;
  // anything else falls through to 'article' and triggers the is_author
  // gate below. field_note and book_cover were added with migration 015
  // (profile identity sections) and follow the same auth posture as
  // avatar — personal identity, not author-gated.
  const PERSONAL_IDENTITY_PURPOSES = new Set(['avatar', 'field_note', 'book_cover']);
  const uploadPurpose = PERSONAL_IDENTITY_PURPOSES.has(purpose) ? purpose : 'article';

  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({ error: 'member_uuid is required' });
  }
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'filename is required' });
  }
  if (!mime_type || !ALLOWED_MIME.has(String(mime_type).toLowerCase())) {
    return res.status(400).json({
      error: 'Unsupported image format. Accepts JPEG, PNG, WebP, GIF, HEIC, AVIF, TIFF, BMP.',
      received: mime_type,
    });
  }
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'data is required (base64-encoded file contents)' });
  }

  try {
    // Auth gate. Identity uploads (avatar / field_note / book_cover) are
    // open to any signed-in member with a Supabase profile; article
    // uploads are author-only (mirrors /submit).
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('is_author')
      .eq('ghost_member_id', member_uuid)
      .maybeSingle();

    if (profileErr) throw profileErr;
    if (!profile) {
      return res.status(403).json({
        error: 'No Dialecta profile exists for this member. Visit /profile/ first.',
      });
    }
    if (uploadPurpose === 'article' && !profile.is_author) {
      return res.status(403).json({
        error: 'Article photos are author-only. Take the Pact at /pact/ to become an author.',
      });
    }

    let inputBuffer;
    try {
      inputBuffer = Buffer.from(data, 'base64');
    } catch (err) {
      return res.status(400).json({ error: 'data is not valid base64', detail: err.message });
    }
    if (inputBuffer.length === 0) {
      return res.status(400).json({ error: 'decoded image is empty' });
    }
    if (inputBuffer.length > MAX_INPUT_BYTES) {
      return res.status(413).json({
        error: 'Image too large',
        detail: 'Maximum input size is 10 MB. Yours is ' + (inputBuffer.length / (1024 * 1024)).toFixed(2) + ' MB.',
      });
    }

    // ─── Transform ──────────────────────────────────────────────────────
    // Resize (long-edge cap, never enlarge) → honor EXIF rotation → encode
    // as WebP. EXIF is stripped by default in this pipeline. animated:false
    // collapses GIFs to their first frame (lossless WebP would preserve
    // animation, but we don't need animated avatars or article heroes
    // and this keeps the output tiny).
    const cfg = TRANSFORM_CONFIGS[uploadPurpose] || TRANSFORM_CONFIGS.article;
    let outputBuffer;
    let outputMeta;
    try {
      const pipeline = sharp(inputBuffer, { animated: false }).rotate();
      outputBuffer = await pipeline
        .resize({
          width: cfg.maxWidth,
          height: cfg.maxWidth,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: cfg.quality, effort: 4 })
        .toBuffer();
      outputMeta = await sharp(outputBuffer).metadata();
    } catch (err) {
      return res.status(400).json({
        error: 'Could not process image. The file may be corrupt or in an unsupported format.',
        detail: err.message,
      });
    }

    // Filename → swap ext to .webp so the Ghost CDN URL ends in .webp
    // (matters for browser MIME sniffing and our own log readability).
    const transformedFilename = String(filename).replace(/\.[^.]+$/, '') + '.webp';

    const formData = new FormData();
    formData.append('file', new Blob([outputBuffer], { type: 'image/webp' }), transformedFilename);
    formData.append('purpose', 'image');

    const ghostResp = await ghostAdminFetch('/images/upload/', {
      method: 'POST',
      body: formData,
    });

    const url = ghostResp?.images?.[0]?.url;
    if (!url) {
      return res.status(502).json({
        error: 'Ghost returned no image URL',
        detail: JSON.stringify(ghostResp).slice(0, 500),
      });
    }

    return res.status(200).json({
      url,
      bytes:  outputBuffer.length,
      width:  outputMeta?.width  || null,
      height: outputMeta?.height || null,
      input_bytes: inputBuffer.length,
      ratio: Math.round((outputBuffer.length / Math.max(1, inputBuffer.length)) * 100) / 100,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(error.statusCode || 500).json({
      error: 'Image upload failed',
      detail: error.message,
    });
  }
}
