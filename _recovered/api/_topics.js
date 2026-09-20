// ════════════════════════════════════════════════════════════════════════════
// CANONICAL DIALECTA TOPIC TAXONOMY (v2) — API SIDE
// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for topic slugs and display labels across the
// Vercel API runtime (suggest-topics endpoint, seed scripts).
//
// Adding a topic:
//   1. Append a new entry below with { label }.
//   2. `vercel --prod` to redeploy.
// The classifier prompt and any consumer that iterates this list picks
// up the addition automatically.
//
// PARALLEL COPIES that must stay in sync:
//   - dialecta theme: src/topics.js (rendering colors live there)
//   - dialecta theme: post.hbs inline TOPIC_COLORS map
//
// Colors are not stored here because the API does not render them. Topic
// rendering is the theme's responsibility; the API only classifies and
// stores slugs.
// ════════════════════════════════════════════════════════════════════════════

export const CANONICAL_TOPICS = Object.freeze([
  { slug: 'politics_governance',   label: 'Politics & Governance' },
  { slug: 'law_justice',           label: 'Law & Justice' },
  { slug: 'history',               label: 'History' },
  { slug: 'economics',             label: 'Economics' },
  { slug: 'environment_energy',    label: 'Environment & Energy' },
  { slug: 'health_medicine',       label: 'Health & Medicine' },
  { slug: 'psychology_behavior',   label: 'Psychology & Behavior' },
  { slug: 'science_technology',    label: 'Science & Technology' },
  { slug: 'philosophy_ethics',     label: 'Philosophy & Ethics' },
  { slug: 'arts_humanities',       label: 'Arts & Humanities' },
  { slug: 'theology_spirituality', label: 'Theology & Spirituality' },
  { slug: 'society_culture',       label: 'Society & Culture' },
]);

export const TOPIC_LABELS = Object.freeze(
  Object.fromEntries(CANONICAL_TOPICS.map(t => [t.slug, t.label]))
);

export const TOPIC_SLUG_SET = Object.freeze(new Set(CANONICAL_TOPICS.map(t => t.slug)));
