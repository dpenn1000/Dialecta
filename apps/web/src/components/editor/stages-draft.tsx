'use client';

/**
 * The draft half of the flow: Compose, Consent, Declare.
 *
 * Ported from dialecta-editor.jsx: ComposeStage (987-1210), ConsentStage
 * (3972-4033), DeclareQuestion and DeclareStage (4139-4393). Gates, copy and
 * order are the recovered ones. Changes, each for a named reason:
 *
 *   - Compose writes on the article sheet itself. The recovered editor boxed
 *     the title and body in separate bordered inputs; here the title sits in
 *     brass italic, the lede under a brass rule and the body in reading type,
 *     the way post.hbs renders a published article, so the draft looks like
 *     what it becomes. The mono breadcrumb and byline stand where the
 *     recovered "Title" and "Body" labels stood.
 *   - FeaturePhoto (856-981) is not ported: it uploaded through
 *     /api/article/upload-image with member_uuid in the body, and apps/web has
 *     no storage bucket or upload route yet.
 *   - "Suggest topics" (1081-1127) is not ported: /api/article/suggest-topics
 *     is an AI call with no counterpart here.
 *   - Declare's two AI hint buttons (AiHintButton, 4045-4137) and the opinion
 *     map input (OpinionMapsInput, 2024-2109, plus its eleven helpers) are not
 *     ported. Both are off the path from a blank page to a published article.
 *     An empty opinion_maps array is the recovered editor's own valid state.
 *   - Every state update is functional (setState(s => ...)). The recovered
 *     stages spread a captured `state` (setState({ ...state, x })), which drops
 *     any update that lands between the render and the click.
 */
import { useCallback, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { TIER_IDS, type Tier } from '@dialecta/core';
import { topicLabel } from '@/lib/topics';
import { strings } from '@/strings';
import { Button, FocusableTextarea, Label, SaveIndicator, StageOpener, TierBadge } from './primitives';
import { ProseEditor, type ProseChange } from './prose-editor';
import { TagPicker } from './tag-picker';
import {
  MIN_BODY_WORDS,
  MIN_DECLARATION_CHARS,
  wordCount,
  type Declaration,
  type WriterState,
} from './writer-state';

type SetWriter = Dispatch<SetStateAction<WriterState>>;

/**
 * Grow a textarea to its content. Where the browser supports
 * `field-sizing: content` (writer.css sets it), CSS already does this and
 * re-flows on every width change, so this does nothing: an inline height here
 * would pin the box to the width it was first measured at, which is how the
 * lede clipped mid-sentence at phone width in the first build. Elsewhere it
 * measures on every value change and on every window resize.
 */
function useAutoGrow(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content')) return;
    const grow = () => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    grow();
    window.addEventListener('resize', grow);
    return () => window.removeEventListener('resize', grow);
  }, [value]);
  return ref;
}

// ---------------------------------------------------------------------------
// Compose
// ---------------------------------------------------------------------------

export function ComposeStage({
  state,
  setState,
  onContinue,
  savedAt,
  authorName,
  initialBody,
}: {
  state: WriterState;
  setState: SetWriter;
  onContinue: () => void;
  savedAt: number | null;
  authorName: string | null;
  /** Read once, when the editor mounts. The editor owns the document after that. */
  initialBody: WriterState['body_json'] | string | null;
}) {
  const copy = strings.writer.compose;
  const words = wordCount(state.body_html);
  const canContinue = Boolean(state.title.trim()) && words >= MIN_BODY_WORDS && Boolean(state.primary_tag);

  const onBody = useCallback(
    ({ json, html }: ProseChange) => setState((s) => ({ ...s, body_json: json, body_html: html })),
    [setState],
  );

  const topic = topicLabel(state.primary_tag);
  const titleRef = useAutoGrow(state.title);
  const ledeRef = useAutoGrow(state.excerpt);

  return (
    <div className="dw-stage" style={{ maxWidth: 860 }}>
      <StageOpener label={copy.stageLabel} heading={copy.heading} sub={copy.sub} />

      <article className="dialecta-sheet dw-sheet">
        {/* The breadcrumb the published article opens with, "Articles › topic"
            (app/articles/[slug]/page.tsx). It read "Dialecta › topic", a second
            wordmark under the site header's own. */}
        <div className="dialecta-meta" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          {strings.articlePage.breadcrumb}
          <span aria-hidden="true" style={{ margin: '0 10px', color: 'var(--brass-mid)' }}>
            ›
          </span>
          <span style={{ color: topic ? 'var(--ink-soft)' : 'var(--text-muted)' }}>{topic ?? copy.primaryTopic}</span>
        </div>

        <textarea
          ref={titleRef}
          className="dw-title-input"
          rows={1}
          maxLength={200}
          value={state.title}
          aria-label={copy.titleLabel}
          placeholder={copy.titlePlaceholder}
          onChange={(e) => {
            const title = e.target.value.replace(/\n/g, ' ');
            setState((s) => ({ ...s, title }));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        />

        <textarea
          ref={ledeRef}
          className="dw-lede-input"
          rows={1}
          maxLength={400}
          value={state.excerpt}
          aria-label={copy.ledePlaceholder}
          placeholder={copy.ledePlaceholder}
          onChange={(e) => {
            const excerpt = e.target.value;
            setState((s) => ({ ...s, excerpt }));
          }}
        />

        <div className="dw-byline">
          {authorName ? <span className="dw-byline-name">{authorName}</span> : null}
          {authorName ? <span aria-hidden="true">·</span> : null}
          <span>{strings.writer.words(words)}</span>
        </div>

        <ProseEditor initialContent={initialBody} onChange={onBody} placeholder={copy.bodyPlaceholder} />
      </article>

      <section className="dialecta-paper dialecta-wood-frame dw-card">
        <Label>{copy.topicsLabel}</Label>
        <TagPicker
          primary={state.primary_tag}
          secondary={state.secondary_tags}
          onPrimaryChange={(slug) => setState((s) => ({ ...s, primary_tag: slug }))}
          onSecondaryChange={(tags) => setState((s) => ({ ...s, secondary_tags: tags }))}
        />
      </section>

      <div className="dw-actions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--tertiary)' }}>
            {strings.writer.words(words)}
          </div>
          <SaveIndicator savedAt={savedAt} />
        </div>
        <Button variant="primary" onClick={onContinue} disabled={!canContinue}>
          {copy.continue}
        </Button>
      </div>

      {!canContinue ? (
        <div className="dw-hint">
          {[
            !state.title.trim() ? copy.needTitle : null,
            words < MIN_BODY_WORDS ? copy.needWords : null,
            !state.primary_tag ? copy.needTopic : null,
          ]
            .filter(Boolean)
            .join(' ')}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Consent
// ---------------------------------------------------------------------------

export function ConsentStage({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const copy = strings.writer.consent;
  return (
    <div className="dw-stage dw-stage--center" style={{ maxWidth: 540 }}>
      <Label>{copy.stageLabel}</Label>
      <h1 className="dw-h1 dw-h1--large" style={{ margin: '0 0 36px' }}>
        {copy.heading}
      </h1>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1.35rem',
          color: 'var(--body-ink)',
          lineHeight: 1.7,
          marginBottom: 28,
        }}
      >
        {copy.lineDone}
      </div>
      <div className="dw-prose-line">{copy.lineWhat}</div>
      <div
        className="dw-prose-line"
        style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--secondary)', marginBottom: 32 }}
      >
        {copy.lineUnhurried}
      </div>
      <div
        className="dw-prose-line"
        style={{ fontSize: '0.92rem', color: 'var(--tertiary)', maxWidth: 440, marginBottom: 56 }}
      >
        {copy.lineSaved}
      </div>
      <div className="dw-actions dw-actions--center">
        <Button variant="outline" onClick={onBack}>
          {copy.back}
        </Button>
        <Button variant="accent" onClick={onContinue}>
          {copy.continue}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Declare
// ---------------------------------------------------------------------------

function DeclareQuestion({
  label,
  prompt,
  children,
}: {
  label: string;
  prompt: string;
  children: ReactNode;
}) {
  return (
    <div className="dw-question">
      <Label>{label}</Label>
      <div className="dw-question-prompt">{prompt}</div>
      {children}
    </div>
  );
}

export function TierPicker({ value, onChange }: { value: Tier | null; onChange: (tier: Tier) => void }) {
  return (
    <>
      <div className="dw-tiers">
        {TIER_IDS.map((t) => (
          <TierBadge key={t} tier={t} selected={value === t} onClick={() => onChange(t)} />
        ))}
      </div>
      {value ? <div className="dw-tier-meaning">{strings.writer.tierMeanings[value]}</div> : null}
    </>
  );
}

export function DeclareStage({
  state,
  setState,
  onContinue,
  onBack,
}: {
  state: WriterState;
  setState: SetWriter;
  onContinue: () => void;
  onBack: () => void;
}) {
  const copy = strings.writer.declare;
  const [breath, setBreath] = useState<1 | 2>(1);
  const d = state.declaration;

  const setField = (field: keyof Omit<Declaration, 'opinion_maps'>) => (value: string) =>
    setState((s) => ({ ...s, declaration: { ...s.declaration, [field]: value } }));

  const long = (v: string) => v.trim().length >= MIN_DECLARATION_CHARS;
  const breathOneValid = long(d.core_claim) && long(d.scope_boundary);
  const breathTwoValid = long(d.strongest_objection) && Boolean(state.declared_tier);

  return (
    <div className="dw-stage" style={{ maxWidth: 700 }}>
      <StageOpener
        label={copy.stageLabel(breath)}
        heading={copy.heading}
        sub={breath === 1 ? copy.breathOneSub : copy.breathTwoSub}
      />

      <section className="dialecta-paper dialecta-wood-frame dw-card" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
        {breath === 1 ? (
          <>
            <DeclareQuestion label={copy.coreClaimLabel} prompt={copy.coreClaimPrompt}>
              <FocusableTextarea
                value={d.core_claim}
                onChange={setField('core_claim')}
                placeholder={copy.coreClaimPlaceholder}
              />
            </DeclareQuestion>
            <DeclareQuestion label={copy.scopeLabel} prompt={copy.scopePrompt}>
              <FocusableTextarea
                value={d.scope_boundary}
                onChange={setField('scope_boundary')}
                placeholder={copy.scopePlaceholder}
              />
            </DeclareQuestion>
          </>
        ) : (
          <>
            <DeclareQuestion label={copy.objectionLabel} prompt={copy.objectionPrompt}>
              <FocusableTextarea
                value={d.strongest_objection}
                onChange={setField('strongest_objection')}
                placeholder={copy.objectionPlaceholder}
              />
            </DeclareQuestion>
            <DeclareQuestion label={copy.tierLabel} prompt={copy.tierPrompt}>
              <TierPicker value={state.declared_tier} onChange={(t) => setState((s) => ({ ...s, declared_tier: t }))} />
            </DeclareQuestion>
            <div className="dw-question" style={{ marginBottom: 0 }}>
              <Label>{copy.mapsLabel}</Label>
              <div className="dw-quiet">{copy.mapsDeferred}</div>
            </div>
          </>
        )}
      </section>

      {breath === 1 ? (
        <>
          <div className="dw-actions">
            <Button variant="outline" onClick={onBack}>
              {copy.back}
            </Button>
            <Button variant="primary" onClick={() => setBreath(2)} disabled={!breathOneValid}>
              {copy.toBreathTwo}
            </Button>
          </div>
          {!breathOneValid ? <div className="dw-hint">{copy.breathOneHint}</div> : null}
        </>
      ) : (
        <>
          <div className="dw-actions">
            <Button variant="outline" onClick={() => setBreath(1)}>
              {copy.backToBreathOne}
            </Button>
            <Button variant="primary" onClick={onContinue} disabled={!breathTwoValid}>
              {copy.send}
            </Button>
          </div>
          {!breathTwoValid ? (
            <div className="dw-hint">
              {[!long(d.strongest_objection) ? copy.needObjection : null, !state.declared_tier ? copy.needTier : null]
                .filter(Boolean)
                .join(' ')}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
