import { firestore } from 'firebase/app';
import 'firebase/firestore';
import { Candidate, createCandidate } from './Candidate';
import { Category, createCategory } from './Category';
import { createDbRecord, DbRecord, setTimestamps } from './DbRecord';

export interface Answer extends DbRecord {
  candidate: Candidate['name'];
  category: Category['name'];
  userId: string;
}

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
