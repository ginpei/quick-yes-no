import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Candidate } from '../models/Candidate';
import { Category } from '../models/Category';
import { config } from '../models/Config';
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

export const DecisionFlicker: React.FC<{
  candidate: Candidate | null;
  categories: Category[];
  onDecide: OnDecide;
  restCandidates: Candidate[];
  width: number;
}> = ({ candidate, categories, onDecide, restCandidates, width }) => {
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
      {restCandidates.slice(0, 5).map((liningCandidate, index) => (
        <LiningCandidateView
          candidate={liningCandidate}
          index={index}
          key={liningCandidate.name}
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

const LiningCandidateView: React.FC<{
  candidate: Candidate;
  index: number;
}> = ({ candidate, index }) => {
  const style: CSSProperties = useMemo(
    () => ({
      ...cssVar({
        '--LiningCandidateView-index': String(index),
        '--LiningCandidateView-width': `${config.candidateImageWidth}px`,
      }),
    }),
    [index]
  );

  return (
    <div className={styles.LiningCandidateView} style={style}>
      <CandidateImage
        candidate={candidate}
        width={config.candidateImageWidth}
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
  const [decided, setDecided] = useState(false);

  const moving: boolean = useMemo(
    () => transition.x !== 0 && transition.y !== 0,
    [transition]
  );

  const style: CSSProperties = useMemo(
    () =>
      cssVar({
        '--CurrentCandidateView-left': `${transition.x}px`,
        '--CurrentCandidateView-top': `${transition.y}px`,
      }),
    [transition]
  );

  const candidateImageStyle: CSSProperties = useMemo(
    () =>
      cssVar({ '--CandidateImage-width': `${config.candidateImageWidth}px` }),
    []
  );

  useEffect(() => {
    setDecided(true);
    const id = requestAnimationFrame(() => setDecided(false));
    return () => cancelAnimationFrame(id);
  }, [candidate]);

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
    <div
      className={styles.CurrentCandidateView}
      data-decided={decided}
      data-moving={moving}
      style={style}
    >
      <DragItem
        isDraggable={true}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      >
        <div className="ui-fill ui-center">
          <CandidateImage
            candidate={candidate}
            className={styles.candidateView}
            style={candidateImageStyle}
          />
        </div>
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
    const center: Pos = {
      x: layout.x,
      y: layout.y - config.candidateImageWidth / 2,
    };
    const distance = measureDistance(center, transition);
    if (distance < min && distance < range) {
      min = distance;
      nearest = layout.category;
    }
  });

  return nearest;
}
