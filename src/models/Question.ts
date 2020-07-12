import { firestore } from 'firebase/app';
import { useEffect, useState } from 'react';
import { Candidate } from './Candidate';
import { Category } from './Category';
import { createDbRecord, DbRecord, setTimestamps } from './DbRecord';

export interface Question extends DbRecord {
  title: string;
  candidates: Candidate[];
  categories: Category[];
  userId: string;
}

export type QuestionAction =
  | 'new'
  | 'index'
  | 'view'
  | 'details'
  | 'edit'
  | 'delete';

export function createQuestion(initial?: Partial<Question>): Question {
  return {
    title: '',
    candidates: [],
    categories: [],
    userId: '',
    ...createDbRecord(),
    ...initial,
  };
}

export function getQuestionPath(
  question: Question | null,
  action: QuestionAction = 'view'
): { as: string; href: string } {
  if (!question) {
    if (action === 'new') {
      return { as: '/questions/new', href: '/questions/new' };
    }
    return { as: '/questions', href: '/questions' };
  }

  const hrefBase = '/questions/[questionId]/';
  const asBase = `/questions/${question.id}/`;

  if (action === 'view') {
    return { as: asBase, href: hrefBase };
  }

  return { as: `${asBase}${action}`, href: `${hrefBase}${action}` };
}

export async function saveQuestion(
  fs: firestore.Firestore,
  question: Question
): Promise<Question> {
  const coll = getCollection(fs);

  const presentQuestion = setTimestamps(question);

  if (presentQuestion.id) {
    await coll.doc(presentQuestion.id).set(presentQuestion);
    return presentQuestion;
  }

  const refQuestion = await coll.add(presentQuestion);
  return ssToQuestion(await refQuestion.get());
}

export async function getLatestQuestions(
  fs: firestore.Firestore
): Promise<Question[]> {
  const coll = getCollection(fs);
  const snapshot = await coll.orderBy('createdAt', 'desc').get();
  const questions = snapshot.docs.map((v) => ssToQuestion(v));
  return questions;
}

export async function getLatestQuestion(
  fs: firestore.Firestore,
  id: string
): Promise<Question | null> {
  const coll = getCollection(fs);
  const snapshot = await coll.doc(id).get();
  if (!snapshot.exists) {
    return null;
  }

  const question = ssToQuestion(snapshot);
  return question;
}

/**
 * Returns the latest question at the moment.
 */
export function useLatestQuestions(
  fs: firestore.Firestore
): [Question[], boolean] {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getLatestQuestions(fs).then((v) => {
      setQuestions(v);
      setReady(true);
    });
  }, [fs]);

  return [questions, ready];
}

export function useLatestQuestion(
  fs: firestore.Firestore,
  id: string
): [Question | null, boolean, Error | null] {
  const [question, setQuestion] = useState<Question | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setError(null);
    getLatestQuestion(fs, id)
      .then((result) => {
        setQuestion(result);
        setReady(true);
      })
      .catch((e) => {
        setReady(true);
        setError(e);
      });
  }, [fs, id]);

  return [question, ready, error];
}

function getCollection(
  fs: firestore.Firestore
): firestore.CollectionReference<firestore.DocumentData> {
  return fs.collection('quick-yesno-questions');
}

function ssToQuestion(
  obj:
    | firestore.QueryDocumentSnapshot<firestore.DocumentData>
    | firestore.DocumentSnapshot<firestore.DocumentData>
): Question {
  // TODO implement
  const question = { ...(obj.data() as any), id: obj.id };
  return question;
}
