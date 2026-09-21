import type { Metadata } from 'next';
import { fingerprintSalt } from '@dialecta/core';
import { Rich } from '@/components/content/rich';
import { Fingerprint } from '@/components/fingerprint';
import { strings } from '@/strings';
import { fingerprintLabel } from '../profile/_lib/view';
import { ContributorCarousel, type CarouselContributor } from './_components/contributor-carousel';
import { ARCHETYPES, CONTRIBUTORS, STAGES, TEXTURES } from './_lib/examples';
import styles from './fingerprint.module.css';

const t = strings.fingerprintPage;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
};

type PersonKey = keyof typeof t.contributors.people;
type StageKey = keyof typeof t.stages.items;
type ArchetypeKey = keyof typeof t.archetypes.items;
type TextureKey = keyof typeof t.texture.items;

/**
 * /fingerprint, The Living Fingerprint: _theme/page-fingerprint.hbs, the page
 * the shell nav already links to. Four sections under the hero (three
 * contributors, the stages of growth, the eight archetypes, the texture pair)
 * and the page's own colophon.
 *
 * Every fingerprint here is drawn live by the components/fingerprint island
 * from planFingerprint in @dialecta/core, at FINGERPRINT_RENDER's current
 * values. The live page drew the carousel with the recovered engine and showed
 * the other fourteen as PNGs baked from it. That engine is retired by the port
 * ruling (docs/FINGERPRINT.md), so a Council change to FINGERPRINT_RENDER now
 * reaches every figure on this page at once, with nothing to re-bake.
 *
 * The example data is ./_lib/examples.ts: the fingerprint lab's fixtures where
 * one exists, and the April data sets ported where none does. The carousel is
 * the only client state; everything else is server-rendered.
 */
export default function FingerprintPage() {
  const c = t.contributors;
  const contributors: CarouselContributor[] = CONTRIBUTORS.flatMap((ex) => {
    const person = c.people[ex.key as PersonKey];
    if (!person) return [];
    return [
      {
        key: ex.key,
        name: person.name,
        archetype: person.archetype,
        bio: person.bio,
        salt: fingerprintSalt(ex.salt),
        resonance: ex.resonance,
        data: ex.data,
        label: fingerprintLabel(person.name, ex.data),
      },
    ];
  });

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>{t.eyebrow}</div>
        <h1 className={styles.title}>
          <Rich text={t.heading} />
        </h1>
        <p className={styles.lede}>{t.lede}</p>
        <div className={styles.rule} aria-hidden="true" />
      </header>

      {/* 01, three contributors: the live page's React carousel. */}
      <section className={styles.section} aria-labelledby="fp-contributors">
        <div className={styles.sectionHeadCentered}>
          <div className={styles.sectionLabel}>{c.label}</div>
          <h2 id="fp-contributors" className={styles.sectionTitle}>
            {c.title}
          </h2>
          <p className={styles.sectionDesc}>{c.desc}</p>
        </div>
        <ContributorCarousel
          contributors={contributors}
          copy={{ kicker: c.kicker, heading: c.heading, intro: c.intro, pickLabel: c.pickLabel, about: c.about }}
        />
      </section>

      {/* 02, stages of growth. */}
      <section className={styles.section} aria-labelledby="fp-stages">
        <div className={styles.sectionLabel}>{t.stages.label}</div>
        <h2 id="fp-stages" className={styles.sectionTitle}>
          {t.stages.title}
        </h2>
        <p className={styles.sectionDesc}>{t.stages.desc}</p>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.stageGrid}>
          {STAGES.map((ex) => {
            const item = t.stages.items[ex.key as StageKey];
            if (!item) return null;
            return (
              <article key={ex.key} className={styles.card}>
                <Fingerprint
                  data={ex.data}
                  size={180}
                  showLabels={false}
                  showAxisLines={false}
                  resonance={ex.resonance}
                  salt={fingerprintSalt(ex.salt)}
                  label={item.alt}
                  className={styles.stageFig}
                />
                <div className={styles.stageText}>
                  <div className={styles.sublabel}>{item.count}</div>
                  <h3 className={styles.stageTitle}>{item.title}</h3>
                  <p className={styles.stageDesc}>{item.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 03, how to read a fingerprint: the eight archetypes. */}
      <section className={styles.section} aria-labelledby="fp-archetypes">
        <div className={styles.sectionLabel}>{t.archetypes.label}</div>
        <h2 id="fp-archetypes" className={styles.sectionTitle}>
          {t.archetypes.title}
        </h2>
        <p className={styles.sectionDesc}>{t.archetypes.desc}</p>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.archGrid}>
          {ARCHETYPES.map((ex) => {
            const item = t.archetypes.items[ex.key as ArchetypeKey];
            if (!item) return null;
            return (
              <article key={ex.key} className={styles.card}>
                {/* The baker's render: 400 without labels, axis lines on, shown at 200. */}
                <Fingerprint
                  data={ex.data}
                  size={400}
                  showLabels={false}
                  resonance={ex.resonance}
                  salt={fingerprintSalt(ex.salt)}
                  label={item.alt}
                  className={styles.archFig}
                />
                <div>
                  <div className={styles.sublabel}>{t.archetypes.sublabel}</div>
                  <h3 className={styles.archTitle}>{item.title}</h3>
                  <p className={styles.archDesc}>{item.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 04, reading the texture. */}
      <section className={styles.section} aria-labelledby="fp-texture">
        <div className={styles.sectionLabel}>{t.texture.label}</div>
        <h2 id="fp-texture" className={styles.sectionTitle}>
          {t.texture.title}
        </h2>
        <p className={styles.sectionDesc}>
          <Rich text={t.texture.desc} />
        </p>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.texGrid}>
          {TEXTURES.map((ex) => {
            const item = t.texture.items[ex.key as TextureKey];
            if (!item) return null;
            return (
              <article key={ex.key} className={`${styles.card} ${styles.texCard}`}>
                <Fingerprint
                  data={ex.data}
                  size={240}
                  showLabels={false}
                  showAxisLines={false}
                  resonance={ex.resonance}
                  salt={fingerprintSalt(ex.salt)}
                  label={item.alt}
                  className={styles.texFig}
                />
                <div className={styles.sublabel}>{item.label}</div>
                <h3 className={styles.texTitle}>{item.title}</h3>
                <p className={styles.texDesc}>{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className={styles.colophon}>
        <div className={styles.colophonName}>{t.colophon.name}</div>
        <div className={styles.colophonEdition}>{t.colophon.edition}</div>
        <div className={styles.colophonTag}>{t.colophon.tag}</div>
      </footer>
    </main>
  );
}
