/**
 * /contributor/<handle> — Server Component page.
 *
 * Server-fetches the profile bundle, merges into the `user` shape the
 * theme's <DialectaProfile> expects, and renders the same component
 * the theme renders client-side. Same component, server-rendered for
 * SEO and first paint, hydrates to interactive on the client.
 *
 * This is the Phase 3 spike. The data fetcher (lib/get-profile) calls
 * the legacy dialecta-api during the migration window; Phase 4 swaps
 * to a direct Supabase query.
 */

import { notFound } from 'next/navigation';
import { getProfileByHandle } from '@/lib/get-profile';
import { mergeProfileWithGhost } from '@/lib/theme/dialecta-profile-data-pure.js';
import DialectaProfile from '@/lib/theme/dialecta-profile.jsx';

const SITE_URL = 'https://library.dialecta.org';

// ─── Metadata (OG, Twitter card, canonical) ──────────────────────────────

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const apiData = await getProfileByHandle(handle);

  if (!apiData) {
    return {
      title: 'Contributor not found',
      robots: { index: false },
    };
  }

  const name = apiData.display_name || 'Contributor';
  const bio = apiData.bio || `${name} is a contributor on Dialecta.`;
  const url = `${SITE_URL}/contributor/${encodeURIComponent(handle)}`;

  return {
    title: `${name} (@${handle})`,
    description: bio,
    alternates: { canonical: url },
    openGraph: {
      title: `${name} on Dialecta`,
      description: bio,
      url,
      type: 'profile',
      images: apiData.avatar_url ? [{ url: apiData.avatar_url }] : [],
      siteName: 'Dialecta',
    },
    twitter: {
      card: 'summary',
      title: `${name} on Dialecta`,
      description: bio,
      images: apiData.avatar_url ? [apiData.avatar_url] : [],
    },
    robots: apiData.is_seed ? { index: false } : undefined,
  };
}

// ─── Page render ─────────────────────────────────────────────────────────

export default async function ContributorPage({ params }) {
  const { handle } = await params;
  const apiData = await getProfileByHandle(handle);
  if (!apiData) notFound();

  // The theme's mergeProfileWithGhost expects a Ghost member object
  // alongside the API data. Cross-profile views (which is what an SSR
  // page always is — a public/SEO surface) pass a stub: we don't know
  // the visitor's session here, so isOwnProfile=false, and we don't
  // attempt to render any own-profile-only chrome.
  const ghostStub = {
    id: apiData.ghost_member_id,
    name: apiData.display_name || '',
    email: '',
    avatar_image: apiData.avatar_url || '',
    created_at: '',
    is_author: !!apiData.is_author,
  };

  const user = mergeProfileWithGhost(apiData, ghostStub, false);

  return (
    <DialectaProfile
      user={user}
      viewerGhostId=""
      isOwnProfile={false}
      withChrome={false}
    />
  );
}
