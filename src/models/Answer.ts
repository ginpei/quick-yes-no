import { firestore } from 'firebase/app';
import 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Candidate, createCandidate } from './Candidate';
import { Category, createCategory } from './Category';
import { createDbRecord, DbRecord, setTimestamps } from './DbRecord';

export interface Answer extends DbRecord {
  candidate: Candidate['name'];
  category: Category['name'];
  userId: string;
}

export type AnswerCounts = Map<string, number>;
export type AnswerMap = Map<string, AnswerCounts>;

export function createAnswer(initial?: Partial<Answer>): Answer {
  return {
    candidate: createCandidate().name,
    category: createCategory().name,
    userId: '',
    ...createDbRecord(),
    ...initial,
  };
}

export async function saveAnswer(
  fs: firestore.Firestore,
  questionId: string,
  answer: Answer
): Promise<Answer> {
  const coll = getCollection(fs, questionId);

  const presentAnswer = setTimestamps(answer);

  if (presentAnswer.id) {
    await coll.doc(presentAnswer.id).set(presentAnswer);
    return presentAnswer;
  }

  const refQuestion = await coll.add(presentAnswer);
  return ssToAnswer(await refQuestion.get());
}

export async function getAnswersOf(
  fs: firestore.Firestore,
  questionId: string
): Promise<Answer[]> {
  const coll = getCollection(fs, questionId);
  const snapshot = await coll.orderBy('createdAt', 'desc').get();
  const questions = snapshot.docs.map((v) => ssToAnswer(v));
  return questions;
}

export function createAnswerMap(answers: Answer[] | undefined): AnswerMap {
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

export function useAnswersOf(
  fs: firestore.Firestore,
  questionId: string | undefined
): [Answer[], boolean, Error | null] {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!questionId) {
      setAnswers([]);
      return;
    }

    getAnswersOf(fs, questionId)
      .then((v) => setAnswers(v))
      .catch((v) => setError(v))
      .finally(() => setReady(true));
  }, [fs, questionId]);

  return [answers, ready, error];
}

function getCollection(fs: firestore.Firestore, questionId: string) {
  return fs
    .collection('quick-yesno-questions')
    .doc(questionId)
    .collection('answers');
}

function ssToAnswer(
  obj:
    | firestore.QueryDocumentSnapshot<firestore.DocumentData>
    | firestore.DocumentSnapshot<firestore.DocumentData>
): Answer {
  // TODO implement
  const answer = { ...(obj.data() as any), id: obj.id };
  return answer;
}
