/**
 * The seven comment tiers, in canonical order.
 *
 * Zones (see docs/Dialecta_Tier_Psychology.md):
 *   1, aspiration: forum, spark. Where contributors want to land.
 *   2, description: echo, fog, heat. Describes what the comment is, without judgement.
 *   3, boundary: stance, breach. The edges of the Pact.
 */
export const TIER_ZONES = {
  aspiration: 1,
  description: 2,
  boundary: 3,
} as const;

export type TierZone = keyof typeof TIER_ZONES;

export interface TierDefinition {
  readonly id: Tier;
  readonly name: string;
  readonly zone: TierZone;
  readonly zoneNumber: (typeof TIER_ZONES)[TierZone];
}

export const TIER_IDS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'] as const;

export type Tier = (typeof TIER_IDS)[number];

export const TIERS: readonly TierDefinition[] = [
  { id: 'forum', name: 'Forum', zone: 'aspiration', zoneNumber: 1 },
  { id: 'spark', name: 'Spark', zone: 'aspiration', zoneNumber: 1 },
  { id: 'echo', name: 'Echo', zone: 'description', zoneNumber: 2 },
  { id: 'fog', name: 'Fog', zone: 'description', zoneNumber: 2 },
  { id: 'heat', name: 'Heat', zone: 'description', zoneNumber: 2 },
  { id: 'stance', name: 'Stance', zone: 'boundary', zoneNumber: 3 },
  { id: 'breach', name: 'Breach', zone: 'boundary', zoneNumber: 3 },
] as const;

export function isTier(value: unknown): value is Tier {
  return typeof value === 'string' && (TIER_IDS as readonly string[]).includes(value);
}

export function tierDefinition(tier: Tier): TierDefinition {
  const found = TIERS.find((t) => t.id === tier);
  if (!found) throw new Error(`Unknown tier: ${tier}`);
  return found;
}

export function tierName(tier: Tier): string {
  return tierDefinition(tier).name;
}
