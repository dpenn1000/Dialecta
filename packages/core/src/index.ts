export {
  TIERS,
  TIER_IDS,
  TIER_ZONES,
  isTier,
  tierDefinition,
  tierName,
  type Tier,
  type TierDefinition,
  type TierZone,
} from './tiers';

export {
  PILLARS,
  PILLAR_IDS,
  isPillar,
  pillarName,
  type Pillar,
  type Axis,
  type PillarDefinition,
} from './pillars';

export {
  ARCHETYPES,
  ARCHETYPE_IDS,
  FORMING,
  isArchetype,
  isArchetypeAssignment,
  archetypeName,
  type Archetype,
  type ArchetypeAssignment,
  type ArchetypeDefinition,
} from './archetypes';

export {
  CLASSIFIER_PROMPT_VERSION,
  ClassificationParseError,
  buildSystemPrompt,
  buildUserMessage,
  parseClassification,
  stripCodeFences,
  type ArticleEngagement,
  type ClassificationResult,
  type Emotion,
  type Specificity,
} from './classification';

export {
  RESOLUTION_WEIGHTS,
  resolveFinalTier,
  type CommunityVotes,
  type ResolveInput,
  type ResolveResult,
  type TierDistribution,
} from './resolution';

export {
  GRADUATION_CAP,
  axisDeltasFor,
  replayAxisScores,
  type AxisDelta,
  type AxisEvent,
  type AxisScore,
  type AxisScores,
} from './axis-mapping';
