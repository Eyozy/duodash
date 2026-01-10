import { useRef, useState, useEffect } from 'react';

export interface NonZeroSizeResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  width: number;
  height: number;
  ready: boolean;
}

export function useNonZeroSize<T extends HTMLElement>(): NonZeroSizeResult<T> {
  const ref = useRef<T | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;

    function check(): void {
      const rect = el!.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }

    rafId = window.requestAnimationFrame(check);

    if (typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(rafId);
    }

    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(check);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return {
    ref,
    width: dimensions.width,
    height: dimensions.height,
    ready: dimensions.width > 0 && dimensions.height > 0
  };
}

