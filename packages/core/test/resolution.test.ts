import { describe, expect, it } from 'vitest';
import { RESOLUTION_WEIGHTS, resolveFinalTier } from '../src/index';

describe('resolveFinalTier', () => {
  it('uses the locked weights', () => {
    expect(RESOLUTION_WEIGHTS).toEqual({ ai: 0.4, community: 0.35, self: 0.15, stage25: 0.1 });
  });

  it('AI wins when no other signal is present', () => {
    const r = resolveFinalTier({ aiTier: 'heat' });
    expect(r.finalTier).toBe('heat');
    expect(r.signals).toEqual({ ai: true, self: false, community: false, stage25: false });
    expect(r.distribution.heat).toBeCloseTo(1);
  });

  it('self-declaration alone cannot beat the AI, even with perfect Stage 2.5 quality', () => {
    expect(resolveFinalTier({ aiTier: 'heat', selfDeclaredTier: 'forum' }).finalTier).toBe('heat');
    expect(
      resolveFinalTier({ aiTier: 'heat', selfDeclaredTier: 'forum', stage25Quality: 1 }).finalTier,
    ).toBe('heat');
  });

  it('a community pile-on behind the self-declared tier beats the AI', () => {
    const r = resolveFinalTier({
      aiTier: 'heat',
      selfDeclaredTier: 'forum',
      communityVotes: { forum: 9, heat: 1 },
    });
    expect(r.finalTier).toBe('forum');
  });

  it('a community pile-on with no self-declaration cannot beat the AI under the locked weights', () => {
    // 35% community vs 40% AI: a consequence of the weighting, recorded here on purpose.
    const r = resolveFinalTier({ aiTier: 'heat', communityVotes: { forum: 50 } });
    expect(r.finalTier).toBe('heat');
  });

  it('a split community does not move the tier', () => {
    const r = resolveFinalTier({
      aiTier: 'spark',
      selfDeclaredTier: 'forum',
      communityVotes: { forum: 3, spark: 3, echo: 2 },
    });
    expect(r.finalTier).toBe('spark');
  });

  it('ties go to the AI tier', () => {
    // AI 40% on echo. Forum gets self 15% + stage 2.5 10% + community 35% * 5/7 = 50%.
    // Echo gets 40% + 35% * 2/7 = 50%. An exact tie, resolved toward the AI tier.
    const r = resolveFinalTier({
      aiTier: 'echo',
      selfDeclaredTier: 'forum',
      stage25Quality: 1,
      communityVotes: { forum: 5, echo: 2 },
    });
    expect(r.distribution.forum).toBeCloseTo(r.distribution.echo, 10);
    expect(r.finalTier).toBe('echo');
  });

  it('empty community votes count as no signal', () => {
    const r = resolveFinalTier({ aiTier: 'fog', communityVotes: {} });
    expect(r.signals.community).toBe(false);
    expect(r.finalTier).toBe('fog');
  });
});
