import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BasicLayout } from '../../../src/components/BasicLayout';
import {
  DecisionFlicker,
  OnDecide,
} from '../../../src/components/DecisionFlicker';
import { Candidate } from '../../../src/models/Candidate';
import { Category } from '../../../src/models/Category';
import { getQuestionPath, Question } from '../../../src/models/Question';
import { useQuestionPagePrep } from '../../../src/models/useQuestionPagePrep';

// TODO extract
interface Decision {
  candidate: Candidate;
  category: Category;
}

const QuestionViewPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;

  const [el, question] = useQuestionPagePrep(questionId);

  if (!question) {
    return el;
  }

  return (
    <BasicLayout className="ui-container QuestionViewPage">
      <h1>{question.title || '(No title)'}</h1>
      <p>
        <Link {...getQuestionPath(null)}>
          <a>Index</a>
        </Link>
        {' | '}
        <Link {...getQuestionPath(question, 'edit')}>
          <a>Edit</a>
        </Link>
      </p>
      <DecisionForm question={question} />
    </BasicLayout>
  );
};

export default QuestionViewPage;

const DecisionForm: React.FC<{ question: Question }> = ({ question }) => {
  const [current, setCurrent] = useState<Candidate | null>(
    question.candidates[0]
  );
  const [recent, setRecent] = useState<Decision | null>(null);
  const [restCandidates, setRestCandidates] = useState(
    question.candidates.slice(1)
  );
  const [width, setWidth] = useState(0);

  const onDecide: OnDecide = useCallback(
    ({ candidate, category }) => {
      setRecent({ candidate, category });

      const next = restCandidates[0] || null;
      setCurrent(next);
      setRestCandidates(restCandidates.slice(1));
    },
    [restCandidates]
  );

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
      onDecide={onDecide}
      restCandidates={restCandidates}
      width={width}
    />
  );
};
