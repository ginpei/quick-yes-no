export interface Category {
  description: string;
  name: string;
}

export const decomojiCategories: Category[] = [
  {
    description: '基礎セット',
    name: 'basic',
  },
  {
    description: '',
    name: 'paid',
  },
  {
    description: 'なんかこう露骨なもの、人によっては気分を害するもの',
    name: 'explicit',
  },
  {
    description: 'エロス',
    name: 'r18',
  },
  {
    description: '好きな人は入れよう',
    name: 'extra',
  },
];

export function createCategory(initial: Partial<Category>): Category {
  return {
    description: '',
    name: '',
    ...initial,
  };
}
