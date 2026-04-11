import { useState, useEffect, useRef, type RefObject } from 'react';

export function useChartDimensions(containerRef: RefObject<HTMLElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const lastDimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const newWidth = Math.round(rect.width);
      const newHeight = Math.round(rect.height);

      if (newWidth > 0 && newHeight > 0) {
        const last = lastDimensionsRef.current;
        if (newWidth !== last.width || newHeight !== last.height) {
          lastDimensionsRef.current = { width: newWidth, height: newHeight };
          setDimensions({ width: newWidth, height: newHeight });
        }
      }
    };

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);
    updateDimensions();

    return () => observer.disconnect();
  }, [containerRef]);

  return dimensions;
}
