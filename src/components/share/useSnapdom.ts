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
        backgroundColor: '#ffffff',
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
  exportRoot.style.left = '-500px';
  exportRoot.style.top = '0';
  exportRoot.style.zIndex = '-9999';
  exportRoot.style.pointerEvents = 'none';
  exportRoot.style.padding = '0';
  exportRoot.style.background = 'transparent';
  exportRoot.style.borderRadius = '0';
  exportRoot.style.overflow = 'hidden';

  // Always set dimensions to the high-resolution desktop card size (344px by 430px)
  exportRoot.style.width = '344px';
  exportRoot.style.height = '430px';

  if (clone instanceof HTMLElement) {
    clone.style.margin = '0';
    clone.style.position = 'absolute';
    clone.style.top = '-1px';
    clone.style.left = '-1px';
    clone.style.width = '346px';
    clone.style.height = '432px';
    clone.style.maxWidth = 'none';
    clone.style.borderRadius = '0';
    clone.style.setProperty('box-shadow', 'none', 'important');
    clone.style.setProperty('border', 'none', 'important');
    clone.style.setProperty('border-width', '0px', 'important');
    clone.style.setProperty('outline', 'none', 'important');
    clone.classList.remove('border', 'border-slate-200');
  }
  if (clone instanceof HTMLElement) {
    stripExportDecoration(clone);
  }
  exportRoot.appendChild(clone);
  document.body.appendChild(exportRoot);

  return exportRoot;
}

function stripExportDecoration(root: HTMLElement): void {
  root.style.borderRadius = '0';
  root.classList.remove('border', 'border-slate-200');

  const panelCards = root.querySelectorAll<HTMLElement>('.panel-card');
  for (const node of panelCards) {
    node.style.borderRadius = '0';
    node.style.boxShadow = 'none';
    node.style.border = 'none';
  }

  const innerCards = root.querySelectorAll<HTMLElement>('[data-export-card="inner"]');
  for (const node of innerCards) {
    node.style.boxShadow = 'none';
    node.style.border = '1px solid rgba(148, 163, 184, 0.18)';
  }
}
