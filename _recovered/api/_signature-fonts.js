/**
 * api/_signature-fonts.js
 *
 * Canonical allowlist of signature fonts a contributor can pick when
 * signing the Pact (and later from /profile/ settings). Used by:
 *   - api/profile/[id].js (validates `signature_font` on become_author + PATCH)
 *   - The pact page (page-pact.hbs) renders the picker and persists choice
 *   - The profile page + authored articles render the chosen font
 *
 * The list lives in two places: this file (server) and the embedded chip
 * picker in page-pact.hbs / profile settings (client). Keep them in sync.
 * Adding a new font is a code change in both files plus one Google Fonts
 * URL update (the sitewide signature-fonts <link> in default.hbs).
 *
 * To remain ceremonially appropriate for the Pact, only single-weight script
 * / hand-printed faces are admitted. No display fonts, no body fonts. Mrs
 * Saint Delafield is the default because it is what the Pact rendered before
 * the picker shipped — keeping the original signature visual unchanged for
 * anyone who signs without picking.
 */

export const SIGNATURE_FONTS = [
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

export const DEFAULT_SIGNATURE_FONT = 'Mrs Saint Delafield';

const SIGNATURE_FONT_SET = new Set(SIGNATURE_FONTS);

export function isAllowedSignatureFont(value) {
  return typeof value === 'string' && SIGNATURE_FONT_SET.has(value);
}
