/**
 * The article's opinion-map declaration surfaces, both fed by the same
 * loadArticleDeclaration() read: ArticleDeclaration (Strongest Objection,
 * the article's opinion maps, Core Claim, Scope Boundary, and a native
 * <details> disclosure of the engine's own reading, inside the Declare
 * overlay) and ArticleReflectPlacement (map 0 only, author position
 * hidden, inside the Reflect overlay). Everything but the placement islands
 * stays server-only, no client JS: <details>/<summary> gives the
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
 * figure every reader sees; PlacementClient
 * (components/opinion-map/placement-client.tsx), the tap-to-place,
 * Commit-button island ported from live's InteractiveMap, takes its place
 * for a canPlace caller, one per post-read map: the same map with the
 * author's marker and the reader's own, drawn once, as live draws it.
 *
 * The overlay's order, its summary row and the detected-claim rule come from
 * the council's review of the maps and the declaration
 * (council/log/2026-09-21-opinion-maps-and-the-declaration.md, "Dan's
 * decisions"): the Strongest Objection leads, the maps follow, then the
 * author's Core Claim and Scope Boundary, then the engine's reading folded
 * behind one row that carries the tier and the sentence saying the reading
 * never gates publication.
 */
import type { CSSProperties } from 'react';
import { tierName, type Tier } from '@dialecta/core';
import { TierIcon } from '@/components/discourse/tier-badge';
import { strings } from '@/strings';
import { loadArticleDeclaration, type AiAlignment, type ArticleAiAnalysis, type FlaggedPassage, type Tension } from '../opinion-map/data';
import { OpinionMapFigure } from '../opinion-map/engine';
import { PlacementClient } from '../opinion-map/placement-client';
import { SignInLink } from '@/components/shell/sign-in-link';
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

/**
 * The engine's reading, folded. One native <details>, closed by default; the
 * whole summary row is the control (a <summary> toggles wherever inside it a
 * reader clicks), so it carries three things a reader sees with no click: the
 * tier the engine read, the sentence saying the reading is disclosed and
 * never a gate (locked by the council, moved out of the folded body so it is
 * true on screen and not only in markup), and a labelled cue for opening it.
 * The cue's two labels swap on [open] in CSS; nothing here needs a client.
 */
function AiDisclosure({
  suggestedTier,
  tierReason,
  alignmentNote,
  coreClaimDetected,
  flaggedPassages,
  tensions,
}: {
  suggestedTier: Tier | null;
  tierReason: string | null;
  alignmentNote: string | null;
  coreClaimDetected: string | null;
  flaggedPassages: FlaggedPassage[];
  tensions: Tension[];
}) {
  return (
    <details className="ad-disclosure">
      <summary className="ad-disclosure-summary">
        <span className="ad-disclosure-head">
          <span className="ad-disclosure-title">{s.aiDisclosure.summary}</span>
          {suggestedTier ? (
            <span className="ad-disclosure-tier">
              <TierIcon tier={suggestedTier} size={10} />
              <span>{tierName(suggestedTier)}</span>
            </span>
          ) : null}
          <span className="ad-disclosure-cue" aria-hidden="true">
            <span className="ad-disclosure-cue-show">{s.aiDisclosure.show}</span>
            <span className="ad-disclosure-cue-hide">{s.aiDisclosure.hide}</span>
          </span>
        </span>
        <span className="ad-disclosure-note">{s.aiDisclosure.footer}</span>
      </summary>

      <div className="ad-disclosure-body">
        <Field label={s.aiDisclosure.tierReason} value={tierReason} />
        <Field label={s.aiDisclosure.alignmentNote} value={alignmentNote} />
        <Field label={s.aiDisclosure.coreClaimDetected} value={coreClaimDetected} />
        {/* authorMessage ("Note to the Author") is deliberately not rendered here: it is the
           engine's private coaching to the author, and the Council review of 2026-09-21 found it
           reads as a verdict on the author to a reader browsing tiers, which Editorial Voice bars.
           Dan approved removing it from this reader-facing surface (council/log/2026-09-21-
           opinion-maps-and-the-declaration.md, item 6, "I agree 100%"). The author still sees it
           privately in the editor's own Stage 2.5 step (docs/Dialecta_Article_Editorial_Template.md),
           and may choose to publish their own reply there. aiAnalysis.authorMessage and
           AiDisclosure's own prop are kept, both because the editor still needs the field and so a
           later private surface can read it without a data-layer change. */}

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
      </div>
    </details>
  );
}

/**
 * The engine's own detected core claim earns a field of its own only when the
 * engine says its read differs from the author's: alignment `partial` or
 * `divergent`. The guard used to be a raw string comparison, which prints a
 * 57-word paraphrase of a claim the engine itself marked `aligned` (all five
 * live readings are). When a row carries no alignment word at all, nothing on
 * file says the read matches, so the old comparison stands and a differing
 * claim still shows: a disclosure surface fails toward showing.
 */
function detectedCoreClaimToShow(ai: ArticleAiAnalysis | null, authorClaim: string | null): string | null {
  const detected = ai?.coreClaimDetected ?? null;
  if (!ai || !detected) return null;
  const alignment: AiAlignment | null = ai.alignment;
  if (alignment === 'partial' || alignment === 'divergent') return detected;
  if (alignment === 'aligned') return null;
  return detected !== authorClaim ? detected : null;
}

/**
 * The line under a read-only map for a reader who can't place: signed out, or signed in with a
 * sign-in that isn't linked to a profile yet. Without it the maps look tappable and do nothing.
 */
function PlaceHint({ kind }: { kind: 'guest' | 'unclaimed' }) {
  return kind === 'guest' ? (
    <p className="om-placement-hint">
      <SignInLink className="om-placement-hint-link">{sp.signInLink}</SignInLink> {sp.signInRest}
    </p>
  ) : (
    <p className="om-placement-hint">{sp.unclaimed}</p>
  );
}

export async function ArticleDeclaration({
  articleId,
  canPlace,
  placeHint,
}: {
  articleId: string;
  canPlace: boolean;
  placeHint: 'guest' | 'unclaimed' | null;
}) {
  const { declaration, aiAnalysis } = await loadArticleDeclaration(articleId);
  if (!declaration) return null;

  const maps = declaration.opinionMaps;
  const coreClaimDetected = detectedCoreClaimToShow(aiAnalysis, declaration.coreClaim);

  return (
    <section className="ad-section">
      <div className="ad-eyebrow">{s.eyebrow}</div>

      <Field label={s.strongestObjection} value={declaration.strongestObjection} />

      {maps.length > 0 ? (
        <div className="om-section">
          <div className="om-section-head">
            <div className="om-section-eyebrow">{maps.length === 1 ? sm.heading.one : sm.heading.many}</div>
            {(() => {
              const intro = maps.length === 1 ? sm.intro.one : sm.intro.many;
              return intro ? <div className="om-section-intro">{intro}</div> : null;
            })()}
          </div>

          <div className="om-figures">
            {maps.map((m, i) => (
              <div className="om-figure-group" key={i}>
                {canPlace ? (
                  <PlacementClient map={m} articleId={articleId} mapIndex={i} stage="post_read" showAuthorPosition privacyNote={sp.privacy} />
                ) : (
                  <>
                    <OpinionMapFigure map={m} />
                    {placeHint ? <PlaceHint kind={placeHint} /> : null}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {declaration.coreClaim || declaration.scopeBoundary ? (
        <div className="ad-claims">
          <Field label={s.coreClaim} value={declaration.coreClaim} />
          <Field label={s.scopeBoundary} value={declaration.scopeBoundary} />
        </div>
      ) : null}

      {aiAnalysis ? (
        <AiDisclosure
          suggestedTier={aiAnalysis.suggestedTier}
          tierReason={aiAnalysis.tierReason}
          alignmentNote={aiAnalysis.alignmentNote}
          coreClaimDetected={coreClaimDetected}
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
