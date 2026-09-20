/**
 * SSR page for /quote/<slug>.
 *
 * Closes the human-click loop on OG-2: when someone shares a Dialecta
 * quote on Facebook or Twitter, bots get the OG image (rendered by
 * sibling opengraph-image.js) and humans land here. The page renders
 * the quote in the editorial brass-and-cream register, with a soft
 * link back into the wider Dialecta surface.
 *
 * Architecture: this is a Server Component. It fetches via
 * `getQuoteBySlug` (direct Supabase query) on every request; CDN
 * caching handles repeats. No client-side hydration cost beyond the
 * sitewide chrome already mounted in app/layout.js.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuoteBySlug } from '@/lib/get-quote';

// Phase 6 will swap this to library.dialecta.org once the DNS is wired
// (tracked as a Phase 3-polish todo). Until then, vercel.app is fine
// for OG card URL generation and metadata canonicals.
const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dialecta-next.vercel.app';

// ─── Metadata (used by Next for <head>) ──────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const quote = await getQuoteBySlug(slug);
  if (!quote) {
    return {
      title: 'Quote not found · Dialecta',
      robots: { index: false, follow: false },
    };
  }

  const author = quote.author || 'Dialecta Library';
  const text   = quote.text || '';
  const desc   = text.length > 200 ? text.slice(0, 197).trim() + '…' : text;
  const title  = `“${desc.length > 70 ? desc.slice(0, 67) + '…' : desc}” — ${author}`;
  const url    = `${SITE_BASE}/quote/${quote.quote_id}`;
  const ogImg  = `${SITE_BASE}/quote/${quote.quote_id}/opengraph-image`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      type: 'article',
      url,
      siteName: 'Dialecta',
      images: [{ url: ogImg, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImg],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────

const T = {
  cream:     '#f7f2e8',
  paper:     '#fefcf5',
  ink:       '#2c2620',
  body:      '#3a342c',
  soft:      '#5a5248',
  tertiary:  '#8c8780',
  brassDeep: '#7a4a10',
  brassMid:  '#b8862e',
  brassPale: '#f5dfa0',
  border:    '#e0dbd2',
};

function buildAttributionParts(author, source, year) {
  const parts = [];
  if (author) parts.push(author);
  if (source) parts.push(source);
  if (year) parts.push(String(year));
  return parts;
}

export default async function QuotePage({ params }) {
  const { slug } = await params;
  const quote = await getQuoteBySlug(slug);
  if (!quote) notFound();

  const text = quote.text || '';
  const attribution = buildAttributionParts(quote.author, quote.source, quote.year);

  // JSON-LD Quotation schema. Helps search engines surface the quote
  // as a structured-data result and gives downstream consumers
  // (citation tools, browser readers) a clean machine-readable copy.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'Quotation',
    text,
    ...(quote.author ? { creator: { '@type': 'Person', name: quote.author } } : {}),
    ...(quote.source ? { isPartOf: { '@type': 'CreativeWork', name: quote.source } } : {}),
    ...(quote.year ? { datePublished: String(quote.year) } : {}),
    url: `${SITE_BASE}/quote/${quote.quote_id}`,
  };

  return (
    <article style={{
      maxWidth: 880,
      margin:   '0 auto',
      padding:  'clamp(40px, 6vw, 96px) clamp(20px, 4vw, 48px) 96px',
      fontFamily: 'var(--font-source-serif), Georgia, serif',
      color: T.body,
    }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Kicker */}
      <div style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize:      13,
        letterSpacing: '0.32em',
        color:         T.brassMid,
        textTransform: 'uppercase',
        marginBottom:  32,
      }}>
        Dialecta · Quote
      </div>

      {/* Quote glyph */}
      <div style={{
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontStyle:  'italic',
        fontSize:   'clamp(120px, 16vw, 200px)',
        lineHeight: 0.6,
        color:      T.brassMid,
        marginBottom: 8,
      }} aria-hidden="true">
        “
      </div>

      {/* Quote text */}
      <blockquote style={{
        margin:  0,
        padding: 0,
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontStyle:  'italic',
        fontSize:   'clamp(28px, 4.4vw, 52px)',
        lineHeight: 1.22,
        color:      T.brassDeep,
      }}>
        {text}
      </blockquote>

      {/* Attribution */}
      {attribution.length > 0 && (
        <div style={{
          marginTop:  48,
          paddingTop: 24,
          borderTop:  `1px solid ${T.border}`,
          fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
          fontSize:   14,
          letterSpacing: '0.16em',
          color:      T.soft,
          textTransform: 'uppercase',
        }}>
          {attribution.join(' · ')}
        </div>
      )}

      {/* Soft footer link back to dialecta.org. Editorial register: a
          single quiet line, no aggressive nav. */}
      <div style={{
        marginTop: 64,
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontStyle:  'italic',
        fontSize:   18,
        color:      T.tertiary,
      }}>
        <Link
          href="https://dialecta.org/"
          style={{ color: T.brassMid, textDecoration: 'none', borderBottom: `1px solid ${T.brassPale}` }}>
          Read more on Dialecta
        </Link>
      </div>
    </article>
  );
}
