import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useCallback } from 'react';
import { BasicLayout } from '../../../src/components/BasicLayout';
import { OnDecide } from '../../../src/components/DecisionFlicker';
import { DecisionForm } from '../../../src/components/DecisionForm';
import { getQuestionPath } from '../../../src/models/Question';
import { useQuestionPagePrep } from '../../../src/models/useQuestionPagePrep';

const QuestionViewPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;

  const [el, question] = useQuestionPagePrep(questionId);

  const onDecide: OnDecide = useCallback(({ candidate, category }) => {
    console.log('# candidate, category', candidate, category);
  }, []);

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
      <DecisionForm onDecide={onDecide} question={question} />
    </BasicLayout>
  );
};

export default QuestionViewPage;
