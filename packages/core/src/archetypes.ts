/**
 * The eight archetypes, plus "forming" for contributors without enough history.
 * See docs/Dialecta_Contributor_Identity.md and docs/Dialecta_Data_Architecture.md (entity 6).
 * "Advocate", never "steelman".
 */
export const ARCHETYPE_IDS = [
  'skeptic',
  'synthesizer',
  'advocate',
  'builder',
  'empiricist',
  'contextualist',
  'illuminator',
  'reviser',
] as const;

export type Archetype = (typeof ARCHETYPE_IDS)[number];

/** The stored value for a contributor whose pattern is still forming. */
export const FORMING = 'forming' as const;

export type ArchetypeAssignment = Archetype | typeof FORMING;

export interface ArchetypeDefinition {
  readonly id: Archetype;
  readonly name: string;
}

export const ARCHETYPES: readonly ArchetypeDefinition[] = [
  { id: 'skeptic', name: 'Skeptic' },
  { id: 'synthesizer', name: 'Synthesizer' },
  { id: 'advocate', name: 'Advocate' },
  { id: 'builder', name: 'Builder' },
  { id: 'empiricist', name: 'Empiricist' },
  { id: 'contextualist', name: 'Contextualist' },
  { id: 'illuminator', name: 'Illuminator' },
  { id: 'reviser', name: 'Reviser' },
] as const;

export function isArchetype(value: unknown): value is Archetype {
  return typeof value === 'string' && (ARCHETYPE_IDS as readonly string[]).includes(value);
}

export function isArchetypeAssignment(value: unknown): value is ArchetypeAssignment {
  return value === FORMING || isArchetype(value);
}

export function archetypeName(assignment: ArchetypeAssignment): string {
  if (assignment === FORMING) return 'Pattern still forming';
  const found = ARCHETYPES.find((a) => a.id === assignment);
  if (!found) throw new Error(`Unknown archetype: ${assignment}`);
  return found.name;
}
