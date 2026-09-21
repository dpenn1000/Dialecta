/**
 * Fixed inputs for the development-only fingerprint lab. Data, not maths.
 *
 * The three demo contributors are copies of their axis_scores rows as read on
 * mguulnibvzusfvyuowwh on 2026-09-21. They are fixtures (profiles.is_seed),
 * not people. They carry tier mixes and no topic history, which is why they
 * render in axis fallback colour.
 *
 * The recovered mock is USER.fingerprint from
 * _recovered-next/lib/theme/dialecta-profile.jsx: the one v2 example with
 * topic history, so it is the one that shows ring hue and a topic-coloured halo.
 *
 * The Early example is the shape the three real contributors with axis rows
 * have today, two or three graduations per pillar, built by hand rather than
 * copied from any one of them.
 */
import type { FingerprintData } from '@dialecta/core';

export interface LabExample {
  key: string;
  /** Salted like a real profile, so each example has its own texture. */
  salt: string;
  resonance: number;
  data: FingerprintData;
}

export const DEMO_CONTRIBUTORS: LabExample[] = [
  {
    key: 'maya-reiss',
    salt: '11111111-1111-4111-8111-111111111111',
    resonance: 0.58,
    data: {
      acuity: { graduations: 14, tierMix: { echo: 1, forum: 10, spark: 3 } },
      reach: { graduations: 9, tierMix: { fog: 1, echo: 1, forum: 4, spark: 3 } },
      calibration: { graduations: 17, tierMix: { echo: 1, forum: 13, spark: 3 } },
      magnanimity: { graduations: 15, tierMix: { echo: 1, forum: 12, spark: 2 } },
      discourse: { graduations: 5, tierMix: { echo: 1, forum: 2, spark: 2 } },
      consistency: { graduations: 11, tierMix: { fog: 1, echo: 1, forum: 7, spark: 2 } },
    },
  },
  {
    key: 'wen-zhao',
    salt: '22222222-2222-4222-8222-222222222222',
    resonance: 0.54,
    data: {
      acuity: { graduations: 9, tierMix: { echo: 1, forum: 5, spark: 3 } },
      reach: { graduations: 16, tierMix: { fog: 1, echo: 1, forum: 9, spark: 5 } },
      calibration: { graduations: 9, tierMix: { fog: 1, echo: 1, forum: 4, spark: 3 } },
      magnanimity: { graduations: 10, tierMix: { fog: 1, echo: 1, forum: 5, spark: 3 } },
      discourse: { graduations: 17, tierMix: { echo: 1, heat: 5, forum: 6, spark: 3, stance: 2 } },
      consistency: { graduations: 19, tierMix: { echo: 2, forum: 13, spark: 4 } },
    },
  },
  {
    key: 'father-anselm-okafor',
    salt: '33333333-3333-4333-8333-333333333333',
    resonance: 0.65,
    data: {
      acuity: { graduations: 19, tierMix: { echo: 1, forum: 15, spark: 3 } },
      reach: { graduations: 4, tierMix: { forum: 3, spark: 1 } },
      calibration: { graduations: 11, tierMix: { fog: 1, echo: 1, forum: 7, spark: 2 } },
      magnanimity: { graduations: 15, tierMix: { fog: 1, echo: 1, forum: 11, spark: 2 } },
      discourse: { graduations: 13, tierMix: { fog: 1, heat: 2, forum: 8, spark: 2 } },
      consistency: { graduations: 12, tierMix: { fog: 1, echo: 1, forum: 8, spark: 2 } },
    },
  },
];

export const RECOVERED_MOCK: LabExample = {
  key: 'recovered-mock',
  salt: 'recovered-mock',
  resonance: 0.62,
  data: {
    acuity: {
      graduations: 18,
      tierMix: { forum: 14, spark: 3, echo: 1 },
      topicPhases: [
        { topic: 'society_culture', count: 7 },
        { topic: 'psychology_behavior', count: 6 },
        { topic: 'politics_governance', count: 5 },
      ],
    },
    calibration: {
      graduations: 16,
      tierMix: { forum: 12, spark: 3, echo: 1 },
      topicPhases: [
        { topic: 'economics', count: 8 },
        { topic: 'politics_governance', count: 5 },
        { topic: 'society_culture', count: 3 },
      ],
    },
    magnanimity: {
      graduations: 19,
      tierMix: { forum: 16, spark: 2, echo: 1 },
      topicPhases: [
        { topic: 'politics_governance', count: 9 },
        { topic: 'society_culture', count: 7 },
        { topic: 'theology_spirituality', count: 3 },
      ],
    },
    discourse: {
      graduations: 14,
      tierMix: { forum: 6, spark: 4, echo: 1, heat: 2, stance: 1 },
      topicPhases: [
        { topic: 'psychology_behavior', count: 6 },
        { topic: 'society_culture', count: 5 },
        { topic: 'health_medicine', count: 3 },
      ],
    },
    consistency: {
      graduations: 17,
      tierMix: { forum: 13, spark: 3, echo: 1 },
      topicPhases: [
        { topic: 'society_culture', count: 8 },
        { topic: 'economics', count: 5 },
        { topic: 'arts_humanities', count: 4 },
      ],
    },
    reach: {
      graduations: 11,
      tierMix: { forum: 5, spark: 3, echo: 2, fog: 1 },
      topicPhases: [
        { topic: 'society_culture', count: 5 },
        { topic: 'politics_governance', count: 4 },
        { topic: 'theology_spirituality', count: 2 },
      ],
    },
  },
};

export const NEWBORN: LabExample = { key: 'newborn', salt: 'newborn', resonance: 0, data: {} };

export const EARLY: LabExample = {
  key: 'early',
  salt: 'early',
  resonance: 0,
  data: {
    acuity: { graduations: 2, tierMix: { forum: 2 } },
    reach: {
      graduations: 2,
      tierMix: { forum: 2 },
      topicPhases: [
        { topic: 'economics', count: 1 },
        { topic: 'psychology_behavior', count: 1 },
      ],
    },
    calibration: { graduations: 2, tierMix: { forum: 2 } },
    magnanimity: { graduations: 2, tierMix: { forum: 2 } },
    discourse: { graduations: 0, tierMix: {} },
    consistency: { graduations: 3, tierMix: { forum: 2, echo: 1 } },
  },
};
