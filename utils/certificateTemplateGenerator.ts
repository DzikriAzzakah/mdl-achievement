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
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_FONT_FAMILY, FONT_OPTIONS } from '#achievement/config/constants';
import { generateQRCodeDataUrl } from './qrCodeGenerator';

export interface ICertificateTemplateOptions {
  backgroundUrl: string;
  contents: ICertificateContentForm[];
  safeZone: ICertificateSafeZone;
  useActualUrls?: boolean;
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

  const linkTags = Array.from(usedFonts)
    .map(url => `<link href="${url}" rel="stylesheet">`)
    .join('\n');

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${linkTags}`;
}

function isTextBasedContent(content: ICertificateContentForm): content is TextContentType {
  return ['text', 'certificate_number', 'location', 'fullname', 'employee_id', 'event_title', 'valid_thru'].includes(content.type);
}

function isImageBasedContent(
  content: ICertificateContentForm,
): content is ICertificateContentImageForm | ICertificateContentCertificateSigneeForm {
  return ['image', 'sertificate_signee'].includes(content.type);
}

function isQRCodeContent(content: ICertificateContentForm): content is ICertificateContentQRCodeForm {
  return content.type === 'qr_code';
}

function generateClassName(key: string): string {
  return `content-${key.replace(/[^a-z0-9]/gi, '-')}`;
}

function getTemplatePlaceholder(
  content: ICertificateContentForm,
  contentImageUrls?: Record<string, { url: string; originalFileName?: string; }>,
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

      if (contentImageUrls?.[content.key]?.url) {
        return contentImageUrls[content.key].url;
      }

      if (content.value) {
        return content.value;
      }
      return '{{custom_image}}';
    case 'sertificate_signee':

      if (contentImageUrls?.[content.key]?.url) {
        return contentImageUrls[content.key].url;
      }

      if (content.value) {
        return content.value;
      }
      return '{{sign}}';
    case 'qr_code':

      return '{{qr_code_url}}';
    default:
      return '';
  }
}

function getImageAltText(
  content: ICertificateContentImageForm | ICertificateContentCertificateSigneeForm,
  contentImageUrls?: Record<string, { url: string; originalFileName?: string; }>,
): string {
  if (contentImageUrls?.[content.key]?.originalFileName) {
    return contentImageUrls[content.key].originalFileName!;
  }

  return content.type === 'sertificate_signee' ? 'Signature' : 'Custom Image';
}

function generateTextContentCSS(content: TextContentType, safeZone: ICertificateSafeZone): string {
  const className = generateClassName(content.key);
  const { width, height, font_family, font_size, font_weight, alignment, color, vertical, horizontal, width_mode, height_mode } = content.metadata;

  const positionX = (horizontal || 0) + (safeZone.left || 0);
  const positionY = (vertical || 0) + (safeZone.top || 0);

  const fontFamilyValue = font_family || DEFAULT_FONT_FAMILY;

  const shouldHideOverflow = (width_mode === 'fill' || width_mode === 'fix') && (height_mode === 'fill' || height_mode === 'fix');
  const overflowStyle = shouldHideOverflow ? 'hidden' : 'visible';

  const widthValue = width === 'fit-content' ? 'fit-content' : `${width}px`;
  const heightValue = height === 'fit-content' ? 'fit-content' : `${height}px`;
  const baseMaxWidth
  = CANVAS_WIDTH - (safeZone.left || 0) - (safeZone.right || 0);

  const baseMaxHeight
    = CANVAS_HEIGHT - (safeZone.top || 0) - (safeZone.bottom || 0);

  const maxWidth
  = width_mode === 'fill'
    ? baseMaxWidth
    : width_mode === 'fix'
      ? typeof width === 'number'
        ? width
        : baseMaxWidth
      : baseMaxWidth - (horizontal || 0);

  const maxHeight
    = height_mode === 'fill'
      ? baseMaxHeight
      : height_mode === 'fix'
        ? typeof height === 'number'
          ? height
          : baseMaxHeight
        : baseMaxHeight - (vertical || 0);
  return `
    .${className} {
        position: absolute;
        left: ${positionX}px;
        top: ${positionY}px;
        width: ${widthValue};
        height: ${heightValue};
        max-width: ${maxWidth}px;
        max-height: ${maxHeight}px;
        font-family: ${fontFamilyValue};
        font-size: ${font_size}px;
        font-weight: ${font_weight};
        text-align: ${alignment?.value || 'left'};
        color: #${color || '000000'};
        white-space: pre-wrap;
        overflow: ${overflowStyle};
        box-sizing: border-box;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        display: block;
    }`;
}

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

function generateQRCodeContentCSS(content: ICertificateContentQRCodeForm, safeZone: ICertificateSafeZone): string {
  const className = generateClassName(content.key);
  const { width, height, vertical, horizontal, background_color, background_transparent, border_style, border_color } = content.metadata;

  const positionX = (horizontal || 0) + (safeZone.left || 0);
  const positionY = (vertical || 0) + (safeZone.top || 0);

  const numWidth = typeof width === 'number' ? width : 100;
  const numHeight = typeof height === 'number' ? height : 100;

  const padding = Math.max(6, Math.floor(Math.min(numWidth, numHeight) / 10));
  const bgColor = background_transparent ? 'transparent' : `#${background_color}`;
  const borderRadius = border_style === 'rounded' ? '10px' : '0';

  return `
    .${className} {
        position: absolute;
        left: ${positionX}px;
        top: ${positionY}px;
        width: ${numWidth}px;
        height: ${numHeight}px;
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

function generateTextContentHTML(content: TextContentType): string {
  const className = generateClassName(content.key);
  const placeholder = getTemplatePlaceholder(content);

  return `        <div class="${className}">${placeholder}</div>`;
}

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

function generateQRCodeContentHTML(content: ICertificateContentQRCodeForm, useActualUrls?: boolean): string {
  const className = generateClassName(content.key);

  const qrSrc = useActualUrls
    ? generateQRCodeDataUrl(content, content.value || 'https://example.com')
    : '{{qr_code_url}}';

  return `        <div class="${className}">
            <img src="${qrSrc}" alt="QR Code">
        </div>`;
}

export function generateCertificateTemplate(options: ICertificateTemplateOptions): string {
  const { backgroundUrl, contents, safeZone, useActualUrls, contentImageUrls } = options;

  const fontLinks = getUsedFontLinks(contents);

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

  const contentHTML = contents.map((content) => {
    if (isTextBasedContent(content)) {
      return generateTextContentHTML(content);
    }
    if (isImageBasedContent(content)) {
      return generateImageContentHTML(content, useActualUrls, contentImageUrls);
    }
    if (isQRCodeContent(content)) {
      return generateQRCodeContentHTML(content, useActualUrls);
    }
    return '';
  }).join('\n\n');

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
