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
 * Composable for generating certificate canvas data for payload
 */
export function useCertificateCanvas(options: ICertificateCanvasOptions) {
  const { backgroundUrl, contents, safeZone } = options;

  /**
   * Replace template placeholders with preview values for image capture
   */
  const replaceTemplatePreviewValues = (template: string): string => {
    let result = template;

    // Replace dynamic placeholders with preview text
    result = result.replace(/\{\{certificate_number\}\}/g, '{{certificate_number}}');
    result = result.replace(/\{\{participant_name\}\}/g, '{{participant_name}}');
    result = result.replace(/\{\{nik\}\}/g, '{{nik}}');
    result = result.replace(/\{\{title\}\}/g, '{{title}}');
    result = result.replace(/\{\{city\}\}/g, '{{city}}');
    result = result.replace(/\{\{date\}\}/g, '{{date}}');
    result = result.replace(/\{\{expired_date\}\}/g, '{{expired_date}}');

    // Replace image placeholders with actual content values
    contents.value.forEach((content) => {
      if (content.type === 'image' && content.value) {
        result = result.replace(/\{\{custom_image\}\}/g, content.value);
      }
      if (content.type === 'sertificate_signee' && content.value) {
        result = result.replace(/\{\{sign\}\}/g, content.value);
      }
      if (content.type === 'qr_code') {
        // Use a placeholder QR code image for preview
        const qrPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjcwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTAiIHk9IjcwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
        result = result.replace(/\{\{qr_code_url\}\}/g, qrPlaceholder);
      }
    });

    return result;
  };

  /**
   * Capture the certificate as a base64 PNG image by rendering the HTML template
   */
  const captureCanvasAsImage = async (): Promise<string> => {
    if (!backgroundUrl.value) {
      throw new Error('Background URL is required');
    }

    // Generate the HTML template
    const template = generateCertificateTemplate({
      backgroundUrl: backgroundUrl.value,
      contents: contents.value,
      safeZone: safeZone.value,
    });

    // Replace placeholders with preview values
    const previewHtml = replaceTemplatePreviewValues(template);

    // Create an iframe to render the template in isolation
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 842px;
      height: 595px;
      border: none;
      z-index: -9999;
      pointer-events: none;
      visibility: hidden;
    `;

    document.body.appendChild(iframe);

    try {
      // Write the HTML content to the iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      iframeDoc.open();
      iframeDoc.write(previewHtml);
      iframeDoc.close();

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Wait for all images to load
      const images = iframeDoc.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          img =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(true);
              }
              else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
              }
            }),
        ),
      );

      // Get the certificate container element
      const certificateContainer = iframeDoc.querySelector('.certificate-container') as HTMLElement;
      if (!certificateContainer) {
        throw new Error('Certificate container not found in template');
      }

      // Capture the certificate container
      const canvas = await html2canvas(certificateContainer, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        width: 842,
        height: 595,
        backgroundColor: '#ffffff',
        logging: false,
      });

      return canvas.toDataURL('image/png');
    }
    finally {
      // Clean up the iframe
      document.body.removeChild(iframe);
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
