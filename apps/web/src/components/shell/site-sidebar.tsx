/**
 * The persistent right rail: default.hbs's #dialecta-sidebar, moved out of
 * post.hbs into the shell so it persists across every page
 * (_theme/assets/css/style.css:1773-1787, quoted in
 * council/designer/research/2026-09-21-live-vs-localhost/REPORT.md finding 2).
 *
 * Ports the non-article branch of
 * _recovered-next/lib/theme/dialecta-sidebar.jsx's DialectaSidebar: a Quote,
 * then On Dialecta (PulseCard with isArticle=false), Live Now, Recently
 * Published, Stewards Today, in that render order. The article-only cards
 * (Your Comment, New in the Conversation, Delta, In This Article, The
 * Writer, The Argument, Also In) are a different, unbuilt feature (finding 3,
 * the reading-stage bar and Declare mechanic) and are not here. Patron of
 * This Article is not in the designer's finding or its fix list either, and
 * is left out rather than assumed.
 *
 * Server component, rendered once per request from layout.tsx and handed to
 * RailShell as a prop. Only getRecentlyPublished does live I/O; everything
 * else here is synchronous.
 */
import Link from 'next/link';
import { isTopicSlug, TOPICS } from '@/lib/topics';
import { strings } from '@/strings';
import { getRecentlyPublished, type RecentArticle } from './site-sidebar-data';

const s = strings.shell.rail;

function topicColor(topic: string | null): string | undefined {
  if (!topic) return undefined;
  if (isTopicSlug(topic)) return TOPICS[topic].color;
  const wanted = topic.trim().toLowerCase();
  const match = Object.values(TOPICS).find((t) => t.label.toLowerCase() === wanted);
  return match?.color;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function RailCard({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: 'warm' | 'deep';
  children: React.ReactNode;
}) {
  return (
    <div className="rail-card" data-accent={accent ?? 'warm'}>
      <div className="rail-card-label">{label}</div>
      {children}
    </div>
  );
}

function MockedNote({ children }: { children: React.ReactNode }) {
  return <div className="rail-mocked-note">{children}</div>;
}

/** Quote at the top, no card frame, matching QuoteHero's hero treatment in the recovered component. */
function QuoteBlock() {
  const quotes = s.quotes;
  // Indexed by a runtime-computed position, so TS can't confirm it is in
  // bounds from the literal array length alone (noUncheckedIndexedAccess).
  // It always is: quotes is a fixed, non-empty list.
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  if (!quote) return null;
  return (
    <div className="rail-quote">
      <div className="rail-quote-ornament" aria-hidden="true">
        &#10086;
      </div>
      <p className="rail-quote-text">&ldquo;{quote.text}&rdquo;</p>
      {quote.author ? <div className="rail-quote-author">{quote.author}</div> : null}
      <div className="rail-quote-rule" aria-hidden="true" />
    </div>
  );
}

/**
 * PulseCard's isArticle=false branch. Live showed active_readers /
 * active_composers / stewards_reading from generateMockPulse without saying
 * so; the Council ruling on this exact function
 * (council/log/2026-09-20-port-or-rewrite.md: "generateMockPulse deleted or
 * replaced with a real endpoint, not shipped as fabricated data") is why this
 * shows a description and the same disclosure Live Now already used, instead
 * of invented numbers.
 */
function OnDialectaCard() {
  return (
    <RailCard label={s.onDialecta.label}>
      <p className="rail-card-body">{s.onDialecta.description}</p>
      <MockedNote>{s.onDialecta.mockedNote}</MockedNote>
    </RailCard>
  );
}

/**
 * Live shows two made-up activity lines here. The port-or-rewrite ruling
 * (dialecta-sidebar.jsx row) says mock pulse data is not shipped, so the
 * card keeps its label and the note until presence is real.
 */
function LiveNowCard() {
  return (
    <RailCard label={s.liveNow.label}>
      <MockedNote>{s.liveNow.mockedNote}</MockedNote>
    </RailCard>
  );
}

function RecentArticleRow({ article }: { article: RecentArticle }) {
  const date = formatDate(article.publishedAt);
  const color = topicColor(article.topic);
  return (
    <div className="rail-recent-item">
      {article.authorName ? (
        <div className="rail-recent-author" style={color ? ({ '--topic': color } as React.CSSProperties) : undefined}>
          {article.authorName}
        </div>
      ) : null}
      <Link href={`/articles/${article.slug}`} className="rail-recent-title">
        {article.title}
      </Link>
      {date ? <div className="rail-recent-date">{date}</div> : null}
    </div>
  );
}

async function RecentlyPublishedCard() {
  const articles = await getRecentlyPublished(3);
  return (
    <RailCard label={s.recentlyPublished.label} accent="deep">
      {articles.length === 0 ? (
        <p className="rail-card-body">{s.recentlyPublished.empty}</p>
      ) : (
        articles.map((article) => <RecentArticleRow key={article.id} article={article} />)
      )}
    </RailCard>
  );
}

/**
 * MOCK_STEWARDS in the recovered component named real seed contributors as
 * "active today" with no disclosure. Presence is not wired (same gap as
 * On Dialecta above), so this carries the same disclosure rather than
 * implying these three are reading right now.
 */
function StewardsCard() {
  return (
    <RailCard label={s.stewardsToday.label} accent="deep">
      {s.stewardsToday.stewards.map((steward) => (
        <div className="rail-steward-item" key={steward.name}>
          <div className="rail-steward-name">{steward.name}</div>
          <div className="rail-steward-order">{steward.order}</div>
        </div>
      ))}
      <MockedNote>{s.stewardsToday.mockedNote}</MockedNote>
    </RailCard>
  );
}

export function SiteSidebar() {
  return (
    <div className="rail-stack">
      <QuoteBlock />
      <OnDialectaCard />
      <LiveNowCard />
      <RecentlyPublishedCard />
      <StewardsCard />
    </div>
  );
}
