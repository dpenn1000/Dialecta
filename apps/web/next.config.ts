import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @dialecta/core ships TypeScript source; let Next compile it in place.
  transpilePackages: ['@dialecta/core'],
};

export default nextConfig;
