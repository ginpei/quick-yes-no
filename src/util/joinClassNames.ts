/**
 * Join class names.
 * @example
 * <div
 *   className={jc(['ui-container', styles.container, condition && 'ok'])}
 * />
 */
export function joinClassNames(names: any[]): string {
  return names.filter((v) => v).join(' ');
}

/**
 * Shorthand for `joinClassNames()`
 */
export const jcn = joinClassNames;
