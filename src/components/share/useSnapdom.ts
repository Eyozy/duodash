import { useCallback, useState } from 'react';
import { snapdom, preCache } from '@zumer/snapdom';

interface ExportOptions {
  filename?: string;
  scale?: number;
}

export function useSnapdom() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPng = useCallback(async (element: HTMLElement, options: ExportOptions = {}) => {
    const { filename = 'duodash-card', scale = 2 } = options;
    setIsExporting(true);

    try {
      // 预加载资源，确保字体正确加载
      await preCache(element, {
        embedFonts: true,
      });

      const result = await snapdom(element, {
        scale,
        backgroundColor: 'transparent',
        embedFonts: true,
        outerTransforms: true,
        outerShadows: true,
      });

      await result.download({
        filename,
        type: 'png',
      });

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { isExporting, exportToPng };
}
