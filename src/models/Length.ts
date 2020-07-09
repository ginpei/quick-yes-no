/**
 * Length with unit, like px and %.
 */
export type UnitLength = PercentLength | PxLength;

export type PercentLength = {
  value: number;
  unit: '%';
};

export type PxLength = {
  value: number;
  unit: 'px';
};

export function createLength(
  value: number,
  unit: UnitLength['unit']
): UnitLength {
  return { value, unit };
}

/**
 * Calculate relative length.
 * e.g. 60% of 200px result 120 (px)
 * @param length Target length
 * @param container Comparator length
 */
export function calcLength(
  length: UnitLength,
  container: number | PxLength | null
): number {
  if (length.unit === 'px') {
    return length.value;
  }

  if (container === null) {
    throw new Error('Length must be in px if no container');
  }

  return (toLengthValue(container) * length.value) / 100;
}

export function addAndCalcLength(
  length: UnitLength,
  diff: number | PxLength,
  container: number | PxLength
): number {
  const top: UnitLength = {
    unit: length.unit,
    value: length.value + toLengthValue(diff),
  };
  const result = calcLength(top, toLengthValue(container));
  return result;
}

export function toLengthValue(length: UnitLength | number) {
  if (typeof length === 'number') {
    return length;
  }

  if (length.unit === 'px') {
    return length.value;
  }

  throw new Error('Length to be number must be in px');
}

export type UnitSize<T extends UnitLength = UnitLength> = {
  height: T;
  width: T;
};

/**
 * Ordinal size data.
 * Values should be considered in px.
 */
export type Size = {
  height: number;
  width: number;
};

export type PxSize = UnitSize<PxLength>;

export function calcSize(size: UnitSize, container: Size): Size {
  return {
    height: calcLength(size.height, container.height),
    width: calcLength(size.width, container.width),
  };
}

export type Pos = { x: number; y: number };

export type UnitPos<T extends UnitLength = UnitLength> = {
  horizontal: T;
  vertical: T;
};

export type PxPos = UnitPos<PxLength>;

export function posToString(pos: Pos) {
  return `${pos.x}, ${pos.y}`;
}

export function calcPos(position: UnitPos, container: Size | PxSize): Pos {
  return {
    x: calcLength(position.horizontal, container.width),
    y: calcLength(position.vertical, container.height),
  };
}

export function subtractPos(pos1: Pos, pos2: Pos): Pos {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y,
  };
}

export function measureDistance(pos1: Pos, pos2: Pos) {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  const distance = Math.sqrt(dx ** 2 + dy ** 2);
  return distance;
}

export type Rect = {
  position: Pos;
  size: Size;
};
