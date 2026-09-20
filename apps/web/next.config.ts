import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @dialecta/core ships TypeScript source; let Next compile it in place.
  transpilePackages: ['@dialecta/core'],
  // isomorphic-dompurify (lib/sanitize-html.ts) carries jsdom, which builds
  // a DOM shim through dynamic requires the bundler cannot follow safely.
  // Required via Node's own require at runtime instead of being bundled.
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
};

export default nextConfig;
