import type {
  ICertificateContentCertificateNumberForm,
  ICertificateContentCertificateSigneeForm,
  ICertificateContentEmployeeIdForm,
  ICertificateContentEventTitleForm,
  ICertificateContentForm,
  ICertificateContentFullNameForm,
  ICertificateContentImageForm,
  ICertificateContentLocationForm,
  ICertificateContentQRCodeForm,
  ICertificateContentTextForm,
  ICertificateContentValidThruForm,
  ICertificateSafeZone,
} from '#achievement/config/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, FONT_OPTIONS } from '#achievement/config/constants';

export interface ICertificateTemplateOptions {
  backgroundUrl: string;
  contents: ICertificateContentForm[];
  safeZone: ICertificateSafeZone;
  /** When true, uses actual image URLs instead of template placeholders (for preview generation) */
  useActualUrls?: boolean;
  /** Map of content keys to their uploaded image data (URL and original filename) */
  contentImageUrls?: Record<string, { url: string; originalFileName?: string; }>;
}

type TextContentType =
  | ICertificateContentTextForm
  | ICertificateContentCertificateNumberForm
  | ICertificateContentLocationForm
  | ICertificateContentFullNameForm
  | ICertificateContentEmployeeIdForm
  | ICertificateContentEventTitleForm
  | ICertificateContentValidThruForm;

/**
 * Get the Google Fonts link tags for all fonts used in the certificate
 */
function getUsedFontLinks(contents: ICertificateContentForm[]): string {
  const usedFonts = new Set<string>();

  contents.forEach((content) => {
    if (isTextBasedContent(content)) {
      const fontFamily = content.metadata.font_family;
      const fontOption = FONT_OPTIONS.find(f => f.value === fontFamily);
      if (fontOption?.url) {
        usedFonts.add(fontOption.url);
      }
    }
  });

  if (usedFonts.size === 0) {
    return '';
  }

  // Generate link tags for each font
  const linkTags = Array.from(usedFonts)
    .map(url => `<link href="${url}" rel="stylesheet">`)
    .join('\n');

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${linkTags}`;
}

/**
 * Check if content is text-based
 */
function isTextBasedContent(content: ICertificateContentForm): content is TextContentType {
  return ['text', 'certificate_number', 'location', 'fullname', 'employee_id', 'event_title', 'valid_thru'].includes(content.type);
}

/**
 * Check if content is image-based
 */
function isImageBasedContent(
  content: ICertificateContentForm,
): content is ICertificateContentImageForm | ICertificateContentCertificateSigneeForm {
  return ['image', 'sertificate_signee'].includes(content.type);
}

/**
 * Check if content is QR code
 */
function isQRCodeContent(content: ICertificateContentForm): content is ICertificateContentQRCodeForm {
  return content.type === 'qr_code';
}

/**
 * Generate CSS class name from content key
 */
function generateClassName(key: string): string {
  return `content-${key.replace(/[^a-z0-9]/gi, '-')}`;
}

/**
 * Get the template variable placeholder for a content type
 * For images (except QR codes), we use the actual uploaded URL
 * For QR codes and dynamic text fields, we use placeholders
 */
function getTemplatePlaceholder(
  content: ICertificateContentForm,
  contentImageUrls?: Record<string, { url: string; originalFileName?: string }>,
): string {
  switch (content.type) {
    case 'text':
      return content.value || '';
    case 'certificate_number':
      return '{{certificate_number}}';
    case 'fullname':
      return '{{participant_name}}';
    case 'employee_id':
      return '{{nik}}';
    case 'event_title':
      return '{{title}}';
    case 'location':
      return '{{city}}, {{date}}';
    case 'valid_thru':
      return '{{expired_date}}';
    case 'image':
      // Use actual uploaded URL for custom images
      if (contentImageUrls?.[content.key]?.url) {
        return contentImageUrls[content.key].url;
      }
      // Fallback to content.value if available (for edit mode)
      if (content.value) {
        return content.value;
      }
      return '{{custom_image}}';
    case 'sertificate_signee':
      // Use actual uploaded URL for signature images
      if (contentImageUrls?.[content.key]?.url) {
        return contentImageUrls[content.key].url;
      }
      // Fallback to content.value if available (for edit mode)
      if (content.value) {
        return content.value;
      }
      return '{{sign}}';
    case 'qr_code':
      // QR codes always use placeholder - generated dynamically by backend
      return '{{qr_code_url}}';
    default:
      return '';
  }
}

/**
 * Get alt text for image content
 */
function getImageAltText(
  content: ICertificateContentImageForm | ICertificateContentCertificateSigneeForm,
  contentImageUrls?: Record<string, { url: string; originalFileName?: string }>,
): string {
  // Use original filename from uploaded metadata if available
  if (contentImageUrls?.[content.key]?.originalFileName) {
    return contentImageUrls[content.key].originalFileName!;
  }

  // Fallback to descriptive alt text
  return content.type === 'sertificate_signee' ? 'Signature' : 'Custom Image';
}

/**
 * Generate CSS styles for text-based content
 */
function generateTextContentCSS(content: TextContentType, safeZone: ICertificateSafeZone): string {
  const className = generateClassName(content.key);
  const { width, height, font_family, font_size, font_weight, alignment, color, vertical, horizontal } = content.metadata;

  const positionX = (horizontal || 0) + (safeZone.left || 0);
  const positionY = (vertical || 0) + (safeZone.top || 0);

  const fontFamilyValue = font_family || '\'Montserrat\', sans-serif';

  return `
    .${className} {
        position: absolute;
        left: ${positionX}px;
        top: ${positionY}px;
        width: ${width}px;
        height: ${height}px;
        font-family: ${fontFamilyValue};
        font-size: ${font_size}px;
        font-weight: ${font_weight};
        text-align: ${alignment?.value || 'left'};
        color: #${color || '000000'};
        white-space: pre-wrap;
        overflow: visible;
        box-sizing: border-box;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        display: block;
    }`;
}

/**
 * Generate CSS styles for image-based content
 */
function generateImageContentCSS(
  content: ICertificateContentImageForm | ICertificateContentCertificateSigneeForm,
  safeZone: ICertificateSafeZone,
): string {
  const className = generateClassName(content.key);
  const { width, height, vertical, horizontal } = content.metadata;

  const positionX = (horizontal || 0) + (safeZone.left || 0);
  const positionY = (vertical || 0) + (safeZone.top || 0);

  return `
    .${className} {
        position: absolute;
        left: ${positionX}px;
        top: ${positionY}px;
        width: ${width}px;
        height: ${height}px;
    }

    .${className} img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }`;
}

/**
 * Generate CSS styles for QR code content
 */
function generateQRCodeContentCSS(content: ICertificateContentQRCodeForm, safeZone: ICertificateSafeZone): string {
  const className = generateClassName(content.key);
  const { width, height, vertical, horizontal, background_color, background_transparent, border_style, border_color } = content.metadata;

  const positionX = (horizontal || 0) + (safeZone.left || 0);
  const positionY = (vertical || 0) + (safeZone.top || 0);

  // Padding: 1/10 of size with minimum 6px
  const padding = Math.max(6, Math.floor(Math.min(width, height) / 10));
  const bgColor = background_transparent ? 'transparent' : `#${background_color}`;
  const borderRadius = border_style === 'rounded' ? '10px' : '0';

  return `
    .${className} {
        position: absolute;
        left: ${positionX}px;
        top: ${positionY}px;
        width: ${width}px;
        height: ${height}px;
        background-color: ${bgColor};
        border-radius: ${borderRadius};
        border: 2px solid #${border_color};
        padding: ${padding}px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }

    .${className} img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }`;
}

/**
 * Generate HTML element for text-based content
 */
function generateTextContentHTML(content: TextContentType): string {
  const className = generateClassName(content.key);
  const placeholder = getTemplatePlaceholder(content);

  return `        <div class="${className}">${placeholder}</div>`;
}

/**
 * Generate HTML element for image-based content
 */
function generateImageContentHTML(
  content: ICertificateContentImageForm | ICertificateContentCertificateSigneeForm,
  useActualUrls?: boolean,
  contentImageUrls?: Record<string, { url: string; originalFileName?: string; }>,
): string {
  const className = generateClassName(content.key);
  const placeholder = getTemplatePlaceholder(content, contentImageUrls);
  const altText = getImageAltText(content, contentImageUrls);

  return `        <div class="${className}">
            <img src="${placeholder}" alt="${altText}">
        </div>`;
}

/**
 * Generate HTML element for QR code content
 */
function generateQRCodeContentHTML(content: ICertificateContentQRCodeForm): string {
  const className = generateClassName(content.key);

  return `        <div class="${className}">
            <img src="{{qr_code_url}}" alt="QR Code">
        </div>`;
}

/**
 * Generate the complete HTML template for a certificate
 */
export function generateCertificateTemplate(options: ICertificateTemplateOptions): string {
  const { backgroundUrl, contents, safeZone, useActualUrls, contentImageUrls } = options;

  // Generate font link tags
  const fontLinks = getUsedFontLinks(contents);

  // Generate CSS for each content
  const contentCSS = contents.map((content) => {
    if (isTextBasedContent(content)) {
      return generateTextContentCSS(content, safeZone);
    }
    if (isImageBasedContent(content)) {
      return generateImageContentCSS(content, safeZone);
    }
    if (isQRCodeContent(content)) {
      return generateQRCodeContentCSS(content, safeZone);
    }
    return '';
  }).join('\n');

  // Generate HTML for each content
  const contentHTML = contents.map((content) => {
    if (isTextBasedContent(content)) {
      return generateTextContentHTML(content);
    }
    if (isImageBasedContent(content)) {
      return generateImageContentHTML(content, useActualUrls, contentImageUrls);
    }
    if (isQRCodeContent(content)) {
      return generateQRCodeContentHTML(content);
    }
    return '';
  }).join('\n\n');

  // Build the complete template
  const template = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${fontLinks}
<style>
    * {
        box-sizing: border-box; 
    }

    html, body {
        margin: 0;
        padding: 0;
        width: ${CANVAS_WIDTH}px;
        height: ${CANVAS_HEIGHT}px;
        -webkit-font-smoothing: antialiased;
    }

    .certificate-container {
        position: relative;
        width: ${CANVAS_WIDTH}px;
        height: ${CANVAS_HEIGHT}px;
        background-image: url('${backgroundUrl}');
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
    }
${contentCSS}
</style>
</head>

<body>
    <div class="certificate-container">
${contentHTML}
    </div>
</body>
</html>`;

  return template;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}
