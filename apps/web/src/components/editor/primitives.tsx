'use client';

/**
 * The writer's shared primitives, ported from dialecta-editor.jsx:
 * Label (551-563), AutoSaveIndicator (569-602), the three button style
 * objects (816-850, 2111-2122), FocusableTextarea (1264-1282), TierBadge
 * (1284-1312), BrassButton (2128-2167) and OptionCard (2740-2824).
 *
 * Each kept its markup and behaviour. What changed is where the look lives:
 * the recovered versions carried per-component hover and pressed state in
 * useState and mutated element.style on focus. Those states are CSS now
 * (writer.css), which removes a re-render per hover and lets keyboard focus
 * get the same treatment as the mouse.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { tierName, type Tier } from '@dialecta/core';
import { strings } from '@/strings';

export function Label({ children, tone }: { children: ReactNode; tone?: 'gold' | 'terra' }) {
  const toneClass = tone === 'gold' ? ' dw-label--gold' : tone === 'terra' ? ' dw-label--terra' : '';
  return <div className={`dw-label${toneClass}`}>{children}</div>;
}

export function StageOpener({
  label,
  heading,
  sub,
  large = false,
  labelTone,
}: {
  label: ReactNode;
  heading: ReactNode;
  sub?: ReactNode;
  large?: boolean;
  labelTone?: 'gold' | 'terra';
}) {
  return (
    <div className="dw-opener">
      <Label {...(labelTone ? { tone: labelTone } : {})}>{label}</Label>
      <h1 className={large ? 'dw-h1 dw-h1--large' : 'dw-h1'}>{heading}</h1>
      {sub ? <div className="dw-sub">{sub}</div> : null}
    </div>
  );
}

type ButtonVariant = 'primary' | 'outline' | 'accent' | 'ghost';

export function Button({
  variant,
  children,
  onClick,
  disabled = false,
  type = 'button',
}: {
  variant: ButtonVariant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className={`dw-btn dw-btn--${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

/** Reserved for the publish moment. Lifted by the recovered editor from page-pact.hbs. */
export function BrassButton({
  children,
  onClick,
  disabled = false,
  loading = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      className="dw-brass-button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-busy={loading}
    >
      {loading ? strings.writer.final.publishing : children}
    </button>
  );
}

export function FocusableTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  id?: string;
}) {
  return (
    <textarea
      id={id}
      className="dw-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

/**
 * The tier colours are the generated --tier-* tokens, passed in through custom
 * properties, so no tier hex is written in this file. The recovered badge
 * carried seven literal hex quartets (lines 127-142); designer found that same
 * palette copy-pasted as literals in five files.
 */
function tierVars(tier: Tier): CSSProperties {
  return {
    ['--dw-tier-top' as string]: `var(--tier-${tier}-top)`,
    ['--dw-tier-bot' as string]: `var(--tier-${tier}-bot)`,
    ['--dw-tier-border' as string]: `var(--tier-${tier}-border)`,
    ['--dw-tier-text' as string]: `var(--tier-${tier}-text)`,
  } as CSSProperties;
}

export function TierBadge({
  tier,
  selected = false,
  onClick,
}: {
  tier: Tier;
  selected?: boolean;
  onClick?: () => void;
}) {
  const label = strings.writer.tierLabel(tierName(tier));
  if (!onClick) {
    return (
      <span className="dw-tier" data-static="true" style={tierVars(tier)}>
        {label}
      </span>
    );
  }
  return (
    <button type="button" className="dw-tier" style={tierVars(tier)} aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );
}

export function OptionCard({
  kicker,
  title,
  lede,
  footer,
  onClick,
}: {
  kicker: string;
  title: string;
  lede: string;
  footer: string;
  onClick: () => void;
}) {
  // A real <button>, where the recovered card was a div with role="button"
  // and a hand-written Enter and Space handler.
  return (
    <button type="button" className="dw-option" onClick={onClick}>
      <span className="dw-option-kicker">{kicker}</span>
      <span className="dw-option-title">{title}</span>
      <span className="dw-option-lede">{lede}</span>
      <span className="dw-option-footer">{footer}</span>
    </button>
  );
}

export function SaveIndicator({ savedAt }: { savedAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const style: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontStyle: 'italic',
    letterSpacing: '0.03em',
    color: savedAt ? 'var(--tertiary)' : 'var(--text-muted)',
  };

  if (!savedAt) return <div style={style}>{strings.writer.save.never}</div>;

  const seconds = Math.max(0, Math.floor((now - savedAt) / 1000));
  const label =
    seconds < 5
      ? strings.writer.save.justNow
      : seconds < 60
        ? strings.writer.save.seconds(seconds)
        : strings.writer.save.minutes(Math.floor(seconds / 60));

  return <div style={style}>{label}</div>;
}
