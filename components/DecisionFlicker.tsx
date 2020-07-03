import { CSSProperties, useMemo, useCallback, useState } from 'react';
import { Candidate } from '../models/Candidate';
import { Category } from '../models/Category';
import { CandidateImage } from './CandidateImage';
import styles from './DecisionFlicker.module.scss';
import DragItem, { DragCallback } from './DragItem';
import { Pos, subtractPos } from '../models/Length';

export type OnDecide = (result: {
  candidate: Candidate;
  category: Category;
}) => void;

export const DecisionFlicker: React.FC<{
  candidate: Candidate;
  categories: Category[];
  onDecide?: OnDecide;
  width: number;
}> = ({ candidate, categories, onDecide, width }) => {
  const [candidateTransition, setCandidateTransition] = useState<Pos>({
    x: 0,
    y: 0,
  });

  const onCandidateTransition = useCallback((transition: Pos) => {
    setCandidateTransition(transition);
  }, []);

  return (
    <div
      className={styles.root}
      style={{ '--DecisionFlicker-width': `${width}px` } as any}
    >
      {categories.map((category, index) => (
        <CategoryView
          category={category}
          key={category.name}
          containerWidth={width}
          position={index / (categories.length - 1)}
        />
      ))}
      <CurrentCandidateView
        candidate={candidate}
        transition={candidateTransition}
        onTransition={onCandidateTransition}
      />
    </div>
  );
};

const CategoryView: React.FC<{
  category: Category;
  containerWidth: number;
  position: number;
}> = ({ category, containerWidth, position }) => {
  const style = useMemo(
    () => ({
      ...createCategoryLayoutStyle(position),
      '--CategoryView-width': `${containerWidth / 4}px`,
    }),
    [position, containerWidth]
  );
  return (
    <div className={styles.CategoryView} style={style}>
      {category.name}
    </div>
  );
};

const CurrentCandidateView: React.FC<{
  candidate: Candidate;
  onTransition: (transition: Pos) => void;
  transition: Pos;
}> = ({ candidate, onTransition, transition }) => {
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

  const onDragMove: DragCallback = useCallback(({ from, to }) => {
    onTransition(subtractPos(to, from));
  }, []);

  const onDragEnd: DragCallback = useCallback(() => {
    onTransition({ x: 0, y: 0 });
  }, []);

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

/**
 * @param position `0`-`1`; `0` is right, `0.5` is above, `1` is left
 * @param containerWidth In px
 */
function createCategoryLayoutStyle(position: number): CSSProperties {
  return {
    '--CategoryView-cos': Math.cos(Math.PI * -position),
    '--CategoryView-sin': Math.sin(Math.PI * -position),
  } as any;
}
