import firebase from 'firebase/app';
import { ParsedUrlQuery } from 'querystring';
import ErrorPage from '../screens/ErrorPage';
import LoadingPage from '../screens/LoadingPage';
import NotFoundPage from '../screens/NotFoundPage';
import { initializeFirebase } from './firebase';
import { Question, useLatestQuestion } from './Question';

export type QuestionPagePrep = [JSX.Element] | [null, Question];

initializeFirebase();
const fs = firebase.firestore();

export function useQuestionPagePrep(
  id: ParsedUrlQuery[number]
): QuestionPagePrep {
  if (id instanceof Array) {
    throw new Error('Invalid parameter "questionId"');
  }

  const [question, questionReady, questionError] = useLatestQuestion(
    fs,
    id || ''
  );

  if (typeof id !== 'string' || !questionReady) {
    return [<LoadingPage />];
  }

  if (questionError) {
    return [<ErrorPage error={questionError} />];
  }

  if (!question) {
    return [<NotFoundPage />];
  }

  return [null, question];
}
