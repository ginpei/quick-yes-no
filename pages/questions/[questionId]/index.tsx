import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { BasicLayout } from '../../../src/components/BasicLayout';
import { getQuestionPath } from '../../../src/models/Question';
import { useQuestionPagePrep } from '../../../src/models/useQuestionPagePrep';

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
      <p>
        <code>{questionId}</code>
      </p>
    </BasicLayout>
  );
};

export default QuestionViewPage;
