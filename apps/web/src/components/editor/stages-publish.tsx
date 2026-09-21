'use client';

/**
 * The publish half of the flow: Reflecting, Reflection, Stage 2.5, Respond,
 * Final, Posted.
 *
 * Ported from dialecta-editor.jsx: ReflectingStage (3592-3703), ReflectionStage
 * (3732-3966), Stage25 (2830-2902), RespondStage (2908-3075),
 * PublishSummaryCard and FinalStage (2173-2629), PostedStage (2635-2734).
 *
 * The article classifier is not connected (see requestArticleReading in
 * publish-client.ts), and that shapes three stages honestly rather than
 * cosmetically:
 *
 *   - Reflecting runs the full recovered ritual through the brass reflection
 *     bar, then moves on when the bar fills. The recovered stage waited on two
 *     conditions, the minimum pause AND a reading; with no reading coming, the
 *     second would never arrive and the stage would hang.
 *   - Reflection shows the author's own declaration back to them and says,
 *     in so many words, that no engine reading ran. The recovered card
 *     (tier card, claim read, flagged passages, axis suggestions, author
 *     message: 230 lines) renders fields of an analysis that does not exist.
 *   - Final's summary shows "Not connected" for the engine where the recovered
 *     card showed an em dash.
 *
 * Stage 2.5 is kept whole for articles. The Council flagged the comment side's
 * Stage 2.5 off pending a spec (council/log/2026-09-20-port-or-rewrite.md);
 * the article side is the one Dialecta_Article_Editorial_Template.md does
 * specify, and the private draft's version was lifted from it.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Dispatch, SetStateAction } from 'react';
import { strings } from '@/strings';
import ReflectionBar from './reflection-bar';
import { BrassButton, Button, FocusableTextarea, Label, OptionCard, StageOpener, TierBadge } from './primitives';
import { TierPicker } from './stages-draft';
import { publishArticle, requestArticleReading } from './publish-client';
import {
  ARTICLE_REFLECTION_DURATION_MS,
  ARTICLE_REFLECTION_PHASES,
  MIN_RESPONSE_NOTE_CHARS,
  type WriterState,
} from './writer-state';

type SetWriter = Dispatch<SetStateAction<WriterState>>;

// ---------------------------------------------------------------------------
// Reflecting: the wait, on the brass reflection bar
// ---------------------------------------------------------------------------

export function ReflectingStage({ onComplete }: { onComplete: () => void }) {
  // The seam resolves to null today. When it returns a reading, `ready` flips
  // the bar to its Ready label and hold message, exactly as the recovered
  // stage did; the bar still runs its full pause either way.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    requestArticleReading().then((reading) => {
      if (!cancelled && reading !== null) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dw-stage">
      <ReflectionBar
        phases={ARTICLE_REFLECTION_PHASES}
        durationMs={ARTICLE_REFLECTION_DURATION_MS}
        ready={ready}
        size="article"
        onComplete={onComplete}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reflection: what the author declared; the engine card says none ran
// ---------------------------------------------------------------------------

export function ReflectionStage({
  state,
  onContinue,
  onBack,
}: {
  state: WriterState;
  onContinue: () => void;
  onBack: () => void;
}) {
  const copy = strings.writer.reflection;
  const d = state.declaration;
  return (
    <div className="dw-stage" style={{ maxWidth: 720 }}>
      <StageOpener label={copy.stageLabel} heading={copy.heading} sub={copy.sub} />

      <section className="dialecta-paper dialecta-wood-frame dw-card">
        <Label>{copy.yourDeclaration}</Label>
        <div className="dw-ledger">
          <div className="dw-ledger-key">{copy.coreClaim}</div>
          <div className="dw-ledger-value">{d.core_claim}</div>
          <div className="dw-ledger-key">{copy.scope}</div>
          <div className="dw-ledger-value">{d.scope_boundary}</div>
          <div className="dw-ledger-key">{copy.objection}</div>
          <div className="dw-ledger-value">{d.strongest_objection}</div>
          <div className="dw-ledger-key">{copy.declaredTier}</div>
          <div>{state.declared_tier ? <TierBadge tier={state.declared_tier} /> : null}</div>
        </div>
      </section>

      <section className="dialecta-paper dialecta-wood-frame dw-card">
        <Label tone="gold">{copy.engineReading}</Label>
        <div className="dw-engine-off" style={{ marginTop: 0 }}>
          {copy.engineOff}
        </div>
      </section>

      <div className="dw-actions">
        <Button variant="outline" onClick={onBack}>
          {copy.back}
        </Button>
        <Button variant="primary" onClick={onContinue}>
          {copy.continue}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 2.5: Amend, Respond for the Record, Post As-Is
// ---------------------------------------------------------------------------

export function Stage25Stage({
  onAmend,
  onRespond,
  onAsIs,
  onBack,
}: {
  onAmend: () => void;
  onRespond: () => void;
  onAsIs: () => void;
  onBack: () => void;
}) {
  const copy = strings.writer.stage25;
  return (
    <div className="dw-stage" style={{ maxWidth: 980 }}>
      <StageOpener label={copy.stageLabel} heading={copy.heading} sub={copy.sub} />

      <div className="dw-options">
        <OptionCard
          kicker={copy.amendKicker}
          title={copy.amendTitle}
          lede={copy.amendLede}
          footer={copy.amendFooter}
          onClick={onAmend}
        />
        <OptionCard
          kicker={copy.respondKicker}
          title={copy.respondTitle}
          lede={copy.respondLede}
          footer={copy.respondFooter}
          onClick={onRespond}
        />
        <OptionCard
          kicker={copy.asIsKicker}
          title={copy.asIsTitle}
          lede={copy.asIsLede}
          footer={copy.asIsFooter}
          onClick={onAsIs}
        />
      </div>

      <div className="dw-actions" style={{ marginTop: 36 }}>
        <Button variant="outline" onClick={onBack}>
          {copy.back}
        </Button>
        <div className="dw-quiet" style={{ maxWidth: 440, textAlign: 'right' }}>
          {copy.aside}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Respond for the record
// ---------------------------------------------------------------------------

export function RespondStage({
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
  const copy = strings.writer.respond;
  const note = state.author_note;
  const valid = note.trim().length >= MIN_RESPONSE_NOTE_CHARS;
  const noteWords = note.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="dw-stage" style={{ maxWidth: 660 }}>
      <StageOpener label={copy.stageLabel} heading={copy.heading} sub={copy.sub} />

      <section className="dialecta-paper dialecta-wood-frame dw-card">
        <Label>{copy.declaredPosition}</Label>
        <div className="dw-quiet" style={{ fontSize: 13, color: 'var(--body-ink)', marginBottom: 12 }}>
          {copy.standBy}
        </div>
        <TierPicker value={state.declared_tier} onChange={(t) => setState((s) => ({ ...s, declared_tier: t }))} />
      </section>

      <section className="dialecta-paper dialecta-wood-frame dw-card">
        <Label>{copy.noteLabel}</Label>
        <FocusableTextarea
          value={note}
          onChange={(v) => setState((s) => ({ ...s, author_note: v }))}
          placeholder={copy.notePlaceholder}
          rows={6}
        />
        <div
          style={{
            marginTop: 8,
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--tertiary)',
            letterSpacing: '0.04em',
          }}
        >
          {strings.writer.words(noteWords)}
        </div>
      </section>

      <div className="dw-actions">
        <Button variant="outline" onClick={onBack}>
          {copy.back}
        </Button>
        <Button variant="primary" onClick={onContinue} disabled={!valid}>
          {valid ? copy.continue : copy.needNote}
        </Button>
      </div>
      {!valid ? <div className="dw-tier-meaning">{copy.needNoteDetail}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Final: the summary ledger and the brass button
// ---------------------------------------------------------------------------

function PublishSummaryCard({ state }: { state: WriterState }) {
  const copy = strings.writer.final;
  const choice = state.stage_2_5_choice;
  const choiceLabel =
    choice === 'amend' ? copy.choiceAmended : choice === 'respond' ? copy.choiceResponded : copy.choiceAsIs;

  return (
    <div className="dw-summary">
      <div className="dw-summary-kicker">{copy.summaryKicker}</div>
      <h2 className="dw-summary-title">{state.title || copy.untitled}</h2>
      <div className="dw-ledger">
        <div className="dw-ledger-key">{copy.declared}</div>
        <div className="dw-ledger-value">
          {/* The recovered card coloured the tier NAME with the tier's border hex,
              which for Stance (#401818) and Breach (#200404) is near black on
              this #292b2d card. The badge carries its own ground. */}
          {state.declared_tier ? <TierBadge tier={state.declared_tier} /> : copy.notDeclared}
        </div>
        <div className="dw-ledger-key">{copy.engine}</div>
        <div className="dw-ledger-value" style={{ fontStyle: 'italic' }}>
          {copy.engineNotConnected}
        </div>
        <div className="dw-ledger-key">{copy.choice}</div>
        <div className="dw-ledger-value" style={{ fontStyle: 'italic' }}>
          {choiceLabel}
        </div>
        {choice === 'respond' && state.author_note ? (
          <>
            <div className="dw-ledger-key">{copy.note}</div>
            <div className="dw-ledger-value dw-summary-note">&ldquo;{state.author_note}&rdquo;</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function FinalStage({
  state,
  onPublished,
  onBack,
}: {
  state: WriterState;
  onPublished: (result: { id: string; slug: string }) => void;
  onBack: () => void;
}) {
  const copy = strings.writer.final;
  const [phase, setPhase] = useState<'idle' | 'publishing' | 'error'>('idle');
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const loading = phase === 'publishing';

  const handlePublish = async () => {
    setPhase('publishing');
    setError(null);
    const result = await publishArticle(state);
    if (result.ok) {
      onPublished({ id: result.id, slug: result.slug });
      return;
    }
    setError({ message: result.error, ...(result.detail ? { detail: result.detail } : {}) });
    setPhase('error');
  };

  return (
    <div className="dw-stage" style={{ maxWidth: 680 }}>
      <StageOpener label={copy.label} labelTone="gold" heading={copy.heading} sub={copy.sub} />

      <PublishSummaryCard state={state} />

      {phase === 'error' && error ? (
        <div className="dialecta-paper dw-error" role="alert">
          <Label tone="terra">{copy.errorLabel}</Label>
          <div>{error.message}</div>
          {error.detail ? <div className="dw-error-detail">{error.detail}</div> : null}
        </div>
      ) : null}

      <div className="dw-actions" style={{ borderTop: 0, paddingTop: 0, marginTop: 8 }}>
        <Button variant="outline" onClick={onBack} disabled={loading}>
          {state.stage_2_5_choice === 'respond' ? copy.backToNote : copy.backToOptions}
        </Button>
        <BrassButton onClick={handlePublish} disabled={loading} loading={loading}>
          {state.article_id ? copy.update : copy.publish}
        </BrassButton>
      </div>

      {loading ? (
        <div className="dw-quiet" style={{ marginTop: 24, textAlign: 'center', fontSize: 13 }}>
          {copy.releasing}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Posted: the quiet aftermath
// ---------------------------------------------------------------------------

export function PostedStage({
  state,
  slug,
  onWriteAnother,
}: {
  state: WriterState;
  slug: string | null;
  onWriteAnother: () => void;
}) {
  const copy = strings.writer.posted;
  return (
    <div className="dw-stage dw-stage--center" style={{ maxWidth: 600 }}>
      <Label tone="gold">{copy.label}</Label>
      <h1 className="dw-h1 dw-h1--large" style={{ margin: '0 0 28px' }}>
        {copy.heading}
      </h1>
      <div className="dw-prose-line" style={{ maxWidth: 480, marginBottom: 36 }}>
        {copy.line(state.title || copy.yourArticle)}
      </div>

      {state.declared_tier ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 36 }}>
          <div className="dw-ledger-key">{copy.declared}</div>
          <TierBadge tier={state.declared_tier} />
        </div>
      ) : null}

      <div className="dw-actions dw-actions--center" style={{ marginBottom: 28 }}>
        {slug ? (
          <Link href={`/articles/${slug}`} className="dw-btn dw-btn--primary">
            {copy.view}
          </Link>
        ) : null}
        <Button variant="outline" onClick={onWriteAnother}>
          {copy.another}
        </Button>
      </div>

      <div className="dw-quiet" style={{ marginTop: 24 }}>
        {copy.closing}
      </div>
    </div>
  );
}
