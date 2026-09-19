/**
 * The six pillars of the Thinking Fingerprint.
 * See docs/Dialecta_Contributor_Identity.md. Locked names; do not rename.
 */
export const PILLAR_IDS = [
  'acuity',
  'reach',
  'calibration',
  'magnanimity',
  'discourse',
  'consistency',
] as const;

export type Pillar = (typeof PILLAR_IDS)[number];

/** Alias used by the axis ledger. A pillar and an axis are the same thing. */
export type Axis = Pillar;

export interface PillarDefinition {
  readonly id: Pillar;
  readonly name: string;
  readonly summary: string;
}

export const PILLARS: readonly PillarDefinition[] = [
  { id: 'acuity', name: 'Acuity', summary: 'How specific and developed the claims are.' },
  { id: 'reach', name: 'Reach', summary: 'How far a comment engages beyond its own position.' },
  { id: 'calibration', name: 'Calibration', summary: 'How well confidence tracks the evidence offered.' },
  { id: 'magnanimity', name: 'Magnanimity', summary: 'How generously opposing views are treated.' },
  { id: 'discourse', name: 'Discourse', summary: 'How much a comment adds to the conversation it joins.' },
  { id: 'consistency', name: 'Consistency', summary: 'How stable the pattern is across a body of comments.' },
] as const;

export function isPillar(value: unknown): value is Pillar {
  return typeof value === 'string' && (PILLAR_IDS as readonly string[]).includes(value);
}

export function pillarName(pillar: Pillar): string {
  const found = PILLARS.find((p) => p.id === pillar);
  if (!found) throw new Error(`Unknown pillar: ${pillar}`);
  return found.name;
}
