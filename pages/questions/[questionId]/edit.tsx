import firebase from 'firebase/app';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { BasicLayout } from '../../../src/components/BasicLayout';
import {
  QuestionCallback,
  QuestionForm,
} from '../../../src/components/QuestionForm';
import { useFirebaseAuth } from '../../../src/hooks/useFirebaseAuth';
import { initializeFirebase } from '../../../src/models/firebase';
import {
  getQuestionPath,
  isQuestionAuthor,
  Question,
  saveQuestion,
} from '../../../src/models/Question';
import { useQuestionPagePrep } from '../../../src/models/useQuestionPagePrep';
import ErrorPage from '../../../src/screens/ErrorPage';
import LoadingPage from '../../../src/screens/LoadingPage';
import { sleep } from '../../../src/util/sleep';

initializeFirebase();
const auth = firebase.auth();
const fs = firebase.firestore();

const QuestionEditPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;

  const [formDisabled, setFormDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, userReady] = useFirebaseAuth(auth);
  const [el, initialQuestion] = useQuestionPagePrep(questionId);
  const title = useMemo(() => initialQuestion?.title || '(No title)', [
    initialQuestion,
  ]);

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

  if (!userReady) {
    return <LoadingPage />;
  }

  if (!initialQuestion) {
    return el;
  }

  if (!isQuestionAuthor(initialQuestion, user)) {
    return <ErrorPage error={new Error('Permission denied')} />;
  }

  return (
    <BasicLayout
      className="ui-container QuestionEditPage"
      title={`Edit - ${title}`}
    >
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
