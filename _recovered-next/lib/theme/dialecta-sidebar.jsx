/**
 * dialecta-sidebar.jsx
 *
 * The post-page sidebar. Mounted on /post/<slug>/ via post.hbs into
 * <div id="dialecta-sidebar">. Renders nine cards in a sticky vertical
 * stack. Each card is a single-purpose surface designed to sit alongside
 * the article body without competing with it for attention.
 *
 * Cards (top to bottom on desktop):
 *   1. The Pulse              live presence + quality at-a-glance
 *   2. Your Comment           conditional, only when viewer has a malleable
 *                             comment on this article. Big countdown.
 *   3. New in the Conversation  conditional, last comment <3 minutes old
 *   4. The Delta              opinion shifts pre/post reading
 *   5. In This Article        TOC, IntersectionObserver active section
 *   6. The Writer             author meta + archetype + Steward Order
 *   7. A Quote                rotates curated quotes every 25s
 *   8. The Argument           "Surface Coming" placeholder for claims
 *   9. Also In <topic>        2-3 related articles by primary tag
 *  10. Patron of This Article sponsorship slot, dark by default
 *
 * Live data is sourced from a single endpoint, /api/article/:id/pulse.
 * For v1 this is mocked client-side (generateMockPulse below) so the
 * frontend can ship and review without waiting on the Vercel handler.
 * Swap mock for real fetch when the endpoint lands; see usePulse below.
 *
 * Mobile behavior: this component renders nothing on mobile. CSS hides
 * the .post-sidebar wrapper below 1100px. Two pieces are surfaced inline
 * via separate small mounts (MobileTOC and MobileQuote) so phone readers
 * still see the TOC and the rotating quote in their natural reading
 * positions. The other live surfaces (Pulse, Your Comment, Delta, etc.)
 * are desktop-only by design; on a phone the existing TopologyBar at the
 * top of the comments feed already carries the conversation signal.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuoteList } from './dialecta-quotes-data.js';

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// Same palette as the editor and discourse-layer; keeping it inline so this
// component stays self-contained. Colors that appear in style.css :root are
// referenced via var(--name) where possible.
// ═══════════════════════════════════════════════════════════════════════════

const T = {
  paper:        '#fbf6ea',
  paperGrain:   "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.045'/%3E%3C/svg%3E\")",
  borderLight:  '#e8e0d0',
  borderMedium: '#d8ceb8',
  textPrimary:  '#1c1814',
  textBody:     '#3a342c',
  textSecondary:'#5a5248',
  textTertiary: '#7a7068',
  textMuted:    '#9a8e80',
  amber:        '#b8862e',
  brassDeep:    '#7a4a10',
  brassWarm:    '#d4a84a',
  brassPale:    '#f5dfa0',
  cherry:       '#6e3917',
  burnt:        '#8a4a18',
  forest:       '#287858',
  fontDisplay:  "'Cormorant Garamond', serif",
  fontReading:  "'Source Serif 4', Georgia, serif",
  fontMono:     "'DM Mono', monospace",
  fontBody:     "'DM Sans', sans-serif",
};

// Tier colors mirror the canonical TIERS map in dialecta-tier-badge.jsx.
// Duplicated here to avoid pulling that module just for these two strings.
const TIER_COLORS = {
  forum:  '#E8D080',
  spark:  '#D89438',
  echo:   '#708848',
  fog:    '#687488',
  heat:   '#C46028',
  stance: '#783028',
  breach: '#380808',
};

// Tier visualizations for the TierBar in the Pulse card. Forum is the
// crown jewel and gets the canonical brass shimmer (same gradient used
// on the masthead pair-line, the family-name on stewards, etc.). The
// other tiers descend in saturation so the bar reads as a quality
// gradient — more Forum is visibly better, more Breach is visibly
// worse — without anyone having to read the legend.
const TIER_GRADIENTS = {
  forum:  {
    name: 'Forum',
    bg: 'linear-gradient(95deg, #b8862e 0%, #d4a84a 18%, #ecb438 36%, #f5dfa0 50%, #ecb438 64%, #d4a84a 82%, #b8862e 100%)',
    inset: 'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(74,40,16,0.18)',
  },
  spark:  { name: 'Spark',  bg: 'linear-gradient(180deg, #FCF0D8 0%, #F4D098 100%)', inset: 'inset 0 1px 0 rgba(255,255,255,0.45)' },
  echo:   { name: 'Echo',   bg: 'linear-gradient(180deg, #EAF0E0 0%, #C8D8B0 100%)', inset: 'inset 0 1px 0 rgba(255,255,255,0.45)' },
  fog:    { name: 'Fog',    bg: 'linear-gradient(180deg, #DCE0E4 0%, #B0B8C4 100%)', inset: 'inset 0 1px 0 rgba(255,255,255,0.45)' },
  heat:   { name: 'Heat',   bg: 'linear-gradient(180deg, #E89868 0%, #C46028 100%)', inset: 'inset 0 1px 0 rgba(255,255,255,0.30)' },
  stance: { name: 'Stance', bg: 'linear-gradient(180deg, #A8483C 0%, #783028 100%)', inset: 'inset 0 1px 0 rgba(255,255,255,0.20)' },
  breach: { name: 'Breach', bg: 'linear-gradient(180deg, #6A1818 0%, #380808 100%)', inset: 'inset 0 1px 0 rgba(255,255,255,0.15)' },
};
const TIER_BAR_ORDER = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];

// Topic-color palette from the canonical TOPICS taxonomy. Used to color
// the Also-In card accent based on the article's primary tag.
const TOPIC_COLORS = {
  politics_governance:   '#9e2020',
  law_justice:           '#b04020',
  history:               '#9a5818',
  economics:             '#b87a18',
  environment_energy:    '#3a7a24',
  health_medicine:       '#287858',
  psychology_behavior:   '#267080',
  science_technology:    '#2650a0',
  philosophy_ethics:     '#3a3888',
  arts_humanities:       '#6a3a9a',
  theology_spirituality: '#7a2a80',
  society_culture:       '#8a2858',
};

// ═══════════════════════════════════════════════════════════════════════════
// API BASE
// ═══════════════════════════════════════════════════════════════════════════

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return 'https://dialecta.vercel.app';
}

// ═══════════════════════════════════════════════════════════════════════════
// LIVE PULSE — polling hook
// Polls /api/article/<id>/pulse every 20s while the tab is visible. For v1
// the endpoint isn't built yet, so this hook returns mock data shaped like
// the real response. When the endpoint lands, swap generateMockPulse for
// the actual fetch. The shape is the contract.
// ═══════════════════════════════════════════════════════════════════════════

const POLL_INTERVAL_MS = 20000;

function generateMockPulse(articleId) {
  // Stable-ish numbers per article id so reloads don't reshuffle wildly.
  // We add a small drift over time so the feel is "live" without faking
  // real activity that isn't there.
  const seed = (articleId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const t = Math.floor(Date.now() / 30000); // changes every 30s
  const rand = (off) => ((seed + t + off) * 9301 + 49297) % 233280 / 233280;

  const activeReaders = 8 + Math.floor(rand(1) * 12);
  const activeComposers = Math.floor(rand(2) * 4);
  const malleableCount = Math.floor(rand(3) * 5);
  const stewardsReading = Math.floor(rand(4) * 5);

  // Mock declared / shifted positions for The Delta card. Realistic shape.
  const declared = 30 + Math.floor(rand(5) * 30);
  const shifted = Math.floor(declared * (0.10 + rand(6) * 0.15));

  // Forum density: % of comments at Forum tier. Mock as 55-78%.
  const forumDensity = Math.floor(55 + rand(7) * 23);
  // Full tier distribution (percentages summing to 100). Used by the
  // TierBar visualization in the Pulse card. Forum is the headline
  // metric and gets the brass treatment; the rest fill in around it
  // with a believable shape (more comments at the cleaner tiers, very
  // few at Stance / Breach). Real distribution comes from
  // /api/comments aggregated by tier when the endpoint lands.
  const remaining = 100 - forumDensity;
  const sparkPct  = Math.round(remaining * 0.42);
  const echoPct   = Math.round(remaining * 0.22);
  const fogPct    = Math.round(remaining * 0.14);
  const heatPct   = Math.round(remaining * 0.10);
  const stancePct = Math.round(remaining * 0.08);
  const breachPct = Math.max(0, 100 - forumDensity - sparkPct - echoPct - fogPct - heatPct - stancePct);
  const tierDistribution = {
    forum:  forumDensity,
    spark:  sparkPct,
    echo:   echoPct,
    fog:    fogPct,
    heat:   heatPct,
    stance: stancePct,
    breach: breachPct,
  };

  // Average reading pace, in seconds (so we can format).
  const paceSeconds = 360 + Math.floor(rand(8) * 360); // 6m to 12m

  // Mock latest arrival, only sometimes (so the card fades in/out).
  const showArrival = rand(9) > 0.5;
  const latestArrival = showArrival ? {
    id: `mock-${seed}-${t}`,
    author_name: ['Maya R.', 'Wen L.', 'Anselm K.', 'Marisol G.'][Math.floor(rand(10) * 4)],
    tier: ['forum', 'spark', 'echo'][Math.floor(rand(11) * 3)],
    snippet: [
      'What strikes me here is the move from survival to meaning.',
      'I want to push back on the central claim, gently.',
      'This reminds me of something I read in another piece.',
      'A useful distinction. I would add only that...',
    ][Math.floor(rand(12) * 4)],
    created_at: new Date(Date.now() - Math.floor(rand(13) * 180000)).toISOString(),
  } : null;

  // Composer detail (anonymous, but tier-targeted).
  const composerDetail = activeComposers === 0 ? null : Array.from(
    { length: Math.min(activeComposers, 3) },
    (_, i) => ({
      stage: ['Drafting', 'Reflecting', 'Stage 2.5'][Math.floor(rand(20 + i) * 3)],
      target_tier: ['forum', 'spark', 'echo'][Math.floor(rand(30 + i) * 3)],
    })
  );

  return {
    article_id: articleId,
    active_readers: activeReaders,
    active_composers: activeComposers,
    composer_detail: composerDetail,
    malleable_count: malleableCount,
    next_hardens_in_min: malleableCount > 0 ? 5 + Math.floor(rand(14) * 50) : null,
    your_malleable: null, // populated by the real endpoint; mock leaves null
    latest_arrival: latestArrival,
    delta: { declared, shifted },
    forum_density_pct: forumDensity,
    tier_distribution: tierDistribution,
    avg_pace_seconds: paceSeconds,
    stewards_reading: stewardsReading,
  };
}

function usePulse(articleId) {
  const [pulse, setPulse] = useState(() => generateMockPulse(articleId));
  const timerRef = useRef(null);

  useEffect(() => {
    if (!articleId) return;
    let cancelled = false;

    const tick = () => {
      // Real version (when endpoint lands):
      //   fetch(`${apiBase()}/api/article/${encodeURIComponent(articleId)}/pulse`)
      //     .then(r => r.ok ? r.json() : null)
      //     .then(data => { if (!cancelled && data) setPulse(data); })
      //     .catch(() => {});
      // Mock version for v1: regenerate from the same seed, which drifts
      // every 30 seconds, so the feel is "live" without lying about real
      // activity that doesn't exist yet.
      if (!cancelled) setPulse(generateMockPulse(articleId));
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (document.hidden) return;
      timerRef.current = setTimeout(() => { tick(); schedule(); }, POLL_INTERVAL_MS);
    };

    tick();
    schedule();

    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
      } else {
        schedule();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [articleId]);

  return pulse;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHOR FETCH — single profile fetch, real
// ═══════════════════════════════════════════════════════════════════════════

function useArticleAuthor(authorMemberId) {
  const [author, setAuthor] = useState(null);
  useEffect(() => {
    if (!authorMemberId) return;
    let cancelled = false;
    fetch(`${apiBase()}/api/profile/${encodeURIComponent(authorMemberId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(p => { if (!cancelled && p) setAuthor(p); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authorMemberId]);
  return author;
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS — DOM walk + IntersectionObserver
// Watches the article body for h2/h3 elements, builds a click-to-scroll
// list, and highlights the section whose heading is currently in the
// reading viewport.
// ═══════════════════════════════════════════════════════════════════════════

function useTableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const container = document.querySelector('.post-content');
    if (!container) return;

    // Collect headings + ensure they have IDs (Ghost usually does, but
    // assigning a fallback keeps anchor-jumping reliable).
    const found = [...container.querySelectorAll('h2, h3')].map((h, i) => {
      if (!h.id) {
        const slug = (h.textContent || '').toLowerCase()
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `section-${i}`;
        h.id = slug;
      }
      return {
        id: h.id,
        text: h.textContent || '',
        level: h.tagName === 'H2' ? 2 : 3,
      };
    });
    setHeadings(found);
    if (found.length === 0) return;

    // IntersectionObserver: section is "active" when its heading is in the
    // top 30% to 60% reading band. Tuned so the active highlight matches
    // where the eye actually is.
    const observer = new IntersectionObserver((entries) => {
      // Pick the topmost intersecting heading in the band.
      const intersecting = entries.filter(e => e.isIntersecting);
      if (intersecting.length > 0) {
        intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(intersecting[0].target.id);
      }
    }, { rootMargin: '-30% 0px -60% 0px' });

    found.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return { headings, activeId };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE ROTATOR — pulls from /api/quotes (status=live), rotates one at a
// time with a fade transition. Pause-on-hover so a reader can dwell.
// ═══════════════════════════════════════════════════════════════════════════

const QUOTE_INTERVAL_MS = 25000;
const QUOTE_FADE_MS = 600;

function useQuoteRotator() {
  // Re-using useQuoteList from dialecta-quotes-data — same hook the admin
  // page uses. status: 'live' filters to only the published curated set.
  const { quotes, loading, error } = useQuoteList({ status: 'live', limit: 200 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (paused || loading || quotes.length < 2) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % quotes.length);
        setFading(false);
      }, QUOTE_FADE_MS);
    }, QUOTE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, loading, quotes.length]);

  // Pick a random starting index once quotes load so two simultaneous
  // viewers don't see the same quote in lockstep.
  useEffect(() => {
    if (quotes.length > 0) setIndex(Math.floor(Math.random() * quotes.length));
  }, [quotes.length]);

  return {
    quote: quotes[index] || null,
    fading,
    loading,
    error,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MALLEABLE COUNTDOWN — ticks the seconds remaining on the viewer's own
// comment in the 60-minute editing window.
// ═══════════════════════════════════════════════════════════════════════════

function useCountdown(targetIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  if (!targetIso) return null;
  const remaining = new Date(targetIso).getTime() - now;
  if (remaining <= 0) return { mins: 0, secs: 0, pct: 0, expired: true };
  const totalMin = 60 * 60 * 1000;
  return {
    mins: Math.floor(remaining / 60000),
    secs: Math.floor((remaining % 60000) / 1000),
    pct: Math.max(0, Math.min(100, (remaining / totalMin) * 100)),
    expired: false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CARD WRAPPER — shared frame
// Every sidebar card uses the same paper + grain + accent-left frame so
// the stack reads as a single instrument. The accent prop tints the left
// border in 4px to mark the card's domain.
// ═══════════════════════════════════════════════════════════════════════════

function Card({ accent = T.amber, children, label, onMouseEnter, onMouseLeave }) {
  // 2026-04-29 brightness pass v4:
  //   - Background subtly more saturated: #fffaeb (was #fffbef). Reads
  //     as warm paper rather than cool white.
  //   - Subtle linear gradient from a slightly lighter top to a slightly
  //     warmer bottom adds depth without going chrome-y.
  //   - Paper grain bumped 0.075 → 0.10 so the texture has more bite.
  //   - Inset top highlight stays at 95% white for the "lit edge."
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        backgroundColor: '#fffaeb',
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,250,0.55) 0%, rgba(252,243,222,0.30) 100%)," +
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.10'/%3E%3C/svg%3E\")",
        border: `1px solid ${T.borderMedium}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 10,
        padding: '18px 20px 18px 22px',
        marginBottom: 14,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.95),' +
          '0 1px 3px rgba(74,40,16,0.10),' +
          '0 10px 28px rgba(74,40,16,0.18)',
        position: 'relative',
        zIndex: 1,
      }}>
      {label && (
        <div style={{
          fontFamily: T.fontMono,
          fontSize: 10.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: accent,
          fontWeight: 600,
          marginBottom: 12,
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. THE PULSE
// Live presence + quality at-a-glance. Six numbers, three live (top half),
// three quality (bottom half). Polls every 20s.
// ═══════════════════════════════════════════════════════════════════════════

function PulseCard({ pulse, isArticle }) {
  if (!pulse) return null;
  const {
    active_readers, active_composers, composer_detail,
    malleable_count, next_hardens_in_min,
    forum_density_pct, avg_pace_seconds, stewards_reading,
  } = pulse;

  const paceMin = Math.floor(avg_pace_seconds / 60);
  const paceSec = avg_pace_seconds % 60;

  // Site-global Pulse (non-article pages): only the cross-site live
  // signals make sense. Article-specific quality (Forum density, avg
  // pace, malleable count for THIS article) are hidden.
  if (!isArticle) {
    return (
      <Card accent={T.brassWarm} label="On Dialecta">
        <Stat icon="◉" value={`${active_readers} reading across the site`} />
        <Stat icon="✎" value={
          active_composers === 0
            ? 'Quiet — no one composing'
            : `${active_composers} composing on ${1 + Math.floor(active_composers / 2)} ${active_composers > 1 ? 'articles' : 'article'}`
        } />
        {stewards_reading > 0 && (
          <Stat icon="✦" value={`${stewards_reading} ${stewards_reading === 1 ? 'Steward' : 'Stewards'} reading`} />
        )}
      </Card>
    );
  }

  return (
    <Card accent={T.brassWarm} label="The Pulse">
      {/* Live half */}
      <Stat icon="◉" value={`${active_readers} reading now`} />
      <Stat icon="✎" value={
        active_composers === 0
          ? 'Quiet — no one composing'
          : `${active_composers} composing`
      } />
      {composer_detail && composer_detail.length > 0 && (
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12.5, color: T.textTertiary,
          marginLeft: 22, marginTop: -2, marginBottom: 8, lineHeight: 1.55,
        }}>
          {composer_detail.map((d, i) => (
            <div key={i}>
              ↳ {d.stage}, toward <em style={{ color: TIER_COLORS[d.target_tier], fontStyle: 'normal', fontWeight: 600 }}>{capitalize(d.target_tier)}</em>
            </div>
          ))}
        </div>
      )}
      <Stat icon="⟳" value={
        malleable_count === 0
          ? 'No comments still malleable'
          : `${malleable_count} still malleable${next_hardens_in_min ? ` · next hardens in ${next_hardens_in_min}m` : ''}`
      } />
      {stewards_reading > 0 && (
        <Stat icon="✦" value={`${stewards_reading} ${stewards_reading === 1 ? 'Steward' : 'Stewards'} reading`} />
      )}

      <Divider />

      {/* Quality half: the tier-distribution bar replaces the old plain
          "Forum density: 74%" row. Forum reads as brass shimmer; the
          remaining tiers fade through their canonical colors so the
          bar communicates conversation quality at a glance. Avg pace
          stays as a single small line below for the reading-depth
          signal. */}
      <TierBar distribution={pulse.tier_distribution} />
      <QualityRow label="Avg pace" value={`${paceMin}m ${paceSec.toString().padStart(2,'0')}s`} />
    </Card>
  );
}

function Stat({ icon, value }) {
  return (
    <div style={{
      fontFamily: T.fontReading,
      fontSize: 14.5, lineHeight: 1.55,
      color: T.textBody,
      marginBottom: 8,
      display: 'flex', alignItems: 'baseline', gap: 10,
    }}>
      <span style={{ color: T.brassWarm, fontSize: 13, flexShrink: 0 }}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function QualityRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      marginBottom: 6,
    }}>
      <span style={{
        fontFamily: T.fontMono, fontSize: 10.5, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: T.textTertiary,
      }}>{label}</span>
      <span style={{
        fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 500,
        color: T.brassDeep, fontStyle: 'italic',
      }}>{value}</span>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(to right, ${T.borderMedium} 0%, transparent 80%)`,
      margin: '10px 0 8px',
    }} />
  );
}

// TierBar: stacked tier-distribution visualizer. Forum gets the brass
// shimmer; the rest fade in saturation so the bar reads as a "better →
// worse" gradient at a glance. Hover reveals exact percentages per tier
// via the title attribute. Total height is intentionally generous (24px)
// so the brass actually has room to feel like metal rather than a sliver.
function TierBar({ distribution }) {
  if (!distribution) return null;
  const segments = TIER_BAR_ORDER.filter(t => (distribution[t] || 0) > 0);

  return (
    <div>
      {/* The bar: thin brass-edged channel with each tier as a flex
          segment proportional to its percentage. Inset shadow on the
          channel itself + per-segment top highlight gives the whole
          thing a hammered-metal feel without any animation. */}
      <div style={{
        display: 'flex',
        height: 24,
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(74,40,16,0.22)',
        boxShadow:
          'inset 0 1px 3px rgba(28,24,20,0.18),' +
          '0 1px 0 rgba(255,255,255,0.55)',
        marginBottom: 12,
      }}>
        {segments.map((t, i) => {
          const pct = distribution[t];
          const grad = TIER_GRADIENTS[t];
          return (
            <div
              key={t}
              title={`${grad.name}: ${pct}%`}
              style={{
                flex: pct,
                background: grad.bg,
                boxShadow: grad.inset,
                borderRight: i < segments.length - 1 ? '1px solid rgba(28,24,20,0.18)' : 'none',
                position: 'relative',
              }}
            />
          );
        })}
      </div>
      {/* Headline: Forum density as the marquee number, with a small
          legend strip below showing the next two tiers so the breakdown
          is legible without forcing the reader to hover. */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 6,
      }}>
        <span style={{
          fontFamily: T.fontMono, fontSize: 10.5, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: T.textTertiary,
        }}>
          Forum density
        </span>
        <span style={{
          fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 500,
          color: T.brassDeep, fontStyle: 'italic',
          letterSpacing: '0.005em',
        }}>
          {distribution.forum}%
        </span>
      </div>
      {/* Mini-legend: the next two tiers by share, dim small mono. Keeps
          the rest of the bar interpretable without crowding. */}
      <div style={{
        fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.08em',
        color: T.textMuted, lineHeight: 1.4,
      }}>
        {segments.filter(t => t !== 'forum').slice(0, 3).map((t, i) => (
          <span key={t}>
            {i > 0 && <span style={{ color: T.borderMedium, margin: '0 6px' }}>·</span>}
            <span style={{ color: TIER_COLORS[t] }}>{TIER_GRADIENTS[t].name}</span>
            <span style={{ marginLeft: 4 }}>{distribution[t]}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. YOUR COMMENT (conditional)
// Only renders when the viewer has a malleable comment on this article.
// Big visible countdown, brass band that drains as the timer expires.
// ═══════════════════════════════════════════════════════════════════════════

function YourCommentCard({ malleable }) {
  const countdown = useCountdown(malleable?.hardens_at);
  if (!malleable) return null;

  if (countdown?.expired) {
    return (
      <Card accent={T.brassDeep} label="Your Comment">
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 14, lineHeight: 1.55, color: T.textBody,
        }}>
          Hardened. Your comment is part of the record now.
        </div>
      </Card>
    );
  }

  const { mins, secs, pct } = countdown || { mins: 60, secs: 0, pct: 100 };
  const declaredTier = malleable.self_declared_tier;
  const finalTier = malleable.final_tier || malleable.ai_suggested_tier;

  return (
    <Card accent={T.brassDeep} label="Your Comment">
      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 28, fontWeight: 500, color: T.brassDeep,
        lineHeight: 1, marginBottom: 4,
      }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </div>
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: T.textTertiary, marginBottom: 10,
      }}>
        Still yours to refine
      </div>
      {/* Brass band — fills, then drains */}
      <div style={{
        height: 4, background: T.borderLight, borderRadius: 2, overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(to right, ${T.brassWarm}, ${T.brassPale})`,
          transition: 'width 1s linear',
        }} />
      </div>
      {declaredTier && finalTier && declaredTier !== finalTier && (
        <div style={{
          fontFamily: T.fontReading, fontSize: 12, lineHeight: 1.5,
          color: T.textSecondary,
        }}>
          You declared{' '}
          <span style={{ color: TIER_COLORS[declaredTier], fontWeight: 600 }}>
            {capitalize(declaredTier)}
          </span>
          ; the engine read it as{' '}
          <span style={{ color: TIER_COLORS[finalTier], fontWeight: 600 }}>
            {capitalize(finalTier)}
          </span>.
        </div>
      )}
      <a href="#dialecta-comments" style={{
        display: 'inline-block', marginTop: 8,
        fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: T.amber, textDecoration: 'none',
        borderBottom: `1px solid ${T.amber}`, paddingBottom: 1,
      }}>
        Edit while you can →
      </a>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. NEW IN THE CONVERSATION (conditional)
// Renders only when there's a comment posted within the last few minutes.
// Auto-fades out when the arrival ages past ~3 minutes.
// ═══════════════════════════════════════════════════════════════════════════

function NewArrivalCard({ arrival }) {
  if (!arrival) return null;
  const tierColor = TIER_COLORS[arrival.tier] || T.amber;
  const ageMs = Date.now() - new Date(arrival.created_at).getTime();
  const ageMin = Math.max(1, Math.floor(ageMs / 60000));

  return (
    <Card accent={tierColor} label="New in the Conversation">
      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 16, fontWeight: 500, color: T.textPrimary,
        marginBottom: 4,
      }}>
        {arrival.author_name}
      </div>
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: tierColor, marginBottom: 10,
        fontWeight: 600,
      }}>
        {capitalize(arrival.tier)} · {ageMin}m ago
      </div>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 13, lineHeight: 1.6, color: T.textBody,
      }}>
        &ldquo;{arrival.snippet}&rdquo;
      </div>
      <a href="#dialecta-comments" style={{
        display: 'inline-block', marginTop: 10,
        fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: T.amber, textDecoration: 'none',
      }}>
        Read in feed →
      </a>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. THE DELTA
// Pre/post position shifts. The article's actual movement of minds.
// ═══════════════════════════════════════════════════════════════════════════

function DeltaCard({ delta }) {
  if (!delta || delta.declared === 0) return null;
  const { declared, shifted } = delta;
  const pct = Math.round((shifted / declared) * 100);

  return (
    <Card accent={T.cherry} label="The Delta">
      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 26, fontWeight: 500, color: T.textPrimary,
        lineHeight: 1.15, marginBottom: 10,
      }}>
        {shifted} of {declared} <span style={{ color: T.textTertiary, fontStyle: 'normal', fontSize: 16 }}>updated their position</span>
      </div>

      {/* Visual: two stacked bars showing distribution */}
      <DeltaBar before={Math.round(declared * 0.5)} after={Math.round(declared * 0.5) + Math.floor(shifted/2)} total={declared} />

      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary,
        marginTop: 12,
      }}>
        {pct >= 25 ? 'A piece that moved more readers than most.'
          : pct >= 10 ? 'A piece that quietly shifted the room.'
          : 'A piece that confirmed where most readers stood.'}
      </div>
    </Card>
  );
}

function DeltaBar({ before, after, total }) {
  const pctBefore = (before / total) * 100;
  const pctAfter = (after / total) * 100;
  return (
    <div style={{ marginTop: 4 }}>
      <BarRow label="Before reading" value={pctBefore} color={T.textTertiary} />
      <BarRow label="After reading" value={pctAfter} color={T.cherry} />
    </div>
  );
}

function BarRow({ label, value, color }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 8.5, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: T.textTertiary, marginBottom: 2,
      }}>{label}</div>
      <div style={{
        height: 4, background: T.borderLight, borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${value}%`, background: color,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. IN THIS ARTICLE — TOC
// ═══════════════════════════════════════════════════════════════════════════

function TableOfContentsCard({ topicColor }) {
  const { headings, activeId } = useTableOfContents();
  if (headings.length < 3) return null; // Don't show TOC for short articles

  return (
    <Card accent={topicColor || T.amber} label="In This Article">
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {headings.map(h => {
          const isActive = h.id === activeId;
          return (
            <li key={h.id} style={{
              paddingLeft: h.level === 3 ? 14 : 0,
              marginBottom: 6,
            }}>
              <a href={`#${h.id}`} style={{
                fontFamily: T.fontReading,
                fontStyle: isActive ? 'italic' : 'normal',
                fontSize: h.level === 2 ? 13 : 12,
                lineHeight: 1.4,
                color: isActive ? T.brassDeep : T.textSecondary,
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none',
                borderLeft: isActive ? `2px solid ${T.brassWarm}` : '2px solid transparent',
                paddingLeft: 8,
                display: 'block',
                transition: 'color 0.18s, border-color 0.18s',
              }}>
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. THE WRITER
// ═══════════════════════════════════════════════════════════════════════════

function WriterCard({ author, fallbackName }) {
  // Fallback path: when the API doesn't have a Supabase profile for this
  // article's author yet (e.g. articles attributed to the house Ghost
  // user before the byline override is wired), render a minimal version
  // showing the Ghost-side name plus a "profile coming" note. Better
  // than rendering nothing and leaving the sidebar shorter than designed.
  if (!author) {
    if (!fallbackName) return null;
    return (
      <Card accent={T.amber} label="The Writer">
        <div style={{
          fontFamily: T.fontDisplay, fontStyle: 'italic',
          fontSize: 17, fontWeight: 500, color: T.textPrimary,
          marginBottom: 6, lineHeight: 1.15,
        }}>
          {fallbackName}
        </div>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12, lineHeight: 1.55, color: T.textSecondary,
          marginBottom: 8,
        }}>
          Writer profile arriving with the next byline-override pass.
        </div>
        <div style={{
          fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: T.textMuted,
          paddingTop: 8, borderTop: `1px dashed ${T.borderLight}`,
        }}>
          In build
        </div>
      </Card>
    );
  }
  const archetype = author.archetype?.label || 'Pattern Still Forming';
  const order = author.order_label;
  const orderOrnament = author.order_ornament || '✦';
  const initials = (author.display_name || '?')
    .split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';
  const accent = author.color || T.amber;

  return (
    <Card accent={accent} label="The Writer">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <a href={`/profile/?id=${encodeURIComponent(author.ghost_member_id)}`}
           style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
            background: `linear-gradient(135deg, ${author.color || T.brassWarm}, ${author.secondaryColor || T.brassPale})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.fontDisplay, fontStyle: 'italic',
            fontSize: 16, color: '#fff', fontWeight: 500,
          }}>
            {author.avatar_url && !author.avatar_url.includes('d=blank')
              ? <img src={author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
        </a>
        <div style={{ flex: 1, minWidth: 0 }}>
          <a href={`/profile/?id=${encodeURIComponent(author.ghost_member_id)}`}
             style={{
               fontFamily: T.fontDisplay, fontStyle: 'italic',
               fontSize: 17, fontWeight: 500, color: T.textPrimary,
               textDecoration: 'none', display: 'block', lineHeight: 1.15,
             }}>
            {author.display_name || 'Anonymous'}
          </a>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: accent, marginTop: 3,
            fontWeight: 600,
          }}>
            {archetype}
            {order && (
              <>
                <span style={{ color: T.textTertiary, margin: '0 6px' }}>·</span>
                <span style={{ color: T.brassWarm }}>{orderOrnament}</span>{' '}
                {order}
              </>
            )}
          </div>
        </div>
      </div>
      {author.bio && (
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 12, lineHeight: 1.55, color: T.textSecondary,
          marginBottom: 10,
        }}>
          {author.bio.length > 110 ? author.bio.slice(0, 110) + '…' : author.bio}
        </div>
      )}
      <a href={`/profile/?id=${encodeURIComponent(author.ghost_member_id)}`}
         style={{
           fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.10em',
           textTransform: 'uppercase', color: T.amber, textDecoration: 'none',
           borderBottom: `1px solid ${T.amber}`, paddingBottom: 1,
         }}>
        View profile →
      </a>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. A QUOTE
// Rotating curated quote. Pause-on-hover. Fades through ~25s cycle.
// ═══════════════════════════════════════════════════════════════════════════

// QuoteHero: lifted out of card form per design direction. Renders as
// a floating editorial moment at the top of the sidebar — no frame, no
// border, no label. Just a brass ornament, italic Cormorant text at
// hero scale, optional author. Reads like a bookplate above the rest
// of the panel rather than another data card.
function QuoteHero() {
  const { quote, fading, loading, pause, resume } = useQuoteRotator();
  if (loading || !quote) return null;
  const hasAuthor = quote.author && quote.author.trim().length > 0;

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      style={{
        textAlign: 'center',
        padding: '8px 8px 28px',
        marginBottom: 10,
        position: 'relative',
        zIndex: 1,
      }}>
      <div style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${QUOTE_FADE_MS}ms ease`,
      }}>
        {/* Brass ornament — same ❦ used elsewhere, scaled up. */}
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: 24,
          color: T.brassWarm,
          marginBottom: 14,
          letterSpacing: '0.5em',
          textShadow: '0 1px 0 rgba(255,255,255,0.6), 0 2px 1px rgba(74,40,16,0.10)',
        }}>
          ❦
        </div>
        {/* Quote text — hero size, dark charcoal ink for crisp contrast
            on the cream body. Playfair Display Italic (loaded in
            default.hbs) for the more flowing italic strokes — its Q in
            particular has a long descending tail that reads as
            calligraphic without going full script. Cormorant kept as
            fallback. */}
        <div style={{
          fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 1.4vw + 16px, 30px)',
          lineHeight: 1.30,
          color: '#1c1814',
          fontWeight: 500,
          letterSpacing: '0',
          padding: '0 4px',
        }}>
          {quote.text}
        </div>
        {/* Author — only when known. The "Anonymous" fallback was
            generating disappointment instead of anticipation, per the
            design directive. Hide entirely when the quote is unsigned;
            the ornament + italic carry the moment on their own. */}
        {hasAuthor && (
          <div style={{
            marginTop: 14,
            fontFamily: T.fontMono,
            fontSize: 10.5,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: T.textTertiary,
            fontWeight: 500,
          }}>
            <span style={{ color: T.brassWarm, marginRight: 6 }}>—</span>
            {quote.author}
          </div>
        )}
      </div>
      {/* Hairline divider below the hero, pulling visual closure before
          the data cards begin. */}
      <div aria-hidden="true" style={{
        marginTop: 22,
        height: 1,
        background: `linear-gradient(to right, transparent, ${T.brassWarm}, transparent)`,
        opacity: 0.45,
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. THE ARGUMENT — placeholder
// ═══════════════════════════════════════════════════════════════════════════

function ArgumentCard({ articleClaims }) {
  // When article_claims schema is wired through the editor's Declare stage
  // and into the article submission, render real claims here. Until then,
  // a Surface Coming card so the visual rhythm of the sidebar is reviewable
  // with all surfaces in place.
  return (
    <Card accent={T.brassDeep} label="The Argument">
      {articleClaims ? (
        <div>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: T.textTertiary, marginBottom: 6,
          }}>
            Claims
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {articleClaims.claims?.slice(0, 3).map((c, i) => (
              <li key={i} style={{
                fontFamily: T.fontReading, fontStyle: 'italic',
                fontSize: 12.5, lineHeight: 1.55, color: T.textBody,
                marginBottom: 6, paddingLeft: 10, position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', left: 0, top: 6,
                  width: 4, height: 4, borderRadius: '50%',
                  background: T.brassDeep,
                }} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <div style={{
            fontFamily: T.fontReading, fontStyle: 'italic',
            fontSize: 12.5, lineHeight: 1.6, color: T.textSecondary,
            marginBottom: 8,
          }}>
            Surface coming. When articles carry the claims and opinion axes
            their authors declared at submission, this card will show them
            here so readers can engage with the argument before the prose.
          </div>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: T.textMuted,
            paddingTop: 8, borderTop: `1px dashed ${T.borderLight}`,
          }}>
            In build
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. ALSO IN <topic>
// Mocked entries for v1 — when /api/articles?tag=<slug>&limit=3 lands,
// swap in real data. Two hand-picked names so the card doesn't sit empty.
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_RELATED = [
  { author: 'Maya Reiss', title: 'On Doubt and Devotion: When Faith Pauses', slug: 'on-doubt-and-devotion-when-faith-pauses' },
  { author: 'Wen Liu',    title: 'After the Diagnosis',                        slug: 'after-the-diagnosis' },
];

function AlsoInCard({ topicSlug, topicName }) {
  const accent = TOPIC_COLORS[topicSlug] || T.amber;
  return (
    <Card accent={accent} label={topicName ? `Also in ${topicName}` : 'Also In'}>
      {MOCK_RELATED.map((item, i) => (
        <div key={i} style={{
          paddingTop: i === 0 ? 0 : 10,
          marginTop: i === 0 ? 0 : 10,
          borderTop: i === 0 ? 'none' : `1px solid ${T.borderLight}`,
        }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: T.textTertiary, marginBottom: 3,
          }}>
            {item.author}
          </div>
          <a href={`/${item.slug}/`} style={{
            fontFamily: T.fontDisplay, fontStyle: 'italic',
            fontSize: 14.5, lineHeight: 1.25, color: T.textPrimary,
            textDecoration: 'none', display: 'block',
          }}>
            {item.title}
          </a>
        </div>
      ))}
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: T.textMuted,
        paddingTop: 10, marginTop: 10,
        borderTop: `1px dashed ${T.borderLight}`,
      }}>
        Mocked · live feed coming
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LIVE NOW (non-article pages)
// Cross-site activity card — what's happening across Dialecta right now.
// Shows article-named composing activity (anonymous composers, named
// articles) so the sidebar carries a sense of the publication breathing
// even when the viewer isn't on a specific article.
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_LIVE_ACTIVITY = [
  { stage: 'Reflecting', article: 'On the Far Shore of Fear', age: '4m' },
  { stage: 'Drafting', article: 'After the Diagnosis', age: '12m' },
];

function LiveNowCard() {
  return (
    <Card accent={T.brassWarm} label="Live Now">
      {MOCK_LIVE_ACTIVITY.map((item, i) => (
        <div key={i} style={{
          paddingTop: i === 0 ? 0 : 10,
          marginTop: i === 0 ? 0 : 10,
          borderTop: i === 0 ? 'none' : `1px solid ${T.borderLight}`,
        }}>
          <div style={{
            fontFamily: T.fontReading, fontStyle: 'italic',
            fontSize: 13, lineHeight: 1.5, color: T.textBody,
          }}>
            <span style={{ color: T.brassWarm, marginRight: 6 }}>✎</span>
            Someone is <em style={{ color: T.brassDeep, fontWeight: 600, fontStyle: 'normal' }}>{item.stage}</em> on
          </div>
          <div style={{
            fontFamily: T.fontDisplay, fontStyle: 'italic',
            fontSize: 15, fontWeight: 500, color: T.textPrimary,
            marginTop: 3, paddingLeft: 22, lineHeight: 1.25,
          }}>
            {item.article}
          </div>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: T.textTertiary,
            marginTop: 3, paddingLeft: 22,
          }}>
            {item.age} ago
          </div>
        </div>
      ))}
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: T.textMuted,
        paddingTop: 10, marginTop: 12,
        borderTop: `1px dashed ${T.borderLight}`,
      }}>
        Mocked · live signal coming
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECENTLY PUBLISHED (non-article pages)
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_RECENT_ARTICLES = [
  { author: 'Daniel Pennington', title: 'On the Far Shore of Fear', topic: 'psychology_behavior', when: '2 days ago' },
  { author: 'Maya Reiss', title: 'On Doubt and Devotion: When Faith Pauses', topic: 'theology_spirituality', when: '4 days ago' },
];

function RecentlyPublishedCard() {
  return (
    <Card accent={T.cherry} label="Recently Published">
      {MOCK_RECENT_ARTICLES.map((item, i) => {
        const topicColor = TOPIC_COLORS[item.topic] || T.amber;
        return (
          <div key={i} style={{
            paddingTop: i === 0 ? 0 : 12,
            marginTop: i === 0 ? 0 : 12,
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderLight}`,
          }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: topicColor, fontWeight: 600,
              marginBottom: 4,
            }}>
              {item.author}
            </div>
            <div style={{
              fontFamily: T.fontDisplay, fontStyle: 'italic',
              fontSize: 15, lineHeight: 1.25, color: T.textPrimary,
              fontWeight: 500, marginBottom: 4,
            }}>
              {item.title}
            </div>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: T.textTertiary,
            }}>
              {item.when}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEWARDS TODAY (non-article pages)
// Active Stewards in the conversation, brass ornament + name + Order.
// Mocked entries match the existing seed contributors so the card has
// real-feeling data even before the leaderboard endpoint exists.
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_STEWARDS = [
  { name: 'Maya Reiss',           order: 'Memoirist',    ornament: '✥' },
  { name: 'Wen Liu',              order: 'Theorist',     ornament: '✪' },
  { name: 'Father Anselm Okafor', order: 'Glossator',    ornament: '❦' },
];

function StewardsCard() {
  return (
    <Card accent={T.brassDeep} label="Stewards Today">
      {MOCK_STEWARDS.map((s, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'baseline', gap: 10,
          paddingTop: i === 0 ? 0 : 8,
          marginTop: i === 0 ? 0 : 8,
          borderTop: i === 0 ? 'none' : `1px solid ${T.borderLight}`,
        }}>
          <span style={{
            color: T.brassWarm, fontSize: 16, lineHeight: 1, flexShrink: 0,
            fontFamily: T.fontDisplay,
          }}>{s.ornament}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: T.fontDisplay, fontStyle: 'italic',
              fontSize: 14, fontWeight: 500, color: T.textPrimary,
              lineHeight: 1.2,
            }}>
              {s.name}
            </div>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: T.brassDeep,
              marginTop: 2,
            }}>
              {s.order}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. PATRON OF THIS ARTICLE
// Sponsorship slot. While the platform is in build mode this renders a
// placeholder card with an "In build" badge (same vocabulary as the
// Argument and Also-In placeholders) so the sidebar rhythm is reviewable
// with all surfaces present. When real patrons arrive:
//   1. Set SPONSOR_MODE = 'live' below
//   2. Replace SAMPLE_SPONSORSHIP with the real entry, or pull from
//      a future /api/sponsorships?slot=sidebar endpoint
//   3. The "In build" badge auto-disappears in 'live' mode.
// To hide the card entirely (no placeholder during a focused review),
// set SPONSOR_MODE = 'off'.
// ═══════════════════════════════════════════════════════════════════════════

const SPONSOR_MODE = 'preview'; // 'preview' | 'live' | 'off'

const SAMPLE_SPONSORSHIP = {
  name: 'The Margin Press',
  tagline: 'Books for slow readers. A small press.',
  href: 'https://example.com',
};

function PatronCard() {
  if (SPONSOR_MODE === 'off') return null;
  const isPreview = SPONSOR_MODE === 'preview';
  const sponsor = SAMPLE_SPONSORSHIP;
  return (
    <Card accent={T.brassWarm} label="Patron of This Article">
      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 16, fontWeight: 500, color: T.textPrimary,
        marginBottom: 4,
      }}>
        {sponsor.name}
      </div>
      <div style={{
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 12.5, lineHeight: 1.55, color: T.textSecondary,
        marginBottom: 10,
      }}>
        {sponsor.tagline}
      </div>
      <a href={sponsor.href} rel="sponsored noopener" target="_blank" style={{
        fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: T.amber, textDecoration: 'none',
        borderBottom: `1px solid ${T.amber}`, paddingBottom: 1,
      }}>
        Visit →
      </a>
      {isPreview && (
        <div style={{
          fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: T.textMuted,
          paddingTop: 10, marginTop: 12,
          borderTop: `1px dashed ${T.borderLight}`,
        }}>
          Sample placement · in build
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR ROOT (desktop)
// ═══════════════════════════════════════════════════════════════════════════

export default function DialectaSidebar({
  articleId,
  articleSlug,
  authorMemberId,
  authorName,
  primaryTagSlug,
  primaryTagName,
  articleClaims,
}) {
  // Article-aware: when articleId is present, this is a post page and we
  // render the full stack with article-specific cards (Delta, TOC, Writer,
  // Argument, Also-In). When it isn't (homepage, articles feed, profile,
  // any other page), we render the global cards only (Pulse with site
  // signals, Quote, Patron). The stack stays consistent visually so the
  // sidebar reads as a single instrument across the whole site.
  const isArticle = !!articleId;
  const pulse = usePulse(articleId || 'site-global');
  const author = useArticleAuthor(authorMemberId);
  const topicColor = TOPIC_COLORS[primaryTagSlug] || T.amber;

  return (
    <div className="dialecta-sidebar-root" style={{
      display: 'flex', flexDirection: 'column',
      paddingTop: 0,
    }}>
      {/* Quote at the very top — hero moment, no card frame. Replaces
          the old QuoteCard slot mid-stack. Sets the tone before any
          data lands. */}
      <QuoteHero />
      <PulseCard pulse={pulse} isArticle={isArticle} />
      {isArticle && pulse?.your_malleable && <YourCommentCard malleable={pulse.your_malleable} />}
      {isArticle && pulse?.latest_arrival && <NewArrivalCard arrival={pulse.latest_arrival} />}
      {isArticle && <DeltaCard delta={pulse?.delta} />}
      {isArticle && <TableOfContentsCard topicColor={topicColor} />}
      {isArticle && <WriterCard author={author} fallbackName={authorName} />}
      {isArticle && <ArgumentCard articleClaims={articleClaims} />}
      {isArticle && <AlsoInCard topicSlug={primaryTagSlug} topicName={primaryTagName} />}
      {/* Non-article pages get the cross-site companion cards so the
          sidebar carries genuine ambient texture across the publication
          (Profile, Articles feed, Community, Stewards, etc.) instead
          of a thin two-card stack. */}
      {!isArticle && <LiveNowCard />}
      {!isArticle && <RecentlyPublishedCard />}
      {!isArticle && <StewardsCard />}
      <PatronCard />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE INLINE COMPONENTS — surfaced via separate mounts in post.hbs
// ═══════════════════════════════════════════════════════════════════════════

// Mobile TOC: a <details> disclosure at the top of the article body.
// Closed by default. Tapping the summary expands the heading list.
export function DialectaSidebarMobileTOC() {
  const { headings, activeId } = useTableOfContents();
  if (headings.length < 3) return null;

  return (
    <details style={{
      backgroundColor: T.paper,
      backgroundImage: T.paperGrain,
      border: `1px solid ${T.borderLight}`,
      borderLeft: `3px solid ${T.amber}`,
      borderRadius: 6,
      padding: '10px 14px',
      marginBottom: 24,
      fontFamily: T.fontReading,
    }}>
      <summary style={{
        fontFamily: T.fontMono, fontSize: 10.5, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: T.amber, fontWeight: 600,
        cursor: 'pointer', listStyle: 'none', userSelect: 'none',
      }}>
        In this article ↓
      </summary>
      <ul style={{ listStyle: 'none', margin: '12px 0 4px', padding: 0 }}>
        {headings.map(h => (
          <li key={h.id} style={{
            paddingLeft: h.level === 3 ? 14 : 0,
            marginBottom: 6,
          }}>
            <a href={`#${h.id}`} style={{
              fontFamily: T.fontReading,
              fontStyle: h.id === activeId ? 'italic' : 'normal',
              fontSize: h.level === 2 ? 14 : 13,
              lineHeight: 1.4,
              color: h.id === activeId ? T.brassDeep : T.textSecondary,
              textDecoration: 'none',
              borderLeft: h.id === activeId ? `2px solid ${T.brassWarm}` : '2px solid transparent',
              paddingLeft: 8,
              display: 'block',
            }}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

// Mobile Quote: an inline quote at the end of the article body, just
// above the "The Conversation" transition. Mirrors the desktop QuoteHero
// treatment — no card frame, just the brass ornament + hero italic.
export function DialectaSidebarMobileQuote() {
  const { quote, fading, loading, pause, resume } = useQuoteRotator();
  if (loading || !quote) return null;
  const hasAuthor = quote.author && quote.author.trim().length > 0;

  return (
    <div onMouseEnter={pause} onMouseLeave={resume} style={{
      margin: '40px auto 28px',
      maxWidth: 540,
      textAlign: 'center',
      padding: '0 16px',
    }}>
      <div style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${QUOTE_FADE_MS}ms ease`,
      }}>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 22, color: T.brassWarm,
          marginBottom: 14, letterSpacing: '0.5em',
        }}>
          ❦
        </div>
        <div style={{
          fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 4.2vw, 28px)',
          lineHeight: 1.35,
          color: '#1c1814',
          fontWeight: 500,
        }}>
          {quote.text}
        </div>
        {hasAuthor && (
          <div style={{
            marginTop: 16,
            fontFamily: T.fontMono, fontSize: 10.5, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: T.textTertiary, fontWeight: 500,
          }}>
            <span style={{ color: T.brassWarm, marginRight: 6 }}>—</span>
            {quote.author}
          </div>
        )}
      </div>
    </div>
  );
}
