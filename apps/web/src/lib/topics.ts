/**
 * The canonical Dialecta topic taxonomy, twelve primary topics.
 *
 * Ported from _recovered-next/lib/theme/topics.js (44 lines, Council verdict:
 * As-is, provisional). Values are unchanged. What changed: typed, and the
 * recovered header's instruction to "ZIP the theme and upload via Magic Pages"
 * is gone, since there is no Ghost theme to rebuild.
 *
 * This belongs in @dialecta/core next to tiers and pillars, because the
 * recovered file's own header lists three runtimes that each kept a copy
 * (the bundle, post.hbs, the Vercel API). It lives here for now because
 * packages/core is outside this increment's write scope. Moving it is a
 * rename, not a rewrite.
 *
 * `color` is the chip and ring colour, `colorDeep` the inner fingerprint ring.
 */

export interface TopicDefinition {
  readonly label: string;
  readonly color: string;
  readonly colorDeep: string;
}

export const TOPICS = {
  politics_governance: { label: 'Politics & Governance', color: '#9e2020', colorDeep: '#501010' },
  law_justice: { label: 'Law & Justice', color: '#b04020', colorDeep: '#5a1e0a' },
  history: { label: 'History', color: '#9a5818', colorDeep: '#4e2c08' },
  economics: { label: 'Economics', color: '#b87a18', colorDeep: '#5c3c08' },
  environment_energy: { label: 'Environment & Energy', color: '#3a7a24', colorDeep: '#1c3c12' },
  health_medicine: { label: 'Health & Medicine', color: '#287858', colorDeep: '#123c2c' },
  psychology_behavior: { label: 'Psychology & Behavior', color: '#267080', colorDeep: '#123840' },
  science_technology: { label: 'Science & Technology', color: '#2650a0', colorDeep: '#123050' },
  philosophy_ethics: { label: 'Philosophy & Ethics', color: '#3a3888', colorDeep: '#1c1c44' },
  arts_humanities: { label: 'Arts & Humanities', color: '#6a3a9a', colorDeep: '#351848' },
  theology_spirituality: { label: 'Theology & Spirituality', color: '#7a2a80', colorDeep: '#3c1440' },
  society_culture: { label: 'Society & Culture', color: '#8a2858', colorDeep: '#44142c' },
} as const satisfies Record<string, TopicDefinition>;

export type TopicSlug = keyof typeof TOPICS;

export interface Topic extends TopicDefinition {
  readonly slug: TopicSlug;
}

export const TOPIC_SLUGS = Object.keys(TOPICS) as TopicSlug[];

export const TOPIC_LIST: readonly Topic[] = TOPIC_SLUGS.map((slug) => ({ slug, ...TOPICS[slug] }));

export function isTopicSlug(value: unknown): value is TopicSlug {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TOPICS, value);
}

export function topicLabel(slug: string | null | undefined): string | null {
  return slug && isTopicSlug(slug) ? TOPICS[slug].label : null;
}
