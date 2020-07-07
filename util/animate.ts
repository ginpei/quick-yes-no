import { sleep } from './sleep';

export interface GAnimation {
  animation: Animation;
  readonly finished: Promise<void>;
}

/**
 * Do something like `Element.animate()` which is not yet fully supported by
 * most browsers.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
 */
export function animate(
  el: Element,
  keyframes: Keyframe[],
  options?: KeyframeAnimationOptions
): GAnimation {
  const animation = el.animate(keyframes, options);
  const duration = Number(options?.duration ?? 0);
  const ga = createGAnimation(animation, duration);
  return ga;
}

export function createGAnimation(
  animation: Animation,
  duration: number
): GAnimation {
  return {
    animation,
    finished: sleep(duration),
  };
}
