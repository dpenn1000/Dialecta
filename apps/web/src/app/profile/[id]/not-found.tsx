import { strings } from '@/strings';

export default function ProfileNotFound() {
  return (
    <main>
      <h1>{strings.profile.notFoundHeading}</h1>
      <p className="notice">{strings.profile.notFound}</p>
    </main>
  );
}
