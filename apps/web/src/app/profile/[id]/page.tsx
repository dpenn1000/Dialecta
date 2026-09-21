/**
 * /profile/[id]: a contributor's profile and Thinking Fingerprint.
 *
 * Implements docs/Dialecta_Contributor_Identity.md (the pillars, the
 * fingerprint, the archetypes and the aspirational mechanic) with the layout
 * of _recovered-next/lib/theme/dialecta-profile.jsx, which the Council ruled
 * comes over as-is. [id] is profiles.id; a handle works too.
 *
 * Every read lives in ../_lib/data.ts. This file only decides between the
 * notice, a 404 and the page.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { strings } from '@/strings';
import { isProfileDataConfigured, loadProfilePage } from '../_lib/data';
import { displayName } from '../_lib/view';
import { ProfileView } from '../_components/ProfileView';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const TABS = new Set(['engagement', 'about', 'influences', 'articles']);

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  if (!isProfileDataConfigured()) return {};
  const { id } = await params;
  const data = await loadProfilePage(id).catch(() => null);
  if (!data) return { title: strings.profile.notFoundHeading };
  const name = displayName(data.profile.displayName);
  const bio = data.profile.bio;
  return {
    title: name,
    description: bio
      ? bio.length > 160
        ? `${bio.slice(0, 157).trimEnd()}...`
        : bio
      : strings.profile.metaDescription(name),
  };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { id } = await params;

  if (!isProfileDataConfigured()) {
    return (
      <main>
        <p className="notice">{strings.notices.supabaseNotConfigured}</p>
      </main>
    );
  }

  const data = await loadProfilePage(id);
  if (!data) notFound();

  const tab = (await searchParams).tab;
  const initialTab = typeof tab === 'string' && TABS.has(tab) ? tab : 'engagement';

  return <ProfileView data={data} initialTab={initialTab} dev={process.env.NODE_ENV !== 'production'} />;
}
