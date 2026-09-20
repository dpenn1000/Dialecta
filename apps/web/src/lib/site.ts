/**
 * The site's own canonical origin. dialecta.org is the permanent domain:
 * Ghost serves it until cutover (docs/decisions/ADR-001-leave-ghost.md),
 * then this app takes over the same address. sitemap.ts, robots.ts and the
 * article route's generateMetadata all need an absolute URL, and none of
 * them run with a request to read a host from (compare src/app/login/actions.ts,
 * which derives an origin from request headers because it has one).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dialecta.org').replace(/\/$/, '');
