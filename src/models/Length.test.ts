import {
  calcLength,
  calcPos,
  calcSize,
  measureDistance,
  Pos,
  posToString,
  PxLength,
  PxSize,
  Size,
  UnitLength,
  UnitPos,
  UnitSize,
} from './Length';

describe('Length', () => {
  describe('calcLength()', () => {
    it('returns from px length', () => {
      const length: UnitLength = { unit: 'px', value: 11 };
      const container: PxLength = { unit: 'px', value: 200 };
      expect(calcLength(length, container)).toEqual(11);
    });

    it('returns from % length', () => {
      const length: UnitLength = { unit: '%', value: 11 };
      const container: PxLength = { unit: 'px', value: 200 };
      expect(calcLength(length, container)).toEqual(22);
    });

    it('returns from px length even if no container', () => {
      const length: UnitLength = { unit: 'px', value: 11 };
      expect(calcLength(length, null)).toEqual(11);
    });

    it('throws if in % but no container', () => {
      const length: UnitLength = { unit: '%', value: 11 };
      expect(() => calcLength(length, null)).toThrow();
    });
  });

  describe('calcSize()', () => {
    it('calculates complex units', () => {
      const size: UnitSize = {
        height: { unit: '%', value: 11 },
        width: { unit: 'px', value: 11 },
      };
      const container: Size = {
        height: 100,
        width: 100,
      };
      const expected: Size = {
        height: 11,
        width: 11,
      };
      expect(calcSize(size, container)).toEqual(expected);
    });
  });

  describe('posToString()', () => {
    it('returns readable text', () => {
      expect(posToString({ x: 123, y: 567 })).toBe('123, 567');
    });
  });

  describe('calcPos()', () => {
    it('calculates complex units', () => {
      const position: UnitPos = {
        horizontal: { unit: '%', value: 11 },
        vertical: { unit: 'px', value: 11 },
      };
      const container: PxSize = {
        height: { unit: 'px', value: 100 },
        width: { unit: 'px', value: 100 },
      };
      const expected: Pos = {
        x: 11,
        y: 11,
      };
      expect(calcPos(position, container)).toEqual(expected);
    });
  });

  describe('measureDistance()', () => {
    it('calculates distance', () => {
      const pos1: Pos = { x: 0, y: 0 };
      const pos2: Pos = { x: 3, y: 4 };
      expect(measureDistance(pos1, pos2)).toBe(5);
    });
  });
});
