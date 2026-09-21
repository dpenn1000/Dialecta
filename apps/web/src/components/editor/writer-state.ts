/**
 * The writer's state machine, rail, and draft shape.
 *
 * Ported from dialecta-editor.jsx: `S` (lines 150-161), `RAIL_STEPS` (163-169),
 * `INITIAL_STATE` (4402-4434), `ARTICLE_REFLECTION_PHASES` (3088-3101) and the
 * autosave constants (4399-4400). Stage keys and rail groupings are unchanged
 * except where noted.
 *
 * Not ported in this increment, and so absent from the enum: POLISH_READ, the
 * polish chooser and re-read that ran the article classifier over SSE in the
 * background. It depends on two endpoints apps/web does not have
 * (/api/article/classify-stream, /api/article/aesthetic-suggest), and treasurer
 * flagged the first as an uncapped Opus call behind a forgeable gate. The flow
 * goes DECLARE to REFLECTING directly, which is the path the recovered editor
 * itself took whenever POLISH_READ had not collected an analysis (line 4631).
 */
import type { JSONContent } from '@tiptap/react';
import type { Tier } from '@dialecta/core';
import type { TopicSlug } from '@/lib/topics';
import type { ReflectionPhase } from './reflection-bar';
import { strings } from '@/strings';

export const S = {
  COMPOSE: 'compose',
  CONSENT: 'consent',
  DECLARE: 'declare',
  REFLECTING: 'reflecting',
  REFLECTION: 'reflection',
  STAGE25: 'stage25',
  RESPOND: 'respond',
  FINAL: 'final',
  POSTED: 'posted',
} as const;

export type Stage = (typeof S)[keyof typeof S];

export interface RailStep {
  key: string;
  label: string;
  stages: readonly Stage[];
}

export const RAIL_STEPS: readonly RailStep[] = [
  { key: 'draft', label: strings.writer.rail.draft, stages: [S.COMPOSE, S.CONSENT] },
  { key: 'declare', label: strings.writer.rail.declare, stages: [S.DECLARE] },
  { key: 'reflect', label: strings.writer.rail.reflect, stages: [S.REFLECTING, S.REFLECTION] },
  { key: 'stage25', label: strings.writer.rail.stage25, stages: [S.STAGE25, S.RESPOND, S.FINAL] },
  { key: 'posted', label: strings.writer.rail.posted, stages: [S.POSTED] },
];

export type Stage25Choice = 'amend' | 'respond' | 'as_is';

/**
 * Opinion maps are carried through untouched so a later increment can add the
 * input without a state migration. The recovered shapes (ternary, cartesian,
 * binary) are documented at dialecta-editor.jsx lines 1328-1335; nothing here
 * constructs one yet, and an empty array is the recovered editor's own
 * legitimate "publish without a map" state.
 */
export type OpinionMap = Record<string, unknown>;

export interface Declaration {
  core_claim: string;
  scope_boundary: string;
  strongest_objection: string;
  opinion_maps: OpinionMap[];
}

export interface WriterState {
  /** Set once the article exists server side, or when editing one. */
  article_id: string | null;
  slug: string | null;
  title: string;
  /**
   * The lede. Not in the recovered editor: added because post.hbs renders
   * custom_excerpt as the article's lede above the byline, the front page lists
   * it, and articles.excerpt is where both now read it from.
   */
  excerpt: string;
  body_html: string;
  body_json: JSONContent | null;
  /** The recovered editor stored the whole topic object; the slug is enough. */
  primary_tag: TopicSlug | null;
  secondary_tags: string[];
  declaration: Declaration;
  declared_tier: Tier | null;
  /**
   * The engine's reading. Always null in this build: the article classifier is
   * not connected. See requestArticleReading() in publish-client.ts.
   */
  ai_analysis: null;
  stage_2_5_choice: Stage25Choice | null;
  author_note: string;
}

export const INITIAL_STATE: WriterState = {
  article_id: null,
  slug: null,
  title: '',
  excerpt: '',
  body_html: '',
  body_json: null,
  primary_tag: null,
  secondary_tags: [],
  declaration: {
    core_claim: '',
    scope_boundary: '',
    strongest_objection: '',
    opinion_maps: [],
  },
  declared_tier: null,
  ai_analysis: null,
  stage_2_5_choice: null,
  author_note: '',
};

/**
 * A new key, not the recovered 'dialecta-editor-draft'. The stored shape
 * changed (primary_tag is a slug, body_json exists), and restoring a draft
 * written against the old shape would hand TipTap HTML where it expects JSON.
 */
export const AUTOSAVE_KEY = 'dialecta-writer-draft-v1';
export const AUTOSAVE_INTERVAL_MS = 10_000;

/** Compose gate, from ComposeStage (line 999): a title, 50 words, a topic. */
export const MIN_BODY_WORDS = 50;
/** Declare gates, from DeclareStage (lines 4168-4195). */
export const MIN_DECLARATION_CHARS = 10;
/** Respond gate, from RespondStage (line 2910). */
export const MIN_RESPONSE_NOTE_CHARS = 20;

/**
 * The article reflection ritual. Timings are the recovered ones, rebudgeted
 * 2026-05-02 for an Opus call that took 30 to 60 seconds; the copy lives in
 * strings.ts. Module level on purpose: the reflection bar fuses `phases` at
 * mount and a new array each render would restart it.
 */
const REFLECTION_PHASE_TIMINGS = [0, 9000, 21000, 35000, 48000] as const;

export const ARTICLE_REFLECTION_PHASES: readonly ReflectionPhase[] = strings.writer.reflectionPhases.map(
  (copy, i) => ({ at: REFLECTION_PHASE_TIMINGS[i] ?? 0, main: copy.main, sub: copy.sub }),
);

/**
 * The recovered minimum pause, 55 seconds, honoured even when the reading comes
 * back sooner ("even if API is fast, we honor the pause", line 3647). No
 * reading comes back in this build, so the whole pause is the ritual alone.
 * This is the one number to change if that turns out to be wrong for a
 * prototype.
 */
export const ARTICLE_REFLECTION_DURATION_MS = 55_000;

export function wordCount(html: string): number {
  if (!html) return 0;
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Restore from a stored draft, keeping only fields this shape knows. */
export function mergeRestored(raw: unknown): WriterState | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<WriterState>;
  const declaration = { ...INITIAL_STATE.declaration, ...(parsed.declaration ?? {}) };
  if (!Array.isArray(declaration.opinion_maps)) declaration.opinion_maps = [];
  return {
    ...INITIAL_STATE,
    ...parsed,
    secondary_tags: Array.isArray(parsed.secondary_tags) ? parsed.secondary_tags.filter((t) => typeof t === 'string') : [],
    declaration,
    ai_analysis: null,
  };
}
