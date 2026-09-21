import 'server-only';

/**
 * The Thinking Fingerprint, drawn on the server. The default for every figure
 * that does not change after the page loads: /fingerprint's stages,
 * archetypes and textures, the profile hero, the fingerprint lab.
 *
 * It ships no JavaScript and hydrates nothing. The figure is planned by
 * planFingerprint and drawn by renderFingerprintSvg, both in @dialecta/core,
 * through ./figure.ts, and arrives as markup inside a plain <svg>; React
 * hydrates that one element and never walks its contents. `server-only` makes
 * importing this from a client component a build error, so a figure cannot
 * slip back into the browser by accident. A figure that changes on the client
 * is ./FingerprintClient.tsx instead, which draws the same markup.
 *
 * useId is the one hook here, and a server one: React numbers it per render,
 * so two figures on a page never share a filter, gradient or clip id. The
 * engine learned why at its lines 101-110: two fingerprints with shared ids
 * clipped each other to the wrong silhouette.
 *
 * The halo is three strokes of the silhouette with fill none, plus two more
 * clipped inside it, and its widths and blurs follow the figure's size. It is
 * never a filled shape; see planHalo in core.
 */
import { useId } from 'react';
import { fingerprintSvgProps, type FingerprintProps } from './figure';

export function Fingerprint(props: FingerprintProps) {
  const id = useId();
  return <svg {...fingerprintSvgProps(props, id)} />;
}
