'use client';

/**
 * The stage rail.
 *
 * Two recovered versions exist. The editor's ProgressRail
 * (dialecta-editor.jsx 175-241) draws hex-coloured dots on a grey gradient and
 * swaps layout through a useIsDesktop() media-query hook. The private draft's
 * StageRail (dialecta-private-draft.jsx 129-188) is the later generation: brass
 * dots on the --brass-* tokens, a --wood-edge rim, the same five-step shape.
 * This is the private draft's rail carrying the editor's steps (RAIL_STEPS),
 * so the article writer and the comment composer share one rail, which is what
 * both files were converging on. The mobile rule that hides every label but the
 * active one is CSS now, so the rail no longer renders differently on the
 * server than on the first client paint.
 */
import { Fragment } from 'react';
import { strings } from '@/strings';
import { RAIL_STEPS, type Stage } from './writer-state';

export function StageRail({ stage }: { stage: Stage }) {
  const activeIdx = RAIL_STEPS.findIndex((s) => s.stages.includes(stage));

  return (
    <nav className="dw-rail" aria-label={strings.writer.railLabel}>
      {RAIL_STEPS.map((step, i) => {
        const state = i === activeIdx ? 'active' : i < activeIdx ? 'passed' : 'pending';
        return (
          <Fragment key={step.key}>
            <div className="dw-rail-step" data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
              <span className="dw-rail-dot" aria-hidden="true" />
              <span className="dw-rail-label">{step.label}</span>
            </div>
            {i < RAIL_STEPS.length - 1 ? <span className="dw-rail-rule" aria-hidden="true" /> : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
