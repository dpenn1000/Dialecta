/**
 * Final tier resolution.
 *
 * Locked weighting (CLAUDE.md, "Classification weighting"):
 *   AI suggestion            40%
 *   Community voting         35%
 *   Self-declaration         15%
 *   Stage 2.5 response quality 10%
 *
 * Each signal is expressed as a probability distribution over the seven tiers,
 * the distributions are combined by weighted sum, and the argmax wins. Ties go
 * to the AI tier, since it is the only signal that is always present.
 *
 * Signals that are absent contribute nothing and their weight is left out of
 * the sum. That is deliberate: with no community votes and no self-declaration,
 * the AI tier wins outright rather than being diluted.
 *
 * OPEN SPEC QUESTION: the community threshold that triggers a re-review event
 * (how many nominate_up or nominate_down votes, and over what window) is not
 * yet fixed in docs/Dialecta_Data_Architecture.md. This function only resolves
 * the tier given the votes it is handed; deciding when to call it is the
 * caller's job.
 */
import { TIER_IDS, type Tier } from './tiers';

export const RESOLUTION_WEIGHTS = {
  ai: 0.4,
  community: 0.35,
  self: 0.15,
  stage25: 0.1,
} as const;

/** Nomination counts per tier from community voting. Missing tiers count as zero. */
export type CommunityVotes = Partial<Record<Tier, number>>;

export interface ResolveInput {
  /** Stage 1: the tier the classifier suggested. Always present. */
  aiTier: Tier;
  /** Stage 2: the tier the commenter declared, if they overrode or confirmed. */
  selfDeclaredTier?: Tier | null;
  /** Stage 3: nomination counts per tier. Omit or pass empty when nobody has voted. */
  communityVotes?: CommunityVotes | null;
  /**
   * Stage 2.5: quality of the commenter's response to the reflection prompt,
   * 0..1. It backs the self-declared tier: a thoughtful response makes the
   * declaration more credible. Ignored when there is no self-declaration.
   */
  stage25Quality?: number | null;
}

export type TierDistribution = Record<Tier, number>;

export interface ResolveResult {
  finalTier: Tier;
  /** The combined, normalized distribution the decision was made from. */
  distribution: TierDistribution;
  /** Which signals contributed. */
  signals: { ai: true; self: boolean; community: boolean; stage25: boolean };
}

function zeros(): TierDistribution {
  const d = {} as TierDistribution;
  for (const t of TIER_IDS) d[t] = 0;
  return d;
}

function oneHot(tier: Tier): TierDistribution {
  const d = zeros();
  d[tier] = 1;
  return d;
}

function fromVotes(votes: CommunityVotes): TierDistribution | null {
  const d = zeros();
  let total = 0;
  for (const t of TIER_IDS) {
    const n = votes[t];
    if (typeof n === 'number' && n > 0) {
      d[t] = n;
      total += n;
    }
  }
  if (total === 0) return null;
  for (const t of TIER_IDS) d[t] = d[t] / total;
  return d;
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

export function resolveFinalTier(input: ResolveInput): ResolveResult {
  const { aiTier } = input;
  const selfTier = input.selfDeclaredTier ?? null;
  const community = input.communityVotes ? fromVotes(input.communityVotes) : null;
  const stage25 = selfTier && typeof input.stage25Quality === 'number' ? clamp01(input.stage25Quality) : null;

  const parts: Array<{ weight: number; dist: TierDistribution }> = [
    { weight: RESOLUTION_WEIGHTS.ai, dist: oneHot(aiTier) },
  ];
  if (selfTier) parts.push({ weight: RESOLUTION_WEIGHTS.self, dist: oneHot(selfTier) });
  if (community) parts.push({ weight: RESOLUTION_WEIGHTS.community, dist: community });
  if (selfTier && stage25 !== null) {
    // Quality scales the boost toward the self-declared tier. A quality of 0
    // spends the weight on nothing, which is equivalent to leaving it out.
    const boosted = zeros();
    boosted[selfTier] = stage25;
    parts.push({ weight: RESOLUTION_WEIGHTS.stage25, dist: boosted });
  }

  const combined = zeros();
  let weightSum = 0;
  for (const { weight, dist } of parts) {
    weightSum += weight;
    for (const t of TIER_IDS) combined[t] += weight * dist[t];
  }
  if (weightSum > 0) for (const t of TIER_IDS) combined[t] = combined[t] / weightSum;

  // Argmax, tie-break toward the AI tier by evaluating it first and requiring a
  // strictly greater score to displace it.
  let best: Tier = aiTier;
  let bestScore = combined[aiTier];
  for (const t of TIER_IDS) {
    if (t === aiTier) continue;
    if (combined[t] > bestScore + 1e-12) {
      best = t;
      bestScore = combined[t];
    }
  }

  return {
    finalTier: best,
    distribution: combined,
    signals: {
      ai: true,
      self: selfTier !== null,
      community: community !== null,
      stage25: stage25 !== null,
    },
  };
}
