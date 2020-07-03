import { CSSProperties, useMemo } from 'react';
import { Candidate } from '../models/Candidate';
import { Category } from '../models/Category';
import { CandidateImage } from './CandidateImage';
import styles from './DecisionFlicker.module.scss';

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
  return (
    <div className={styles.root} style={{ height: width / 2, width }}>
      {categories.map((category, index) => (
        <CategoryView
          category={category}
          key={category.name}
          containerWidth={width}
          position={index / (categories.length - 1)}
        />
      ))}
      <CandidateImage
        candidate={candidate}
        className={styles.candidateView}
        style={{ '--CandidateImage-width': `${64}px` } as any}
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
