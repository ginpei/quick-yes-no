import firebase from 'firebase/app';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { BasicLayout } from '../../../src/components/BasicLayout';
import { initializeFirebase } from '../../../src/models/firebase';
import {
  getQuestionPath,
  useLatestQuestion,
} from '../../../src/models/Question';
import ErrorPage from '../../../src/screens/ErrorPage';
import LoadingPage from '../../../src/screens/LoadingPage';
import NotFoundPage from '../../../src/screens/NotFoundPage';

initializeFirebase();
const fs = firebase.firestore();

const QuestionViewPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;

  if (questionId instanceof Array) {
    throw new Error('Invalid parameter "questionId"');
  }

  const [question, questionReady, questionError] = useLatestQuestion(
    fs,
    questionId || ''
  );

  if (typeof questionId !== 'string' || !questionReady) {
    return <LoadingPage />;
  }

  if (questionError) {
    return <ErrorPage error={questionError} />;
  }

  if (!question) {
    return <NotFoundPage />;
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
