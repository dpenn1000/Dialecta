interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  return (
    <main>
      <h1>Contributor profile</h1>
      <p>
        Profile placeholder for contributor {id}. Implements docs/Dialecta_Contributor_Identity.md, with the
        Thinking Fingerprint from docs/Dialecta_Growth_Scroll.md.
      </p>
    </main>
  );
}
