import { ImageResponse } from 'next/og';
import { strings } from '@/strings';

export const alt = strings.site.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Site-wide share card: the fallback for every route that does not carry
 * its own (today, everything except /articles/[slug]). Colors are the
 * literal hex values behind --bg-primary, --text-primary, --text-secondary
 * and --gold in src/styles/tokens.css. Satori (next/og's renderer) has no
 * document to read CSS custom properties from, so the values are copied
 * here rather than referenced. If tokens.css changes, check this file.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #a8a398 0%, #8c8780 22%, #f7f2e8 88%, #f7f2e8 100%)',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: -2,
            color: '#1c1814',
          }}
        >
          {strings.site.name}
        </div>
        <div
          style={{
            display: 'flex',
            width: 140,
            height: 4,
            backgroundColor: '#d4a84a',
            marginTop: 32,
            marginBottom: 32,
          }}
        />
        <div
          style={{
            display: 'flex',
            width: 820,
            fontSize: 34,
            color: '#5a5248',
            textAlign: 'center',
            justifyContent: 'center',
          }}
        >
          {strings.site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
