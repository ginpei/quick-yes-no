import { Candidate } from './Candidate';
import { Category } from './Category';

export interface Decision {
  title: string;
  id: string;
  candidates: Candidate[];
  categories: Category[];
}

export function createDecision(initial?: Partial<Decision>): Decision {
  return {
    title: '',
    id: '',
    candidates: [],
    categories: [],
    ...initial,
  };
}
