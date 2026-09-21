/**
 * The article's own tier badges (live's #dialecta-tier-badge), just under
 * the byline: what the author declared at publish, what the engine read,
 * and the tier the article carries. Ported from ArticleTierBadge in
 * _recovered-next/lib/theme/dialecta-article-classification.jsx (lines 103
 * to 183); the three-column layout and the Final column's emphasis are
 * that component's, translated from its inline styles to this app's
 * tokens and to discourse.css's dd-tier-row pattern, the same "label over
 * a TierBadge" shape private-draft.tsx already uses for a comment's own
 * Engine read / Self declared pair, rather than a second copy of the same
 * chip.
 *
 * Server component: TierBadge with no onClick renders a <span>, so nothing
 * here needs client state. Values come from lib/articles.ts's
 * declared_tier/ai_suggested_tier/final_tier, already narrowed to
 * Tier | null there (isTier at the query boundary).
 */
import type { Tier } from '@dialecta/core';
import { TierBadge } from '@/components/discourse/tier-badge';
import '@/components/discourse/discourse.css';
import { strings } from '@/strings';
import './tier-badges.css';

const s = strings.articleTierBadges;

function Column({ label, tier, empty }: { label: string; tier: Tier | null; empty: string }) {
  return (
    <div>
      <div className="dd-tier-row-label">{label}</div>
      {tier ? <TierBadge tier={tier} /> : <span className="atb-empty">{empty}</span>}
    </div>
  );
}

export interface ArticleTierBadgesProps {
  declaredTier: Tier | null;
  aiSuggestedTier: Tier | null;
  finalTier: Tier | null;
}

/** Null when the article carries no tier at all: nothing to show yet, rather than three empty columns. */
export function ArticleTierBadges({ declaredTier, aiSuggestedTier, finalTier }: ArticleTierBadgesProps) {
  if (!declaredTier && !aiSuggestedTier && !finalTier) return null;
  return (
    <div id="dialecta-tier-badge" className="dd-tier-row">
      <Column label={s.authorDeclared} tier={declaredTier} empty={s.notDeclared} />
      <Column label={s.engineRead} tier={aiSuggestedTier} empty={s.notReadYet} />
      <Column label={s.final} tier={finalTier} empty={s.notFinalYet} />
    </div>
  );
}
