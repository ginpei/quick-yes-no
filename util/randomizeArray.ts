export function randomizeArray<T>(original: T[]): T[] {
  const weight = new Map<T, number>(
    original.map((value) => [value, Math.random()])
  );
  const randomized = original.sort(
    (v1, v2) => weight.get(v1)! - weight.get(v2)!
  );
  return randomized;
}
