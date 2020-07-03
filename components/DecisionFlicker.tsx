import { useCallback, useMemo, useState } from 'react';
import { Candidate } from '../models/Candidate';
import { Category } from '../models/Category';
import { measureDistance, Pos, subtractPos } from '../models/Length';
import { CandidateImage } from './CandidateImage';
import styles from './DecisionFlicker.module.scss';
import DragItem, { DragCallback } from './DragItem';

export type OnDecide = (result: {
  candidate: Candidate;
  category: Category;
}) => void;

interface CategoryLayout {
  category: Category;
  width: number;
  x: number;
  y: number;
}

export const DecisionFlicker: React.FC<{
  candidate: Candidate | null;
  categories: Category[];
  onDecide: OnDecide;
  width: number;
}> = ({ candidate, categories, onDecide, width }) => {
  const [candidateTransition, setCandidateTransition] = useState<Pos>({
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
    if (candidate && nearestCategory) {
      onDecide({ candidate, category: nearestCategory });
    }
  }, [candidate, nearestCategory, onDecide]);

  const onCandidateTransition = useCallback((transition: Pos) => {
    setCandidateTransition(transition);
  }, []);

  return (
    <div
      className={styles.root}
      style={{ '--DecisionFlicker-width': `${width}px` } as any}
    >
      {categoryLayouts.map((layout) => (
        <CategoryView
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

const CategoryView: React.FC<{
  hovered: boolean;
  layout: CategoryLayout;
}> = ({ hovered, layout }) => {
  const style: any = useMemo(
    () => ({
      '--CategoryView-left': `${layout.x}px`,
      '--CategoryView-top': `${layout.y}px`,
      '--CategoryView-width': `${layout.width}px`,
    }),
    [layout]
  );
  return (
    <div className={styles.CategoryView} data-hovered={hovered} style={style}>
      {layout.category.name}
    </div>
  );
};

const CurrentCandidateView: React.FC<{
  candidate: Candidate;
  onDrop: () => void;
  onTransition: (transition: Pos) => void;
  transition: Pos;
}> = ({ candidate, onDrop, onTransition, transition }) => {
  const style: any = useMemo(
    () => ({
      '--CurrentCandidateView-left': `${transition.x}px`,
      '--CurrentCandidateView-top': `${transition.y}px`,
    }),
    [transition]
  );

  const candidateImageStyle: any = useMemo(
    () => ({ '--CandidateImage-width': `${64}px` }),
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
