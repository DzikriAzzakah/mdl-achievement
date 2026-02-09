import type { SafeZone } from '#achievement/config/types';
import type { Options } from 'qr-code-styling';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '#achievement/config/constants';
import { generateInlineStyleFromConfig, getTextContentStyleConfig } from '#achievement/helpers/contentStyle';

export function useCertificateContentRendering(safeZone: Ref<SafeZone>) {
  function getMargins() {
    return {
      left: safeZone.value?.left || 0,
      top: safeZone.value?.top || 0,
    };
  }

  function getContentImageSrc(content: any): string {
    if (content.type === 'image' || content.type === 'sertificate_signee') {
      if (content.file) {
        return URL.createObjectURL(content.file);
      }
      return content.value || '';
    }
    return '';
  }

  function getContentImageStyle(content: any): string {
    if ((content.type !== 'image' && content.type !== 'sertificate_signee') || (!content.value && !content.file)) {
      return 'display: none;';
    }

    const { width, height, vertical, horizontal } = content.metadata;
    const { left, top } = getMargins();

    const renderX = (horizontal || 0) + left;
    const renderY = (vertical || 0) + top;

    return `
      width: ${width}px;
      height: ${height}px;
      position: absolute;
      left: ${renderX}px;
      top: ${renderY}px;
      z-index: 10;
    `;
  }

  function getContentDisplayValue(content: any): string {
    if (content.type === 'certificate_number') {
      return '{{certificate_number}}';
    }
    if (content.type === 'participant_name') {
      return '{{participant_name}}';
    }
    if (content.type === 'module_type') {
      return '{{module_type}}';
    }
    if (content.type === 'nik') {
      return '{{nik}}';
    }
    if (content.type === 'title') {
      return '{{title}}';
    }
    if (content.type === 'city') {
      return content.element_value || '';
    }
    if (content.type === 'date') {
      return '{{date}}';
    }
    if (content.type === 'valid_thru') {
      return '{{expired_date}}';
    }
    return content.element_value || '';
  }

  function getContentTextStyle(content: any): string {
    const isDynamicContent = ['certificate_number', 'participant_name', 'module_type', 'nik', 'title', 'date', 'valid_thru'].includes(content.type);

    if (!isDynamicContent && !content.element_value) {
      return 'display: none;';
    }

    const styleConfig = getTextContentStyleConfig(content, safeZone.value || { top: 0, right: 0, bottom: 0, left: 0 });
    return generateInlineStyleFromConfig(styleConfig);
  }

  function getQRCodeContainerStyle(content: any): string {
    const { width, height, vertical, horizontal, background_color, background_transparent, border_color, border_style } = content.metadata;
    const { left, top } = getMargins();

    const renderX = (horizontal || 0) + left;
    const renderY = (vertical || 0) + top;

    const padding = 0;
    const bgColor = background_transparent ? 'transparent' : `#${background_color}`;
    const borderRadius = border_style === 'rounded' ? '10px' : '0';

    return `
      position: absolute;
      left: ${renderX}px;
      top: ${renderY}px;
      width: ${width}px;
      height: ${height}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${bgColor};
      border: 2px solid #${border_color};
      border-radius: ${borderRadius};
      padding: ${padding}px;
      box-sizing: border-box;
      z-index: 10;
    `;
  }

  function getQRCodeConfig(content: any): Partial<Options> {
    const { width, height, shape, border_style, shape_color } = content.metadata;

    const qrSize = Math.min(width, height);
    const padding = Math.max(6, Math.floor(qrSize / 10));
    const actualQRSize = qrSize - (padding * 2);

    return {
      width: actualQRSize,
      height: actualQRSize,
      type: 'svg',
      margin: 0,
      data: content.value || 'https://example.com',
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'Q',
      },
      dotsOptions: {
        type: shape === 'dots' ? 'dots' : 'rounded',
        color: `#${shape_color}`,
      },
      backgroundOptions: {
        color: 'transparent',
      },
      cornersSquareOptions: {
        type: border_style === 'rounded' ? 'extra-rounded' : 'square',
        color: `#${shape_color}`,
      },
      cornersDotOptions: {
        type: border_style === 'rounded' ? 'dot' : 'square',
        color: `#${shape_color}`,
      },
    };
  }

  const canvasStyle = computed(() => ({
    width: `${CANVAS_WIDTH}px`,
    height: `${CANVAS_HEIGHT}px`,
  }));

  const safeZoneStyle = computed(() => {
    const top = safeZone.value?.top || 0;
    const right = safeZone.value?.right || 0;
    const bottom = safeZone.value?.bottom || 0;
    const left = safeZone.value?.left || 0;

    return `
      top: ${top}px;
      right: ${right}px;
      bottom: ${bottom}px;
      left: ${left}px;
      width: ${CANVAS_WIDTH - left - right}px;
      height: ${CANVAS_HEIGHT - top - bottom}px;
    `;
  });

  return {
    canvasStyle,
    safeZoneStyle,
    getContentImageSrc,
    getContentImageStyle,
    getContentDisplayValue,
    getContentTextStyle,
    getQRCodeContainerStyle,
    getQRCodeConfig,
  };
}
