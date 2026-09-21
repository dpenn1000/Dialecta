/**
 * The author's declaration inside the Declare overlay: Core Claim, Scope
 * Boundary, Strongest Objection, the article's opinion maps (render only),
 * and a native <details> disclosure of the engine's own reading. Server
 * component, no client JS: <details>/<summary> gives the expand/collapse
 * live spent a useState on (dialecta-article-classification.jsx:309) for
 * free.
 *
 * Ported from ArticleDeclaration in
 * _recovered-next/lib/theme/dialecta-article-classification.jsx (lines
 * 307 to 686), ai_analysis fields narrowed to the ones confirmed present
 * on mguulnibvzusfvyuowwh's five live rows; see components/opinion-map/data.ts
 * for which two source fields were dropped and why.
 *
 * Steps 3 and 4 of the architect's port plan (team/architect/architecture/
 * 2026-09-21-delta-mechanic-port.md, build order #3 and #4). Render only:
 * every map here is OpinionMapFigure, the read-only figure from
 * components/opinion-map/engine.tsx. The tap-to-place, Commit-button
 * island (`placement-client.tsx`, InteractiveMap's live equivalent) is
 * step 6 and is not built in this pass; it mounts here, one per post-read
 * map, in the same position each OpinionMapFigure sits at now, adding its
 * own placement UI beside this read-only figure rather than replacing it.
 */
import type { CSSProperties } from 'react';
import { tierName, type Tier } from '@dialecta/core';
import { TierIcon } from '@/components/discourse/tier-badge';
import { strings } from '@/strings';
import { loadArticleDeclaration, type FlaggedPassage, type Tension } from '../opinion-map/data';
import { OpinionMapFigure } from '../opinion-map/engine';
import '../opinion-map/opinion-map.css';
import './declaration.css';

const s = strings.opinionMap.declaration;
const sm = strings.opinionMap.maps;

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

export async function ArticleDeclaration({ articleId }: { articleId: string }) {
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
              // Step 6 plugs PlacementClient in here, alongside this
              // read-only figure, for a signed-in reader's own placement.
              <OpinionMapFigure key={i} map={m} />
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
