/**
 * The /fingerprint page's example data. Data, not maths: every fingerprint on
 * the page is drawn by planFingerprint from one of these, through
 * components/fingerprint, at FINGERPRINT_RENDER's current values.
 *
 * REUSED, per the brief: the three demo contributors, Newborn and Early are
 * the fingerprint lab's fixtures (../../profile/fingerprint-lab/examples.ts),
 * imported rather than copied. The three demo rows carry the same graduations
 * and resonance the live carousel read from /api/profile/seed:* on
 * 2026-09-20, checked value for value. The live carousel then threw their tier
 * mix away (fingerprint-page-mount.jsx line 23); these keep it.
 *
 * PORTED, because the page shows twelve examples no fixture covers:
 *
 *   Emerging, Mature     STAGE_DATA in components/dialecta-fingerprint.jsx,
 *                        the April prototype page, lines 1006-1132
 *   Calm, Turbulent      the same file's texture section, lines 2266-2321
 *                        and 2350-2405
 *   the eight archetypes ARCHETYPES and buildArchetypeData in
 *                        _recovered-next/lib/theme/dialecta-archetype-grid.jsx,
 *                        which the live PNG baker read (_theme/scripts/
 *                        build-archetype-svgs.jsx)
 *
 * The archetype sets already use engine v2 names and the twelve-topic
 * taxonomy. The April sets use neither, so two renames were needed:
 *
 *   axes     specificity to acuity, charity to magnanimity, originality to
 *            reach, per docs/FINGERPRINT.md "The six axes"
 *   topics   the April list predates the taxonomy in lib/topics.ts, and a
 *            slug lib/topics.ts does not know renders neutral grey. Mapped by
 *            what the contributor wrote about, the reading the page's own copy
 *            gives each one:
 *              mental_health  to health_medicine      "her own anxiety"
 *              psychology     to psychology_behavior  "clinical psychology"
 *              humanity       to philosophy_ethics    "the philosophical
 *                                                     questions psychology
 *                                                     opens up"
 *              music          to arts_humanities      same hex in both lists
 *            The live PNGs were baked with the April palette, so this is one
 *            of the places the new renders differ in colour on purpose.
 *
 * Salts. Emerging and Mature share one, because the section shows one
 * contributor at four moments. Calm and Turbulent share one, because the
 * section's argument is "same shape, different history", and a shared field
 * leaves the tier history as the only thing that differs between them, which
 * is what the recovered engine's unsalted texture did too.
 */
import type { FingerprintData, Tier } from '@dialecta/core';
import { DEMO_CONTRIBUTORS, EARLY, NEWBORN, type LabExample } from '../../profile/fingerprint-lab/examples';

export type PageExample = LabExample;

// ─── 01 · Three contributors: the lab's demo rows, as they are ───────────────

export const CONTRIBUTORS: readonly PageExample[] = DEMO_CONTRIBUTORS;

// ─── 02 · Stages of growth ───────────────────────────────────────────────────

/** STAGE_DATA.emerging, components/dialecta-fingerprint.jsx lines 1006-1064. */
const EMERGING_DATA: FingerprintData = {
  acuity: {
    graduations: 11,
    tierMix: { forum: 6, spark: 3, echo: 1, fog: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 5 },
      { topic: 'health_medicine', count: 3 },
      { topic: 'psychology_behavior', count: 3 },
    ],
  },
  calibration: {
    graduations: 9,
    tierMix: { forum: 4, spark: 3, echo: 1, fog: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 4 },
      { topic: 'health_medicine', count: 2 },
      { topic: 'psychology_behavior', count: 3 },
    ],
  },
  magnanimity: {
    graduations: 6,
    tierMix: { forum: 3, spark: 2, echo: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 3 },
      { topic: 'psychology_behavior', count: 3 },
    ],
  },
  discourse: {
    graduations: 8,
    tierMix: { forum: 3, spark: 2, fog: 1, heat: 2 },
    topicPhases: [
      { topic: 'health_medicine', count: 5 },
      { topic: 'psychology_behavior', count: 3 },
    ],
  },
  consistency: {
    graduations: 10,
    tierMix: { forum: 5, spark: 3, echo: 1, fog: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 5 },
      { topic: 'health_medicine', count: 2 },
      { topic: 'psychology_behavior', count: 3 },
    ],
  },
  reach: {
    graduations: 5,
    tierMix: { forum: 2, spark: 2, echo: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 2 },
      { topic: 'psychology_behavior', count: 3 },
    ],
  },
};

/** STAGE_DATA.mature, components/dialecta-fingerprint.jsx lines 1065-1132. */
const MATURE_DATA: FingerprintData = {
  acuity: {
    graduations: 19,
    tierMix: { forum: 14, spark: 3, echo: 2 },
    topicPhases: [
      { topic: 'health_medicine', count: 4 },
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'philosophy_ethics', count: 5 },
    ],
  },
  calibration: {
    graduations: 17,
    tierMix: { forum: 13, spark: 3, echo: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 3 },
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'philosophy_ethics', count: 4 },
    ],
  },
  magnanimity: {
    graduations: 14,
    tierMix: { forum: 11, spark: 2, echo: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 3 },
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'philosophy_ethics', count: 3 },
    ],
  },
  discourse: {
    graduations: 13,
    tierMix: { forum: 8, spark: 2, echo: 1, heat: 2 },
    topicPhases: [
      { topic: 'health_medicine', count: 4 },
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'psychology_behavior', count: 3 },
      { topic: 'philosophy_ethics', count: 2 },
    ],
  },
  consistency: {
    graduations: 18,
    tierMix: { forum: 14, spark: 3, echo: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 4 },
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'philosophy_ethics', count: 4 },
    ],
  },
  reach: {
    graduations: 11,
    tierMix: { forum: 6, spark: 3, echo: 1, fog: 1 },
    topicPhases: [
      { topic: 'health_medicine', count: 2 },
      { topic: 'psychology_behavior', count: 3 },
      { topic: 'philosophy_ethics', count: 6 },
    ],
  },
};

/** One contributor at four moments: STAGE_DATA's own resonance per stage. */
const STAGES_SALT = 'stages-of-growth';

export const STAGES: readonly PageExample[] = [
  NEWBORN,
  EARLY,
  { key: 'emerging', salt: STAGES_SALT, resonance: 0.38, data: EMERGING_DATA },
  { key: 'mature', salt: STAGES_SALT, resonance: 0.71, data: MATURE_DATA },
];

// ─── 03 · The eight archetypes ───────────────────────────────────────────────

interface ArchetypeSet {
  key: 'skeptic' | 'synthesizer' | 'advocate' | 'builder' | 'empiricist' | 'contextualist' | 'illuminator' | 'reviser';
  resonance: number;
  /** Graduations per axis. */
  grads: Record<'acuity' | 'calibration' | 'magnanimity' | 'discourse' | 'consistency' | 'reach', number>;
  /** Share of each axis's graduations earned in each tier. Tiers at 0 are left out. */
  tierProfile: Partial<Record<Tier, number>>;
  /** Topics in the order they were written about, oldest first. */
  topics: readonly string[];
}

/** ARCHETYPES, dialecta-archetype-grid.jsx lines 46-127, value for value. */
const ARCHETYPE_SETS: readonly ArchetypeSet[] = [
  {
    key: 'skeptic',
    resonance: 0.7,
    grads: { acuity: 18, calibration: 14, magnanimity: 8, discourse: 12, consistency: 17, reach: 9 },
    tierProfile: { forum: 0.86, spark: 0.1, echo: 0.02, fog: 0.01, heat: 0.01 },
    topics: ['philosophy_ethics', 'science_technology', 'psychology_behavior'],
  },
  {
    key: 'synthesizer',
    resonance: 0.85,
    grads: { acuity: 11, calibration: 17, magnanimity: 16, discourse: 12, consistency: 8, reach: 20 },
    tierProfile: { forum: 0.65, spark: 0.3, echo: 0.03, fog: 0.01, heat: 0.01 },
    topics: [
      'philosophy_ethics',
      'arts_humanities',
      'science_technology',
      'history',
      'economics',
      'psychology_behavior',
      'theology_spirituality',
    ],
  },
  {
    key: 'advocate',
    resonance: 0.8,
    grads: { acuity: 13, calibration: 19, magnanimity: 21, discourse: 18, consistency: 12, reach: 14 },
    tierProfile: { forum: 0.62, spark: 0.2, echo: 0.05, fog: 0.04, heat: 0.07, stance: 0.02 },
    topics: ['politics_governance', 'economics', 'philosophy_ethics', 'law_justice'],
  },
  {
    key: 'builder',
    resonance: 0.7,
    grads: { acuity: 19, calibration: 11, magnanimity: 9, discourse: 10, consistency: 18, reach: 10 },
    tierProfile: { forum: 0.78, spark: 0.18, echo: 0.02, fog: 0.01, heat: 0.01 },
    topics: ['science_technology', 'economics', 'environment_energy'],
  },
  {
    key: 'empiricist',
    resonance: 0.78,
    grads: { acuity: 20, calibration: 17, magnanimity: 11, discourse: 9, consistency: 16, reach: 11 },
    tierProfile: { forum: 0.94, spark: 0.05, echo: 0.01 },
    topics: ['science_technology', 'health_medicine', 'environment_energy'],
  },
  {
    key: 'contextualist',
    resonance: 0.75,
    grads: { acuity: 14, calibration: 13, magnanimity: 18, discourse: 10, consistency: 12, reach: 17 },
    tierProfile: { forum: 0.72, spark: 0.22, echo: 0.04, fog: 0.02 },
    topics: ['history', 'society_culture', 'philosophy_ethics', 'theology_spirituality', 'arts_humanities'],
  },
  {
    key: 'illuminator',
    resonance: 0.82,
    grads: { acuity: 17, calibration: 12, magnanimity: 18, discourse: 8, consistency: 17, reach: 16 },
    tierProfile: { forum: 0.8, spark: 0.16, echo: 0.02, fog: 0.01, heat: 0.01 },
    topics: ['arts_humanities', 'philosophy_ethics', 'science_technology', 'history'],
  },
  {
    key: 'reviser',
    resonance: 0.72,
    grads: { acuity: 14, calibration: 22, magnanimity: 13, discourse: 13, consistency: 11, reach: 12 },
    tierProfile: { forum: 0.85, spark: 0.12, echo: 0.02, fog: 0.01 },
    topics: ['environment_energy', 'philosophy_ethics', 'science_technology'],
  },
];

/**
 * tierMixFromProfile, dialecta-archetype-grid.jsx lines 131-145: floor each
 * tier's share of the graduations, then sweep the remainder into Forum so the
 * mix sums to the graduation count. Fixture construction, not rendering.
 */
function tierMixFromProfile(graduations: number, profile: Partial<Record<Tier, number>>): Partial<Record<Tier, number>> {
  const tiers: readonly Tier[] = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];
  const mix: Partial<Record<Tier, number>> = {};
  let allocated = 0;
  for (const tier of tiers) {
    const n = Math.floor(graduations * (profile[tier] ?? 0));
    mix[tier] = n;
    allocated += n;
  }
  mix.forum = (mix.forum ?? 0) + (graduations - allocated);
  return mix;
}

/**
 * topicPhasesFromList, dialecta-archetype-grid.jsx lines 147-160: an even
 * split across the topics, the remainder on the last one written about.
 */
function topicPhasesFromList(graduations: number, topics: readonly string[]): Array<{ topic: string; count: number }> {
  if (graduations === 0 || topics.length === 0) return [];
  const perTopic = Math.floor(graduations / topics.length);
  const phases = topics.slice(0, -1).map((topic) => ({ topic, count: perTopic }));
  phases.push({ topic: topics[topics.length - 1] ?? '', count: graduations - perTopic * (topics.length - 1) });
  return phases;
}

/** buildArchetypeData, dialecta-archetype-grid.jsx lines 162-173. */
function archetypeData(set: ArchetypeSet): FingerprintData {
  const data: FingerprintData = {};
  for (const [axis, graduations] of Object.entries(set.grads) as Array<[keyof ArchetypeSet['grads'], number]>) {
    data[axis] = {
      graduations,
      tierMix: tierMixFromProfile(graduations, set.tierProfile),
      topicPhases: topicPhasesFromList(graduations, set.topics),
    };
  }
  return data;
}

export const ARCHETYPES: ReadonlyArray<PageExample & { key: ArchetypeSet['key'] }> = ARCHETYPE_SETS.map((set) => ({
  key: set.key,
  salt: set.key,
  resonance: set.resonance,
  data: archetypeData(set),
}));

// ─── 04 · Reading the texture ────────────────────────────────────────────────

/** Calm Waters, components/dialecta-fingerprint.jsx lines 2266-2321. */
const CALM_DATA: FingerprintData = {
  acuity: {
    graduations: 14,
    tierMix: { forum: 13, spark: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 6 },
    ],
  },
  calibration: {
    graduations: 12,
    tierMix: { forum: 11, spark: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 5 },
    ],
  },
  magnanimity: {
    graduations: 11,
    tierMix: { forum: 10, spark: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 4 },
    ],
  },
  discourse: {
    graduations: 13,
    tierMix: { forum: 12, spark: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 6 },
    ],
  },
  consistency: {
    graduations: 12,
    tierMix: { forum: 11, spark: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 5 },
    ],
  },
  reach: {
    graduations: 11,
    tierMix: { forum: 10, spark: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 4 },
    ],
  },
};

/** Turbulent Waters, components/dialecta-fingerprint.jsx lines 2350-2405. */
const TURBULENT_DATA: FingerprintData = {
  acuity: {
    graduations: 14,
    tierMix: { forum: 4, spark: 3, echo: 2, fog: 1, heat: 3, stance: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 5 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 6 },
    ],
  },
  calibration: {
    graduations: 12,
    tierMix: { forum: 3, spark: 3, echo: 2, fog: 1, heat: 2, stance: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 5 },
    ],
  },
  magnanimity: {
    graduations: 11,
    tierMix: { forum: 3, spark: 2, echo: 2, fog: 1, heat: 2, stance: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 4 },
    ],
  },
  discourse: {
    graduations: 13,
    tierMix: { forum: 3, spark: 3, echo: 2, fog: 1, heat: 3, stance: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 6 },
    ],
  },
  consistency: {
    graduations: 12,
    tierMix: { forum: 3, spark: 3, echo: 2, fog: 1, heat: 2, stance: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 5 },
    ],
  },
  reach: {
    graduations: 11,
    tierMix: { forum: 3, spark: 2, echo: 2, fog: 1, heat: 2, stance: 1 },
    topicPhases: [
      { topic: 'psychology_behavior', count: 4 },
      { topic: 'arts_humanities', count: 3 },
      { topic: 'psychology_behavior', count: 4 },
    ],
  },
};

/** Both at the prototype's resonance, 0.72, on one shared field. */
const TEXTURE_SALT = 'reading-the-texture';

export const TEXTURES: ReadonlyArray<PageExample & { key: 'calm' | 'turbulent' }> = [
  { key: 'calm', salt: TEXTURE_SALT, resonance: 0.72, data: CALM_DATA },
  { key: 'turbulent', salt: TEXTURE_SALT, resonance: 0.72, data: TURBULENT_DATA },
];
