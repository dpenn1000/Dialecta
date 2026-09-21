'use client';

/**
 * The Thinking Fingerprint, drawn in the browser. Only for a figure whose data
 * changes after the page loads; today that is the /fingerprint carousel, which
 * switches contributors on a click. Every other figure is the server component
 * in ./Fingerprint.tsx and hydrates nothing.
 *
 * It draws exactly what the server component draws (the same plan, the same
 * markup, through ./figure.ts), so the first paint is server-rendered and the
 * browser redraws only when the props change. React sets the figure's markup
 * as one string rather than reconciling some 2,500 elements, so a switch costs
 * one plan and one parse.
 */
import { useId, useMemo } from 'react';
import { fingerprintSvgProps, type FingerprintProps } from './figure';

export function FingerprintClient({
  data,
  size,
  showLabels,
  showAxisLines,
  resonance,
  salt,
  newRingAxis,
  label,
  params,
  className,
}: FingerprintProps) {
  const id = useId();
  const svg = useMemo(
    () =>
      fingerprintSvgProps(
        { data, size, showLabels, showAxisLines, resonance, salt, newRingAxis, label, params, className },
        id,
      ),
    [data, size, showLabels, showAxisLines, resonance, salt, newRingAxis, label, params, className, id],
  );
  return <svg {...svg} />;
}
