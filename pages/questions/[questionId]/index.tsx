import firebase from 'firebase/app';
import { useRouter } from 'next/dist/client/router';
import { BasicLayout } from '../../../src/components/BasicLayout';
import { initializeFirebase } from '../../../src/models/firebase';
import { useLatestQuestion } from '../../../src/models/Question';
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

  const [question, questionReady] = useLatestQuestion(fs, questionId || '');

  if (typeof questionId !== 'string' || !questionReady) {
    return <LoadingPage />;
  }

  if (!question) {
    return <NotFoundPage />;
  }

  return (
    <BasicLayout className="ui-container QuestionViewPage">
      <h1>{question.title || '(No title)'}</h1>
      <p>
        <code>{questionId}</code>
      </p>
    </BasicLayout>
  );
};

export default QuestionViewPage;
