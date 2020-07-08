import { CSSProperties, RefObject, useEffect, useMemo, useRef } from 'react';
import { Candidate } from '../models/Candidate';
import { config } from '../models/Config';
import { Pos } from '../models/Length';
import { animate } from '../util/animate';
import { cssVar } from '../util/cssVar';
import { sleep } from '../util/sleep';
import { CandidateImage } from './CandidateImage';
import styles from './DecisionCategoryView.module.scss';
import { CategoryLayout } from './DecisionFlicker';

const noop = () => {
  /* none */
};

// TODO replace with state somehow
let activeAnimationId = 0;

/**
 * 1. Print category block
 * 2. Print and animate decided candidate with category block
 */
export const DecisionCategoryView: React.FC<{
  candidateTransition: Pos;
  decidedCandidate: Candidate | null;
  hovered: boolean;
  layout: CategoryLayout;
}> = ({ candidateTransition, decidedCandidate, hovered, layout }) => {
  const refCategory = useRef<HTMLDivElement>(null);
  const refCandidate = useRef<HTMLDivElement>(null);

  const style: CSSProperties = useMemo(
    () =>
      cssVar({
        '--CategoryView-left': `${layout.x}px`,
        '--CategoryView-top': `${layout.y}px`,
        '--CategoryView-width': `${layout.width}px`,
      }),
    [layout]
  );

  const candidatePos: Pos = useMemo(
    () => ({
      x: candidateTransition.x - layout.x,
      y: candidateTransition.y - layout.y,
    }),
    [layout, candidateTransition]
  );

  useEffect(() => {
    const elCategory = refCategory.current;
    if (!elCategory || !refCandidate.current || !decidedCandidate) {
      return noop;
    }

    const animationId = Math.random();
    activeAnimationId = animationId;

    animateChosenCategory(
      elCategory,
      refCandidate.current,
      layout,
      candidateTransition,
      animationId
    );

    return () => resetChosenCategoryAnimation(elCategory);
  }, [
    refCategory.current,
    refCandidate.current,
    decidedCandidate,
    layout,
    candidateTransition,
  ]);

  return (
    <div className={styles.root} style={style}>
      <div className={styles.content} data-hovered={hovered} ref={refCategory}>
        {layout.category.name}
      </div>
      <LastCandidateView
        candidate={decidedCandidate}
        refAnimationTarget={refCandidate}
        pos={candidatePos}
      />
    </div>
  );
};

const LastCandidateView: React.FC<{
  candidate: Candidate | null;
  refAnimationTarget: RefObject<HTMLDivElement>;
  pos: Pos;
}> = ({ candidate, refAnimationTarget, pos }) => {
  const style: CSSProperties = useMemo(
    () =>
      cssVar({
        '--LastCandidateView-left': `${pos.x}px`,
        '--LastCandidateView-top': `${pos.y}px`,
      }),
    [pos]
  );

  const candidateImageStyle: CSSProperties = useMemo(
    () =>
      cssVar({ '--CandidateImage-width': `${config.candidateImageWidth}px` }),
    []
  );

  return (
    <div className={styles.LastCandidateView} style={style}>
      <div ref={refAnimationTarget}>
        {candidate && (
          <CandidateImage
            candidate={candidate}
            className={styles.candidateView}
            style={candidateImageStyle}
          />
        )}
      </div>
    </div>
  );
};

async function animateChosenCategory(
  elCategory: HTMLElement,
  elCandidate: HTMLElement,
  destination: CategoryLayout,
  offset: Pos,
  animationId: number
) {
  // how to make them better?

  const wholeDuration = config.duration;

  elCategory.setAttribute('data-eating', 'true');

  const x = destination.x - offset.x;
  const y = destination.y - offset.y - config.candidateImageWidth / 2;

  animate(
    elCandidate,
    [
      { opacity: '1', transform: 'scale(1)' },
      {
        opacity: '0',
        transform: `translate(${x}px, ${y}px) scale(0.5)`,
      },
    ],
    {
      duration: config.duration,
      easing: 'ease-in',
      fill: 'forwards',
    }
  );

  await sleep(config.duration / 2);

  if (activeAnimationId !== animationId) {
    return;
  }

  const anim1 = animate(
    elCategory,
    [{ transform: 'scale(1)' }, { transform: 'scale(0.5)' }],
    {
      duration: wholeDuration / 3,
      easing: 'ease-out',
      fill: 'forwards',
    }
  );

  await anim1.finished;

  if (activeAnimationId !== animationId) {
    animate(
      elCategory,
      [{ transform: 'scale(1)' }, { transform: 'scale(1)' }],
      {
        fill: 'forwards',
      }
    );

    return;
  }

  const anim2 = animate(
    elCategory,
    [{ transform: 'scale(0.5)' }, { transform: 'scale(1)' }],
    {
      duration: (wholeDuration * 2) / 3,
      easing: 'cubic-bezier(.2,3,1,1.2)',
      fill: 'forwards',
    }
  );

  await anim2.finished;

  await sleep(config.duration);

  if (activeAnimationId !== animationId) {
    return;
  }

  elCategory.removeAttribute('data-eating');
}

function resetChosenCategoryAnimation(elCategory: HTMLElement) {
  elCategory.removeAttribute('data-eating');
}
