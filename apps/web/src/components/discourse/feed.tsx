'use client';

/**
 * The Discourse Layer feed: topology bar, control bar, comment cards,
 * contrast strips, one level of replies. Ported from
 * _recovered-next/lib/theme/dialecta-discourse-layer.jsx (1,251 lines), which
 * the Council ruled "Adapted (auth rewritten)"
 * (council/log/2026-09-20-port-or-rewrite.md). The rule for Ghost coupling:
 * the JSX adapts, the identity logic is rewritten.
 *
 * What ported, close to as-is: the topology bar as the filter (segment and
 * legend chip click), the sticky control bar with the active-filter chip and
 * the Quality and Newest sorts, the card anatomy (initials, name, "You",
 * time, tier badge or the AI and self-declared pair, body, engine-voice
 * contrast strip, specificity dots, Reply), the Breach variant, and reply
 * threading one level deep with the filter applied to top-level comments.
 *
 * What was rewritten:
 *
 *   - The read. The recovered component fetched /api/comments from the
 *     browser with the viewer's Ghost uuid as a query parameter. The rows
 *     arrive as props now, read on the server through the verified session
 *     (./data.ts), and no island here touches a Supabase client.
 *   - is_own and visibility are the server's calls, made from the session.
 *   - Breach, suppressed and unclassified bodies are dropped on the server,
 *     not hidden in the browser.
 *   - The displayed tier never falls back to the self-declaration.
 *   - Relative times render from the server's clock first, so the text
 *     hydrates to what the server sent, then tick in the browser.
 *
 * What was dropped, each because nothing behind it exists in this build:
 *
 *   - Edit and Delete, the EditOverlay, the malleability countdown and its
 *     progress bar. No PATCH or DELETE route exists, and comments carries no
 *     update or delete policy.
 *   - The nomination panel. tier_nominations is closed to every client
 *     (tier_nominations_service_only) and no nomination route exists.
 *   - Mention links. The recovered link target was /profile/?id=<Ghost
 *     member id>, the id security holds as a credential. Mentions are
 *     highlighted, unlinked, until the profile route settles what its id is.
 */
import { useEffect, useMemo, useState } from 'react';
import { TIER_IDS, tierName, type Tier } from '@dialecta/core';
import { strings } from '@/strings';
import { TierBadge, TierIcon, tierLabel } from './tier-badge';
import type { CommentMention, DiscourseComment } from './types';

type SortKey = 'quality' | 'newest';
type Filter = Tier | 'all';

const s = strings.discourse;

/** Quality sort order: Forum first, Breach last, an unread comment after all of them. */
const TIER_RANK: Readonly<Record<Tier, number>> = Object.fromEntries(TIER_IDS.map((t, i) => [t, i])) as Record<
  Tier,
  number
>;

const MS_MINUTE = 60_000;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;
const MS_WEEK = 7 * MS_DAY;

/**
 * The recovered relativeTime(), with one change: past five weeks it gives
 * the date, where the recovered helper counted weeks forever.
 */
function relativeTime(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, now - t);
  if (diff < MS_MINUTE) return s.time.justNow;
  if (diff < MS_HOUR) return s.time.minutes(Math.floor(diff / MS_MINUTE));
  if (diff < MS_DAY) return s.time.hours(Math.floor(diff / MS_HOUR));
  if (diff < MS_WEEK) return s.time.days(Math.floor(diff / MS_DAY));
  if (diff < 5 * MS_WEEK) return s.time.weeks(Math.floor(diff / MS_WEEK));
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** The server's clock on the first render, the browser's after it, refreshed each minute. */
function useNow(renderedAt: string): number {
  const [now, setNow] = useState(() => new Date(renderedAt).getTime());
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), MS_MINUTE);
    return () => clearInterval(i);
  }, []);
  return now;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return '?';
}

function newestFirst(a: DiscourseComment, b: DiscourseComment): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function oldestFirst(a: DiscourseComment, b: DiscourseComment): number {
  return -newestFirst(a, b);
}

function rankOf(c: DiscourseComment): number {
  return c.tier ? TIER_RANK[c.tier.final] : TIER_IDS.length;
}

/**
 * The recovered renderBodyWithMentions(): split the body on each @token,
 * longest token first so "@daniel-pennington" wins over "@daniel". The
 * token becomes a highlighted span with the display name as its title.
 */
function renderBody(body: string, mentions: readonly CommentMention[]) {
  if (mentions.length === 0) return body;
  type Segment = { kind: 'text'; value: string } | { kind: 'mention'; token: string; name: string };
  let segments: Segment[] = [{ kind: 'text', value: body }];
  const sorted = [...mentions].sort((a, b) => b.token.length - a.token.length);
  for (const m of sorted) {
    const needle = `@${m.token}`;
    const next: Segment[] = [];
    for (const seg of segments) {
      if (seg.kind !== 'text') {
        next.push(seg);
        continue;
      }
      let cursor = 0;
      let idx = seg.value.indexOf(needle, cursor);
      while (idx !== -1) {
        if (idx > cursor) next.push({ kind: 'text', value: seg.value.slice(cursor, idx) });
        next.push({ kind: 'mention', token: m.token, name: m.displayName });
        cursor = idx + needle.length;
        idx = seg.value.indexOf(needle, cursor);
      }
      if (cursor < seg.value.length) next.push({ kind: 'text', value: seg.value.slice(cursor) });
    }
    segments = next;
  }
  return segments.map((seg, i) =>
    seg.kind === 'mention' ? (
      <span key={i} className="dd-mention" title={seg.name}>
        @{seg.token}
      </span>
    ) : (
      seg.value
    ),
  );
}

// ─── Topology bar ─────────────────────────────────────────────────────────
// The topology bar IS the filter (recovered decision, 2026-04-29): the
// proportional strip and the legend chips both filter, and the control bar
// only carries the active-filter indicator and the sort.

function TopologyBar({
  comments,
  filter,
  onFilter,
}: {
  comments: readonly DiscourseComment[];
  filter: Filter;
  onFilter: (f: Filter) => void;
}) {
  const counts = useMemo(() => {
    const c = Object.fromEntries(TIER_IDS.map((t) => [t, 0])) as Record<Tier, number>;
    for (const cm of comments) if (cm.tier) c[cm.tier.final] += 1;
    return c;
  }, [comments]);
  const tiered = TIER_IDS.reduce((acc, t) => acc + counts[t], 0);

  const guidebook = (
    <a className="dd-link" href="/guidebook#tiers" target="_blank" rel="noopener">
      {s.guidebook} <span aria-hidden="true">→</span>
    </a>
  );

  if (comments.length === 0) {
    return (
      <div className="dd-topology dd-topology--empty">
        <div className="dd-topology-empty-title">{s.topology.emptyTitle}</div>
        <p className="dd-topology-empty-body">{s.topology.emptyBody}</p>
        {guidebook}
      </div>
    );
  }

  const present = TIER_IDS.filter((t) => counts[t] > 0);

  return (
    <div className="dd-topology">
      <div className="dd-topology-head">
        <div className="dd-topology-title">{s.topology.shape(comments.length)}</div>
        {guidebook}
      </div>

      {tiered > 0 ? (
        <>
          {/* Proportional strip. Zero-count tiers render nothing, so there
              are no zero-width slivers. An active filter dims the rest. */}
          <div className="dd-strip" role="group" aria-label={s.topology.stripLabel}>
            {present.map((t) => {
              const n = counts[t];
              const name = tierName(t);
              return (
                <button
                  key={t}
                  type="button"
                  className="dd-t dd-seg"
                  data-tier={t}
                  data-dimmed={filter !== 'all' && filter !== t ? 'true' : undefined}
                  style={{ flexGrow: n }}
                  title={`${name}: ${n}`}
                  aria-label={s.topology.segment(name, n)}
                  aria-pressed={filter === t}
                  onClick={() => onFilter(filter === t ? 'all' : t)}
                >
                  <TierIcon tier={t} size={11} />
                </button>
              );
            })}
          </div>

          {/* Legend chips: the primary click-to-filter target. */}
          <div className="dd-legend" role="group" aria-label={s.topology.legendLabel}>
            {present.map((t) => {
              const active = filter === t;
              return (
                <button
                  key={t}
                  type="button"
                  className="dd-t dd-chip"
                  data-tier={t}
                  data-dimmed={filter !== 'all' && !active ? 'true' : undefined}
                  aria-pressed={active}
                  title={s.tiers.meanings[t]}
                  onClick={() => onFilter(active ? 'all' : t)}
                >
                  <span className="dd-tier-icon">
                    <TierIcon tier={t} size={11} />
                  </span>
                  <span>{tierName(t)}</span>
                  <span className="dd-chip-count">· {counts[t]}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Control bar ──────────────────────────────────────────────────────────

function ControlBar({
  filter,
  onFilter,
  sort,
  onSort,
}: {
  filter: Filter;
  onFilter: (f: Filter) => void;
  sort: SortKey;
  onSort: (k: SortKey) => void;
}) {
  return (
    <div className="dd-control" role="region" aria-label={s.control.label}>
      {filter !== 'all' ? (
        <div className="dd-control-filter">
          <span>{s.control.showingOnly}</span>
          <span className="dd-t dd-control-chip" data-tier={filter}>
            <span className="dd-tier-icon">
              <TierIcon tier={filter} size={10} />
            </span>
            <span>{tierName(filter)}</span>
          </span>
          <button type="button" className="dd-plain-button" onClick={() => onFilter('all')}>
            {s.control.showAll}
          </button>
        </div>
      ) : null}

      <label className="dd-sort">
        {s.control.sort}
        <select value={sort} onChange={(e) => onSort(e.target.value === 'newest' ? 'newest' : 'quality')}>
          <option value="quality">{s.control.quality}</option>
          <option value="newest">{s.control.newest}</option>
        </select>
      </label>
    </div>
  );
}

// ─── Comment card ─────────────────────────────────────────────────────────

function CommentCard({
  comment,
  now,
  reply = false,
  onReply,
}: {
  comment: DiscourseComment;
  now: number;
  reply?: boolean;
  onReply: ((c: DiscourseComment) => void) | null;
}) {
  const { tier } = comment;
  const name = comment.authorName || s.card.anonymous;
  const contrast = tier && tier.self && tier.self !== tier.ai ? tier.self : null;
  const isBreach = comment.withheld === 'breach';
  const pending = comment.isOwn && comment.status === 'pending_review';
  const canReply = onReply !== null && !reply && !isBreach && comment.status === 'published';

  const withheldText =
    comment.withheld === 'breach'
      ? s.card.breach
      : comment.withheld === 'suppressed'
        ? s.card.suppressed
        : comment.withheld === 'unread'
          ? s.card.unread
          : null;

  const showDots = !comment.withheld && comment.specificity !== null;

  return (
    <article
      className="dialecta-paper dialecta-wood-frame dd-card"
      data-reply={reply ? 'true' : undefined}
      data-withheld={comment.withheld ?? undefined}
      data-pending={pending ? 'true' : undefined}
      aria-label={name}
    >
      {reply ? (
        <div className="dd-reply-tag" aria-hidden="true">
          ↳ {s.card.replyTag}
        </div>
      ) : null}

      <header className="dd-card-head">
        <div className="dd-author">
          <span className="dd-avatar" aria-hidden="true">
            {initials(name)}
          </span>
          <div>
            <div className="dd-name">
              {name}
              {comment.isOwn ? <span className="dd-you">{s.card.you}</span> : null}
            </div>
            <time className="dd-when" dateTime={comment.createdAt}>
              {relativeTime(comment.createdAt, now)}
            </time>
          </div>
        </div>

        {tier ? (
          <div className="dd-badges">
            {contrast ? (
              <>
                <span className="dd-badge-stack">
                  <span className="dd-eyebrow-ai">{s.card.ai}</span>
                  <TierBadge tier={tier.ai} />
                </span>
                <span className="dd-badge-stack">
                  <span className="dd-eyebrow-self">{s.card.selfDeclared}</span>
                  <TierBadge tier={contrast} />
                </span>
              </>
            ) : (
              <TierBadge tier={tier.final} />
            )}
          </div>
        ) : null}
      </header>

      {pending ? (
        <div className="dd-pending">
          <span className="dd-pending-pill">{s.card.pending}</span>
          <span className="dd-pending-note">{s.card.pendingNote}</span>
        </div>
      ) : null}

      {withheldText !== null || comment.body === null ? (
        <p className="dd-body dd-body--withheld">{withheldText ?? s.card.unread}</p>
      ) : (
        <p className="dd-body">{renderBody(comment.body, comment.mentions)}</p>
      )}

      {contrast && tier && !comment.withheld ? (
        <div className="dd-contrast">
          <div className="dd-label dd-label--tight">{s.card.engineVoice}</div>
          <p className="dd-contrast-text">
            {s.card.contrastDeclared} <strong>{tierLabel(contrast)}</strong>. {s.card.contrastEngine}{' '}
            <strong>{tierLabel(tier.ai)}</strong>. {s.card.contrastTail}
          </p>
        </div>
      ) : null}

      {showDots || canReply ? (
        <footer className="dd-card-foot">
          <div>
            {showDots && comment.specificity !== null ? (
              <span className="dd-dots" role="img" aria-label={s.card.specificityLabel(comment.specificity)}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="dd-dot"
                    data-on={comment.specificity !== null && i < comment.specificity ? 'true' : undefined}
                  />
                ))}
                <span className="dd-dots-label" aria-hidden="true">
                  {s.card.specificity(comment.specificity)}
                </span>
              </span>
            ) : null}
          </div>
          {canReply && onReply ? (
            <button
              type="button"
              className="dd-micro"
              onClick={() => onReply(comment)}
              aria-label={s.card.replyTo(name)}
            >
              {s.card.reply}
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}

// ─── The feed ─────────────────────────────────────────────────────────────

export interface DiscourseFeedProps {
  comments: readonly DiscourseComment[];
  unavailable: boolean;
  /** Development only, from data.ts. */
  diagnostic?: string | undefined;
  /** Development only, from data.ts: the cards carry no tiers on this machine. */
  tierless?: boolean | undefined;
  renderedAt: string;
  /** Null when the viewer cannot comment, which hides Reply, as the recovered feed did. */
  onReply: ((c: DiscourseComment) => void) | null;
}

export function DiscourseFeed({ comments, unavailable, diagnostic, tierless, renderedAt, onReply }: DiscourseFeedProps) {
  const now = useNow(renderedAt);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('quality');

  // Replies follow their parent, oldest first, whatever the global sort. A
  // reply whose parent is not visible here renders at the top level, so a
  // published comment never disappears for want of its parent.
  const { topLevel, repliesByParent } = useMemo(() => {
    const ids = new Set(comments.map((c) => c.id));
    const byParent = new Map<string, DiscourseComment[]>();
    const top: DiscourseComment[] = [];
    for (const c of comments) {
      if (c.parentId && ids.has(c.parentId)) {
        const list = byParent.get(c.parentId) ?? [];
        list.push(c);
        byParent.set(c.parentId, list);
      } else {
        top.push(c);
      }
    }
    for (const list of byParent.values()) list.sort(oldestFirst);
    return { topLevel: top, repliesByParent: byParent };
  }, [comments]);

  // Filter applies to top-level comments; a visible parent brings its whole thread.
  const display = useMemo(() => {
    const filtered = filter === 'all' ? topLevel : topLevel.filter((c) => c.tier?.final === filter);
    const sorted = [...filtered];
    if (sort === 'quality') {
      sorted.sort((a, b) => rankOf(a) - rankOf(b) || newestFirst(a, b));
    } else {
      sorted.sort(newestFirst);
    }
    return sorted;
  }, [topLevel, filter, sort]);

  if (unavailable) {
    return (
      <div className="dd-feed">
        <p className="dd-notice">{s.feed.unavailable}</p>
        {diagnostic ? <p className="dd-diagnostic">{diagnostic}</p> : null}
      </div>
    );
  }

  return (
    <div className="dd-feed">
      {tierless ? <p className="dd-preview dd-preview--feed">{s.feed.devTierless}</p> : null}
      <TopologyBar comments={comments} filter={filter} onFilter={setFilter} />
      {comments.length > 0 ? <ControlBar filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} /> : null}

      {comments.length > 0 ? (
        <div className="dd-list" aria-label={s.feed.label}>
          {display.length === 0 && filter !== 'all' ? (
            <p className="dd-list-empty">{s.feed.noneInTier(tierName(filter))}</p>
          ) : null}

          {display.map((c) => (
            <div key={c.id}>
              <CommentCard comment={c} now={now} onReply={onReply} />
              {(repliesByParent.get(c.id) ?? []).map((r) => (
                <CommentCard key={r.id} comment={r} now={now} reply onReply={null} />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
