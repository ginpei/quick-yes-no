import firebase from 'firebase/app';
import 'firebase/firestore';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useState } from 'react';
import { BasicLayout } from '../../../src/components/BasicLayout';
import { Answer, useAnswersOf } from '../../../src/models/Answer';
import { initializeFirebase } from '../../../src/models/firebase';
import { getQuestionPath, Question } from '../../../src/models/Question';
import { useQuestionPagePrep } from '../../../src/models/useQuestionPagePrep';
import ErrorPage from '../../../src/screens/ErrorPage';
import LoadingPage from '../../../src/screens/LoadingPage';

type Prep = [JSX.Element] | [null, Question, Answer[], Error | null];

initializeFirebase();
const fs = firebase.firestore();

const QuestionViewPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;
  if (questionId instanceof Array) {
    throw new Error();
  }

  const [errorMessage, setErrorMessage] = useState('');
  const [el, question, answers, error] = usePrep(questionId);

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!question || !answers) {
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
        <Link {...getQuestionPath(question, 'view')}>
          <a>View</a>
        </Link>
        {' | '}
        <Link {...getQuestionPath(question, 'edit')}>
          <a>Edit</a>
        </Link>
      </p>
      {errorMessage && <p>{errorMessage}</p>}
      <ul>
        {answers.map((answer) => (
          <li key={answer.id}>
            {answer.candidate} → {answer.category}
          </li>
        ))}
      </ul>
    </BasicLayout>
  );
};

export default QuestionViewPage;

function usePrep(questionId: string | undefined): Prep {
  const [el, question] = useQuestionPagePrep(questionId);
  const [answers, answersReady, answersError] = useAnswersOf(fs, questionId);

  if (el) {
    return [el];
  }

  if (!answersReady) {
    return [<LoadingPage />];
  }

  if (!question) {
    throw new Error();
  }

  return [null, question, answers, answersError];
}
