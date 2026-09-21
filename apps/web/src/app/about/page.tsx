import type { Metadata } from 'next';
import Link from 'next/link';
import { Rich } from '@/components/content/rich';
import leaf from '@/components/content/leaf.module.css';
import a from '@/components/content/about/about.module.css';
import { strings } from '@/strings';

export const metadata: Metadata = {
  title: strings.content.about.title,
  description: strings.content.about.description,
};

/**
 * About: _theme/page-about.hbs. The hero, four numbered leaves (the problem,
 * the wager, the philosophy, the balance), the builder's note and the closing
 * call to the Pact and the Stewards. Static.
 */
export default function AboutPage() {
  const t = strings.content.about;

  return (
    <main className={leaf.main}>
      <div className={leaf.column}>
        <header className={leaf.hero}>
          <div className={leaf.heroEyebrow}>{t.eyebrow}</div>
          <h1 className={leaf.heroTitle}>
            <Rich text={t.heading} />
          </h1>
          <p className={leaf.heroLede}>{t.lede}</p>
          <span className={leaf.asterism} aria-hidden="true">
            ✦ ✦ ✦
          </span>
        </header>

        {t.sections.map((section) => (
          <section key={section.numeral} className={leaf.leaf} aria-labelledby={`about-${section.numeral}`}>
            <span className={a.numeral} aria-hidden="true">
              {section.numeral}
            </span>
            <div className={leaf.leafLabel}>{section.label}</div>
            <h2 id={`about-${section.numeral}`} className={`${leaf.leafTitle} ${a.leafTitleAbout}`}>
              <Rich text={section.title} />
            </h2>
            {section.blocks.map((block, i) => {
              switch (block.kind) {
                case 'body':
                  return (
                    <p key={i} className={a.body}>
                      <Rich text={block.text} />
                    </p>
                  );
                case 'quote':
                  return (
                    <blockquote key={i} className={a.pullquote}>
                      <p>{block.text}</p>
                      <cite>{block.cite}</cite>
                    </blockquote>
                  );
                case 'strip':
                  return (
                    <div key={i} className={a.strip}>
                      <div className={a.stripLabel}>{block.label}</div>
                      <div className={a.stripText}>
                        <Rich text={block.text} />
                      </div>
                    </div>
                  );
                case 'principles':
                  return (
                    <div key={i} className={a.principles}>
                      {block.items.map((p) => (
                        <div key={p.word} className={a.principle}>
                          <span className={a.principleStar} aria-hidden="true">
                            ✦
                          </span>
                          <h3 className={a.principleWord}>{p.word}</h3>
                          <div className={a.principleNames}>{p.names}</div>
                          <div className={a.principleDesc}>{p.desc}</div>
                        </div>
                      ))}
                    </div>
                  );
              }
            })}
          </section>
        ))}

        <aside className={a.note} aria-labelledby="about-builder-note">
          <div id="about-builder-note" className={a.noteLabel}>
            {t.builderNote.label}
          </div>
          <p className={a.noteText}>{t.builderNote.text}</p>
          <div className={a.noteSig}>{t.builderNote.signature}</div>
          <span className={a.noteWatermark} aria-hidden="true">
            {t.builderNote.watermark}
          </span>
        </aside>

        <section className={a.cta} aria-labelledby="about-cta">
          <h2 id="about-cta" className={a.ctaTitle}>
            <Rich text={t.cta.title} />
          </h2>
          <p className={a.ctaBody}>{t.cta.body}</p>
          <div className={a.ctaLinks}>
            <Link href="/pact" className={a.primary}>
              {t.cta.primary}
            </Link>
            <Link href="/stewards" className={a.secondary}>
              {t.cta.secondary}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
