import { cssVar } from './cssVar';

describe('util/cssVar()', () => {
  it('returns the given object as React.CSSProperties', () => {
    const obj = {
      '--var': '123',
    };
    const result = cssVar(obj);
    expect(result).toBe(obj);
  });

  it('throws names if they are invalid as CSS var', () => {
    expect(() => {
      cssVar({
        '--ok': '123',
        'x--ng': '123',
        'x--ng2': '123',
      });
    }).toThrow(/x--ng, x--ng2/);
  });
});
