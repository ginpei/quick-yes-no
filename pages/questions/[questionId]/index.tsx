import firebase from 'firebase/app';
import 'firebase/firestore';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BasicLayout } from '../../../src/components/BasicLayout';
import { CandidateImage } from '../../../src/components/CandidateImage';
import { useFirebaseAuth } from '../../../src/hooks/useFirebaseAuth';
import { Answer, useAnswersOf } from '../../../src/models/Answer';
import { Candidate } from '../../../src/models/Candidate';
import { initializeFirebase } from '../../../src/models/firebase';
import {
  getQuestionPath,
  isQuestionAuthor,
  Question,
} from '../../../src/models/Question';
import { useQuestionPagePrep } from '../../../src/models/useQuestionPagePrep';
import ErrorPage from '../../../src/screens/ErrorPage';
import LoadingPage from '../../../src/screens/LoadingPage';
import styles from './index.module.scss';

type Prep =
  | [JSX.Element]
  | [null, Question, Answer[], firebase.User | null, Error | null];

type AnswerCounts = Map<string, number>;
type AnswerMap = Map<string, AnswerCounts>;

initializeFirebase();
const auth = firebase.auth();
const fs = firebase.firestore();

const QuestionViewPage: React.FC = () => {
  const router = useRouter();
  const { questionId } = router.query;
  if (questionId instanceof Array) {
    throw new Error();
  }

  const [el, question, answers, user, error] = usePrep(questionId);

  const title = useMemo(() => question?.title || '(No title)', [question]);
  const answerMap = useMemo(() => createAnswerMap(answers), [answers]);

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!question || !answers) {
    return el;
  }

  return (
    <BasicLayout className="ui-container QuestionViewPage" title={title}>
      <h1>{title}</h1>
      <p>
        <Link {...getQuestionPath(null)}>
          <a>Index</a>
        </Link>
        {' | '}
        <Link {...getQuestionPath(question, 'answer')}>
          <a>Answer</a>
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
      {question.candidates.map((candidate) => (
        <CandidateItem
          answerCounts={answerMap.get(candidate.name) ?? null}
          candidate={candidate}
          key={candidate.name}
        />
      ))}
    </BasicLayout>
  );
};

export default QuestionViewPage;

const CandidateItem: React.FC<{
  answerCounts: AnswerCounts | null;
  candidate: Candidate;
}> = ({ answerCounts, candidate }) => {
  const answers: string = useMemo(() => {
    const arr: [number, string][] = [];
    if (!answerCounts) {
      return '';
    }

    answerCounts.forEach((count, categoryName) => {
      arr.push([count, `${categoryName} (${count})`]);
    });

    arr.sort(([c1], [c2]) => c1 - c2);
    const result = arr.map(([, v]) => v).join(', ');
    return result;
  }, [answerCounts]);

  return (
    <div className={styles.CandidateItem}>
      <CandidateImage candidate={candidate} width={16} />{' '}
      <code>:{candidate.name}:</code>
      <br />
      {answers || (
        <span className={styles.CandidateItem_noAnswers}>(No answers yet)</span>
      )}
    </div>
  );
};

function usePrep(questionId: string | undefined): Prep {
  const [el, question] = useQuestionPagePrep(questionId);
  const [answers, answersReady, answersError] = useAnswersOf(fs, questionId);
  const [user, userReady] = useFirebaseAuth(auth);

  if (el) {
    return [el];
  }

  if (!answersReady || !userReady) {
    return [<LoadingPage />];
  }

  if (!question) {
    throw new Error();
  }

  return [null, question, answers, user, answersError];
}

function createAnswerMap(answers: Answer[] | undefined): AnswerMap {
  const map: AnswerMap = new Map();

  if (!answers) {
    return map;
  }

  console.time('createAnswerMap');
  answers.forEach(({ candidate, category }) => {
    if (!map.has(candidate)) {
      map.set(candidate, new Map());
    }

    const m = map.get(candidate);
    if (!m) {
      throw new Error();
    }

    m.set(category, m.get(category) || 0 + 1);
  });
  console.timeEnd('createAnswerMap');

  return map;
}
