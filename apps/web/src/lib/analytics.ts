/**
 * Plausible Analytics integration point.
 *
 * Ghost's own analytics disappear at the Ghost cutover (ADR-001) with
 * nothing named to replace them (council/circulation/research/2026-plausible-analytics-tool.md).
 * Left unwired, the first strangers a shared article ever reaches go
 * uncounted permanently, the cohort circulation's launch plan names as the
 * most valuable one the site will ever get. Plausible captures arrivals by
 * source, referrers and standard utm_source, utm_medium and utm_campaign
 * params, out of the box, with no cookie and no consent banner.
 *
 * Nothing loads until NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, so this ships
 * inert by default. See apps/web/.env.example for the two ways to fill it
 * in, and apps/web/CLAUDE.md, "Analytics," for what that choice requires
 * from Dan directly. This file does not choose between them.
 */
export interface PlausibleConfig {
  domain: string;
  scriptSrc: string;
}

const DEFAULT_SCRIPT_SRC = 'https://plausible.io/js/script.js';

export function getPlausibleConfig(): PlausibleConfig | null {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) {
    return null;
  }
  const scriptSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC ?? DEFAULT_SCRIPT_SRC;
  return { domain, scriptSrc };
}
