import React from 'react';

export interface NonZeroSizeResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  width: number;
  height: number;
  ready: boolean;
}

export function useNonZeroSize<T extends HTMLElement>(): NonZeroSizeResult<T> {
  const ref = React.useRef<T | null>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const check = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    raf = window.requestAnimationFrame(check);

    if (typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(raf);
    }

    const ro = new ResizeObserver(() => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(check);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const ready = dimensions.width > 0 && dimensions.height > 0;
  return { ref, width: dimensions.width, height: dimensions.height, ready };
}

