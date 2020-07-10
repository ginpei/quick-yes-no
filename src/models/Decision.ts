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

export type DecisionAction = 'new' | 'index' | 'view' | 'update' | 'delete';

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

export function getDecisionPath(
  decision: Decision | null,
  action: DecisionAction = 'view'
): { as: string; href: string } {
  if (!decision) {
    return { as: '/decisions/new', href: '/decisions/new' };
  }

  const hrefBase = '/decisions/[decisionId]/';
  const asBase = `/decisions/${decision.id}/`;

  if (action === 'view') {
    return { as: asBase, href: hrefBase };
  }

  return { as: `${asBase}${action}`, href: `${hrefBase}${action}` };
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
