import { CSSProperties, useMemo } from 'react';
import { cssVar } from '../util/cssVar';
import styles from './DecisionCategoryView.module.scss';
import { CategoryLayout } from './DecisionFlicker';

export const DecisionCategoryView: React.FC<{
  hovered: boolean;
  layout: CategoryLayout;
}> = ({ hovered, layout }) => {
  const style: CSSProperties = useMemo(
    () =>
      cssVar({
        '--CategoryView-left': `${layout.x}px`,
        '--CategoryView-top': `${layout.y}px`,
        '--CategoryView-width': `${layout.width}px`,
      }),
    [layout]
  );
  return (
    <div className={styles.root} style={style}>
      <div
        className={styles.content}
        data-category-id={layout.category.name}
        data-hovered={hovered}
      >
        {layout.category.name}
      </div>
    </div>
  );
};
