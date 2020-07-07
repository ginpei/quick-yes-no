import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { Candidate } from '../models/Candidate';
import { Category } from '../models/Category';
import { measureDistance, Pos, subtractPos } from '../models/Length';
import { cssVar } from '../util/cssVar';
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
          candidateTransition={lastCandidateTransition}
          decidedCandidate={
            layout.category.name === lastCategoryLayout?.category.name
              ? lastCandidate
              : null
          }
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
