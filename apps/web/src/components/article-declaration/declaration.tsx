/**
 * The article's opinion-map declaration surfaces, both fed by the same
 * loadArticleDeclaration() read: ArticleDeclaration (Core Claim, Scope
 * Boundary, Strongest Objection, the article's opinion maps, and a native
 * <details> disclosure of the engine's own reading, inside the Declare
 * overlay) and ArticleReflectPlacement (map 0 only, author position
 * hidden, inside the Reflect overlay). Core Claim/Scope/Objection/the
 * disclosure stay server-only, no client JS: <details>/<summary> gives the
 * expand/collapse live spent a useState on
 * (dialecta-article-classification.jsx:309) for free.
 *
 * Ported from ArticleDeclaration in
 * _recovered-next/lib/theme/dialecta-article-classification.jsx (lines
 * 307 to 686), ai_analysis fields narrowed to the ones confirmed present
 * on mguulnibvzusfvyuowwh's five live rows; see components/opinion-map/data.ts
 * for which two source fields were dropped and why.
 *
 * Steps 3, 4 and 6 of the architect's port plan (team/architect/architecture/
 * 2026-09-21-delta-mechanic-port.md, build order #3, #4 and #6).
 * OpinionMapFigure (components/opinion-map/engine.tsx) stays the read-only
 * figure every reader sees, unchanged; PlacementClient
 * (components/opinion-map/placement-client.tsx), the tap-to-place,
 * Commit-button island ported from live's InteractiveMap, takes its place
 * for a canPlace caller, one per post-read map: the same map with the
 * author's marker and the reader's own, drawn once, as live draws it.
 */
import type { CSSProperties } from 'react';
import { tierName, type Tier } from '@dialecta/core';
import { TierIcon } from '@/components/discourse/tier-badge';
import { strings } from '@/strings';
import { loadArticleDeclaration, type FlaggedPassage, type Tension } from '../opinion-map/data';
import { OpinionMapFigure } from '../opinion-map/engine';
import { PlacementClient } from '../opinion-map/placement-client';
import '../opinion-map/opinion-map.css';
import './declaration.css';

const s = strings.opinionMap.declaration;
const sm = strings.opinionMap.maps;
const sp = strings.opinionMap.placement;

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="ad-field">
      <div className="ad-label">{label}</div>
      <div className="ad-value">{value}</div>
    </div>
  );
}

function FlaggedPassageCard({ passage }: { passage: FlaggedPassage }) {
  return (
    <div className="ad-passage" style={passage.tierPull ? ({ '--ad-passage-accent': `var(--tier-${passage.tierPull}-border)` } as CSSProperties) : undefined}>
      {passage.tierPull ? (
        <div className="ad-passage-tier">
          <TierIcon tier={passage.tierPull} size={10} />
          <span>{s.aiDisclosure.readsAs(tierName(passage.tierPull))}</span>
        </div>
      ) : null}
      <blockquote className="ad-passage-quote">&ldquo;{passage.passage}&rdquo;</blockquote>
      <div className="ad-passage-why">{passage.why}</div>
    </div>
  );
}

function TensionCard({ tension }: { tension: Tension }) {
  return (
    <div className="ad-tension">
      <div className="ad-label">{tension.name}</div>
      <div className="ad-value">{tension.description}</div>
    </div>
  );
}

function AiDisclosure({
  suggestedTier,
  tierReason,
  alignmentNote,
  coreClaimDetected,
  authorMessage,
  flaggedPassages,
  tensions,
}: {
  suggestedTier: Tier | null;
  tierReason: string | null;
  alignmentNote: string | null;
  coreClaimDetected: string | null;
  authorMessage: string | null;
  flaggedPassages: FlaggedPassage[];
  tensions: Tension[];
}) {
  return (
    <details className="ad-disclosure">
      <summary className="ad-disclosure-summary">
        <span>{s.aiDisclosure.summary}</span>
        {suggestedTier ? (
          <span className="ad-disclosure-tier">
            <TierIcon tier={suggestedTier} size={10} />
            <span>{tierName(suggestedTier)}</span>
          </span>
        ) : null}
      </summary>

      <div className="ad-disclosure-body">
        <Field label={s.aiDisclosure.tierReason} value={tierReason} />
        <Field label={s.aiDisclosure.alignmentNote} value={alignmentNote} />
        <Field label={s.aiDisclosure.coreClaimDetected} value={coreClaimDetected} />
        <Field label={s.aiDisclosure.authorMessage} value={authorMessage} />

        {flaggedPassages.length > 0 ? (
          <div className="ad-group">
            <div className="ad-label">{s.aiDisclosure.flaggedPassages}</div>
            {flaggedPassages.map((p, i) => (
              <FlaggedPassageCard key={i} passage={p} />
            ))}
          </div>
        ) : null}

        {tensions.length > 0 ? (
          <div className="ad-group">
            <div className="ad-label">{s.aiDisclosure.tensions}</div>
            {tensions.map((t, i) => (
              <TensionCard key={i} tension={t} />
            ))}
          </div>
        ) : null}

        <p className="ad-disclosure-footer">{s.aiDisclosure.footer}</p>
      </div>
    </details>
  );
}

export async function ArticleDeclaration({ articleId, canPlace }: { articleId: string; canPlace: boolean }) {
  const { declaration, aiAnalysis } = await loadArticleDeclaration(articleId);
  if (!declaration) return null;

  const maps = declaration.opinionMaps;
  const anyAuthorPosition = maps.some((m) => m.authorPosition !== null);
  // ai.core_claim_detected is only worth a field of its own when it differs
  // from the author's own core claim; otherwise it repeats the field above.
  const coreClaimDetected =
    aiAnalysis?.coreClaimDetected && aiAnalysis.coreClaimDetected !== declaration.coreClaim ? aiAnalysis.coreClaimDetected : null;

  return (
    <section className="ad-section">
      <div className="ad-eyebrow">{s.eyebrow}</div>

      <Field label={s.coreClaim} value={declaration.coreClaim} />
      <Field label={s.scopeBoundary} value={declaration.scopeBoundary} />
      <Field label={s.strongestObjection} value={declaration.strongestObjection} />

      {maps.length > 0 ? (
        <div className="om-section">
          <div className="om-section-head">
            <div className="om-section-eyebrow">{maps.length === 1 ? sm.heading.one : sm.heading.many}</div>
            <div className="om-section-intro">{maps.length === 1 ? sm.intro.one : sm.intro.many}</div>
          </div>

          <div className="om-figures">
            {maps.map((m, i) => (
              <div className="om-figure-group" key={i}>
                {canPlace ? (
                  <PlacementClient map={m} articleId={articleId} mapIndex={i} stage="post_read" showAuthorPosition />
                ) : (
                  <OpinionMapFigure map={m} />
                )}
              </div>
            ))}
          </div>

          {anyAuthorPosition ? (
            <div className="om-author-legend">
              <span className="om-author-legend-chip">
                <span className="om-author-legend-dot" aria-hidden="true" />
                <span className="om-author-legend-label">{sm.authorPosition}</span>
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {aiAnalysis ? (
        <AiDisclosure
          suggestedTier={aiAnalysis.suggestedTier}
          tierReason={aiAnalysis.tierReason}
          alignmentNote={aiAnalysis.alignmentNote}
          coreClaimDetected={coreClaimDetected}
          authorMessage={aiAnalysis.authorMessage}
          flaggedPassages={aiAnalysis.flaggedPassages}
          tensions={aiAnalysis.tensions}
        />
      ) : null}
    </section>
  );
}

/**
 * Reflect's pre-read content: map 0 only, author position hidden (a
 * reader's first mark should not be anchored by seeing where the author
 * landed, dialecta-opinion-map-placement.jsx:14-15), the per-map-type
 * "before you read" prompt, and "Begin reading" as the commit's own close
 * action. article-spine/spine.tsx only renders this at all once it has
 * already resolved canPlace true (readShellMember(), matching live's
 * {{#if @member}}), so the extra loadArticleDeclaration() read below runs
 * for a claimed member opening Reflect, not for every visitor. Renders
 * nothing when the article has no first map or the read fails
 * (loadArticleDeclaration's own fail-open shape), so a broken read cannot
 * leave the overlay open with nothing in it.
 */
export async function ArticleReflectPlacement({ articleId }: { articleId: string }) {
  const { declaration } = await loadArticleDeclaration(articleId);
  const map = declaration?.opinionMaps[0] ?? null;
  if (!map) return null;

  const body =
    map.type === 'cartesian' ? sp.reflectPrompt.cartesianBody
    : map.type === 'binary' ? sp.reflectPrompt.binaryBody
    : sp.reflectPrompt.ternaryBody(map.topic);

  return (
    <PlacementClient
      map={map}
      articleId={articleId}
      mapIndex={0}
      stage="pre_read"
      showAuthorPosition={false}
      prompt={{ eyebrow: sp.reflectPrompt.eyebrow, headline: sp.reflectPrompt.headline[map.type], body }}
      postPlacementText={sp.reflectPrompt.postPlacement}
      committedCloseLabel={sp.reflectPrompt.closeLabel}
    />
  );
}
