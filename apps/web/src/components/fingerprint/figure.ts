/**
 * One Thinking Fingerprint, as the attributes of its <svg> element. Shared by
 * the server component (./Fingerprint.tsx) and the client wrapper
 * (./FingerprintClient.tsx), and neither: no directive, no hooks, no fetch.
 *
 * planFingerprint in @dialecta/core plans the figure and renderFingerprintSvg
 * draws it as markup. This module only binds the two to this app: the topic
 * palette, and the class names in fingerprint.module.css that carry the chrome
 * tokens. The <svg> element itself stays a React element, so its class, size
 * and accessible label are React's to write and escape; its contents are the
 * renderer's markup, which React sets without walking it.
 */
import {
  planFingerprint,
  renderFingerprintSvg,
  type Axis,
  type FingerprintData,
  type FingerprintRenderParams,
  type FingerprintSvgClasses,
} from '@dialecta/core';
import { TOPICS } from '@/lib/topics';
import styles from './fingerprint.module.css';

export interface FingerprintProps {
  data: FingerprintData;
  /** Geometry size in px; the drawn frame adds the label margin each side. Engine default 360. */
  size?: number | undefined;
  showLabels?: boolean | undefined;
  showAxisLines?: boolean | undefined;
  /** 0 to 1, `profiles.resonance`. Zero draws no halo. */
  resonance?: number | undefined;
  /** `fingerprintSalt(profileId)`, so each contributor's texture is their own. */
  salt?: number | undefined;
  newRingAxis?: Axis | null | undefined;
  /** The accessible description. Callers build it from strings.ts. */
  label: string;
  /** A replacement for FINGERPRINT_RENDER, for a tuning pass. */
  params?: FingerprintRenderParams | undefined;
  /** A CSS-module lookup is string | undefined under noUncheckedIndexedAccess, so both are accepted. */
  className?: string | undefined;
}

/** The chrome's classes. The stylesheet colours them from tokens.css and reads --ring-opacity through `ring`. */
const CLASSES: FingerprintSvgClasses = {
  guide: styles.guide ?? '',
  guideNewborn: styles.guideNewborn ?? '',
  axisLine: styles.axisLine ?? '',
  anchorDot: styles.anchorDot ?? '',
  anchorRing: styles.anchorRing ?? '',
  label: styles.label ?? '',
  halo: styles.halo ?? '',
  ring: styles.ring ?? '',
  grow: styles.grow ?? '',
};

/**
 * Everything the figure's <svg> element takes. `idSuffix` must be unique on
 * the page: every id in the figure's <defs> carries it, because SVG filter,
 * gradient and clip ids are document-wide and collide across figures. Both
 * callers pass useId(), which React keeps unique per render and stable from
 * the server render to hydration.
 */
export function fingerprintSvgProps(props: FingerprintProps, idSuffix: string) {
  const plan = planFingerprint(props.data, {
    size: props.size ?? 360,
    showLabels: props.showLabels ?? true,
    showAxisLines: props.showAxisLines ?? true,
    resonance: props.resonance ?? 0,
    salt: props.salt ?? 0,
    newRingAxis: props.newRingAxis ?? null,
    topics: TOPICS,
    ...(props.params ? { params: props.params } : {}),
  });
  const svg = renderFingerprintSvg(plan, { idSuffix, classes: CLASSES });
  return {
    className: [styles.svg, props.className].filter(Boolean).join(' '),
    width: svg.width,
    height: svg.height,
    viewBox: svg.viewBox,
    role: 'img',
    'aria-label': props.label,
    dangerouslySetInnerHTML: { __html: svg.markup },
  } as const;
}
