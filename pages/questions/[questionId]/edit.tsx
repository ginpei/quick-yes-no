import firebase from 'firebase/app';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { BasicLayout } from '../../../src/components/BasicLayout';
import {
  QuestionCallback,
  QuestionForm,
} from '../../../src/components/QuestionForm';
import { useFirebaseAuth } from '../../../src/hooks/useFirebaseAuth';
import { initializeFirebase } from '../../../src/models/firebase';
import {
  getQuestionPath,
  Question,
  saveQuestion,
  useLatestQuestion,
} from '../../../src/models/Question';
import ErrorPage from '../../../src/screens/ErrorPage';
import LoadingPage from '../../../src/screens/LoadingPage';
import NeedLoginPage from '../../../src/screens/NeedLoginPage';
import NotFoundPage from '../../../src/screens/NotFoundPage';
import { sleep } from '../../../src/util/sleep';

initializeFirebase();
const fs = firebase.firestore();
const auth = firebase.auth();

const QuestionEditPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;

  const [formDisabled, setFormDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, userReady] = useFirebaseAuth(auth);

  if (questionId instanceof Array) {
    throw new Error('Invalid parameter "questionId"');
  }

  const [initialQuestion, questionReady, questionError] = useLatestQuestion(
    fs,
    (userReady && questionId) || ''
  );

  const onQuestionSubmit: QuestionCallback = useCallback(
    async (newQuestion: Question) => {
      setFormDisabled(true);
      setErrorMessage('');

      try {
        const userId = user?.uid;
        if (!userId) {
          throw new Error('You must log in');
        }

        const [savedQuestion] = await Promise.all([
          saveQuestion(fs, { ...newQuestion, userId }),
          sleep(500),
        ]);

        const url = getQuestionPath(savedQuestion);
        window.location.replace(url.as);
      } catch (error) {
        console.log('Question', newQuestion);
        console.error(error);
        setErrorMessage(error?.message ?? 'Unknown error');
        setFormDisabled(false);
      }
    },
    [user]
  );

  if (typeof questionId !== 'string' || !questionReady || !userReady) {
    return <LoadingPage />;
  }

  if (!user) {
    return <NeedLoginPage />;
  }

  if (questionError) {
    return <ErrorPage error={questionError} />;
  }

  if (!initialQuestion) {
    return <NotFoundPage />;
  }

  return (
    <BasicLayout className="ui-container QuestionEditPage">
      <h1>Edit</h1>
      <Link {...getQuestionPath(null)}>
        <a>Index</a>
      </Link>
      {' | '}
      <Link {...getQuestionPath(initialQuestion, 'view')}>
        <a>View</a>
      </Link>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      <FormContainer
        disabled={formDisabled}
        onSubmit={onQuestionSubmit}
        question={initialQuestion}
      />
    </BasicLayout>
  );
};

const FormContainer: React.FC<{
  disabled: boolean;
  onSubmit: QuestionCallback;
  question: Question;
}> = ({ disabled, onSubmit, question: originalQuestion }) => {
  const [question, setQuestion] = useState(originalQuestion);

  const onQuestionChange: QuestionCallback = useCallback(
    (newQuestion: Question) => {
      setQuestion(newQuestion);
    },
    []
  );

  return (
    <QuestionForm
      disabled={disabled}
      onChange={onQuestionChange}
      onSubmit={onSubmit}
      question={question}
    />
  );
};

export default QuestionEditPage;
