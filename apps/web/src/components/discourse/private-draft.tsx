'use client';

/**
 * The comment composer: the private draft ritual, ported from
 * _recovered-next/lib/theme/dialecta-private-draft.jsx (1,796 lines). The
 * Council ruled it "Adapted: compose ritual ships; identity layer rewritten
 * to session-sourced auth; Stage 2.5 feature-flagged off pending Dan"
 * (council/log/2026-09-20-port-or-rewrite.md).
 *
 * The recovered order was Compose, Consent, Reflecting, Reflection, Declare,
 * Stage 2.5, Final, Posted: the engine read the draft through
 * /api/classify, the commenter saw the reading and declared, and only then
 * did /api/comment record anything. apps/web has one route, /api/comment,
 * and it classifies and records in the same call, taking the
 * self-declaration as an input. So the declaration moves ahead of the
 * reading, and the order here is:
 *
 *   closed      "Add a comment". The spec opens the composer on that click.
 *   compose     the draft, eight words minimum, kept in this browser.
 *   declare     the seven-tier grid.
 *   consent     what submitting does, stated as this build does it.
 *   reflecting  the wood-frame brass reflection bar, eight seconds at least,
 *               while /api/comment classifies and records.
 *   posted      the reading: claim, strength, shape, suggested tier, the
 *               declared and engine reads side by side, and the status.
 *
 * Stage 2.5 (the twelve-second lock, then Accept, Amend or Respond for the
 * record) is off, and here that means absent rather than behind a flag. It
 * cannot run against this route: Amend needs a reading before the comment is
 * recorded, and Respond needs somewhere to keep the note, which comments
 * lacks. spec-reader's fall-through is what ships, the three-stage flow
 * docs/Dialecta_Discourse_Layer_UX.md describes.
 *
 * Also rewritten or dropped:
 *
 *   - Identity. The recovered POST carried member_uuid and member_email from
 *     the Ghost page. This one carries neither; /api/comment reads identity
 *     from the verified session. The viewer's name shown here comes from the
 *     server, from the same profile lookup the route uses.
 *   - The profile pre-flight fetch (/api/profile/<uuid>) is gone; the server
 *     decides before this island renders whether the viewer can comment.
 *   - The mention picker. It searched /api/profile/_list, which does not
 *     exist here, and /api/comment does not accept a mentions list.
 *   - The sixty-minute malleable card, Edit and Delete: no edit or delete
 *     path exists.
 *   - All window.__DIALECTA_API_URL__ plumbing: the route is same-origin.
 *
 * The body is escaped before it is posted. /api/comment runs DOMPurify over
 * it, which treats the text as HTML: measured, `x<y, "quoted" it's` followed
 * by a new line and `<b>bold</b>` was stored as `xbold`. Escaped text is
 * HTML DOMPurify leaves alone, and data.ts decodes it for display.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { TIER_IDS, isTier, type Tier } from '@dialecta/core';
import ReflectionBar from '@/components/editor/reflection-bar';
import { strings } from '@/strings';
import { TierBadge, tierLabel } from './tier-badge';
import type { ComposerArticle, DiscourseComment, OwnReading, ReplyTarget } from './types';

type Stage = 'closed' | 'compose' | 'declare' | 'consent' | 'reflecting' | 'posted';

// TUNING: the recovered file's audit-confirmed waits
// (docs/Dialecta_Tuning_Engine_Spec_v1.md names them). The reflection bar
// holds at least this long even when the route answers sooner: the wait is
// the ritual.
const WAIT_REFLECTION_MS = 8000;
// TUNING: recovered MIN_DRAFT_WORDS.
const MIN_DRAFT_WORDS = 8;

const s = strings.discourse;

interface PostResult {
  commentId: string;
  status: 'published' | 'pending_review';
  aiTier: Tier;
  finalTier: Tier;
  commenterMessage: string;
}

class ComposeError extends Error {}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** See the header: & first, so the entities the next two write are not escaped twice. */
function toStoredText(draft: string): string {
  return draft.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** The route's 201 body, checked field by field. */
function parsePostResult(data: unknown): PostResult | null {
  if (!isRecord(data)) return null;
  const { comment_id, status, ai_suggested_tier, final_tier, commenter_message } = data;
  if (typeof comment_id !== 'string' || !comment_id) return null;
  if (!isTier(ai_suggested_tier) || !isTier(final_tier)) return null;
  return {
    commentId: comment_id,
    status: status === 'published' ? 'published' : 'pending_review',
    aiTier: ai_suggested_tier,
    finalTier: final_tier,
    commenterMessage: typeof commenter_message === 'string' ? commenter_message : '',
  };
}

async function postComment(payload: {
  article: ComposerArticle;
  body: string;
  parentId: string | null;
  declared: Tier;
}): Promise<PostResult> {
  let resp: Response;
  try {
    resp = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        article_id: payload.article.id,
        article_slug: payload.article.slug,
        article_title: payload.article.title,
        article_claims: payload.article.claims,
        body: payload.body,
        parent_id: payload.parentId,
        self_declared_tier: payload.declared,
      }),
    });
  } catch {
    throw new ComposeError(s.errors.network);
  }

  let data: unknown = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }
  if (!resp.ok) {
    // The route's own error strings (strings.comment) already say what to do.
    throw new ComposeError(isRecord(data) && typeof data.error === 'string' ? data.error : s.errors.unreadable);
  }
  const result = parsePostResult(data);
  if (!result) throw new ComposeError(s.errors.unreadable);
  return result;
}

/**
 * Development preview only (page.tsx gates it on NODE_ENV). Nothing leaves
 * the browser. The reading is Editorial Voice's reference Spark message and
 * a claim quoted from the draft itself; the banner says so on every stage.
 */
async function previewPost(): Promise<PostResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    commentId: `preview-${Date.now()}`,
    status: 'pending_review',
    aiTier: 'spark',
    finalTier: 'spark',
    commenterMessage: strings.commenterMessages.spark,
  };
}

function previewReading(commentId: string, draft: string): OwnReading {
  const firstSentence = draft.trim().split(/(?<=[.!?])\s+/)[0] ?? '';
  return {
    commentId,
    claimText: firstSentence || null,
    strength: null,
    commenterMessage: null,
    specificity: 2,
    emotion: 'low',
    engagement: 'specific',
    borderlineOther: 'forum',
  };
}

function draftKey(articleId: string): string {
  return `dialecta:comment-draft:${articleId}`;
}

/** localStorage can throw (private windows, blocked storage). A draft that cannot be kept is still a draft. */
function storeDraft(articleId: string, text: string): void {
  try {
    if (text.trim()) window.localStorage.setItem(draftKey(articleId), text);
    else window.localStorage.removeItem(draftKey(articleId));
  } catch {
    // Nothing to do: the draft lives in state for this visit.
  }
}

// ─── Stage rail ───────────────────────────────────────────────────────────
// The private draft's StageRail (lines 129-188) carrying this flow's four
// steps. Stage 2.5 is not on it: it does not run.

const RAIL: ReadonlyArray<{ key: string; label: string; stages: readonly Stage[] }> = [
  { key: 'draft', label: s.rail.draft, stages: ['compose'] },
  { key: 'declare', label: s.rail.declare, stages: ['declare', 'consent'] },
  { key: 'reflect', label: s.rail.reflect, stages: ['reflecting'] },
  { key: 'posted', label: s.rail.posted, stages: ['posted'] },
];

function StageRail({ stage }: { stage: Stage }) {
  const activeIdx = RAIL.findIndex((step) => step.stages.includes(stage));
  return (
    <nav className="dd-rail" aria-label={s.rail.label}>
      {RAIL.map((step, i) => {
        const state = i === activeIdx ? 'active' : i < activeIdx ? 'passed' : 'pending';
        return (
          <div key={step.key} className="dd-rail-step" data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
            <span className="dd-rail-dot" aria-hidden="true" />
            <span className="dd-rail-label">{step.label}</span>
            {i < RAIL.length - 1 ? <span className="dd-rail-rule" aria-hidden="true" /> : null}
          </div>
        );
      })}
    </nav>
  );
}

function Heading({ before, em, after }: { before: string; em: string; after?: string }) {
  return (
    <h3 className="dd-h2">
      {before} <em className="dd-accent">{em}</em>
      {after ? ` ${after}` : null}
    </h3>
  );
}

// ─── The composer ─────────────────────────────────────────────────────────

export interface PrivateDraftProps {
  article: ComposerArticle;
  viewerName: string;
  preview: boolean;
  replyTo: ReplyTarget | null;
  onCancelReply: () => void;
  onPosted: (comment: DiscourseComment) => void;
  /** The viewer's own readings, from the server; filled in by the refresh after a post. */
  readings: Readonly<Record<string, OwnReading>>;
}

export function PrivateDraft({ article, viewerName, preview, replyTo, onCancelReply, onPosted, readings }: PrivateDraftProps) {
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusOnOpen = useRef(false);

  const [stage, setStage] = useState<Stage>('closed');
  const [draft, setDraft] = useState('');
  const [restored, setRestored] = useState(false);
  const [declared, setDeclared] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostResult | null>(null);
  const [standIn, setStandIn] = useState<OwnReading | null>(null);
  const [barDone, setBarDone] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // A draft kept from an earlier visit reopens the composer with it.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(draftKey(article.id));
    } catch {
      saved = null;
    }
    if (saved && saved.trim()) {
      setDraft(saved);
      setRestored(true);
      setStage('compose');
    }
  }, [article.id]);

  // The stage as of the last commit, for the Reply effect below to read
  // without re-running on every stage change.
  const stageRef = useRef<Stage>(stage);
  useEffect(() => {
    stageRef.current = stage;
  });

  // A Reply click opens the composer on that comment. After a post, it
  // starts a fresh draft; mid-draft, it only retargets the banner.
  const replyId = replyTo?.id ?? null;
  useEffect(() => {
    if (!replyId) return;
    const current = stageRef.current;
    if (current === 'posted') {
      setDraft('');
      setDeclared(null);
      setResult(null);
      setStandIn(null);
      setError(null);
      setRestored(false);
    }
    if (current === 'closed' || current === 'posted') {
      focusOnOpen.current = true;
      setStage('compose');
    }
  }, [replyId]);

  useEffect(() => {
    if (stage === 'compose' && focusOnOpen.current) {
      focusOnOpen.current = false;
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, [stage]);

  // Leave the reading stage once the bar has run its course and the route has answered.
  useEffect(() => {
    if (stage === 'reflecting' && barDone && result) setStage('posted');
  }, [stage, barDone, result]);

  function updateDraft(next: string) {
    setDraft(next);
    storeDraft(article.id, next);
  }

  function open() {
    focusOnOpen.current = true;
    setStage('compose');
  }

  function close() {
    setError(null);
    setStage('closed');
    if (replyTo) onCancelReply();
  }

  function writeAnother() {
    setDraft('');
    setDeclared(null);
    setResult(null);
    setStandIn(null);
    setError(null);
    setRestored(false);
    focusOnOpen.current = true;
    setStage('compose');
  }

  async function submit() {
    if (!declared) return;
    const target = replyTo;
    setError(null);
    setResult(null);
    setBarDone(false);
    setAttempt((a) => a + 1);
    setStage('reflecting');

    try {
      const posted = preview
        ? await previewPost()
        : await postComment({ article, body: toStoredText(draft), parentId: target?.id ?? null, declared });
      storeDraft(article.id, '');
      if (preview) setStandIn(previewReading(posted.commentId, draft));
      setResult(posted);
      const breach = posted.finalTier === 'breach';
      onPosted({
        id: posted.commentId,
        parentId: target?.id ?? null,
        authorName: viewerName,
        body: breach ? null : draft.trim(),
        withheld: breach ? 'breach' : null,
        createdAt: new Date().toISOString(),
        status: posted.status,
        isOwn: true,
        tier: { ai: posted.aiTier, self: declared, final: posted.finalTier },
        specificity: null,
        mentions: [],
      });
    } catch (err) {
      setError(err instanceof ComposeError ? err.message : s.errors.network);
      setStage('consent');
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  if (stage === 'closed') {
    return (
      <div className="dialecta-paper dialecta-wood-frame dd-compose-bar">
        <span className="dd-writing-as">{s.compose.writingAs(viewerName)}</span>
        <button type="button" className="dd-btn dd-btn--primary" onClick={open}>
          {draft.trim() ? s.compose.resume : s.compose.open}
        </button>
      </div>
    );
  }

  const previewBanner = preview ? <p className="dd-preview">{s.compose.preview}</p> : null;
  const showRail = stage === 'declare' || stage === 'consent' || stage === 'reflecting';
  const words = wordCount(draft);
  const canAdvance = words >= MIN_DRAFT_WORDS;

  let body: ReactNode = null;

  if (stage === 'compose') {
    body = (
      <div className="dd-stage">
        {previewBanner}
        <div className="dd-stub">
          <div className="dd-label dd-label--tight">{s.compose.respondingTo}</div>
          <div className="dd-stub-title">{article.title}</div>
        </div>
        <p className="dd-nudge">{s.compose.nudge}</p>
        {restored ? <p className="dd-restored">{s.compose.restored}</p> : null}

        <label className="dd-label" htmlFor={textareaId}>
          {s.compose.draftLabel}
        </label>
        <div className="dialecta-paper dialecta-wood-frame dd-draft">
          <textarea
            id={textareaId}
            ref={textareaRef}
            className="dd-textarea"
            value={draft}
            onChange={(e) => updateDraft(e.target.value)}
            placeholder={s.compose.placeholder}
            rows={6}
          />
          <div className="dd-draft-foot">
            <span>
              {s.compose.words(words)} · {s.compose.saved}
            </span>
            <em>{s.compose.private}</em>
          </div>
        </div>

        {error ? (
          <div className="dd-error" role="alert">
            {error}
          </div>
        ) : null}

        <p className="dd-explainer">{s.compose.explainer}</p>

        <div className="dd-actions">
          <button type="button" className="dd-btn dd-btn--outline" onClick={close}>
            {s.compose.cancel}
          </button>
          <button
            type="button"
            className="dd-btn dd-btn--primary dd-btn--grow"
            disabled={!canAdvance}
            onClick={() => setStage('declare')}
          >
            {canAdvance ? (
              <>
                {s.compose.continue} <span aria-hidden="true">→</span>
              </>
            ) : (
              s.compose.moreWords(MIN_DRAFT_WORDS - words)
            )}
          </button>
        </div>
      </div>
    );
  } else if (stage === 'declare') {
    body = (
      <div className="dd-stage">
        {previewBanner}
        <div className="dd-label">{s.declare.label}</div>
        <Heading before={s.declare.headingBefore} em={s.declare.headingEm} after={s.declare.headingAfter} />
        <p className="dd-p dd-p--quiet">{s.declare.sub}</p>

        <div className="dd-grid" role="group" aria-label={s.declare.gridLabel}>
          {TIER_IDS.map((t) => (
            <TierBadge key={t} tier={t} size="md" selected={declared === t} onClick={() => setDeclared(t)} />
          ))}
        </div>

        {declared ? (
          <div className="dd-meaning" aria-live="polite">
            <div className="dd-label dd-label--tight">{tierLabel(declared)}</div>
            <p className="dd-principle-text">{s.tiers.meanings[declared]}</p>
          </div>
        ) : null}

        <div className="dd-actions">
          <button type="button" className="dd-btn dd-btn--outline" onClick={() => setStage('compose')}>
            {s.declare.back}
          </button>
          <button
            type="button"
            className="dd-btn dd-btn--primary dd-btn--grow"
            disabled={!declared}
            onClick={() => setStage('consent')}
          >
            {s.declare.continue} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  } else if (stage === 'consent') {
    body = (
      <div className="dd-stage dd-stage--narrow">
        {previewBanner}
        <div className="dialecta-paper dialecta-wood-frame dd-card-pad">
          <div className="dd-label">{s.consent.label}</div>
          <Heading before={s.consent.headingBefore} em={s.consent.headingEm} />
          <div className="dd-rule" aria-hidden="true" />
          <p className="dd-p">{s.consent.lineRead}</p>
          <p className="dd-p">{s.consent.lineVisible}</p>
          <div className="dd-principle">
            <div className="dd-label dd-label--tight">{s.consent.principleLabel}</div>
            <p className="dd-principle-text">{s.consent.principle}</p>
          </div>
          {error ? (
            <div className="dd-error dd-error--block" role="alert">
              {error}
            </div>
          ) : null}
          <div className="dd-actions">
            <button type="button" className="dd-btn dd-btn--outline" onClick={() => setStage('declare')}>
              {s.consent.back}
            </button>
            <button type="button" className="dd-btn dd-btn--primary dd-btn--grow" onClick={submit}>
              {s.consent.submit}
            </button>
          </div>
        </div>
      </div>
    );
  } else if (stage === 'reflecting') {
    body = (
      <ReflectionBar
        key={attempt}
        phases={s.reflecting.phases}
        durationMs={WAIT_REFLECTION_MS}
        ready={result !== null}
        size="comment"
        eyebrow={s.reflecting.eyebrow}
        readyLabel={s.reflecting.readyLabel}
        readingLabel={s.reflecting.readingLabel}
        holdMessage={s.reflecting.hold}
        onComplete={() => setBarDone(true)}
      />
    );
  } else if (stage === 'posted' && result && declared) {
    const reading = readings[result.commentId] ?? standIn;
    const meta: string[] = [];
    if (reading?.specificity !== null && reading?.specificity !== undefined) meta.push(s.posted.specificity(reading.specificity));
    if (reading?.emotion) meta.push(s.posted.emotion(reading.emotion));
    if (reading?.engagement) meta.push(s.posted.engagement(reading.engagement));
    const published = result.status === 'published';

    body = (
      <div className="dd-stage">
        {previewBanner}
        <div className="dd-label">{s.posted.label}</div>
        <Heading before={s.posted.headingBefore} em={s.posted.headingEm} />
        <p className="dd-p dd-p--quiet">{s.posted.sub}</p>

        <div className="dialecta-paper dialecta-wood-frame dd-slots">
          {reading ? (
            <div className="dd-slot">
              <div className="dd-label">{s.posted.claimLabel}</div>
              <p className="dd-slot-text">
                {reading.claimText ? (
                  `“${reading.claimText}”`
                ) : (
                  <span className="dd-slot-none">{s.posted.claimNone}</span>
                )}
              </p>
            </div>
          ) : null}

          {reading?.strength ? (
            <div className="dd-slot">
              <div className="dd-label">{s.posted.strengthLabel}</div>
              <p className="dd-slot-text">{reading.strength}</p>
            </div>
          ) : null}

          <div className="dd-slot">
            <div className="dd-label">{s.posted.shapeLabel}</div>
            {result.commenterMessage ? <p className="dd-slot-text">{result.commenterMessage}</p> : null}
            {meta.length > 0 ? (
              <div className="dd-meta">
                {meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="dd-slot">
            <div className="dd-label">{s.posted.suggestedLabel}</div>
            <div className="dd-suggested">
              <TierBadge tier={result.aiTier} size="lg" suggested />
              {reading?.borderlineOther ? (
                <span className="dd-close-to">
                  {s.posted.closeTo} <em>{tierLabel(reading.borderlineOther)}</em> · {s.posted.closeToTail}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="dd-tier-row">
          <div>
            <div className="dd-tier-row-label">{s.posted.engineRead}</div>
            <TierBadge tier={result.aiTier} />
          </div>
          <div>
            <div className="dd-tier-row-label">{s.posted.selfDeclared}</div>
            <TierBadge tier={declared} />
          </div>
          {declared !== result.aiTier ? <div className="dd-tier-row-note">{s.posted.contrast}</div> : null}
        </div>

        <div className="dd-notice dd-status" role="status">
          <div className="dd-label dd-label--tight">{published ? s.posted.statusPublished : s.posted.statusPending}</div>
          {published ? s.posted.statusPublishedLine : s.posted.statusPendingLine}
        </div>

        <button type="button" className="dd-btn dd-btn--primary dd-btn--wide" onClick={writeAnother}>
          {s.posted.another}
        </button>
      </div>
    );
  }

  return (
    <div className="dd-composer">
      {replyTo && stage !== 'posted' ? (
        <div className="dd-reply-banner">
          <span className="dd-reply-banner-label">{s.compose.replyingTo(replyTo.authorName)}</span>
          {replyTo.excerpt ? <span className="dd-reply-banner-excerpt">“{replyTo.excerpt}”</span> : null}
          <button type="button" className="dd-plain-button" onClick={onCancelReply}>
            {s.compose.cancelReply}
          </button>
        </div>
      ) : null}
      {showRail ? <StageRail stage={stage} /> : null}
      {body}
    </div>
  );
}
