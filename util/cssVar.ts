import { CSSProperties } from 'react';

/**
 * Assert definitions of CSS custom properties (aka CSS var).
 * This casts the given object into `React.CSSProperties` type
 * since such keys are valid CSS rule actually.
 * @example
 * const css: CSSProperties = {
 *   ...cssVar({ '--width': '100px' }),
 *   height: 'var(--width)',
 *   width: 'var(--width)',
 * };
 */
export function cssVar(definitions: Record<string, string>): CSSProperties {
  const nonVarNames = Object.keys(definitions).filter(
    (name) => !name.startsWith('--')
  );
  if (nonVarNames.length > 0) {
    throw new Error(`Found invalid CSS var names: ${nonVarNames.join(', ')}`);
  }
  return definitions as CSSProperties;
}
