import { useCallback, useState } from 'react';

interface ExportOptions {
  filename?: string;
  scale?: number;
}

export function useSnapdom() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPng = useCallback(async (element: HTMLElement, options: ExportOptions = {}) => {
    const { filename = 'duodash-card', scale = 2 } = options;
    let exportRoot: HTMLDivElement | null = null;
    setIsExporting(true);

    try {
      const { snapdom, preCache } = await import('@zumer/snapdom');
      exportRoot = createExportRoot(element);

      await preCache(exportRoot, {
        embedFonts: true,
      });

      const result = await snapdom(exportRoot, {
        scale,
        backgroundColor: '#f8fafc',
        embedFonts: true,
        outerTransforms: true,
        outerShadows: false,
      });

      const blob = await result.toBlob({ type: 'png' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      exportRoot?.remove();
      setIsExporting(false);
    }
  }, []);

  return { isExporting, exportToPng };
}

function createExportRoot(element: HTMLElement): HTMLDivElement {
  const exportRoot = document.createElement('div');
  const clone = element.cloneNode(true);

  exportRoot.style.position = 'fixed';
  exportRoot.style.left = '-10000px';
  exportRoot.style.top = '0';
  exportRoot.style.padding = '0';
  exportRoot.style.background = 'transparent';
  exportRoot.style.borderRadius = '0';
  exportRoot.style.overflow = 'visible';
  exportRoot.style.width = `${element.offsetWidth}px`;
  exportRoot.style.height = `${element.offsetHeight}px`;
  if (clone instanceof HTMLElement) {
    clone.style.margin = '0';
    clone.style.width = '100%';
    clone.style.height = '100%';
    clone.style.maxWidth = 'none';
    clone.style.borderRadius = '0';
    clone.style.boxShadow = 'none';
  }
  exportRoot.appendChild(clone);
  document.body.appendChild(exportRoot);

  if (clone instanceof HTMLElement) {
    stripExportDecoration(clone);
  }

  return exportRoot;
}

function stripExportDecoration(root: HTMLElement): void {
  const panelCards = root.querySelectorAll<HTMLElement>('.panel-card');
  for (const node of panelCards) {
    node.style.borderRadius = '0';
    node.style.boxShadow = 'none';
    node.style.border = 'none';
  }

  const innerCards = root.querySelectorAll<HTMLElement>('[data-export-card="inner"]');
  for (const node of innerCards) {
    node.style.borderRadius = '18px';
    node.style.boxShadow = 'none';
    node.style.border = '1px solid rgba(148, 163, 184, 0.18)';
  }
}
