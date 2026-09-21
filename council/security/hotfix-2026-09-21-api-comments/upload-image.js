/**
 * api/article/upload-image.js, disabled. Security hotfix 2026-09-21.
 *
 * Replaces the deployed file: SHA-1 ab585594fdcd658c84bdf6b0ad789ef23c63632d in
 * Vercel deployment dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7, recovered byte for byte at
 * _recovered/api/article/upload-image.js.
 *
 * Deploy location: api/article/upload-image.js in a copy of the recovered tree, where
 * ../_cors.js resolves to the deployed _cors.js.
 *
 * The deployed handler hosted any image on Ghost's CDN for any caller who named a
 * member_uuid belonging to a profile (and, for purpose 'article', an author's). The
 * check proved only that the id exists, and author ids are printed on every article
 * page. The legacy API has no way to verify a session: every live caller sends
 * member_uuid read from the page, and nothing in the theme fetches a signed token.
 *
 * This version refuses every upload. It still answers the CORS preflight, so the three
 * live callers (shell.js, home.js, editor.js) can read the refusal and show its message
 * instead of a bare network error. It never reads the request body and imports nothing
 * that reaches Supabase, sharp or Ghost.
 */

import { applyCors } from '../_cors.js';

export const UPLOADS_PAUSED_MESSAGE =
  'Image uploads are paused for now. Images already on the site stay as they are.';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(503).json({ error: UPLOADS_PAUSED_MESSAGE });
}
