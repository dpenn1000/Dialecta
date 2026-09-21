import 'server-only';

/**
 * Reads one article's declaration and ai_analysis: the only file in
 * components/opinion-map that imports a Supabase client. Both columns are
 * jsonb, readable by anon and authenticated with no column-level revoke
 * (confirmed against project mguulnibvzusfvyuowwh, 2026-09-21, in
 * team/architect/architecture/2026-09-21-delta-mechanic-port.md), so a
 * signed-out reader sees the same shape a signed-in one does.
 *
 * Follows components/discourse/data.ts's own pattern: named columns, no
 * <Database> typing yet (none of the four Supabase clients carry one), so
 * every row is validated here at the boundary rather than trusted from a
 * generic client. A field that does not fit is dropped rather than shown.
 *
 * Step 1 of the architect's port plan (team/architect/architecture/
 * 2026-09-21-delta-mechanic-port.md, build order #1). Read and render
 * only: nothing here writes to opinion_map_positions or any other table.
 */
import { isTier, type Tier } from '@dialecta/core';
import { createClient } from '@/lib/supabase/server';

export interface CartesianAxis {
  axisA: string;
  axisB: string;
  topic: string | null;
}

export interface CartesianOpinionMap {
  type: 'cartesian';
  axes: readonly [CartesianAxis, CartesianAxis];
  authorPosition: { x: number; y: number } | null;
}

export interface TernaryOpinionMap {
  type: 'ternary';
  topic: string | null;
  poles: readonly [string, string, string];
  authorPosition: { a: number; b: number; c: number } | null;
}

export interface BinaryOpinionMap {
  type: 'binary';
  topic: string | null;
  axisA: string;
  axisB: string;
  authorPosition: { x: number } | null;
}

export type OpinionMap = CartesianOpinionMap | TernaryOpinionMap | BinaryOpinionMap;

export interface ArticleDeclaration {
  coreClaim: string | null;
  scopeBoundary: string | null;
  strongestObjection: string | null;
  opinionMaps: OpinionMap[];
}

export interface FlaggedPassage {
  passage: string;
  why: string;
  tierPull: Tier | null;
}

export interface Tension {
  name: string;
  description: string;
}

/**
 * The fields confirmed present on mguulnibvzusfvyuowwh's five published
 * rows (read 2026-09-21). Two fields the source component reads,
 * `recommended_map` (singular) and `opposing_view_note`, are not ported:
 * no live row has ever carried either name (the real columns are
 * `recommended_maps`, plural, and `opposing_view_engaged`, a short
 * status word rather than a note), so that part of the source has never
 * rendered on live. Porting it would build UI for data that has never
 * existed rather than restoring something a reader has seen. See the
 * builder report for the full finding.
 */
export interface ArticleAiAnalysis {
  tierReason: string | null;
  alignmentNote: string | null;
  coreClaimDetected: string | null;
  authorMessage: string | null;
  suggestedTier: Tier | null;
  flaggedPassages: FlaggedPassage[];
  tensions: Tension[];
}

export interface ArticleDeclarationData {
  declaration: ArticleDeclaration | null;
  aiAnalysis: ArticleAiAnalysis | null;
}

type Row = Record<string, unknown>;

function isRecord(v: unknown): v is Row {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function toCartesianAxis(v: unknown): CartesianAxis | null {
  if (!isRecord(v)) return null;
  const axisA = str(v.axis_a);
  const axisB = str(v.axis_b);
  if (!axisA || !axisB) return null;
  return { axisA, axisB, topic: str(v.topic) };
}

function toCartesianMap(m: Row): CartesianOpinionMap | null {
  if (!Array.isArray(m.axes) || m.axes.length !== 2) return null;
  const a0 = toCartesianAxis(m.axes[0]);
  const a1 = toCartesianAxis(m.axes[1]);
  if (!a0 || !a1) return null;
  const ap = isRecord(m.author_position) ? m.author_position : null;
  const x = ap ? num(ap.x) : null;
  const y = ap ? num(ap.y) : null;
  return { type: 'cartesian', axes: [a0, a1], authorPosition: x !== null && y !== null ? { x, y } : null };
}

function toTernaryMap(m: Row): TernaryOpinionMap | null {
  if (!Array.isArray(m.poles) || m.poles.length !== 3) return null;
  const poles = m.poles.map((p) => (typeof p === 'string' ? p.trim() : ''));
  if (poles.some((p) => !p)) return null;
  const ap = isRecord(m.author_position) ? m.author_position : null;
  const a = ap ? num(ap.a) : null;
  const b = ap ? num(ap.b) : null;
  const c = ap ? num(ap.c) : null;
  return {
    type: 'ternary',
    topic: str(m.topic),
    poles: [poles[0] ?? '', poles[1] ?? '', poles[2] ?? ''],
    authorPosition: a !== null && b !== null && c !== null ? { a, b, c } : null,
  };
}

function toBinaryMap(m: Row): BinaryOpinionMap | null {
  const axisA = str(m.axis_a);
  const axisB = str(m.axis_b);
  if (!axisA || !axisB) return null;
  const ap = isRecord(m.author_position) ? m.author_position : null;
  const x = ap ? num(ap.x) : null;
  return { type: 'binary', topic: str(m.topic), axisA, axisB, authorPosition: x !== null ? { x } : null };
}

function toOpinionMap(v: unknown): OpinionMap | null {
  if (!isRecord(v)) return null;
  if (v.type === 'cartesian') return toCartesianMap(v);
  if (v.type === 'ternary') return toTernaryMap(v);
  if (v.type === 'binary') return toBinaryMap(v);
  return null;
}

function toDeclaration(v: unknown): ArticleDeclaration | null {
  if (!isRecord(v)) return null;
  const rawMaps = Array.isArray(v.opinion_maps) ? v.opinion_maps : [];
  const opinionMaps = rawMaps.map(toOpinionMap).filter((m): m is OpinionMap => m !== null);
  return {
    coreClaim: str(v.core_claim),
    scopeBoundary: str(v.scope_boundary),
    strongestObjection: str(v.strongest_objection),
    opinionMaps,
  };
}

function toFlaggedPassage(v: unknown): FlaggedPassage | null {
  if (!isRecord(v)) return null;
  const passage = str(v.passage);
  const why = str(v.why);
  if (!passage || !why) return null;
  return { passage, why, tierPull: isTier(v.tier_pull) ? v.tier_pull : null };
}

function toTension(v: unknown): Tension | null {
  if (!isRecord(v)) return null;
  const name = str(v.name);
  const description = str(v.description);
  if (!name || !description) return null;
  return { name, description };
}

function toAiAnalysis(v: unknown): ArticleAiAnalysis | null {
  if (!isRecord(v) || Object.keys(v).length === 0) return null;
  const rawFlagged = Array.isArray(v.flagged_passages) ? v.flagged_passages : [];
  const rawTensions = Array.isArray(v.tensions) ? v.tensions : [];
  return {
    tierReason: str(v.tier_reason),
    alignmentNote: str(v.alignment_note),
    coreClaimDetected: str(v.core_claim_detected),
    authorMessage: str(v.author_message),
    suggestedTier: isTier(v.ai_suggested_tier) ? v.ai_suggested_tier : null,
    flaggedPassages: rawFlagged.map(toFlaggedPassage).filter((p): p is FlaggedPassage => p !== null),
    tensions: rawTensions.map(toTension).filter((t): t is Tension => t !== null),
  };
}

/**
 * One published article's declaration and ai_analysis, validated at the
 * boundary. Never throws: a read failure or a malformed row returns
 * { declaration: null, aiAnalysis: null } so the Declare overlay can fall
 * back to an empty state instead of taking the article page down with it,
 * matching loadDiscourse's own fail-open shape in components/discourse/data.ts.
 */
export async function loadArticleDeclaration(articleId: string): Promise<ArticleDeclarationData> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('declaration, ai_analysis')
      // Belt and suspenders: the page has already resolved a published
      // article before this runs, so this repeats a check the caller made
      // rather than depending on it.
      .eq('status', 'published')
      .eq('id', articleId)
      .maybeSingle();
    if (error) throw new Error(`article declaration read failed: ${error.message}`);
    if (!data) return { declaration: null, aiAnalysis: null };
    return {
      declaration: toDeclaration(data.declaration),
      aiAnalysis: toAiAnalysis(data.ai_analysis),
    };
  } catch (err) {
    console.error('opinion-map: declaration read failed', err);
    return { declaration: null, aiAnalysis: null };
  }
}
