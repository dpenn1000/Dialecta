// ════════════════════════════════════════════════════════════════════════════
// CANONICAL DIALECTA TOPIC TAXONOMY (v2)
// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for topic slugs, display labels, and rendering
// colors across the entire compiled theme bundle.
//
// Adding a topic:
//   1. Append a new entry below with { label, color, colorDeep }.
//   2. Run `npm run build` to recompile bundle.js + profile.js.
//   3. ZIP the theme and upload via Magic Pages dashboard.
// Every consumer (editor selector, fingerprint petal palette, profile
// rendering, article topic-chip color lookup) picks up the addition
// automatically.
//
// PARALLEL COPIES that must be updated when topics change:
//   - post.hbs inline TOPIC_COLORS map (Handlebars template, runs in
//     browser independent of the bundle, cannot import from this file)
//   - api/_topics.js in the Vercel API repo (separate runtime)
//
// Color tokens follow Dialecta's warm, slightly-desaturated palette.
// `color` is the primary chip / ring color; `colorDeep` is the inner
// fingerprint ring shade roughly 50% darker.
// ════════════════════════════════════════════════════════════════════════════

export const TOPICS = Object.freeze({
  politics_governance:   { label: 'Politics & Governance',   color: '#9e2020', colorDeep: '#501010' },
  law_justice:           { label: 'Law & Justice',           color: '#b04020', colorDeep: '#5a1e0a' },
  history:               { label: 'History',                 color: '#9a5818', colorDeep: '#4e2c08' },
  economics:             { label: 'Economics',               color: '#b87a18', colorDeep: '#5c3c08' },
  environment_energy:    { label: 'Environment & Energy',    color: '#3a7a24', colorDeep: '#1c3c12' },
  health_medicine:       { label: 'Health & Medicine',       color: '#287858', colorDeep: '#123c2c' },
  psychology_behavior:   { label: 'Psychology & Behavior',   color: '#267080', colorDeep: '#123840' },
  science_technology:    { label: 'Science & Technology',    color: '#2650a0', colorDeep: '#123050' },
  philosophy_ethics:     { label: 'Philosophy & Ethics',     color: '#3a3888', colorDeep: '#1c1c44' },
  arts_humanities:       { label: 'Arts & Humanities',       color: '#6a3a9a', colorDeep: '#351848' },
  theology_spirituality: { label: 'Theology & Spirituality', color: '#7a2a80', colorDeep: '#3c1440' },
  society_culture:       { label: 'Society & Culture',       color: '#8a2858', colorDeep: '#44142c' },
});

export const TOPIC_LIST = Object.freeze(
  Object.entries(TOPICS).map(([slug, t]) => ({ slug, ...t }))
);

export const TOPIC_SLUGS = Object.freeze(Object.keys(TOPICS));
