/**
 * The canonical nav icons, ported from the SVG sprite at the top of
 * _theme/default.hbs ("Final picks (2026-04-28)"). The live theme defined them
 * once as <symbol>s and a script injected a <use> into every nav link after
 * render, matched by href or label. Here each link names its icon directly, so
 * neither the sprite nor the matching script survives, only the geometry,
 * which is copied path for path.
 *
 * Every icon strokes and fills with currentColor; the stylesheet sets the
 * colour (brass on the sub-bar and in the drawer). All are decorative: the
 * link's own label carries the meaning, so each renders aria-hidden.
 *
 * No 'use client': the drawer (a client component) and the footer (a server
 * component) both import this module.
 */

export type NavIconKey =
  | 'codex'
  | 'triangle'
  | 'compassstar'
  | 'asterismseal'
  | 'fingerprint'
  | 'guidebook'
  | 'italicI';

interface IconProps {
  size: number;
  className?: string;
}

function Svg({ size, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Articles: an open codex. */
function Codex() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 7 L4 8 L4 19 L12 18 Z" />
      <path d="M12 7 L20 8 L20 19 L12 18 Z" />
      <line x1="12" y1="7" x2="12" y2="18" />
      <line x1="6" y1="11" x2="10" y2="10.5" strokeWidth={0.7} />
      <line x1="6" y1="13.5" x2="10" y2="13" strokeWidth={0.7} />
      <line x1="14" y1="10.5" x2="18" y2="11" strokeWidth={0.7} />
      <line x1="14" y1="13" x2="18" y2="13.5" strokeWidth={0.7} />
    </g>
  );
}

/** Community: three dots in conversation. */
function Triangle() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.2}>
      <circle cx="6" cy="8" r="2.4" fill="currentColor" />
      <circle cx="18" cy="8" r="2.4" fill="currentColor" />
      <circle cx="12" cy="17" r="2.4" fill="currentColor" />
      <path d="M8.2 8 Q12 5.5 15.8 8" strokeLinecap="round" />
      <path d="M7 10.2 Q9 14.5 10.6 15.5" strokeLinecap="round" />
      <path d="M17 10.2 Q15 14.5 13.4 15.5" strokeLinecap="round" />
    </g>
  );
}

/** Stewards: an eight point compass star, no circle. */
function CompassStar() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round">
      <path d="M12 3 L13 11 L11 11 Z" fill="currentColor" stroke="none" />
      <path d="M12 21 L13 13 L11 13 Z" fill="currentColor" stroke="none" />
      <path d="M21 12 L13 13 L13 11 Z" fill="currentColor" stroke="none" />
      <path d="M3 12 L11 13 L11 11 Z" fill="currentColor" stroke="none" />
      <path d="M18.4 5.6 L13 12 L12 11 Z" strokeWidth={1} />
      <path d="M5.6 5.6 L11 11 L12 12 Z" strokeWidth={1} />
      <path d="M18.4 18.4 L13 12 L12 13 Z" strokeWidth={1} />
      <path d="M5.6 18.4 L11 13 L12 12 Z" strokeWidth={1} />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </g>
  );
}

/** The Pact: a wax seal with an asterism inside. */
function AsterismSeal() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.4}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6.5" strokeWidth={0.7} strokeDasharray="0.8 0.8" />
      <circle cx="9" cy="10.5" r="1.3" fill="currentColor" />
      <circle cx="15" cy="10.5" r="1.3" fill="currentColor" />
      <circle cx="12" cy="14.5" r="1.3" fill="currentColor" />
    </g>
  );
}

/** The Living Fingerprint: three nested rings. */
function Fingerprint() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.3}>
      <ellipse cx="12" cy="12" rx="3" ry="4" />
      <ellipse cx="12" cy="12" rx="5.5" ry="7" strokeWidth={1} />
      <ellipse cx="12" cy="12" rx="8" ry="10" strokeWidth={0.7} />
    </g>
  );
}

/** Guidebook: a ruled page with a ribbon. */
function Guidebook() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="17" rx="0.5" />
      <line x1="6" y1="7" x2="18" y2="7" strokeWidth={0.8} />
      <line x1="9" y1="11" x2="15" y2="11" strokeWidth={0.8} />
      <line x1="9" y1="14" x2="14" y2="14" strokeWidth={0.8} />
      <line x1="9" y1="17" x2="13" y2="17" strokeWidth={0.8} />
      <path d="M14 4 L14 10 L15 8.7 L16 10 L16 4 Z" fill="currentColor" stroke="none" />
    </g>
  );
}

/** About: a Cormorant italic lowercase i. */
function ItalicI() {
  return (
    <text
      x="12"
      y="20"
      fontFamily="'Cormorant Garamond', Georgia, serif"
      fontStyle="italic"
      fontWeight={500}
      fontSize={26}
      textAnchor="middle"
      fill="currentColor"
    >
      i
    </text>
  );
}

const GLYPHS: Record<NavIconKey, () => React.JSX.Element> = {
  codex: Codex,
  triangle: Triangle,
  compassstar: CompassStar,
  asterismseal: AsterismSeal,
  fingerprint: Fingerprint,
  guidebook: Guidebook,
  italicI: ItalicI,
};

export function NavIcon({ name, size, className }: IconProps & { name: NavIconKey }) {
  const Glyph = GLYPHS[name];
  return (
    <Svg size={size} {...(className ? { className } : {})}>
      <Glyph />
    </Svg>
  );
}

/** The mobile asterism strip's centre mark: three dots joined by a curve (i-strip-curve). */
export function StripCurveIcon({ size, className }: IconProps) {
  return (
    <Svg size={size} {...(className ? { className } : {})}>
      <g fill="none" stroke="currentColor" strokeWidth={1}>
        <circle cx="5" cy="11" r="1.3" fill="currentColor" />
        <circle cx="19" cy="11" r="1.3" fill="currentColor" />
        <circle cx="12" cy="15" r="1.3" fill="currentColor" />
        <path d="M6.3 11 Q12 8.5 17.7 11" strokeLinecap="round" />
      </g>
    </Svg>
  );
}

/**
 * The drawer toggle. The live theme used the text glyph U+2630, which falls
 * back to whatever system font carries it; three drawn lines render the same
 * on every platform.
 */
export function MenuIcon({ size, className }: IconProps) {
  return (
    <Svg size={size} {...(className ? { className } : {})}>
      <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
        <line x1="5" y1="7" x2="19" y2="7" />
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="5" y1="17" x2="19" y2="17" />
      </g>
    </Svg>
  );
}

export function CloseIcon({ size, className }: IconProps) {
  return (
    <Svg size={size} {...(className ? { className } : {})}>
      <g fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </g>
    </Svg>
  );
}
