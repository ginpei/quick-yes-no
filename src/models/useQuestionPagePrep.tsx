import firebase from 'firebase/app';
import { ParsedUrlQuery } from 'querystring';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import ErrorPage from '../screens/ErrorPage';
import LoadingPage from '../screens/LoadingPage';
import NeedLoginPage from '../screens/NeedLoginPage';
import NotFoundPage from '../screens/NotFoundPage';
import { initializeFirebase } from './firebase';
import { Question, useLatestQuestion } from './Question';

export type QuestionPagePrep = [JSX.Element] | [null, Question, firebase.User];

initializeFirebase();
const auth = firebase.auth();
const fs = firebase.firestore();

export function useQuestionPagePrep(
  id: ParsedUrlQuery[number]
): QuestionPagePrep {
  const [user, userReady] = useFirebaseAuth(auth);

  if (id instanceof Array) {
    throw new Error('Invalid parameter "questionId"');
  }

  const [question, questionReady, questionError] = useLatestQuestion(
    fs,
    (user && id) || ''
  );

  if (typeof id !== 'string' || !questionReady || !userReady) {
    return [<LoadingPage />];
  }

  if (!user) {
    return [<NeedLoginPage />];
  }

  if (questionError) {
    return [<ErrorPage error={questionError} />];
  }

  if (!question) {
    return [<NotFoundPage />];
  }

  return [null, question, user];
}
