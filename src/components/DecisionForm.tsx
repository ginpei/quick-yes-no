import { useCallback, useEffect, useState } from 'react';
import { Candidate } from '../models/Candidate';
import { Category } from '../models/Category';
import { Question } from '../models/Question';
import { DecisionFlicker, OnDecide } from './DecisionFlicker';

// TODO extract
export interface Decision {
  candidate: Candidate;
  category: Category;
}

/**
 * Stateful component of `DecisionFlicker`.
 */
export const DecisionForm: React.FC<{
  onDecide?: OnDecide;
  question: Question;
}> = ({ onDecide, question }) => {
  const [current, setCurrent] = useState<Candidate | null>(null);
  const [restCandidates, setRestCandidates] = useState<Candidate[]>([]);
  const [width, setWidth] = useState(0);

  const onFlickerDecide: OnDecide = useCallback(
    (decision) => {
      const next = restCandidates[0] || null;
      setCurrent(next);
      setRestCandidates(restCandidates.slice(1));

      if (onDecide) {
        onDecide(decision);
      }
    },
    [restCandidates]
  );

  useEffect(() => {
    setCurrent(question.candidates[0]);
    setRestCandidates(question.candidates.slice(1));
  }, [question]);

  useEffect(() => {
    const maxWidth = 800;
    const fn = () =>
      setWidth(
        Math.min(
          maxWidth,
          document.documentElement.clientWidth,
          document.documentElement.clientHeight * 0.7
        )
      );
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <DecisionFlicker
      candidate={current}
      categories={question.categories}
      onDecide={onFlickerDecide}
      restCandidates={restCandidates}
      width={width}
    />
  );
};
