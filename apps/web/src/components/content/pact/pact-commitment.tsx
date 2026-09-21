/**
 * § VIII, the commitment: the Pact's own sentence, the signature line and the
 * brass commit button. page-pact.hbs, lines 1458 to 1543.
 *
 * Two branches, as live ({{#if @member}}). A visitor gets the sentence and a
 * way in. A member gets the ceremony: a name typed in one of nine hands.
 *
 * SIGNING IS A SEAM. The live commit POSTed become_author to
 * /api/profile/<ghost member uuid>, a Ghost identity that does not exist here,
 * and a session cannot resolve to a profile until profiles.user_id is set
 * (lib/articles.ts; the claim_profile() flow). So the button is disabled, the
 * line under it says the signature is not recorded, and there is no form to
 * submit: nothing typed leaves the page. When identity lands, this becomes a
 * Server Action that writes pact_agreed_at, pact_version ('1.0', the live
 * PACT_VERSION), pact_signed_name and signature_font through a session-scoped
 * policy, and the sealed state the live script drew (the name hardening in
 * place, "Committed" with the date, "Begin" to the profile) comes back.
 *
 * The font picker is radio inputs and :has() (pact.module.css), so choosing a
 * hand restyles the line with no script. What script did that this cannot:
 * mirror the typed name into every chip. The chips show "Aa", which is what
 * the live chips showed until you typed.
 */
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { loginHref } from '@/lib/return-path';
import { strings } from '@/strings';
import s from './pact.module.css';

/** The nine hands, page-pact.hbs's chips in order; api/_signature-fonts.js is the live allowlist. */
export const SIGNATURE_FONTS = [
  'Mrs Saint Delafield',
  'Cherish',
  'Give You Glory',
  'Hurricane',
  'Love Light',
  'Nothing You Could Do',
  'Oooh Baby',
  'Qwigley',
  'WindSong',
] as const;

/** post.hbs SIG_SCALES, so each chip's "Aa" reads at the same height. */
const SIG_SCALES: Record<(typeof SIGNATURE_FONTS)[number], number> = {
  'Mrs Saint Delafield': 1,
  Cherish: 0.85,
  'Give You Glory': 1.4,
  Hurricane: 0.95,
  'Love Light': 1,
  'Nothing You Could Do': 1.1,
  'Oooh Baby': 0.78,
  Qwigley: 1.45,
  WindSong: 1,
};

/** One stylesheet for the nine faces plus Allura, the live fallback. Hoisted into <head> by React. */
export const SIGNATURE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Allura&family=Cherish&family=Give+You+Glory&family=Hurricane&family=Love+Light&family=Mrs+Saint+Delafield&family=Nothing+You+Could+Do&family=Oooh+Baby&family=Qwigley&family=WindSong&display=swap';

export function PactCommitment({ member }: { member: boolean }) {
  const t = strings.content.pact.commitment;

  if (!member) {
    return (
      <div>
        <p className={s.pactText} style={{ marginBottom: 24 }}>
          {t.pactText}
        </p>
        <p className={s.signedOutNote}>{t.signedOut}</p>
        <div className={s.commitWrap}>
          <Link href={loginHref('/pact')} className={s.brass}>
            {t.signInToCommit}
          </Link>
        </div>
        <p className={s.joinNote}>
          {t.noAccount} <Link href={loginHref('/pact')}>{t.join}</Link>.
        </p>
      </div>
    );
  }

  return (
    // A div, not a form: with one text field a form submits on Enter, which
    // would put the typed name in the query string.
    <div className={s.commitForm} role="group" aria-labelledby="pact-commit-heading" aria-describedby="pact-seam">
      <p className={s.pactText}>{t.pactText}</p>
      <div className={s.signatureArea}>
        <label className={s.signaturePrompt} htmlFor="pact-signature">
          {t.signaturePrompt}
        </label>
        <div className={s.signatureLine}>
          <input
            id="pact-signature"
            name="signed_name"
            type="text"
            className={s.signatureInput}
            autoComplete="off"
            spellCheck={false}
            maxLength={80}
            aria-label={t.signatureAria}
            placeholder={t.signaturePlaceholder}
          />
        </div>
        <span className={s.signatureNameLabel}>{t.signatureNameLabel}</span>

        <fieldset className={s.fontPicker}>
          <legend className={s.fontPickerLabel}>{t.fontPickerLabel}</legend>
          <div className={s.fontChips}>
            {SIGNATURE_FONTS.map((font, i) => (
              <label
                key={font}
                className={s.fontChip}
                style={{ fontFamily: `'${font}', cursive`, '--sig-scale': SIG_SCALES[font] } as CSSProperties}
                title={font}
              >
                <input
                  className={s.fontRadio}
                  type="radio"
                  name="signature_font"
                  value={font}
                  defaultChecked={i === 0}
                  aria-label={font}
                />
                {t.fontChip}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={s.commitWrap}>
        <button type="button" className={s.brass} disabled>
          {t.commit}
        </button>
      </div>
      <p id="pact-seam" className={s.seam}>
        {t.seam}
      </p>
    </div>
  );
}
