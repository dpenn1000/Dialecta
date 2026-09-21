'use client';

/**
 * The archetype badge, the aspiration pill, and the archetype modal behind
 * them. Ported from the badge row and ArchetypeSelector in dialecta-profile.jsx.
 *
 * Two modes, where the recovered component had one:
 *
 *   own profile  The recovered selector: pick an aspiration, clear it. Nothing
 *                in apps/web writes profiles.aspirational_archetype yet, so a
 *                pick is local state and the modal says so. The recovered
 *                PATCH to /api/profile trusted a member id from the client
 *                and is not ported.
 *   visitor      A read-only guide to the eight archetypes. The recovered
 *                page showed "+ Set aspiration" on everyone's profile to
 *                everyone; a visitor now sees the pill only when an
 *                aspiration is declared, and reads the guidance instead.
 *
 * Every string arrives as a prop, so strings.ts stays out of the client bundle.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Archetype } from '@dialecta/core';
import styles from './profile.module.css';

export interface ArchetypeCopy {
  id: Archetype;
  label: string;
  icon: string;
  desc: string;
  guidance: string;
  /** "Moving toward The Reviser", built on the server: a function cannot cross into an island. */
  toward: string;
}

export interface ArchetypeControlsCopy {
  platformChip: string;
  formingLabel: string;
  aspiringTo: string;
  setAspiration: string;
  open: string;
  eyebrowOwn: string;
  eyebrow: string;
  heading: string;
  introOwn: string;
  intro: string;
  assignedOwn: string;
  assigned: string;
  locked: string;
  hint: string;
  clear: string;
  done: string;
  close: string;
  notSaved: string;
}

interface Props {
  assigned: Archetype | null;
  aspirational: Archetype | null;
  archetypes: ArchetypeCopy[];
  isOwn: boolean;
  copy: ArchetypeControlsCopy;
}

export function ArchetypeControls({ assigned, aspirational: initialAspiration, archetypes, isOwn, copy }: Props) {
  const [open, setOpen] = useState(false);
  const [aspiration, setAspiration] = useState<Archetype | null>(initialAspiration);
  const [changed, setChanged] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);

  const byId = (id: Archetype | null) => (id ? (archetypes.find((a) => a.id === id) ?? null) : null);
  const assignedCopy = byId(assigned);
  const aspirationCopy = byId(aspiration);

  const show = (from: HTMLButtonElement) => {
    opener.current = from;
    setOpen(true);
  };
  const hide = useCallback(() => {
    setOpen(false);
    opener.current?.focus();
  }, []);

  return (
    <>
      <div className={styles.badgeRow}>
        <button
          type="button"
          className={styles.archetypeBadge}
          onClick={(e) => show(e.currentTarget)}
          aria-haspopup="dialog"
          title={copy.open}
        >
          {assignedCopy ? (
            <span className={styles.archetypeIcon} aria-hidden="true">
              {assignedCopy.icon}
            </span>
          ) : null}
          {assignedCopy ? assignedCopy.label : copy.formingLabel}
          <span className={styles.platformChip}>{copy.platformChip}</span>
        </button>

        {aspirationCopy ? (
          <button
            type="button"
            className={styles.aspirationPill}
            onClick={(e) => show(e.currentTarget)}
            aria-haspopup="dialog"
          >
            {copy.aspiringTo} · <span className={styles.aspirationLabel}>{aspirationCopy.label}</span>
          </button>
        ) : isOwn ? (
          <button
            type="button"
            className={`${styles.aspirationPill} ${styles.aspirationUnset}`}
            onClick={(e) => show(e.currentTarget)}
            aria-haspopup="dialog"
          >
            + {copy.setAspiration}
          </button>
        ) : null}
      </div>

      {open
        ? createPortal(
            <ArchetypeModal
              assigned={assignedCopy}
              aspiration={aspirationCopy}
              archetypes={archetypes}
              isOwn={isOwn}
              copy={copy}
              changed={changed}
              onSelect={(a) => {
                setAspiration(a);
                setChanged(true);
              }}
              onClose={hide}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function ArchetypeModal({
  assigned,
  aspiration,
  archetypes,
  isOwn,
  copy,
  changed,
  onSelect,
  onClose,
}: {
  assigned: ArchetypeCopy | null;
  aspiration: ArchetypeCopy | null;
  archetypes: ArchetypeCopy[];
  isOwn: boolean;
  copy: ArchetypeControlsCopy;
  changed: boolean;
  onSelect: (a: Archetype | null) => void;
  onClose: () => void;
}) {
  const [focused, setFocused] = useState<ArchetypeCopy | null>(null);
  const titleId = useId();
  const dialog = useRef<HTMLDivElement | null>(null);
  const detail = focused ?? aspiration ?? (isOwn ? null : assigned);

  useEffect(() => {
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialog}
        className={`${styles.dialog} dialecta-paper`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.eyebrow}>{isOwn ? copy.eyebrowOwn : copy.eyebrow}</p>
        <h2 id={titleId} className={styles.dialogHeading}>
          {copy.heading}
        </h2>
        <p className={styles.dialogIntro}>{isOwn ? copy.introOwn : copy.intro}</p>

        {assigned ? (
          <div className={styles.assigned}>
            <div className={styles.assignedIcon} aria-hidden="true">
              {assigned.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className={styles.eyebrow} style={{ marginBottom: 4 }}>
                {isOwn ? copy.assignedOwn : copy.assigned}
              </p>
              <p className={styles.assignedLabel}>{assigned.label}</p>
              <p className={styles.assignedDesc}>{assigned.desc}</p>
            </div>
            {isOwn ? <span className={styles.lockChip}>{copy.locked}</span> : null}
          </div>
        ) : null}

        <div className={styles.archetypeGrid}>
          {archetypes.map((a) => {
            const isAssigned = assigned?.id === a.id;
            const isAspired = aspiration?.id === a.id;
            const isFocused = detail?.id === a.id;
            return (
              <button
                key={a.id}
                type="button"
                disabled={isOwn && isAssigned}
                aria-pressed={isOwn ? isAspired : isFocused}
                className={`${styles.archetypeOption} ${isAspired || (!isOwn && isFocused) ? styles.archetypeOptionActive : ''}`}
                onMouseEnter={() => setFocused(a)}
                onMouseLeave={() => setFocused(null)}
                onFocus={() => setFocused(a)}
                onClick={() => {
                  if (!isOwn) {
                    setFocused(a);
                    return;
                  }
                  if (isAssigned) return;
                  onSelect(a.id);
                  onClose();
                }}
              >
                <span className={styles.optionTop}>
                  <span aria-hidden="true">{a.icon}</span>
                  <span className={styles.optionLabel}>{a.label}</span>
                </span>
                <span className={styles.optionDesc}>{a.desc}</span>
              </button>
            );
          })}
        </div>

        <div className={`${styles.guidance} ${detail ? styles.guidanceActive : ''}`} aria-live="polite">
          {detail ? (
            <>
              <p className={styles.eyebrow} style={{ marginBottom: 6 }}>
                {detail.toward}
              </p>
              <p className={styles.guidanceText}>{detail.guidance}</p>
            </>
          ) : (
            <p className={styles.quiet}>{copy.hint}</p>
          )}
        </div>

        {isOwn && changed ? <p className={styles.notSaved}>{copy.notSaved}</p> : null}

        <div className={styles.dialogFoot}>
          {isOwn && aspiration ? (
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                onSelect(null);
                onClose();
              }}
            >
              {copy.clear}
            </button>
          ) : (
            <span />
          )}
          <button type="button" className={styles.darkButton} onClick={onClose}>
            {isOwn ? copy.done : copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
