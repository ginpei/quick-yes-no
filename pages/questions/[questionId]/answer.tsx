import firebase from 'firebase/app';
import 'firebase/firestore';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { BasicLayout } from '../../../src/components/BasicLayout';
import { OnDecide } from '../../../src/components/DecisionFlicker';
import { InteractiveAnswerForm } from '../../../src/components/InteractiveAnswerForm';
import { useFirebaseAuth } from '../../../src/hooks/useFirebaseAuth';
import { createAnswer, saveAnswer } from '../../../src/models/Answer';
import { initializeFirebase } from '../../../src/models/firebase';
import {
  getQuestionPath,
  isQuestionAuthor,
} from '../../../src/models/Question';
import { useQuestionPagePrep } from '../../../src/models/useQuestionPagePrep';
import NeedLoginPage from '../../../src/screens/NeedLoginPage';

initializeFirebase();
const auth = firebase.auth();
const fs = firebase.firestore();

const QuestionViewPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;

  const [errorMessage, setErrorMessage] = useState('');
  const [user, userReady] = useFirebaseAuth(auth);
  const [el, question] = useQuestionPagePrep(questionId);
  const title = useMemo(() => question?.title || '(No title)', [question]);

  const onDecide: OnDecide = useCallback(
    async ({ candidate, category }) => {
      if (!question || !user) {
        throw new Error('Question or user have gone');
      }

      try {
        const answer = createAnswer({
          candidate: candidate.name,
          category: category.name,
          userId: user.uid,
        });
        await saveAnswer(fs, question.id, answer);
      } catch (error) {
        setErrorMessage(error?.message ?? 'Unknown error');
      }
    },
    [question, user]
  );

  if (!question) {
    return el;
  }

  if (userReady && !user) {
    return <NeedLoginPage />;
  }

  return (
    <BasicLayout
      className="ui-container QuestionViewPage"
      title={`Answer - ${title}`}
    >
      <h1>{question.title || '(No title)'}</h1>
      <p>
        <Link {...getQuestionPath(null)}>
          <a>Index</a>
        </Link>
        {' | '}
        <Link {...getQuestionPath(question, 'view')}>
          <a>Details</a>
        </Link>
        {isQuestionAuthor(question, user) && (
          <>
            {' | '}
            <Link {...getQuestionPath(question, 'edit')}>
              <a>Edit</a>
            </Link>
          </>
        )}
      </p>
      {errorMessage && <p>{errorMessage}</p>}
      <InteractiveAnswerForm onDecide={onDecide} question={question} />
    </BasicLayout>
  );
};

export default QuestionViewPage;
