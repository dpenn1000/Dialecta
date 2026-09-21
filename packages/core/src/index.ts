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
  type OpposingViewEngagement,
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
  type AxisMappingContext,
  type AxisScore,
  type AxisScores,
} from './axis-mapping';

export {
  GRADUATION_HORIZON,
  HORIZON_SOFTNESS,
  RADIUS_POWER,
  TRADEOFF_PAIRS,
  TRADEOFF_PENALTY,
  TRADEOFF_PENALTY_CAP,
  axisCeiling,
  axisExtent,
  fingerprintExtents,
  horizonProgress,
  ringCount,
  tradeoffFactor,
  type AxisTotals,
} from './fingerprint-geometry';

export {
  BASE_NOISE_FLOOR,
  BASE_NOISE_IMPURITY_GAIN,
  NOISE_OCTAVES,
  PHASE_JITTER,
  PURITY_SATURATION_FLOOR,
  ROTATION_WALK_STEP,
  TURBULENCE_FLOOR,
  WAVE_AMPLITUDE,
  applyPurity,
  baseNoiseAmplitude,
  perimeterNoise,
  saturationForPurity,
  ringFields,
  textureOffset,
  turbulenceWave,
  waveAmplitude,
  type RingField,
  type TextureInput,
} from './fingerprint-texture';

export {
  FINGERPRINT_RENDER,
  FINGERPRINT_WHEEL,
  blendHex,
  deriveAxisMetrics,
  fingerprintSalt,
  planFingerprint,
  topicPhasesFromHistory,
  type AxisMetrics,
  type ClarityBucket,
  type FingerprintAxisData,
  type FingerprintData,
  type FingerprintHalo,
  type FingerprintHaloStroke,
  type FingerprintPlan,
  type FingerprintRenderParams,
  type FingerprintRing,
  type FingerprintSegment,
  type HaloBlur,
  type PlanOptions,
  type TopicColor,
  type TopicPalette,
  type TopicPhase,
} from './fingerprint-plan';

export {
  renderFingerprintSvg,
  type FingerprintSvg,
  type FingerprintSvgClasses,
  type FingerprintSvgOptions,
} from './fingerprint-svg';

export { RETURN_PATH_FALLBACK, RETURN_PATH_MAX_LENGTH, safeReturnPath } from './return-path';

export {
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  WEEK_MS,
  relativeTimeParts,
  type RelativeTimeParts,
  type RelativeTimeUnit,
} from './relative-time';
