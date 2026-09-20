/**
 * dialecta-archetype-grid.jsx
 *
 * NOT imported by the runtime bundle. Reserved for the build-time SVG
 * generator (planned: scripts/build-archetype-svgs.js). Mounting eight
 * live Fingerprint instances on the Living Fingerprint page tanked page
 * perf in an earlier attempt; the canonical strategy is now:
 *
 *   1. The eight archetype data sets + helpers below are the source of
 *      truth for what each archetype's fingerprint should look like.
 *   2. A Node script renders each via React's renderToStaticMarkup,
 *      saves an SVG to assets/svg/fp-arch-<slug>.svg.
 *   3. page-fingerprint.hbs references those static SVGs as <img>.
 *
 * That pipeline keeps the visual engine-accurate (re-run the script when
 * the Fingerprint engine evolves) without paying client-side render cost.
 *
 * Source of truth for the archetype list: api/profile/[id].js
 * ARCHETYPE_NOTES. Eight archetypes:
 *
 *   skeptic        Questions premises before accepting conclusions.
 *   synthesizer    Finds unexpected connections across domains.
 *   advocate       Argues the strongest version of opposing views.
 *   builder        Extends ideas into practical frameworks.
 *   empiricist     Grounds every claim in evidence and data.
 *   contextualist  Situates ideas in their historical and cultural frame.
 *   illuminator    Makes complex ideas accessible without losing nuance.
 *   reviser        Publicly updates positions when shown evidence.
 *
 * Each archetype has a per-axis graduation profile, a tier distribution
 * profile (encodes voice purity/turbulence), and a topic mix (encodes
 * halo color). Trade-off pairs from the engine (acuity↔reach,
 * discourse↔calibration, discourse↔magnanimity) are respected: an
 * Advocate with high Discourse + Calibration + Magnanimity will visibly
 * trade off all three.
 */

// No runtime imports. This module is consumed only by the build-time
// SVG generator (scripts/build-archetype-svgs.jsx). See header note.

// ─── Hypothetical data sets per archetype ───────────────────────────────
// Graduation values are clamped 0-22 by the engine. The relative shape
// matters more than the absolute counts. tierProfile = ratios summing to
// 1.0; topics = list of slug strings consumed by the topicPhases helper.

const ARCHETYPES = [
  {
    slug: 'skeptic',
    label: 'The Skeptic',
    line: 'Questions premises before accepting conclusions.',
    desc: 'High Acuity reaches the rim with high Consistency. Magnanimity sits shorter than its neighbors because she is sharper than she is generous. Tier history is Forum-clean. The halo reads cool steel: she works in philosophy, science, and the psychology of judgment.',
    axisGrads: { acuity: 18, calibration: 14, magnanimity: 8, discourse: 12, consistency: 17, reach: 9 },
    tierProfile: { forum: 0.86, spark: 0.10, echo: 0.02, fog: 0.01, heat: 0.01, stance: 0, breach: 0 },
    topics: ['philosophy_ethics', 'science_technology', 'psychology_behavior'],
    resonance: 0.7,
  },
  {
    slug: 'synthesizer',
    label: 'The Synthesizer',
    line: 'Finds unexpected connections across domains.',
    desc: 'Reach extends to the edge while Consistency stays modest, the signature of someone whose positions evolve as new connections appear. Calibration runs high, Magnanimity higher. Tier history is Forum and Spark, no Breach. The halo carries every color: there is no domain she has not engaged with.',
    axisGrads: { acuity: 11, calibration: 17, magnanimity: 16, discourse: 12, consistency: 8, reach: 20 },
    tierProfile: { forum: 0.65, spark: 0.30, echo: 0.03, fog: 0.01, heat: 0.01, stance: 0, breach: 0 },
    topics: ['philosophy_ethics', 'arts_humanities', 'science_technology', 'history', 'economics', 'psychology_behavior', 'theology_spirituality'],
    resonance: 0.85,
  },
  {
    slug: 'advocate',
    label: 'The Advocate',
    line: 'Argues the strongest version of opposing views.',
    desc: 'Heavy Calibration and Magnanimity, heavy Discourse. The contributor others want to argue with because she treats their arguments better than they do. Discourse carries visible wave texture; high-volume engagement with hard positions leaves a wake before calming. Topic focus: politics and economics.',
    axisGrads: { acuity: 13, calibration: 19, magnanimity: 21, discourse: 18, consistency: 12, reach: 14 },
    tierProfile: { forum: 0.62, spark: 0.20, echo: 0.05, fog: 0.04, heat: 0.07, stance: 0.02, breach: 0 },
    topics: ['politics_governance', 'economics', 'philosophy_ethics', 'law_justice'],
    resonance: 0.8,
  },
  {
    slug: 'builder',
    label: 'The Builder',
    line: 'Extends ideas into practical frameworks.',
    desc: 'Acuity is precise and Consistency runs high; frameworks have to hold. Discourse and Magnanimity sit shorter because she is building, not debating. Tier history is Forum-heavy. The halo reads warm: science, technology, environment, the domains where ideas turn into things.',
    axisGrads: { acuity: 19, calibration: 11, magnanimity: 9, discourse: 10, consistency: 18, reach: 10 },
    tierProfile: { forum: 0.78, spark: 0.18, echo: 0.02, fog: 0.01, heat: 0.01, stance: 0, breach: 0 },
    topics: ['science_technology', 'economics', 'environment_energy'],
    resonance: 0.7,
  },
  {
    slug: 'empiricist',
    label: 'The Empiricist',
    line: 'Grounds every claim in evidence and data.',
    desc: 'Acuity reaches the rim with Calibration close behind; new data updates the position, but only when the data is real. Tier history is the cleanest on the platform, almost pure Forum across every axis. The halo reads green and clinical-blue: science, health, environment.',
    axisGrads: { acuity: 20, calibration: 17, magnanimity: 11, discourse: 9, consistency: 16, reach: 11 },
    tierProfile: { forum: 0.94, spark: 0.05, echo: 0.01, fog: 0, heat: 0, stance: 0, breach: 0 },
    topics: ['science_technology', 'health_medicine', 'environment_energy'],
    resonance: 0.78,
  },
  {
    slug: 'contextualist',
    label: 'The Contextualist',
    line: 'Situates ideas in their historical and cultural frame.',
    desc: 'Magnanimity and Reach are tall: she sees how positions arise from where the contributor stands. Acuity is moderate because she is not prosecuting one claim, she is mapping the field. The halo reads warm brown and deep purple: history, culture, philosophy, theology.',
    axisGrads: { acuity: 14, calibration: 13, magnanimity: 18, discourse: 10, consistency: 12, reach: 17 },
    tierProfile: { forum: 0.72, spark: 0.22, echo: 0.04, fog: 0.02, heat: 0, stance: 0, breach: 0 },
    topics: ['history', 'society_culture', 'philosophy_ethics', 'theology_spirituality', 'arts_humanities'],
    resonance: 0.75,
  },
  {
    slug: 'illuminator',
    label: 'The Illuminator',
    line: 'Makes complex ideas accessible without losing nuance.',
    desc: 'High Acuity, high Magnanimity, high Reach. She has to understand it, frame it generously, and know enough domains to translate between them. Discourse is shorter because she is teaching, not debating. Tier history is Forum-clean. The halo carries arts purple, philosophy indigo, and a band of science blue.',
    axisGrads: { acuity: 17, calibration: 12, magnanimity: 18, discourse: 8, consistency: 17, reach: 16 },
    tierProfile: { forum: 0.80, spark: 0.16, echo: 0.02, fog: 0.01, heat: 0.01, stance: 0, breach: 0 },
    topics: ['arts_humanities', 'philosophy_ethics', 'science_technology', 'history'],
    resonance: 0.82,
  },
  {
    slug: 'reviser',
    label: 'The Reviser',
    line: 'Publicly updates positions when shown evidence.',
    desc: 'Signature: extraordinarily high Calibration, the axis that measures willingness to revise. Her tier history is unusually clean because the process of public updating protects her from Fog and Heat. Modest Reach; she refines rather than invents. The halo reads green: renewable energy is her dominant territory.',
    axisGrads: { acuity: 14, calibration: 22, magnanimity: 13, discourse: 13, consistency: 11, reach: 12 },
    tierProfile: { forum: 0.85, spark: 0.12, echo: 0.02, fog: 0.01, heat: 0, stance: 0, breach: 0 },
    topics: ['environment_energy', 'philosophy_ethics', 'science_technology'],
    resonance: 0.72,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────

function tierMixFromProfile(graduations, profile) {
  // Distribute graduations across the seven tiers based on the archetype's
  // tier profile. Floor each allocation; sweep the remainder into Forum so
  // the totals exactly match the graduation count.
  const TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];
  const mix = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0, breach: 0 };
  let allocated = 0;
  for (const tier of TIERS) {
    const count = Math.floor(graduations * (profile[tier] || 0));
    mix[tier] = count;
    allocated += count;
  }
  mix.forum += (graduations - allocated);
  return mix;
}

function topicPhasesFromList(graduations, topics) {
  // Distribute graduations evenly across the topic list with a slight bias
  // toward the first (which becomes the inner / earliest topic of practice).
  if (graduations === 0 || topics.length === 0) return [];
  const phases = [];
  const perTopic = Math.floor(graduations / topics.length);
  let remaining = graduations;
  for (let i = 0; i < topics.length - 1; i++) {
    phases.push({ topic: topics[i], count: perTopic });
    remaining -= perTopic;
  }
  phases.push({ topic: topics[topics.length - 1], count: remaining });
  return phases;
}

function buildArchetypeData(archetype) {
  const data = {};
  for (const axisKey of Object.keys(archetype.axisGrads)) {
    const grad = archetype.axisGrads[axisKey];
    data[axisKey] = {
      graduations: grad,
      tierMix:     tierMixFromProfile(grad, archetype.tierProfile),
      topicPhases: topicPhasesFromList(grad, archetype.topics),
    };
  }
  return data;
}

// Exports consumed by the build-time SVG generator.
export { ARCHETYPES, buildArchetypeData };
