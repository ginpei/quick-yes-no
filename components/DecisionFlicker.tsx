import { CSSProperties, useCallback, useMemo, useRef, useState } from 'react';
import { Candidate } from '../models/Candidate';
import { Category } from '../models/Category';
import { measureDistance, Pos, subtractPos } from '../models/Length';
import { animate } from '../util/animate';
import { cssVar } from '../util/cssVar';
import { sleep } from '../util/sleep';
import { CandidateImage } from './CandidateImage';
import { DecisionCategoryView } from './DecisionCategoryView';
import styles from './DecisionFlicker.module.scss';
import DragItem, { DragCallback } from './DragItem';

export type OnDecide = (result: {
  candidate: Candidate;
  category: Category;
}) => void;

export interface CategoryLayout {
  category: Category;
  width: number;
  x: number;
  y: number;
}

// TODO move to config placed somewhere in the future
const animationDuration = 300;
const imageWidth = 64;

// TODO replace with state somehow
let activeAnimationId = 0;
let animatingCategoryName = '';

export const DecisionFlicker: React.FC<{
  candidate: Candidate | null;
  categories: Category[];
  onDecide: OnDecide;
  width: number;
}> = ({ candidate, categories, onDecide, width }) => {
  const [lastCandidate, setLastCandidate] = useState<Candidate | null>(null);
  const [
    lastCategoryLayout,
    setLastCategoryLayout,
  ] = useState<CategoryLayout | null>(null);

  const [candidateTransition, setCandidateTransition] = useState<Pos>({
    x: 0,
    y: 0,
  });

  const [lastCandidateTransition, setLastCandidateTransition] = useState<Pos>({
    x: 0,
    y: 0,
  });

  const categoryLayouts = useMemo(
    () => createCategoryLayouts(categories, width / 4, width),
    [categories, width]
  );

  const nearestCategory: Category | null = useMemo(
    () => findNearestCategory(candidateTransition, categoryLayouts, width / 4),
    [candidateTransition, categoryLayouts, width]
  );

  const onCandidateDrop = useCallback(() => {
    setCandidateTransition({ x: 0, y: 0 });

    if (!candidate || !nearestCategory) {
      return;
    }

    const categoryLayout =
      categoryLayouts.find((v) => v.category.name === nearestCategory.name) ??
      null;

    const elCategory = document.querySelector(
      `[data-category-id="${nearestCategory.name}"]`
    );
    const elCandidate = document.querySelector('[data-js-decided-candidate]');

    if (
      elCategory instanceof HTMLElement &&
      elCandidate instanceof HTMLElement &&
      categoryLayout
    ) {
      const animationId = Date.now();
      activeAnimationId = animationId;
      animatingCategoryName = categoryLayout.category.name;

      animateChosenCategory(
        elCategory,
        elCandidate,
        categoryLayout,
        candidateTransition,
        animationId
      );
    }

    setLastCandidateTransition(candidateTransition);
    setLastCandidate(candidate);
    setLastCategoryLayout(categoryLayout);

    onDecide({ candidate, category: nearestCategory });
  }, [candidate, nearestCategory, onDecide, candidateTransition]);

  const onCandidateTransition = useCallback((transition: Pos) => {
    setCandidateTransition(transition);
  }, []);

  return (
    <div
      className={styles.root}
      style={cssVar({ '--DecisionFlicker-width': `${width}px` })}
    >
      {categoryLayouts.map((layout) => (
        <DecisionCategoryView
          hovered={layout.category === nearestCategory}
          key={layout.category.name}
          layout={layout}
        />
      ))}
      {candidate && (
        <CurrentCandidateView
          candidate={candidate}
          transition={candidateTransition}
          onDrop={onCandidateDrop}
          onTransition={onCandidateTransition}
        />
      )}
      <LastCandidateView
        candidate={lastCandidate}
        transition={lastCandidateTransition}
      />
    </div>
  );
};

const CurrentCandidateView: React.FC<{
  candidate: Candidate;
  onDrop: () => void;
  onTransition: (transition: Pos) => void;
  transition: Pos;
}> = ({ candidate, onDrop, onTransition, transition }) => {
  const style: CSSProperties = useMemo(
    () =>
      cssVar({
        '--CurrentCandidateView-left': `${transition.x}px`,
        '--CurrentCandidateView-top': `${transition.y}px`,
      }),
    [transition]
  );

  const candidateImageStyle: CSSProperties = useMemo(
    () => cssVar({ '--CandidateImage-width': `${imageWidth}px` }),
    []
  );

  const onDragMove: DragCallback = useCallback(
    ({ from, to }) => {
      onTransition(subtractPos(to, from));
    },
    [onTransition]
  );

  const onDragEnd: DragCallback = useCallback(() => {
    onDrop();
  }, [onDrop]);

  return (
    <div className={styles.CurrentCandidateView} style={style}>
      <DragItem
        isDraggable={true}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      >
        <CandidateImage
          candidate={candidate}
          className={styles.candidateView}
          style={candidateImageStyle}
        />
      </DragItem>
    </div>
  );
};

const LastCandidateView: React.FC<{
  candidate: Candidate | null;
  transition: Pos;
}> = ({ candidate, transition }) => {
  const ref = useRef<HTMLDivElement>(null);

  const style: CSSProperties = useMemo(
    () =>
      cssVar({
        '--CurrentCandidateView-left': `${transition.x}px`,
        '--CurrentCandidateView-top': `${transition.y}px`,
      }),
    [transition]
  );

  const candidateImageStyle: CSSProperties = useMemo(
    () => cssVar({ '--CandidateImage-width': `${imageWidth}px` }),
    []
  );

  return (
    <div className={styles.LastCandidateView} style={style}>
      <div data-js-decided-candidate>
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

  const wholeDuration = animationDuration;

  elCategory.setAttribute('data-eating', 'true');

  const x = destination.x - offset.x;
  const y = destination.y - offset.y - imageWidth / 2;

  const anim0 = animate(
    elCandidate,
    [
      { opacity: '1', transform: 'scale(1)' },
      {
        opacity: '0',
        transform: `translate(${x}px, ${y}px) scale(0.5)`,
      },
    ],
    {
      duration: animationDuration,
      easing: 'ease-in',
      fill: 'forwards',
    }
  );

  await sleep(animationDuration / 2);

  if (activeAnimationId !== animationId) {
    if (animatingCategoryName !== destination.category.name) {
      elCategory.removeAttribute('data-eating');
    }
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
    if (animatingCategoryName !== destination.category.name) {
      elCategory.removeAttribute('data-eating');
      animate(
        elCategory,
        [{ transform: 'scale(1)' }, { transform: 'scale(1)' }],
        {
          fill: 'forwards',
        }
      );
    }
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

  await sleep(animationDuration);

  if (activeAnimationId !== animationId) {
    if (animatingCategoryName !== destination.category.name) {
      elCategory.removeAttribute('data-eating');
    }
    return;
  }

  elCategory.removeAttribute('data-eating');
}

function createCategoryLayouts(
  categories: Category[],
  itemWidth: number,
  containerWidth: number
): CategoryLayout[] {
  const radius = (containerWidth - itemWidth) / 2;

  const max = categories.length - 1;
  const layouts: CategoryLayout[] = categories.map((category, index) => {
    const position = index / max;
    return {
      category,
      width: itemWidth,
      x: radius * Math.cos(Math.PI * position),
      y: radius * Math.sin(Math.PI * position) * -1,
    };
  });
  return layouts;
}

function findNearestCategory(
  transition: Pos,
  categoryLayouts: CategoryLayout[],
  range: number
): Category | null {
  let min = Number.POSITIVE_INFINITY;
  let nearest: Category | null = null;

  categoryLayouts.forEach((layout) => {
    const distance = measureDistance(layout, transition);
    if (distance < min && distance < range) {
      min = distance;
      nearest = layout.category;
    }
  });

  return nearest;
}
