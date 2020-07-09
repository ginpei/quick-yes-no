import { CSSProperties, useMemo } from 'react';
import { Candidate } from '../models/Candidate';
import { cssVar } from '../util/cssVar';
import { jcn } from '../util/joinClassNames';
import styles from './CandidateImage.module.scss';

export const CandidateImage: React.FC<{
  candidate: Candidate;
  className?: string;
  style?: CSSProperties;
  width?: number;
}> = ({ candidate, className, style, width }) => {
  const baseStyle: CSSProperties = useMemo(
    () =>
      width === undefined
        ? {}
        : cssVar({
            '--CandidateImage-width': `${width}px`,
          }),
    [width]
  );

  const wholeStyle: CSSProperties = useMemo(
    () => ({ ...baseStyle, ...style }),
    [baseStyle, style]
  );

  return (
    <img
      alt={candidate.name}
      className={jcn([styles.root, className])}
      height="128"
      src={candidate.image}
      style={wholeStyle}
      width="128"
    />
  );
};
