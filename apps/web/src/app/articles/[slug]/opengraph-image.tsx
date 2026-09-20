import { ImageResponse } from 'next/og';
import { getPublishedArticle, isSupabaseConfigured } from '@/lib/articles';
import { strings } from '@/strings';

export const alt = strings.site.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * The card carries the article, not a judgement about the person who wrote
 * it: title and byline only, in the author's own words and name. No tier
 * badge and no fingerprint-derived descriptor, ever, on this or any card.
 * Legal and philosopher ruled on this independently and agreed:
 * exchange/open/2026-09-20-circulation-01-blindspot-share-card-off-platform-exposure.md,
 * council/philosopher/positions/2026-09-20-path-to-launch.md. The basis for
 * a tier label lives beside it on the article page itself; a card served
 * to a stranger on Facebook or X carries the image alone, with nothing for
 * that reader to check a classification claim against.
 */
function card(title: string, byline: string | null) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#f7f2e8',
          padding: '72px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#8c4a2f',
          }}
        >
          {strings.site.name}
        </div>
        <div
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
            fontSize: title.length > 70 ? 54 : 68,
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#1c1814',
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', width: 56, height: 4, backgroundColor: '#d4a84a', marginRight: 20 }} />
          <div style={{ display: 'flex', fontSize: 28, color: '#5a5248' }}>{byline ?? strings.site.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}

export default async function Image({ params }: ImageProps) {
  try {
    const { slug } = await params;
    if (!isSupabaseConfigured()) {
      return card(strings.site.name, null);
    }
    const article = await getPublishedArticle(slug);
    if (!article) {
      return card(strings.site.name, null);
    }
    return card(article.title, article.author?.display_name ?? null);
  } catch {
    return card(strings.site.name, null);
  }
}
