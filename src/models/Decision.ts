import { firestore } from 'firebase';
import { useState, useEffect } from 'react';
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
    if (action === 'new') {
      return { as: '/decisions/new', href: '/decisions/new' };
    }
    return { as: '/decisions', href: '/decisions' };
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
  const coll = getCollection(fs);

  if (decision.id) {
    await coll.doc(decision.id).set(decision);
    return decision;
  }

  const refDecision = await coll.add(decision);
  return { ...decision, id: refDecision.id };
}

export async function getLatestDecisions(
  fs: firestore.Firestore
): Promise<Decision[]> {
  const coll = getCollection(fs);
  const snapshot = await coll.get();
  const decisions = snapshot.docs.map((v) => ssToDecision(v));
  return decisions;
}

/**
 * Returns the latest decisions at the moment.
 */
export function useLatestDecisions(
  fs: firestore.Firestore
): [Decision[], boolean] {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getLatestDecisions(fs).then((v) => {
      setDecisions(v);
      setReady(true);
    });
  }, []);

  return [decisions, ready];
}

function getCollection(
  fs: firestore.Firestore
): firestore.CollectionReference<firestore.DocumentData> {
  return fs.collection('quick-yesno-decisions');
}

function ssToDecision(
  obj: firestore.QueryDocumentSnapshot<firestore.DocumentData>
): Decision {
  const decision = { ...(obj.data() as any), id: obj.id };
  return decision;
}
