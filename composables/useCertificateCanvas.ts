import type { ICertificateContentForm, ICertificateSafeZone } from '#achievement/config/types';
import { generateCertificateTemplate } from '#achievement/utils/certificateTemplateGenerator';
import html2canvas from 'html2canvas';

export interface ICertificateCanvasOptions {
  canvasRef: Ref<HTMLElement | null>;
  backgroundUrl: Ref<string | null>;
  contents: Ref<ICertificateContentForm[]>;
  safeZone: Ref<ICertificateSafeZone>;
}

export interface ICertificatePayloadData {
  template: string;
  imagePreview: string;
  contentsWithMetadata: ICertificateContentPayload[];
}

export interface ICertificateContentPayload {
  type: string;
  key: string;
  value: string | null;
  metadata: Record<string, any>;
}

/**
 * Wait for all fonts to be loaded
 */
async function waitForFonts(): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // Additional delay to ensure fonts are fully rendered
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Wait for images to load in the element
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });
  await Promise.all(imagePromises);
}

/**
 * Composable for generating certificate canvas data for payload
 */
export function useCertificateCanvas(options: ICertificateCanvasOptions) {
  const { canvasRef, backgroundUrl, contents, safeZone } = options;

  /**
   * Capture the canvas element as a base64 PNG image
   * Uses html2canvas to render the HTML element
   */
  const captureCanvasAsImage = async (): Promise<string> => {
    if (!canvasRef.value) {
      throw new Error('Canvas reference is not available');
    }

    const element = canvasRef.value;

    // Find the parent with transform (zoomContent wrapper)
    const zoomContent = element.closest('.transform') as HTMLElement | null;
    const originalTransform = zoomContent?.style.transform || '';

    // Temporarily reset zoom transform to capture at 1:1 scale
    if (zoomContent) {
      zoomContent.style.transform = 'scale(1)';
    }

    try {
      // Wait for fonts and images to load
      await waitForFonts();
      await waitForImages(element);

      // Wait for the DOM to update after transform reset
      await nextTick();
      // Additional delay for rendering stabilization
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        width: 842,
        height: 595,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc, clonedElement) => {
          // Hide safe zone overlay in the cloned document
          const safeZoneEl = clonedElement.querySelector('[data-safe-zone]');
          if (safeZoneEl) {
            (safeZoneEl as HTMLElement).style.display = 'none';
          }

          // Hide moveable controls
          const moveableControls = clonedDoc.querySelectorAll('.moveable-control-box');
          moveableControls.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });

          // Hide selected content border and hover states
          const selectedContent = clonedElement.querySelectorAll('.selected-content');
          selectedContent.forEach((el) => {
            (el as HTMLElement).classList.remove('selected-content');
            (el as HTMLElement).style.border = 'none';
          });

          // Remove hover border class effects
          const hoverElements = clonedElement.querySelectorAll('.hover\\:border');
          hoverElements.forEach((el) => {
            (el as HTMLElement).style.border = 'none';
          });

          // Ensure the cloned element has correct dimensions
          clonedElement.style.width = '842px';
          clonedElement.style.height = '595px';
          clonedElement.style.overflow = 'hidden';
          clonedElement.style.position = 'relative';

          // Ensure all text elements have consistent styling
          const textElements = clonedElement.querySelectorAll('div[style*="font-family"]');
          textElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Ensure margin and padding are reset
            htmlEl.style.margin = '0';
            htmlEl.style.padding = '0';
          });
        },
      });

      return canvas.toDataURL('image/png');
    }
    finally {
      // Restore original zoom transform
      if (zoomContent) {
        zoomContent.style.transform = originalTransform;
      }
    }
  };

  /**
   * Generate the HTML template for the certificate
   */
  const generateTemplate = (): string => {
    if (!backgroundUrl.value) {
      throw new Error('Background URL is required');
    }

    return generateCertificateTemplate({
      backgroundUrl: backgroundUrl.value,
      contents: contents.value,
      safeZone: safeZone.value,
    });
  };

  /**
   * Prepare contents with full metadata for the payload
   */
  const prepareContentsPayload = (): ICertificateContentPayload[] => {
    return contents.value.map((content) => {
      // Create a clean metadata object without File references
      const metadata: Record<string, any> = { ...content.metadata };

      // Remove any file references from metadata
      delete metadata.file;

      return {
        type: content.type,
        key: content.key,
        value: content.value,
        metadata,
      };
    });
  };

  /**
   * Generate all certificate payload data
   */
  const generatePayloadData = async (): Promise<ICertificatePayloadData> => {
    const template = generateTemplate();
    const imagePreview = await captureCanvasAsImage();
    const contentsWithMetadata = prepareContentsPayload();

    return {
      template,
      imagePreview,
      contentsWithMetadata,
    };
  };

  return {
    captureCanvasAsImage,
    generateTemplate,
    prepareContentsPayload,
    generatePayloadData,
  };
}
