import { useState, useEffect, type RefObject } from 'react';

const DEFAULT_INTERSECTION_OPTIONS: IntersectionObserverInit = { rootMargin: '200px' };

export function useViewportObserver(
  ref: RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = DEFAULT_INTERSECTION_OPTIONS
): boolean {
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    if (isTriggered) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setIsTriggered(true);
          observer.disconnect();
        }
      },
      options
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, isTriggered, options]);

  return isTriggered;
}
