import { createAnswerMap, Answer, createAnswer } from './Answer';

describe('Answer', () => {
  describe('createAnswerMap()', () => {
    it('returns map', () => {
      const answers: Answer[] = [
        createAnswer({ candidate: 'item 1', category: 'category 1' }),
        createAnswer({ candidate: 'item 1', category: 'category 2' }),
        createAnswer({ candidate: 'item 1', category: 'category 1' }),
      ];
      const result = createAnswerMap(answers);
      expect(result.size).toBe(1);
      expect(result.get('item 1')?.size).toBe(2);
      expect(result.get('item 1')?.get('category 1')).toBe(2);
      expect(result.get('item 1')?.get('category 2')).toBe(1);
    });

    it('returns empty map for empty array', () => {
      const answers: Answer[] = [];
      const result = createAnswerMap(answers);
      expect(result.size).toBe(0);
    });
  });
});
