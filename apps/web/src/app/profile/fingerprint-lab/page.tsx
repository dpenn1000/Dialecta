/**
 * /profile/fingerprint-lab: the profile's fingerprint renderer on fixed
 * inputs. Development only; production answers 404.
 *
 * Two reasons it exists. The profile route cannot show a demo fingerprint on
 * a machine without SUPABASE_SERVICE_ROLE_KEY (see ../_lib/data.ts), and the
 * Council's fingerprint debate needs one page where a change to
 * FINGERPRINT_RENDER can be seen on every stage at once, at profile size and
 * at avatar size.
 *
 * The static segment shadows a contributor whose handle is
 * "fingerprint-lab"; that profile is still reachable by its id.
 */
import { notFound } from 'next/navigation';
import { fingerprintSalt } from '@dialecta/core';
import { Fingerprint } from '@/components/fingerprint';
import { strings } from '@/strings';
import { fingerprintCaption, fingerprintLabel } from '../_lib/view';
import styles from '../_components/profile.module.css';
import { DEMO_CONTRIBUTORS, EARLY, NEWBORN, RECOVERED_MOCK, type LabExample } from './examples';

export const dynamic = 'force-dynamic';

const L = strings.profile.lab;

function titleFor(ex: LabExample): { title: string; note: string } {
  if (ex.key === RECOVERED_MOCK.key) return { title: L.mock, note: L.mockNote };
  if (ex.key === NEWBORN.key) return { title: L.newborn, note: L.newbornNote };
  if (ex.key === EARLY.key) return { title: L.early, note: L.earlyNote };
  return { title: strings.profile.handle(ex.key), note: L.demoNote(ex.resonance) };
}

export default async function FingerprintLab({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.NODE_ENV === 'production') notFound();
  const all = [...DEMO_CONTRIBUTORS, RECOVERED_MOCK, EARLY, NEWBORN];

  // ?example=<key>&size=<px> draws one example alone, large, for close reading.
  const { example, size } = await searchParams;
  const one = typeof example === 'string' ? all.find((ex) => ex.key === example) : undefined;
  if (one) {
    const px = Math.max(120, Math.min(1200, Number(typeof size === 'string' ? size : '') || 640));
    const { title } = titleFor(one);
    return (
      <main className={styles.page}>
        <Fingerprint
          data={one.data}
          size={px}
          resonance={one.resonance}
          salt={fingerprintSalt(one.salt)}
          label={fingerprintLabel(title, one.data)}
          className={styles.labSingle}
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={`${styles.brassCard} ${styles.panel}`}>
        <h1 className={styles.sectionHeading}>{L.title}</h1>
        <p className={styles.quiet} style={{ marginTop: 10 }}>
          {L.intro}
        </p>
      </section>

      <div className={styles.labGrid}>
        {all.map((ex) => {
          const { title, note } = titleFor(ex);
          return (
            <section key={ex.key} className={`${styles.paperCard} ${styles.labCard}`}>
              <h2 className={styles.eyebrow}>{title}</h2>
              <p className={styles.quiet}>{note}</p>
              <div className={styles.fpFrame}>
                <Fingerprint
                  data={ex.data}
                  size={296}
                  resonance={ex.resonance}
                  salt={fingerprintSalt(ex.salt)}
                  label={fingerprintLabel(title, ex.data)}
                />
              </div>
              <p className={styles.fpCaption}>{fingerprintCaption(ex.data, true)}</p>
            </section>
          );
        })}
      </div>

      <section className={`${styles.paperCard} ${styles.labCard}`}>
        <h2 className={styles.eyebrow}>{L.small}</h2>
        <div className={styles.labSmallRow}>
          {all.map((ex) => (
            <Fingerprint
              key={ex.key}
              data={ex.data}
              size={120}
              showLabels={false}
              showAxisLines={false}
              resonance={ex.resonance}
              salt={fingerprintSalt(ex.salt)}
              label={fingerprintLabel(titleFor(ex).title, ex.data)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
