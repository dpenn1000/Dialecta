/**
 * Next.js config for dialecta-next.
 *
 * This project is the migration target for the older dialecta-api repo.
 * It owns the API routes plus the new SEO-surface SSR pages
 * (/contributor/<handle>, /quote/<slug>, /sitemap.xml, /robots.txt) on
 * library.dialecta.org. Magic Pages continues to host dialecta.org for
 * articles + member auth + the Pact.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force the OG-image function bundles to include /assets/fonts/.
  // Without this, the [handle] dynamic segment defeats Next.js's
  // automatic asset tracing (vercel/next.js#48081) and the readFile
  // call inside opengraph-image.js fails with ENOENT at runtime.
  //
  // Key is the route's source path (no extension); value is glob(s)
  // relative to the project root.
  outputFileTracingIncludes: {
    'app/contributor/[handle]/opengraph-image':           ['./assets/fonts/**/*'],
    'app/quote/[slug]/opengraph-image':                   ['./assets/fonts/**/*'],
    'app/article/[slug]/opengraph-image':                 ['./assets/fonts/**/*', './public/branding/**/*'],
    'app/comment/[id]/opengraph-image':                   ['./assets/fonts/**/*'],
    'app/contributor/[handle]/moment/[id]/opengraph-image': [
      './assets/fonts/**/*',
      './public/og-backgrounds/**/*',
      './public/branding/**/*',
    ],
  },

  // Avatar and image sources we may render via next/image. Keeping the
  // patterns wide enough to cover Magic Pages, Gravatar (member fallback),
  // and Ghost-served avatars.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.dialecta.org' },
      { protocol: 'https', hostname: 'dialecta.org' },
      { protocol: 'https', hostname: '*.mymagic.page' },
      { protocol: 'https', hostname: 'gravatar.com' },
      { protocol: 'https', hostname: '*.gravatar.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // Cache headers for SEO surfaces. Per-page caching can be tightened
  // later via `revalidate` exports on individual pages; this is the
  // baseline.
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default nextConfig;
