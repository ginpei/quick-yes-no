import {
  CSSProperties,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Candidate } from '../models/Candidate';
import { config } from '../models/Config';
import { Pos } from '../models/Length';
import { cssVar } from '../util/cssVar';
import { CandidateImage } from './CandidateImage';
import styles from './DecisionCategoryView.module.scss';
import { CategoryLayout } from './DecisionFlicker';

const noop = () => {
  /* none */
};

// TODO replace with state somehow
const activeAnimationId = 0;

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

  const [eating, setEating] = useState(false);

  const style: CSSProperties = useMemo(
    () =>
      cssVar({
        '--CategoryView-eatDuration': `${2 * config.duration}ms`,
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

  const onAnimationEnd = useCallback(() => {
    setEating(false);
  }, []);

  useEffect(() => {
    if (!decidedCandidate) {
      return noop;
    }

    // use double rAF to prevent the latest decision
    // from continuing the last animation when you made decision so quickly
    // (any better way?)
    let id = requestAnimationFrame(() => {
      setEating(false);
      id = requestAnimationFrame(() => setEating(true));
    });
    return () => cancelAnimationFrame(id);
  }, [decidedCandidate]);

  return (
    <div
      className={styles.root}
      data-eating={eating}
      onAnimationEnd={onAnimationEnd}
      style={style}
    >
      <div className={styles.content} data-hovered={hovered} ref={refCategory}>
        {layout.category.name}
      </div>
      <LastCandidateView
        candidate={decidedCandidate}
        categoryPos={layout}
        refAnimationTarget={refCandidate}
        pos={candidatePos}
      />
    </div>
  );
};

const LastCandidateView: React.FC<{
  candidate: Candidate | null;
  categoryPos: Pos;
  refAnimationTarget: RefObject<HTMLDivElement>;
  pos: Pos;
}> = ({ candidate, categoryPos, refAnimationTarget, pos }) => {
  const style: CSSProperties = useMemo(() => {
    const dTop = -config.candidateImageWidth / 2;
    return cssVar({
      '--LastCandidateView-destination-left': `${0}px`,
      '--LastCandidateView-destination-top': `${dTop}px`,
      '--LastCandidateView-left': `${pos.x}px`,
      '--LastCandidateView-top': `${pos.y}px`,
    });
  }, [categoryPos, pos]);

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
