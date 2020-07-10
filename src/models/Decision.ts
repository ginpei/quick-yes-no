import { firestore } from 'firebase';
import { Candidate } from './Candidate';
import { Category } from './Category';

export interface Decision {
  title: string;
  id: string;
  candidates: Candidate[];
  categories: Category[];
  userId: string;
}

export function createDecision(initial?: Partial<Decision>): Decision {
  return {
    title: '',
    id: '',
    candidates: [],
    categories: [],
    userId: '',
    ...initial,
  };
}

export async function saveDecision(
  fs: firestore.Firestore,
  decision: Decision
): Promise<Decision> {
  const coll = fs.collection('quick-yesno-decisions');

  if (decision.id) {
    await coll.doc(decision.id).set(decision);
    return decision;
  }

  const refDecision = await coll.add(decision);
  return { ...decision, id: refDecision.id };
}
