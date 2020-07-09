import React, { useCallback, useEffect, useState } from 'react';
import { measureDistance, Pos } from '../models/Length';
import styles from './DragItem.module.scss';

export type DragData = { from: Pos; to: Pos };
export type MoveData = { dragging: boolean; pos: Pos };
export type IsDraggable = (
  event: React.MouseEvent<HTMLElement>,
  pos: Pos
) => boolean;
export type DragCallback = (data: DragData) => void;
export type MoveCallback = (data: MoveData) => void;

const thresholdDragStartDistance = 10;

const DragItem: React.FC<{
  onClick?: (pos: Pos) => void;
  /**
   * @returns If false, following drag events do not occur.
   */
  isDraggable: boolean | IsDraggable;
  onBoundingRectChange?: (rect: DOMRect | null) => void;
  onDragEnd?: DragCallback;
  onDragMove?: DragCallback;
  onDragStart?: DragCallback;
  onMove?: MoveCallback;
  scale?: number;
}> = (props) => {
  const {
    children,
    isDraggable,
    onBoundingRectChange,
    onClick,
    onDragEnd,
    onDragMove,
    onDragStart,
    onMove,
    scale = 1,
  } = props;

  const [dragging, setDragging] = useState(false);
  const [pointerDownAt, setPointerDownAt] = useState<Pos | null>(null);
  const [ref] = useState(React.createRef<HTMLDivElement>());
  const [boundingRect, setBoundingRect] = useState<DOMRect | null>(null);
  const [pointerInCanvas, setPointerInCanvas] = useState(false);
  const [wasDragging, setWasDragging] = useState(false);

  const updateBoundingRect = useCallback(
    (el: typeof ref.current) => {
      if (!el) {
        throw new Error('Element is not ready');
      }

      const rect = el.getBoundingClientRect() ?? null;
      if (!rect) {
        throw new Error('Failed to get element rect');
      }
      setBoundingRect(rect);

      // note 1.if it has border on top or left, position of content element
      // translates. Throw so that we don't have to take care of it
      // note 2. possibly rect.width (double) is like 58.265625 while clientWidth
      // (int) is 59
      if (
        Math.abs(rect.height / scale - el.clientHeight) > 1 ||
        Math.abs(rect.width / scale - el.clientWidth) > 1
      ) {
        throw new Error(
          'Element size does match its bounding rect. (Probably it has border?)'
        );
      }

      return rect;
    },
    [ref.current, scale]
  );

  const onPointerEnter = useCallback(() => {
    setPointerInCanvas(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setPointerInCanvas(false);
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // if you mouse up outside canvas,
      // touch is not called where dragging off
      setDragging(false);

      const rect = updateBoundingRect(ref.current);
      const pos = getEventPosition(event, rect, scale);

      const draggable =
        typeof isDraggable === 'boolean'
          ? isDraggable
          : isDraggable(event, pos);
      if (!draggable) {
        setWasDragging(true);
        return;
      }

      setWasDragging(false);
      setPointerDownAt(pos);
    },
    [ref.current, scale, isDraggable]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (onMove || onBoundingRectChange) {
        const rect = updateBoundingRect(ref.current);
        if (onMove) {
          onMove({ dragging, pos: getEventPosition(event, rect, scale) });
        }
      }
    },
    [onMove, onBoundingRectChange, ref.current, scale]
  );

  const onDocumentPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!boundingRect || !event.isPrimary || !pointerDownAt) {
        if (dragging) {
          // if you pointer up outside the area,
          // touch is not called where dragging off
          setDragging(false);
        }

        return;
      }

      const pos = getEventPosition(event, boundingRect, scale);

      // pointer is down but drag not stated yet
      // (Status: Waiting -> [PointerDown] -> Dragging -> Done)
      if (!dragging) {
        const distance = measureDistance(pointerDownAt, pos);
        if (distance > thresholdDragStartDistance) {
          setDragging(true);
          setWasDragging(true);

          if (onDragStart) {
            onDragStart({ from: pointerDownAt, to: pos });
          }
        }

        return;
      }

      // then yes user is dragging
      if (onDragMove) {
        onDragMove({ from: pointerDownAt, to: pos });
      }
    },
    [
      boundingRect,
      scale,
      pointerInCanvas,
      pointerDownAt,
      dragging,
      onDragStart,
      onDragMove,
      onMove,
    ]
  );

  const onDocumentPointerUp = useCallback(
    (event: PointerEvent) => {
      if (!boundingRect || !pointerDownAt || !event.isPrimary) {
        return;
      }

      const pos = getEventPosition(event, boundingRect, scale);
      if (dragging && onDragEnd) {
        onDragEnd({ from: pointerDownAt, to: pos });
      }

      setDragging(false);
      setPointerDownAt(null);
    },
    [boundingRect, scale, pointerDownAt, dragging, onDragEnd]
  );

  const onViewClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!boundingRect) {
        return;
      }

      if (!wasDragging && onClick) {
        const pos = getEventPosition(event, boundingRect, scale);
        onClick(pos);
      }

      setWasDragging(false);
    },
    [boundingRect, scale, dragging, onClick]
  );

  useEffect(() => {
    updateBoundingRect(ref.current);
  }, [ref.current]);

  useEffect(() => {
    const el = window.document.documentElement;
    el.addEventListener('pointermove', onDocumentPointerMove);
    return () => el.removeEventListener('pointermove', onDocumentPointerMove);
  }, [onDocumentPointerMove]);

  useEffect(() => {
    const el = window.document.documentElement;
    el.addEventListener('pointerup', onDocumentPointerUp);
    el.addEventListener('pointercancel', onDocumentPointerUp);
    return () => {
      el.removeEventListener('pointerup', onDocumentPointerUp);
      el.removeEventListener('pointercancel', onDocumentPointerUp);
    };
  }, [onDocumentPointerUp]);

  useEffect(() => {
    if (onBoundingRectChange) {
      onBoundingRectChange(boundingRect);
    }
  }, [onBoundingRectChange, boundingRect]);

  return (
    <div
      children={children}
      className={styles.root}
      onClick={onViewClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      ref={ref}
    />
  );
};

function getEventPosition<T extends HTMLElement>(
  event: MouseEvent | React.MouseEvent<T>,
  rect: DOMRect,
  scale: number,
  d = document
): Pos {
  const { currentTarget: el } = event;
  if (!(el instanceof HTMLElement)) {
    throw new Error('Wrong event');
  }

  const elDocument = d.documentElement;

  const x = (event.pageX - elDocument.scrollLeft - rect.left) / scale;
  const y = (event.pageY - elDocument.scrollTop - rect.top) / scale;
  const pos = { x, y };
  return pos;
}

export default DragItem;
