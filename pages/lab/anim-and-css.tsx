import { useCallback, useState, useMemo, CSSProperties } from 'react';
import styles from './anim-and-css.module.scss';
import { cssVar } from '../../util/cssVar';
import { jcn } from '../../util/joinClassNames';

const colorDefinitions = Object.freeze({
  p0: [
    '#ff7f7f',
    '#ff7fbf',
    '#ff7fff',
    '#bf7fff',
    '#7f7fff',
    '#7fbfff',
    '#7fffff',
    '#7fffbf',
    '#7fff7f',
    '#bfff7f',
    '#ffff7f',
    '#ffbf7f',
  ],
  p1: [
    '#ffc1c1',
    '#ffc1e0',
    '#ffc1ff',
    '#e0c1ff',
    '#c1c1ff',
    '#c1e0ff',
    '#c1ffff',
    '#c1ffe0',
    '#c1ffc1',
    '#e0ffc1',
    '#ffffc1',
    '#ffe0c1',
  ],
});

const AnimAndCssDemoPage: React.FC = () => {
  const [animating, setAnimating] = useState(false);

  const onAnimateClick = useCallback(() => {
    setAnimating(false);
    requestAnimationFrame(() => setAnimating(true));
  }, []);

  const onCancelAnimationClick = useCallback(() => {
    setAnimating(false);
  }, []);

  const onBoomerAnimationEnd = useCallback(() => {
    setAnimating(false);
  }, []);

  return (
    <div className={jcn(['ui-container', 'AnimAndCssDemoPage', styles.root])}>
      <p>
        {'Status: '}
        {animating ? 'animating' : 'ready'}
      </p>
      <p>
        <button onClick={onAnimateClick}>Animate</button>
        <button onClick={onCancelAnimationClick}>Cancel</button>
      </p>
      <div className="ui-center">
        <Boomer
          animating={animating}
          onAnimationEnd={onBoomerAnimationEnd}
          onClick={onAnimateClick}
        />
      </div>
    </div>
  );
};

export default AnimAndCssDemoPage;

const Boomer: React.FC<{
  animating: boolean;
  onAnimationEnd: (event: React.AnimationEvent<HTMLButtonElement>) => void;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ animating, onAnimationEnd, onClick }) => {
  return (
    <span className={styles.Boomer} data-animating={animating}>
      <button
        className={styles.Boomer_button}
        onAnimationEnd={onAnimationEnd}
        onClick={onClick}
      >
        🔥
      </button>
      {Array.from({ length: 7 }).map((_, index, { length }) => (
        <Particle index={index} key={index} length={length} />
      ))}
    </span>
  );
};

const Particle: React.FC<{ index: number; length: number }> = ({
  index,
  length,
}) => {
  const style: CSSProperties = useMemo(
    () => ({
      ...cssVar({
        '--partial-index': String(index + 1),
        '--partial-length': String(length),
      }),
      color: getColor(index, length, 'p0'),
    }),
    [index, length]
  );

  return (
    <span className={styles.Particle} style={style}>
      <span className={jcn(['ui-fill', styles.Particle_translate])}>
        <span className={jcn(['ui-fill', styles.Particle_visibility])}>
          <span className={jcn(['ui-fill', styles.Particle_content])}></span>
        </span>
      </span>
    </span>
  );
};

function getColor(
  index: number,
  length: number,
  type: keyof typeof colorDefinitions
): string {
  const colors = colorDefinitions[type];
  const arrIndex = Math.floor(colors.length * (index / length));
  const color = colors[arrIndex];
  return color;
}
