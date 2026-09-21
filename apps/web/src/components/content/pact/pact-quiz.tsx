/**
 * § VII, the tier-reading exercise: three comments, one guess each, feedback
 * after every guess, a score at the end. The copy and the answer key are
 * page-pact.hbs's own (its inline `answers` and `feedback` objects).
 *
 * The live exercise ran on inline script. apps/web names its client islands
 * and the Pact is not one, so this renders on the server from the query
 * string: ?a1=heat&a2=forum&a3=fog holds the guesses, ?q= the card on show.
 * Every choice is a link, so the exercise works with script off, with a
 * keyboard, and from a shared URL. scroll={false} keeps the reader where they
 * are while the next card replaces this one, as the live card swap did.
 */
import Link from 'next/link';
import type { Tier } from '@dialecta/core';
import { strings } from '@/strings';
import { Rich } from '../rich';
import { PactTierIcon } from './tier-icons';
import s from './pact.module.css';

/** The three comments' options and answers, page-pact.hbs lines 1414 to 1450 and its `answers`. */
const QUESTIONS: readonly { options: readonly Tier[]; answer: Tier }[] = [
  { options: ['forum', 'spark', 'heat', 'stance'], answer: 'heat' },
  { options: ['forum', 'echo', 'fog', 'heat'], answer: 'forum' },
  { options: ['spark', 'echo', 'fog', 'heat'], answer: 'fog' },
];

/** The quiz buttons name each tier as § III's tier list does ("The Forum"). */
function tierLabel(tier: Tier): string {
  return strings.content.pact.classification.tiers.find((t) => t.key === tier)?.name ?? tier;
}

export const QUIZ_ANCHOR = 'pact-quiz';

type Params = Record<string, string | string[] | undefined>;

export interface QuizState {
  answers: (Tier | null)[];
  /** 0, 1, 2 for a comment card; 3 for the result. */
  current: number;
}

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function readQuizState(params: Params): QuizState {
  const answers = QUESTIONS.map((q, i) => {
    const raw = one(params[`a${i + 1}`]);
    return raw && (q.options as readonly string[]).includes(raw) ? (raw as Tier) : null;
  });
  const q = one(params.q);
  let current = q === 'done' ? 3 : Number.parseInt(q ?? '1', 10) - 1;
  if (!Number.isFinite(current) || current < 0 || current > 3) current = 0;
  // The result needs every guess; a hand-edited URL lands on the first gap.
  if (current === 3 && answers.some((a) => a === null)) current = answers.findIndex((a) => a === null);
  return { answers, current };
}

function hrefFor(answers: (Tier | null)[], current: number): string {
  const qs = new URLSearchParams();
  answers.forEach((a, i) => {
    if (a) qs.set(`a${i + 1}`, a);
  });
  if (current === 3) qs.set('q', 'done');
  else if (current > 0) qs.set('q', String(current + 1));
  const query = qs.toString();
  return `/pact${query ? `?${query}` : ''}#${QUIZ_ANCHOR}`;
}

export function PactQuiz({ state }: { state: QuizState }) {
  const t = strings.content.pact.quiz;
  const { answers, current } = state;

  if (current === 3) {
    const score = QUESTIONS.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
    return (
      <div className={s.quizComplete} aria-live="polite">
        <div className={s.quizScore}>{t.score(score)}</div>
        <div className={s.quizScoreLabel}>{t.scoreLabel}</div>
        <div className={s.quizMessage}>{t.messages[score]}</div>
      </div>
    );
  }

  const question = QUESTIONS[current];
  const copy = t.questions[current];
  if (!question || !copy) return null;
  const chosen = answers[current] ?? null;
  const isCorrect = chosen === question.answer;

  return (
    <div className={s.quizCard}>
      <div className={s.quizCount}>{t.count(current + 1)}</div>
      <blockquote className={s.quizComment}>{copy.comment}</blockquote>
      <ul className={s.quizOptions}>
        {question.options.map((tier) => {
          const icon = <PactTierIcon tier={tier} size={14} />;
          if (chosen) {
            const state =
              tier === chosen ? (isCorrect ? s.correct : s.incorrect) : tier === question.answer ? s.revealed : '';
            return (
              <li key={tier}>
                <span className={`${s.quizBtn} ${s.quizBtnSpent} ${state}`} aria-current={tier === chosen ? 'true' : undefined}>
                  {icon} {tierLabel(tier)}
                </span>
              </li>
            );
          }
          const next = answers.slice();
          next[current] = tier;
          return (
            <li key={tier}>
              <Link href={hrefFor(next, current)} scroll={false} prefetch={false} rel="nofollow" className={s.quizBtn}>
                {icon} {tierLabel(tier)}
              </Link>
            </li>
          );
        })}
      </ul>
      {chosen ? (
        <>
          <div className={s.quizFeedback} aria-live="polite">
            <Rich text={isCorrect ? copy.correct : copy.wrong} />
          </div>
          <Link
            href={hrefFor(answers, current + 1)}
            scroll={false}
            prefetch={false}
            rel="nofollow"
            className={s.quizNext}
          >
            {current === QUESTIONS.length - 1 ? t.seeResult : t.next}
          </Link>
        </>
      ) : null}
    </div>
  );
}
