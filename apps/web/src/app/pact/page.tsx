import type { Metadata } from 'next';
import { Rich } from '@/components/content/rich';
import { isSignedIn } from '@/components/content/session';
import { Parchment } from '@/components/content/pact/parchment';
import { PactTierIcon } from '@/components/content/pact/tier-icons';
import { PactQuiz, QUIZ_ANCHOR, readQuizState } from '@/components/content/pact/pact-quiz';
import { PactCommitment, SIGNATURE_FONTS_HREF } from '@/components/content/pact/pact-commitment';
import s from '@/components/content/pact/pact.module.css';
import { strings } from '@/strings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: strings.content.pact.title,
  description: strings.content.pact.description,
  // The quiz keeps its state in the query string; every variant is this page.
  alternates: { canonical: '/pact' },
};

interface PactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The Pact: _theme/page-pact.hbs, the live template, which is what the three
 * members who signed read. Where it differs from components/dialecta-pact.html
 * the template wins: it is the newer text (contractions, the Path A / Path B
 * chooser removed 2026-04-29) and the one on the site.
 *
 * Two sheets, as live: § I on the hero parchment, § II to § VIII on the long
 * one. § II carries no section mark in the live template, only its eyebrow;
 * that stays as written (the port report lists it).
 *
 * Signing is a seam: see components/content/pact/pact-commitment.tsx. In
 * development, ?preview=member shows the member ceremony without a session,
 * so the signature line can be reviewed; production ignores it.
 */
export default async function PactPage({ searchParams }: PactPageProps) {
  const params = await searchParams;
  const p = strings.content.pact;
  const quiz = readQuizState(params);
  const preview = process.env.NODE_ENV !== 'production' && params.preview === 'member';
  const member = preview || (await isSignedIn());

  return (
    <main className={s.main}>
      {/* The nine signature hands are the Pact's alone, so they load here, not
          in the root layout. React hoists the stylesheet into <head>. */}
      <link rel="stylesheet" href={SIGNATURE_FONTS_HREF} precedence="default" />
      <div className={s.page}>
        <div className={s.stage}>
          {/* ═══ § I · Hero ═══ */}
          <Parchment folio={p.hero.folio} labelledBy="pact-title">
            <div className={s.centered}>
              <span className={s.eyebrow}>{p.hero.eyebrow}</span>
              <h1 id="pact-title" className={s.displayH1}>
                <Rich text={p.hero.heading} />
              </h1>
              <p className={s.lede}>{p.hero.lede}</p>
              <p className={s.body}>{p.hero.body}</p>
            </div>
          </Parchment>

          {/* ═══ § II to § VIII ═══ */}
          <Parchment long folio={p.folioLong}>
            {/* § II · Why this exists */}
            <span className={s.eyebrow}>{p.mission.eyebrow}</span>
            <h2 className={s.displayH2}>
              <Rich text={p.mission.heading} />
            </h2>
            {p.mission.body.map((para) => (
              <p key={para.slice(0, 32)} className={s.body}>
                <Rich text={para} />
              </p>
            ))}
            <blockquote className={s.callout}>
              <p>{p.mission.callout}</p>
              <p className={s.attribution}>{p.mission.calloutAttribution}</p>
            </blockquote>
            <p className={s.body}>
              <Rich text={p.mission.closing} />
            </p>

            {/* § III · The Classification */}
            <SectionMark text={p.classification.mark} />
            <span className={s.eyebrow}>{p.classification.eyebrow}</span>
            <h2 className={s.displayH2}>
              <Rich text={p.classification.heading} />
            </h2>
            <p className={s.body}>{p.classification.body}</p>
            <div className={s.tierList}>
              {p.classification.tiers.map((tier) => (
                <div key={tier.key} className={`${s.tierRow} ${s[tier.key] ?? ''}`}>
                  <div className={s.tierRowIcon}>
                    <PactTierIcon tier={tier.key} size={28} />
                  </div>
                  <div>
                    <span className={s.tierRowKicker}>{tier.kicker}</span>
                    <h3 className={s.tierRowName}>{tier.name}</h3>
                    <p className={s.tierRowDesc}>{tier.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* § IV · The Process */}
            <SectionMark text={p.process.mark} />
            <span className={s.eyebrow}>{p.process.eyebrow}</span>
            <h2 className={s.displayH2}>
              <Rich text={p.process.heading} />
            </h2>
            <p className={s.body}>{p.process.body}</p>
            <ol className={s.stageList}>
              {p.process.stages.map((stage) => (
                <li key={stage.num} className={s.stageItem}>
                  <div className={s.stageNum} aria-hidden="true">
                    {stage.num}
                  </div>
                  <div>
                    <div className={s.stageTitle}>{stage.title}</div>
                    <div className={s.stageBody}>
                      <Rich text={stage.body} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* § V · The Wait Architecture */}
            <SectionMark text={p.wait.mark} />
            <span className={s.eyebrow}>{p.wait.eyebrow}</span>
            <h2 className={s.displayH2}>
              <Rich text={p.wait.heading} />
            </h2>
            {p.wait.body.map((para) => (
              <p key={para.slice(0, 32)} className={s.body}>
                <Rich text={para} />
              </p>
            ))}
            <dl className={s.waitGrid}>
              {p.wait.rows.map((row) => (
                <div key={row.label} className={s.waitRow}>
                  <dt className={s.waitLabel}>{row.label}</dt>
                  <dd className={s.waitTime}>{row.time}</dd>
                </div>
              ))}
            </dl>

            {/* § VI · The Deeper Purpose */}
            <SectionMark text={p.purpose.mark} />
            <span className={s.eyebrow}>{p.purpose.eyebrow}</span>
            <h2 className={s.displayH2}>
              <Rich text={p.purpose.heading} />
            </h2>
            {p.purpose.body.map((para) => (
              <p key={para.slice(0, 32)} className={s.body}>
                <Rich text={para} />
              </p>
            ))}
            <div className={s.growthGrid}>
              {p.purpose.patterns.map((pattern) => (
                <div key={pattern.title} className={s.growthCard}>
                  <div className={s.growthTag}>{p.purpose.patternTag}</div>
                  <div className={s.growthCardTitle}>{pattern.title}</div>
                  <div className={s.growthCardSub}>{pattern.sub}</div>
                </div>
              ))}
            </div>
            <p className={`${s.body} ${s.afterGrid}`}>
              <Rich text={p.purpose.closing} />
            </p>

            {/* § VII · Learn by Doing */}
            <SectionMark text={p.quiz.mark} />
            <div id={QUIZ_ANCHOR} className={s.quiz}>
              <span className={s.eyebrow}>{p.quiz.eyebrow}</span>
              <h2 className={s.displayH2}>
                <Rich text={p.quiz.heading} />
              </h2>
              <p className={s.quizIntro}>{p.quiz.intro}</p>
              <PactQuiz state={quiz} />
            </div>

            {/* § VIII · The Commitment */}
            <SectionMark text={p.commitment.mark} />
            <div className={s.centered}>
              <span className={s.eyebrow}>{p.commitment.eyebrow}</span>
              <h2 id="pact-commit-heading" className={s.displayH2}>
                <Rich text={p.commitment.heading} />
              </h2>
              <PactCommitment member={member} />
            </div>

            <span className={s.asterism} aria-hidden="true">
              ✦ ✦ ✦
            </span>
          </Parchment>
        </div>
      </div>
    </main>
  );
}

function SectionMark({ text }: { text: string }) {
  return (
    <div className={s.sectionMark}>
      <span className={s.sectionMarkNum}>{text}</span>
    </div>
  );
}
