import firebase from 'firebase/app';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { BasicLayout } from '../../src/components/BasicLayout';
import {
  QuestionCallback,
  QuestionForm,
} from '../../src/components/QuestionForm';
import { useFirebaseAuth } from '../../src/hooks/useFirebaseAuth';
import {
  createQuestion,
  Question,
  saveQuestion,
  getQuestionPath,
} from '../../src/models/Question';
import { initializeFirebase } from '../../src/models/firebase';
import { sleep } from '../../src/util/sleep';

initializeFirebase();
const auth = firebase.auth();
const fs = firebase.firestore();

const NewQuestionPage: React.FC = () => {
  const [question, setQuestion] = useState(createQuestion());
  const [formDisabled, setFormDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [user, userReady] = useFirebaseAuth(auth);

  const onQuestionChange: QuestionCallback = useCallback(
    (newQuestion: Question) => {
      setQuestion(newQuestion);
    },
    []
  );

  const onQuestionSubmit: QuestionCallback = useCallback(
    async (newQuestion: Question) => {
      setQuestion(newQuestion);
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

        setQuestion(savedQuestion);

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
    return <div></div>;
  }

  if (!user) {
    return (
      <BasicLayout>
        <h1>Need to login</h1>
        <p>
          <Link href="/login">
            <a>Log in</a>
          </Link>
        </p>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <h1>NewQuestionPage</h1>
      <p>
        <Link {...getQuestionPath(null)}>
          <a>Index</a>
        </Link>
      </p>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      <QuestionForm
        disabled={formDisabled}
        question={question}
        onChange={onQuestionChange}
        onSubmit={onQuestionSubmit}
      />
    </BasicLayout>
  );
};

export default NewQuestionPage;
