import { CSSProperties } from 'react';
import { Candidate } from '../models/Candidate';
import styles from './CandidateImage.module.scss';
import { jcn } from '../util/joinClassNames';

export const CandidateImage: React.FC<{
  candidate: Candidate;
  className?: string;
  style?: CSSProperties;
}> = ({ candidate, className, style }) => {
  return (
    <img
      alt={candidate.name}
      className={jcn([styles.root, className])}
      height="128"
      src={candidate.image}
      style={style}
      width="128"
    />
  );
};
