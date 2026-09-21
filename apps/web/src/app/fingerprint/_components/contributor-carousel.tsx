'use client';

/**
 * Section 01's three-contributor carousel: pick a contributor, see their
 * fingerprint and their bio. The live HeroCarousel in
 * _recovered-next/lib/theme/fingerprint-page-mount.jsx (lines 85-163), which
 * kept one live Fingerprint and switched its data, as this does.
 *
 * What changed, and why:
 *  - No fetch. The live carousel asked /api/profile/seed:* on mount and showed
 *    a loading card until it answered. The rows arrive as props from the
 *    server page, which reads the fingerprint lab's fixtures.
 *  - The tier mix survives. The live mount handed the engine `tierMix: {}` on
 *    every axis (its line 23, and docs/FINGERPRINT.md "The three live
 *    fingerprints run on the fallback"), so none of the three could show
 *    turbulence, clarity or saturation. These rows keep theirs.
 *  - Real buttons with aria-pressed. The live picks were divs with
 *    role="button" and a click handler only, so a keyboard could reach them
 *    and not press them.
 *  - Size by CSS. The live component re-rendered at 380 or 200 from a
 *    matchMedia hook, which a server render cannot know. Both sizes are drawn
 *    and the stylesheet shows one at the live breakpoint, 1100px, so the first
 *    paint is already the right one.
 *
 * Its two figures are the only ones on the page drawn by FingerprintClient,
 * since a pick changes their data; every other figure is the server
 * component and hydrates nothing.
 *
 * Every string arrives as a prop, so this island does not ship strings.ts.
 */
import { useState } from 'react';
import type { FingerprintData } from '@dialecta/core';
import { FingerprintClient } from '@/components/fingerprint/FingerprintClient';
import styles from '../fingerprint.module.css';

export interface CarouselContributor {
  key: string;
  name: string;
  archetype: string;
  bio: string;
  /** fingerprintSalt of the fixture's salt, computed on the server. */
  salt: number;
  resonance: number;
  data: FingerprintData;
  /** The fingerprint's accessible description. */
  label: string;
}

export interface CarouselCopy {
  kicker: string;
  heading: string;
  intro: string;
  pickLabel: string;
  about: string;
}

export function ContributorCarousel({
  contributors,
  copy,
}: {
  contributors: readonly CarouselContributor[];
  copy: CarouselCopy;
}) {
  const [activeKey, setActiveKey] = useState(contributors[0]?.key ?? '');
  const active = contributors.find((c) => c.key === activeKey) ?? contributors[0];
  if (!active) return null;

  return (
    <div className={styles.carousel}>
      <div className={styles.picker}>
        <div className={styles.pickerKicker}>{copy.kicker}</div>
        <h3 className={styles.pickerHeading}>{copy.heading}</h3>
        <p className={styles.pickerIntro}>{copy.intro}</p>
        <div className={styles.pickerList} role="group" aria-label={copy.pickLabel}>
          {contributors.map((c) => (
            <button
              key={c.key}
              type="button"
              className={styles.pick}
              aria-pressed={c.key === active.key}
              onClick={() => setActiveKey(c.key)}
            >
              <span className={styles.pickName}>{c.name}</span>
              <span className={styles.pickArchetype}>{c.archetype}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.carouselFigure}>
        <FingerprintClient
          data={active.data}
          size={380}
          resonance={active.resonance}
          salt={active.salt}
          label={active.label}
          className={styles.carouselWide}
        />
        <FingerprintClient
          data={active.data}
          size={200}
          resonance={active.resonance}
          salt={active.salt}
          label={active.label}
          className={styles.carouselNarrow}
        />
        <div className={styles.about}>
          <div className={styles.aboutLabel}>{copy.about}</div>
          <p className={styles.aboutBio} aria-live="polite">
            {active.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
